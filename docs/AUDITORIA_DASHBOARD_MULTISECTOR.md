# Auditoría completa — Dashboard multisector

**Tipo:** Diagnóstico técnico. Sin modificaciones de código.  
**Fecha:** 2026-02-04

---

## 1. Inventario de paneles

| Panel | Existe | Ruta(s) | Archivos principales | Ubicación | Módulo compartido / duplicado |
|-------|--------|---------|----------------------|-----------|--------------------------------|
| **Dashboard (raíz)** | Sí | `/dashboard` | `app/dashboard/page.tsx` | dashboard | Redirect a `/dashboard/other` |
| **Dashboard principal** | Sí | `/dashboard/other` | `app/dashboard/other/page.tsx`, KPICard, RevenueChart, FunnelChart, ActivityFeed, QuickActions, SystemStatus, AIInsights | other | Componentes en other/components |
| **Leads** | Sí | `/dashboard/other/leads` | `app/dashboard/other/leads/page.tsx` (server), `modules/leads/*` | other | Módulo compartido: modules/leads. Duplicidad: otros componentes en other/leads (no usados por la página actual) |
| **Clients** | Sí (doble) | `/dashboard/clients` y `/dashboard/other/clients` | `app/dashboard/clients/page.tsx`, `app/dashboard/other/clients/page.tsx`, `other/clients/actions.ts`, `modules/clients/*` | dashboard + other | Módulo compartido: modules/clients. Dos rutas con Prisma; la navegación Sidebar apunta a other/clients |
| **Providers** | Sí (doble) | `/dashboard/providers` y `/dashboard/other/providers` | `app/dashboard/providers/page.tsx` + actions, `app/dashboard/other/providers/page.tsx` (Prisma), `modules/providers/*` | dashboard + other | Módulo compartido: modules/providers. Ambas rutas usan Prisma; Sidebar apunta a other/providers |
| **Tasks** | Sí (doble) | `/dashboard/tasks` y `/dashboard/other/tasks` | `app/dashboard/tasks/page.tsx` (Prisma + server actions), `app/dashboard/tasks/actions.ts`, `modules/tasks/*`; `app/dashboard/other/tasks/page.tsx` (mock local) | dashboard + other | Módulo compartido: modules/tasks para la ruta real. **Sidebar enlaza a other/tasks (mock), no a dashboard/tasks (real)** |
| **Sales** | Sí | `/dashboard/other/sales` | `app/dashboard/other/sales/page.tsx`, SalesKPIs, SalesTable, CreateSaleModal, SaleDrawer, constants (MOCK_SALES) | other | Código en other/sales; existe modules/sales (SalesView, componentes) no usado por esta ruta |
| **Finance** | Sí | `/dashboard/other/finance` | `app/dashboard/other/finance/page.tsx`, FinanceKPIs, TransactionsTable, etc.; api: listTransactions, createTransaction, analytics (Prisma) | other | Sin módulo compartido. API real; UI usa mock en todos los componentes |
| **Finanzas** (alias) | Sí | `/dashboard/other/finanzas` | `app/dashboard/other/finanzas/page.tsx` | other | Placeholder: solo texto "Página de finanzas en desarrollo...". Ruta duplicada/alternativa a finance |
| **Billing** | Sí | `/dashboard/other/billing` | `app/dashboard/other/billing/page.tsx`, BillingKPIs, InvoicesTable, InvoiceModal; api: listInvoices (mock), createInvoice, sendToAeat | other | API listInvoices devuelve mockInvoices; sin Prisma en listado |
| **Integrations** | Sí | `/dashboard/other/integrations` | `app/dashboard/other/integrations/page.tsx`, IntegrationGrid, useIntegrations, mock | other | Todo mock; app/api/integrations con Prisma comentado |
| **Notifications** | Sí | `/dashboard/other/notifications` | `app/dashboard/other/notifications/page.tsx`, NotificationList (array NOTIFICATIONS hardcodeado) | other | Sin API; sin persistencia |
| **Analytics / Reports** | Sí | `/dashboard/other/analytics` | `app/dashboard/other/analytics/page.tsx`, AnalyticsKPIs, MainChart, FunnelChart, mock (getKPIsForRange, getChartDataForRange) | other | Todo mock |
| **Automations** | Sí | `/dashboard/other/automations` | `app/dashboard/other/automations/page.tsx`, AutomationKPIs, AutomationsTable, LogsPanel, mock | other | Todo mock. No usa SectorConfig |
| **AI Assistant** | Sí | `/dashboard/other/ai-assistant` | `app/dashboard/other/ai-assistant/page.tsx`, AssistantKPIs, InsightCards, HotLeadsTable, etc.; api: analyze, predict, generate-email (analyze usa mock) | other | Componentes con mock; APIs pueden llamar servicios externos pero datos de entrada/salida mockeados en parte |
| **Settings** | Sí | `/dashboard/other/settings` | `app/dashboard/other/settings/page.tsx`, ProfileForm, SecuritySettings, CompanySettings, NotificationSettings, TeamMembers, PermissionsPanel, PlansSection, BillingHistory, UsageLimits, AppearanceSettings, DangerZone | other | Sin módulo; subpaneles variados (algunos pueden llamar API externa tipo Stripe) |
| **System Backups** | Sí | `/dashboard/other/system/backups` | `app/dashboard/other/system/backups/page.tsx`, BackupStats, BackupActions, etc. | other | Visible solo PRO/ENTERPRISE o admin. No revisado uso de SectorConfig ni API real |
| **Admin Backups** | Sí | `/dashboard/admin/backups` | `app/dashboard/admin/backups/page.tsx` | admin | Ruta admin; app/api/admin/backup usa Prisma BackupMetadata |
| **Finance test** | Sí | `/dashboard/finance-test` | `app/dashboard/finance-test/page.tsx` | dashboard | Ruta de prueba |
| **Test** | Sí | `/dashboard/test`, `/dashboard/other/test` | page.tsx en ambos | dashboard + other | Rutas de prueba |

