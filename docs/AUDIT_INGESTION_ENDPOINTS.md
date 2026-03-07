# ClientLabs Ingestion Endpoints — Security & Reliability Audit

**Date:** 2026-02-11  
**Scope:** `/api/track`, `/api/ingest`, `/api/v1/ingest`  
**Method:** Read-only code review. No code was modified.

---

## PHASE 1 — REQUEST FLOW

### 1. POST /api/track

| Step | Detail |
|------|--------|
| **Authentication** | Public API key in request body (`publicKey`). No Bearer token. |
| **Key validation** | Key is hashed once with SHA-256; lookup by `keyHash` in `prisma.apiKey.findUnique({ where: { keyHash: hash } })`. |
| **Required body fields** | `publicKey` (string), `visitorId` (string), `events` (array). |
| **Payload parsing** | `await request.json()` cast to `TrackPayload`. No schema library. |
| **Validation** | Presence check for `publicKey`, `visitorId`, `events`; `visitorId` must match UUID v4 regex. Event types validated via `isValidEventType()` (allowlist from score rules). |
| **Flow** | Request → content-length cap (256KB) → JSON parse → presence + UUID validation → keyHash lookup → API key checks (type=public, !revoked, expiry) → **Origin required** → hostname from `Origin` only → domain must equal `apiKey.domain` → rate limit (per userId+IP) → lastUsed update → session/identity → anonymous or lead event scoring → DB (AnonymousEvent or LeadEventService). |

**Storage:** Direct Prisma writes: `anonymousEvent.createMany`, `sdkConnection.upsert`, `LeadEventService.registerLeadEvent` (and identify path: `lead.upsert`, `linkSessionsToLead`). No queue; synchronous DB usage.

---

### 2. POST /api/ingest

| Step | Detail |
|------|--------|
| **Authentication** | Bearer token in `Authorization` header. Must start with `Bearer cl_sec_` (secret key). |
| **Key validation** | Token stripped to raw key, hashed with SHA-256; lookup by `keyHash`. Then `crypto.timingSafeEqual` comparison with stored hash. |
| **Required body fields** | None strictly required. Payload is generic `Record<string, unknown>`. If `payload.leads` or `payload.email` present, leads are upserted. |
| **Payload parsing** | `await req.json()` in try/catch; on failure returns 400 "Invalid JSON payload". |
| **Validation** | No validation of event type, visitorId, or timestamp. Lead ingestion validates email format and string types for name/phone. |
| **Flow** | Request → **rate limit (IP)** → auth header check → hash → key lookup → revoked/expiry → timing-safe compare → **scope** (ingest or admin) → lastUsed update → **rate limit (key)** → JSON parse → if leads/email → lead upsert(s) → 200. |

**Storage:** Direct Prisma `lead.upsert`. No event queue. No event storage; this route is lead-only.

---

### 3. POST /api/v1/ingest

| Step | Detail |
|------|--------|
| **Authentication** | Public API key in body (`api_key`). No Bearer token. |
| **Key validation** | Same as track: SHA-256 hash of `api_key`, lookup by `keyHash`. |
| **Required body fields** | `type` (string), `api_key` (string). `domain` is accepted but **not used for authorization**. |
| **Payload parsing** | `await request.json()` cast to `SdkIngestPayload`. No schema validation. |
| **Validation** | Only `!type || !api_key` → 400. No event type allowlist, no visitorId, no timestamp, no payload size check. |
| **Flow** | Request → **no body size check** → JSON parse → type + api_key presence → **Origin required** → hostname from `Origin` only → keyHash lookup → type=public, !revoked, expiry → domain (Origin hostname vs apiKey.domain) → SdkConnection upsert only when `type === "sdk_loaded"` or `"sdk_heartbeat"` → 200. |

**Storage:** Only `prisma.sdkConnection.upsert` for verification events. **No processing of batch `events` array.**  
**Critical finding:** SDK sends body `{ api_key, events: [...] }` (batch). This route expects `{ type, api_key, domain? }` (single event). Requests with an `events` array have `payload.type === undefined`, so they receive **400 Bad Request**. Behavioural events (pageview, button_click, etc.) are **not** stored by this endpoint.

