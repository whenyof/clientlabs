/**
 * Single source of truth for all landing page copy.
 * All user-visible text is in Spanish.
 * Use `as const` so TypeScript infers literal types for safe access.
 *
 * Copy taken verbatim from docs/landing-ref/extracted/components/*.jsx
 */

/* ─── Navbar ─────────────────────────────────────────────────────── */

export const navbarContent = {
  brand: "ClientLabs",
  links: [
    { label: "Producto",   href: "/producto" },
    { label: "Precios",    href: "/precios" },
    { label: "Soluciones", href: "/soluciones" },
    { label: "Blog",       href: "/blog" },
    { label: "Novedades",  href: "/changelog" },
    { label: "Contacto",   href: "/contacto" },
  ],
  ctas: {
    login:   { label: "Entrar",        href: "/login" },
    primary: { label: "Empezar gratis", href: "/register" },
  },
} as const

/* ─── Hero ───────────────────────────────────────────────────────── */

export const heroContent = {
  pill: "Sistema operativo para negocios",
  headline: "Todo tu negocio",
  headlineAccent: "Un solo sistema.",
  sub: "CRM, tareas, facturación, automatizaciones, IA y recomendaciones inteligentes — conectados, en tiempo real.",
  ctas: {
    primary:   { label: "Empezar gratis", href: "/register" },
    secondary: { label: "Ver demo",       href: "/demo" },
  },
  trust: [
    "14 días gratis",
    "Sin tarjeta",
    "Sin permanencia",
  ],
  tools: [
    { name: "Excel",      color: "#1f7145", style: { top: "8%",  left:  "6%",  "--rot": "-6deg", "--tx": "4px",  "--ty": "-8px", animationDelay: "0s"   } },
    { name: "WhatsApp",   color: "#25d366", style: { top: "4%",  right: "10%", "--rot": "4deg",  "--tx": "-8px", "--ty": "6px",  animationDelay: ".8s"  } },
    { name: "Gmail",      color: "#d93025", style: { top: "32%", left:  "2%",  "--rot": "-2deg", "--tx": "6px",  "--ty": "4px",  animationDelay: "1.4s" } },
    { name: "Drive",      color: "#4285f4", style: { top: "70%", left:  "4%",  "--rot": "5deg",  "--tx": "5px",  "--ty": "-6px", animationDelay: "2.1s" } },
    { name: "Post-its",   color: "#e0a800", style: { top: "86%", left:  "32%", "--rot": "-8deg", "--tx": "-4px", "--ty": "-7px", animationDelay: "1s"   } },
    { name: "Facturas",   color: "#6b4ce0", style: { top: "78%", right: "6%",  "--rot": "6deg",  "--tx": "-6px", "--ty": "5px",  animationDelay: "2.6s" } },
    { name: "Notion",     color: "#1a1a1a", style: { top: "44%", right: "2%",  "--rot": "-3deg", "--tx": "8px",  "--ty": "-4px", animationDelay: ".3s"  } },
    { name: "Calendario", color: "#ea4335", style: { top: "18%", right: "36%", "--rot": "3deg",  "--tx": "-4px", "--ty": "8px",  animationDelay: "1.8s" } },
  ],
} as const

/* ─── Problem ────────────────────────────────────────────────────── */

