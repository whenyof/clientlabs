# Inventario real — Paneles Dashboard (Multisector)

**Fecha:** 2026-02-04  
**Objetivo:** Estado real de cada panel respecto a SectorConfig y datos (sin suposiciones).

---

## 1. Sales (Ventas)

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/sales` |
| **Componentes principales** | `SalesPage`, `SalesKPIs`, `SalesTable`, `CreateSaleModal`, `SaleDrawer`, `constants.ts` (MOCK_SALES, STATUS_LABELS) |
| **Acciones reales** | Ninguna. Estado local `useState(MOCK_SALES)`. Actualización de estado en memoria (handleUpdateStatus, handleCreateSale). No hay server actions ni llamadas API. |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🔴 **Placeholder / UI only** — Datos 100% mock, sin persistencia |

---

## 2. Finance (Finanzas)

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/finance` |
| **Componentes principales** | `FinancePage`, `FinanceHeader`, `FinanceKPIs`, `MainChart`, `CashflowBlock`, `TransactionsTable`, `FixedExpenses`, `Budgets`, `Forecast`, `Goals`, `Alerts`, `AutomationFinance`, `CreateTransactionModal` |
| **API existente** | `api/listTransactions.ts` (Prisma, real), `api/createTransaction.ts`, `api/analytics.ts` |
| **Uso real** | `FinanceKPIs` usa `mockFinanceKPIs` (mock). `TransactionsTable` usa `mockTransactions` (mock). La UI no llama a las APIs de transacciones. |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🟡 **Parcial** — APIs reales disponibles; pantalla usa mocks. Conexión real = no. |

---

## 3. Billing / Facturación

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/billing` |
| **Componentes principales** | `BillingPage`, `BillingKPIs`, `BillingTabs`, `InvoicesTable`, `InvoiceModal`, `InvoiceLinesEditor`, `InvoicePDF`, `SendToHaciendaButton` |
| **API** | `api/listInvoices.ts` (lee `mockInvoices`), `api/createInvoice.ts`, `api/sendToAeat.ts` — sin Prisma en listado. |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🟡 **Parcial** — UI completa; datos de facturas desde mock. Integración Hacienda puede existir pero listado no persistido en DB. |

---

## 4. Integrations

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/integrations` |
| **Componentes principales** | `IntegrationsPage`, `IntegrationHero`, `IntegrationCategories`, `IntegrationGrid`, `IntegrationLogs`, `WorkflowPanel`, `AIRecommendations`, `IntegrationModal`, `useIntegrations` (hook) |
| **Datos** | Hook y grid suelen alimentarse de mock o API de integraciones (verificar `useIntegrations` y `mock.ts`). |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🟡 **Parcial** — Conectores y UI; confirmar si hay API real de conexión/desconexión. |

---

## 5. Notifications

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/notifications` |
| **Componentes principales** | `NotificationsPage`, `NotificationList`, `NotificationItem` |
| **Datos** | Array hardcodeado `NOTIFICATIONS` en `NotificationList.tsx`. Sin API. |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🔴 **Placeholder / UI only** — Solo UI y datos estáticos. |

---

## 6. Reports / Analytics

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/analytics` |
| **Componentes principales** | `AnalyticsPage`, `AnalyticsKPIs`, `DateRangePicker`, `MainChart`, `FunnelChart`, `SectionTabs`, `ActivityTable`, `AiInsights`, `ExportButtons`; datos desde `mock.ts` (`getKPIsForRange`, `getChartDataForRange`). |
| **Acciones** | Solo lectura: filtros, export (CSV/PDF). No acciones que escriban en BD. |
| **SectorConfig** | No usa `useSectorConfig` |
| **Estado** | 🔴 **Placeholder / UI only** — Métricas y gráficos desde mock; sin datos reales. |

---

## 7. Tasks

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/tasks` (funcional); existe también `/dashboard/other/tasks` (mock, no adaptado). |
| **Componentes** | `app/dashboard/tasks/page.tsx` + `modules/tasks/*` + `components/tasks/*`. |
| **SectorConfig** | ✅ Adaptado (useSectorConfig, useTasksLabels). |
| **Estado** | 🟢 **Funcional** (panel en `/dashboard/tasks`). Duplicidad: panel en `other/tasks` es UI only. |

---

## 8. Settings

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/settings` |
| **Componentes principales** | `SettingsPage`, `ProfileForm`, `SecuritySettings`, `CompanySettings`, `NotificationSettings`, `TeamMembers`, `PermissionsPanel`, `PlansSection`, `BillingHistory`, `UsageLimits`, `AppearanceSettings`, `DangerZone` |
| **Acciones** | Dependen de cada subpanel (perfil, seguridad, equipo, Stripe, etc.). Parte puede llamar APIs. |
| **SectorConfig** | No usa `useSectorConfig`; títulos y secciones hardcodeados. |
| **Estado** | 🟡 **Parcial** — Funcionalidad variada; textos y estructura no sectorizados. |

---

## 9. AI Assistant

| Campo | Valor |
|-------|--------|
| **Ruta** | `/dashboard/other/ai-assistant` |
| **Componentes principales** | `AiAssistantPage`, `AssistantHeader`, `AssistantKPIs`, `InsightCards`, `HotLeadsTable`, `PredictionsChart`, `RecommendationsFeed`, `AutomationsPanel`, `AssistantSettings`, `AssistantTimeline`, `ChatWindow`; APIs: `api/analyze.ts`, `api/predict.ts`, `api/generate-email.ts` |
| **SectorConfig** | No usa `useSectorConfig` en la página; `labels.aiAssistant` ya existe en config pero no se usan en el panel. |
| **Estado** | 🟡 **Parcial** — APIs de IA pueden ser reales; UI con textos hardcodeados. |

---

## Resumen rápido

| Panel        | Ruta                          | SectorConfig | Datos/API              | Estado  |
|-------------|-------------------------------|-------------|-------------------------|--------|
| Sales       | /dashboard/other/sales        | ❌          | Mock (estado local)     | 🔴 UI  |
| Finance     | /dashboard/other/finance       | ❌          | API existe; UI mock    | 🟡 Parcial |
| Billing     | /dashboard/other/billing       | ❌          | Mock en API listado     | 🟡 Parcial |
| Integrations| /dashboard/other/integrations  | ❌          | Mock/hook               | 🟡 Parcial |
| Notifications| /dashboard/other/notifications| ❌          | Array estático          | 🔴 UI  |
| Analytics   | /dashboard/other/analytics     | ❌          | Mock                    | 🔴 UI  |
| Tasks       | /dashboard/tasks              | ✅          | Real (Prisma)           | 🟢 OK  |
| Settings    | /dashboard/other/settings      | ❌          | Mixto                   | 🟡 Parcial |
| AI Assistant| /dashboard/other/ai-assistant  | ❌          | APIs posiblemente reales| 🟡 Parcial |

---

## Navegación (Sidebar)

- **Archivo:** `app/dashboard/other/components/Sidebar.tsx`
- **SectorConfig:** No. Labels hardcodeados (Dashboard, Leads, Clientes, Ventas, Tareas, Finanzas, Facturación, Analytics, IA Assistant, Integraciones, Ajustes).
- **Acción:** Usar `labels.nav` desde `useSectorConfig()` para todos los ítems que tengan equivalente en `SectorConfig.labels.nav`.

---

*Documento generado en el marco de la adaptación multisector. No tocar lógica que funcione; solo preparar estructura para sector.*