---

## 2. Estado funcional real

| Panel | Clasificación | CRUD real | Guarda datos | Lee datos | Acciones persisten | Timeline/estados/relaciones |
|-------|----------------|-----------|--------------|-----------|--------------------|-----------------------------|
| **Dashboard principal** | 🔴 No funcional (datos) | No | No | No (valores fijos en código) | N/A | Solo visual; números estáticos |
| **Leads** | 🟢 Funcional | Sí (API + server) | Sí | Sí (Prisma en page + app/api/leads) | Sí | Estados, temperatura, filtros, conversión reales |
| **Clients** (ambas rutas) | 🟢 Funcional | Sí | Sí | Sí (Prisma en page + actions) | Sí | Timeline, ventas, tareas, notas, estado recalculado |
| **Providers** (ambas rutas) | 🟢 Funcional | Sí | Sí | Sí (Prisma en page + actions) | Sí | Pedidos, tareas, notas, archivos, alertas |
| **Tasks** `/dashboard/tasks` | 🟢 Funcional | Sí | Sí | Sí (Prisma en page + actions) | Sí | Filtros por vista, cliente/lead vinculados |
| **Tasks** `/dashboard/other/tasks` | 🔴 Placeholder | No | No | No (TASKS mock) | No | Solo UI; estado local |
| **Sales** | 🔴 Placeholder | No | No | No (MOCK_SALES en estado) | No | Solo UI; nada persiste |
| **Finance** | 🟡 Parcial | API existe (createTransaction, listTransactions con Prisma) | Backend sí; UI no llama listado real | Backend sí; UI usa mockFinanceKPIs, mockTransactions, mock* en todos los componentes | Crear transacción vía API persistiría; la tabla/KPIs no muestran eso | Solo visual con mocks |
| **Billing** | 🔴 Placeholder (datos) | listInvoices devuelve mock | createInvoice/sendToAeat existen pero listado no es BD | No (mockInvoices) | No para listado | Solo UI + API de listado mock |
| **Integrations** | 🔴 Placeholder | No (Prisma comentado en API) | No | No (mock) | No | Solo UI |
| **Notifications** | 🔴 Placeholder | No | No | No (array en componente) | No | Solo UI |
| **Analytics** | 🔴 Placeholder | No | No | No (mock) | No | Solo UI |
| **Automations** | 🔴 Placeholder | No | No | No (mock) | No | Solo UI |
| **AI Assistant** | 🟡 Parcial | APIs existen (analyze, predict, generate-email) | Depende de implementación APIs | analyze usa mockLeadScores; resto mock en componentes | Incierto | Mayormente visual con mocks |
| **Settings** | 🟡 Parcial | Depende subpanel (perfil, Stripe, etc.) | Depende | Depende | Depende | No auditado por subpanel |
| **Finanzas** (other/finanzas) | 🔴 Placeholder | No | No | No | No | Mensaje "en desarrollo" |
| **System/Admin Backups** | 🟡 Parcial | Admin backup trigger usa Prisma | Sí (metadata) | Depende implementación | Sí en admin | No auditado en detalle |

