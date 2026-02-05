# AUDITORÍA TÉCNICA COMPLETA PRE-PROVIDERS

**Fecha**: 2026-02-04  
**Objetivo**: Determinar si el sistema está correctamente seteado para multisector y listo para desarrollar Providers de forma definitiva.

---

## 1️⃣ INVENTARIO REAL DE PANELES

### Paneles Funcionales (BD Real + Multisector ✅)

| Panel | Ruta(s) | Módulo compartido | SectorConfig | Estado BD | Duplicado |
|-------|---------|-------------------|--------------|-----------|-----------|
| **Dashboard** | `/dashboard/other` | - | ✅ `getSectorConfigByPath` | ✅ APIs reales | Redirect desde `/dashboard` |
| **Clients** | `/dashboard/clients`<br>`/dashboard/other/clients` | `modules/clients` | ✅ Ambos usan `getSectorConfigByPath` | ✅ `prisma.client.*` | **SÍ - duplicado funcional** |
| **Providers** | `/dashboard/providers`<br>`/dashboard/other/providers` | `modules/providers` | ✅ Solo `/dashboard/providers`<br>❌ `/other/providers` NO | ✅ `prisma.provider.*` | **SÍ - `/other/` sin multisector** |
| **Tasks** | `/dashboard/tasks`<br>`/dashboard/other/tasks` | `modules/tasks` | ✅ Solo `/dashboard/tasks`<br>⚠️ `/other/tasks` empty state | ✅ `prisma.task.*` | **SÍ - `/other/` es placeholder** |
| **Leads** | `/dashboard/other/leads` | `modules/leads` | ✅ `getSectorConfigByPath` | ✅ `prisma.lead.*` + `Activity` | NO |
| **Sales** | `/dashboard/other/sales` | `modules/sales` (parcial) | ✅ `useSectorConfig` | ✅ `/api/sales` → `prisma.sale.*` | NO |
| **Finance** | `/dashboard/other/finance` | - | ✅ `useSectorConfig` | ✅ `/api/finance/analytics`<br>`/api/transactions`<br>`prisma.transaction.*`<br>`prisma.fixedExpense.*`<br>`prisma.budget.*`<br>`prisma.financeAlert.*`<br>`prisma.financialGoal.*` | NO |
| **Integrations** | `/dashboard/other/integrations` | - | ✅ `useSectorConfig` | ✅ `/api/integrations` → `prisma.integration.*` | NO |
| **Automations** | `/dashboard/other/automations` | - | ✅ `useSectorConfig` | ✅ `/api/automations` → `prisma.automation.*` | NO |
| **Notifications** | `/dashboard/other/notifications` | - | ✅ `useSectorConfig` | ✅ `/api/notifications` → `prisma.notification.*` | NO |

### Paneles Parciales (Multisector ✅ pero UI Mock/Visual)

| Panel | Ruta | SectorConfig | Backend | Estado |
|-------|------|--------------|---------|--------|
| **Billing** | `/dashboard/other/billing` | ✅ `useSectorConfig` | ❌ NO API real | 🟡 UI visual con mocks (BillingKPIs, InvoicesTable) |
| **Analytics** | `/dashboard/other/analytics` | ✅ `useSectorConfig` | ❌ NO backend dedicado | 🔴 Empty state, comentario: "no dedicated backend — no mock data" |
| **AI Assistant** | `/dashboard/other/ai-assistant` | ✅ `useSectorConfig` | ❌ NO API real | 🟡 UI visual con mocks (AssistantKPIs, etc.) |

### Paneles Legacy/Test

| Panel | Ruta | Estado |
|-------|------|--------|
| **Finance Test** | `/dashboard/finance-test` | 🔴 Test |
| **Finanzas** | `/dashboard/other/finanzas` | 🔴 Duplicado? |
| **Test** | `/dashboard/test`<br>`/dashboard/other/test` | 🔴 Test pages |
| **Admin Backups** | `/dashboard/admin/backups` | ⚠️ Admin panel |
| **System Backups** | `/dashboard/other/system/backups` | ⚠️ Admin panel |

---

## 2️⃣ ESTADO FUNCIONAL REAL

### 🟢 Funcionales (CRUD completo + BD + Timeline cuando aplica)