export const problemContent = {
  eyebrow: "Diagnóstico",
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
      title: "Procesos infinitos",
      desc: "Repetir las mismas acciones cada día: emails, asignaciones, recordatorios. Tiempo destruido.",
    },
    {
      num: "06",
      title: "Cero inteligencia",
      desc: "Sin métricas, sin alertas, sin predicciones. Decisiones a ciegas hasta que ya es tarde.",
    },
  ],
  nodes: [
    { x: "8%",  y: "6%",  label: "Excel",    color: "#1f7145" },
    { x: "62%", y: "2%",  label: "WhatsApp", color: "#25d366" },
    { x: "3%",  y: "44%", label: "Gmail",    color: "#d93025" },
    { x: "48%", y: "32%", label: "Post-its", color: "#e0a800" },
    { x: "72%", y: "48%", label: "Drive",    color: "#4285f4" },
    { x: "20%", y: "70%", label: "Notion",   color: "#1a1a1a" },
    { x: "62%", y: "78%", label: "Facturas", color: "#6b4ce0" },
    { x: "30%", y: "22%", label: "Calendar", color: "#ea4335" },
  ],
  // pairs of node indices for tangle lines
  pairs: [[0,2],[1,3],[2,5],[3,6],[4,6],[0,3],[1,4],[5,6],[7,1],[7,3]] as [number, number][],
  visualCaption: "stack.actual/ · 8 herramientas · 0 conexiones",
  resolve: {
    title: "ClientLabs resuelve los 6 a la vez.",
    sub: "Un solo sistema que conecta todo tu flujo operativo. Sin código, sin integraciones manuales.",
    cta: { label: "Probar gratis", href: "/register" },
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
      tab: "CRM & Leads",
      title: "Captura cada lead. Gana cada cliente.",
      desc: "Pipeline visual con 5 estados, ficha completa del cliente, historial de interacciones y formulario embebible en tu web.",
      feats: [
        ["Formulario embebible", "Convierte cualquier página en captador de leads."],
        ["Pipeline visual",      "Nuevo → Contactado → Cualificado → Convertido."],
        ["Ficha 360º",           "Historial, compras y notas en un solo lugar."],
      ] as [string, string][],
      metric: ["+34%", "conversión de leads"] as [string, string],
    },
    {
      id: "tasks",
      num: "02",
      tab: "Gestión de Tareas",
      title: "Proyectos y tareas bajo control.",
      desc: "Tablero Kanban, vista calendario y prioridades automáticas con IA. Cada tarea vinculada al cliente correspondiente.",
      feats: [
        ["Kanban + calendario",  "Cambia de vista sin perder contexto."],
        ["Vinculada a clientes", "Cada tarea con su historial al lado."],
        ["Prioridad con IA",     "Sabe qué hacer primero según valor e impacto."],
      ] as [string, string][],
      metric: ["-62%", "tiempo en tareas manuales"] as [string, string],
    },
    {
      id: "invoice",
      num: "03",
      tab: "Facturación",
      title: "Facturas que se pagan solas.",
      desc: "Series personalizadas, PDFs al instante, control de pagadas, pendientes y vencidas. Recordatorios automáticos.",
      feats: [
        ["Series personalizadas", "Tu numeración, tus plantillas, tu marca."],
        ["PDF instantáneo",       "30 segundos y lista para enviar."],
        ["Cobros al día",         "Alertas de vencimiento sin drama."],
      ] as [string, string][],
      metric: ["-95%", "tiempo en facturación"] as [string, string],
    },
    {
      id: "auto",
      num: "04",
      tab: "Automatizaciones",
      title: "Deja que el sistema trabaje por ti.",
      desc: "Reglas visuales sin código: seguimiento automático, asignaciones, recordatorios y flujos condicionales.",
      feats: [
        ["Sin código",         "Arrastra triggers y acciones. Listo."],
        ["Condicionales reales","Si pasa X, entonces Y. Tan simple."],
        ["24/7",               "Trabajan mientras duermes."],
      ] as [string, string][],
      metric: ["2.4h", "ahorradas al día"] as [string, string],
    },
    {
      id: "ai",
      num: "05",
      tab: "Asistente IA",
      title: "Pregunta. Responde. Actúa.",
      desc: "Un asistente que conoce tus leads, clientes y finanzas. Respuestas al instante, acciones con confirmación.",
      feats: [
        ["Lenguaje natural", "\"¿Cuánto facturé este mes?\" y listo."],
        ["Conoce tu negocio", "Entrena sobre tus datos, siempre privados."],
        ["Acciones reales",   "No solo responde: ejecuta con permiso."],
      ] as [string, string][],
      metric: ["+18/día", "acciones completadas"] as [string, string],
    },
    {
      id: "reco",
      num: "06",
      tab: "Recomendaciones",
      title: "Sabe qué hacer antes que tú.",
      desc: "Qué lead priorizar, qué cliente está en riesgo, qué cobrar primero. Recomendaciones en contexto, siempre.",
      feats: [
        ["Prioridad diaria",  "Tu lista de hoy, ordenada por impacto."],
        ["Alertas de riesgo", "Detecta clientes que se enfrían."],
        ["Oportunidades",     "Upsells y cobros que habrías perdido."],
      ] as [string, string][],
      metric: ["+40%", "visibilidad financiera"] as [string, string],
    },
  ],
  // Preview data per module id — used by PlatformPreview component
  preview: {
    crm: {
      topbar: "crm / pipeline.view",
      cols: [
        { heading: "Nuevo",       items: [["Clara Ortiz",     "·· 1.200€"], ["Ramón Vela",    "·· 780€"]] },
        { heading: "Contactado",  items: [["Estudio Vega",    "·· 3.400€"], ["A. Ferrer",     "·· 600€"]] },
        { heading: "Cualificado", items: [["Hotel Miramar",   "·· 4.900€"]] },
        { heading: "Convertido",  items: [["Rest. Mirador",   "·· 2.100€"], ["M. García",     "·· 1.800€"]] },
        { heading: "Perdido",     items: [["Tienda Sol",      "·· –"]] },
      ] as { heading: string; items: [string, string][] }[],
      status: "en vivo · 12 leads activos · 3 actualizados hoy",
    },
    tasks: {
      topbar: "tareas / kanban.view",
      cols: [
        { heading: "Pendiente",  count: 4, items: [["Enviar propuesta a Hotel Miramar", "Alta"], ["Revisar factura FA-2026-0184", "Media"], ["Llamar a Ramón Vela", "Alta"]] },
        { heading: "En proceso", count: 3, items: [["Diseño landing · Estudio Vega", "Media"], ["Presupuesto Rest. Mirador", "Baja"]] },
        { heading: "Revisión",   count: 2, items: [["Contrato A. Ferrer", "Alta"], ["Newsletter Mayo", "Media"]] },
      ] as { heading: string; count: number; items: [string, string][] }[],
    },
    invoice: {
      topbar: "facturación / 2026-0184.pdf",
      client: { name: "Estudio Vega S.L.", nif: "B-87234512 · Madrid" },
      invoiceNum: "Factura FA-2026-0184",
      dates: "Emisión 18 Abr · Venc. 18 May",
      lines: [
        ["Rediseño web · Fase 1",  "1", "1.800€", "1.800€"],
        ["Identidad corporativa",  "1",  "950€",   "950€"],
        ["Sesión fotográfica",     "1",  "420€",   "420€"],
      ] as [string, string, string, string][],
      total: "3.836,00 €",
      status: "Pagada",
    },
    auto: {
      topbar: "automatizaciones / flow.builder",
      nodes: [
        { type: "trigger", label: "Cuando llega un lead nuevo",                  sub: "TRIGGER · formulario web",          colorBg: "#e7f0ff", colorFg: "#2a5ec6" },
        { type: "action",  label: "Asignar a vendedor según zona",               sub: "ACTION · reglas.geografía",         colorBg: undefined, colorFg: undefined },
        { type: "action",  label: "Enviar email de bienvenida",                  sub: "ACTION · plantilla/welcome_es",     colorBg: undefined, colorFg: undefined },
        { type: "delay",   label: "Seguimiento en 3 días si no responde",        sub: "DELAY · condicional",               colorBg: "#fff3e6", colorFg: "#a66300" },
      ],
    },
    ai: {
      topbar: "asistente.ia / chat",
      messages: [
        { role: "me" as const, text: "¿Cuánto facturé en Abril y qué cliente me debe más?" },
        { role: "ai" as const, text: "En Abril has facturado <b>14.280 €</b> (+18% vs Marzo).<br/>El cliente con más deuda es <b>Hotel Miramar</b>: <b>2.450 €</b> con 12 días de retraso. ¿Quiero enviar recordatorio?" },
        { role: "me" as const, text: "Sí, envía recordatorio amable." },
        { role: "ai" as const, text: "<b>Hecho.</b> Recordatorio enviado a facturación@hotelmiramar.com" },
      ],
    },
    reco: {
      topbar: "recomendaciones / today",
      dateLabel: "PRIORIDAD DE HOY · 20 ABR",
      cards: [
        { title: "Clara Ortiz lleva 4 días sin respuesta",       sub: "Lead cualificado · 1.200€ potencial",             badge: "Urgente",    tone: "hot" as const },
        { title: "Hotel Miramar tiene factura vencida",          sub: "2.450€ · 12 días de retraso",                     badge: "Cobrar",     tone: "hot" as const },
        { title: "Estudio Vega: enviar propuesta ampliación",    sub: "Cliente activo · 40% más probable de cerrar",     badge: "Oportunidad", tone: "warm" as const },
        { title: "Ramón Vela: 3 visitas web sin contacto",       sub: "Lead cálido · contactar hoy",                     badge: "Seguir",     tone: "warm" as const },
      ],
    },
  },
} as const

