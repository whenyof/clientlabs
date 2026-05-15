# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Stack técnico
- Next.js 14+ con App Router
- TypeScript siempre — nunca JS plano
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Neon, pooled connection via pgbouncer)
- Upstash Redis (caché + rate limiting)
- Vercel (frontend) + Railway (worker)
- NextAuth.js v4 con JWT strategy (Google + Credentials)
- Stripe (pagos y suscripciones)

## Comandos principales

```bash
npm run dev          # servidor de desarrollo (webpack)
npm run build        # prisma generate + next build
npm run lint         # eslint
npx tsc --noEmit     # check de tipos (sin emitir)

npm test             # vitest run (unit tests)
npm run test:watch   # vitest en modo watch
npm run test:e2e     # playwright

npx prisma db push   # aplicar cambios de schema sin migración (dev con Neon)
npx prisma generate  # regenerar cliente Prisma
npx prisma studio    # UI para la base de datos

npm run worker:events  # arrancar el worker de eventos (Railway)
npm run create-key     # crear API key para SDK externo
```

Para ejecutar un solo test de vitest:
```bash
npx vitest run tests/unit/plan-gates.test.ts
```

Para ejecutar un solo test de playwright:
```bash
npx playwright test tests/e2e/auth.spec.ts
```

---

## Arquitectura de alto nivel

### Estructura de rutas

El código fuente está repartido en cuatro zonas principales:

| Zona | Ruta | Propósito |
|------|------|-----------|
| App Router | `app/` | Páginas públicas + dashboard + API routes |
| Módulos | `modules/` | Lógica de dominio con componentes, servicios y repositorios |
| Src | `src/` | Dominios alternativos (leads, billing, analytics), SDK, infraestructura |
| Lib | `lib/` | Utilidades y servicios singleton compartidos |

### Path aliases (tsconfig.json)

```
@/*             → src/*          (dominio principal)
@/modules/*     → modules/*
@/components/*  → components/*
@/app/*         → app/*
@/lib/*         → lib/*
@/hooks/*       → hooks/*
@domains/*      → src/domains/*
@sdk/*          → src/sdk/*
@infra/*        → src/infrastructure/*
```

### Dominios principales

**Facturación** (`modules/invoicing/`):
- `services/invoice.service.ts` — orquestador principal. Úsalo siempre en lugar de llamar al repo o engine directamente.
- `engine/invoice.engine.ts` — cálculo de totales, numeración, estados, lógica de pagos.
- `repositories/invoice.repository.ts` — acceso a BD.
- `pdf/invoice-renderer.ts` — genera el PDF con jsPDF (import dinámico obligatorio).
- `types/` — `CreateInvoiceInput`, `InvoiceStatus`, etc.

Estados de factura: `DRAFT → SENT (issued) → PAID / OVERDUE / CANCELED`. El número "BORRADOR" es un placeholder; el número real (`INV-2026-001`) se asigna al emitir (issue).

**Verifactu** (`lib/verifactu.ts`): integración con la API de Verifacti para firmar facturas en España (F1, F2, R1-R5). Solo se llama desde `invoiceService.issueInvoice()`.

**Documentos financieros** (`app/dashboard/finance/`):
- `presupuestos/` — Quotes (serie `P-YYYY-NNN`)
- `pedidos/` — PurchaseOrders (serie `PED-YYYY-NNN`)
- `albaranes/` — DeliveryNotes (serie `ALB-YYYY-NNN`)
- Flujo: Quote aceptado → GenerateDocumentsModal → PO + AlbaráN + Factura (borradores)
- API: `/api/quotes/[id]/generate-documents` y `/api/purchase-orders/[id]/generate-doc`

**Leads** (`modules/leads/`, `src/domains/leads/`):
- Ingesta vía `/api/ingest` (SDK externo con API key) o `/api/track`
- Procesamiento por worker de eventos en Railway (`workers/eventQueueWorker.ts`)
- Scoring automático en `lib/events/` con decay periódico (cron `scoring-decay`)