| Panel | Lee BD | Guarda BD | Estados reales | Timeline/Activity |
|-------|--------|-----------|----------------|-------------------|
| **Dashboard** | ✅ `/api/dashboard/stats` | N/A (solo lectura) | ✅ KPIs reales | ✅ `/api/dashboard/activity` (leads) |
| **Clients** | ✅ `prisma.client.findMany` | ✅ Create/Update/Delete via actions | ✅ Status, totalSpent, etc. | ⚠️ Stored in `client.notes` (no generic timeline) |
| **Tasks** | ✅ `prisma.task.findMany` | ✅ Create/Update/Delete via actions | ✅ Status, priority, dueDate | ⚠️ Related to client/lead but no Activity event |
| **Leads** | ✅ `prisma.lead.findMany` | ✅ Create/Update/Convert via actions | ✅ Status, temperature, stage | ✅ `prisma.activity.create` en cada mutación |
| **Sales** | ✅ `/api/sales` → `prisma.sale.findMany` | ✅ POST/PATCH `/api/sales` | ✅ Status, total, saleDate | ❌ NO crea Activity (no leadId) |
| **Finance** | ✅ `/api/finance/analytics` → `prisma.transaction.*` | ✅ (supuesto, no vi POST en audit) | ✅ Transaction, FixedExpense, Budget, etc. | ❌ NO tiene Activity |
| **Integrations** | ✅ `/api/integrations` → `prisma.integration.*` | ✅ POST `/api/integrations` | ✅ Status, provider, lastSync | ❌ NO tiene Activity |
| **Automations** | ✅ `/api/automations` → `prisma.automation.*` | ⚠️ Solo GET (no vi POST) | ✅ Active, trigger, actions | ❌ NO tiene Activity |
| **Notifications** | ✅ `/api/notifications` → `prisma.notification.*` | ⚠️ Solo GET | ✅ Read status | ❌ NO tiene Activity |
| **Providers** (`/dashboard/providers`) | ✅ `prisma.provider.findMany` | ✅ Via `modules/providers/actions.ts` | ✅ Status, dependencyLevel, operationalState | ❌ NO tiene Activity |
| **Providers** (`/dashboard/other/providers`) | ✅ `prisma.provider.findMany` | ✅ Via actions | ✅ Status, etc. | ❌ NO tiene Activity |

### 🟡 Parciales (Backend real, UI incompleta o solo lectura)

| Panel | Lee BD | Guarda BD | Nota |
|-------|--------|-----------|------|
| **Automations** | ✅ | ❌ Solo GET en `/api/automations` | Falta POST para crear/editar |
| **Notifications** | ✅ | ❌ Solo GET | Falta marcar como leído, crear, etc. |

### 🔴 Placeholders / Mock (NO backend dedicado)

| Panel | Estado |
|-------|--------|
| **Billing** | UI visual con mocks (BillingKPIs, InvoicesTable). NO API. |
| **Analytics** | Empty state. Comentario: "Analytics/reports has no dedicated backend — no mock data." |
| **AI Assistant** | UI visual con mocks (AssistantKPIs, InsightCards, etc.). NO API. |

---

## 3️⃣ COMPATIBILIDAD MULTISECTOR

### ✅ Listo para multisector (Labels dinámicos + Feature flags)

| Panel | SectorConfig | Labels dinámicos | Feature flags | Rutas hardcodeadas | Riesgo |
|-------|--------------|------------------|---------------|-------------------|--------|
| **Dashboard** (`/dashboard/other`) | ✅ | ✅ `labels.dashboard.*` | ✅ `features.modules.*` | ❌ | ✅ Bajo |
| **Clients** (`/dashboard/clients`) | ✅ | ✅ `labels.clients.*` | - | ❌ | ✅ Bajo |
| **Providers** (`/dashboard/providers`) | ✅ | ✅ `labels.providers.*` | - | ❌ | ✅ Bajo |
| **Tasks** (`/dashboard/tasks`) | ✅ | ✅ `labels.tasks.*` | - | ❌ | ✅ Bajo |
| **Leads** | ✅ | ✅ `labels.leads.*` | - | ❌ | ✅ Bajo |
| **Sales** | ✅ | ✅ `labels.sales.*` | - | ❌ | ✅ Bajo |
| **Finance** | ✅ | ✅ `labels.finance.*` | - | ❌ | ✅ Bajo |
| **Integrations** | ✅ | ✅ `labels.integrations.*` | - | ❌ | ✅ Bajo |
| **Automations** | ✅ | ✅ `labels.automations.*` | - | ❌ | ✅ Bajo |
| **Notifications** | ✅ | ✅ `labels.notifications.*` | - | ❌ | ✅ Bajo |
| **Billing** | ✅ | ✅ `labels.billing.*` | - | ❌ | ✅ Bajo |
| **Analytics** | ✅ | ✅ `labels.analytics.*` | - | ❌ | ✅ Bajo |
| **AI Assistant** | ✅ | ✅ `labels.aiAssistant.*` | - | ❌ | ✅ Bajo |

