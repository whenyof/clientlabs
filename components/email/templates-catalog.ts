export interface EmailTemplateDef {
  id: string
  name: string
  category: "onboarding" | "newsletter" | "marketing" | "transaccional"
  description: string
  blocks: number
  subject: string
  html: string
}

const TEAL = "#0F766E"
const NAVY = "#0B1F2A"
const AMBER = "#D97706"
const RED = "#DC2626"
const BLUE = "#1D4ED8"
const VIOLET = "#7C3AED"

function footer(): string {
  return `<tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
<p style="color:#94a3b8;font-size:12px;margin:0;font-family:system-ui,sans-serif;line-height:1.6;">
{{negocio}} · Has recibido este email porque estás en nuestra lista.<br>
<a href="#" style="color:#94a3b8;">Darse de baja</a>
</p>
</td></tr>`
}

function shell(headerBg: string, headerContent: string, bodyContent: string): string {
  return `<div style="background:#f0f4f8;padding:24px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
<tr><td style="background:${headerBg};padding:28px 32px;">${headerContent}</td></tr>
<tr><td style="padding:32px;color:#1e293b;font-size:15px;line-height:1.7;">${bodyContent}</td></tr>
${footer()}
</table>
</td></tr></table>
</div>`
}

function whiteHeader(title: string, subtitle?: string): string {
  return `<h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 4px;font-family:system-ui,sans-serif;">${title}</h1>
${subtitle ? `<p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${subtitle}</p>` : ""}`
}

function cta(label: string, color: string = TEAL): string {
  return `<div style="text-align:center;margin:24px 0;">
<a href="#" style="display:inline-block;background:${color};color:white;text-decoration:none;padding:13px 32px;border-radius:7px;font-weight:600;font-size:15px;font-family:system-ui,sans-serif;">${label}</a>
</div>`
}

function divider(): string {
  return `<div style="border-top:1px solid #e2e8f0;margin:20px 0;"></div>`
}

function step(n: number | string, title: string, desc: string, color: string = TEAL): string {
  return `<div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start;">
<div style="min-width:32px;height:32px;border-radius:50%;background:${color};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;flex-shrink:0;line-height:32px;text-align:center;">${n}</div>
<div><p style="font-weight:600;color:#1e293b;margin:4px 0 2px;font-family:system-ui,sans-serif;">${title}</p><p style="color:#64748b;font-size:14px;margin:0;font-family:system-ui,sans-serif;">${desc}</p></div>
</div>`
}

function metricCard(value: string, label: string, color: string = TEAL): string {
  return `<td style="text-align:center;padding:16px;">
<div style="font-size:28px;font-weight:800;color:${color};font-family:system-ui,sans-serif;">${value}</div>
<div style="font-size:12px;color:#64748b;margin-top:4px;font-family:system-ui,sans-serif;">${label}</div>
</td>`
}

function alert(color: string, icon: string, msg: string): string {
  return `<div style="background:${color}10;border-left:4px solid ${color};border-radius:4px;padding:14px 16px;margin-bottom:20px;">
<p style="color:${color};font-weight:600;font-size:15px;margin:0;font-family:system-ui,sans-serif;">${icon} ${msg}</p>
</div>`
}

function card(title: string, desc: string, accent: string = TEAL): string {
  return `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid ${accent};">
<p style="font-weight:600;color:#1e293b;margin:0 0 4px;font-family:system-ui,sans-serif;">${title}</p>
<p style="color:#64748b;font-size:14px;margin:0;font-family:system-ui,sans-serif;">${desc}</p>
</div>`
}

// ─── ONBOARDING ─────────────────────────────────────────────────────────────

