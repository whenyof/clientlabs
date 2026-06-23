/**
 * Tokens del sistema de emails (extraídos del diseño "Sistema de Emails — ClientLabs").
 * Email-safe: solo se usan inline; estos valores son la fuente de verdad.
 */
export const COLORS = {
  // Marca ClientLabs
  teal: "#0F766E",
  tealInk: "#0C5C56",
  tealHover: "#0B5F58",
  tealBright: "#5FB3A8", // sobre fondo oscuro (hero familia C)

  // Tinta
  ink: "#0B1F2A",
  ink2: "#3C4A52",
  ink3: "#69767D",
  ink4: "#97A1A6",

  // Superficies (papel cálido)
  surround: "#E9E6DD", // fondo del email
  paper: "#FCFBF8", // card familias A/C
  white: "#FFFFFF", // card familia B
  paper2: "#F4F1E8", // cajas suaves

  // Líneas
  line: "#E6E1D6",
  line2: "#ECE7DC",
  line3: "#F0ECE2",

  // Acentos
  mint: "#E7F1EC", // viñetas de pasos
  mint2: "#EAF2EF", // fondo cupón

  // Negocio (familia B): marca neutra oscura del negocio
  bizInk: "#1B1A18",
  bizInk3: "#8A8578",
  bizLine: "#D8D2C5",

  // Hero oscuro (familia C)
  darkHero: "#0B1F2A",
  darkHeroText: "#A9BCC2",
  darkHeroLine: "#1E3340",

  // Footer tenue
  footerInk: "#8A9296",
  footerInk2: "#A7AEB1",
} as const

export const FONTS = {
  serif: "'Source Serif 4',Georgia,'Times New Roman',serif",
  sans: "'Hanken Grotesk',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif",
  mono: "'IBM Plex Mono','Courier New',monospace",
} as const

/**
 * CSS para cifras parejas en NÚMEROS GRANDES (importes, KPIs). El problema en
 * Gmail: la serif web no carga y cae en Georgia, que usa cifras oldstyle (de
 * altura desigual → "bailan"). La solución real es renderizar estos números en
 * la stack SANS (Hanken/Helvetica/Arial, todas con cifras lining por defecto);
 * estas props son un refuerzo por si la fuente web sí carga en otros clientes.
 */
export const NUM_FEATURES =
  'font-variant-numeric:lining-nums tabular-nums; font-feature-settings:"lnum" 1,"tnum" 1;'

/** <link> a las fuentes de Google (con fallback de sistema vía FONTS). */
export const FONTS_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com"/>' +
  '<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>'

export const CARD_WIDTH = 600