---

## PHASE 2 — SECURITY CHECKS

### API key

| Check | /api/track | /api/ingest | /api/v1/ingest |
|-------|------------|-------------|----------------|
| Lookup by keyHash | ✅ | ✅ | ✅ |
| Revoked check | ✅ | ✅ | ✅ |
| Expiry check | ✅ | ✅ | ✅ |
| Type (public vs secret) | ✅ public only | ✅ secret (Bearer cl_sec_) | ✅ public only |
| Scope validation | N/A | ✅ ingest or admin | N/A |

### Domain security (public keys)

| Check | /api/track | /api/v1/ingest |
|-------|------------|----------------|
| Hostname from Origin only | ✅ | ✅ |
| Body cannot override domain | ✅ (no body.domain in auth) | ✅ (bodyDomain unused for auth) |
| Exact hostname match | ✅ `hostname !== apiKey.domain` → 403 | ✅ same |

---

## PHASE 3 — RATE LIMITING

| Endpoint | Per-IP | Per-key / per-tenant | Implementation |
|----------|--------|----------------------|----------------|
| **/api/track** | ✅ | ✅ | `checkDistributedRateLimit(\`track:${userId}:${clientIp}\`, 100, 60)` — 100 req/60s per user+IP. |
| **/api/ingest** | ✅ | ✅ | IP: `ingest:ip:${clientIp}` 60/60s. Key: `ingest:key:${apiKey.id}` 60/60s. Bruteforce: `ingest:fail:${clientIp}` 10/300s. |
| **/api/v1/ingest** | ❌ | ❌ | **None.** **HIGH RISK** for abuse and DoS. |

---

## PHASE 4 — BODY VALIDATION

| Check | /api/track | /api/ingest | /api/v1/ingest |
|-------|------------|-------------|----------------|
| Event type safe (allowlist) | ✅ `isValidEventType()` | N/A (no events) | ❌ No allowlist; any string accepted. |
| visitorId format | ✅ UUID v4 regex | N/A | ❌ Not required or validated. |
| Properties size limited | ❌ Per-event metadata not size-capped. | N/A | ❌ No limit. |
| Payload max size enforced | ✅ 256KB via Content-Length | ❌ | ❌ |

---

## PHASE 5 — EVENT SIZE PROTECTION

| Endpoint | Body/payload limit | Notes |
|----------|--------------------|--------|
| **/api/track** | 256 KB (Content-Length) | Rejects before `request.json()`. No per-event size. |
| **/api/ingest** | None | No Content-Length or JSON size check. **Risk:** large JSON can be sent. |
| **/api/v1/ingest** | None | No Content-Length or JSON size check. **Risk:** oversized body. |

**Requirement (e.g. 10KB reject):** Not met on /api/ingest or /api/v1/ingest. Only /api/track has a cap (256KB, not 10KB).

---

## PHASE 6 — DATABASE / STORAGE FLOW

| Endpoint | Mechanism | Notes |
|----------|-----------|--------|
| **/api/track** | Direct DB | `anonymousEvent.createMany`, `sdkConnection.upsert`, `LeadEventService.registerLeadEvent`, `lead.upsert`, `linkSessionsToLead`. All synchronous. |
| **/api/ingest** | Direct DB | `lead.upsert` only. Synchronous. |
| **/api/v1/ingest** | Direct DB | `sdkConnection.upsert` only (for sdk_loaded/sdk_heartbeat). Synchronous. Batch `events` from SDK are not persisted. |

**Flag:** Synchronous DB writes on all three; no queue or batch abstraction. Under load, DB can become bottleneck.

---

## PHASE 7 — ERROR HANDLING