---

## 3. Compatibilidad multisector

| Panel | Usa SectorConfig | Usa useSectorConfig | Labels dinámicos | Hardcodeado a "other" | Clasificación |
|-------|------------------|---------------------|------------------|------------------------|---------------|
| **Dashboard principal** | No (path) | Sí | Sí (labels, features, dashboard.kpiOrder) | Ruta fija /dashboard/other | ✅ Listo |
| **Leads** | getSectorConfigByPath | Sí (en módulo) | Sí | Ruta fija | ✅ Listo |
| **Clients** (other) | getSectorConfigByPath | Sí (módulo + ClientSidePanel) | Sí | Ruta fija | ✅ Listo |
| **Clients** (dashboard) | getSectorConfigByPath | Sí (módulo) | Sí | Ruta /dashboard/clients | ✅ Listo |
| **Providers** (other + dashboard) | getSectorConfigByPath (dashboard) | Sí (módulo) | Sí | Rutas fijas | ✅ Listo |
| **Tasks** (/dashboard/tasks) | getSectorConfigByPath | Sí (módulo + componentes) | Sí | Ruta /dashboard/tasks | ✅ Listo |
| **Tasks** (other/tasks) | No | No | No | Sí | ❌ No compatible |
| **Sales** | No | Sí (página + componentes) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Finance** | No | Sí (página) | Sí (título, tabs) | Ruta other | ✅ Listo (solo labels) |
| **Billing** | No | Sí (página) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Integrations** | No | Sí (página) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Notifications** | No | Sí (página) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Analytics** | No | Sí (página) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Automations** | No | No | No | Títulos hardcodeados | ❌ No compatible |
| **AI Assistant** | No | Sí (página) | Sí | Ruta other | ✅ Listo (solo labels) |
| **Settings** | No | Sí (página) | Sí (secciones) | Ruta other | ✅ Listo (solo labels) |
| **Sidebar** | No | Sí | Sí (nav + títulos) | Rutas other | ✅ Listo |
| **System backups** | No | No | No | No revisado | ⚠️ Parcial |
| **Finanzas** (finanzas) | No | No | No | Sí | ❌ No compatible |

Nota: `getSectorConfigByPath` para rutas `/dashboard/other/*` devuelve siempre el sector `default` (no hay segmento de sector en la URL). La compatibilidad es de “labels por config”; el cambio efectivo de sector por ruta no está implementado.

---

## 4. Paneles faltantes o no vendibles

| Área | Estado | Comentario |
|------|--------|------------|
| **Finance real** | Existe API; UI no conectada | listTransactions/createTransaction con Prisma; pantalla usa solo mocks. No es “finance real” para el usuario. |
| **Reporting usable** | No existe | Analytics es 100 % mock. No hay reportes sobre datos reales. |
| **Automatizaciones** | Solo UI | Automations con mock; no hay motor de ejecución ni persistencia de flujos. |
| **Alertas** | No como panel | Alertas en Finance son mock; no hay sistema de alertas real. |
| **Analytics reales** | No existe | Métricas y gráficos desde mock; sin conexión a BD. |
| **Facturación funcional** | Parcial | Crear/enviar Hacienda pueden existir; listado y persistencia de facturas es mock. |
| **Integraciones funcionales** | No existe | Listado y estado de integraciones son mock; API con Prisma comentado. |
| **Notificaciones reales** | No existe | Lista estática en componente; sin API ni BD. |
| **Tareas en navegación** | Existe pero mal enlazado | La ruta real es `/dashboard/tasks`; el Sidebar apunta a `/dashboard/other/tasks` (mock). |

---

## 5. Dependencias y bloqueos