**Cliente 360** (`modules/client360/`):
- Vista unificada por cliente: KPIs, documentos agrupados por pedido, facturas, pagos.
- `ClientDocumentsList` — muestra grupos PO → Quote + Albarán + Factura con links para generar los que falten.

**Planes y permisos**:
- `lib/plan-gates.ts` — fuente de verdad de límites y features por plan (STARTER, PRO, BUSINESS, TRIAL).
- `lib/api-gate.ts` — `gateFeature()` y `gateLimit()` para API routes.
- `hooks/use-plan.ts` — hook cliente con `can()`, `limit()`, `isPro`, etc.
- Planes: FREE/STARTER (0€) → PRO (14,99€) → BUSINESS (29,99€). TRIAL = PRO con fecha de expiración.

**Auth** (`lib/auth.ts`): NextAuth con JWT (7 días). Google + Credentials. Adaptador Prisma. El layout `app/dashboard/layout.tsx` es el guardián de acceso: redirige a `/auth` si no hay sesión, o a `/onboarding` si `onboardingCompleted = false`.

**Rate limiting**: middleware en la capa de Vercel con `@upstash/ratelimit` — 60 req/min por IP. Se aplica automáticamente a todas las rutas `/api/`.

**Worker de eventos** (`workers/`): proceso Node.js persistente en Railway que consume una cola Redis. Procesa eventos de leads, scoring, automaciones. Se arranca con `npm run worker:events`.

**Cron jobs** (`app/api/cron/`): rutas Vercel Cron para billing, decay de scoring, sincronización de calendarios, emails diarios.

**SDK externo** (`src/sdk/`, `lib/clientlabs-loader.ts`): script JS embebible en sitios de clientes para enviar eventos a `/api/ingest` o `/api/v1/ingest` usando API keys.

---

## Sistema de diseño
- Fuente: `var(--font-geist-sans)` — NO importar fuentes externas
- Verde acento: `#1FA97A`
- Fondo oscuro: `#0B1F2A`
- Texto: `var(--color-text-primary)`
- Bordes: `0.5px solid var(--color-border-secondary)`
- Border-radius cards: 12px máximo
- Border-radius botones: 6-8px
- SIN `rounded-3xl` en ningún sitio
- SIN sombras grandes — SIN gradientes de color
- SIN fondos negros en modales — siempre `bg-white`
- **NUNCA emojis** en UI: usar iconos Lucide React o CSS puro

---

## Reglas de código

- Componentes máximo 200 líneas
- Nombres en inglés, textos UI en español
- Mobile first siempre
- No refactorizar código no pedido
- No asumir implementación sin verificar — leer el archivo primero
- No cambiar el schema de Prisma sin mostrar el SQL de migración
- No añadir librerías nuevas sin avisar

---

## REGLAS CRÍTICAS DE RENDIMIENTO
*(No negociables — el incumplimiento causó la suspensión del proyecto en Vercel)*

### maxDuration obligatorio en cada route

```ts
export const maxDuration = 10  // al inicio del archivo, antes de los imports
```

| Tipo de ruta | Valor |
|---|---|
| APIs normales | 10s |
| Auth | 15s |
| PDF generation | 25s |
| AI / OpenAI | 30s |
| Stripe / webhooks / ingest | 30s |
| Cron jobs | 60s |

El `vercel.json` functions config **NO** aplica a App Router route handlers.

### Polling — mínimo 30 segundos

```ts
// Prohibido
setInterval(fn, 5000)
refetchInterval: 5000

// Permitido
setInterval(fn, 30_000)       // mínimo absoluto
refetchInterval: 120_000      // recomendado
```

Excepción única: modales de espera activa (WebConnectDialog) → 10_000ms.

### Cache Redis en endpoints de polling

```ts
import { getCachedData, setCachedData } from "@/lib/redis-cache"

const cached = await getCachedData(key)
if (cached) return NextResponse.json(cached)
// ... calcular ...
await setCachedData(key, data, TTL)
```