| Scenario | /api/track | /api/ingest | /api/v1/ingest |
|----------|------------|-------------|----------------|
| Invalid JSON | ✅ try/catch → 500, corsHeaders set before try | ✅ try/catch → 400 "Invalid JSON payload" | ✅ try/catch → 500 (catch only at top level; JSON throw would hit catch). |
| Missing required fields | ✅ 400 Bad Request | N/A | ✅ 400 if !type or !api_key |
| Invalid / unknown API key | ✅ 401 Unauthorized | ✅ 401 + recordFailure | ✅ 401 |
| Expired key | ✅ 401 | ✅ 401 | ✅ 401 |
| Malformed request | ✅ 400 (UUID, etc.) | 400 on JSON only | 400 on presence only |
| Uncaught exceptions | ✅ Outer try/catch returns 500 and logs | ✅ try/catch returns 500 and logs | ✅ try/catch returns 500; **corsHeaders** may be undefined if error occurs before `let corsHeaders` is used (e.g. in catch). Actually corsHeaders is set at top (line 44), so safe. |

**Note:** /api/track does not wrap the initial `request.json()` in try/catch; if JSON is invalid, the exception propagates to the outer catch and returns 500 (not 400).

---

## PHASE 8 — DDOS / ABUSE PROTECTION

| Control | /api/track | /api/ingest | /api/v1/ingest |
|---------|------------|-------------|----------------|
| Rate limiting | ✅ Per user+IP | ✅ Per IP + per key | ❌ None |
| IP blocking | ❌ | ❌ (rate only) | ❌ |
| Bot filtering | ❌ | ❌ | ❌ |
| Request throttling | Via rate limit | Via rate limit | ❌ |
| Body size limit | ✅ 256KB | ❌ | ❌ |

---

## PHASE 9 — FINAL CLASSIFICATION

### POST /api/track

- **SECURITY LEVEL:** **SAFE**
- **Summary:** Strong auth (keyHash, public only, revoked/expiry), Origin-only domain, rate limiting, body cap, UUID validation, event type allowlist. Synchronous DB and no per-event size limit are design trade-offs.
- **Recommendations:**
  - Consider 400 for invalid JSON instead of 500.
  - Optionally enforce a per-event or total payload size closer to 10KB if desired for ingestion pipeline.
  - Consider queue + worker for event writes to decouple ingestion from DB latency.

---

### POST /api/ingest

- **SECURITY LEVEL:** **WARNING**
- **Summary:** Strong auth (Bearer, secret key, timing-safe compare, scope). Rate limiting (IP + key) and bruteforce logging. No body/payload size limit; no validation of optional payload structure beyond leads/email.
- **Recommendations:**
  - Enforce maximum request body size (e.g. Content-Length or parsed JSON size &lt; 10KB or 64KB) before or after parse.
  - Validate structure/size of `leads` array and nested fields to avoid oversized writes or abuse.

---

### POST /api/v1/ingest

- **SECURITY LEVEL:** **CRITICAL**
- **Summary:** Auth and domain (Origin-only) are correct. **No rate limiting**, no body size limit, no event type validation, no visitorId. **Protocol mismatch:** SDK sends `{ api_key, events: [...] }`; route expects `{ type, api_key }`, so batch requests fail with 400 and behavioural events are never stored.
- **Recommendations:**
  - Add rate limiting (per IP and/or per api_key or keyHash) to prevent DoS and abuse.
  - Enforce max body size (e.g. 10KB or 64KB) and reject oversized requests.
  - Align contract with SDK: accept `{ api_key, events: [...] }`, validate each event (type, optional visitorId, timestamp), and process/store via queue or existing Event pipeline; or document that this route is verification-only and SDK must use another endpoint for behavioural events.
  - Add event type allowlist and optional visitorId/sessionId format validation.
  - Ensure all error paths set CORS headers (currently OK; verify in any new code).

---

## Summary Table

| Endpoint        | Security level | Main risks / gaps |
|----------------|----------------|--------------------|
| **/api/track** | SAFE           | Invalid JSON → 500; sync DB; no per-event size. |
| **/api/ingest**| WARNING        | No body size limit; optional payload validation. |
| **/api/v1/ingest** | CRITICAL   | No rate limit; no body size limit; SDK/backend contract mismatch (batch events not accepted/stored). |