| Dependencia | Comentario |
|-------------|------------|
| **Reporting → Finance** | Un reporting real dependería de datos de transacciones; hoy Finance en UI no está conectado a esa API. |
| **Dashboard KPIs → Múltiples** | Los KPIs del dashboard son estáticos; para ser reales dependerían de Leads, Clients, Tasks, Sales, Finance. |
| **Automations → Events / Leads / Clients** | No hay capa de eventos ni persistencia de automatizaciones; no se puede “cerrar” un flujo real. |
| **Billing → Sales / Clients** | Facturación real dependería de ventas/clientes reales; Sales es mock y Billing listado es mock. |
| **AI Assistant → Leads / datos** | analyze usa mock; para ser útil debería consumir leads (y otros) reales. |
| **Paneles que no conviene tocar aún** | Automations (todo mock, sin SectorConfig). Finanzas (other/finanzas) es solo placeholder; duplicado de finance. |
| **Panel crítico mal enlazado** | Sidebar “Tareas” → `/dashboard/other/tasks` (mock). La implementación real está en `/dashboard/tasks` y no está en el menú. |

---

## 6. Checklist final

| Panel | Existe | Estado funcional | Multisector | Observación crítica |
|-------|--------|------------------|-------------|----------------------|
| Dashboard (raíz) | Sí | — | — | Redirect a other. |
| Dashboard principal | Sí | 🔴 | ✅ | Números fijos; no hay datos reales. |
| Leads | Sí | 🟢 | ✅ | Prisma + API; CRUD y filtros reales. |
| Clients | Sí (2 rutas) | 🟢 | ✅ | Ambas con Prisma; Sidebar usa other. |
| Providers | Sí (2 rutas) | 🟢 | ✅ | Ambas con Prisma; Sidebar usa other. |
| Tasks (dashboard/tasks) | Sí | 🟢 | ✅ | Prisma + server actions; **no en Sidebar**. |
| Tasks (other/tasks) | Sí | 🔴 | ❌ | Mock; **Sidebar apunta aquí**. |
| Sales | Sí | 🔴 | ✅ | Solo UI; estado en memoria. |
| Finance | Sí | 🟡 | ✅ | API real; UI 100 % mock. |
| Finanzas (alias) | Sí | 🔴 | ❌ | Placeholder “en desarrollo”. |
| Billing | Sí | 🔴 | ✅ | Listado mock; API create/send existen. |
| Integrations | Sí | 🔴 | ✅ | Todo mock; Prisma en API comentado. |
| Notifications | Sí | 🔴 | ✅ | Array estático; sin API. |
| Analytics | Sí | 🔴 | ✅ | Todo mock. |
| Automations | Sí | 🔴 | ❌ | Todo mock; sin SectorConfig. |
| AI Assistant | Sí | 🟡 | ✅ | APIs presentes; datos y componentes en mock. |
| Settings | Sí | 🟡 | ✅ | Labels desde config; lógica por subpanel no auditada. |
| System backups | Sí | 🟡 | ⚠️ | Visible PRO/Enterprise; no revisado a fondo. |
| Admin backups | Sí | 🟡 | — | Ruta admin; Prisma en trigger. |

---

## 7. Conclusión técnica

- **Estado real del producto (aprox.):** ~25–30 % del dashboard es funcional con datos reales: Leads, Clients, Providers, Tasks (solo la ruta `/dashboard/tasks`). El resto son pantallas con datos estáticos o mock, o APIs listas pero no usadas por la UI (Finance).
- **Partes listas:** CRUD y flujos reales en Leads, Clients, Providers y Tasks (en `/dashboard/tasks`). Multisector a nivel de labels en la mayoría de paneles bajo `other` y en Sidebar. Config de sectores existe y se usa donde se ha integrado.
- **Partes que son humo:** Dashboard principal (KPIs/charts estáticos). Sales, Billing listado, Integrations, Notifications, Analytics, Automations (todo mock o estático). Finance y AI Assistant: backend o APIs parciales pero UI desconectada o con mock. Ruta “Tareas” del menú lleva al panel mock, no al real.
- **Partes peligrosas de tocar ahora:** Cambiar rutas del Sidebar sin corregir el enlace de Tareas puede dejar a usuarios en el panel falso. Unificar Clients/Providers (dos rutas cada uno) o mezclar other/tasks con dashboard/tasks sin criterio claro puede romper flujos. Conectar Finance UI a la API real implica tocar muchos componentes que hoy dependen de mock; mismo riesgo si se quieren “datos reales” en Dashboard o Analytics sin una capa de datos definida.

Lenguaje directo: la base (Leads, Clients, Providers, Tasks en una ruta) y la configuración multisector están; la mayoría de las pantallas son presentación sin datos reales o con datos falsos. Para un SaaS vendible faltan, como mínimo: dashboard y reporting con datos reales, facturación y ventas (o al menos una de las dos) con persistencia, y corrección del enlace de Tareas en la navegación.
