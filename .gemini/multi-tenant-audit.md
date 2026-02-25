# 🔐 Auditoría Multi-Tenant — ClientLabs
**Fecha:** 2026-02-15
**Auditor:** Antigravity (análisis estático completo del código fuente)

---

## 1️⃣ MODELO DE DATOS (Prisma)

### ¿Existe `companyId`?
**NO.** No existe ningún campo `companyId`, `organizationId`, ni `tenantId` en todo el schema de Prisma (2087 líneas). La búsqueda de estos campos devuelve **cero resultados**.

### ¿De qué dependen las entidades?
**TODAS dependen exclusivamente de `userId`.**

| Entidad | FK de aislamiento | ¿companyId? |
|---|---|---|
| Client | `userId` → User | ❌ |
| Lead | `userId` → User | ❌ |
| Sale | `userId` → User | ❌ |
| Invoice | `userId` → User | ❌ |
| BillingInvoice | `userId` → User | ❌ |
| Task | `userId` → User | ❌ |
| Provider | `userId` → User | ❌ |
| Transaction | `userId` → User | ❌ |
| FinancialRecord | `userId` → User | ❌ |
| CalendarEvent | `userId` → User | ❌ |
| Notification | `userId` → User | ❌ |
| Automation | `userId` → User | ❌ |
| Integration | `userId` → User | ❌ |
| Website | `userId` → User | ❌ |
| PipelineStage | `userId` → User | ❌ |
| *Metrics (Restaurant, Gym, etc.)* | `userId` → User | ❌ |
| AIInsight / AiLog / AiInsight | `userId` → User | ❌ |
| ProviderOrder / Payment / Task / Note | `userId` → User | ❌ |

### Relaciones obligatorias empresa-entidad
**No hay modelo Company/Organization.** Las relaciones existentes son:
- `User → Client[]` (1:N, onDelete: Cascade)
- `User → Lead[]` (1:N, onDelete: Cascade)
- `User → Invoice[]` (1:N, onDelete: Cascade)
- `User → Sale[]` (1:N, onDelete: Cascade)

Todo es **User-centric**, no **Company-centric**.

### Índices compuestos
**No existen** índices tipo `(companyId, createdAt)` porque no hay `companyId`. Los índices existentes son simples:
- `@@index([userId])` en todas las tablas
- `@@unique([userId, saleId])` en Invoice
- `@@unique([userId, order])` en PipelineStage
- `@@unique([userId, month, year])` en MonthlyGoal

### TeamMember
Existe el modelo `TeamMember`, pero es **solo UI local** (hardcoded state en el componente React, no hay API real ni queries Prisma para equipo). No conecta usuarios a una organización compartida.

---

## 2️⃣ REPOSITORIOS Y SERVICIOS

### ¿Las queries incluyen `where: { userId }`?

**SÍ, en la mayoría de los casos.** El patrón dominante es:

```typescript
// Patrón correcto (consistente en todo el sistema)
const sale = await prisma.sale.findFirst({
  where: { id, userId: session.user.id },
})
```

- **Repositorios** (`invoice.repository.ts`, `analytics.repository.ts`): ✅ `userId` siempre presente
- **Servicios** (`invoice.service.ts`, `analytics.service.ts`, `billing-kpis.service.ts`): ✅ Reciben `userId` como parámetro
- **Server Actions** (`leads/actions.ts`, `clients/actions.ts`, `tasks/actions.ts`, `providers/actions.ts`, `sales.actions.ts`): ✅ Todas verifican `session.user.id`
- **API Routes** (`invoicing/route.ts`, `sales/route.ts`, `leads/route.ts`): ✅ Todas verifican sesión + filtran por `userId`

### ¿Hay queries que solo filtran por `id` SIN `userId`?

**Sí, hay excepciones CRÍTICAS:**

#### ⚠️ InvoicePayment.findFirst (parcial)
```typescript
// invoice.service.ts → attachInvoiceToPayment()
const payment = await prisma.invoicePayment.findFirst({
  where: { id: invoicePaymentId },  // ← SIN userId
  include: { Invoice: { select: { userId: true } } },
})
if (!payment || payment.Invoice.userId !== userId) return false  // ← Check posterior
```
**Riesgo:** BAJO. Hay validación posterior, pero el patrón es más frágil.

#### ⚠️ Admin route sin aislamiento (correcto por diseño)
```typescript
// /api/admin/users/[id]/route.ts
where: { id: params.id }  // Busca cualquier usuario
```
**Riesgo:** BAJO. Protegido por verificación de rol ADMIN desde DB.

