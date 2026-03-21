# ClientLabs App — System Architecture Map

> **Purpose:** Complete mental model for developers. Where everything is, how data flows, what to touch for each feature.  
> **Scope:** Full project. No code changes — analysis and documentation only.

---

## 1. 🏗 Architecture Overview

### App Type

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth:** NextAuth.js (JWT strategy, Prisma adapter)
- **DB:** PostgreSQL via Prisma 5
- **State:** React state + Zustand (calendar-event-store) + TanStack Query + SWR
- **Styling:** Tailwind 4, CSS variables for theme, Radix UI primitives
- **Deployment:** Node.js runtime (`export const runtime = "nodejs"` on scan page)

### Folder Roles

| Folder | Role |
|--------|------|
| `app/` | Routes (pages, layouts, API). Entry points. Server components where possible. |
| `components/` | Shared UI: design system (`ui/`), layout, scanner, auth shell, AiFloatingAssistant. |
| `modules/` | Feature domains: leads, clients, providers, sales, tasks, finance, analytics, etc. Each module owns components, hooks, actions, services, types. |
| `lib/` | Cross-cutting: auth, prisma, events pipeline, scoring, automations, enrichment, security, calendar-sync, backup, etc. |
| `hooks/` | Root-level shared hooks (e.g. `useSectorConfig`). Feature-specific hooks live in `modules/*/hooks` or `src/hooks`. |
| `config/` | Sector configuration (`sectors/`), feature flags, labels per sector. |
| `context/` | React context (AssistantContext). |
| `providers/` | App-level providers (QueryProvider, SessionProvider, AssistantProvider). |
| `sdk/` | ClientLabs tracking/ingest SDK (browser script). |
| `sdk-web/` | SDK web config, queue, flush manager. |
| `workers/` | Background workers (eventQueueWorker). |
| `prisma/` | Schema, migrations, seed. |

### Separation of Concerns

- **Pages** (`app/dashboard/*/page.tsx`): Server components that fetch data and render feature views.
- **Feature views** (`modules/*/components/*View.tsx`): Client components that orchestrate UI and state.
- **API routes** (`app/api/*/route.ts`): Auth, validation, DB, external services.
- **Modules** own domain logic; pages and API routes delegate to them.

---

## 2. 📁 File Map