TTL: KPIs 60s, listas 30s, dashboard 60s.

### React Query — configuración obligatoria

```ts
useQuery({
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 0,
  staleTime: 60_000,  // mínimo
})
```

### Imports pesados — siempre dinámicos en API routes

```ts
// MAL
import { jsPDF } from "jspdf"

// BIEN
const { jsPDF } = await import("jspdf")
```

Aplica a: jsPDF, pdf-lib, html2canvas, sharp, puppeteer, cualquier lib > 1MB.

### Prisma — singleton y select específico

```ts
// Siempre
import { prisma } from "@/lib/prisma"

// Nunca sin select
prisma.lead.findMany({ where: { userId }, select: { id: true, name: true, email: true } })
```

`console.log` prohibido en `app/api/`. Solo `console.error` en bloques catch.

---

## Seguridad (obligatorio en cada endpoint/formulario)

- Rate limiting: automático vía middleware para rutas `/api/`
- Validar `request.json()` con Zod antes de cualquier lógica (`lib/validations.ts`)
- Queries Prisma con template literals en `$queryRaw` — nunca `$queryRawUnsafe` con concatenación
- Sanitizar con `lib/sanitize.ts` antes de renderizar HTML dinámico
- NUNCA `NEXT_PUBLIC_` para secretos o API keys
- Endpoints que acceden a recursos por ID deben incluir `userId` en el WHERE de Prisma

### Checklist por endpoint

- [ ] `export const maxDuration` al inicio
- [ ] Input validado con Zod
- [ ] `userId` en WHERE de Prisma
- [ ] Sin `console.log` en `/api/`
- [ ] `select` específico en Prisma
- [ ] Errores sin exponer stack traces

---

## Sistema de Permisos por Plan

- **Fuente de verdad:** `lib/plan-gates.ts` — NUNCA hardcodear límites en otro sitio
- **Backend:** `gateFeature()` o `gateLimit()` de `lib/api-gate.ts` en CADA route que mute datos
- **Frontend:** `usePlan()` hook + `<UpgradeWall>` component
- Cualquier feature nueva debe añadirse a `PLAN_FEATURES` en `plan-gates.ts`
- El gate de backend es obligatorio aunque exista gate de frontend
- Errores de gate siempre incluyen `upgradeUrl: "/precios"`

---

## Skill: ui-ux-pro-max

Instalada en `.claude/skills/ui-ux-pro-max/`. Se activa automáticamente en tareas de diseño visual, componentes, layout, colores, tipografía o UX.

Búsqueda manual:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
# Dominios: style | color | typography | product | ux | chart | landing
```

---

## Checklist antes de cada commit

- [ ] Cada ruta nueva tiene `export const maxDuration`
- [ ] Ningún `setInterval` < 30_000ms
- [ ] Ningún import estático de librería pesada en API routes
- [ ] Ningún `new PrismaClient()` fuera de `lib/`
- [ ] Ningún `console.log` en `app/api/`
- [ ] Queries con `select` específico
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] `npm run build` → sin errores

### Señales de alarma — parar y avisar al usuario

- Ruta nueva sin `export const maxDuration`
- `setInterval` con valor < 30_000 (excepto modales de espera activa)
- Import estático de jsPDF/puppeteer/sharp en API route
- `new PrismaClient()` fuera de `lib/prisma.ts`
- `ReadableStream` o `EventSource` sin timeout
- `refetchInterval` < 30_000

---

## Auditorías de seguridad

| Fecha | Herramientas | Estado |
|-------|-------------|--------|
| 22 Abril 2026 | Semgrep 1.157.0 + Gitleaks 8.30.1 + análisis manual | 25/25 corregidas |

**Próxima auditoría:** antes del launch público (antes de 23 Junio 2026)

```bash
semgrep --config p/owasp-top-ten --config p/nextjs .
gitleaks detect --source . --log-level warn
npm audit
```