const onboarding1 = shell(
  TEAL,
  whiteHeader("¡Bienvenido a {{negocio}}! 👋", "Estás a 3 pasos de empezar"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Nos alegra muchísimo que estés aquí. Para que aproveches todo desde el primer día, sigue estos tres pasos:</p>
${step(1, "Completa tu perfil", "Añade tu nombre, empresa y foto para personalizar tu experiencia.")}
${step(2, "Conecta tus datos", "Importa tus clientes o crea el primero manualmente — tarda 2 minutos.")}
${step(3, "Crea tu primer documento", "Una factura, un presupuesto o un albarán — tú eliges por dónde empezar.")}
${cta("Empezar ahora →", TEAL)}
<p style="color:#64748b;font-size:14px;">Si tienes cualquier duda, responde a este email. Somos personas reales y respondemos en menos de 24h.</p>
<p>Un saludo,<br><strong>El equipo de {{negocio}}</strong></p>`
)

const onboarding2 = shell(
  BLUE,
  whiteHeader("Tu guía de inicio en 3 minutos", "Todo lo que necesitas para arrancar"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Hemos preparado esta guía rápida para que puedas sacar el máximo partido desde hoy:</p>
<div style="background:#f0f9ff;border-radius:8px;padding:20px;margin:16px 0;">
${["Configura tu perfil de empresa (logo, datos fiscales)", "Añade tu primer cliente en menos de 1 minuto", "Crea y envía tu primera factura o presupuesto"].map((t, i) => `<div style="display:flex;gap:12px;margin-bottom:12px;align-items:center;"><span style="min-width:22px;height:22px;background:${BLUE};color:white;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;font-family:system-ui,sans-serif;flex-shrink:0;">${i + 1}</span><span style="font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</span></div>`).join("")}
</div>
<div style="background:#e2e8f0;border-radius:4px;height:8px;margin:20px 0;">
<div style="background:${BLUE};width:33%;height:8px;border-radius:4px;"></div>
</div>
<p style="font-size:13px;color:#64748b;text-align:center;margin-top:-12px;font-family:system-ui,sans-serif;">Paso 1 de 3 completado</p>
${cta("Completar mi configuración", BLUE)}
<p>Un saludo,<br><strong>{{usuario.nombre}}</strong></p>`
)

const onboarding3 = shell(
  "#475569",
  whiteHeader("¿Cómo va todo por el momento?", "Día 3 — aquí tienes ayuda"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Han pasado unos días desde que empezaste y quería asegurarme de que todo va bien. Si tienes alguna duda, aquí tienes dos recursos que lo resuelven todo:</p>
${card("Centro de ayuda", "Guías paso a paso, vídeos y respuestas a las preguntas más frecuentes.", "#475569")}
${card("Hablar con soporte", "Respondo en menos de 2 horas en horario laboral.", TEAL)}
${divider()}
<p style="font-size:14px;color:#64748b;">¿Hay algo específico en lo que pueda ayudarte? Responde directamente a este email.</p>
${cta("Ir al centro de ayuda →", "#475569")}
<p>Un saludo,<br><strong>{{usuario.nombre}}</strong></p>`
)

const onboarding4 = shell(
  TEAL,
  `<div style="text-align:center;">${whiteHeader("🎉 ¡Lo conseguiste!", "Tutorial completado")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p style="font-size:16px;">Has completado el tutorial inicial. Eso significa que ya sabes lo esencial para gestionar tu negocio con {{negocio}}.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
<div style="font-size:32px;margin-bottom:8px;">🏆</div>
<p style="font-weight:700;color:#15803d;font-size:16px;margin:0;font-family:system-ui,sans-serif;">Logro desbloqueado: Primeros pasos</p>
</div>
<p><strong>Siguiente nivel:</strong> prueba a crear tu primera campaña de email o a configurar el seguimiento de documentos.</p>
${cta("Ver qué más puedo hacer", TEAL)}
<p>Un saludo,<br><strong>El equipo de {{negocio}}</strong></p>`
)

const onboarding5 = shell(
  NAVY,
  whiteHeader("Tu primera semana en números 📊", "Semana 1 — resumen de actividad"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Esta es tu actividad durante tu primera semana:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
<tr>${metricCard("3", "Documentos creados", TEAL)}${metricCard("1", "Clientes añadidos", BLUE)}${metricCard("100%", "Perfil completado", "#16a34a")}</tr>
</table>
${divider()}
<p><strong>Consejo de la semana:</strong> Los clientes que revisan sus documentos online aceptan un <strong>40% más rápido</strong>. Activa el tracking en tus siguientes envíos.</p>
${cta("Explorar más funciones", NAVY)}
<p>Un saludo,<br><strong>El equipo de {{negocio}}</strong></p>`
)

const onboarding6 = shell(
  VIOLET,
  whiteHeader("Trabaja mejor con tu equipo", "Invita a tus colaboradores"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>¿Trabajas con socios, empleados o colaboradores? Invítalos a {{negocio}} y gestionad todo desde un solo sitio.</p>
<div style="margin:20px 0;">
${["Cada miembro tiene su propio acceso seguro", "Puedes controlar qué puede ver y editar cada uno", "Todo sincronizado en tiempo real — sin confusiones"].map(t => `<div style="display:flex;gap:10px;margin-bottom:10px;align-items:flex-start;"><span style="color:${VIOLET};font-weight:700;font-family:system-ui,sans-serif;">✓</span><span style="font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</span></div>`).join("")}
</div>
${cta("Invitar a mi equipo →", VIOLET)}
<p style="font-size:13px;color:#64748b;">También puedes hacerlo más adelante desde Configuración → Equipo.</p>
<p>Un saludo,<br><strong>{{usuario.nombre}}</strong></p>`
)

const onboarding7 = shell(
  AMBER,
  whiteHeader("⚠️ Te falta un paso importante", "Completa tu configuración para no perder funciones"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
${alert(AMBER, "⚠️", "Tu configuración está incompleta")}
<p>Falta añadir los datos fiscales de tu empresa. Sin ellos, tus facturas no tendrán los datos legales obligatorios.</p>
<div style="background:#fffbeb;border-radius:8px;padding:16px;margin:16px 0;">
<p style="font-weight:600;color:#92400e;margin:0 0 8px;font-family:system-ui,sans-serif;">¿Qué pierdes si no lo completas?</p>
<ul style="color:#92400e;font-size:14px;margin:0;padding-left:20px;font-family:system-ui,sans-serif;line-height:1.8;">
<li>Facturas sin validez fiscal</li>
<li>No podrás usar Verifactu</li>
<li>Tu empresa no aparece en los documentos</li>
</ul>
</div>
${cta("Completar ahora (2 minutos)", AMBER)}
<p>Un saludo,<br><strong>El equipo de {{negocio}}</strong></p>`
)

const onboarding8 = shell(
  TEAL,
  whiteHeader("Desbloquea todo el potencial ✨", "Descubre lo que incluye el plan Pro"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Llevas un tiempo usando el plan gratuito. Si quieres ir más rápido, el plan Pro lo hace posible:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
<tr style="background:#f8fafc;">
<th style="padding:10px 16px;text-align:left;font-size:13px;color:#64748b;font-weight:600;font-family:system-ui,sans-serif;width:50%;">GRATIS</th>
<th style="padding:10px 16px;text-align:left;font-size:13px;color:white;font-weight:600;font-family:system-ui,sans-serif;background:${TEAL};width:50%;">PRO ✨</th>
</tr>
${[["5 facturas/mes","Facturas ilimitadas"],["1 usuario","Hasta 5 usuarios"],["Sin tracking","Tracking completo"],["Sin email marketing","Email marketing incluido"]].map(([f, p]) => `<tr><td style="padding:10px 16px;font-size:14px;color:#64748b;border-top:1px solid #e2e8f0;font-family:system-ui,sans-serif;">${f}</td><td style="padding:10px 16px;font-size:14px;color:#0f766e;font-weight:600;border-top:1px solid #e2e8f0;font-family:system-ui,sans-serif;">✓ ${p}</td></tr>`).join("")}
</table>
${cta("Actualizar a Pro — 29,99€/mes", TEAL)}
<p style="font-size:13px;color:#64748b;text-align:center;">30 días de garantía de devolución. Sin permanencia.</p>`
)

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────

const newsletter1 = shell(
  NAVY,
  `${whiteHeader("📰 Lo más importante de la semana", "Semana {{N}} · {{fecha}}")}`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Aquí va la selección de esta semana — lo que vale la pena leer, sin ruido.</p>
${divider()}
${[["Título del artículo principal", "Un resumen breve de 2-3 líneas que despierte la curiosidad del lector y le invite a seguir leyendo el artículo completo."],["Segunda noticia o recurso","Otro extracto corto con el punto más interesante. Siempre desde el ángulo que más le importa a tu audiencia."],["Herramienta o recurso de la semana","Algo práctico que puedan usar hoy mismo. Cuánto más aplicable, mejor."]].map(([t, s]) => `<div style="margin-bottom:20px;"><p style="font-weight:700;color:#1e293b;margin:0 0 4px;font-family:system-ui,sans-serif;">${t}</p><p style="color:#64748b;font-size:14px;margin:0 0 8px;font-family:system-ui,sans-serif;">${s}</p><a href="#" style="color:${TEAL};font-size:14px;font-weight:600;font-family:system-ui,sans-serif;">Leer más →</a></div>`).join(divider())}
${divider()}
<p style="font-size:14px;color:#64748b;">Para terminar: [reflexión personal breve o cita que inspire]</p>
<p>Hasta la semana que viene,<br><strong>{{usuario.nombre}}</strong></p>`
)

const newsletter2 = shell(
  NAVY,
  whiteHeader("📆 {{mes}} en {{negocio}} — lo que pasó", "Resumen mensual"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Un mes más y me alegra poder compartir lo más relevante contigo:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
<tr>${metricCard("{{N1}}", "Destacado del mes", TEAL)}${metricCard("{{N2}}", "Segundo hito", BLUE)}${metricCard("{{N3}}", "Tercer dato", VIOLET)}</tr>
</table>
${divider()}
${["Primer highlight del mes — lo más importante que ocurrió o aprendiste.", "Segundo highlight — un logro, aprendizaje o novedad relevante.", "Lo que viene el próximo mes — adelanto de lo que tus suscriptores pueden esperar."].map((t, i) => `<div style="display:flex;gap:12px;margin-bottom:14px;"><span style="min-width:24px;height:24px;background:${TEAL};color:white;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:24px;font-family:system-ui,sans-serif;flex-shrink:0;">${i + 1}</span><p style="margin:0;color:#1e293b;font-size:14px;font-family:system-ui,sans-serif;">${t}</p></div>`).join("")}
${cta("Ver el resumen completo →", NAVY)}
<p>Hasta el próximo mes,<br><strong>{{usuario.nombre}}</strong></p>`
)

const newsletter3 = shell(
  TEAL,
  whiteHeader("📖 Esto tienes que leer esta semana", "Artículo destacado"),
  `<div style="background:#f8fafc;border-radius:8px;height:140px;margin-bottom:20px;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:13px;font-family:system-ui,sans-serif;">[Imagen del artículo]</p></div>
<h2 style="font-size:20px;font-weight:700;color:#1e293b;margin:0 0 8px;font-family:system-ui,sans-serif;">[Título del artículo]</h2>
<p style="color:#475569;font-size:14px;line-height:1.7;">Extracto largo del artículo que enganche al lector desde el primer párrafo. Cuenta el problema que resuelve el artículo y por qué es relevante para tu audiencia en este momento concreto. No reveles la solución completa — solo lo suficiente para que quieran leer más.</p>
<p style="color:#475569;font-size:14px;line-height:1.7;">Segundo párrafo con más contexto o el punto más sorprendente del artículo. Algo que genere curiosidad o que no sea obvio.</p>
${cta("Leer el artículo completo →", TEAL)}
<p style="font-size:13px;color:#94a3b8;text-align:center;">Tiempo de lectura estimado: X minutos</p>`
)

const newsletter4 = shell(
  VIOLET,
  `<div style="display:inline-block;background:white;color:${VIOLET};padding:4px 10px;border-radius:4px;font-size:11px;font-weight:700;margin-bottom:12px;font-family:system-ui,sans-serif;">✨ NUEVO</div>${whiteHeader("Presentamos [nombre del feature]", "Ya disponible para todos los usuarios")}`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Llevábamos tiempo trabajando en esto y por fin está listo. <strong>[Nombre del feature]</strong> ya está disponible en tu cuenta.</p>
<div style="background:#f8fafc;border-radius:8px;height:120px;margin:16px 0;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:13px;font-family:system-ui,sans-serif;">[Imagen o GIF del feature]</p></div>
<p><strong>Por qué lo hicimos:</strong> [Explica el problema que resolvía y cómo pensasteis en la solución].</p>
<div style="background:#f3edff;border-radius:8px;padding:16px;margin:16px 0;">
<p style="font-weight:700;color:${VIOLET};margin:0 0 8px;font-family:system-ui,sans-serif;">Beneficio clave</p>
<p style="color:#4c1d95;font-size:14px;margin:0;font-family:system-ui,sans-serif;">[Describe el beneficio principal en una frase directa y concreta. Evita el lenguaje corporativo.]</p>
</div>
${cta("Probar ahora →", VIOLET)}`
)

const newsletter5 = shell(
  TEAL,
  whiteHeader("Cómo {{cliente}} consiguió {{resultado}}", "Caso de uso real"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<div style="display:flex;gap:16px;margin:16px 0;align-items:flex-start;">
<div style="width:56px;height:56px;border-radius:50%;background:#e2e8f0;flex-shrink:0;"></div>
<div>
<p style="font-weight:700;color:#1e293b;margin:0;font-family:system-ui,sans-serif;">{{cliente}}</p>
<p style="color:#64748b;font-size:13px;margin:4px 0 0;font-family:system-ui,sans-serif;">[Sector · Ciudad]</p>
</div>
</div>
<div style="background:#f0fdf4;border-left:4px solid ${TEAL};padding:16px;border-radius:4px;margin:16px 0;">
<p style="font-style:italic;color:#15803d;font-size:16px;margin:0;font-family:system-ui,sans-serif;">"[Cita del cliente sobre el resultado o experiencia. Cuanto más específica y con números, mejor.]"</p>
</div>
${["La situación inicial — cuál era el problema o el punto de partida.", "Qué hicieron — cómo usaron la herramienta o qué estrategia aplicaron.", `El resultado — ${"{"}resultado concreto con métricas o cifras si es posible${"}"}` ].map((t, i) => `<div style="display:flex;gap:10px;margin-bottom:12px;"><span style="color:${TEAL};font-weight:700;font-family:system-ui,sans-serif;">${i + 1}.</span><p style="margin:0;font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</p></div>`).join("")}
${cta("Leer el caso completo →", TEAL)}`
)

const newsletter6 = shell(
  BLUE,
  whiteHeader("5 trucos que probablemente no conocías 💡", "Tips de la semana"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Esta semana, cinco trucos que me hubiera gustado conocer antes:</p>
${[1,2,3,4,5].map(n => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;"><span style="min-width:28px;height:28px;background:${BLUE};color:white;border-radius:50%;font-size:13px;font-weight:700;text-align:center;line-height:28px;font-family:system-ui,sans-serif;flex-shrink:0;">${n}</span><div><p style="font-weight:600;color:#1e293b;margin:0 0 4px;font-family:system-ui,sans-serif;">Tip ${n}: [Título del truco]</p><p style="color:#64748b;font-size:14px;margin:0;font-family:system-ui,sans-serif;">[Explica el truco en 1-2 frases. Sé concreto y accionable.]</p></div></div>`).join("")}
<div style="background:#eff6ff;border-radius:8px;padding:14px;margin-top:16px;">
<p style="font-weight:600;color:${BLUE};margin:0 0 4px;font-family:system-ui,sans-serif;">🎁 Bonus</p>
<p style="color:#1d4ed8;font-size:14px;margin:0;font-family:system-ui,sans-serif;">[Un truco extra que no estaban esperando]</p>
</div>
<p>Hasta la próxima,<br><strong>{{usuario.nombre}}</strong></p>`
)

const newsletter7 = shell(
  "#0ea5e9",
  `<div style="text-align:center;">${whiteHeader("📅 Te esperamos el {{fecha}} a las {{hora}}", "{{nombre_evento}}")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Quería invitarte a <strong>{{nombre_evento}}</strong>, un evento gratuito sobre [tema] que creo que te va a resultar muy útil.</p>
<div style="background:#f0f9ff;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
<div style="font-size:28px;font-weight:800;color:#0ea5e9;font-family:system-ui,sans-serif;">{{fecha}}</div>
<div style="color:#0284c7;font-size:16px;font-weight:600;font-family:system-ui,sans-serif;">{{hora}} (hora peninsular)</div>
<div style="color:#64748b;font-size:14px;margin-top:4px;font-family:system-ui,sans-serif;">{{formato}} · {{duración}}</div>
</div>
<p><strong>¿Qué veremos?</strong></p>
${["Punto 1 de la agenda — lo que aprenderán en la primera parte", "Punto 2 — el bloque principal del evento", "Sesión de preguntas y respuestas — al final"].map((t, i) => `<div style="display:flex;gap:10px;margin-bottom:8px;"><span style="color:#0ea5e9;font-weight:700;font-family:system-ui,sans-serif;">→</span><p style="margin:0;font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</p></div>`).join("")}
${cta("Reservar mi plaza →", "#0ea5e9")}
<p style="font-size:13px;color:#64748b;text-align:center;">Plazas limitadas. Recibirás el enlace de acceso el día anterior.</p>`
)

const newsletter8 = shell(
  NAVY,
  whiteHeader("2 minutos para mejorar juntos 🤝", "Tu opinión nos importa de verdad"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Llevamos un tiempo trabajando juntos y quería pedirte algo muy sencillo: que me digas cómo lo estamos haciendo.</p>
<p><strong>¿Cómo valoras tu experiencia hasta ahora?</strong></p>
<div style="display:flex;gap:10px;margin:20px 0;justify-content:center;">
${[["😍","Genial"],["😊","Bien"],["😐","Regular"],["😟","Mal"]].map(([e,l]) => `<a href="#" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;min-width:64px;"><span style="font-size:24px;">${e}</span><span style="font-size:12px;color:#64748b;font-family:system-ui,sans-serif;">${l}</span></a>`).join("")}
</div>
${divider()}
<p style="font-size:14px;color:#64748b;">¿Algo más que quieras contarme? Responde directamente a este email — lo leo todo.</p>
<p>Muchas gracias de antemano,<br><strong>{{usuario.nombre}}</strong></p>`
)

// ─── MARKETING ───────────────────────────────────────────────────────────────

const marketing1 = shell(
  TEAL,
  whiteHeader("{{cliente}} aumentó un {{X}}% con {{negocio}}", "Caso de éxito"),
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<div style="display:flex;gap:16px;margin:16px 0;padding:16px;background:#f8fafc;border-radius:8px;align-items:center;">
<div style="width:48px;height:48px;border-radius:8px;background:#e2e8f0;flex-shrink:0;"></div>
<div><p style="font-weight:700;color:#1e293b;margin:0;font-family:system-ui,sans-serif;">{{cliente}}</p><p style="color:#64748b;font-size:13px;margin:0;font-family:system-ui,sans-serif;">[Sector · Tamaño]</p></div>
</div>
<table width="100%" cellpadding="0" cellspacing="0"><tr>${metricCard("+{{X}}%", "Aumento en [métrica]", TEAL)}${metricCard("{{N}}", "{{unidad}}", BLUE)}${metricCard("{{tiempo}}", "Para ver resultados", "#16a34a")}</tr></table>
<div style="background:#f0fdf4;border-left:4px solid ${TEAL};padding:16px;margin:16px 0;border-radius:4px;">
<p style="font-style:italic;color:#15803d;margin:0;font-family:system-ui,sans-serif;">"[Cita del cliente sobre el resultado específico que consiguieron con vuestro servicio]"</p>
</div>
<p style="font-size:14px;color:#475569;">[Historia breve: situación inicial + qué hicieron + resultado. 3-4 frases.]</p>
${cta("Leer el caso completo →", TEAL)}`
)

const marketing2 = shell(
  RED,
  `<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;margin-bottom:12px;">
<p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;letter-spacing:0.1em;margin:0;font-family:system-ui,sans-serif;">OFERTA FLASH · SOLO 24 HORAS</p>
<div style="font-size:36px;font-weight:900;color:white;font-family:system-ui,sans-serif;letter-spacing:-0.02em;">{{descuento}}%</div>
<p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;font-family:system-ui,sans-serif;">en {{producto_o_servicio}}</p>
</div>
${whiteHeader("⚡ Oferta flash — termina hoy", "")}`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
${alert(RED, "⏰", "Esta oferta expira a las 23:59 de hoy")}
<p>Para celebrar [motivo], durante las próximas 24 horas puedes conseguir {{producto_o_servicio}} con un <strong>{{descuento}}% de descuento</strong>.</p>
<div style="background:#fef2f2;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
<p style="font-size:28px;font-weight:800;color:${RED};margin:0;font-family:system-ui,sans-serif;">{{precio_antes}} € → <span style="color:#15803d;">{{precio_ahora}} €</span></p>
<p style="color:#dc2626;font-size:13px;margin:4px 0 0;font-family:system-ui,sans-serif;">Ahorras {{ahorro}} €</p>
</div>
<p style="font-size:13px;color:#64748b;">Condiciones: oferta válida hasta las 23:59 del {{fecha}}. No acumulable con otras promociones.</p>
${cta("Aprovechar la oferta ahora →", RED)}`
)

const marketing3 = shell(
  NAVY,
  `<div style="text-align:center;"><p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.08em;margin:0 0 8px;font-family:system-ui,sans-serif;">NUEVO PRODUCTO</p>${whiteHeader("Presentamos [nombre]", "Disponible a partir de hoy")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Después de meses de trabajo, hoy lanzamos algo de lo que estamos muy orgullosos: <strong>[nombre del producto]</strong>.</p>
<div style="background:#f8fafc;border-radius:8px;height:120px;margin:16px 0;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:13px;font-family:system-ui,sans-serif;">[Imagen del producto]</p></div>
${["[Característica 1] — beneficio concreto que resuelve", "[Característica 2] — segundo punto diferencial", "[Característica 3] — ventaja frente a alternativas"].map((t, i) => `<div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;"><span style="min-width:28px;height:28px;background:${TEAL};color:white;border-radius:50%;font-size:13px;font-weight:700;text-align:center;line-height:28px;font-family:system-ui,sans-serif;flex-shrink:0;">${i + 1}</span><p style="margin:0;font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</p></div>`).join("")}
<div style="text-align:center;margin:20px 0;"><p style="font-size:28px;font-weight:800;color:#1e293b;font-family:system-ui,sans-serif;">{{precio}} €<span style="font-size:14px;color:#64748b;font-weight:400;"> / {{periodo}}</span></p></div>
${cta("Quiero empezar →", TEAL)}`
)

const marketing4 = shell(
  TEAL,
  `<div style="text-align:center;"><p style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;letter-spacing:0.08em;margin:0 0 6px;font-family:system-ui,sans-serif;">✨ EXCLUSIVO PARA TI</p>${whiteHeader("{{X}}% de descuento solo para {{nombre}}", "")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Como parte de nuestros clientes de confianza, tienes acceso a una oferta que no hemos publicado en ningún otro sitio:</p>
<div style="border:2px dashed ${TEAL};border-radius:10px;padding:20px;text-align:center;margin:20px 0;background:#f0fdf4;">
<p style="font-size:13px;font-weight:600;color:#64748b;margin:0 0 4px;font-family:system-ui,sans-serif;">TU CÓDIGO EXCLUSIVO</p>
<div style="font-size:26px;font-weight:900;letter-spacing:0.15em;color:${TEAL};font-family:ui-monospace,monospace;">{{CODIGO}}</div>
<p style="font-size:13px;color:#64748b;margin:4px 0 0;font-family:system-ui,sans-serif;">Válido hasta {{fecha_limite}}</p>
</div>
${cta("Usar mi descuento →", TEAL)}
<p style="font-size:13px;color:#64748b;text-align:center;">Descuento del {{X}}% aplicable a [productos/servicios incluidos].</p>`
)

const marketing5 = shell(
  "#475569",
  `<div style="text-align:center;">${whiteHeader("🛒 Olvidaste algo en tu carrito", "")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Vimos que estuviste mirando <strong>[nombre del producto]</strong> y no terminaste la compra. ¿Todo bien?</p>
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;display:flex;gap:16px;align-items:center;">
<div style="width:72px;height:72px;background:#f8fafc;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"><span style="font-size:28px;">📦</span></div>
<div style="flex:1;"><p style="font-weight:700;color:#1e293b;margin:0 0 4px;font-family:system-ui,sans-serif;">[Nombre del producto]</p><p style="color:#64748b;font-size:14px;margin:0;font-family:system-ui,sans-serif;">[Descripción breve]</p><p style="font-size:20px;font-weight:800;color:${TEAL};margin:6px 0 0;font-family:system-ui,sans-serif;">{{precio}} €</p></div>
</div>
<p style="font-size:14px;color:#64748b;">Si tienes alguna duda antes de comprar, responde a este email y te ayudo personalmente.</p>
${cta("Completar mi compra →", TEAL)}
<p style="font-size:13px;color:#94a3b8;text-align:center;">Tu carrito se guardará durante 48 horas.</p>`
)

const marketing6 = shell(
  VIOLET,
  `<div style="text-align:center;">${whiteHeader("Te echamos de menos 👋", "Han pasado {{dias}} días sin verte")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Llevas un tiempo sin aparecer por {{negocio}} y quería escribirte. ¿Todo bien por ahí?</p>
<p>Desde tu última visita han pasado cosas:</p>
${card("Novedad 1 — [nombre]", "Breve descripción de algo nuevo que añadisteis desde su última visita.", VIOLET)}
${card("Novedad 2 — [nombre]", "Otra mejora o feature que no conocen. Hazlo concreto y relevante para ellos.", VIOLET)}
<div style="background:#f3edff;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
<p style="color:${VIOLET};font-weight:600;font-size:15px;margin:0 0 4px;font-family:system-ui,sans-serif;">Oferta de regreso</p>
<p style="color:#4c1d95;font-size:14px;margin:0;font-family:system-ui,sans-serif;">{{X}}% de descuento en tu próxima compra — solo para ti, hasta el {{fecha}}.</p>
</div>
${cta("Volver a {{negocio}} →", VIOLET)}
<p style="font-size:13px;color:#94a3b8;text-align:center;"><a href="#" style="color:#94a3b8;">No quiero volver · Darme de baja</a></p>`
)

const marketing7 = shell(
  AMBER,
  `<div style="text-align:center;"><p style="color:rgba(255,255,255,0.8);font-size:12px;font-weight:600;letter-spacing:0.08em;margin:0 0 6px;font-family:system-ui,sans-serif;">🍂 ESPECIAL {{TEMPORADA}}</p>${whiteHeader("Ofertas seleccionadas para esta temporada", "")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Hemos preparado una selección especial para {{temporada}}. Estas son nuestras recomendaciones:</p>
${[1,2,3].map(n => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:12px;display:flex;gap:14px;align-items:flex-start;">
<div style="width:60px;height:60px;background:#fef3c7;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;">🎁</div>
<div style="flex:1;"><p style="font-weight:700;color:#1e293b;margin:0 0 4px;font-family:system-ui,sans-serif;">[Producto ${n}]</p><p style="color:#64748b;font-size:13px;margin:0 0 6px;font-family:system-ui,sans-serif;">[Descripción breve del producto o servicio]</p><span style="font-size:16px;font-weight:800;color:${AMBER};font-family:system-ui,sans-serif;">{{precio_${n}}} €</span></div>
</div>`).join("")}
${cta("Ver toda la selección →", AMBER)}`
)

const marketing8 = shell(
  TEAL,
  `<div style="text-align:center;">${whiteHeader("Gana {{X}}€ por cada amigo que traigas 🎁", "Programa de referidos")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Tienes algo muy valioso: la confianza de las personas que te rodean. Por eso queremos recompensarte cuando nos recomiendes.</p>
<div style="margin:20px 0;">
${["Comparte tu enlace único con quien quieras", "Tu amigo/a se registra y hace su primera compra", "Tú recibes {{X}}€ en tu cuenta automáticamente"].map((t, i) => `<div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start;">
<div style="min-width:36px;height:36px;border-radius:50%;background:${TEAL};color:white;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;flex-shrink:0;line-height:36px;text-align:center;">${i + 1}</div>
<p style="margin:6px 0 0;font-size:14px;color:#1e293b;font-family:system-ui,sans-serif;">${t}</p></div>`).join("")}
</div>
<div style="background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
<p style="font-size:28px;font-weight:900;color:${TEAL};margin:0;font-family:system-ui,sans-serif;">{{X}}€ por referido</p>
<p style="color:#15803d;font-size:14px;margin:4px 0 0;font-family:system-ui,sans-serif;">Sin límite de referidos. Sin caducidad.</p>
</div>
${cta("Obtener mi enlace de referido →", TEAL)}
<p style="font-size:12px;color:#94a3b8;text-align:center;">El referido se acredita tras 30 días de actividad del nuevo cliente.</p>`
)

// ─── TRANSACCIONAL ───────────────────────────────────────────────────────────

const transaccional1 = shell(
  "#16a34a",
  `<div style="text-align:center;"><div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.2);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:28px;">✓</div>${whiteHeader("Pago confirmado — gracias", "Pedido #{{N}}")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Hemos recibido tu pago correctamente. Aquí tienes el resumen:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:16px 0;">
<tr style="background:#f8fafc;"><th style="padding:10px 16px;text-align:left;font-size:13px;color:#64748b;font-weight:600;font-family:system-ui,sans-serif;">Concepto</th><th style="padding:10px 16px;text-align:right;font-size:13px;color:#64748b;font-weight:600;font-family:system-ui,sans-serif;">Importe</th></tr>
${["[Producto o servicio principal]","[Concepto 2 si aplica]"].map((c, i) => `<tr><td style="padding:10px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;font-family:system-ui,sans-serif;">${c}</td><td style="padding:10px 16px;font-size:14px;color:#1e293b;border-top:1px solid #e2e8f0;text-align:right;font-family:system-ui,sans-serif;">{{precio_${i+1}}} €</td></tr>`).join("")}
<tr style="background:#f0fdf4;"><td style="padding:12px 16px;font-weight:700;color:#15803d;border-top:1px solid #bbf7d0;font-family:system-ui,sans-serif;">TOTAL</td><td style="padding:12px 16px;font-weight:800;font-size:18px;color:#15803d;border-top:1px solid #bbf7d0;text-align:right;font-family:system-ui,sans-serif;">{{total}} €</td></tr>
</table>
${step(1, "Accede a tu cuenta", "Encuentra todos tus documentos y facturas en el dashboard.", "#16a34a")}
${step(2, "Descarga tu factura", "Disponible en Configuración → Facturas.", "#16a34a")}
<p style="font-size:14px;color:#64748b;">¿Alguna duda? Escríbenos a <a href="mailto:{{email_soporte}}" style="color:${TEAL};">{{email_soporte}}</a></p>`
)

const transaccional2 = shell(
  AMBER,
  `<div style="text-align:center;">${whiteHeader("⏰ Tu factura vence en {{N}} días", "Recordatorio de pago")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
${alert(AMBER, "⏰", `La factura #{{numero}} vence el {{fecha_vencimiento}}`)}
<div style="border:1px solid #fde68a;border-radius:8px;padding:16px;background:#fffbeb;margin:16px 0;">
<table width="100%" cellpadding="0" cellspacing="0">
${[["Número de factura","#{{numero}}"],["Fecha de emisión","{{fecha_emision}}"],["Fecha límite de pago","{{fecha_vencimiento}}"]].map(([l,v]) => `<tr><td style="padding:6px 0;font-size:14px;color:#92400e;font-family:system-ui,sans-serif;">${l}</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#92400e;text-align:right;font-family:system-ui,sans-serif;">${v}</td></tr>`).join("")}
<tr style="border-top:2px solid #fde68a;"><td style="padding:10px 0;font-size:15px;font-weight:700;color:#92400e;font-family:system-ui,sans-serif;">IMPORTE TOTAL</td><td style="padding:10px 0;font-size:20px;font-weight:900;color:#92400e;text-align:right;font-family:system-ui,sans-serif;">{{total}} €</td></tr>
</table>
</div>
${cta("Pagar ahora →", AMBER)}
<p style="font-size:13px;color:#64748b;">Si ya has realizado el pago, ignora este mensaje. ¿Problemas? Responde a este email.</p>`
)

const transaccional3 = shell(
  TEAL,
  `<div style="text-align:center;">${whiteHeader("Tu factura #{{numero}} está lista", "Puedes descargarla cuando quieras")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Adjunto encontrarás tu factura correspondiente al periodo <strong>{{periodo}}</strong>.</p>
<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:16px 0;">
<div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0;">
<p style="font-weight:600;color:#1e293b;margin:0;font-family:system-ui,sans-serif;">Datos de factura</p>
</div>
<div style="padding:16px;">
${[["Emisor","{{negocio}}"],["Receptor","{{nombre_empresa}}"],["NIF/CIF","{{nif}}"],["Número de factura","#{{numero}}"],["Período","{{periodo}}"]].map(([l,v]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#64748b;font-family:system-ui,sans-serif;">${l}</span><span style="font-size:13px;font-weight:600;color:#1e293b;font-family:system-ui,sans-serif;">${v}</span></div>`).join("")}
<div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="font-size:15px;font-weight:700;color:#1e293b;font-family:system-ui,sans-serif;">Total</span><span style="font-size:18px;font-weight:800;color:${TEAL};font-family:system-ui,sans-serif;">{{total}} € (IVA incluido)</span></div>
</div>
</div>
${cta("Descargar PDF →", TEAL)}
<p style="font-size:13px;color:#64748b;">¿Necesitas que modifiquemos algún dato? Contáctanos antes de la fecha límite de rectificación.</p>`
)

const transaccional4 = shell(
  "#16a34a",
  `<div style="text-align:center;"><div style="font-size:40px;margin-bottom:8px;">🚀</div>${whiteHeader("Tu plan {{plan}} está activo", "Suscripción confirmada")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Tu suscripción al plan <strong>{{plan}}</strong> se ha activado correctamente. Esto es lo que tienes disponible:</p>
<div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:16px 0;">
${["[Feature incluida 1]","[Feature incluida 2]","[Feature incluida 3]","[Feature incluida 4]"].map(f => `<div style="display:flex;gap:10px;margin-bottom:8px;"><span style="color:#16a34a;font-weight:700;font-family:system-ui,sans-serif;">✓</span><span style="font-size:14px;color:#15803d;font-family:system-ui,sans-serif;">${f}</span></div>`).join("")}
</div>
${divider()}
<table width="100%" cellpadding="0" cellspacing="0">
${[["Plan activo","{{plan}}"],["Fecha de inicio","{{fecha_inicio}}"],["Próxima renovación","{{fecha_renovacion}}"],["Importe","{{precio}} €/mes"]].map(([l,v]) => `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;font-family:system-ui,sans-serif;">${l}</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;text-align:right;font-family:system-ui,sans-serif;">${v}</td></tr>`).join("")}
</table>
${cta("Ir a mi dashboard →", "#16a34a")}`
)

const transaccional5 = shell(
  BLUE,
  `<div style="text-align:center;"><p style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;letter-spacing:0.08em;margin:0 0 6px;font-family:system-ui,sans-serif;">AVISO DE RENOVACIÓN</p>${whiteHeader("Tu suscripción se renueva en {{N}} días", "")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Te avisamos con antelación para que estés al tanto: tu suscripción al plan <strong>{{plan}}</strong> se renovará automáticamente el <strong>{{fecha_renovacion}}</strong>.</p>
<div style="border:1px solid #bfdbfe;border-radius:8px;padding:16px;background:#eff6ff;margin:16px 0;">
<table width="100%" cellpadding="0" cellspacing="0">
${[["Plan","{{plan}}"],["Fecha de renovación","{{fecha_renovacion}}"],["Importe a cobrar","{{precio}} €"]].map(([l,v]) => `<tr><td style="padding:6px 0;font-size:14px;color:#1e40af;font-family:system-ui,sans-serif;">${l}</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e40af;text-align:right;font-family:system-ui,sans-serif;">${v}</td></tr>`).join("")}
</table>
</div>
<p style="font-size:14px;color:#475569;">Si quieres cambiar de plan o cancelar antes de la renovación, puedes hacerlo en cualquier momento desde tu panel de control.</p>
${cta("Gestionar mi suscripción →", BLUE)}`
)

const transaccional6 = shell(
  "#475569",
  `<div style="text-align:center;">${whiteHeader("Hemos procesado tu cancelación", "Tu cuenta seguirá activa hasta {{fecha_fin}}")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p>Confirmamos que hemos procesado la cancelación de tu suscripción al plan <strong>{{plan}}</strong>.</p>
<div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
${[["Fecha de cancelación","{{fecha_cancelacion}}"],["Acceso hasta","{{fecha_fin}}"],["Facturación adicional","Ninguna — no se cobrarán más cargos"]].map(([l,v]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;"><span style="font-size:13px;color:#64748b;font-family:system-ui,sans-serif;">${l}</span><span style="font-size:13px;font-weight:600;color:#1e293b;font-family:system-ui,sans-serif;">${v}</span></div>`).join("")}
</div>
<p style="font-size:14px;color:#475569;">Seguirás teniendo acceso completo hasta el <strong>{{fecha_fin}}</strong>. Después podrás exportar tus datos.</p>
<div style="background:#fef2f2;border-radius:8px;padding:14px;text-align:center;margin:16px 0;">
<p style="font-weight:600;color:#dc2626;margin:0 0 8px;font-family:system-ui,sans-serif;">¿Fue un error? Puedes reactivar</p>
<a href="#" style="color:${TEAL};font-weight:600;font-family:system-ui,sans-serif;font-size:14px;">Reactivar mi suscripción</a>
</div>
<p style="font-size:14px;color:#64748b;">Antes de irte, ¿nos dices por qué cancelaste? Nos ayuda a mejorar: <a href="#" style="color:${TEAL};">Dejar feedback</a></p>`
)

const transaccional7 = shell(
  "#475569",
  `<div style="text-align:center;"><div style="font-size:32px;margin-bottom:8px;">🔒</div>${whiteHeader("Tu contraseña ha sido actualizada", "Aviso de seguridad")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
${alert("#475569", "🔒", "Tu contraseña fue cambiada correctamente")}
<div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
${[["Fecha y hora","{{fecha}} {{hora}}"],["IP de acceso","{{ip}}"],["Dispositivo","{{dispositivo}}"],["Ubicación aproximada","{{ubicacion}}"]].map(([l,v]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;"><span style="font-size:13px;color:#64748b;font-family:system-ui,sans-serif;">${l}</span><span style="font-size:13px;font-weight:600;color:#1e293b;font-family:system-ui,sans-serif;">${v}</span></div>`).join("")}
</div>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
<p style="font-weight:600;color:${RED};margin:0 0 8px;font-family:system-ui,sans-serif;">¿No fuiste tú?</p>
<p style="color:#dc2626;font-size:14px;margin:0 0 12px;font-family:system-ui,sans-serif;">Si no realizaste este cambio, accede inmediatamente a tu cuenta y restablece tu contraseña.</p>
${cta("Proteger mi cuenta →", RED)}
</div>
<p style="font-size:13px;color:#64748b;">Si fuiste tú, puedes ignorar este mensaje. Tu cuenta está segura.</p>`
)

const transaccional8 = shell(
  "#16a34a",
  `<div style="text-align:center;"><div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:32px;">✓</div>${whiteHeader("Cuenta verificada correctamente", "Ya puedes acceder a {{negocio}}")}</div>`,
  `<p>Hola <strong>{{nombre}}</strong>,</p>
<p style="font-size:16px;">Tu dirección de email <strong>{{email}}</strong> ha sido verificada correctamente. Ya tienes acceso completo a tu cuenta.</p>
<div style="background:#f0fdf4;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
<p style="font-weight:600;color:#15803d;margin:0 0 4px;font-family:system-ui,sans-serif;">¿Por dónde empezar?</p>
<p style="color:#16a34a;font-size:14px;margin:0;font-family:system-ui,sans-serif;">Te recomendamos completar tu perfil primero — solo tardarás 2 minutos.</p>
</div>
${step(1, "Completa tu perfil de empresa", "Añade logo, dirección y datos fiscales.", "#16a34a")}
${step(2, "Crea tu primer cliente", "Empieza tu base de datos de clientes.", "#16a34a")}
${step(3, "Envía tu primer documento", "Factura, presupuesto o albarán — tú eliges.", "#16a34a")}
${cta("Ir a mi dashboard →", "#16a34a")}
<p>Un saludo,<br><strong>El equipo de {{negocio}}</strong></p>`
)

// ─── Export ──────────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES_CATALOG: EmailTemplateDef[] = [
  // ONBOARDING
  { id: "onb-1", name: "Bienvenida Pro",       category: "onboarding",     description: "Email de bienvenida con 3 primeros pasos numerados y CTA",              blocks: 5, subject: "¡Bienvenido a {{negocio}}! Empieza aquí",               html: onboarding1 },
  { id: "onb-2", name: "Primeros pasos",        category: "onboarding",     description: "Guía de inicio con checklist visual y barra de progreso",               blocks: 4, subject: "Tu guía de inicio en 3 minutos",                        html: onboarding2 },
  { id: "onb-3", name: "Día 3 — ¿Cómo va?",    category: "onboarding",     description: "Seguimiento cercano con dos recursos de ayuda y soporte",              blocks: 3, subject: "¿Necesitas ayuda para empezar?",                        html: onboarding3 },
  { id: "onb-4", name: "Tutorial completado",   category: "onboarding",     description: "Celebración de logro con siguiente reto sugerido",                     blocks: 3, subject: "¡Lo conseguiste! Siguiente paso →",                    html: onboarding4 },
  { id: "onb-5", name: "Semana 1 — recap",      category: "onboarding",     description: "Resumen de primera semana con 3 métricas y consejo",                   blocks: 4, subject: "Tu primera semana en números",                         html: onboarding5 },
  { id: "onb-6", name: "Invita a tu equipo",    category: "onboarding",     description: "Invitación a colaboradores con lista de beneficios",                   blocks: 3, subject: "Trabaja mejor con tu equipo",                          html: onboarding6 },
  { id: "onb-7", name: "Setup incompleto",      category: "onboarding",     description: "Alerta de configuración pendiente con consecuencias claras",           blocks: 3, subject: "Te falta un paso importante",                          html: onboarding7 },
  { id: "onb-8", name: "Upgrade a Pro",         category: "onboarding",     description: "Comparativa gratis vs Pro en tabla con garantía devolución",           blocks: 4, subject: "Desbloquea todo el potencial",                         html: onboarding8 },
  // NEWSLETTER
  { id: "nws-1", name: "Newsletter semanal",    category: "newsletter",     description: "Selección semanal con 3 artículos y sección final editorial",          blocks: 5, subject: "[Semana N] Lo más importante de la semana",            html: newsletter1 },
  { id: "nws-2", name: "Resumen mensual",       category: "newsletter",     description: "Resumen de mes con 3 métricas grandes y 3 highlights",                 blocks: 5, subject: "{{mes}} en {{negocio}} — lo que pasó",                html: newsletter2 },
  { id: "nws-3", name: "Artículo destacado",    category: "newsletter",     description: "Email enfocado en un único artículo con extracto largo",               blocks: 3, subject: "Esto tienes que leer esta semana",                     html: newsletter3 },
  { id: "nws-4", name: "Novedades producto",    category: "newsletter",     description: "Anuncio de nuevo feature con badge, gif e imagen",                     blocks: 4, subject: "Nuevo en {{negocio}}: [Feature]",                      html: newsletter4 },
  { id: "nws-5", name: "Caso de uso",           category: "newsletter",     description: "Historia de cliente con cita destacada y resultado en 3 puntos",       blocks: 4, subject: "Cómo {{cliente}} consiguió {{resultado}}",             html: newsletter5 },
  { id: "nws-6", name: "Tips y consejos",       category: "newsletter",     description: "5 consejos numerados con bonus extra al final",                        blocks: 6, subject: "5 trucos que probablemente no conocías",               html: newsletter6 },
  { id: "nws-7", name: "Evento o webinar",      category: "newsletter",     description: "Invitación con fecha destacada, agenda y CTA de registro",             blocks: 4, subject: "Te esperamos el {{fecha}} a las {{hora}}",             html: newsletter7 },
  { id: "nws-8", name: "Encuesta satisfacción", category: "newsletter",     description: "Solicitud de feedback con 4 botones emoji y campo de comentario",      blocks: 3, subject: "2 minutos para mejorar juntos",                        html: newsletter8 },
  // MARKETING
  { id: "mkt-1", name: "Caso de éxito",         category: "marketing",      description: "Historia de éxito con métricas, logo de cliente y cita",               blocks: 4, subject: "{{cliente}} aumentó un {{X}}% con {{negocio}}",        html: marketing1 },
  { id: "mkt-2", name: "Promo flash 24h",       category: "marketing",      description: "Oferta urgente con alerta de tiempo y precio tachado",                  blocks: 4, subject: "⚡ Solo 24h: {{descuento}}% en todo",                  html: marketing2 },
  { id: "mkt-3", name: "Anuncio producto",      category: "marketing",      description: "Lanzamiento con imagen, 3 características e precio",                   blocks: 5, subject: "Presentamos [Producto] — disponible ya",               html: marketing3 },
  { id: "mkt-4", name: "Descuento exclusivo",   category: "marketing",      description: "Código de descuento visual con fecha límite y condiciones",             blocks: 3, subject: "Solo para ti: {{X}}% de descuento",                   html: marketing4 },
  { id: "mkt-5", name: "Recuperación carrito",  category: "marketing",      description: "Recordatorio amigable con imagen de producto y precio",                 blocks: 3, subject: "Olvidaste algo en tu carrito 🛒",                      html: marketing5 },
  { id: "mkt-6", name: "Reactivación 60d",      category: "marketing",      description: "Email de reconexión con novedades y oferta de regreso",                 blocks: 4, subject: "Te echamos de menos 👋",                               html: marketing6 },
  { id: "mkt-7", name: "Oferta estacional",     category: "marketing",      description: "3 productos en cards con header temático de temporada",                 blocks: 4, subject: "Especial {{temporada}}: ofertas seleccionadas",        html: marketing7 },
  { id: "mkt-8", name: "Programa referidos",    category: "marketing",      description: "Mecánica en 3 pasos con beneficio destacado y CTA compartir",          blocks: 4, subject: "Gana {{X}}€ por cada amigo que traigas 🎁",            html: marketing8 },
  // TRANSACCIONAL
  { id: "txn-1", name: "Confirmación pago",     category: "transaccional",  description: "Resumen de pedido en tabla con próximos pasos y soporte",              blocks: 4, subject: "Pago confirmado — pedido #{{N}}",                       html: transaccional1 },
  { id: "txn-2", name: "Recordatorio pago",     category: "transaccional",  description: "Alerta naranja con datos de factura e importe destacado",               blocks: 3, subject: "Tu factura vence en {{N}} días",                       html: transaccional2 },
  { id: "txn-3", name: "Factura disponible",    category: "transaccional",  description: "Datos fiscales completos con botón de descarga PDF",                   blocks: 3, subject: "Tu factura #{{numero}} está lista",                    html: transaccional3 },
  { id: "txn-4", name: "Suscripción activada",  category: "transaccional",  description: "Confirmación de plan con features incluidas y fecha renovación",       blocks: 4, subject: "Tu plan {{plan}} está activo",                         html: transaccional4 },
  { id: "txn-5", name: "Aviso renovación",      category: "transaccional",  description: "Recordatorio de renovación con importe y link para gestionar",         blocks: 3, subject: "Tu suscripción se renueva en {{N}} días",              html: transaccional5 },
  { id: "txn-6", name: "Cancelación procesada", category: "transaccional",  description: "Confirmación de baja con fecha fin, opción reactivar y feedback",      blocks: 4, subject: "Hemos procesado tu cancelación",                        html: transaccional6 },
  { id: "txn-7", name: "Contraseña cambiada",   category: "transaccional",  description: "Alerta de seguridad con IP, dispositivo y CTA de emergencia",          blocks: 3, subject: "Tu contraseña ha sido actualizada",                    html: transaccional7 },
  { id: "txn-8", name: "Cuenta verificada",     category: "transaccional",  description: "Confirmación de verificación con 3 primeros pasos sugeridos",          blocks: 4, subject: "✓ Cuenta verificada — ya puedes entrar",               html: transaccional8 },
]

export const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  newsletter: "Newsletter",
  marketing: "Marketing",
  transaccional: "Transaccional",
}
