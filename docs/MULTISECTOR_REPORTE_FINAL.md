# Reporte final — Adaptación multisector paneles dashboard

**Fecha:** 2026-02-04  
**Objetivo:** Dejar el SaaS preparado para escalar por sectores. Cambiar de sector = cambiar config.

---

## 1. Tabla resumen

| Panel | Estado real | Multisector | Observaciones |
|-------|-------------|-------------|----------------|
| **Dashboard** | 🟢 Funcional | ✅ Adaptado | KPIs, widgets, orden desde SectorConfig (ya estaba). |
| **Leads** | 🟢 Funcional | ✅ Adaptado | Página, filtros, sidebar, toasts desde config (ya estaba). |
| **Tasks** | 🟢 Funcional | ✅ Adaptado | Página en `/dashboard/tasks`, vistas y tipos desde config (ya estaba). |
| **Sales** | 🔴 UI only (mock) | ✅ Adaptado | Títulos, KPIs, tabla, modal, drawer desde `labels.sales`. Datos siguen en memoria. |
| **Finance** | 🟡 Parcial (API real, UI mock) | ✅ Adaptado | Título, subtítulo y pestañas desde `labels.finance`. KPIs/Transactions siguen con mock. |
| **Billing** | 🟡 Parcial (mock en API) | ✅ Adaptado | Título, subtítulo, botón, placeholder desde `labels.billing`. Listado desde mock. |
| **Integrations** | 🟡 Parcial | ✅ Adaptado | Título, subtítulo y pestañas desde `labels.integrations`. |
| **Notifications** | 🔴 UI only (array estático) | ✅ Adaptado | Título, subtítulo y botón desde `labels.notifications`. |
| **Analytics** | 🔴 UI only (mock) | ✅ Adaptado | Título y subtítulo desde `labels.analytics`. Datos desde mock. |
| **Settings** | 🟡 Parcial | ✅ Adaptado | Título, subtítulo y todas las secciones del menú desde `labels.settings`. |
| **AI Assistant** | 🟡 Parcial | ✅ Adaptado | Título, subtítulo y pestañas desde `labels.aiAssistant`. |
| **Sidebar** | — | ✅ Adaptado | Todos los ítems de navegación desde `labels.nav` (+ billing, analytics, integrations, notifications). |

---

## 2. Checklist accionable

### Listo para vender (estructura + datos reales)
- **Dashboard** — Responde a SectorConfig; datos según implementación actual.
- **Leads** — Completo con Prisma y labels por sector.
- **Tasks** — Completo con Prisma y labels por sector.
- **Providers / Clients** — Ya adaptados previamente.

### Listo a nivel de estructura (multisector), datos pendientes o mock
- **Sales** — Textos y estados por sector. Falta: API/BD para ventas.
- **Finance** — Textos y pestañas por sector. Falta: conectar KPIs y tabla a APIs existentes.
- **Billing** — Textos por sector. Falta: listado de facturas desde BD.
- **Integrations** — Textos por sector. Revisar si hay API real de conectores.
- **Notifications** — Textos por sector. Falta: fuente real de notificaciones.
- **Analytics** — Textos por sector. Falta: métricas reales.
- **Settings** — Textos por sector. Lógica por subpanel sin tocar.
- **AI Assistant** — Textos por sector. APIs de IA sin tocar.

### No tocado (por diseño)
- **Panel duplicado** `/dashboard/other/tasks` — Sigue siendo UI/mock; el funcional es `/dashboard/tasks`.
- **Lógica de negocio** — Sin refactor; solo sustitución de strings por config.
- **Base de datos** — Sin cambios.
- **Rutas** — Sin cambios; ninguna ruta eliminada ni duplicada activa nueva.

---

