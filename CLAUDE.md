# ClientLabs — Instrucciones para Claude Code

## Stack técnico
- Next.js 14+ con App Router
- TypeScript siempre — nunca JS plano
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Neon)
- Vercel (frontend) + Railway (worker)

## Sistema de diseño
- Fuente: var(--font-geist-sans) — NO importar fuentes externas
- Verde acento: #1FA97A
- Fondo oscuro: #0B1F2A
- Texto: var(--color-text-primary)
- Bordes: 0.5px solid var(--color-border-secondary)
- Border-radius cards: 12px máximo
- Border-radius botones: 6-8px
- SIN rounded-3xl en ningún sitio
- SIN sombras grandes
- SIN gradientes de color
- SIN fondos negros en modales — siempre bg-white

## Reglas de código
- Componentes máximo 200 líneas
- Server Actions para mutaciones
- Variables de entorno para claves
- Manejo de errores en todos los try/catch
- Mobile first siempre
- Nombres en inglés, textos UI en español

## Lo que NO hacer nunca
- No cambiar el schema de Prisma sin mostrar la migración
- No usar librerías nuevas sin avisar
- No refactorizar código no pedido
- No asumir cómo está implementado algo sin verificar
- **NUNCA usar emojis** en ningún componente, página, dato ni texto de UI — ni como iconos, ni como decoración, ni en data arrays. Usar siempre iconos SVG (Lucide React ya instalado) o elementos CSS puros.

---

## Skill: ui-ux-pro-max

La skill de diseño UI/UX está instalada en `.claude/skills/ui-ux-pro-max/`.

### Cuándo se activa automáticamente
Se activa en cualquier tarea que involucre diseño visual, componentes, layout, colores, tipografía, accesibilidad o experiencia de usuario.

### Búsqueda manual

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
```

Dominios disponibles:
- `style` — estilos UI (glassmorphism, minimalism, brutalism...)
- `color` — paletas de color por tipo de producto
- `typography` — pares de fuentes con imports de Google Fonts
- `product` — tipo de producto (SaaS, dashboard, e-commerce...)
- `ux` — guías de buenas prácticas y anti-patrones
- `chart` — tipos de gráficos y librerías recomendadas
- `landing` — estructura de páginas y estrategias de CTA

Ejemplo:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "dashboard dark" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS" --stack nextjs --domain product
```

### Prioridades de la skill (resumen)
1. Accesibilidad — contraste 4.5:1, foco visible, aria-labels
2. Touch & interacción — mínimo 44×44px, feedback de estado
3. Performance — WebP/AVIF, lazy loading, CLS < 0.1
4. Selección de estilo — coherente con el tipo de producto
5. Layout responsive — mobile-first, sin scroll horizontal
6. Tipografía & color — base 16px, line-height 1.5, tokens semánticos

---
## SKILL: fdesign
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## REGLAS CRITICAS DE RENDIMIENTO
(NO NEGOCIABLES — NUNCA SALTARSE)

### VERCEL — maxDuration OBLIGATORIO en cada route

TODA ruta nueva `app/api/**/route.ts` DEBE incluir al principio del archivo:

```ts
export const maxDuration = 10 // default
```

Valores permitidos por tipo:
- APIs normales: 10s
- Auth: 15s
- PDF generation: 25s
- AI/OpenAI calls: 30s
- Stripe/webhooks: 30s
- Ingest/ingesta: 30s
- Cron jobs: 60s

NUNCA crear una ruta sin `maxDuration`. NUNCA usar un valor mayor sin justificación.

### Polling — NUNCA menos de 30 segundos

Cualquier `setInterval` o `refetchInterval` que llame a una API DEBE ser >= 30_000ms.

Prohibido:
- `setInterval(fn, 1000)`
- `setInterval(fn, 5000)`
- `refetchInterval: 5000`

Permitido:
- `setInterval(fn, 30_000)` — mínimo
- `refetchInterval: 120_000` — recomendado
- `refetchInterval: 300_000` — óptimo

Excepcion UNICA: modales de espera activa (WebConnectDialog, ScanWithMobileDialog) pueden usar 10_000ms como mínimo absoluto.

### Cache Redis — SIEMPRE en endpoints de polling

Cualquier endpoint que se llame con polling DEBE tener caché Redis:

```ts
import { getCachedData, setCachedData } from "@/lib/redis-cache"

const cached = await getCachedData(key)
if (cached) return NextResponse.json(cached)
// ... calcular ...
await setCachedData(key, data, TTL)
```

TTL mínimos recomendados:
- KPIs: 60s
- Listas: 30s
- Status checks: 10s
- Dashboard summary: 60s

### Streams y SSE — PROHIBIDOS

NUNCA crear endpoints con:
- `ReadableStream` abierto indefinidamente
- `text/event-stream` sin timeout
- `keepAlive` sin límite
- `EventSource` sin `maxDuration`

Si necesitas tiempo real usa polling con `refetchInterval >= 30_000ms`.

### React Query — configuracion obligatoria

Toda nueva query con `useQuery` o `useInfiniteQuery` DEBE tener:

```ts
refetchOnWindowFocus: false,
refetchOnMount: false,
retry: 0,
staleTime: /* mínimo */ 60_000,
```

NUNCA usar los defaults de React Query sin especificar estos valores.

### Imports pesados — SIEMPRE dinamicos en API routes

```ts
// MAL
import { jsPDF } from "jspdf"

// BIEN
const { jsPDF } = await import("jspdf")
```

Librerias que requieren import dinámico: jsPDF, pdf-lib, html2canvas, sharp, puppeteer, playwright, cualquier librería > 1MB.