/* ─── Stats ──────────────────────────────────────────────────────── */

export const statsContent = {
  eyebrow: "Impacto",
  headline: "Números que hablan solos.",
  sub: "Resultados reales de negocios que ya usan ClientLabs.",
  stats: [
    { prefix: "−", value: 67, suffix: "%",    decimals: 0, label: "tiempo en gestión operativa" },
    { prefix: "+", value: 34, suffix: "%",    decimals: 0, label: "leads convertidos a clientes" },
    { prefix: "",  value: 2.4, suffix: "h/día", decimals: 1, label: "ahorradas por usuario" },
    { prefix: "",  value: 98, suffix: "%",    decimals: 0, label: "satisfacción de usuarios" },
  ],
  chart: {
    eyebrow: "Facturación media",
    headline: "+47% en 6 meses",
    months: ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"],
    before: [62, 58, 64, 66, 63, 68],
    after:  [62, 70, 82, 95, 108, 124],
    max: 130,
    legendBefore: "Antes",
    legendAfter: "Con ClientLabs",
  },
} as const

/* ─── Tasks ──────────────────────────────────────────────────────── */

export const tasksContent = {
  eyebrow: "Gestión de tareas",
  headline: "Proyectos y tareas.",
  headlineAccent: "Siempre bajo control.",
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
  metrics: [
    { value: "−62%",  label: "tareas manuales" },
    { value: "127",   label: "completadas / mes" },
    { value: "18/día", label: "auto-asignadas" },
  ],
  kanbanTopbar: "tareas · Q2 2026",
  kanbanCols: [
    {
      heading: "Pendiente",
      items: [
        ["Propuesta Hotel Miramar",    "Alta",  "Hoy"],
        ["Revisar factura FA-0184",    "Media", "28 Abr"],
        ["Llamar a Ramón Vela",        "Alta",  "Mañana"],
        ["Presupuesto Rest. Mirador",  "Baja",  "2 May"],
      ] as [string, string, string][],
    },
    {
      heading: "En proceso",
      items: [
        ["Landing · Estudio Vega",  "Media", "30 Abr"],
        ["Branding · A. Ferrer",    "Alta",  "29 Abr"],
        ["Newsletter Mayo",         "Baja",  "5 May"],
      ] as [string, string, string][],
    },
    {
      heading: "Revisión",
      items: [
        ["Contrato Tienda Sol",        "Alta",  "Hoy"],
        ["Sesión fotos Clara O.",      "Media", "24 Abr"],
      ] as [string, string, string][],
    },
  ],
} as const