### Endpoints sin validación de empresa
**No aplica** — no existe concepto de empresa. Todos validan `userId`, que es el nivel unitario de aislamiento actual.

### 🚨 ENDPOINTS CON AUTH COMENTADO
```typescript
// /api/settings/customer-portal/route.ts
// TODO: Add session validation
// const session = await getServerSession()  ← COMENTADO
const customerId = 'cus_mock_customer_id'  // ← HARDCODEADO
```

```typescript
// /api/settings/create-checkout/route.ts
// TODO: Add session validation  ← COMENTADO
const userEmail = 'user@example.com'  // ← MOCK
const userId = 'user_123'
```
**RIESGO: CRÍTICO.** Cualquier petición POST a estos endpoints crea sesiones Stripe sin autenticación.

### 🚨 CRON SIN AISLAMIENTO POR USUARIO
```typescript
// modules/billing/services/reminder-engine.service.ts
const invoices = await prisma.billingInvoice.findMany({
  where: { status: { not: "CANCELLED" } },  // ← TODOS los usuarios
})
```
**Riesgo:** BAJO. Es un cron que procesa TODAS las facturas de todos los usuarios (by design). No es una vulnerabilidad de acceso cruzado.

### 🔸 `getServerSession()` sin `authOptions`
Múltiples routes usan `getServerSession()` sin pasar `authOptions`:
- `/api/notifications/route.ts`
- `/api/automations/route.ts`
- `/api/scoring/recalculate/route.ts`
- `/api/finance/movements/route.ts`
- `/api/leads/route.ts`
- `/api/sales/route.ts`
- `/api/dashboard/stats/route.ts`
- `/api/integrations/route.ts`

**Riesgo:** MEDIO. Sin `authOptions`, NextAuth puede no inyectar los campos personalizados (role, plan). En la práctica funciona porque se extrae solo `session.user.id`, pero el token JWT podría no tener los campos extendidos.

---

## 3️⃣ SISTEMA DE SESIÓN (NextAuth)

### ¿La sesión contiene `companyId`?
**NO.** La sesión solo contiene:
```typescript
interface Session {
  user?: {
    id: string
    role?: "USER" | "ADMIN"
    plan?: "FREE" | "PRO" | "ENTERPRISE"
    onboardingCompleted?: boolean
    selectedSector?: string | null
  }
}
```

### ¿Se valida en backend?
- **Sí**, `session.user.id` se usa en TODAS las queries de datos
- **No** hay `companyId` que validar
- El middleware solo verifica autenticación (tiene token) y rol ADMIN

### ¿El JWT incluye información de empresa?
**NO.** El JWT contiene:
```typescript
interface JWT {
  userId?: string
  role?: "USER" | "ADMIN"
  plan?: "FREE" | "PRO" | "ENTERPRISE"
  onboardingCompleted?: boolean
  selectedSector?: string | null
}
```

### ¿Riesgo de manipulación manual de IDs en rutas?
**BAJO para el modelo actual.** Los endpoints que reciben `params.id` (ej: `/api/invoicing/[id]`) siempre verifican que el recurso pertenezca a `session.user.id`:
```typescript
const invoice = await invoiceService.getInvoice(id, session.user.id)
// → repo.findById(id, userId) → where: { id, userId }
```

Un usuario no puede acceder a recursos de otro usuario manipulando el ID en la URL.

---

## 4️⃣ NIVEL REAL DE MULTI-TENANT

### 🟡 Nivel 1 — Multiusuario pero NO multiempresa real

**Justificación:**
- ✅ Cada usuario tiene sus propios datos aislados por `userId`
- ✅ No hay acceso cruzado entre usuarios distintos
- ❌ **No existe concepto de "empresa" ni "organización"**
- ❌ No hay Company/Organization model
- ❌ No hay `companyId` en ninguna tabla
- ❌ No hay roles dentro de empresa (owner, admin, member)
- ❌ No hay datos compartidos entre usuarios de la misma organización
- ❌ TeamMember es solo UI (hardcoded)
- ❌ Un "equipo" no puede ver los mismos clientes/ventas/facturas

**Modelo actual: 1 usuario = 1 tenant.** Cada cuenta es completamente independiente.

---

## 5️⃣ RIESGOS DETECTADOS

### 🔴 CRÍTICOS

| # | Riesgo | Ubicación | Impacto |
|---|---|---|---|
| C1 | **Auth comentado en endpoints Stripe** | `settings/customer-portal/route.ts`, `settings/create-checkout/route.ts` | Cualquier request POST crea sesiones de pago sin autenticación |
| C2 | **Sin modelo Company** | `prisma/schema.prisma` | Imposible tener equipos que compartan datos. Cada usuario es un silo total |

