/**
 * Central config for the public marketing site.
 *
 * PREVIEW_URL is the single source of truth for every CTA that enters the app
 * (Empieza gratis / Empezar / Iniciar sesión …). The app is gated behind a
 * preview key during pre-launch — when the gate is removed, change this one
 * constant (e.g. to "/auth" or "https://app.clientlabs.io") and every CTA
 * across the marketing site updates.
 */
export const PREVIEW_URL =
  "https://clientlabs.io/preview?key=clientlabs-preview-2026"

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
