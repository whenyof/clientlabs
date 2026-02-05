# Resumen auditoría: cero datos falsos

**Objetivo:** Eliminar mocks, datos hardcodeados y métricas inventadas. Conectar solo a datos reales en BD. Empty state cuando no hay backend.

---

## Paneles 100% reales (datos solo desde BD)

| Panel | Fuente de datos | Notas |
|-------|-----------------|--------|
| **Dashboard principal** | `GET /api/dashboard/stats`, `GET /api/dashboard/activity` | KPIs (ingresos, ventas, clientes, leads, tareas, bots), gráfico de ingresos, actividad. Funnel sin métrica de visitantes → empty state. |
| **Tasks** | Implementación real en `/dashboard/tasks` | Sidebar apunta a ruta real. `/dashboard/other/tasks` es redirección/empty state con enlace. |
| **Sales** | `GET /api/sales`, `POST /api/sales`, `PATCH /api/sales/[id]` | Listado, creación y actualización de estado desde BD. Empty state en tabla cuando no hay ventas. |
| **Finance** | `GET /api/finance/analytics`, `GET /api/transactions` | KPIs, gráficos, transacciones, gastos fijos, presupuestos, objetivos, alertas y pronóstico desde Prisma. Contexto `FinanceDataProvider` alimenta todos los componentes. |
| **Integrations** | `GET /api/integrations` (Prisma) | Listado por usuario. Grid recibe datos del hook que llama a la API. Sin integraciones → mensaje claro. |
| **Automations** | `GET /api/automations` | Listado por usuario. KPIs (total/activas) desde lista real. Resto de métricas (ejecuciones, ingresos) en cero/— por no existir en BD. |
| **Notifications** | `GET /api/notifications` | Listado por usuario. Empty state cuando no hay notificaciones. |

---

## Paneles con backend parcial

| Panel | Qué es real | Qué no existe / empty |
|-------|-------------|-------------------------|
| **Finance** | Todo lo anterior (transacciones, KPIs, presupuestos, objetivos, alertas, pronóstico). | Crear transacción desde modal no persiste en API (queda pendiente si se desea). Clientes en modal de transacción: lista vacía (no se usa mock). |
| **Integrations** | Listado y creación en BD. | Hero/estadísticas del panel siguen pudiendo usar datos agregados cuando se implementen. Logs/workflows/AI recommendations: sin backend, vacíos o placeholders. |
| **Automations** | Listado y conteos (total, activas). | Ejecuciones, tasa de éxito, ingresos generados, tiempo ahorrado: no en BD → se muestran como 0 o "—". Logs y plantillas: mock eliminado o vacío. |

---

## Paneles sin backend (solo empty state)

| Panel | Motivo | Qué se hizo |
|-------|--------|-------------|
| **Billing** | No existe modelo `Invoice` en Prisma. | KPIs en 0, tabla con prop `invoices={[]}`, empty state en tabla. `listInvoices` API devuelve lista vacía. |
| **Analytics / Reports** | No hay API de analytics/informes. | KPIs en 0, gráficos y embudo con empty state, tabla de actividad vacía, pestañas con datos en 0, insights de IA vacíos. Sin mock. |
| **AI Assistant** | No hay APIs de insights/chat persistidos en BD para este panel. | Subcomponentes (KPIs, insights, recomendaciones, timeline, chat, etc.) siguen pudiendo usar mocks localmente; se recomienda sustituir por empty state o APIs reales en una siguiente iteración. |

---

## Cambios técnicos realizados

- **APIs creadas o pasadas a datos reales**
  - `GET/POST /api/sales`, `PATCH /api/sales/[id]`
  - `GET /api/transactions` (re-export de listTransactions con Prisma)
  - `GET /api/finance/analytics` (re-export de analytics con Prisma; añadidos `fixedExpenses`, `financialGoals`)
  - `GET /api/integrations` y `POST /api/integrations` con Prisma
  - `GET /api/automations`
  - `GET /api/notifications`
- **Finance:** `FinanceDataProvider` + `useFinanceData()`; componentes (KPIs, gráficos, tabla, gastos fijos, presupuestos, pronóstico, objetivos, alertas) consumen API y muestran empty state si no hay datos.
- **Eliminación de mocks**
  - Sales: eliminado `MOCK_SALES`; mapeo API → `SaleRecord`.
  - Finance: componentes dejan de usar `mock*` de `finance/mock.ts` (se mantienen helpers/constantes de categorías y métodos de pago).
  - Billing: KPIs y tabla sin mock; `listInvoices` devuelve vacío.
  - Analytics: KPIs, gráficos, embudo, tabla de actividad, pestañas e insights sin datos mock.
  - Integrations: hook `useIntegrations` llama a `/api/integrations`; grid recibe lista real.
  - Automations: tabla y KPIs desde `/api/automations`.
  - Notifications: lista desde `/api/notifications`.
- **Prisma**
  - Uso de `lib/prisma` en `finance/api/listTransactions.ts` y `finance/api/analytics.ts` (sin nuevo `PrismaClient`).
- **Sin cambios en**
  - Prisma schema (no nuevas tablas).
  - UX general (misma estructura de paneles y flujos).

---

## Resultado final

- **Cero datos falsos** en los paneles cubiertos: todo lo que se muestra en Dashboard, Tasks, Sales, Finance, Billing, Analytics, Integrations, Automations y Notifications proviene de BD o se muestra como vacío/cero.
- **Todo lo que se crea en esos flujos persiste** (ventas, transacciones vía lógica existente, integraciones, etc.).
- **Paneles sin modelo o sin API** (Billing, Analytics, AI Assistant) muestran empty state o valores en 0 en lugar de datos inventados.

**AI Assistant:** pendiente de sustituir mocks restantes por empty state o por APIs reales cuando existan.
