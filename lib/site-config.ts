/**
 * Central config for the public marketing site CTAs.
 *
 * The funnel is internal now that Stripe is live:
 *  - LOGIN_HREF  → sign in.
 *  - START_HREF  → generic "Empieza gratis" → the pricing page to pick a plan.
 *  - checkoutHref(plan) → the plan chooser deep-linked to ONE plan, which
 *    auto-starts that plan's Stripe checkout (logging in first if needed).
 * (Previously these pointed to an external clientlabs.io/preview URL that served
 * the old landing — that's the bug this replaces.)
 */
export const LOGIN_HREF = "/auth"
export const START_HREF = "/precios"

export function checkoutHref(
  stripePlan: "STARTER" | "PRO",
  period: "monthly" | "yearly" = "monthly"
): string {
  return `/plan?plan=${stripePlan}&period=${period}`
}

export const SITE_URL = "https://clientlabs.io"
export const CONTACT_EMAIL = "hola@clientlabs.io"

export type NavLink = { label: string; href: string }

/** Primary navbar links (internal marketing routes). */
export const MARKETING_NAV: NavLink[] = [
  { label: "Producto", href: "/producto" },
  { label: "Precios", href: "/precios" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
]

/** Footer link columns. Internal routes point at pages that already exist. */
export const FOOTER_COLUMNS: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Producto",
    links: [
      { label: "CRM", href: "/producto#clientes" },
      { label: "Facturación Verifactu", href: "/producto#facturacion" },
      { label: "Proyectos y tareas", href: "/producto#operativa" },
      { label: "Precios", href: "/precios" },
    ],
  },
  {
    heading: "Empresa",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Aviso legal", href: "/legal" },
      { label: "Privacidad", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Términos", href: "/terms" },
    ],
  },
]

export const SOCIAL_LINKS = {
  x: "#",
  linkedin: "#",
  instagram: "#",
}
