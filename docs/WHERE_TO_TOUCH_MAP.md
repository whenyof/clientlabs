# WHERE TO TOUCH — Practical File Map

> Real file paths. No abstractions. Move fast.

---

## 1. 🧭 Critical Entry Points

### Main Pages (Routes)

| Route | Entry File |
|-------|------------|
| `/` | `app/(public)/page.tsx` |
| `/auth` | `app/auth/page.tsx` |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/leads` | `app/dashboard/leads/page.tsx` |
| `/dashboard/clients` | `app/dashboard/clients/page.tsx` |
| `/dashboard/providers` | `app/dashboard/providers/page.tsx` |
| `/dashboard/providers/[providerId]` | `app/dashboard/providers/[providerId]/page.tsx` |
| `/dashboard/tasks` | `app/dashboard/tasks/page.tsx` |
| `/dashboard/sales` | `app/dashboard/sales/page.tsx` |
| `/dashboard/finance` | `app/dashboard/finance/page.tsx` |
| `/dashboard/ai-assistant` | `app/dashboard/ai-assistant/page.tsx` |
| `/dashboard/automations` | `app/dashboard/automations/page.tsx` |
| `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` |
| `/scan/[sessionId]` | `app/scan/[sessionId]/page.tsx` → `app/scan/[sessionId]/scan-session-page-inner.tsx` |
| `/onboarding/sector` | `app/onboarding/sector/page.tsx` |
| `/admin` | `app/admin/page.tsx` |

### Core Orchestrators

| File | Role |
|------|------|
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | MAIN scanner logic controller (state, capture, process, PDF, upload) |
| `app/dashboard/layout.tsx` | Auth gate, onboarding redirect |
| `app/layout.tsx` | Root layout, providers, theme |
| `components/layout/DashboardShell.tsx` | Sidebar + main content |
| `app/dashboard/components/Sidebar.tsx` | Nav menu |

### Root Layouts

| File | Role |
|------|------|
| `app/layout.tsx` | Root HTML, fonts, ThemeProvider, QueryProvider, ToastProvider, AiFloatingAssistant |
| `app/providers.tsx` | SessionProvider, AssistantProvider |
| `app/(public)/layout.tsx` | Public routes layout |
| `app/dashboard/layout.tsx` | Auth + DashboardShell |
| `app/admin/layout.tsx` | Admin layout |

---

## 2. 📁 Feature → Files (REAL PATHS)

### SCANNER SYSTEM

| File | Role |
|------|------|
| `app/scan/[sessionId]/page.tsx` | Scan route wrapper, passes sessionId to inner |
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | Orchestrator, processImage (inline), warpQuadToJpegBlob (inline), PDF build, upload |
| `components/scanner/LiveScanner.tsx` | Camera + capture → onCapture(blob) |
| `components/scanner/EdgeEditor.tsx` | Manual corner crop, onConfirm(corners) |
| `app/api/scan-sessions/route.ts` | POST create session |
| `app/api/scan-sessions/[id]/route.ts` | GET session status |
| `app/api/scan-sessions/[id]/upload/route.ts` | POST mark UPLOADED with fileUrl |
| `app/api/scan-sessions/[id]/complete/route.ts` | POST mark COMPLETED |
| `app/api/scan-sessions/[id]/confirm/route.ts` | Confirm flow |

### UPLOAD SYSTEM

| File | Role |
|------|------|
| `app/api/providers/upload/route.ts` | POST save file to public/uploads/providers |
| `modules/providers/components/FileUploadDialog.tsx` | Upload UI (name, category, files OR scan) |
| `modules/providers/components/ScanWithMobileDialog.tsx` | QR, create session, poll, onCompleted |
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | PDF generation + upload after scan |

### PROVIDERS SYSTEM

| File | Role |
|------|------|
| `app/dashboard/providers/page.tsx` | Server page, fetch providers, KPIs |
| `modules/providers/components/ProvidersView.tsx` | Main view (table + CreateProviderDialog) |
| `modules/providers/components/ProvidersTable.tsx` | Provider table |
| `modules/providers/components/ProviderSidePanel.tsx` | Side panel (orders, tasks, files, FileUploadDialog) |
| `modules/providers/components/Provider360View.tsx` | Full 360 page |
| `modules/providers/components/FileUploadDialog.tsx` | Document upload |
| `modules/providers/components/ScanWithMobileDialog.tsx` | Mobile scan flow |
| `modules/providers/actions/index.ts` | Server actions (orders, payments, files, etc.) |
| `app/dashboard/providers/actions.ts` | Provider-specific actions |
| `app/api/providers/upload/route.ts` | File upload API |

### LEADS SYSTEM

| File | Role |
|------|------|
| `app/dashboard/leads/page.tsx` | Leads page |
| `app/dashboard/leads/feed/page.tsx` | Leads feed |
| `app/dashboard/leads/[id]/page.tsx` | Lead detail |
| `modules/leads/components/LeadsTable.tsx` | Leads table |
| `modules/leads/components/LeadsHeader.tsx` | Header |
| `modules/leads/components/LeadsFilters.tsx` | Filters |
| `lib/hooks/useLeads.ts` | Leads data hook |
| `app/api/leads/route.ts` | Leads CRUD |
| `app/api/leads/[id]/stage/route.ts` | Update stage |
| `app/api/leads/[id]/retry-enrichment/route.ts` | Retry enrichment |
| `app/api/leads/[id]/insights/route.ts` | Insights |

### CLIENTS SYSTEM

| File | Role |
|------|------|
| `app/dashboard/clients/page.tsx` | Clients list |
| `app/dashboard/clients/[clientId]/page.tsx` | Client detail |
| `modules/clients/components/ClientsTable.tsx` | Table |
| `modules/clients/components/ClientSidePanel.tsx` | Side panel |
| `modules/clients/components/ClientFilters.tsx` | Filters |
| `modules/client360/` | Client 360 components |
| `modules/clients/actions/index.ts` | Server actions |
| `app/api/` | (clients via transactions, invoicing, etc.) |

### SALES SYSTEM

| File | Role |
|------|------|
| `app/dashboard/sales/page.tsx` | Sales page |
| `modules/sales/components/SalesView.tsx` | Main view |
| `modules/sales/components/SalesTable.tsx` | Table |
| `modules/sales/components/SalesKPIs.tsx` | KPIs |
| `modules/sales/hooks/useSales.ts` | Sales data |
| `app/api/sales/route.ts` | Sales CRUD |
| `app/api/sales/forecast/route.ts` | Forecast |

### TASKS SYSTEM

| File | Role |
|------|------|
| `app/dashboard/tasks/page.tsx` | Tasks page |
| `modules/tasks/mission-control/MissionCalendar.tsx` | Calendar |
| `modules/tasks/components/TaskList.tsx` | Task list |
| `modules/tasks/store/calendar-event-store.ts` | Zustand store |
| `modules/calendar/services/calendar-events.service.ts` | Events service |
| `app/api/tasks/route.ts` | Tasks CRUD |
| `app/api/tasks/calendar/route.ts` | Calendar data |
| `app/api/calendar/events/route.ts` | Calendar events |

### FINANCE & INVOICING

| File | Role |
|------|------|
| `app/dashboard/finance/page.tsx` | Finance page |
| `modules/finance/` | Finance engine, metrics |
| `modules/invoicing/pdf/index.ts` | Invoice PDF public API |
| `modules/invoicing/pdf/generator.ts` | PDF generation |
| `modules/invoicing/pdf/invoice-renderer.ts` | Render to buffer |
| `modules/invoicing/pdf/branding.ts` | Branding |
| `app/api/invoicing/route.ts` | Invoicing API |
| `app/api/invoicing/[id]/pdf/route.ts` | Invoice PDF |
| `app/api/billing/[id]/pdf/route.ts` | Billing PDF |

### AUTH SYSTEM

| File | Role |
|------|------|
| `lib/auth.ts` | NextAuth config (Google, Credentials, JWT) |
| `lib/get-db-user.ts` | Fetch user for session |
| `app/auth/page.tsx` | Login page |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |

### EVENTS & INGEST

| File | Role |
|------|------|
| `lib/events.ts` | Allowlists, validation |
| `lib/events/processEvent.ts` | Process single event |
| `lib/events/processEventBatch.ts` | Batch |
| `lib/events/leadProcessor.ts` | Lead scoring |
| `app/api/ingest/route.ts` | SDK ingest |
| `app/api/track/route.ts` | Track events |
| `workers/eventQueueWorker.ts` | Background worker |

### SECTOR CONFIG

| File | Role |
|------|------|
| `config/sectors/index.ts` | Registry, getSectorConfigByPath |
| `config/sectors/default.ts` | Default sector |
| `config/sectors/online.ts` | Online sector |
| `config/sectors/fisio.ts` | Fisio sector |
| `hooks/useSectorConfig.ts` | Client hook (pathname → config) |

### UI / DESIGN SYSTEM

| File | Role |
|------|------|
| `components/ui/` | Radix primitives, Button, Input, Dialog, etc. |
| `components/layout/DashboardShell.tsx` | Shell |
| `components/layout/DashboardHeader.tsx` | Header |
| `components/ThemeProvider.tsx` | Theme |
| `app/globals.css` | Global styles, CSS vars |

---

## 3. 🎯 Where to Touch Table

| IF YOU WANT TO | GO HERE |
|----------------|---------|
| **Modify scanner** | `app/scan/[sessionId]/scan-session-page-inner.tsx` |
| **Modify camera** | `components/scanner/LiveScanner.tsx` |
| **Modify manual crop / corners** | `components/scanner/EdgeEditor.tsx` |
| **Modify image processing** | `app/scan/[sessionId]/scan-session-page-inner.tsx` (processImage, warpQuadToJpegBlob — inline) |
| **Modify scan PDF** | `app/scan/[sessionId]/scan-session-page-inner.tsx` (handleSubmit, pdf-lib) |
| **Modify scan upload** | `app/scan/[sessionId]/scan-session-page-inner.tsx`, `app/api/providers/upload/route.ts` |
| **Modify scan session API** | `app/api/scan-sessions/route.ts`, `app/api/scan-sessions/[id]/*.ts` |
| **Modify provider document upload UI** | `modules/providers/components/FileUploadDialog.tsx` |
| **Modify mobile scan (QR, polling)** | `modules/providers/components/ScanWithMobileDialog.tsx` |
| **Modify providers list** | `modules/providers/components/ProvidersView.tsx`, `ProvidersTable.tsx` |
| **Modify provider side panel** | `modules/providers/components/ProviderSidePanel.tsx` |
| **Modify invoice PDF** | `modules/invoicing/pdf/generator.ts`, `modules/invoicing/pdf/invoice-renderer.ts`, `modules/invoicing/pdf/index.ts` |
| **Modify sidebar / nav** | `app/dashboard/components/Sidebar.tsx` |
| **Modify dashboard layout** | `components/layout/DashboardShell.tsx`, `app/dashboard/layout.tsx` |
| **Modify auth** | `lib/auth.ts`, `app/auth/page.tsx` |
| **Modify sector labels** | `config/sectors/default.ts`, `config/sectors/online.ts`, `config/sectors/fisio.ts` |
| **Modify leads** | `modules/leads/`, `lib/hooks/useLeads.ts`, `app/api/leads/` |
| **Modify clients** | `modules/clients/`, `modules/client360/` |
| **Modify sales** | `modules/sales/`, `app/api/sales/` |
| **Modify tasks / calendar** | `modules/tasks/`, `modules/calendar/`, `app/api/tasks/`, `app/api/calendar/` |
| **Modify events / ingest** | `lib/events.ts`, `lib/events/`, `app/api/ingest/route.ts` |
| **Modify design system** | `components/ui/` |
| **Add new sector** | `config/sectors/<sector>.ts`, `config/sectors/index.ts` |

---

## 4. 🌳 Hierarchy Map

### Scan Flow

```
app/scan/[sessionId]/page.tsx
└── app/scan/[sessionId]/scan-session-page-inner.tsx
    ├── components/scanner/LiveScanner.tsx
    ├── components/scanner/EdgeEditor.tsx
    ├── processImage (inline function)
    ├── warpQuadToJpegBlob (inline function)
    ├── PDFDocument (pdf-lib)
    ├── fetch /api/providers/upload
    └── fetch /api/scan-sessions/[id]/upload
```

### Provider Upload Flow

```
modules/providers/components/ProviderSidePanel.tsx
└── modules/providers/components/FileUploadDialog.tsx
    ├── modules/providers/components/ScanWithMobileDialog.tsx
    │   ├── fetch /api/scan-sessions (create)
    │   ├── fetch /api/scan-sessions/[id] (poll)
    │   └── onCompleted → register file
    └── fetch /api/providers/upload (desktop files)
```

### Dashboard

```
app/dashboard/layout.tsx
└── components/layout/DashboardShell.tsx
    ├── app/dashboard/components/Sidebar.tsx
    │   └── hooks/useSectorConfig.ts
    ├── components/layout/DashboardHeader.tsx
    └── children (page.tsx)
```

### Providers Page

```
app/dashboard/providers/page.tsx
└── modules/providers/components/ProvidersView.tsx
    ├── modules/providers/components/ProvidersTable.tsx
    │   └── row click → ProviderSidePanel
    └── modules/providers/components/CreateProviderDialog.tsx
```

### Invoice PDF

```
app/api/invoicing/[id]/pdf/route.ts
└── modules/invoicing/pdf/index.ts
    ├── modules/invoicing/pdf/generator.ts
    ├── modules/invoicing/pdf/invoice-renderer.ts
    ├── modules/invoicing/pdf/branding.ts
    └── modules/invoicing/pdf/styles.ts
```

---

## 5. ⚠️ Critical Files (DO NOT TOUCH CARELESSLY)

### Multi-System Controllers

| File | Systems Affected |
|------|------------------|
| `hooks/useSectorConfig.ts` | 40+ components (labels, features) |
| `config/sectors/index.ts` | All sector resolution |
| `lib/auth.ts` | Auth, session, login |
| `lib/events.ts` | Ingest, track |
| `lib/events/processEvent.ts` | Leads, sessions, automations |
| `lib/prisma.ts` | All DB access |
| `app/dashboard/layout.tsx` | All dashboard access |

### High-Risk Files

| File | Risk |
|------|------|
| `app/scan/[sessionId]/scan-session-page-inner.tsx` | ~1431 lines, single orchestrator. Broken = scan unusable. |
| `components/scanner/LiveScanner.tsx` | Camera API, getUserMedia |
| `modules/providers/components/ScanWithMobileDialog.tsx` | Polling, token lifecycle |
| `app/api/ingest/route.ts` | Rate limit, validation |
| `workers/eventQueueWorker.ts` | Event pipeline |

---

## 6. 🚀 Quick Navigation Map

| Target | Path |
|--------|------|
| **Scanner core** | `app/scan/[sessionId]/scan-session-page-inner.tsx` |
| **Camera** | `components/scanner/LiveScanner.tsx` |
| **Edge editor** | `components/scanner/EdgeEditor.tsx` |
| **Upload API** | `app/api/providers/upload/route.ts` |
| **Scan session API** | `app/api/scan-sessions/` |
| **Provider upload UI** | `modules/providers/components/FileUploadDialog.tsx` |
| **Mobile scan** | `modules/providers/components/ScanWithMobileDialog.tsx` |
| **Providers view** | `modules/providers/components/ProvidersView.tsx` |
| **Provider panel** | `modules/providers/components/ProviderSidePanel.tsx` |
| **Invoice PDF** | `modules/invoicing/pdf/` |
| **UI components** | `components/ui/` |
| **Sidebar** | `app/dashboard/components/Sidebar.tsx` |
| **Auth** | `lib/auth.ts` |
| **Sector config** | `config/sectors/`, `hooks/useSectorConfig.ts` |
| **API routes** | `app/api/` |
| **Events / ingest** | `lib/events.ts`, `lib/events/`, `app/api/ingest/route.ts` |
