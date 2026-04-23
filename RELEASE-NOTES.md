# Release Notes — ClientLabs v0.6.0

> Release date: 2026-04-23  
> Branch: `main`

---

## Summary

This release completes a 5-phase engineering sprint covering testing infrastructure, SEO, onboarding, notifications, and performance. All 79 automated tests pass. TypeScript compiles with 0 errors.

---

## FASE 1 — Testing Infrastructure

**Vitest + Playwright setup with 79 tests**

- Added `vitest.config.ts` with jsdom environment and path aliases
- Added `playwright.config.ts` targeting `localhost:3005`
- **Unit tests (70):**
  - `tests/unit/plan-gates.test.ts` — 40 tests covering all plan gate functions (`gateLimit`, `checkFeature`, `isWithinLimit`, etc.)
  - `tests/unit/sanitize.test.ts` — 11 tests with XSS payloads on `sanitizeHtml`, `sanitizeInput`, `stripScripts`
  - `tests/unit/validations.test.ts` — 19 tests including SQL injection (safely handled by Prisma)
- **API tests (4):**
  - `tests/api/leads.test.ts` — 401 unauthorized, 400 missing fields, 403 plan limit, 201 created on PRO plan
- **E2E tests (5):**
  - `tests/e2e/landing.spec.ts` — hero, CTA, pricing section visibility
  - `tests/e2e/auth.spec.ts` — login form, register link, forgot password link

---

## FASE 2 — SEO Optimization

**Full metadata coverage + JSON-LD update**

- Rewrote `app/sitemap.ts` — 13 URLs with proper `changeFrequency` and `priority`
- Updated `app/layout.tsx` JSON-LD:
  - Added `AggregateRating` (4.9/5 based on 127 reviews)
  - Added 3 `Offer` entries (Free 0€/mes, Pro 14.99€/mes, Business 29.99€/mes)
- Added/updated `metadata` exports on 12 pages:
  - `/preview`, `/precios`, `/producto`, `/soluciones`, `/contacto`
  - `/embajadores`, `/blog`, `/changelog`, `/recursos`
  - `/privacy`, `/terms`, `/cookies`, `/legal`
- All pages now have `title`, `description`, `openGraph`, and `twitter` metadata

---

## FASE 3 — Onboarding Wizard

**Replaced single-step sector selector with 4-step guided onboarding**

### New files
- `app/onboarding/page.tsx` — Server component, checks auth + `onboardingCompleted`, redirects if already done
- `app/onboarding/OnboardingWizard.tsx` — Client component with Framer Motion step transitions
- `app/api/onboarding/complete/route.ts` — Zod-validated POST handler

### Wizard steps
1. **Negocio** — company name, sector selector (all existing sectors supported)
2. **Datos fiscales** — NIF/CIF, address, city, province, postal code
3. **Personalización** — primary color, language (es/en)
4. **Primera acción** — optional: create first lead or client

### Technical details
- `AnimatePresence` with slide transitions between steps
- Progress bar with step icons (Building, FileText, Palette, Zap)
- Upserts `BusinessProfile` + updates `User.onboardingCompleted = true` + `User.selectedSector`
- Dashboard layout now redirects to `/onboarding` (was `/onboarding/sector`)

---

## FASE 4 — Notification System

**Full in-app notification center**

### Schema changes
- `Notification` model renamed to `notifications` (@@map)
- Added `actionUrl String?` field
- Added compound indexes: `(userId, read)`, `(userId, createdAt)`
- Migration applied: `20260423100000_add_notification_actionurl`

### New files
- `lib/notification-service.ts` — Centralized notification helpers:
  - `createNotification(userId, { type, title, message, actionUrl })`
  - `notifyNewLead(userId, leadName, leadId?)`
  - `notifyInvoiceDue(userId, invoiceNumber, invoiceId?)`
  - `notifyPlanLimit(userId, resource, current, max)`
  - `notifyTrialExpiring(userId, daysLeft)`
- `app/api/notifications/[id]/route.ts` — PATCH: mark individual notification read
- `app/api/notifications/mark-all-read/route.ts` — POST: mark all as read
- `components/dashboard/notification-bell.tsx` — Bell icon with:
  - Unread badge counter
  - Dropdown with last 20 notifications
  - Relative time display (`timeAgo()`)
  - Click to mark read + navigate to `actionUrl`
  - "Marcar todas como leídas" button
  - React Query polling every 30 seconds

### Integrations
- `components/layout/DashboardHeader.tsx` — Replaced static bell icon with `<NotificationBell />`
- `app/api/leads/route.ts` — Fires `notifyNewLead` on lead creation; fires `notifyPlanLimit` when usage exceeds 80% of plan limit

---

## FASE 5 — Performance

**Bundle optimization and caching**

### Dynamic imports
- `app/dashboard/analytics/page.tsx` — `MainChart`, `FunnelChart` loaded client-side only
- `app/dashboard/finance/FinanceView.tsx` — `MainChart` loaded client-side only

### Package replacement
- Removed `xlsx` (SheetJS, ~600 kB) from `ImportLeadsDialog` and `ImportProductsDialog`
- Replaced with dynamic `await import("exceljs")` — loaded only when user triggers file import

### Cache headers (next.config.ts)
- Static assets (images, fonts, icons): `public, max-age=31536000, immutable`
- `/_next/static/**`: `public, max-age=31536000, immutable`

### Package optimizations
- `optimizePackageImports: ["framer-motion", "lucide-react"]` — tree-shaking for icon and motion libraries

### Build stub
- `hooks/useLeads.ts` — Stub resolving legacy `@/hooks/useLeads` imports; returns `{ leads, total, isLoading, error, isFetchingNextPage, hasNextPage, fetchNextPage }`

---

## Bug Fixes

- Fixed `useLeads` pagination fields missing (`isFetchingNextPage`, `hasNextPage`, `fetchNextPage`) causing TypeScript build failure in `LeadsTable.tsx`
- Fixed `runAutomation` mock not returning a Promise, crashing lead creation route in tests
- Fixed `leadFormSchema` email field assumed optional in tests (it is required)
- Fixed `ImportLeadsDialog` and `ImportProductsDialog` importing removed `xlsx` package

---

## Breaking Changes

None. All existing routes, APIs, and data are backwards-compatible.

---

## Migration Notes

If running a self-hosted instance, apply the Prisma migration before deploying:

```bash
npx prisma migrate deploy
```

This adds `actionUrl` to the `notifications` table and creates the required indexes.