/* ─── AI ─────────────────────────────────────────────────────────── */

export const aiContent = {
  eyebrow: "IA & Automatizaciones",
  headline: "La inteligencia que tu",
  headlineAccent: "negocio necesitaba.",
  sub: "Automatizaciones configurables, sugerencias en contexto y un asistente que conoce tu negocio.",
  features: [
    {
      icon: "bot" as const,
      title: "Asistente IA",
      desc: "Pregunta sobre tus leads, clientes o finanzas en lenguaje natural. Respuestas al instante con datos reales.",
    },
    {
      icon: "bolt" as const,
      title: "Automatizaciones",
      desc: "Reglas que actúan solas: seguimiento automático, facturas, recordatorios, asignaciones.",
    },
    {
      icon: "target" as const,
      title: "Recomendaciones",
      desc: "Sabe qué lead priorizar, qué cliente está en riesgo, qué cobrar primero.",
    },
  ],
  demo: {
    label: "ClientLabs · Asistente",
    sublabel: "responde en 0.4s · conoce tu negocio",
    messages: [
      { role: "me" as const, text: "¿Qué leads debería llamar hoy?" },
      { role: "ai" as const, text: "Tres prioritarios: <b>Clara Ortiz</b> (cualificado, 4 días sin seguimiento, 1.200€), <b>Ramón Vela</b> (3 visitas web ayer), <b>A. Ferrer</b> (abrió tu propuesta 2 veces). ¿Preparo recordatorios?" },
      { role: "me" as const, text: "¿Y cómo voy este mes vs el pasado?" },
      { role: "ai" as const, text: "Abril va un <b>+18%</b> vs Marzo (14.280€ vs 12.100€). Tasa de cierre del <b>34%</b>. Tu mejor cliente: <b>Estudio Vega</b> (3.836€). Próxima factura vence en 6 días: <b>Hotel Miramar 2.450€</b>." },
    ],
    chips: ["Sí, los tres", "Solo Clara", "Agendar llamadas"],
  },
} as const

