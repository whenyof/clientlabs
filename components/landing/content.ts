/**
 * Single source of truth for all landing page copy.
 * All user-visible text is in Spanish.
 * Use `as const` so TypeScript infers literal types for safe access.
 */

/* ─── Navbar ─────────────────────────────────────────────────────── */

export const navbarContent = {
  brand: "ClientLabs",
  links: [
    { label: "Producto",     href: "/producto" },
    { label: "Precios",      href: "/precios" },
    { label: "Soluciones",   href: "/soluciones" },
    { label: "Recursos",     href: "/recursos" },
    { label: "Embajadores",  href: "/embajadores" },
    { label: "Novedades",    href: "/changelog" },
    { label: "Contacto",     href: "/contacto" },
  ],
  ctas: {
    login:   { label: "Entrar",       href: "/login" },
    primary: { label: "Empezar ahora", href: "/register" },
  },
} as const

/* ─── Hero ───────────────────────────────────────────────────────── */

export const heroContent = {
  pill: "Sistema operativo para negocios",
  headline: "Todo tu negocio.",
  headlineAccent: "Un solo sistema.",
  sub: "CRM, tareas, facturación, automatizaciones, IA y recomendaciones inteligentes — conectados, en tiempo real.",
  ctas: {
    primary:   { label: "Empezar gratis",  href: "/register" },
    secondary: { label: "Ver demo →",      href: "/demo" },
  },
  trust: "14 días gratis · Sin tarjeta · Sin permanencia",
  proof: {
    count: "+200 negocios",
    label: "en lista de espera",
    avatars: [
      { initials: "MG", color: "#1FA97A" },
      { initials: "RM", color: "#3b82f6" },
      { initials: "EV", color: "#f59e0b" },
      { initials: "HM", color: "#8b5cf6" },
      { initials: "CP", color: "#ef4444" },
    ],
  },
} as const

/* ─── Problem ────────────────────────────────────────────────────── */

export const problemContent = {
  eyebrow: "El problema",
  headline: "Demasiadas herramientas.",
  headlineAccent: "Ningún sistema.",
  sub: "El negocio promedio usa 6+ herramientas que no se comunican. Caos, tiempo perdido y dinero invisible.",
  pains: [
    {
      num: "01",
      title: "Leads que se pierden",
      desc: "Llegan por WhatsApp, email y web sin ningún orden. Nadie los sigue. Se enfrían.",
    },
    {
      num: "02",
      title: "Clientes dispersos",
      desc: "Datos en libretas, Excel y la memoria. Sin historial. Sin contexto cuando más lo necesitas.",
    },
    {
      num: "03",
      title: "Tareas sin control",
      desc: "Sin sistema de gestión, todo vive en notas mentales o post-its. Los deadlines se escapan.",
    },
    {
      num: "04",
      title: "Facturación manual",
      desc: "Word, PDF a mano, tarde y con errores. Cobros pendientes olvidados. Caja invisible.",
    },
    {
      num: "05",
      title: "Procesos manuales infinitos",
      desc: "Repetir las mismas acciones cada día: emails, asignaciones, recordatorios. Tiempo destruido.",
    },
    {
      num: "06",
      title: "Cero inteligencia",
      desc: "Sin métricas, sin alertas, sin predicciones. Decisiones a ciegas hasta que ya es tarde.",
    },
  ],
  resolve: {
    title: "ClientLabs resuelve los 6 a la vez",
    sub: "Un solo sistema que conecta todo tu flujo operativo sin código, sin integraciones manuales.",
    cta: { label: "Probar gratis →", href: "/register" },
  },
} as const

/* ─── Platform ───────────────────────────────────────────────────── */