## 3. Riesgos detectados

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| Build actual | 🔴 | El build falla por **error preexistente**: `modules/leads/actions/index.ts` importa `./utils/openai` que no existe en ese módulo. **No introducido por esta adaptación.** |
| Finance: doble fuente de verdad | 🟡 | Existen `api/listTransactions.ts` (Prisma) y mocks en `FinanceKPIs` / `TransactionsTable`. La UI no usa la API. |
| Billing: listado mock | 🟡 | `api/listInvoices.ts` usa `mockInvoices`; no hay persistencia real de facturas en el listado. |
| Duplicidad Leads | 🟡 | Componentes en `app/dashboard/other/leads/components` y en `modules/leads/components`; reportado, no unificado. |
| Duplicidad TaskDialog | 🟡 | `modules/tasks/components/TaskDialog.tsx` y `components/tasks/TaskDialog.tsx` ambos en uso; reportado previamente. |
| Sector por ruta | 🟢 | `getSectorConfigByPath` devuelve siempre `default` para rutas `/dashboard/other/*` (no hay segmento de sector en la URL). Para multi-sector real habría que decidir si el sector viene por subdominio, query, o ruta. |

---

## 4. Recomendación clara

### Cerrar primero (máximo impacto, mínimo riesgo)
1. **Corregir el build:** Arreglar el import `./utils/openai` en `modules/leads/actions` (mover util o crear stub) para que el build pase.
2. **Finance:** Conectar `FinanceKPIs` y `TransactionsTable` a las APIs existentes (`listTransactions`, etc.) y quitar mocks para tener un panel financiero real por sector.

### No tocar aún
- Unificación de componentes duplicados (Leads, TaskDialog) hasta tener criterio de módulo único.
- Cambios de esquema de BD o nuevas tablas.
- Panel `other/tasks` (mock); mantener como está o ocultar en nav si solo se usa `/dashboard/tasks`.

### Cuándo meter features de verdad
- Cuando el build sea verde y al menos un flujo (p. ej. Finance con API real) esté validado.
- Añadir un sector nuevo: crear `config/sectors/<sector>.ts` con `PartialSectorConfig` y registrarlo en `config/sectors/index.ts`; no hace falta tocar código de paneles.

---

## 5. Configuración extendida (resumen)

- **`config/sectors/types.ts`**
  - `labels.nav`: añadidos `billing`, `analytics`, `integrations`, `notifications`.
  - `labels.sales`: `pageSubtitle`, `kpis`, `table`, `status`, `ui` (modal/drawer).
  - `labels.finance`: `pageSubtitle`, `tabs`.
  - `labels.billing`: nuevo bloque `title`, `pageSubtitle`, `newInvoice`, `searchPlaceholder`.
  - `labels.analytics`: `pageTitle`, `pageSubtitle`.
  - `labels.notifications`: nuevo bloque `title`, `pageSubtitle`, `markAllRead`.
  - `labels.integrations`: `pageSubtitle`, `tabs`.
  - `labels.settings`: `pageSubtitle`, `notifications`, `team`, `permissions`, `plans`, `usage`, `appearance`, `dangerZone`.
  - `labels.aiAssistant`: `pageSubtitle`, `tabs`.
  - `features.modules`: añadidos `billing`, `analytics`, `integrations`, `notifications`.

- **`config/sectors/default.ts`**
  - Mismos bloques rellenados con los textos actuales en español (comportamiento 100% backward compatible).

---

## 6. Conclusión

- **Estructura lista:** Todos los paneles listados consumen `useSectorConfig` para títulos, pestañas y textos de navegación; el Sidebar usa `labels.nav` y títulos de módulos.
- **Cambiar de sector = cambiar config:** Basta con definir/ajustar un sector en `config/sectors` y, cuando se use (p. ej. por ruta o contexto), la UI reflejará esos labels sin tocar código de paneles.
- **Próximo paso crítico:** Resolver el error de build en `modules/leads/actions` para dejar el proyecto en estado build verde; después, priorizar conexión de Finance (y opcionalmente Billing) a datos reales.