/* ─── Carousel ───────────────────────────────────────────────────── */

export const carouselContent = {
  eyebrow: "Configuración",
  headline: "En marcha en",
  headlineAccent: "4 pasos sencillos.",
  progress: "01 — 04",
  progressHint: "desliza",
  slides: [
    {
      tone: "tone-navy" as const,
      num: "01",
      who: "Crea tu perfil",
      quote: "Añade tu información de negocio, logo y datos fiscales. Tu panel está listo en menos de 2 minutos.",
      impact: ["2 min", "para empezar"] as [string, string],
    },
    {
      tone: "tone-emerald" as const,
      num: "02",
      who: "Importa tus contactos",
      quote: "Sube tu lista de clientes y leads desde Excel, Notion o cualquier herramienta. Migración en un solo clic.",
      impact: ["1 clic", "para migrar"] as [string, string],
    },
    {
      tone: "tone-neutral" as const,
      num: "03",
      who: "Activa tu pipeline",
      quote: "Personaliza las etapas de tu proceso de ventas y empieza a mover oportunidades desde el primer día.",
      impact: ["0 código", "necesario"] as [string, string],
    },
    {
      tone: "tone-emerald" as const,
      num: "04",
      who: "Automatiza tu flujo",
      quote: "Configura seguimientos, recordatorios y facturas automáticas. Trabaja en lo que realmente importa.",
      impact: ["+2h/día", "ahorradas"] as [string, string],
    },
  ],
  ctaCard: {
    num: "05",
    eyebrow: "Empieza ya",
    headline: "Regístrate\ngratis hoy.",
    cta: { label: "Empezar gratis", href: "/register" },
    hint: "Sin tarjeta de crédito · cancela cuando quieras",
  },
} as const

/* ─── Pricing ────────────────────────────────────────────────────── */