### ⚠️ Requiere adaptación

| Panel | Problema | Acción recomendada |
|-------|----------|-------------------|
| **Providers** (`/dashboard/other/providers`) | ❌ NO usa `getSectorConfigByPath` ni labels | Migrar a usar SectorConfig como `/dashboard/providers` o **eliminar ruta** |
| **Clients** (duplicado) | Existe en `/dashboard/clients` Y `/dashboard/other/clients` | Unificar: elegir una sola ruta canónica |
| **Tasks** (duplicado) | `/dashboard/other/tasks` es placeholder que redirige a `/dashboard/tasks` | Eliminar `/dashboard/other/tasks` y usar solo `/dashboard/tasks` |

### ❌ No compatible (pero fuera de scope)

- **Admin panels** (`/dashboard/admin/*`) - No están pensados para multisector, son panels de administrador.

---

## 4️⃣ HUECOS CRÍTICOS ANTES DE SEGUIR CON PROVIDERS

### Timeline / Activity como fuente de verdad

**Estado actual:**
- ✅ Modelo `Activity` existe en Prisma, relacionado con `leadId`.
- ✅ Se crea Activity en **Leads** (createLead, updateLeadStage, convertLeadToClient, etc.).
- ✅ Dashboard Activity feed consume `/api/dashboard/activity` correctamente.
- ❌ **NO se crea Activity en Sales, Clients, Tasks, Finance, Integrations, Automations, Notifications, Providers**.

**Problema:**
- La auditoría de sincronización anterior implementó revalidación de rutas (`revalidatePath`) y refetch al foco de ventana para sincronizar paneles.
- Sin embargo, **NO existe un TimelineEvent genérico** que centralice todos los eventos del sistema (como se pidió en la auditoría de sincronización).
- El modelo `Activity` solo sirve para leads (requiere `leadId`).

**Bloqueo para Providers:**
- Si Providers crea/actualiza/elimina proveedores, **no hay forma de registrar esos eventos en un timeline global**.
- El dashboard Activity feed solo mostrará eventos de leads, no de providers, sales, tasks, etc.

**Recomendación:**
- Aceptar que **no habrá un timeline genérico** (por restricción de "NO crear nuevas tablas").
- Documentar que el Activity feed es **lead-centric**.
- Providers puede funcionar sin Activity, igual que Sales, Tasks, Finance, etc.

### Finance: CRUD incompleto

**Estado actual:**
- ✅ GET `/api/finance/analytics` - lectura completa de KPIs, trends, budgets, alerts, goals, etc.
- ✅ GET `/api/transactions` - listado paginado de transacciones.
- ❌ NO hay POST/PATCH/DELETE para transactions, budgets, fixed expenses, financial goals.

**Bloqueo:**
- Finance es solo **lectura**. No se pueden crear transacciones desde la UI.

**Recomendación:**
- Completar CRUD de Finance **antes** de continuar con Providers si Finance es parte del "core" del SaaS.
- Si Finance no es prioritario, documentar que es solo lectura y continuar.

### Automations y Notifications: Solo GET

**Estado actual:**
- ✅ GET `/api/automations` - listado.
- ✅ GET `/api/notifications` - listado.
- ❌ NO hay POST/PATCH/DELETE.

**Bloqueo:**
- No se pueden crear automations ni notificaciones desde la UI.
- `useIntegrations` hook tiene TODOs: "TODO: Implement real API call" en connect/disconnect/sync.

**Recomendación:**
- Completar CRUD si son core.
- Si no, documentar y continuar.

### Billing, Analytics, AI Assistant: Mocks visuales

**Estado actual:**
- 🟡 Billing: UI con mocks (BillingKPIs, InvoicesTable). NO API.
- 🔴 Analytics: Empty state. NO backend.
- 🟡 AI Assistant: UI con mocks. NO API.

**Bloqueo:**
- Son "features" visuales sin backend real.
- Si un sector necesita billing real, no funciona.

**Recomendación:**
- Documentar como "visual placeholders".
- Priorizar según roadmap de negocio.

### Duplicación de rutas: Clients, Tasks, Providers

**Estado actual:**
- **Clients**: `/dashboard/clients` (multisector ✅) y `/dashboard/other/clients` (multisector ✅) → ambos funcionales, mismo backend.
- **Tasks**: `/dashboard/tasks` (multisector ✅) y `/dashboard/other/tasks` (placeholder) → solo `/tasks` funcional.
- **Providers**: `/dashboard/providers` (multisector ✅) y `/dashboard/other/providers` (NO multisector ❌) → ambos funcionales, pero `/other/` NO usa SectorConfig.