---

### Prisma — UN solo cliente

NUNCA instanciar `PrismaClient` fuera de `lib/prisma.ts`:

```ts
// MAL
new PrismaClient()

// BIEN
import { prisma } from "@/lib/prisma"
```

### Select — SIEMPRE especifico

NUNCA hacer `findMany` sin `select`:

```ts
// MAL
prisma.lead.findMany({ where: { userId } })

// BIEN
prisma.lead.findMany({ where: { userId }, select: { id: true, name: true, email: true } })
```

### console.log — PROHIBIDO en produccion

NUNCA añadir `console.log` en `app/api/`. Solo `console.error` en bloques catch.

---

### CHECKLIST ANTES DE CADA COMMIT

- [ ] Cada ruta nueva tiene `export const maxDuration`
- [ ] Ningun `setInterval` < 30_000ms
- [ ] Ningun import estatico de librería pesada en API routes
- [ ] Ningun `new PrismaClient()` fuera de `lib/`
- [ ] Ningun `console.log` en `app/api/`
- [ ] Queries con `select` especifico
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] `npm run build` → sin errores

---

### SENALES DE ALARMA — PARAR Y AVISAR

Si aparece cualquiera de esto, detener y notificar al usuario antes de continuar:

- Ruta nueva sin `export const maxDuration`
- `setInterval` con valor < 30_000 (excepto modales de espera activa)
- Import estatico de jsPDF/puppeteer/sharp en API route
- `new PrismaClient()` fuera de `lib/prisma.ts`
- `ReadableStream` o `EventSource` nuevo sin timeout
- `refetchInterval` < 30_000

**Contexto:** En 6 dias se consumieron 1.091 GB-Hrs de Vercel (limite: 360 GB-Hrs/mes) causando la pausa del proyecto. La causa principal fue 163 rutas API sin `maxDuration` explícito — el `vercel.json` functions config NO aplica a App Router route handlers.

---

## 🔒 REGLAS DE SEGURIDAD (OBLIGATORIAS)

Estas reglas son OBLIGATORIAS para cualquier modificación o implementación nueva.

### Rate Limiting
- Todas las API routes tienen rate limiting de 60 req/min por IP via `middleware.ts`
- Implementado con `@upstash/ratelimit` + Redis — ya configurado y activo
- NUNCA crear un endpoint sin rate limiting (el middleware lo aplica automáticamente)

### API Keys y Secretos
- NUNCA usar `NEXT_PUBLIC_` para secretos, tokens o API keys
- `.env*` siempre en `.gitignore` (ya configurado)
- NUNCA hardcodear credenciales en el código

### Protección contra Inyecciones
- SIEMPRE usar Prisma con template literals para queries (`` prisma.$queryRaw`SELECT * FROM t WHERE id = ${id}` ``)
- NUNCA usar `$queryRawUnsafe` con string concatenation
- SIEMPRE sanitizar inputs con `lib/sanitize.ts` antes de renderizar HTML dinámico
- Security headers configurados en `next.config.ts` (CSP, HSTS, XSS Protection, etc.)

### Validación de Inputs
- TODOS los inputs de usuario se validan con Zod (`lib/validations.ts` tiene schemas reutilizables)
- NUNCA procesar `request.json()` sin validar con Zod primero
- Mensajes de error en español para el usuario final
- Límites de longitud en TODOS los campos de texto

### Checklist para cada nuevo endpoint/formulario
- [ ] Rate limiting aplicado (automático via middleware — verificar que la ruta empieza por `/api/`)
- [ ] Input validado con Zod schema antes de cualquier lógica
- [ ] No hay API keys expuestas en el frontend (sin `NEXT_PUBLIC_SECRET_*`)
- [ ] Queries usan Prisma con template literals (no SQL raw con concatenación)
- [ ] Output sanitizado si se renderiza como HTML (`lib/sanitize.ts`)
- [ ] Errores manejados con try/catch
- [ ] Respuestas de error no exponen stack traces ni detalles internos
- [ ] Endpoints que acceden a recursos por ID incluyen `userId` en el WHERE de Prisma

### Historial de Auditorías de Seguridad

| Fecha | Herramientas | Vulns encontradas | Vulns corregidas | Estado |
|-------|-------------|-------------------|-----------------|--------|
| 22 Abril 2026 | Semgrep 1.157.0 + Gitleaks 8.30.1 + análisis manual | 25 (3 críticas, 7 altas, 8 medias, 4 bajas, 3 info) | 25/25 | ✅ Completado |

**Próxima auditoría recomendada:** antes del launch público (antes de 23 Junio 2026)

Ejecutar:
```bash
semgrep --config p/owasp-top-ten --config p/nextjs .
gitleaks detect --source . --log-level warn
npm audit
```

## Sistema de Permisos por Plan

- **Fuente de verdad:** `lib/plan-gates.ts` — NUNCA hardcodear límites en otro sitio
- **Backend:** Usar `gateFeature()` o `gateLimit()` de `lib/api-gate.ts` en CADA API route que mutate datos
- **Frontend:** Usar `usePlan()` hook + `<UpgradeWall>` component
- **Planes:** FREE (0EUR) -> PRO (14,99EUR) -> BUSINESS (29,99EUR)
- **Regla:** Cualquier nueva feature DEBE añadirse a `PLAN_FEATURES` en `plan-gates.ts` y protegerse con el gate correspondiente
- **Regla:** El gate de backend es OBLIGATORIO aunque haya gate de frontend
- **Regla:** Los errores de gate siempre incluyen `upgradeUrl: "/precios"`