### Root & Layout

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/layout.tsx` | Root layout, fonts, theme, ClientLabs loader, ToastProvider, AiFloatingAssistant | Every page load | Geist fonts, providers, globals.css | All pages |
| `app/providers.tsx` | SessionProvider, AssistantProvider | Mount | next-auth, AssistantContext | layout.tsx |
| `providers/QueryProvider.tsx` | TanStack Query provider | Mount | @tanstack/react-query | layout.tsx |
| `components/ThemeProvider.tsx` | Theme (light/dark) | Mount | — | layout.tsx |
| `components/AiFloatingAssistant.tsx` | Floating AI assistant UI | Mount | useAssistant | layout.tsx |
| `context/AssistantContext.tsx` | Suggestions state for assistant | Mount | — | AiFloatingAssistant, features |

### Auth

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `lib/auth.ts` | NextAuth config, Google + Credentials, JWT/session hydration | Sign-in, session checks | prisma, bcrypt | API routes, layout |
| `lib/get-db-user.ts` | Fetch User from DB for session | Dashboard layout, onboarding check | prisma | dashboard/layout |
| `app/auth/page.tsx` | Login/signup page | User visits /auth | auth | redirect from dashboard |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API handler | Auth requests | auth | next-auth client |

### Dashboard Shell

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/layout.tsx` | Auth gate, redirect to onboarding if needed, DashboardShell | All /dashboard/* | getServerSession, getDbUser | All dashboard pages |
| `components/layout/DashboardShell.tsx` | Sidebar + main content, header | Dashboard mount | Sidebar, DashboardHeader | dashboard layout |
| `app/dashboard/components/Sidebar.tsx` | Nav menu, labels from useSectorConfig | Mount | useSession, useSectorConfig | DashboardShell |
| `components/layout/DashboardHeader.tsx` | Top bar | Mount | — | DashboardShell |

### Sector Configuration

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `config/sectors/index.ts` | Sector registry, getSectorConfigByPath | Server components, hooks | default, online, fisio, types | Pages, useSectorConfig |
| `config/sectors/default.ts` | Default sector config | Import | types | index |
| `config/sectors/online.ts`, `fisio.ts` | Sector-specific configs | Import | default, types | index |
| `hooks/useSectorConfig.ts` | Client hook for current sector config (labels, features) | Component render (pathname) | getSectorConfigByPath | 40+ components |

### Scan System

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/scan/[sessionId]/page.tsx` | Scan session page wrapper, params handling | User opens scan URL (mobile or desktop) | ScanSessionPageInner | — |
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | **Main scan orchestrator** (~1431 lines). State, pages, scanner, EdgeEditor, processImage, warpQuadToJpegBlob, PDF build, upload | Mount, capture, edit, submit | LiveScanner, EdgeEditor, pdf-lib, fetch | page.tsx |
| `components/scanner/LiveScanner.tsx` | Camera capture, onCapture(blob) | Scanner open, user clicks capture | — | ScanSessionPageInner |
| `components/scanner/EdgeEditor.tsx` | Manual corner adjustment for perspective | User edits page corners | — | ScanSessionPageInner |
| `app/api/scan-sessions/route.ts` | POST: create scan session (entityType, entityId, category, documentName) | FileUploadDialog → ScanWithMobileDialog opens | auth, prisma | ScanWithMobileDialog |
| `app/api/scan-sessions/[id]/route.ts` | GET: session status (with token) | ScanSessionPageInner load, polling | prisma | ScanSessionPageInner |
| `app/api/scan-sessions/[id]/upload/route.ts` | POST: mark session UPLOADED with fileUrl | Mobile/desktop submit | prisma | ScanSessionPageInner |
| `app/api/scan-sessions/[id]/complete/route.ts` | POST: mark session COMPLETED | Alternative complete flow | prisma | — |
| `app/api/scan-sessions/[id]/confirm/route.ts` | Confirm flow (if used) | — | — | — |

### Provider Document Upload

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `modules/providers/components/FileUploadDialog.tsx` | Upload UI: name, category, files OR scan with mobile | User clicks "Subir documento" in ProviderSidePanel | ScanWithMobileDialog, useSectorConfig | ProviderSidePanel |
| `modules/providers/components/ScanWithMobileDialog.tsx` | QR code, create session, poll status, onCompleted | User chooses "Escanear con móvil" | /api/scan-sessions | FileUploadDialog |
| `app/api/providers/upload/route.ts` | POST: save file to public/uploads/providers, return URL | File upload (desktop or after mobile scan) | auth, fs | FileUploadDialog, ScanSessionPageInner |

### Providers Feature

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/providers/page.tsx` | Server page: fetch providers, KPIs, render ProvidersView | User visits /dashboard/providers | getServerSession, prisma, getSectorConfigByPath | — |
| `modules/providers/components/ProvidersView.tsx` | **Canonical** providers list + table + CreateProviderDialog | Page render | ProvidersTable, CreateProviderDialog, useSectorConfig | app/dashboard/providers/page.tsx |
| `app/dashboard/providers/components/ProvidersView.tsx` | **Simpler variant** (table + side panel only). **NOT used by main page.** | — | ProviderSidePanel from modules | **Unused by main route** |
| `modules/providers/components/ProviderSidePanel.tsx` | Full side panel: summary, orders, tasks, files, timeline, FileUploadDialog | User clicks provider row | FileUploadDialog, tabs, actions | ProvidersTable (via modules or dashboard variant) |
| `modules/providers/components/ProvidersTable.tsx` | Table of providers | ProvidersView | useSectorConfig | ProvidersView |
| `modules/providers/actions/*` | Server actions for providers (orders, payments, files, etc.) | User actions in side panel | prisma | ProviderSidePanel |
| `app/dashboard/providers/[providerId]/page.tsx` | Provider 360 detail page | User visits /dashboard/providers/[id] | Provider360View | — |

### Leads

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/leads/page.tsx` | Leads dashboard | User visits /dashboard/leads | — | — |
| `modules/leads/` | Leads domain: components, hooks, utils | Leads pages | useSectorConfig, useLeads | leads pages |
| `lib/hooks/useLeads.ts` | Leads data hook | Component | — | leads components |
| `app/api/leads/route.ts` | Leads CRUD | API calls | prisma | useLeads, components |
| `app/api/leads/[id]/stage/route.ts` | Update lead stage | Stage change | prisma | — |
| `app/api/leads/[id]/retry-enrichment/route.ts` | Retry enrichment | User action | enrichment | — |

### Clients

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/clients/page.tsx` | Clients list | User visits /dashboard/clients | — | — |
| `modules/clients/` | Clients domain: ClientSidePanel, filters, etc. | Clients pages | useSectorConfig | clients pages |
| `modules/client360/` | Client 360 view, invoices, financial risk | Client detail | clients, invoicing | client detail |

### Sales

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/sales/page.tsx` | Sales dashboard | User visits /dashboard/sales | — | — |
| `modules/sales/` | Sales components, useSales, KPIs, table | Sales page | useSectorConfig | sales page |
| `app/api/sales/route.ts` | Sales CRUD | API calls | prisma | useSales |
| `app/api/sales/forecast/route.ts` | Forecast | — | forecast engine | — |

### Tasks

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/tasks/page.tsx` | Tasks mission control | User visits /dashboard/tasks | TasksMissionControl, getCalendarEvents | — |
| `modules/tasks/` | Task list, calendar, mission control, store | Tasks page | calendar services, useSectorConfig | tasks page |
| `modules/tasks/store/calendar-event-store.ts` | Zustand store for calendar events | Mount | — | MissionCalendar, hooks |
| `modules/calendar/` | Calendar services (events, smart slots, availability) | Tasks, calendar UI | prisma | tasks, API routes |
| `app/api/tasks/route.ts` | Tasks CRUD | API calls | prisma | — |
| `app/api/calendar/events/route.ts` | Calendar events | API calls | calendar-events.service | — |

### Finance & Invoicing

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/finance/page.tsx` | Finance dashboard | User visits /dashboard/finance | — | — |
| `modules/finance/` | Finance engine, metrics, data, reports | Finance pages | prisma | finance pages |
| `modules/invoicing/` | Invoice PDF, legal validation, due engine | Invoice generation | pdf-lib, branding | API, UI |
| `modules/invoicing/pdf/index.ts` | Invoice PDF public API | Invoice PDF generation | generator, template, branding | API routes |
| `app/api/invoicing/route.ts` | Invoicing APIs | API calls | prisma, invoicing | — |
| `app/api/billing/[id]/pdf/route.ts` | Billing PDF | PDF fetch | invoicing | — |

### Events & Ingest Pipeline

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `lib/events.ts` | Event allowlists, validation (track, ingest) | Ingest/track requests | scoreRules | ingest, track routes |
| `lib/events/processEvent.ts` | Process single event | Event received | leadProcessor, sessionProcessor, etc. | processEventBatch |
| `lib/events/processEventBatch.ts` | Batch processing | Worker or API | processEvent, queue | eventQueueWorker |
| `lib/events/leadProcessor.ts` | Lead scoring, enrichment triggers | Lead event | scoring, enrichment | processEvent |
| `app/api/ingest/route.ts` | POST: SDK behavioral events (Bearer cl_sec_*) | SDK sends events | redis, rate limit, prisma | SDK |
| `app/api/track/route.ts` | POST: scoring/track events | SDK/tracking | events | — |
| `app/api/v1/ingest/route.ts` | V1 ingest | SDK | events | — |
| `workers/eventQueueWorker.ts` | Event queue worker (npm run worker:events) | Background | Redis, processEventBatch | — |
| `lib/queue/eventsQueue.ts` | Redis-backed event queue | Ingest, worker | Redis | ingest, worker |

### Integrations, Automations, AI Assistant

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/integrations/page.tsx` | Integrations settings | User visits | — | — |
| `app/dashboard/automations/page.tsx` | Automations list | User visits | — | — |
| `app/dashboard/ai-assistant/page.tsx` | AI assistant | User visits | useSectorConfig | — |
| `lib/automations/` | Automation engine, conditions, actions | Automation trigger | prisma | events, API |
| `lib/enrichment/` | Lead enrichment (internal, external providers) | Lead event | — | leadProcessor |

### Billing & Stripe

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/dashboard/billing/page.tsx` | Billing page | User visits | — | — |
| `app/dashboard/other/billing/page.tsx` | Other billing (legacy/alternate) | User visits /dashboard/other/billing | — | — |
| `app/api/billing/route.ts` | Billing APIs | API calls | stripe | — |
| `app/api/webhooks/stripe/route.ts` | Stripe webhooks | Stripe events | stripe | — |
| `app/dashboard/settings/lib/stripe.ts` | Stripe helpers | Settings | stripe | — |

### Admin

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `app/admin/layout.tsx` | Admin layout | Admin routes | — | Admin pages |
| `app/admin/page.tsx` | Admin dashboard | User visits /admin | — | — |
| `app/admin/users/page.tsx` | User management | User visits | — | — |
| `app/admin/backups/page.tsx` | Backups | User visits | — | — |
| `app/api/admin/*` | Admin APIs | Admin actions | prisma | Admin UI |

### SDK & Tracking

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `public/sdk/clientlabs.js` | ClientLabs loader script | Page load (layout Script) | CDN | layout |
| `sdk/` | SDK detectors, adapters, utils | SDK runtime | — | Loader |
| `sdk-web/` | Web SDK config, queue, flush | SDK runtime | — | Loader |
| `lib/clientlabs-loader.ts` | Loader config | Build/runtime | — | — |

### Prisma & Database

| File | Role | When | Depends On | Depended By |
|------|------|------|------------|-------------|
| `lib/prisma.ts` | Prisma client singleton | Import | @prisma/client | All API, actions, services |
| `prisma/schema.prisma` | Data model (User, Lead, Client, Sale, Task, Provider, Invoice, etc.) | generate, migrate | — | Prisma |
| `prisma/seed.ts` | Seed data | npm run seed | prisma | — |

---

## 3. 🧩 Feature Systems

### SCANNER SYSTEM

- **Entry:** `/scan/[sessionId]?token=...` (mobile) or `FileUploadDialog` → "Escanear con móvil" → QR → same URL.
- **Files:** `app/scan/[sessionId]/page.tsx`, `scan-session-page-inner.tsx`, `LiveScanner`, `EdgeEditor`, `processImage`, `warpQuadToJpegBlob` (all in scan-session-page-inner), `/api/scan-sessions/*`, `/api/providers/upload`.
- **Flow:** Create session → load with token → capture pages (LiveScanner) or add from gallery → optional EdgeEditor → processImage (autocrop, perspective, bw/contrast) → PDF (pdf-lib) → upload to /api/providers/upload → POST scan-sessions/[id]/upload with fileUrl → success.

### UPLOAD SYSTEM (Provider Documents)

- **Entry:** ProviderSidePanel → "Subir documento" → FileUploadDialog.
- **Paths:**
  - **Desktop:** FileUploadDialog → pick files → POST /api/providers/upload → register via provider action.
  - **Mobile scan:** FileUploadDialog → "Escanear con móvil" → ScanWithMobileDialog → create session → QR → mobile opens /scan/[sessionId] → same flow as SCANNER SYSTEM → polling detects fileUrl → onCompleted.
- **Files:** `FileUploadDialog`, `ScanWithMobileDialog`, `ScanSessionPageInner`, `/api/providers/upload`, `/api/scan-sessions/*`.

### AUTH SYSTEM

- **Entry:** `/auth` (redirect when unauthenticated).
- **Flow:** Sign in (Google or credentials) → NextAuth → JWT/session → dashboard layout checks session + getDbUser → redirect to onboarding if needed.
- **Files:** `lib/auth.ts`, `lib/get-db-user.ts`, `app/auth/page.tsx`, `app/api/auth/[...nextauth]/route.ts`, `app/dashboard/layout.tsx`.

### DASHBOARD SYSTEM

- **Entry:** `/dashboard` (after auth).
- **Flow:** Layout gates auth → DashboardShell (Sidebar + Header) → page content. Sidebar uses `useSectorConfig` for labels.
- **Files:** `app/dashboard/layout.tsx`, `DashboardShell`, `Sidebar`, `DashboardHeader`, `app/dashboard/page.tsx`.

### LEADS SYSTEM

- **Entry:** `/dashboard/leads`.
- **Files:** `app/dashboard/leads/page.tsx`, `modules/leads/*`, `lib/hooks/useLeads.ts`, `/api/leads/*`, events pipeline (leadProcessor).

### CLIENTS SYSTEM

- **Entry:** `/dashboard/clients`, `/dashboard/clients/[clientId]`.
- **Files:** `app/dashboard/clients/page.tsx`, `modules/clients/*`, `modules/client360/*`, `/api/*` (invoicing, etc.).

### PROVIDERS SYSTEM

- **Entry:** `/dashboard/providers`, `/dashboard/providers/[providerId]`.
- **Flow:** Server page fetches providers → ProvidersView (from modules) → ProvidersTable → ProviderSidePanel (from modules) → FileUploadDialog, orders, tasks, etc.
- **Files:** `app/dashboard/providers/page.tsx`, `modules/providers/components/ProvidersView.tsx`, `ProviderSidePanel`, `ProvidersTable`, `FileUploadDialog`, `ScanWithMobileDialog`, provider actions.

### SALES SYSTEM

- **Entry:** `/dashboard/sales`.
- **Files:** `app/dashboard/sales/page.tsx`, `modules/sales/*`, `/api/sales/*`.

### TASKS SYSTEM

- **Entry:** `/dashboard/tasks`.
- **Flow:** Fetches calendar events → TasksMissionControl → MissionCalendar, task list.
- **Files:** `app/dashboard/tasks/page.tsx`, `modules/tasks/*`, `modules/calendar/*`, `calendar-event-store`, `/api/tasks/*`, `/api/calendar/*`.

### FINANCE & INVOICING SYSTEM

- **Entry:** `/dashboard/finance`, `/dashboard/finance/invoicing/*`, `/dashboard/finance/billing`.
- **Files:** `modules/finance/*`, `modules/invoicing/*`, `/api/invoicing/*`, `/api/billing/*`, `/api/finance/*`.

### EVENTS & INGEST SYSTEM

- **Entry:** SDK sends events to `/api/ingest` or `/api/track`.
- **Flow:** Validate → rate limit → processEvent → leadProcessor/sessionProcessor → queue → worker.
- **Files:** `lib/events*`, `lib/events/*`, `app/api/ingest/route.ts`, `app/api/track/route.ts`, `workers/eventQueueWorker.ts`.

### BILLING SYSTEM

- **Entry:** `/dashboard/billing`, `/dashboard/other/billing`.
- **Files:** `app/dashboard/billing/page.tsx`, `app/api/billing/*`, `app/api/webhooks/stripe/route.ts`.

### REPORTING & ANALYTICS

- **Entry:** `/dashboard/reporting`, `/dashboard/analytics`.
- **Files:** `modules/reporting/*`, `modules/analytics/*`, `/api/analytics/*`.

---

## 4. 🔄 Data Flow

### UI → State → Processing → API → DB

1. **Leads:** UI (modules/leads) → useLeads / mutations → `/api/leads` → prisma.lead.*
2. **Clients:** UI (modules/clients) → server actions / API → prisma.client.*
3. **Providers:** UI (modules/providers) → actions (server) → prisma.provider.*, providerOrder, providerPayment, providerFile
4. **Sales:** UI (modules/sales) → useSales → `/api/sales` → prisma.sale.*
5. **Tasks:** UI (modules/tasks) → calendar-event-store / API → prisma.task.*, CalendarEvent
6. **Scan/Upload:** ScanSessionPageInner state → processImage (client) → PDF → `/api/providers/upload` → `/api/scan-sessions/[id]/upload` → prisma.scanSession

### Transformations

- **processImage:** File → canvas (autocrop, perspective warp, bw/contrast) → Blob
- **warpQuadToJpegBlob:** image URL + corners → canvas warp → JPEG Blob
- **PDF:** Blobs → pdf-lib PDFDocument → bytes
- **Events:** Raw event → validate → processEvent → leadProcessor (scoring, enrichment triggers)

### Side Effects

- **Auth:** Session in cookie, JWT
- **Ingest:** Redis rate limit, event queue, worker processing
- **Calendar sync:** lib/calendar-sync
- **Automations:** lib/automations (triggered by events)
- **Stripe webhooks:** Billing state updates

---

## 5. 👤 User Flows

### SCAN FLOW (Mobile)

1. Desktop: FileUploadDialog → "Escanear con móvil" → ScanWithMobileDialog opens
2. ScanWithMobileDialog: POST /api/scan-sessions → get sessionId, scanUrl, token
3. QR displayed with scanUrl (includes token)
4. User scans QR on mobile → opens /scan/[sessionId]?token=...
5. ScanSessionPageInner: GET /api/scan-sessions/[id]?token=... → load session
6. User taps "Añadir página" → LiveScanner opens → capture → blob → page state
7. Repeat for more pages
8. User taps "Revisar" → review mode, optional EdgeEditor per page
9. User taps "Generar PDF" → processImage per page → PDF → upload to /api/providers/upload → POST scan-sessions/[id]/upload with fileUrl
10. Success screen → desktop polling detects fileUrl → onCompleted callback → FileUploadDialog registers file

### SCAN FLOW (Desktop Camera)

1. Same entry (scan URL from QR, or direct if session exists)
2. LiveScanner uses desktop camera
3. Same capture → review → submit flow

### PROVIDER DOCUMENT UPLOAD (Desktop Files)

1. ProviderSidePanel → "Subir documento" → FileUploadDialog
2. Step 1: document name, category
3. Step 2: Add files (or scan with mobile)
4. Save → POST /api/providers/upload per file (or batch) → register via provider action

### AUTH FLOW

1. User visits /dashboard without session → redirect /auth
2. User signs in (Google or email/password)
3. NextAuth creates/updates User, Account
4. Session in cookie
5. Dashboard layout: getServerSession → getDbUser → if !onboardingCompleted → redirect /onboarding/sector
6. Render DashboardShell

### LEAD MANAGEMENT FLOW

1. Visit /dashboard/leads
2. List loads via useLeads / API
3. Click lead → detail / side panel
4. Stage change → PATCH /api/leads/[id]/stage
5. Enrichment retry → POST /api/leads/[id]/retry-enrichment

### PROVIDER MANAGEMENT FLOW

1. Visit /dashboard/providers
2. Server fetches providers, KPIs
3. ProvidersView (modules) renders table
4. Click row → ProviderSidePanel opens (or navigate to /dashboard/providers/[id])
5. Orders, tasks, files, timeline in tabs
6. FileUploadDialog or CreateProviderOrderDialog from panel

### TASK FLOW

1. Visit /dashboard/tasks
2. TasksMissionControl loads calendar events
3. Calendar + task list
4. Create/edit tasks via API

---

## 6. 🧠 State Management

### Where State Lives

- **React state:** Most UI (useState) in feature components
- **Zustand:** `modules/tasks/store/calendar-event-store.ts` (calendar events)
- **TanStack Query:** Data fetching (QueryProvider)
- **SWR:** Alternative data fetching in some areas
- **Session:** next-auth (JWT in cookie)

### How It's Passed

- **Props:** Parent → child (e.g. ProvidersView → ProvidersTable → ProviderSidePanel)
- **Context:** AssistantContext (suggestions), ThemeProvider, SessionProvider
- **Hooks:** useSectorConfig (pathname → config), useLeads, useSales, useTasks

### Components That Control State

- **ScanSessionPageInner:** All scan state (pages, session, scannerOpen, reviewMode, submitting)
- **ProviderSidePanel:** Selected provider, tab, dialogs
- **FileUploadDialog:** step, files, scanMode
- **ScanWithMobileDialog:** sessionId, status, fileUrl, polling

---

## 7. ⚠️ Critical Files

### Core Orchestrators

| File | Importance | Reason |
|------|------------|--------|
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | **CRITICAL** | Single orchestrator for scan flow. ~1431 lines. processImage, warpQuadToJpegBlob, PDF, upload. Broken = scan unusable. |
| `app/dashboard/layout.tsx` | **CRITICAL** | Auth gate. No auth → no dashboard. |
| `lib/auth.ts` | **CRITICAL** | Auth config. Broken = login fails. |
| `lib/prisma.ts` | **CRITICAL** | DB access. Broken = all data access fails. |
| `app/layout.tsx` | **CRITICAL** | Root layout. Broken = app doesn't render. |

### Multi-System Controllers

| File | Systems | Notes |
|------|---------|-------|
| `hooks/useSectorConfig.ts` | All feature UIs | Labels, features by pathname. 40+ consumers. |
| `config/sectors/index.ts` | Sector resolution | getSectorConfigByPath used by pages and hook. |
| `lib/events.ts` | Ingest, track | Allowlists, validation for both. |
| `lib/events/processEvent.ts` | Lead scoring, sessions, automations | Central event processing. |

### APIs That Everything Depends On

- `/api/auth/[...nextauth]` — Auth
- `/api/scan-sessions` — Scan flow
- `/api/providers/upload` — Document upload
- `/api/ingest`, `/api/track` — Events
- `/api/leads`, `/api/sales`, `/api/tasks`, etc. — Feature data

---

## 8. 🔗 Dependency Map

### Component Hierarchy (Key Paths)

```
RootLayout
├── QueryProvider
│   └── ThemeProvider
│       └── Providers (SessionProvider, AssistantProvider)
│           └── ToastProvider
│               ├── children (page)
│               ├── AiFloatingAssistant
│               └── Toaster

DashboardLayout
└── DashboardShell
    ├── Sidebar (useSectorConfig)
    └── main
        └── DashboardHeader
        └── children (page content)

ProvidersPage
└── ProvidersView (modules)
    ├── ProvidersTable
    │   └── row click → ProviderSidePanel
    └── CreateProviderDialog

ProviderSidePanel
├── FileUploadDialog
│   └── ScanWithMobileDialog
├── tabs (Orders, Tasks, Files, Timeline, etc.)
└── various dialogs

ScanSessionPage
└── ScanSessionPageInner
    ├── LiveScanner (when scannerOpen)
    ├── EdgeEditor (when editingPage)
    └── page list, review, submit
```

### Imports: Who Imports Whom

- **useSectorConfig** imported by: Sidebar, ProvidersView, ProvidersTable, ClientSidePanel, SalesView, TaskList, ReportingChart, FileUploadDialog, CreateProviderDialog, and 30+ more.
- **modules/providers** imported by: app/dashboard/providers (page, ProviderSidePanel), app/dashboard/providers/components/ProvidersView (ProviderSidePanel), client360 (SaleDialog, ReminderDialog, addClientNote).
- **processImage, warpQuadToJpegBlob:** Only in scan-session-page-inner (inline).

### Tight vs Loose Coupling

- **Tight:** ScanSessionPageInner ↔ LiveScanner, EdgeEditor, processImage (inline)
- **Tight:** FileUploadDialog ↔ ScanWithMobileDialog
- **Tight:** useSectorConfig ↔ pathname (any route change affects labels)
- **Loose:** Feature modules ↔ API routes (via fetch or server actions)
- **Loose:** components/ui ↔ feature components (design system)

---

## 9. 💥 Risk Zones

### Fragile Areas

| Area | Risk | Notes |
|------|------|-------|
| **LiveScanner** | Camera API, permissions | getUserMedia, browser support. No OpenCV; minimal. |
| **processImage** | Canvas, memory, perf | Large images, downscale to 1800px. Fallback chain. |
| **ScanSessionPageInner** | ~1431 lines, async flows | processImage, warpQuadToJpegBlob, handleSubmit. Many state transitions, AbortController, timeouts. |
| **ScanWithMobileDialog** | Polling, token lifecycle | Poll until fileUrl. Token invalidated on complete. Race if user closes early. |
| **Provider upload** | Local fs | public/uploads/providers. Not suitable for serverless (Vercel). |
| **Event queue worker** | Redis, background | npm run worker:events. If down, events queue up. |
| **Ingest** | Rate limit, validation | Distributed rate limit, 50KB body cap. |

### Complex Logic Areas

- **processImage:** Autocrop, perspective warp, bw/contrast, fallbacks
- **handleSubmit (scan):** Snapshot pages, processImage loop, PDF build, upload, session upload, success timeout
- **Event pipeline:** processEvent → leadProcessor → scoring, enrichment, automations
- **Sector config:** getSectorConfigByPath path parsing (dashboard/[sector]/...)

### Areas Prone to Bugs

- **Scan:** Unmount during async (isMountedRef, safe()) — many async steps
- **Upload:** File size, type validation; UPLOAD_BASE_URL for complete/upload validation
- **Scan session:** Token in URL; must be passed for upload/complete
- **ProviderSidePanel:** Many tabs, dialogs; state can get stale

---

## 10. 🧭 Where to Touch Guide

| Task | Files to Touch |
|------|----------------|
| **Modify scanner (camera, capture)** | `components/scanner/LiveScanner.tsx` |
| **Modify edge/corner editing** | `components/scanner/EdgeEditor.tsx` |
| **Modify image processing (autocrop, perspective, filters)** | `app/scan/[sessionId]/scan-session-page-inner.tsx` (processImage, warpQuadToJpegBlob) |
| **Modify PDF generation (scan)** | `app/scan/[sessionId]/scan-session-page-inner.tsx` (handleSubmit, pdf-lib) |
| **Modify upload logic (scan)** | `app/scan/[sessionId]/scan-session-page-inner.tsx` (handleSubmit), `app/api/providers/upload/route.ts` |
| **Modify scan session API** | `app/api/scan-sessions/route.ts`, `app/api/scan-sessions/[id]/*.ts` |
| **Modify provider document upload UI** | `modules/providers/components/FileUploadDialog.tsx` |
| **Modify mobile scan flow (QR, polling)** | `modules/providers/components/ScanWithMobileDialog.tsx` |
| **Modify providers list/table** | `modules/providers/components/ProvidersView.tsx`, `ProvidersTable.tsx` |
| **Modify provider side panel** | `modules/providers/components/ProviderSidePanel.tsx` |
| **Modify sector labels / features** | `config/sectors/default.ts`, `online.ts`, `fisio.ts`, `config/sectors/index.ts` |
| **Modify nav / sidebar** | `app/dashboard/components/Sidebar.tsx` |
| **Modify dashboard layout** | `components/layout/DashboardShell.tsx`, `app/dashboard/layout.tsx` |
| **Modify auth (providers, callbacks)** | `lib/auth.ts` |
| **Modify leads logic** | `modules/leads/*`, `lib/hooks/useLeads.ts`, `app/api/leads/*` |
| **Modify clients logic** | `modules/clients/*`, `modules/client360/*` |
| **Modify sales logic** | `modules/sales/*`, `app/api/sales/*` |
| **Modify tasks / calendar** | `modules/tasks/*`, `modules/calendar/*`, `app/api/tasks/*`, `app/api/calendar/*` |
| **Modify events / ingest** | `lib/events.ts`, `lib/events/*`, `app/api/ingest/route.ts`, `app/api/track/route.ts` |
| **Modify invoice PDF** | `modules/invoicing/pdf/*` |
| **Modify design system** | `components/ui/*` |
| **Add new sector** | `config/sectors/<sector>.ts`, register in `config/sectors/index.ts` |

---

## Duplicates & Legacy (from audit)

| Item | Location | Status |
|------|----------|--------|
| **ProvidersView** | `app/dashboard/providers/components/ProvidersView.tsx` | Simpler variant, **not used** by main page. Main page uses `modules/providers/components/ProvidersView.tsx`. |
| **useSectorConfig** | `hooks/useSectorConfig.ts` (primary) vs `src/hooks/useSectorConfig.ts`, `src/shared/hooks/useSectorConfig.ts` | `@/hooks/useSectorConfig` is canonical. `src/*` may be legacy. |
| **Dashboard routes** | `/dashboard/other/*` (leads, sales, clients, etc.) | Some overlap with `/dashboard/*` counterparts. See docs/AUDITORIA_*.md. |
| **importRules, openai, leadSuggestions** | `app/dashboard/leads/utils/*` vs `modules/leads/utils/*` | Potential duplication. |

---

*Document generated for developer onboarding and safe modification. No code was changed.*