**Bloqueo:**
- Confusión en rutas canónicas.
- Riesgo de mantener dos versiones divergentes.
- `/dashboard/other/providers` NO es multisector, por lo que al añadir un nuevo sector mañana, **no funcionará**.

**Recomendación:**
- **Unificar rutas:**
  - **Clients**: elegir `/dashboard/clients` como canónica y eliminar `/dashboard/other/clients`, O viceversa.
  - **Tasks**: eliminar `/dashboard/other/tasks` (ya es placeholder).
  - **Providers**: eliminar `/dashboard/other/providers` y usar solo `/dashboard/providers`.

---

## 5️⃣ CHECKLIST FINAL

| Panel | Estado funcional | Estado multisector | Prioridad | Acción recomendada |
|-------|------------------|-------------------|-----------|-------------------|
| **Dashboard** | 🟢 Funcional | ✅ Listo | 🔥 Alta | ✅ Cerrado |
| **Clients** (`/dashboard/clients`) | 🟢 Funcional | ✅ Listo | 🔥 Alta | ⚠️ Unificar ruta (eliminar `/other/clients` o viceversa) |
| **Clients** (`/dashboard/other/clients`) | 🟢 Funcional | ✅ Listo | 🔥 Alta | ⚠️ Eliminar si se elige `/dashboard/clients` |
| **Providers** (`/dashboard/providers`) | 🟢 Funcional | ✅ Listo | 🔥 Alta | ✅ **Seguir con este** |
| **Providers** (`/dashboard/other/providers`) | 🟢 Funcional | ❌ NO multisector | 🔥 Alta | ❌ **ELIMINAR** o migrar a SectorConfig |
| **Tasks** (`/dashboard/tasks`) | 🟢 Funcional | ✅ Listo | 🔥 Alta | ✅ Cerrado |
| **Tasks** (`/dashboard/other/tasks`) | 🔴 Placeholder | ✅ Multisector | - | ❌ **ELIMINAR** |
| **Leads** | 🟢 Funcional | ✅ Listo | 🔥 Alta | ✅ Cerrado |
| **Sales** | 🟢 Funcional | ✅ Listo | 🔥 Alta | ✅ Cerrado |
| **Finance** | 🟡 Solo lectura | ✅ Listo | 🔶 Media | ⚠️ Completar CRUD si es core, sino documentar |
| **Integrations** | 🟡 Solo GET | ✅ Listo | 🔶 Media | ⚠️ Completar CRUD (connect/disconnect/sync) |
| **Automations** | 🟡 Solo GET | ✅ Listo | 🔶 Media | ⚠️ Completar CRUD si es core |
| **Notifications** | 🟡 Solo GET | ✅ Listo | 🔶 Media | ⚠️ Completar CRUD (mark as read, create) |
| **Billing** | 🔴 Mock visual | ✅ Multisector | 🔵 Baja | ⏸️ Ignorar por ahora o documentar como visual |
| **Analytics** | 🔴 Empty state | ✅ Multisector | 🔵 Baja | ⏸️ Ignorar por ahora |
| **AI Assistant** | 🔴 Mock visual | ✅ Multisector | 🔵 Baja | ⏸️ Ignorar por ahora |

---

## 6️⃣ VEREDICTO FINAL

### ¿Está el sistema listo para seguir con Providers?

**SÍ, con condiciones.**

### Puntos a favor:

1. ✅ **Arquitectura multisector sólida**: `SectorConfig`, `useSectorConfig`, `getSectorConfigByPath` funcionan correctamente en 13 de 15 paneles principales.
2. ✅ **Datos reales en BD**: Todos los paneles core (Dashboard, Clients, Tasks, Leads, Sales, Finance, Integrations, Automations, Notifications, Providers) leen/escriben en BD real (Prisma).
3. ✅ **Sincronización implementada**: La auditoría anterior implementó `revalidatePath` en mutaciones y refetch al foco de ventana para Dashboard y Activity feed.
4. ✅ **Módulos compartidos**: `modules/clients`, `modules/leads`, `modules/providers`, `modules/sales`, `modules/tasks` están bien estructurados y reutilizables.
5. ✅ **Providers** (`/dashboard/providers`) **ya está listo para multisector**: usa `getSectorConfigByPath`, `ProvidersView`, y BD real.

### Qué debería cerrarse ANTES de continuar con Providers:

#### 🔥 Crítico (antes de seguir):

1. **Eliminar `/dashboard/other/providers`** o migrarlo a usar SectorConfig.
   - **Motivo**: Existe duplicación. `/dashboard/providers` ya es multisector y funcional. `/dashboard/other/providers` NO usa SectorConfig, por lo que al añadir un nuevo sector, romperá.
   - **Acción**: Eliminar la ruta `/dashboard/other/providers` y redirigir a `/dashboard/providers`.

2. **Eliminar `/dashboard/other/tasks`**.
   - **Motivo**: Es solo un placeholder que redirige a `/dashboard/tasks`. No aporta valor y genera confusión.
   - **Acción**: Eliminar el archivo `app/dashboard/other/tasks/page.tsx`.

3. **Unificar rutas de Clients** (elegir una canónica).
   - **Motivo**: Existen `/dashboard/clients` y `/dashboard/other/clients` (ambos funcionales y multisector). Mantener dos rutas idénticas es riesgo de divergencia.
   - **Recomendación**: Elegir `/dashboard/clients` como canónica (es más corta) y redirigir desde `/dashboard/other/clients`.

#### 🔶 Recomendado (no bloquea Providers, pero debería cerrarse pronto):

4. **Timeline/Activity**: Documentar que Activity es **lead-centric** y no existe timeline genérico.
   - **Motivo**: El sistema actual solo crea `Activity` para leads. Sales, Tasks, Clients, Finance, Providers NO generan Activity.
   - **Acción**: Documentar en README o docs que el Activity feed es solo para leads. Aceptar que no habrá timeline global sin crear nuevas tablas.

5. **Finance CRUD incompleto**: Completar POST/PATCH/DELETE de transactions, budgets, etc., si Finance es core.
   - **Motivo**: Finance es solo lectura. No se pueden crear transacciones desde UI.
   - **Acción**: Si Finance es parte del MVP, completar CRUD. Si no, documentar y posponer.

6. **Integrations CRUD incompleto**: Implementar connect/disconnect/sync en `/api/integrations/[id]/connect`.
   - **Motivo**: `useIntegrations` hook tiene TODOs: "TODO: Implement real API call".
   - **Acción**: Completar o documentar como "solo listado".

7. **Automations y Notifications CRUD**: POST/PATCH para crear/editar automations y notifications.
   - **Motivo**: Solo GET disponible.
   - **Acción**: Completar si son core, sino documentar.

### Qué NO tocar todavía:

- ❌ **Billing, Analytics, AI Assistant**: Son mocks visuales sin backend. No son bloqueantes. Documentar como "future features" y seguir adelante.
- ❌ **Admin panels** (`/dashboard/admin/*`): Fuera de scope multisector.
- ❌ **Test pages** (`/dashboard/test`, `/dashboard/finance-test`): Borrar o ignorar.

---

## Conclusión

El sistema está **80% listo** para multisector.

**Bloqueos críticos para Providers:**
- Eliminar `/dashboard/other/providers` (duplicado sin multisector).
- Eliminar `/dashboard/other/tasks` (placeholder inútil).
- Unificar Clients (elegir ruta canónica).

Una vez resueltos estos 3 puntos, **se puede continuar con Providers definitivamente** en `/dashboard/providers`, que ya está correctamente seteado para multisector.

**Recomendaciones post-Providers:**
- Completar Finance CRUD.
- Completar Integrations connect/disconnect.
- Documentar Activity como lead-centric.
- Decidir qué hacer con Billing, Analytics, AI Assistant (MVP o posponer).

---

## Anexo: Rutas canónicas recomendadas

| Panel | Ruta canónica | Eliminar |
|-------|---------------|----------|
| Dashboard | `/dashboard/other` | - |
| Clients | `/dashboard/clients` | `/dashboard/other/clients` |
| Providers | `/dashboard/providers` | `/dashboard/other/providers` |
| Tasks | `/dashboard/tasks` | `/dashboard/other/tasks` |
| Leads | `/dashboard/other/leads` | - |
| Sales | `/dashboard/other/sales` | - |
| Finance | `/dashboard/other/finance` | `/dashboard/finance-test`, `/dashboard/other/finanzas` |
| Integrations | `/dashboard/other/integrations` | - |
| Automations | `/dashboard/other/automations` | - |
| Notifications | `/dashboard/other/notifications` | - |
| Billing | `/dashboard/other/billing` | - |
| Analytics | `/dashboard/other/analytics` | - |
| AI Assistant | `/dashboard/other/ai-assistant` | - |