export const pricingContent = {
  eyebrow: "Precios",
  headline: "Simple. Sin sorpresas.",
  sub: "Empieza gratis. Sin tarjeta. Sin límite de tiempo. Cuando estés listo, elige tu plan.",
  annualDiscount: "−20%",
  toggleLabels: { monthly: "Mensual", annual: "Anual" },
  plans: [
    {
      name: "Free",
      tag: "Para probar sin compromiso",
      monthly: 0,
      yearly: 0,
      yearlyBilled: 0,
      featured: false,
      featuredLabel: null,
      note: "Sin tarjeta · Sin límite de tiempo",
      cta: "Empezar gratis",
      features: [
        "50 leads totales · 20 clientes · 10 facturas/mes",
        "Panel de leads en tiempo real",
        "Pipeline visual básico",
        "1 formulario embebible",
        "Facturación PDF con marca de agua",
        "Historial de contactos",
        "Exportación CSV",
        "Soporte por email (48h)",
      ],
    },
    {
      name: "Pro",
      tag: "Para profesionales que quieren crecer",
      monthly: 14.99,
      yearly: 11.99,
      yearlyBilled: 143.88,
      featured: true,
      featuredLabel: "★ Más popular",
      note: "14 días gratis · Sin tarjeta",
      cta: "Empezar gratis 14 días",
      features: [
        "Leads, clientes y facturas ilimitados · 3 usuarios",
        "Sin marca de agua en facturas",
        "IA para calificar y puntuar leads",
        "Automatizaciones básicas (5 activas)",
        "Dashboards personalizables",
        "Google Calendar sync",
        "Soporte prioritario por chat (24h)",
      ],
    },
    {
      name: "Business",
      tag: "Para negocios que escalan",
      monthly: 29.99,
      yearly: 23.99,
      yearlyBilled: 287.88,
      featured: false,
      featuredLabel: null,
      note: "14 días gratis · Sin tarjeta",
      cta: "Empezar gratis 14 días",
      features: [
        "Todo ilimitado · Hasta 10 usuarios",
        "Todo lo del Pro",
        "IA avanzada con predicciones de cierre",
        "Automatizaciones ilimitadas",
        "Webhooks y API completa",
        "Verifactu incluido",
        "Soporte dedicado (videollamada mensual)",
      ],
    },
  ],
  faqsHeading: "Preguntas frecuentes",
  faqs: [
    [
      "¿El plan Free es realmente gratis?",
      "Sí. Sin tarjeta, sin trampas, sin límite de tiempo. Úsalo todo lo que quieras. Cuando necesites más leads, clientes o funciones, eliges un plan de pago.",
    ],
    [
      "¿Puedo cancelar cuando quiera?",
      "Sí. Sin permanencia ni penalización. Cancelas desde tu panel en un clic.",
    ],
    [
      "¿Mis datos son privados?",
      "Totalmente. Servidores en UE, cumplimiento RGPD, cifrado en tránsito y en reposo. Tú eres dueño de tus datos siempre.",
    ],
    [
      "¿Puedo migrar desde mi Excel / CRM actual?",
      "Sí. Importamos tus clientes, leads y facturas desde CSV, Excel o los CRM más comunes. Te ayudamos gratis.",
    ],
    [
      "¿Hay soporte en español?",
      "Claro. Todo el equipo es hispanohablante. Soporte por email en Free, chat prioritario en Pro, videollamada mensual en Business.",
    ],
  ] as [string, string][],
} as const

/* ─── Final CTA ──────────────────────────────────────────────────── */

export const finalCtaContent = {
  pill: "Tu negocio merece más",
  headline: "Tu negocio merece",
  headlineAccent: "un sistema.",
  sub: "Empieza gratis hoy. Sin tarjeta. Sin permanencia. Sin excusas.",
  ctas: {
    primary:   { label: "Empezar gratis",    href: "/register" },
    secondary: { label: "Ver demo en vivo",  href: "/demo" },
  },
  trust: [
    "14 días gratis",
    "Sin tarjeta",
    "Cancela cuando quieras",
    "Soporte en español",
  ],
} as const

/* ─── Footer ─────────────────────────────────────────────────────── */

export const footerContent = {
  brand: { name: "ClientLabs", tagline: "Tu negocio. Bajo control." },
  newsletter: { eyebrow: "Newsletter", placeholder: "tu@email.com", cta: "Suscribirme" },
  columns: [
    {
      heading: "Producto",
      links: ["CRM & Leads", "Tareas", "Facturación", "Automatizaciones", "Asistente IA", "Precios"],
    },
    {
      heading: "Empresa",
      links: ["Sobre nosotros", "Embajadores", "Empleo", "Prensa", "Contacto"],
    },
    {
      heading: "Recursos",
      links: ["Blog", "Guías", "Plantillas", "Novedades", "Estado del sistema"],
    },
    {
      heading: "Legal",
      links: ["Términos", "Privacidad", "Cookies", "RGPD", "Seguridad", "Declaración responsable"],
    },
  ],
  bottom: {
    copy: "© 2026 ClientLabs",
    version: "",
  },
} as const

/* ─── Barrel export ──────────────────────────────────────────────── */

export const landingContent = {
  navbar:    navbarContent,
  hero:      heroContent,
  problem:   problemContent,
  platform:  platformContent,
  stats:     statsContent,
  tasks:     tasksContent,
  ai:        aiContent,
  carousel:  carouselContent,
  pricing:   pricingContent,
  finalCta:  finalCtaContent,
  footer:    footerContent,
} as const

export type LandingContent = typeof landingContent