### 🟠 ALTOS

| # | Riesgo | Ubicación | Impacto |
|---|---|---|---|
| A1 | **`getServerSession()` sin `authOptions`** | 12+ API routes | Podría no inyectar campos custom del JWT (role, plan) |
| A2 | **Stripe webhook sin firma** | `webhooks/stripe/route.ts` (TODO en código) | Cualquier POST externo es aceptado como válido |
| A3 | **PrismaClient nuevo en api/leads** | `api/leads/route.ts` (línea 5) | Crea nueva conexión por request en vez de usar singleton |

### 🟡 MEDIOS

| # | Riesgo | Ubicación | Impacto |
|---|---|---|---|
| M1 | **Cron reminders procesa TODO** | `reminder-engine.service.ts` | By design, pero sin rate limiting |
| M2 | **No hay RLS (Row Level Security)** | PostgreSQL | Depende 100% de la app para filtrar userId |
| M3 | **No hay índice compuesto (userId, createdAt)** | Schema general | Queries que filtran por userId + fecha no usan índice óptimo |

### 🟢 BAJOS

| # | Riesgo | Ubicación |
|---|---|---|
| B1 | `InvoicePayment.findFirst` sin userId directo (validación posterior) | `invoice.service.ts` |
| B2 | TeamMember es solo UI mockeada | `settings/components/TeamMembers.tsx` |

---

## 6️⃣ RECOMENDACIÓN TÉCNICA

### ¿Está listo para escalar como SaaS?

**SÍ, como SaaS single-user (1 usuario = 1 cuenta).** Es funcional y seguro en ese modelo.

**NO, como SaaS multiempresa.** No admite equipos que compartan datos.

### ¿Necesita refactor?

**Depende del objetivo:**

| Objetivo | ¿Refactor? | Esfuerzo |
|---|---|---|
| SaaS donde cada cuenta es individual (freelancers, autónomos) | NO | Ya funciona |
| SaaS con equipos que comparten datos | SÍ, REFACTOR MAYOR | Alto (semanas) |
| SaaS enterprise multi-tenant | SÍ, REFACTOR COMPLETO | Muy alto (meses) |

### Cambios mínimos para llegar a Nivel 4 (multiempresa profesional)

#### Fase 0: Fixes urgentes (< 1 día)
1. **Descomentar auth en endpoints Stripe** (`customer-portal`, `create-checkout`)
2. **Corregir `getServerSession()` sin `authOptions`** en las 12+ routes
3. **Validar firma Stripe webhook** con `stripe.webhooks.constructEvent()`
4. **Eliminar `new PrismaClient()`** en `api/leads/route.ts`

#### Fase 1: Modelo Company (1-2 semanas)
1. Crear modelo `Organization` con `id`, `name`, `slug`, `createdAt`
2. Crear modelo `OrganizationMember` con `userId`, `organizationId`, `role` (OWNER, ADMIN, MEMBER)
3. Agregar `organizationId` a **todas** las tablas principales (Client, Lead, Sale, Invoice, etc.)
4. Migración de datos: crear Organization por cada User existente

#### Fase 2: Aislamiento (1-2 semanas)
1. Extender sesión/JWT con `organizationId`
2. Crear middleware/helper `getOrgId()` que extrae de sesión
3. Reemplazar `userId` por `organizationId` en TODAS las queries de datos
4. Mantener `userId` para audit trail (quién hizo qué)
5. Crear índices compuestos `(organizationId, status)`, `(organizationId, createdAt)`, etc.

#### Fase 3: Hard isolation (1 semana)
1. Implementar Row Level Security (RLS) en PostgreSQL
2. `ALTER TABLE client ENABLE ROW LEVEL SECURITY;`
3. Policy: `USING (organization_id = current_setting('app.current_org_id'))`
4. Configurar Prisma para setear `SET app.current_org_id` por request

#### Fase 4: Equipo y permisos (2+ semanas)
1. Implementar invitaciones
2. Implementar roles dentro de organización
3. Implementar permisos granulares (quién puede ver qué)
4. Vista compartida de datos

---

**CONCLUSIÓN:** El sistema actual es **seguro a nivel de usuario individual** — no hay fugas de datos entre usuarios. Pero **no es multi-tenant real** porque no existe el concepto de empresa/organización. Si el objetivo es freelancers/autónomos individuales, el sistema ya funciona. Si quieres equipos y empresas, necesitas el refactor descrito arriba.
