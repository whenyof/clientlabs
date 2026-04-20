import { prisma } from "@/lib/prisma"
import { TipoAutomatizacion } from "@prisma/client"

const DEFAULTS: Array<{
  nombre: string
  descripcion: string
  tipo: TipoAutomatizacion
  categoria: string
  activa: boolean
  config: object
}> = [
  // ── PARA TI ───────────────────────────────────────────────────────────────
  {
    nombre: "Nuevo lead recibido",
    descripcion: "Email al instante cuando llega un nuevo lead a tu panel.",
    tipo: "LEAD_NUEVO",
    categoria: "para_ti",
    activa: true,
    config: {
      asunto: "Nuevo lead: {{lead.nombre}}",
      mensaje:
        "Tienes un nuevo lead en ClientLabs.\n\n" +
        "Nombre: {{lead.nombre}}\n" +
        "Email: {{lead.email}}\n" +
        "Teléfono: {{lead.telefono}}\n" +
        "Fuente: {{lead.fuente}}\n" +
        "Recibido: {{lead.fecha}}\n\n" +
        "Este lead está esperando que lo contactes. Cuanto antes respondas, más probabilidades tienes de convertirlo en cliente.",
    },
  },
  {
    nombre: "Lead sin contactar 48h",
    descripcion: "Aviso si llevas 2 días sin contactar a un lead.",
    tipo: "LEAD_SIN_CONTACTAR",
    categoria: "para_ti",
    activa: true,
    config: {
      dias: 2,
      asunto: "{{lead.nombre}} lleva 2 días sin respuesta",
      mensaje:
        "Han pasado 48 horas desde que llegó el lead de {{lead.nombre}} y aún no has registrado ningún contacto.\n\n" +
        "Los leads que se responden en menos de 24h tienen 7 veces más probabilidades de convertirse en clientes.\n\n" +
        "Lead: {{lead.nombre}}\n" +
        "Email: {{lead.email}}\n" +
        "Llegó el: {{lead.fecha}}",
    },
  },
  {
    nombre: "Lead estancado",
    descripcion: "Alerta cuando un lead lleva 14 días sin actividad.",
    tipo: "LEAD_STALLED",
    categoria: "para_ti",
    activa: false,
    config: {
      dias: 14,
      asunto: "{{lead.nombre}} lleva 14 días sin actividad",
      mensaje:
        "El lead de {{lead.nombre}} lleva más de dos semanas sin ninguna actualización en tu panel.\n\n" +
        "Es el momento de tomar una decisión:\n" +
        "— ¿Le haces un último seguimiento?\n" +
        "— ¿Lo marcas como perdido y sigues adelante?\n\n" +
        "No dejes leads zombi en tu pipeline. Un pipeline limpio es un pipeline que funciona.\n\n" +
        "Lead: {{lead.nombre}}\n" +
        "Estado actual: {{lead.estado}}\n" +
        "Último contacto: {{lead.ultimoContacto}}",
    },
  },
  {
    nombre: "Factura vencida sin pagar",
    descripcion: "Aviso cuando una factura lleva días vencida sin cobrar.",
    tipo: "FACTURA_VENCIDA_AVISO",
    categoria: "para_ti",
    activa: true,
    config: {
      dias: 3,
      asunto: "Factura vencida — {{factura.numero}} de {{cliente.nombre}}",
      mensaje:
        "Tienes una factura sin cobrar que ya ha superado su fecha de vencimiento.\n\n" +
        "Factura: {{factura.numero}}\n" +
        "Cliente: {{cliente.nombre}}\n" +
        "Importe: {{factura.total}}€\n" +
        "Venció el: {{factura.vencimiento}}\n" +
        "Días de retraso: {{factura.diasRetraso}}\n\n" +
        "Si aún no has enviado un recordatorio al cliente, ClientLabs puede hacerlo automáticamente por ti.",
    },
  },
  {
    nombre: "Presupuesto por expirar",
    descripcion: "Aviso antes de que caduque un presupuesto sin respuesta.",
    tipo: "PRESUPUESTO_EXPIRA_AVISO",
    categoria: "para_ti",
    activa: false,
    config: {
      dias: 3,
      asunto: "El presupuesto de {{cliente.nombre}} caduca en {{presupuesto.dias}} días",
      mensaje:
        "Tienes un presupuesto enviado que está a punto de caducar sin respuesta.\n\n" +
        "Presupuesto: {{presupuesto.numero}}\n" +
        "Cliente: {{cliente.nombre}}\n" +
        "Importe: {{presupuesto.total}}€\n" +
        "Caduca el: {{presupuesto.expira}}\n\n" +
        "Si el cliente no ha respondido puede que tenga dudas. Un mensaje personal a tiempo puede marcar la diferencia.",
    },
  },
  {
    nombre: "Trimestre fiscal próximo",
    descripcion: "Recordatorio 15 días antes del plazo trimestral.",
    tipo: "TRIMESTRE_PROXIMO",
    categoria: "para_ti",
    activa: false,
    config: {
      dias: 15,
      asunto: "Quedan {{dias}} días para presentar el {{trimestre}}",
      mensaje:
        "Se acerca la fecha límite de presentación del trimestre fiscal.\n\n" +
        "Trimestre: {{trimestre}}\n" +
        "Fecha límite: {{fechaLimite}}\n" +
        "Días restantes: {{dias}}\n\n" +
        "Antes de presentar revisa que tienes:\n" +
        "— Todas las facturas emitidas registradas en ClientLabs\n" +
        "— Todos los gastos del trimestre introducidos\n" +
        "— Los modelos 303 y 130 descargados y listos para importar en la AEAT",
    },
  },
  // ── PARA TUS CONTACTOS ────────────────────────────────────────────────────
  {
    nombre: "Confirmación de recepción",
    descripcion: "Email automático al lead confirmando que recibiste su mensaje.",
    tipo: "CONFIRMACION_LEAD",
    categoria: "para_contactos",
    activa: true,
    config: {
      asunto: "He recibido tu mensaje, {{lead.nombre}}",
      mensaje:
        "Hola {{lead.nombre}},\n\n" +
        "Gracias por contactarme. He recibido tu mensaje y lo he revisado con atención.\n\n" +
        "Me pondré en contacto contigo en las próximas 24 horas para hablar sobre tu proyecto y ver cómo puedo ayudarte.\n\n" +
        "Mientras tanto, si tienes alguna pregunta urgente puedes responder directamente a este email.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Seguimiento — Día 3",
    descripcion: "Si el lead no responde en 3 días le escribimos en tu nombre.",
    tipo: "SEGUIMIENTO_DIA_3",
    categoria: "para_contactos",
    activa: false,
    config: {
      dias: 3,
      asunto: "Tu consulta del otro día — {{usuario.nombre}}",
      mensaje:
        "Hola {{lead.nombre}},\n\n" +
        "Te escribí hace unos días sobre tu consulta y no he sabido de ti.\n\n" +
        "Entiendo que estás valorando opciones y quiero asegurarme de que tienes toda la información que necesitas para tomar la mejor decisión.\n\n" +
        "¿Hay algo específico sobre lo que te gustaría que te aclarase? Estoy aquí para resolver cualquier duda.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Seguimiento — Día 7",
    descripcion: "Último intento automático a los 7 días sin respuesta.",
    tipo: "SEGUIMIENTO_DIA_7",
    categoria: "para_contactos",
    activa: false,
    config: {
      dias: 7,
      asunto: "¿Todo bien, {{lead.nombre}}?",
      mensaje:
        "Hola {{lead.nombre}},\n\n" +
        "Sé que el tiempo vuela y que a veces los proyectos se retrasan o las prioridades cambian. Lo entiendo perfectamente.\n\n" +
        "No quiero molestarte más, así que este será mi último mensaje. Si en algún momento decides retomar el proyecto o necesitas ayuda con algo, aquí estaré.\n\n" +
        "Te deseo mucho éxito con todo.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Bienvenida a nuevo cliente",
    descripcion: "Email de bienvenida al convertir un lead en cliente.",
    tipo: "BIENVENIDA_CLIENTE",
    categoria: "para_contactos",
    activa: true,
    config: {
      asunto: "Bienvenido/a, {{cliente.nombre}} — empezamos",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Me alegra mucho que hayamos decidido trabajar juntos. A partir de ahora soy tu punto de contacto directo para todo lo relacionado con el proyecto.\n\n" +
        "Estas son las próximas cosas que haremos:\n" +
        "— Te enviaré una propuesta detallada con los pasos y plazos acordados\n" +
        "— Resolveremos cualquier duda antes de empezar\n" +
        "— Nos mantendremos en contacto regular para que siempre sepas cómo va todo\n\n" +
        "Si en cualquier momento necesitas algo, responde a este email y te atiendo lo antes posible.\n\n" +
        "Gracias por confiar en mí.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Recordatorio de pago",
    descripcion: "Email al cliente cuando su factura lleva días vencida.",
    tipo: "FACTURA_VENCIDA",
    categoria: "para_contactos",
    activa: true,
    config: {
      dias: 3,
      asunto: "Recordatorio de pago — Factura {{factura.numero}}",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Espero que estés bien. Te escribo porque la factura {{factura.numero}} por importe de {{factura.total}}€ venció el {{factura.vencimiento}} y aún no hemos recibido el pago.\n\n" +
        "Si ya realizaste la transferencia en los últimos días, por favor ignora este mensaje — es posible que se haya cruzado.\n\n" +
        "Si tienes algún problema o necesitas hablar sobre los plazos de pago, no dudes en responderme directamente. Encontraremos una solución.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Presupuesto por expirar",
    descripcion: "Avisa al cliente cuando su presupuesto caduca pronto.",
    tipo: "PRESUPUESTO_EXPIRA",
    categoria: "para_contactos",
    activa: false,
    config: {
      dias: 3,
      asunto: "Tu presupuesto caduca pronto — {{presupuesto.numero}}",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Te escribo porque el presupuesto {{presupuesto.numero}} que te envié caduca el {{presupuesto.expira}}.\n\n" +
        "Si tienes alguna pregunta sobre los servicios incluidos, el precio o los plazos de entrega, es el momento perfecto para hablarlo. Puedo ajustar la propuesta si algo no encaja del todo.\n\n" +
        "Si prefieres dejarlo para más adelante, puedo prepararte un nuevo presupuesto cuando lo necesites.\n\n" +
        "¿Seguimos adelante?\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Felicitación cumpleaños",
    descripcion: "Felicita a tus clientes el día de su cumpleaños.",
    tipo: "CUMPLEANOS_CLIENTE",
    categoria: "para_contactos",
    activa: false,
    config: {
      asunto: "¡Feliz cumpleaños, {{cliente.nombre}}!",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Hoy es tu día y quería felicitarte personalmente.\n\n" +
        "Ha sido un placer trabajar contigo este tiempo. Espero que tengas un cumpleaños estupendo rodeado/a de las personas que más quieres.\n\n" +
        "¡Que sea un gran año!\n\n" +
        "Un abrazo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Confirmación de pedido",
    descripcion: "Email automático al cliente confirmando que recibiste su pedido.",
    tipo: "CONFIRMACION_PEDIDO",
    categoria: "para_contactos",
    activa: false,
    config: {
      asunto: "Pedido confirmado — {{cliente.nombre}}",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Confirmo que he recibido tu pedido y ya está en proceso.\n\n" +
        "Me pondré en contacto contigo en cuanto esté listo para informarte del estado y los próximos pasos.\n\n" +
        "Si tienes cualquier pregunta mientras tanto, responde a este email y te atiendo cuanto antes.\n\n" +
        "Gracias por confiar en mí.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Aviso de entrega",
    descripcion: "Notifica al cliente cuando su pedido o proyecto está listo para entregar.",
    tipo: "AVISO_ENTREGA",
    categoria: "para_contactos",
    activa: false,
    config: {
      asunto: "Tu pedido está listo — {{cliente.nombre}}",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Buenas noticias: tu pedido está listo.\n\n" +
        "En breve me pongo en contacto contigo para coordinar la entrega y asegurarme de que todo es exactamente lo que esperabas.\n\n" +
        "Si tienes alguna preferencia sobre cómo o cuándo recibirlo, indícamelo respondiendo a este email.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
  {
    nombre: "Solicitud de valoración",
    descripcion: "Pide al cliente una reseña o valoración después de cerrar el trabajo.",
    tipo: "SOLICITUD_VALORACION",
    categoria: "para_contactos",
    activa: false,
    config: {
      asunto: "¿Me dejas una valoración, {{cliente.nombre}}?",
      mensaje:
        "Hola {{cliente.nombre}},\n\n" +
        "Ha sido un placer trabajar contigo. Espero que el resultado haya superado tus expectativas.\n\n" +
        "Si tienes un momento, me ayudaría mucho que dejaras una valoración sobre tu experiencia. Para un profesional independiente como yo, las reseñas son la mejor manera de llegar a nuevos clientes.\n\n" +
        "Solo te llevará dos minutos y para mí significa mucho.\n\n" +
        "Muchas gracias de antemano.\n\n" +
        "Un saludo,\n{{usuario.nombre}}",
    },
  },
]

// ── PARA TI — entradas adicionales ───────────────────────────────────────────
const DEFAULTS_TI_EXTRA: Array<{
  nombre: string
  descripcion: string
  tipo: TipoAutomatizacion
  categoria: string
  activa: boolean
  config: object
}> = [
  {
    nombre: "Tarea vencida sin completar",
    descripcion: "Aviso cuando una tarea lleva días sin completarse tras su fecha límite.",
    tipo: "TAREA_VENCIDA",
    categoria: "para_ti",
    activa: false,
    config: {
      dias: 1,
      asunto: "Tarea vencida: {{tarea.nombre}}",
      mensaje:
        "Tienes una tarea que ya ha superado su fecha límite sin marcarse como completada.\n\n" +
        "Tarea: {{tarea.nombre}}\n" +
        "Fecha límite: {{tarea.fechaLimite}}\n" +
        "Días de retraso: {{dias}}\n\n" +
        "Revisa si sigue siendo relevante o si puedes cerrarla.",
    },
  },
  {
    nombre: "Resumen de tareas del día",
    descripcion: "Cada mañana recibes un resumen de las tareas pendientes para hoy.",
    tipo: "TAREAS_HOY",
    categoria: "para_ti",
    activa: false,
    config: {
      asunto: "Tus tareas para hoy — {{fecha}}",
      mensaje:
        "Buenos días.\n\n" +
        "Estas son las tareas que tienes programadas para hoy:\n\n" +
        "{{tareas.lista}}\n\n" +
        "Que sea un día productivo.",
    },
  },
  {
    nombre: "Factura de proveedor por vencer",
    descripcion: "Aviso cuando una factura de proveedor está próxima a su fecha de pago.",
    tipo: "PROVEEDOR_FACTURA_VENCER",
    categoria: "para_ti",
    activa: false,
    config: {
      dias: 5,
      asunto: "Factura de {{proveedor.nombre}} vence en {{dias}} días",
      mensaje:
        "Tienes una factura de proveedor próxima a su fecha de pago.\n\n" +
        "Proveedor: {{proveedor.nombre}}\n" +
        "Importe: {{factura.total}}€\n" +
        "Vence el: {{factura.vencimiento}}\n" +
        "Días restantes: {{dias}}\n\n" +
        "Revisa que tienes fondos suficientes o contacta con el proveedor si necesitas aplazar el pago.",
    },
  },
  {
    nombre: "Mes con beneficio negativo",
    descripcion: "Alerta si tus ingresos no cubren los gastos al cierre del mes.",
    tipo: "MES_BENEFICIO_NEGATIVO",
    categoria: "para_ti",
    activa: false,
    config: {
      asunto: "Atención: mes cerrado con pérdidas",
      mensaje:
        "El mes acaba de cerrar y el resultado financiero es negativo.\n\n" +
        "Ingresos: {{ingresos}}€\n" +
        "Gastos: {{gastos}}€\n" +
        "Diferencia: {{diferencia}}€\n\n" +
        "Revisa tus gastos del mes e identifica qué partidas puedes reducir o eliminar el próximo periodo.",
    },
  },
]

export async function seedAutomations(userId: string): Promise<void> {
  const all = [...DEFAULTS, ...DEFAULTS_TI_EXTRA]
  for (const def of all) {
    await prisma.automatizacion.upsert({
      where: { userId_tipo: { userId, tipo: def.tipo } },
      update: {
        nombre: def.nombre,
        descripcion: def.descripcion,
        categoria: def.categoria,
        config: def.config,
        // NO actualiza activa — respeta la elección del usuario
      },
      create: {
        userId,
        nombre: def.nombre,
        descripcion: def.descripcion,
        tipo: def.tipo,
        categoria: def.categoria,
        activa: def.activa,
        config: def.config,
      },
    })
  }
}
