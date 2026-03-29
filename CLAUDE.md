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
