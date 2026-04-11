import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "../../ui/chrome"

type Article = {
  slug: string
  title: string
  category: string
  categoryColor: string
  readTime: string
  date: string
  content: React.ReactNode
}

const articles: Article[] = [
  {
    slug: "como-no-perder-clientes-seguimiento",
    title: "Cómo no perder clientes por no hacer seguimiento",
    category: "Gestión de clientes",
    categoryColor: "bg-[#E1F5EE] text-[#1FA97A]",
    readTime: "5 min",
    date: "1 de abril de 2026",
    content: (
      <>
        <p>El seguimiento es, sin duda, la parte del proceso comercial que más autónomos descuidan. Se invierte tiempo en captar un lead, se tiene una primera reunión prometedora y... nada. Pasan los días, el potencial cliente no da señales y el autónomo tampoco. El resultado: una oportunidad perdida que podría haber cerrado con una simple llamada o email.</p>
        <h2>Por qué fallamos en el seguimiento</h2>
        <p>La razón principal es la falta de sistema. Cuando tienes tres o cuatro clientes potenciales en la cabeza, puedes gestionarlos mentalmente. Cuando son diez, ya empieza a fallar. Cuando son veinte, es imposible.</p>
        <p>El segundo motivo es el miedo a "molestar". Muchos autónomos evitan hacer seguimiento porque les parece invasivo. La realidad es la contraria: el 80% de las ventas se cierran entre el quinto y duodécimo contacto, según estudios de ventas B2B. Si no haces seguimiento, estás dejando dinero sobre la mesa.</p>
        <h2>El proceso que funciona</h2>
        <p>Define estados claros para cada lead: Nuevo, Contactado, Reunión agendada, Propuesta enviada, Negociando, Cerrado, Perdido. Cada estado tiene una acción asociada y un tiempo máximo de espera antes de hacer seguimiento.</p>
        <ul>
          <li><strong>Nuevo:</strong> contactar en menos de 24 horas. Los leads se enfrían rápido.</li>
          <li><strong>Contactado:</strong> si no responde en 48 horas, un segundo contacto por otro canal.</li>
          <li><strong>Propuesta enviada:</strong> seguimiento a los 3 días. No esperes a que te digan que sí o que no.</li>
          <li><strong>Negociando:</strong> mantener el contacto cada semana hasta resolución.</li>
        </ul>
        <h2>Herramientas mínimas que necesitas</h2>
        <p>No necesitas un CRM empresarial. Necesitas un sistema que te permita ver, de un vistazo, en qué estado está cada lead y cuándo fue tu último contacto. Puede ser una hoja de Excel bien estructurada o una herramienta como ClientLabs, que automatiza los recordatorios.</p>
        <p>Lo importante es que el sistema sea simple. Si requiere demasiado mantenimiento, lo abandonarás en dos semanas.</p>
        <h2>Automatiza los recordatorios</h2>
        <p>El seguimiento manual funciona, pero se puede escalar con automatizaciones. Configura recordatorios automáticos para leads que llevan más de X días sin actividad. Prepara plantillas de email para cada etapa del proceso. Usa un sistema de puntuación (scoring) para priorizar los leads con más probabilidad de cierre.</p>
        <p>Con ClientLabs, el sistema detecta leads "estancados" automáticamente y te avisa. Así no tienes que revisar manualmente tu pipeline cada día.</p>
        <h2>La regla del calendario</h2>
        <p>Dedica 20 minutos cada mañana a revisar tu pipeline. Ese tiempo diario vale más que una tarde entera de trabajo comercial intenso una vez a la semana. La consistencia es lo que distingue a los autónomos que llenan su agenda de los que siempre están buscando clientes.</p>
      </>
    ),
  },
  {
    slug: "facturacion-autonomos-espana-2026",
    title: "Facturación para autónomos en España en 2026: todo lo que necesitas saber",
    category: "Fiscalidad",
    categoryColor: "bg-blue-50 text-blue-600",
    readTime: "8 min",
    date: "25 de marzo de 2026",
    content: (
      <>
        <p>La normativa fiscal española para autónomos cambia con frecuencia, y 2026 no es una excepción. La obligatoriedad de Verifactu, la franquicia de IVA para pequeños negocios y los cambios en retenciones del IRPF hacen imprescindible tener claro qué debes hacer y cuándo.</p>
        <h2>Verifactu: qué es y cuándo te afecta</h2>
        <p>Verifactu es el sistema de facturación verificada de la Agencia Tributaria. A partir de 2026, todo software de facturación deberá cumplir los requisitos técnicos del reglamento de facturación electrónica. Esto significa que tus facturas deben generarse con un código QR verificable y enviarse al sistema de la AEAT.</p>
        <p>Si usas un software homologado, esto se hace automáticamente. Si facturas en Excel o Word, deberás migrar a un sistema compatible antes de que la obligación sea exigible para tu tramo.</p>
        <h2>IVA: tipos y deducciones</h2>
        <p>El tipo general del IVA sigue siendo el 21%. Pero hay servicios y productos que aplican tipos reducidos:</p>
        <ul>
          <li><strong>10%:</strong> hostelería, transporte de viajeros, algunos servicios sanitarios.</li>
          <li><strong>4%:</strong> libros, medicamentos, alimentos básicos.</li>
          <li><strong>0%:</strong> servicios educativos, ciertos servicios financieros.</li>
        </ul>
        <p>La franquicia de IVA, introducida en 2025, permite a autónomos con facturación inferior a 85.000 euros anuales no repercutir IVA a sus clientes. Es opcional y tiene ventajas e inconvenientes que debes evaluar con tu asesor.</p>
        <h2>IRPF: retenciones y pagos fraccionados</h2>
        <p>Si facturas a empresas españolas, aplicas una retención del 15% en tu factura (7% durante los dos primeros años de actividad). Si tus clientes son particulares o empresas extranjeras, debes hacer pagos fraccionados trimestrales con el modelo 130.</p>
        <p>Los trimestres son: enero-marzo (declaración en abril), abril-junio (julio), julio-septiembre (octubre) y octubre-diciembre (enero del año siguiente).</p>
        <h2>Qué debe incluir una factura legal</h2>
        <p>Para que una factura sea válida ante la AEAT, debe incluir:</p>
        <ul>
          <li>Número de factura correlativo y serie</li>
          <li>Fecha de emisión</li>
          <li>Datos del emisor: nombre/razón social, NIF, dirección fiscal</li>
          <li>Datos del receptor: nombre/razón social, NIF, dirección</li>
          <li>Descripción del servicio o producto</li>
          <li>Base imponible, tipo de IVA y cuota de IVA</li>
          <li>Retención de IRPF (si aplica)</li>
          <li>Importe total</li>
        </ul>
        <h2>Conservación de facturas</h2>
        <p>Estás obligado a conservar todas las facturas emitidas y recibidas durante un mínimo de 4 años. La AEAT puede inspeccionarte en cualquier momento durante ese período. Usa un sistema digital con copias de seguridad.</p>
      </>
    ),
  },
  {
    slug: "herramientas-gestion-autonomos",
    title: "Las 5 herramientas que todo autónomo necesita en 2026",
    category: "Productividad",
    categoryColor: "bg-purple-50 text-purple-600",
    readTime: "6 min",
    date: "15 de marzo de 2026",
    content: (
      <>
        <p>El catálogo de herramientas digitales para autónomos es inmenso. Pero no necesitas docenas de aplicaciones. Necesitas las correctas. Estas son las cinco categorías que marcan la diferencia entre un autónomo que trabaja con control y uno que improvisa constantemente.</p>
        <h2>1. CRM: gestiona tus relaciones comerciales</h2>
        <p>Un CRM (Customer Relationship Manager) es la columna vertebral de cualquier negocio basado en clientes. Te permite llevar un registro de leads, oportunidades, clientes activos y el historial de cada relación.</p>
        <p>Para autónomos, no necesitas un Salesforce. Necesitas algo simple que funcione desde el primer día. ClientLabs está diseñado específicamente para autónomos españoles: pipeline de leads, conversión a cliente, seguimiento y facturación integrada.</p>
        <h2>2. Facturación: cumple con la normativa sin estrés</h2>
        <p>Con la llegada de Verifactu, usar Excel para facturar ya no es una opción sostenible. Necesitas software homologado que genere facturas legales, calcule IVA e IRPF automáticamente y te prepare los modelos trimestrales.</p>
        <p>Busca soluciones que incluyan generación de PDF, envío por email directo al cliente y registro de pagos. El tiempo que ahorras en facturación lo inviertes en trabajo facturable.</p>
        <h2>3. Gestión de proyectos: controla tus entregas</h2>
        <p>Notion, Trello o una herramienta similar te permite organizar el trabajo por proyectos, definir tareas y plazos, y tener visibilidad de qué está en curso. Aunque seas un equipo de uno, la disciplina de gestión de proyectos te diferencia.</p>
        <h2>4. Comunicación con clientes: profesionaliza el canal</h2>
        <p>WhatsApp Business para contacto rápido, email con dominio propio para comunicaciones formales. Si gestionas varios proyectos simultáneamente, considera una herramienta de gestión de bandeja de entrada compartida.</p>
        <p>La regla de oro: cada canal tiene un propósito. No mezcles WhatsApp personal con el profesional, y no uses Gmail genérico para facturar.</p>
        <h2>5. Contabilidad y declaraciones: automatiza lo fiscal</h2>
        <p>Llevar la contabilidad manualmente consume tiempo y genera errores. Una herramienta que importa tus movimientos bancarios, categoriza gastos e ingresos y te prepara los modelos de la AEAT te ahorra horas cada trimestre y reduce el riesgo de errores.</p>
        <h3>El criterio para elegir</h3>
        <p>Antes de suscribirte a cualquier herramienta, hazte tres preguntas: ¿Resuelve un problema real que tengo hoy? ¿Voy a usarla más de una vez a la semana? ¿El coste está justificado por el tiempo o dinero que me ahorra? Si las tres respuestas son sí, adelante.</p>
      </>
    ),
  },
  {
    slug: "como-conseguir-primeros-clientes",
    title: "Cómo conseguir tus primeros 10 clientes como autónomo",
    category: "Captación",
    categoryColor: "bg-orange-50 text-orange-600",
    readTime: "7 min",
    date: "5 de marzo de 2026",
    content: (
      <>
        <p>Los primeros clientes son los más difíciles. No tienes reputación, no tienes casos de éxito y, probablemente, no tienes tiempo para hacer marketing mientras intentas montar el negocio. Esta guía va al grano: lo que funciona de verdad en los primeros meses.</p>
        <h2>Empieza por tu red existente</h2>
        <p>Tu primer cliente no vendrá de Google ni de LinkedIn frío. Vendrá de alguien que ya te conoce. Haz una lista de 50 personas: excompañeros de trabajo, antiguos jefes, amigos emprendedores, contactos de formaciones, familiares con negocios. No para pedirles trabajo directamente, sino para contarles qué haces ahora.</p>
        <p>Un mensaje simple: "Acabo de lanzarme como autónomo en [área]. Si conoces a alguien que necesite ayuda con [problema concreto], te agradecería que pensaras en mí." El 90% no te contratará, pero uno o dos pueden abrir puertas que no esperabas.</p>
        <h2>Define un problema concreto, no un perfil genérico</h2>
        <p>La tentación cuando empiezas es ser muy amplio: "diseñador web", "consultor de marketing", "asesor empresarial". El problema es que nadie busca eso. La gente busca soluciones a problemas específicos.</p>
        <p>Reformula tu propuesta: "Ayudo a pequeñas tiendas de moda a conseguir más ventas desde Instagram en 90 días." Eso es concreto, medible y específico para un segmento.</p>
        <h2>Ofrece una primera colaboración con riesgo limitado</h2>
        <p>Para romper la barrera de "no te conozco", ofrece algo de bajo riesgo: una auditoría gratuita, una sesión de consultoría de diagnóstico de 45 minutos, o un mini-proyecto acotado a precio reducido. El objetivo no es trabajar gratis sino bajar la barrera de entrada para que el cliente potencial te pruebe.</p>
        <p>Una vez que has demostrado valor, el siguiente proyecto ya sale a precio normal.</p>
        <h2>Usa LinkedIn de forma activa, no pasiva</h2>
        <p>Tener un perfil de LinkedIn no sirve de nada si no publicas. El algoritmo de LinkedIn favorece a los perfiles activos. Publica una vez a la semana sobre problemas que resuelves, resultados de proyectos (anonimizados), o lecciones aprendidas. No ventas directas, sino contenido útil que demuestre tu expertise.</p>
        <p>Complementa con comentarios en publicaciones de tu sector. La visibilidad consistente genera inbound en 3-6 meses.</p>
        <h2>Pide referencias activamente</h2>
        <p>Cuando terminas un proyecto bien, pide dos cosas: una reseña de Google o LinkedIn, y si conocen a alguien más que pueda necesitar ayuda similar. La mayoría de clientes satisfechos están dispuestos a referirte si se lo pides explícitamente. Si no lo pides, no lo hacen.</p>
        <h2>El número que importa</h2>
        <p>Tus primeros 10 clientes generan tu reputación. No importa tanto el dinero en esa fase como aprender qué funciona, qué tipo de cliente te va mejor y qué resultados puedes prometer. Con 10 clientes, ya tienes casos de éxito, referencias y suficiente experiencia para escalar.</p>
      </>
    ),
  },
]

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug)
  if (!article) notFound()

  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />
      <article className="mx-auto max-w-2xl px-6 pt-28 pb-24">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-500 text-[13px] hover:text-[#1FA97A] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>
        <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${article.categoryColor}`}>
          {article.category}
        </span>
        <h1 className="text-[28px] font-bold leading-tight mb-4">{article.title}</h1>
        <p className="text-slate-400 text-[13px] mb-10">{article.readTime} lectura · {article.date}</p>
        <div className="prose-content text-[15px] leading-relaxed text-slate-700 space-y-4 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-[#0B1F2A] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#0B1F2A] [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#0B1F2A] [&_strong]:font-semibold">
          {article.content}
        </div>
        <div className="mt-16 p-6 bg-[#E1F5EE] rounded-xl border border-[#1FA97A]/20">
          <p className="text-[14px] font-semibold text-[#0B1F2A] mb-1">Gestiona todo esto desde un solo panel</p>
          <p className="text-[13px] text-slate-600 mb-4">ClientLabs centraliza leads, clientes y facturación para autónomos españoles.</p>
          <Link href="/whitelist" className="inline-block px-5 py-2 bg-[#1FA97A] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors">
            Unirse a la whitelist
          </Link>
        </div>
      </article>
    </main>
  )
}
