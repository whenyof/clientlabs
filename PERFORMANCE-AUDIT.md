# Performance Audit — ClientLabs App

> Generated: 2026-04-23  
> Build: Next.js App Router (Turbopack)  
> TypeScript: 0 errors

---

## 1. Bundle Optimizations Applied

### Dynamic Imports (SSR disabled for heavy chart components)

| File | Component | Strategy |
|------|-----------|----------|
| `app/dashboard/analytics/page.tsx` | `MainChart`, `FunnelChart` | `next/dynamic` + `ssr: false` |
| `app/dashboard/finance/FinanceView.tsx` | `MainChart` | `next/dynamic` + `ssr: false` |

**Impact:** Recharts (~180 kB gzipped) is no longer included in the server-rendered HTML payload for these pages. Charts load client-side after hydration, reducing TTFB and LCP on dashboard pages.

### Package Replacement

| Removed | Replaced With | Size Reduction |
|---------|--------------|----------------|
| `xlsx` (SheetJS) | `exceljs` (dynamic import) | xlsx was ~600 kB; exceljs loaded on-demand only when user triggers import |

Affected files:
- `modules/leads/components/ImportLeadsDialog.tsx`
- `modules/providers/components/ImportProductsDialog.tsx`

### Package Import Optimization

`next.config.ts` — `optimizePackageImports` configured for:
- `framer-motion`
- `lucide-react`

This enables tree-shaking at the module level, only bundling icons and motion components actually used.

---

## 2. Caching Headers

Added in `next.config.ts`:

```
Static assets (svg, jpg, jpeg, png, webp, gif, ico, woff, woff2):
  Cache-Control: public, max-age=31536000, immutable

Next.js static chunks (/_next/static/**):
  Cache-Control: public, max-age=31536000, immutable

Logo (/logo.PNG):
  Cache-Control: public, max-age=31536000, immutable
```

**Impact:** Static assets are cached for 1 year on CDN and browser. Repeat visits serve assets from cache with zero network requests.

---

## 3. Security Headers

Applied globally on all routes:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Strict CSP with `default-src 'self'` |

---

## 4. Build Output

All routes compiled successfully:

- **Static routes (○):** 26 pages pre-rendered at build time (landing, docs, legal, pricing, etc.)
- **Dynamic routes (ƒ):** ~80 server-rendered on demand (dashboard, APIs, finance, leads, etc.)
- **New routes added this cycle:**
  - `ƒ /onboarding` — 4-step onboarding wizard
  - `ƒ /api/onboarding/complete` — wizard completion handler
  - `ƒ /api/notifications` — notification list + unread count
  - `ƒ /api/notifications/[id]` — mark individual notification read
  - `ƒ /api/notifications/mark-all-read` — bulk mark read

---

## 5. Known Non-Critical Warnings

- **`@vercel/turbopack-next/internal/font/google/font`** — Turbopack attempts to resolve Google Font URLs at build time locally. These fail in offline/network-restricted environments but are handled correctly on Vercel (fonts load from CDN). Not a production issue.
- **`Custom Cache-Control headers detected`** — Next.js warns when manual `Cache-Control` headers override its defaults. This is intentional for static asset immutable caching.

---

## 6. Recommended Next Steps

1. **Image optimization:** Audit `<img>` tags and migrate to `next/image` where not already done (especially in blog/changelog).
2. **React Query staleTime:** Increase `staleTime` on rarely-changing queries (e.g., plan limits, sector config) to reduce redundant network requests.
3. **Route groups code-splitting:** Consider `(dashboard)` route group with a shared layout to improve code-splitting boundaries between public and app routes.
4. **Font subsetting:** Self-host Inter/Geist with only Latin character subset to eliminate Google Fonts network dependency entirely.
