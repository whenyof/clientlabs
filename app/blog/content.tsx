import React from "react"
import Link from "next/link"

export const ARTICLE_CONTENT: Record<string, React.ReactNode> = {
  "como-no-perder-clientes-seguimiento": (
    <div>
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
    </div>
  ),
  "facturacion-autonomos-espana-2026": (
    <div>
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
    </div>
  ),
  "herramientas-gestion-autonomos": (
    <div>
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
    </div>
  ),
  "como-conseguir-primeros-clientes": (
    <div>
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
    </div>
  ),
  "como-gestionar-tiempo-autonomo": (
    <div>
      <p>Como autónomo, el tiempo es tu recurso más valioso y, a la vez, el más difícil de gestionar. No tienes un jefe que marque horarios, pero tampoco tienes a nadie que te proteja de las interrupciones, las reuniones innecesarias o la procrastinación. Esta guía te da las técnicas que realmente funcionan para trabajar menos horas y facturar más.</p>
      <h2>El problema del autónomo con el tiempo</h2>
      <p>La mayoría de autónomos cometen el mismo error: confunden estar ocupado con ser productivo. Responden mensajes a todas horas, hacen malabares entre proyectos sin estructura, y al final del día sienten que han trabajado mucho pero avanzado poco. El problema no es la cantidad de tiempo, sino cómo se organiza.</p>
      <p>Un estudio de la Universidad de California demostró que recuperarse de una interrupción lleva una media de 23 minutos. Si recibes 10 interrupciones al día, estás perdiendo casi 4 horas sin darte cuenta.</p>
      <h2>Técnica 1: Bloques de trabajo profundo</h2>
      <p>El trabajo profundo (deep work) es el trabajo que requiere toda tu concentración y produce resultados de alto valor. Bloquea 2-3 horas al día para este tipo de trabajo, preferiblemente por la mañana. Durante ese bloque:</p>
      <ul>
        <li>Silencia el móvil y cierra el correo</li>
        <li>Trabaja en una sola tarea prioritaria</li>
        <li>Usa auriculares con cancelación de ruido si trabajas en casa con familia</li>
        <li>Pon el estado de "no molestar" en todas tus aplicaciones de mensajería</li>
      </ul>
      <p>Estos bloques de concentración profunda producen más valor en 2 horas que 6 horas de trabajo fragmentado.</p>
      <h2>Técnica 2: Time blocking semanal</h2>
      <p>El time blocking consiste en asignar bloques de tiempo específicos a tipos de tareas. En lugar de una lista de tareas interminable, tienes un horario con slots definidos. Un ejemplo práctico para autónomos:</p>
      <ul>
        <li><strong>Lunes mañana:</strong> planificación semanal y revisión de pipeline de clientes</li>
        <li><strong>Martes y miércoles:</strong> trabajo facturable (producción, diseño, desarrollo, consultoría)</li>
        <li><strong>Jueves:</strong> reuniones con clientes y seguimiento comercial</li>
        <li><strong>Viernes mañana:</strong> administración, facturación y tareas fiscales</li>
        <li><strong>Viernes tarde:</strong> revisión de la semana y planificación de la siguiente</li>
      </ul>
      <h2>Técnica 3: La regla de los 2 minutos</h2>
      <p>Si una tarea se puede hacer en menos de 2 minutos, hazla ahora. Responder ese email corto, aprobar esa factura, confirmar esa reunión. Acumular microgestiones en una lista crea ruido mental que consume energía cognitiva durante todo el día.</p>
      <h2>Técnica 4: Auditoría de tiempo</h2>
      <p>Durante una semana, registra en qué empleas cada hora. Usa una aplicación como Toggl o simplemente una hoja de cálculo. Al final de la semana, clasifica el tiempo en tres categorías: trabajo facturable, trabajo administrativo y tiempo no productivo. Los resultados suelen ser reveladores: la mayoría de autónomos descubren que más de un 30% de su tiempo no genera ingresos directos.</p>
      <h2>Técnica 5: Aprende a decir no</h2>
      <p>Cada sí que das a algo es un no a otra cosa. Revisar un proyecto "por favor, solo una cosa rápida", atender llamadas sin agendar, aceptar proyectos mal pagados que consumen tiempo premium. Define tus criterios de aceptación y aplícalos consistentemente.</p>
      <h3>El indicador que debes medir</h3>
      <p>Calcula tu tarifa horaria efectiva dividiendo lo que facturas al mes entre las horas trabajadas. Si trabajas 160 horas y facturas 3.200 euros, tu tarifa efectiva es 20 euros/hora. El objetivo no es solo subir la tarifa, sino también reducir las horas no facturables.</p>
    </div>
  ),
  "errores-fiscales-autonomos-espana": (
    <div>
      <p>La fiscalidad de los autónomos en España es compleja y las sanciones por errores pueden ser costosas. Muchos autónomos pagan de más por no conocer deducciones disponibles, o se arriesgan a sanciones por no cumplir correctamente con sus obligaciones. Estos son los 7 errores más frecuentes y cómo evitarlos.</p>
      <h2>Error 1: No separar las cuentas personales de las profesionales</h2>
      <p>Mezclar los ingresos y gastos del negocio con los personales es el error más habitual. Dificulta llevar la contabilidad, complica demostrar gastos deducibles ante Hacienda y genera confusión en los periodos de declaración. Abre una cuenta bancaria dedicada exclusivamente a tu actividad profesional desde el primer día.</p>
      <h2>Error 2: No deducir todos los gastos permitidos</h2>
      <p>Muchos autónomos son demasiado conservadores con las deducciones por miedo a una inspección. La AEAT permite deducir todos los gastos necesarios para el ejercicio de la actividad. Los más habituales que se olvidan:</p>
      <ul>
        <li>Cuotas de autónomo (100% deducibles en IRPF)</li>
        <li>Material de oficina, hardware y software</li>
        <li>Gastos de formación relacionados con la actividad</li>
        <li>Suscripciones a herramientas profesionales</li>
        <li>Gastos de representación (con límites)</li>
        <li>Gastos de desplazamiento para reuniones con clientes</li>
        <li>Proporción del alquiler si trabajas desde casa (notificado a Hacienda)</li>
      </ul>
      <h2>Error 3: Presentar el Modelo 303 con errores de cálculo</h2>
      <p>El Modelo 303 es la declaración trimestral del IVA. Un error frecuente es confundir la base imponible con el importe total de la factura, o no incluir las facturas de compras con IVA deducible. Revisa siempre que la suma de tus facturas emitidas coincide con el IVA repercutido declarado.</p>
      <h2>Error 4: Olvidar el Modelo 130 cuando tienes clientes particulares</h2>
      <p>Si más del 70% de tus facturas ya llevan retención de IRPF (porque tus clientes son empresas), estás exento del Modelo 130. Pero si tienes clientes particulares o internacionales que no aplican retención, debes hacer pagos fraccionados trimestrales. Muchos autónomos con clientes mixtos no lo calculan correctamente y reciben sorpresas en la Renta.</p>
      <h2>Error 5: No conservar facturas de gastos correctamente</h2>
      <p>Un ticket de caja no es suficiente para deducir un gasto en muchos casos. Necesitas factura completa con los datos del proveedor, tu NIF y la descripción del servicio. La AEAT puede solicitarte cualquier justificante de los últimos 4 años.</p>
      <h2>Error 6: Aplicar el tipo de IVA incorrecto</h2>
      <p>No todos los servicios tributan al 21%. Algunos servicios culturales, formativos o de rehabilitación de viviendas pueden aplicar tipos reducidos. Consultar el tipo correcto para tu actividad concreta evita problemas posteriores con la AEAT.</p>
      <h2>Error 7: No avisar a Hacienda del cambio de base de cotización</h2>
      <p>Desde 2023, el sistema de cotización de autónomos por tramos de ingresos reales obliga a actualizar la base de cotización cuando tus ingresos cambian significativamente. No hacerlo puede suponer cotizar por encima o por debajo de lo que corresponde, con las consecuentes liquidaciones posteriores.</p>
    </div>
  ),
  "como-fijar-precios-servicios-autonomo": (
    <div>
      <p>Fijar el precio correcto por tus servicios es una de las decisiones más importantes y, a la vez, más difíciles para un autónomo. Cobrar de menos pone en riesgo la sostenibilidad de tu negocio. Cobrar de más sin justificarlo puede hacer que pierdas proyectos. Esta guía te da los métodos concretos para encontrar el punto correcto.</p>
      <h2>El error de partir del precio de la competencia</h2>
      <p>La mayoría de autónomos establecen sus precios mirando qué cobra la competencia y ajustándose a ese rango. El problema es que ese enfoque ignora dos variables fundamentales: tus costes reales y el valor que aportas. Dos autónomos con el mismo servicio pueden tener costes muy distintos según su situación, localización y forma de trabajar.</p>
      <h2>Método 1: Precio basado en coste real</h2>
      <p>Calcula cuánto necesitas facturar para cubrir todos tus gastos y tener un salario digno. La fórmula es simple:</p>
      <ul>
        <li><strong>Cuota de autónomo:</strong> según tu tramo de ingresos (mínimo ~230 euros/mes en 2026)</li>
        <li><strong>Gastos fijos:</strong> herramientas, suscripciones, material, formación</li>
        <li><strong>Impuestos:</strong> provisión del 25-30% de ingresos para IRPF e IVA no recuperable</li>
        <li><strong>Salario deseado:</strong> lo que quieres llevarte a casa neto al mes</li>
      </ul>
      <p>Suma todo, divide entre las horas facturables reales del mes (no las totales trabajadas), y obtienes tu tarifa horaria mínima. Las horas facturables suelen ser entre el 50% y el 70% del total trabajado.</p>
      <h2>Método 2: Precio basado en valor</h2>
      <p>En lugar de cobrar por el tiempo invertido, cobras por el resultado que produces para el cliente. Si tu trabajo genera 50.000 euros de beneficio a un cliente, tu precio puede ser 5.000 euros aunque solo te lleve 20 horas. El valor entregado es la referencia, no las horas.</p>
      <p>Para aplicar este método necesitas entender bien el problema del cliente, cuantificar el valor de la solución y ser capaz de comunicarlo con claridad.</p>
      <h2>Cómo subir precios a clientes actuales</h2>
      <p>La subida de precios debe comunicarse con antelación (al menos 30 días), justificarse con el valor aportado y ofrecerse junto a alguna mejora del servicio. Nunca subas precios sin avisar y sin contexto. Los clientes satisfechos suelen aceptar subidas razonables si la relación es buena.</p>
      <h3>La regla del 50%</h3>
      <p>Si el 100% de los clientes a quienes envías presupuesto aceptan sin negociar, tus precios son demasiado bajos. El punto óptimo es cuando aproximadamente el 50-60% aceptan y el resto negocia o rechaza. Ese porcentaje indica que estás en el rango correcto del mercado.</p>
      <h2>Errores frecuentes al fijar precios</h2>
      <ul>
        <li>Hacer descuentos sin razón para cerrar proyectos</li>
        <li>No actualizar precios en años con inflación</li>
        <li>Cobrar por horas cuando el cliente solo valora el resultado</li>
        <li>No incluir revisiones y cambios en el precio del proyecto</li>
        <li>Fijar precios iguales para todos los clientes independientemente de su tamaño</li>
      </ul>
    </div>
  ),
  "crm-para-autonomos-guia-completa": (
    <div>
      <p>Un CRM (Customer Relationship Management) es el software que gestiona todas tus relaciones comerciales: desde el primer contacto con un potencial cliente hasta el seguimiento postventa. Para un autónomo, elegir el CRM correcto puede marcar la diferencia entre tener un negocio controlado y uno que improvisa constantemente.</p>
      <h2>Por qué necesitas un CRM como autónomo</h2>
      <p>Cuando tienes pocos clientes, una libreta o una hoja de Excel puede funcionar. Pero cuando tu cartera crece a 20, 30 o 50 contactos activos, la gestión manual se vuelve insostenible. Sin un sistema centralizado, pierdes leads por falta de seguimiento, olvidas hacer presupuestos o no recuerdas cuándo fue tu última conversación con un cliente.</p>
      <p>Los estudios demuestran que los profesionales que usan un CRM cierran un 29% más de oportunidades que quienes no lo hacen.</p>
      <h2>Qué debe tener un buen CRM para autónomos</h2>
      <p>Los CRMs empresariales tienen funcionalidades que un autónomo nunca usará. Busca una solución que tenga:</p>
      <ul>
        <li><strong>Pipeline de ventas visual:</strong> columnas por estado (Nuevo, Contactado, Propuesta, Cerrado)</li>
        <li><strong>Historial de interacciones:</strong> registro de llamadas, emails y reuniones</li>
        <li><strong>Alertas de seguimiento:</strong> avisos cuando un lead lleva demasiado tiempo sin actividad</li>
        <li><strong>Conversión lead a cliente:</strong> sin tener que duplicar datos manualmente</li>
        <li><strong>Integración con facturación:</strong> para cerrar el ciclo desde el lead hasta la factura</li>
        <li><strong>Acceso móvil:</strong> para actualizar datos desde cualquier lugar</li>
      </ul>
      <h2>CRMs generalistas vs. específicos para autónomos</h2>
      <p>HubSpot, Salesforce o Pipedrive son excelentes herramientas, pero están pensadas para equipos de ventas. Tienen funcionalidades que no necesitas, precios escalados para equipos y configuraciones que consumen tiempo.</p>
      <p>Un CRM diseñado específicamente para autónomos españoles, como ClientLabs, integra la gestión de leads con la facturación y el cumplimiento fiscal desde el primer día. No tienes que conectar tres herramientas distintas.</p>
      <h2>Cómo implementar un CRM correctamente</h2>
      <p>El mayor error al implementar un CRM es intentar configurarlo todo de golpe. El enfoque correcto:</p>
      <ul>
        <li>Empieza con los estados del pipeline que ya usas, aunque sean básicos</li>
        <li>Importa solo los contactos activos, no toda tu agenda</li>
        <li>Define un proceso de actualización semanal, no diario</li>
        <li>Añade funcionalidades gradualmente según las necesitas</li>
      </ul>
      <h3>El indicador de éxito de un CRM</h3>
      <p>Si abres el CRM cada mañana de forma natural para ver tu pipeline, el CRM está funcionando. Si lo ves como una obligación y lo evitas, necesitas simplificarlo o cambiar de herramienta.</p>
    </div>
  ),
  "como-conseguir-clientes-autonomo-sin-publicidad": (
    <div>
      <p>Invertir en publicidad digital puede generar clientes, pero tiene un coste elevado y requiere conocimientos específicos de marketing. La buena noticia es que existen estrategias probadas para conseguir clientes de forma consistente sin gastar un euro en anuncios. Estas son las que funcionan de verdad para autónomos españoles.</p>
      <h2>Estrategia 1: Red de contactos activa</h2>
      <p>Tu red de contactos es el activo más valioso que tienes al empezar. No hablamos solo de LinkedIn: hablamos de todas las personas que ya te conocen y pueden recomendarte. La clave es activar esa red de forma proactiva.</p>
      <p>Una táctica concreta: cada semana, contacta con 5 personas de tu red con un mensaje personalizado no comercial. Comparte algo útil, pregunta cómo está su negocio, ofrece valor antes de pedir. Las referencias llegaran de forma natural cuando seas la persona en quien piensan cuando alguien necesita lo que tú ofreces.</p>
      <h2>Estrategia 2: SEO local y presencia en Google</h2>
      <p>Si atiendes clientes en una zona geográfica concreta, el SEO local puede traerte clientes de alta calidad sin coste publicitario. Crea y optimiza tu perfil de Google My Business, solicita reseñas a clientes satisfechos y asegúrate de que tu web menciona la ciudad o región donde operas.</p>
      <p>Un autónomo bien posicionado en Google para búsquedas como "diseñador web en Madrid" o "asesor fiscal para autónomos en Barcelona" puede recibir varias consultas semanales de forma orgánica.</p>
      <h2>Estrategia 3: Contenido de valor</h2>
      <p>Crear contenido útil para tu sector (artículos, vídeos, publicaciones en LinkedIn) posiciona tu expertise y atrae clientes que ya tienen interés en lo que ofreces. El contenido funciona como un vendedor que trabaja 24/7 sin coste.</p>
      <ul>
        <li>Escribe sobre problemas concretos que resuelves</li>
        <li>Comparte casos de éxito (con permiso del cliente)</li>
        <li>Explica procesos y metodologías que uses</li>
        <li>Publica con consistencia: mejor una vez a la semana durante 6 meses que 10 veces seguidas y después nada</li>
      </ul>
      <h2>Estrategia 4: Programa de referidos</h2>
      <p>Un sistema formal de referidos convierte a tus clientes actuales en tu fuerza de ventas. Define un incentivo claro: descuento en el próximo proyecto, un informe gratuito, o simplemente una comisión por cada cliente referido que contrate. Comunícalo activamente, no solo cuando recuerdes hacerlo.</p>
      <h2>Estrategia 5: Colaboraciones con otros profesionales</h2>
      <p>Identifica profesionales complementarios a tu servicio con los que puedas establecer acuerdos de derivación mutua. Un diseñador web puede colaborar con un copywriter. Un asesor fiscal puede colaborar con un coach empresarial. Las sinergias correctas multiplican el alcance sin coste publicitario.</p>
      <h3>La clave: consistencia sobre intensidad</h3>
      <p>Ninguna de estas estrategias funciona con un esfuerzo de una semana. Todas requieren consistencia durante meses. El autónomo que publica en LinkedIn cada semana durante un año tendrá una cartera de clientes mucho más sólida que el que hace una campaña intensiva y luego desaparece.</p>
    </div>
  ),
  "factura-electronica-autonomos-2026": (
    <div>
      <p>La factura electrónica se está convirtiendo en una obligación para autónomos en España. El sistema Verifactu de la AEAT y la ley Crea y Crece están acelerando la implantación de la facturación electrónica entre profesionales independientes. Esta guía explica qué debes saber y cuándo debes actuar.</p>
      <h2>Qué es la factura electrónica y en qué se diferencia de un PDF</h2>
      <p>Una factura electrónica no es simplemente un PDF enviado por email. Es un documento estructurado en formato XML o FacturaE que contiene los datos de la factura en formato legible por máquinas, con firma digital que garantiza la autenticidad e integridad del documento.</p>
      <p>Muchos autónomos creen que ya "hacen facturas electrónicas" porque usan software y envían PDFs. No es correcto: el PDF es una factura digitalizada, no una factura electrónica en sentido estricto.</p>
      <h2>Verifactu: el sistema de la AEAT</h2>
      <p>Verifactu es el sistema de verificación de facturas de la Agencia Tributaria. Todo software de facturación que use un autónomo deberá estar homologado bajo este sistema. Las principales características:</p>
      <ul>
        <li>Cada factura tiene un código QR único verificable en la web de la AEAT</li>
        <li>El software envía los datos de las facturas a la AEAT en tiempo real o en lotes</li>
        <li>No se pueden modificar o eliminar facturas una vez registradas</li>
        <li>La AEAT puede contrastar tus facturas con las de tus clientes automáticamente</li>
      </ul>
      <h2>Calendario de obligatoriedad</h2>
      <p>La implantación de Verifactu es gradual. En 2026, los autónomos con mayor volumen de facturación son los primeros afectados. El calendario definitivo publicado por la AEAT establece fases según el tipo de contribuyente y el volumen de operaciones. Consulta el sitio web de la AEAT para conocer exactamente cuándo afecta a tu actividad.</p>
      <h2>Cómo prepararse</h2>
      <p>Si usas software de facturación, verifica que el proveedor tiene certificación Verifactu o está en proceso de obtenerla. Si facturas con Excel o Word, es el momento de migrar a un sistema compatible. Los pasos concretos:</p>
      <ul>
        <li>Audita tu sistema de facturación actual</li>
        <li>Verifica si tu software estará homologado a tiempo</li>
        <li>Migra a una solución compatible antes de que la obligación entre en vigor</li>
        <li>Configura tu perfil fiscal completo (NIF, razón social, dirección fiscal)</li>
        <li>Haz una prueba de envío y recepción antes de la fecha límite</li>
      </ul>
      <h2>Ventajas de la factura electrónica para el autónomo</h2>
      <p>Más allá del cumplimiento normativo, la factura electrónica tiene ventajas reales: cobros más rápidos (las empresas procesan facturas electrónicas antes que las en papel), menor riesgo de errores, automatización del registro contable y mejor trazabilidad de pagos.</p>
    </div>
  ),
  "como-retener-clientes-autonomo": (
    <div>
      <p>Conseguir un cliente nuevo cuesta entre 5 y 7 veces más que retener a uno existente. Esta estadística, ampliamente documentada en estudios de ventas B2B, cobra especial relevancia para los autónomos, que a menudo destinan toda su energía a la captación mientras descuidan la fidelización. Estas 8 estrategias cambian ese equilibrio.</p>
      <h2>Por qué los autónomos pierden clientes</h2>
      <p>En la mayoría de los casos, los clientes no se van porque encuentran algo mejor. Se van por indiferencia: sienten que no son una prioridad, que la comunicación se ha vuelto reactiva, o simplemente que el autónomo ha dejado de aportar valor más allá del trabajo contratado. La retención empieza mucho antes de que el cliente piense en irse.</p>
      <h2>Estrategia 1: Revisiones periódicas proactivas</h2>
      <p>No esperes a que el cliente te contacte con un problema. Programa revisiones trimestrales (o mensuales para clientes de alto valor) donde presentas un resumen del trabajo realizado, los resultados obtenidos y las oportunidades de mejora detectadas. Este contacto proactivo comunica implicación y diferencia a los buenos autónomos de los meramente ejecutores.</p>
      <h2>Estrategia 2: Comunicación transparente ante problemas</h2>
      <p>Los problemas ocurren. La diferencia está en cómo se gestionan. Comunicar un retraso o un imprevisto antes de que el cliente lo note, con un plan de acción concreto, genera más confianza que no haber tenido el problema. La transparencia es un activo de fidelización, no una debilidad.</p>
      <h2>Estrategia 3: Añade valor más allá del contrato</h2>
      <p>Comparte con tus clientes un artículo relevante para su sector, avisa de un cambio normativo que les afecte, o sugiere una mejora que hayas detectado aunque no esté en el alcance del proyecto. Este tipo de gestos tienen un coste muy bajo y un impacto de fidelización alto.</p>
      <h2>Estrategia 4: Programa de fidelidad informal</h2>
      <p>Los clientes de larga duración merecen condiciones especiales: precio congelado durante un periodo, acceso prioritario en periodos de alta demanda, o mejoras de servicio sin coste adicional. Comunícalo explícitamente: "Como llevas más de un año conmigo, este servicio adicional no tiene coste."</p>
      <h2>Estrategia 5: Facturación recurrente</h2>
      <p>Los proyectos puntuales generan incertidumbre. Los contratos de mantenimiento o retainers mensuales generan previsibilidad para ti y para el cliente. Si tu servicio lo permite, ofrece modalidades de tarifa fija mensual por un conjunto de servicios definido.</p>
      <h2>Estrategia 6: Recoge feedback regularmente</h2>
      <p>Una simple encuesta de satisfacción al terminar cada proyecto o cada trimestre te da información valiosa y transmite al cliente que su opinión importa. Usa herramientas como Typeform o un email simple con tres preguntas concretas.</p>
      <h2>Estrategia 7: Onboarding excelente para nuevos clientes</h2>
      <p>La retención empieza en los primeros 90 días. Un proceso de onboarding estructurado, con expectativas claras, comunicación frecuente y primeros resultados visibles, establece la base de una relación duradera.</p>
      <h2>Estrategia 8: Gestiona los finales con elegancia</h2>
      <p>Cuando un proyecto termina, no desaparezcas. Un email de cierre con un resumen de resultados, una oferta para la siguiente fase y una solicitud de reseña deja la puerta abierta para futuras colaboraciones y referencias.</p>
    </div>
  ),
  "herramientas-productividad-autonomos-2026": (
    <div>
      <p>El mercado de herramientas para autónomos no para de crecer. En 2026, la inteligencia artificial ha transformado varias categorías, creando soluciones más potentes y accesibles que hace unos años. Esta selección se centra en herramientas que realmente ahorran tiempo y que puedes implementar esta misma semana.</p>
      <h2>Gestión de proyectos y tareas</h2>
      <p>Para autónomos con pocos proyectos simultáneos, una herramienta simple es más efectiva que una compleja. Las opciones más usadas en 2026:</p>
      <ul>
        <li><strong>Notion:</strong> versátil, combina base de datos, documentos y tareas. Ideal si también llevas notas de clientes.</li>
        <li><strong>Linear:</strong> para autónomos técnicos. Más rápido y preciso que Jira para proyectos de desarrollo.</li>
        <li><strong>Trello:</strong> tableros Kanban visuales. La opción más simple para quienes solo necesitan ver el estado de las tareas.</li>
      </ul>
      <h2>Comunicación con clientes</h2>
      <p>La comunicación fragmentada entre WhatsApp, email y videollamadas es uno de los mayores ladrones de tiempo. Las herramientas que más autónomos están adoptando en 2026:</p>
      <ul>
        <li><strong>Loom:</strong> vídeos asíncronos para explicar conceptos o feedback sin necesidad de reunión</li>
        <li><strong>Cal.com:</strong> agenda compartida para que los clientes reserven reuniones sin ir y venir de emails</li>
        <li><strong>Notion + portal de cliente:</strong> espacio compartido donde el cliente puede ver el avance del proyecto</li>
      </ul>
      <h2>Facturación y gestión fiscal</h2>
      <p>Con la llegada de Verifactu, el software de facturación ha pasado de opcional a obligatorio. Las características que debes buscar en 2026: homologación Verifactu, cálculo automático de IVA e IRPF, generación de PDF con código QR, envío directo al cliente y registro de pagos parciales.</p>
      <h2>Automatización de tareas repetitivas</h2>
      <p>Las herramientas de automatización eliminan las tareas repetitivas que consumen tiempo sin generar valor. Para autónomos sin conocimientos técnicos:</p>
      <ul>
        <li><strong>Zapier o Make:</strong> conecta aplicaciones y automatiza flujos de trabajo</li>
        <li><strong>ChatGPT o Claude:</strong> para redactar emails, propuestas y contenido más rápido</li>
        <li><strong>Notion AI:</strong> para resumir notas de reuniones y generar documentos estructurados</li>
      </ul>
      <h2>Contabilidad personal del negocio</h2>
      <p>Separar las finanzas del negocio de las personales es fundamental. En 2026, varias plataformas bancarias para autónomos (BBVA Autónomos, Holvi, Qonto) ofrecen categorización automática de gastos, exportación para el gestor y avisos de liquidaciones fiscales.</p>
      <h3>Criterio de selección: el coste de oportunidad</h3>
      <p>Antes de añadir cualquier herramienta nueva, calcula cuánto tiempo te ahorra y cuánto cuesta. Si una herramienta de 20 euros/mes te ahorra 3 horas de trabajo al mes, y tu tarifa horaria es superior a 7 euros, merece la pena. Si no lo calculás, acabarás pagando suscripciones que no usas.</p>
    </div>
  ),
  "modelo-303-autonomos-guia": (
    <div>
      <p>El Modelo 303 es la declaración trimestral del IVA que todo autónomo obligado a presentar este impuesto debe enviar a la AEAT cuatro veces al año. Si es la primera vez que lo presentas, esta guía paso a paso te explica exactamente qué datos necesitas y cómo rellenarlo correctamente.</p>
      <h2>Quién debe presentar el Modelo 303</h2>
      <p>Debes presentar el Modelo 303 si eres autónomo y tu actividad está sujeta a IVA. La mayoría de servicios y ventas lo están, con algunas excepciones: servicios médicos, educativos y algunos financieros pueden estar exentos. Si tienes dudas, consulta con tu asesor fiscal.</p>
      <p>Los autónomos acogidos a la franquicia de IVA (facturación anual inferior a 85.000 euros) pueden estar exentos de presentarlo. Pero si facturas a empresas o a clientes que necesitan deducirse el IVA, la franquicia puede no ser la mejor opción.</p>
      <h2>Plazos de presentación</h2>
      <p>El Modelo 303 se presenta cuatro veces al año, en los 20 primeros días naturales del mes siguiente al cierre del trimestre:</p>
      <ul>
        <li><strong>1T (enero-marzo):</strong> del 1 al 20 de abril</li>
        <li><strong>2T (abril-junio):</strong> del 1 al 20 de julio</li>
        <li><strong>3T (julio-septiembre):</strong> del 1 al 20 de octubre</li>
        <li><strong>4T (octubre-diciembre):</strong> del 1 al 30 de enero del año siguiente</li>
      </ul>
      <h2>Qué datos necesitas antes de empezar</h2>
      <p>Antes de abrir el formulario, ten preparados:</p>
      <ul>
        <li>Todas las facturas emitidas del trimestre (IVA repercutido)</li>
        <li>Todas las facturas de gastos con IVA deducible (IVA soportado)</li>
        <li>El saldo pendiente de la declaración anterior (si tuviste resultado a compensar)</li>
        <li>Certificado digital o Cl@ve PIN para presentarlo por sede electrónica</li>
      </ul>
      <h2>Cómo rellenar el Modelo 303 paso a paso</h2>
      <p>El formulario se divide en varias secciones:</p>
      <ul>
        <li><strong>Identificación:</strong> NIF, nombre/razón social y ejercicio/periodo</li>
        <li><strong>IVA devengado:</strong> suma de bases imponibles y cuotas de IVA de todas tus facturas emitidas, separadas por tipo (21%, 10%, 4%)</li>
        <li><strong>IVA deducible:</strong> suma de cuotas de IVA de todas tus facturas de gastos</li>
        <li><strong>Resultado:</strong> IVA devengado menos IVA deducible. Si es positivo, pagas a Hacienda. Si es negativo, compensas el siguiente trimestre o solicitas devolución en el 4T</li>
      </ul>
      <h2>Errores frecuentes al rellenar el 303</h2>
      <ul>
        <li>Incluir el importe total de la factura (con IVA) en lugar de solo la base imponible</li>
        <li>Olvidar incluir facturas de compras de pequeñas cuantías</li>
        <li>No separar por tipos de IVA cuando tienes facturas con diferentes tipos</li>
        <li>No trasladar el saldo a compensar del trimestre anterior</li>
      </ul>
    </div>
  ),
  "como-crear-presupuesto-profesional": (
    <div>
      <p>Un presupuesto bien estructurado no es solo una lista de precios: es una herramienta de ventas. La diferencia entre un presupuesto que convierte y uno que no suele estar en cómo está presentado, no en el precio. Esta guía te explica exactamente qué incluir y cómo presentarlo.</p>
      <h2>Por qué muchos presupuestos no convierten</h2>
      <p>Los presupuestos fallidos tienen patrones comunes: llegan demasiado tarde, son difíciles de entender, no explican el valor de lo que se ofrece, o no tienen un siguiente paso claro. El cliente recibe un listado de tareas con precios y no sabe por qué debería contratarte a ti frente a otro.</p>
      <h2>Estructura de un presupuesto que convierte</h2>
      <p>Un presupuesto profesional tiene cinco secciones:</p>
      <ul>
        <li><strong>Diagnóstico:</strong> demuestra que entiendes el problema del cliente. "Según lo que me contaste, el principal desafío es..." Esto diferencia inmediatamente tu propuesta de la competencia que envía presupuestos genéricos.</li>
        <li><strong>Propuesta de solución:</strong> qué vas a hacer y por qué ese enfoque concreto. No solo "diseñaré tu web", sino "crearé una web que convierta visitantes en contactos con las siguientes características..."</li>
        <li><strong>Entregables y fases:</strong> qué recibirá el cliente, cuándo y en qué formato. La claridad reduce el número de revisiones y malentendidos.</li>
        <li><strong>Inversión:</strong> el precio con su desglose. Presenta siempre en términos de inversión y retorno esperado, no solo como coste.</li>
        <li><strong>Siguiente paso:</strong> una acción concreta. "Para confirmar el proyecto, firma este documento y realiza el pago del 50% de entrada."</li>
      </ul>
      <h2>Presentación y formato</h2>
      <p>El presupuesto refleja tu nivel de profesionalidad antes de que el cliente haya visto tu trabajo. Un presupuesto enviado en un email de texto sin estructura comunica "soy un freelance de los de siempre". Un PDF con diseño coherente, tipografía cuidada y tu logo comunica "soy un profesional que cuida los detalles".</p>
      <p>Herramientas como Canva, Notion o herramientas de propuestas específicas (Proposify, PandaDoc) permiten crear presupuestos visualmente atractivos sin ser diseñador.</p>
      <h2>Timing: cuándo enviar el presupuesto</h2>
      <p>El 90% de los autónomos tarda demasiado en enviar el presupuesto. El objetivo es enviarlo en un máximo de 48 horas después de la reunión, mientras el cliente todavía recuerda la conversación y el entusiasmo está fresco. Si tardas una semana, el cliente ya ha hablado con tres competidores.</p>
      <h3>Seguimiento del presupuesto</h3>
      <p>Envía el presupuesto y haz seguimiento a los 3 días si no hay respuesta. Un simple "¿tienes alguna duda sobre la propuesta?" tiene una tasa de respuesta mucho mayor que el silencio. No hacer seguimiento es uno de los errores más caros que comete un autónomo.</p>
    </div>
  ),
  "autonomo-o-sociedad-limitada": (
    <div>
      <p>La pregunta de si conviene operar como autónomo o crear una Sociedad Limitada (SL) aparece invariablemente cuando el negocio empieza a crecer. No hay una respuesta universal: depende de tus ingresos, tu situación personal y tus objetivos a medio plazo. Esta guía te da los criterios concretos para tomar la decisión.</p>
      <h2>Las diferencias fundamentales</h2>
      <p>Como autónomo, eres tú quien responde de las deudas del negocio con tu patrimonio personal. En una SL, la responsabilidad está limitada al capital aportado (mínimo 1 euro desde 2023). Esta diferencia en responsabilidad es el primer factor a considerar, especialmente si tu actividad implica riesgos financieros significativos.</p>
      <p>En términos fiscales, los autónomos tributan en el IRPF (escala progresiva del 19% al 47% en 2026). Las SL tributan en el Impuesto sobre Sociedades (IS), cuyo tipo general es del 25%, con tipo reducido del 15% para empresas de nueva creación durante los dos primeros ejercicios.</p>
      <h2>¿A partir de qué ingresos compensa la SL?</h2>
      <p>Como regla general, la SL empieza a tener ventajas fiscales a partir de los 50.000-60.000 euros de beneficio neto anual. Por debajo de esa cifra, los costes administrativos de la SL (gestor, inscripción, depósito de cuentas) suelen superar el ahorro fiscal.</p>
      <p>El cálculo simplificado:</p>
      <ul>
        <li>Como autónomo con 60.000 euros de base imponible, el tipo marginal efectivo es aproximadamente el 35-40%</li>
        <li>Una SL tributa al 25% (o 15% los primeros 2 años), pero tú como socio-administrador también tributas en el IRPF por el salario que te pagues</li>
        <li>La clave está en el "dividendo diferido": dejar beneficios en la SL y tributarlos en el futuro cuando te interese</li>
      </ul>
      <h2>Costes y obligaciones adicionales de la SL</h2>
      <p>Antes de decidirte por la SL, considera los costes que implica:</p>
      <ul>
        <li>Gestor o asesor fiscal especializado: 150-400 euros/mes según complejidad</li>
        <li>Inscripción en el Registro Mercantil: 150-400 euros de media</li>
        <li>Depósito de cuentas anuales: 100-200 euros anuales</li>
        <li>Legalización del libro de actas y estatutos: honorarios notariales</li>
        <li>Tiempo de gestión: mayor burocracia que como autónomo</li>
      </ul>
      <h2>Factores no fiscales que también importan</h2>
      <p>La SL puede ser necesaria incluso sin ventaja fiscal si: contratas empleados, quieres separar el patrimonio personal del profesional por razones de seguridad, necesitas proyectar una imagen más corporativa para acceder a grandes clientes, o planeas vender el negocio en el futuro (vender participaciones de una SL es más sencillo que vender un negocio de autónomo).</p>
      <h3>La recomendación práctica</h3>
      <p>Consulta con un asesor fiscal antes de decidir. Con tus ingresos actuales y proyectados, puede calcular exactamente la diferencia y recomendarte el momento óptimo para el cambio. La mayoría de asesores hacen este análisis sin coste o a un coste muy reducido.</p>
    </div>
  ),
  "como-automatizar-negocio-autonomo": (
    <div>
      <p>La automatización no es exclusiva de las grandes empresas. Un autónomo bien organizado puede automatizar el 30-40% de sus tareas administrativas con herramientas accesibles y sin conocimientos técnicos avanzados. El resultado: más tiempo para trabajo facturable y menos horas perdidas en tareas repetitivas.</p>
      <h2>Qué tareas merece la pena automatizar primero</h2>
      <p>No todo merece automatizarse. El criterio es simple: una tarea merece automatizarse si se repite más de una vez a la semana y siempre sigue el mismo proceso. Las categorías con mayor retorno de la automatización para autónomos:</p>
      <ul>
        <li>Recordatorios de seguimiento de leads</li>
        <li>Envío de facturas y recordatorios de pago</li>
        <li>Respuestas iniciales a nuevas consultas</li>
        <li>Programación de publicaciones en redes sociales</li>
        <li>Informes periódicos para clientes</li>
        <li>Copias de seguridad de archivos de trabajo</li>
      </ul>
      <h2>Automatizaciones de seguimiento comercial</h2>
      <p>La primera automatización que todo autónomo debería implementar es el seguimiento de leads. Con herramientas como ClientLabs, puedes configurar alertas automáticas cuando un lead lleva más de X días sin actividad, o cuando una propuesta lleva más de 3 días sin respuesta. Esta automatización simple puede recuperar el 20-30% de las oportunidades que de otro modo se pierden.</p>
      <h2>Automatizaciones de facturación</h2>
      <p>Si tienes clientes recurrentes, la facturación mensual puede ser completamente automática: el software genera la factura, la envía al cliente y registra el seguimiento de pago. Si el cliente no paga en el plazo acordado, se genera un recordatorio automático. Esto elimina una de las tareas más tediosas de la gestión de un negocio freelance.</p>
      <h2>Automatizaciones de comunicación</h2>
      <p>Un email de bienvenida automático cuando un nuevo lead llega a tu sistema, una respuesta inmediata fuera de horario explicando cuándo responderás, o un recordatorio automático 48 horas antes de una reunión. Estas automatizaciones simples comunican profesionalidad sin consumir tu tiempo.</p>
      <ul>
        <li><strong>Zapier o Make:</strong> conecta apps sin código. Por ejemplo, cuando alguien rellena un formulario de contacto, se crea automáticamente el lead en tu CRM.</li>
        <li><strong>Calendly o Cal.com:</strong> agenda automática sin emails de ida y vuelta</li>
        <li><strong>ChatGPT API:</strong> para autónomos técnicos, automatización de respuestas a consultas frecuentes</li>
      </ul>
      <h2>Automatizaciones de producción de contenido</h2>
      <p>Si el contenido es parte de tu estrategia de captación, las herramientas de IA pueden reducir el tiempo de creación a la mitad. Usar IA para borradores, estructura o ideas no elimina tu voz ni tu expertise: simplifica el proceso de llegar al resultado final.</p>
      <h3>Por dónde empezar</h3>
      <p>Elige una sola automatización y ponla en marcha esta semana. No intentes automatizarlo todo a la vez. Una automatización bien implementada que funcione durante meses vale más que un plan ambicioso que nunca se ejecuta.</p>
    </div>
  ),
  "seguimiento-clientes-autonomo": (
    <div>
      <p>Un proyecto perdido por falta de seguimiento es una de las frustraciones más comunes en la vida de un autónomo. Se hace todo bien en la fase inicial y, por no tener un sistema claro, la oportunidad se diluye. Esta guía te da el sistema concreto para que eso nunca vuelva a ocurrir.</p>
      <h2>Por qué el seguimiento es diferente para autónomos</h2>
      <p>Los equipos de ventas corporativos tienen CRMs complejos, gerentes de cuenta y pipelines supervisados. Un autónomo es, a la vez, el vendedor, el ejecutor y el gestor. El sistema de seguimiento tiene que ser simple para ser sostenible: no puede consumir más de 20 minutos al día.</p>
      <h2>Los 5 momentos críticos de seguimiento</h2>
      <p>No todos los momentos de un proyecto requieren el mismo nivel de seguimiento. Estos son los cinco momentos donde el seguimiento marca la diferencia:</p>
      <ul>
        <li><strong>Primer contacto:</strong> responder en menos de 24 horas. Los leads se enfrían rapidísimo.</li>
        <li><strong>Después de enviar una propuesta:</strong> seguimiento a las 48-72 horas. No esperes a que decidan solos.</li>
        <li><strong>Al entregar un proyecto:</strong> confirmación de recepción y satisfacción inmediata.</li>
        <li><strong>A los 30 días de cerrar:</strong> seguimiento de satisfacción y apertura para siguientes proyectos.</li>
        <li><strong>A los 90 días de inactividad:</strong> reactivación con algo de valor (artículo, consejo, novedad).</li>
      </ul>
      <h2>Cómo estructurar el pipeline de seguimiento</h2>
      <p>El pipeline visual es la herramienta más efectiva para gestionar el seguimiento. Define 5-6 estados máximo y asocia a cada uno una acción y un tiempo máximo de espera:</p>
      <ul>
        <li><strong>Nuevo:</strong> contactar en 24h</li>
        <li><strong>En conversación:</strong> seguimiento cada 3 días</li>
        <li><strong>Propuesta enviada:</strong> seguimiento en 48h, luego semanal</li>
        <li><strong>En negociación:</strong> seguimiento según ritmo del cliente</li>
        <li><strong>Cerrado:</strong> onboarding en 24h</li>
        <li><strong>Estancado:</strong> revisión mensual para reactivar o archivar</li>
      </ul>
      <h2>Herramientas para implementar el sistema</h2>
      <p>El sistema funciona solo si está automatizado o, al menos, semi-automatizado. Las opciones van desde una hoja de Excel con formato condicional que resalte leads sin actividad, hasta herramientas específicas como ClientLabs, que detecta automáticamente leads estancados y envía recordatorios.</p>
      <p>Sea cual sea la herramienta, lo importante es que el estado de cada lead sea visible de un vistazo y que el sistema te avise cuando debes actuar, sin que tengas que ir a buscar esa información.</p>
      <h2>La métrica que debes seguir</h2>
      <p>Calcula cada mes tu tasa de conversión: leads contactados vs. proyectos cerrados. Si está por debajo del 20%, el problema puede ser de seguimiento. Si está entre el 20% y el 40%, tu sistema funciona bien. Por encima del 40%, o tus precios son demasiado bajos, o tienes un proceso comercial muy sólido.</p>
    </div>
  ),
  "cuota-autonomos-2026": (
    <div>
      <p>Desde 2023, el sistema de cotización de autónomos en España cambió radicalmente con la implantación de las cuotas por tramos de ingresos reales. En 2026, el sistema está plenamente operativo y conocer exactamente cuánto pagas y qué opciones tienes para reducirlo puede suponer cientos de euros al año.</p>
      <h2>Cómo funciona el sistema de tramos en 2026</h2>
      <p>El nuevo sistema establece 15 tramos de cotización según los rendimientos netos anuales del autónomo. Los rendimientos netos son los ingresos menos los gastos deducibles y la propia cuota de autónomos (que es deducible). Para 2026, los tramos van desde una cuota mínima mensual de aproximadamente 200 euros para los que menos ingresan, hasta una cuota máxima de aproximadamente 590 euros para los de mayor rendimiento.</p>
      <h2>Cómo declarar correctamente tus ingresos previstos</h2>
      <p>Al principio del año debes declarar a la Seguridad Social los ingresos que estimas tendrás durante el ejercicio. Esto determina tu tramo y tu cuota mensual provisional. Al cierre del año, se hace una regularización en base a lo realmente ingresado:</p>
      <ul>
        <li>Si ganaste más de lo previsto, pagarás la diferencia</li>
        <li>Si ganaste menos, la Seguridad Social te devolverá el exceso</li>
        <li>Puedes cambiar de tramo hasta 6 veces al año si tus ingresos varían</li>
      </ul>
      <h2>La tarifa plana para nuevos autónomos</h2>
      <p>Los autónomos que se dan de alta por primera vez (o que llevan más de dos años sin cotizar) tienen derecho a una tarifa plana reducida durante el primer año. En 2026, esta tarifa es de 80 euros/mes durante los primeros 12 meses, independientemente de los ingresos. Es uno de los incentivos más importantes del sistema para nuevos emprendedores.</p>
      <h2>Reducciones y bonificaciones disponibles</h2>
      <p>Más allá de la tarifa plana, existen otras reducciones:</p>
      <ul>
        <li><strong>Discapacidad reconocida:</strong> reducciones adicionales en la cuota</li>
        <li><strong>Autónomos en municipios rurales menores de 5.000 habitantes:</strong> bonificaciones específicas</li>
        <li><strong>Conciliación familiar:</strong> reducción del 80% durante periodos de cuidado de menores o dependientes</li>
        <li><strong>Pluriactividad:</strong> si cotizas simultáneamente en el Régimen General, puedes tener reducción en la cuota de autónomos</li>
      </ul>
      <h2>Cómo reducir la cuota legalmente</h2>
      <p>La forma más efectiva de reducir la cuota es declarar correctamente los rendimientos previstos. Si estás en un tramo superior al que te corresponde por tus ingresos reales, estás pagando de más. Solicita el cambio de tramo a través de la Seguridad Social (RETA) o mediante tu asesor. El proceso se hace en Import@ss, la plataforma digital de la Seguridad Social.</p>
    </div>
  ),
  "como-organizar-finanzas-autonomo": (
    <div>
      <p>La organización financiera de un negocio freelance es una de las áreas donde más autónomos cometen errores con consecuencias serias: descubiertos bancarios en periodo de declaraciones, sorpresas en la Renta de fin de año, o falta de liquidez para invertir en el negocio. Esta guía establece el sistema desde cero.</p>
      <h2>Paso 1: Separar cuentas personal y profesional</h2>
      <p>Todo empieza aquí. Abre una cuenta bancaria dedicada exclusivamente al negocio. Todos los ingresos profesionales entran a esa cuenta. Todos los gastos del negocio salen de esa cuenta. Tu "salario" es una transferencia periódica de esa cuenta a tu cuenta personal.</p>
      <p>Esta separación hace que la contabilidad sea infinitamente más simple, facilita justificar gastos ante Hacienda y te da visibilidad real de la salud financiera de tu negocio.</p>
      <h2>Paso 2: El sistema de las tres bolsas</h2>
      <p>Cuando llega un ingreso, distribúyelo mentalmente en tres partes:</p>
      <ul>
        <li><strong>Impuestos (25-35%):</strong> reserva esta proporción de cada ingreso. Nunca lo toques. Al llegar el trimestre de declaración, el dinero ya está apartado.</li>
        <li><strong>Gastos del negocio (10-20%):</strong> herramientas, formación, marketing, gestor.</li>
        <li><strong>Tu salario (el resto):</strong> lo que realmente puedes gastar.</li>
      </ul>
      <p>La proporción exacta para impuestos depende de tu situación: si tienes retenciones del 15% en tus facturas, el tipo efectivo final es menor. Con tu asesor fiscal puedes calcular el porcentaje exacto para tu caso.</p>
      <h2>Paso 3: Provisión trimestral para impuestos</h2>
      <p>La sorpresa de fin de año es el problema financiero más frecuente entre autónomos. Para evitarlo, calcula al final de cada trimestre cuánto deberás pagar en impuestos y apártalo en una subcuenta de ahorro. Cuando llega la declaración, ya tienes el dinero.</p>
      <h2>Paso 4: Fondo de emergencia del negocio</h2>
      <p>Un negocio sin colchón financiero es vulnerable: cualquier periodo de inactividad, un cliente moroso o una inversión inesperada puede crear una crisis. El objetivo es tener entre 3 y 6 meses de gastos fijos cubiertos en liquidez.</p>
      <h2>Paso 5: Control mensual de tesorería</h2>
      <p>Una vez al mes, revisa tres indicadores:</p>
      <ul>
        <li>Ingresos cobrados vs. facturado (detecta retrasos de pago)</li>
        <li>Gastos del mes vs. mes anterior (detecta derroches)</li>
        <li>Saldo disponible después de apartar la provisión de impuestos</li>
      </ul>
      <h3>La herramienta más simple que funciona</h3>
      <p>Una hoja de cálculo con tres columnas (fecha, concepto, importe) y una fila de saldo acumulado es suficiente para empezar. Lo importante no es la herramienta sino el hábito: 15 minutos a la semana actualizando los movimientos es todo lo que necesitas para tener el control financiero de tu negocio.</p>
    </div>
  ),
  "alta-autonomo-paso-a-paso": (
    <div>
      <p>Darse de alta como autónomo en España puede parecer un proceso burocrático complicado, pero siguiendo los pasos en el orden correcto es más sencillo de lo que parece. Esta guía cubre todo el proceso para 2026: trámites, costes, plazos y los errores más frecuentes que conviene evitar desde el principio.</p>
      <h2>Paso 1: Alta en la Seguridad Social (RETA)</h2>
      <p>El primer trámite es darte de alta en el Régimen Especial de Trabajadores Autónomos (RETA) de la Seguridad Social. Tienes que hacerlo antes de empezar a ejercer tu actividad y, en cualquier caso, antes de emitir tu primera factura.</p>
      <p>En 2026, el trámite se hace a través de la sede electrónica de la Seguridad Social (Import@ss), con certificado digital o Cl@ve PIN. Necesitarás:</p>
      <ul>
        <li>DNI/NIE en vigor</li>
        <li>Número de la Seguridad Social</li>
        <li>Elección del CNAE (código de actividad)</li>
        <li>Base de cotización inicial (influye en tu cuota mensual)</li>
        <li>IBAN para el domicilio de los pagos</li>
      </ul>
      <h2>Paso 2: Alta en Hacienda (Modelo 036/037)</h2>
      <p>En paralelo, debes darte de alta en el Censo de Empresarios de la AEAT mediante el Modelo 036 o el simplificado 037. Este trámite define tu actividad (epígrafe del IAE), si estás sujeto a IVA y si aplicarás retenciones de IRPF. Se puede hacer online en la sede electrónica de la AEAT.</p>
      <h2>Paso 3: Licencias y registros específicos</h2>
      <p>Dependiendo de tu actividad, puede ser necesario registrarte en organismos adicionales. Ejemplos: registro sanitario para actividades de alimentación, colegiación obligatoria para médicos, abogados o arquitectos, o licencias municipales para ciertas actividades presenciales. Consulta con tu ayuntamiento y con el colegio profesional de tu sector si aplica.</p>
      <h2>Costes del primer año</h2>
      <p>Presupuesta los siguientes costes fijos para el primer año:</p>
      <ul>
        <li><strong>Cuota de autónomos:</strong> tarifa plana de 80 euros/mes los primeros 12 meses</li>
        <li><strong>Gestor fiscal y laboral:</strong> entre 50 y 150 euros/mes según servicios</li>
        <li><strong>Software de facturación:</strong> entre 10 y 30 euros/mes</li>
        <li><strong>Gastos de inicio (web, material, formación):</strong> variable según actividad</li>
      </ul>
      <h2>Errores frecuentes al empezar</h2>
      <ul>
        <li>Empezar a facturar antes de estar dado de alta: puede acarrear sanciones</li>
        <li>Elegir un epígrafe del IAE incorrecto: puede crear problemas al deducir gastos</li>
        <li>No solicitar la tarifa plana al hacer el alta: se pierde la bonificación para siempre en ese periodo</li>
        <li>No contratar un seguro de responsabilidad civil en actividades que lo requieran</li>
        <li>No separar la cuenta bancaria personal de la profesional desde el primer día</li>
      </ul>
      <h2>Los primeros 90 días como autónomo</h2>
      <p>Los primeros tres meses son los más importantes. Focalízate en conseguir los primeros clientes, establecer tu proceso de facturación y entender el calendario fiscal. No intentes automatizarlo todo de golpe: primero aprende el proceso manual, luego automatiza. Con la estructura correcta desde el principio, el negocio crece sobre una base sólida.</p>
    </div>
  ),
}