export const platformContent = {
  eyebrow: "La plataforma",
  headline: "Seis módulos.",
  headlineAccent: "Un solo sistema.",
  sub: "Cada módulo se conecta con los demás. Sin datos duplicados. Sin fricciones. Sin silos.",
  modules: [
    {
      id: "crm",
      num: "01",
      name: "CRM & Leads",
      tagline: "Pipeline visual con scoring IA",
      color: "#1FA97A",
      desc: "Centraliza cada contacto con historial completo. Pipeline visual, scoring automático y conversión a cliente en un clic.",
      features: [
        "Pipeline visual con estados personalizados",
        "Scoring de leads con IA",
        "Historial 360° de cada cliente",
        "Captura desde web y formularios",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
    {
      id: "tareas",
      num: "02",
      name: "Gestión de Tareas",
      tagline: "Kanban, calendario y prioridades",
      color: "#3B82F6",
      desc: "Tablero Kanban, vista calendario y prioridades automáticas. Cada tarea vinculada a un cliente, con deadlines y asignaciones.",
      features: [
        "Tablero Kanban personalizable",
        "Vista calendario integrada",
        "Prioridad automática con IA",
        "Vinculación a clientes y proyectos",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
    {
      id: "billing",
      num: "03",
      name: "Facturación",
      tagline: "MRR, Stripe y Verifactu",
      color: "#F59E0B",
      desc: "Facturación profesional en PDF, integración Stripe y seguimiento de MRR. Cobros automáticos y alertas de impago.",
      features: [
        "Facturas PDF profesionales en 30s",
        "Integración Stripe nativa",
        "MRR y ARR en tiempo real",
        "Recuperación de cobros fallidos",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
    {
      id: "auto",
      num: "04",
      name: "Automatizaciones",
      tagline: "Flujos sin código",
      color: "#8B5CF6",
      desc: "Diseña flujos visuales sin código: trigger → condición → acción. Emails, asignaciones y notificaciones en piloto automático.",
      features: [
        "Editor visual drag & drop",
        "200+ integraciones disponibles",
        "Logs en tiempo real",
        "Reintentos automáticos en fallos",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
    {
      id: "ia",
      num: "05",
      name: "Asistente IA",
      tagline: "GPT-4o sobre tus datos reales",
      color: "#EC4899",
      desc: "Pregunta en lenguaje natural y obtén análisis de tus datos reales. GPT-4o integrado directamente en tu operación.",
      features: [
        "Consultas en lenguaje natural",
        "Análisis sobre datos reales",
        "Resúmenes automáticos",
        "Sugerencias de acciones concretas",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
    {
      id: "reco",
      num: "06",
      name: "Recomendaciones",
      tagline: "Churn, upsell y anomalías",
      color: "#06B6D4",
      desc: "El sistema detecta patrones, anticipa churn, sugiere upsells y alerta sobre anomalías antes de que afecten tus resultados.",
      features: [
        "Detección de churn temprana",
        "Sugerencias de upsell automáticas",
        "Alertas de anomalías en datos",
        "Insights semanales automáticos",
      ],
      ctaLabel: "Ver módulo completo →",
      ctaHref: "/producto",
    },
  ],
} as const

/* ─── Tasks ──────────────────────────────────────────────────────── */

export const tasksContent = {
  eyebrow: "Gestión de tareas",
  headline: "Proyectos y equipos",
  headlineAccent: "siempre bajo control.",
  accentColor: "#3B82F6",
  sub: "Tablero Kanban, vista calendario y prioridades automáticas con IA. Cada tarea vinculada al cliente o proyecto correspondiente.",
  features: [
    {
      icon: "calendar" as const,
      title: "Vista calendario integrada",
      desc: "Organiza por fecha de entrega con vista mensual, semanal y diaria.",
    },
    {
      icon: "link" as const,
      title: "Vinculada a clientes",
      desc: "Contexto completo del cliente sin cambiar de pantalla.",
    },
    {
      icon: "bolt" as const,
      title: "Prioridad automática con IA",
      desc: "El sistema sugiere qué hacer primero según valor e impacto.",
    },
  ],
  stats: [
    { value: "-62%",  label: "Tareas manuales" },
    { value: "127",   label: "Completadas/mes" },
    { value: "18/día", label: "Auto-asignadas" },
  ],
  kanbanCols: [
    { label: "Pendiente",  color: "#9CA3AF", items: ["Propuesta NextSite", "Actualizar precios", "Revisar contrato"] },
    { label: "En proceso", color: "#3B82F6", items: ["Demo TechMark", "Email bienvenida auto", "Informe Q1"] },
    { label: "Revisión",   color: "#F59E0B", items: ["Factura MediaCore"] },
    { label: "Completado", color: "#1FA97A", items: ["Onboarding NextSite", "Integración Stripe"] },
  ],
} as const

/* ─── AI ─────────────────────────────────────────────────────────── */

export const aiContent = {
  eyebrow: "Inteligencia artificial + Recomendaciones",
  headline: "Tu co-piloto inteligente.",
  headlineAccent: "Siempre activo.",
  accentColor: "#EC4899",
  sub: "Pregunta en lenguaje natural sobre tus datos reales. El sistema detecta churn, sugiere upsells y alerta antes de que los problemas impacten.",
  features: [
    {
      icon: "bot" as const,
      title: "Asistente en lenguaje natural",
      desc: "GPT-4o integrado directamente en tus datos. Sin copiar ni pegar.",
    },
    {
      icon: "sparkles" as const,
      title: "Churn detectado 3x antes",
      desc: "Identifica señales de abandono semanas antes de que ocurra.",
    },
    {
      icon: "trending" as const,
      title: "Upsell automático sugerido",
      desc: "Detecta cuándo un cliente está listo para subir de plan.",
    },
  ],
  stats: [
    { value: "97%",       label: "Precisión alertas" },
    { value: "200+",      label: "Consultas IA/día" },
    { value: "€3.2k/sem", label: "Revenue protegido" },
  ],
  chatMessages: [
    { role: "user" as const, text: "¿Qué clientes tienen riesgo de churn esta semana?" },
    { role: "ai" as const,   text: "Detecté 3 clientes en riesgo: NextSite (sin actividad 8 días), MediaCore (factura pendiente €800), TechMark (NPS bajó a 4). Recomiendo contacto directo hoy." },
    { role: "user" as const, text: "¿Cuánto MRR podría perder si no actúo?" },
    { role: "ai" as const,   text: "Exposición estimada: €847/mes. Si recuperas los 3 clientes con seguimiento proactivo, probabilidad de retención: 71%." },
  ],
  insights: [
    { text: "NextSite — churn inminente (74%)",          priority: "Crítica", color: "#EF4444" },
    { text: "TechMark — oportunidad upgrade a Pro",      priority: "Alta",    color: "#F59E0B" },
    { text: "Anomalía cobros 14-16h detectada",          priority: "Media",   color: "#8B5CF6" },
  ],
} as const

/* ─── Automatizaciones ───────────────────────────────────────────── */

export const automationsContent = {
  eyebrow: "Automatizaciones",
  headline: "Procesos que se",
  headlineAccent: "ejecutan solos.",
  accentColor: "#8B5CF6",
  sub: "Diseña flujos visuales sin una sola línea de código. Trigger, condición y acción. Así de simple.",
  stats: [
    { value: "18",   label: "Flujos activos" },
    { value: "380+", label: "Ejecuciones/mes" },
    { value: "120h", label: "Ahorradas/mes" },
    { value: "200+", label: "Integraciones" },
  ],
  activeFlows: [
    { title: "Bienvenida automática",         runs: "340/mes" },
    { title: "Recuperación de pagos fallidos", runs: "12/mes" },
    { title: "Alerta churn preventiva",        runs: "28/mes" },
  ],
  demoFlow: {
    trigger: "Lead nuevo entra",
    steps: [
      "Score calculado > 60",
      "Email bienvenida enviado",
      "Comercial asignado",
      "Tarea follow-up creada",
    ],
    badge: "340/mes",
  },
} as const

/* ─── Comparativa (Stats) ────────────────────────────────────────── */

export const comparativaContent = {
  eyebrow: "Sin mentiras",
  headline: "Lo que dejarás de",
  headlineAccent: "hacer a mano.",
  sub: "No te vamos a poner métricas inventadas. Te mostramos exactamente qué procesos se automatizan y cuánto tiempo recuperas cada semana.",
  rows: [
    { task: "Registrar un lead nuevo",         before: "Copiar a mano en Excel o CRM",      after: "Captura automática desde web" },
    { task: "Hacer seguimiento de un cliente", before: "Buscar entre emails y notas",        after: "Historial 360° en un clic" },
    { task: "Crear y enviar una factura",      before: "15-30 min en Word o PDF",            after: "30 segundos, PDF automático" },
    { task: "Asignar tareas al equipo",        before: "WhatsApp, Slack o reunión",          after: "Tablero Kanban + asignación IA" },
    { task: "Detectar un cliente en riesgo",   before: "Cuando ya ha cancelado",             after: "Alerta 7-14 días antes" },
    { task: "Enviar email de bienvenida",      before: "Manual, a veces se olvida",          after: "Automático al entrar el lead" },
    { task: "Ver cuánto ingresaste este mes",  before: "Suma manual en hoja de cálculo",     after: "Dashboard en tiempo real" },
    { task: "Saber qué priorizar hoy",         before: "Intuición y reuniones",              after: "IA sugiere prioridades" },
  ],
  pillars: [
    {
      icon: "clock" as const,
      title: "Tiempo recuperado",
      desc: "Cada uno de estos procesos sucede múltiples veces por semana. Con ClientLabs, se hacen solos o en segundos.",
    },
    {
      icon: "brain" as const,
      title: "Sin carga mental",
      desc: "No tienes que recordar qué hacer ni cuándo. El sistema actúa, te avisa y prioriza por ti.",
    },
    {
      icon: "chart" as const,
      title: "Visibilidad total",
      desc: "Sabes exactamente qué pasa en tu negocio, qué entra, qué falla y qué hay que hacer hoy.",
    },
  ],
} as const

/* ─── Recursos ───────────────────────────────────────────────────── */

export const resourcesContent = {
  eyebrow: "Recursos gratuitos",
  headline: "Todo lo que necesitas para",
  headlineAccent: "gestionar tu negocio",
  sub: "Guías, plantillas y herramientas gratuitas para autónomos y pequeños negocios en España.",
  items: [
    {
      icon: "fileText" as const,
      tag: "Guía gratuita",
      title: "Cómo captar tus primeros 10 clientes como autónomo",
      desc: "Estrategias probadas para conseguir clientes sin presupuesto de marketing.",
      cta: "Descargar gratis",
      href: "/register",
      featured: false,
    },
    {
      icon: "fileSpreadsheet" as const,
      tag: "Plantilla Excel",
      title: "Plantilla de seguimiento de clientes y ventas",
      desc: "La plantilla que usaban nuestros usuarios antes de descubrir ClientLabs.",
      cta: "Descargar gratis",
      href: "/register",
      featured: false,
    },
    {
      icon: "calculator" as const,
      tag: "Herramienta gratuita",
      title: "Calculadora de tarifa hora para autónomos",
      desc: "Calcula cuánto deberías cobrar por hora según tus gastos y objetivos de ingresos.",
      cta: "Usar gratis",
      href: "/register",
      featured: false,
    },
    {
      icon: "checkSquare" as const,
      tag: "Checklist",
      title: "Checklist cierre de mes para autónomos",
      desc: "24 tareas que todo autónomo debería hacer antes de cerrar el mes. Nunca más te olvides nada.",
      cta: "Descargar gratis",
      href: "/register",
      featured: false,
    },
    {
      icon: "receipt" as const,
      tag: "Guía práctica",
      title: "IVA trimestral para autónomos: guía paso a paso",
      desc: "Todo lo que necesitas saber sobre el modelo 303 sin morir en el intento.",
      cta: "Leer guía",
      href: "/register",
      featured: false,
    },
    {
      icon: "puzzle" as const,
      tag: "Plugin gratuito",
      title: "Plugin WordPress para captar leads automáticamente",
      desc: "Instala en 2 minutos y todos los formularios de tu web llegarán directamente a ClientLabs.",
      cta: "Descargar plugin",
      href: "/api/downloads/wordpress-plugin",
      featured: true,
    },
  ],
  ctaBanner: {
    title: "¿Quieres usar ClientLabs gratis?",
    sub: "Crea tu cuenta y accede a todos los recursos de forma gratuita.",
    cta: { label: "Empezar gratis 14 días →", href: "/register" },
  },
} as const

/* ─── Pricing ────────────────────────────────────────────────────── */

export const pricingContent = {
  eyebrow: "Precios",
  headline: "Simple. Sin sorpresas.",
  sub: "14 días gratis en cualquier plan. Sin tarjeta.",
  compareHref: "/precios",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: "9,99€",
      period: "/mes",
      tagline: "Para empezar con control.",
      featured: false,
      featuredLabel: null,
      features: [
        "CRM + Leads (50/mes)",
        "Tareas y proyectos",
        "Facturación (30/mes)",
        "Automatizaciones básicas",
      ],
      note: "Sin asistente IA",
      cta: { label: "Empezar gratis", href: "/register" },
    },
    {
      id: "pro",
      name: "Pro",
      price: "19,99€",
      period: "/mes",
      tagline: "Para crecer con IA.",
      featured: true,
      featuredLabel: "Más elegido",
      features: [
        "CRM + Leads (300/mes)",
        "Tareas y proyectos",
        "Facturación (150/mes)",
        "Automatizaciones avanzadas",
        "Asistente IA completo",
        "Recomendaciones inteligentes",
      ],
      note: "Todo incluido · IA completa",
      cta: { label: "Empezar gratis 14 días", href: "/register" },
    },
    {
      id: "max",
      name: "Max",
      price: "39,99€",
      period: "/mes",
      tagline: "Para escalar sin límites.",
      featured: false,
      featuredLabel: null,
      features: [
        "CRM + Leads ilimitados",
        "Tareas y proyectos",
        "Facturas ilimitadas + Verifactu",
        "Automatizaciones ilimitadas",
        "IA completa + Recomendaciones",
        "API completa + webhooks",
      ],
      note: "Todo incluido · Sin límites",
      cta: { label: "Empezar gratis", href: "/register" },
    },
  ],
} as const

/* ─── Final CTA ──────────────────────────────────────────────────── */

export const finalCtaContent = {
  headline: ["Un", "sistema.", "Todo", "resuelto."],
  accentWords: ["Todo", "resuelto."],
  sub: "CRM, tareas, facturación, automatizaciones, IA y recomendaciones — en un solo sistema operativo para tu negocio.",
  ctas: {
    primary:   { label: "Empezar gratis hoy", href: "/register" },
    secondary: { label: "Ver planes →",       href: "/precios" },
  },
  trust: "14 días gratis · Sin tarjeta · Sin permanencia",
} as const

/* ─── Footer ─────────────────────────────────────────────────────── */

export const footerContent = {
  brand: "ClientLabs",
  links: [
    { label: "Producto",              href: "/producto" },
    { label: "Precios",              href: "/precios" },
    { label: "Contacto",             href: "/contacto" },
    { label: "Términos y Condiciones", href: "/terms" },
    { label: "Política de Privacidad", href: "/privacy" },
    { label: "Política de Cookies",    href: "/cookies" },
  ],
} as const

/* ─── Barrel export ──────────────────────────────────────────────── */

export const landingContent = {
  navbar:       navbarContent,
  hero:         heroContent,
  problem:      problemContent,
  platform:     platformContent,
  tasks:        tasksContent,
  ai:           aiContent,
  automations:  automationsContent,
  comparativa:  comparativaContent,
  resources:    resourcesContent,
  pricing:      pricingContent,
  finalCta:     finalCtaContent,
  footer:       footerContent,
} as const

export type LandingContent = typeof landingContent
