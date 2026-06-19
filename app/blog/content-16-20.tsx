import React from "react"
import Link from "next/link"

export const ARTICLES_16_20: Record<string, React.ReactNode> = {
  "primera-factura-clientlabs": (
    <div>
      <h2>Tu primera factura legal en ClientLabs en menos de 10 minutos</h2>
      <p>Emitir tu primera factura conforme en ClientLabs son cuatro pasos: das de alta al cliente, añades los conceptos, revisas IVA y retención, y emites. El programa numera, calcula los impuestos y genera una factura con todos los elementos obligatorios (y, cuando aplique Verifactu, su huella y QR). En menos de 10 minutos la tienes lista para enviar.</p>
      <h2>Antes de empezar</h2>
      <p>Solo necesitas tus datos fiscales (NIF, dirección) configurados una vez en tu perfil. A partir de ahí, cada factura reutiliza esos datos.</p>
      <h2>Paso 1: añade el cliente</h2>
      <p>Crea la ficha del cliente con su nombre/razón social, NIF y dirección. Si ya lo tenías de un lead o presupuesto, está listo: no tecleas dos veces.</p>
      <h2>Paso 2: crea la factura y añade conceptos</h2>
      <p>Nueva factura → eliges el cliente → añades líneas (concepto, cantidad, precio). El programa calcula la <strong>base imponible</strong> automáticamente.</p>
      <h2>Paso 3: revisa IVA y retención</h2>
      <ul><li>Elige el <strong>tipo de IVA</strong> (21 %, 10 % o 4 %).</li><li>Si tu actividad lleva <strong>retención de IRPF</strong>, aplícala (15 % o 7 %). Dudas en <Link href="/blog/retencion-irpf-factura">qué retención poner</Link>.</li><li>ClientLabs calcula la cuota y el <strong>total</strong> por ti.</li></ul>
      <h2>Paso 4: emite</h2>
      <p>Al emitir, la factura recibe su <strong>número correlativo</strong> y queda registrada. Cuando Verifactu sea obligatorio, además llevará huella, QR y encadenamiento sin que tengas que hacer nada. La descargas en PDF o la envías al cliente.</p>
      <h2>Qué acabas de evitar</h2>
      <table><thead><tr><th>A mano</th><th>En ClientLabs</th></tr></thead><tbody><tr><td>Numerar tú (riesgo de saltos)</td><td>Numeración automática</td></tr><tr><td>Calcular IVA/IRPF</td><td>Calculado solo</td></tr><tr><td>Plantilla incompleta</td><td>Todos los campos obligatorios</td></tr><tr><td>Verifactu pendiente</td><td>Conforme de serie</td></tr></tbody></table>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto tardo en hacer la primera factura?</strong> Menos de 10 minutos, contando configurar tus datos la primera vez.</p>
      <p><strong>¿La factura es legal?</strong> Sí: lleva todos los elementos obligatorios y, con Verifactu, huella y QR.</p>
      <p><strong>¿Puedo poner retención de IRPF?</strong> Sí, eliges el tipo y ClientLabs calcula el total.</p>
      <p><strong>¿Y si me equivoco?</strong> Emites una factura rectificativa; no se borra para mantener la numeración.</p>
      <h2>En resumen</h2>
      <p>Cuatro pasos y tienes tu primera factura legal. Lo que en Excel son cálculos y riesgos, en ClientLabs es elegir cliente, conceptos y emitir. <Link href="/precios">Crea tu cuenta</Link> y emite la primera hoy.</p>
    </div>
  ),
  "pipeline-de-clientlabs": (
    <div>
      <h2>Del primer contacto al cliente: el pipeline de ClientLabs</h2>
      <p>El pipeline de ClientLabs es el recorrido de cada oportunidad por etapas —nuevo, contactado, propuesta, cliente— para que veas de un vistazo qué tienes en marcha y qué toca hacer. Lo que lo hace útil para un autónomo es que el lead que se convierte en cliente <strong>ya trae sus datos</strong> a la factura: del primer contacto al cobro sin reescribir nada.</p>
      <h2>Las etapas, de un vistazo</h2>
      <table><thead><tr><th>Etapa</th><th>Qué significa</th><th>Acción típica</th></tr></thead><tbody><tr><td>Nuevo</td><td>Entró un interesado</td><td>Contactar pronto</td></tr><tr><td>Contactado</td><td>Ya hablasteis</td><td>Enviar propuesta</td></tr><tr><td>Propuesta</td><td>Presupuesto enviado</td><td>Hacer seguimiento</td></tr><tr><td>Cliente</td><td>Cerrado</td><td>Facturar</td></tr><tr><td>Perdido</td><td>No salió</td><td>Aprender por qué</td></tr></tbody></table>
      <h2>Paso 1: entra el lead</h2>
      <p>Da igual el canal (formulario web, WhatsApp, recomendación): el lead entra en el pipeline como "nuevo". Lo importante es que <strong>todo caiga en el mismo sitio</strong>. Concepto en <Link href="/blog/sistema-de-leads-simple">sistema de leads simple</Link>.</p>
      <h2>Paso 2: muévelo por etapas</h2>
      <p>A medida que avanzas, cambias la etapa. Cada lead tiene su ficha con el historial: qué hablasteis, qué presupuesto enviaste, cuándo toca el siguiente paso.</p>
      <h2>Paso 3: seguimiento que no se olvida</h2>
      <p>Cada oportunidad activa lleva una <strong>tarea con fecha</strong>. Así no dependes de la memoria para llamar a tiempo.</p>
      <h2>Paso 4: de cliente a factura, sin reteclear</h2>
      <p>Cuando el lead pasa a "cliente", sus datos fiscales <strong>ya están</strong> en la ficha. Generas el presupuesto o la factura desde ahí, sin volver a escribir NIF ni dirección. Es el ahorro real frente a tener el CRM y la facturación separados.</p>
      <h2>Por qué importa unir pipeline y facturación</h2>
      <p>Con herramientas separadas, el dato del cliente vive en dos sitios y se desactualiza. Con el pipeline conectado a la facturación, el recorrido es uno solo: contacto → propuesta → cliente → factura → cobro.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué es el pipeline?</strong> La representación por etapas de tus oportunidades de venta, del primer contacto al cierre.</p>
      <p><strong>¿De dónde entran los leads?</strong> De los canales que uses (web, mensajería, recomendaciones); todos a la misma lista.</p>
      <p><strong>¿El pipeline se conecta con las facturas?</strong> Sí: cuando un lead pasa a cliente, sus datos están listos para facturar sin reteclear.</p>
      <p><strong>¿Sirve si trabajo solo?</strong> Sí: te evita perder oportunidades por falta de seguimiento, aunque no tengas equipo.</p>
      <h2>En resumen</h2>
      <p>El pipeline convierte "tengo varios interesados" en un sistema con etapas y seguimiento, y enlaza la venta con la factura. <Link href="/precios">Pruébalo</Link> y lleva tus oportunidades del primer contacto al cobro en un solo flujo.</p>
    </div>
  ),
  "verifactu-en-clientlabs": (
    <div>
      <h2>Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada</h2>
      <p>ClientLabs cumple Verifactu de serie: cada factura que emites lleva su <strong>huella</strong>, su <strong>encadenamiento</strong> con la anterior, el <strong>código QR</strong> y la leyenda obligatoria, y en modo Verifactu se <strong>remite a la Agencia Tributaria</strong> automáticamente. Tú haces la factura como siempre; la parte técnica la pone el programa.</p>
      <h2>Qué exige Verifactu (y qué pone ClientLabs)</h2>
      <table><thead><tr><th>Requisito de Verifactu</th><th>Lo hace ClientLabs</th></tr></thead><tbody><tr><td>Huella / hash inalterable</td><td>Sí, en cada factura</td></tr><tr><td>Encadenamiento con la anterior</td><td>Sí, automático</td></tr><tr><td>Código QR</td><td>Sí, impreso en la factura</td></tr><tr><td>Leyenda "VERI*FACTU" / verificable</td><td>Sí</td></tr><tr><td>Envío a Hacienda (modo Verifactu)</td><td>Sí, automático</td></tr></tbody></table>
      <p>Contexto de la norma y fechas en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <h2>Cómo se ve en la práctica</h2>
      <ol><li><strong>Emites la factura</strong> normal: cliente, conceptos, IVA.</li><li>Al emitir, ClientLabs <strong>genera la huella</strong> y la <strong>encadena</strong> con la factura anterior.</li><li>La factura sale con su <strong>QR y leyenda</strong>.</li><li>En modo Verifactu, el registro se <strong>envía a la AEAT</strong> sin que hagas nada.</li></ol>
      <p>No hay configuración técnica: ni certificados que pelear ni ficheros que subir a mano.</p>
      <h2>Por qué esto te quita un problema</h2>
      <ul><li><strong>Cero riesgo de sanción</strong> por factura sin QR o leyenda (hasta 1.000 € cada una) o por software no conforme (hasta 50.000 €).</li><li><strong>Sin migración a última hora:</strong> cuando llegue tu fecha (1 de julio de 2027 para autónomos), ya estás listo.</li><li><strong>Tranquilidad con tu gestor:</strong> los registros son trazables e inalterables.</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿ClientLabs es conforme con Verifactu?</strong> Sí. Cada factura lleva huella, encadenamiento, QR y leyenda, y se remite a Hacienda en modo Verifactu.</p>
      <p><strong>¿Tengo que configurar algo técnico?</strong> No. Emites la factura y el sistema añade todo lo obligatorio.</p>
      <p><strong>¿Envía las facturas a Hacienda por mí?</strong> En modo Verifactu, sí, de forma automática.</p>
      <p><strong>¿Desde cuándo tengo que cumplir?</strong> Autónomos, desde el 1 de julio de 2027; empresas, desde el 1 de enero de 2027. Mejor estar listo antes.</p>
      <h2>En resumen</h2>
      <p>Verifactu suena técnico, pero contigo no lo es: ClientLabs pone huella, QR, encadenamiento y envío a Hacienda en cada factura. Tú facturas; la norma se cumple sola. <Link href="/precios">Empieza aquí</Link>.</p>
    </div>
  ),
  "migrar-de-excel-a-clientlabs": (
    <div>
      <h2>Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min</h2>
      <p>Pasar de Excel a ClientLabs son tres pasos: exportas lo que tienes, lo importas y configuras tus datos fiscales una vez. En unos diez minutos tienes tu cartera dentro, listo para emitir facturas conformes con Verifactu, sin perder tu histórico.</p>
      <h2>Antes de empezar: qué vas a traer</h2>
      <ul><li>Tu <strong>lista de clientes</strong> (nombre, NIF, dirección, email).</li><li>Tus <strong>facturas o ingresos</strong> anteriores, si quieres el histórico.</li><li>Tus <strong>datos fiscales</strong> para emitir (los configuras una vez).</li></ul>
      <h2>Paso 1: exporta tu Excel</h2>
      <p>Guarda tu hoja de clientes en un archivo (CSV o Excel) con una fila por cliente y columnas claras (nombre, NIF, email...). Lo mismo con facturas si las quieres importar.</p>
      <h2>Paso 2: importa en ClientLabs</h2>
      <p>Sube el archivo en la sección de clientes y <strong>mapea las columnas</strong> (esta columna es el NIF, esta el email...). ClientLabs crea una ficha por cliente. Si algo no cuadra, lo corriges antes de confirmar.</p>
      <h2>Paso 3: configura tus datos fiscales</h2>
      <p>Introduce tu NIF, dirección y, si aplica, tu retención por defecto. A partir de aquí, cada factura reutiliza estos datos.</p>
      <h2>Paso 4: emite tu primera factura</h2>
      <p>Con la cartera dentro, creas una factura eligiendo el cliente: numeración, IVA y total automáticos, y conforme a Verifactu. Tienes el detalle en <Link href="/blog/primera-factura-clientlabs">tu primera factura</Link>.</p>
      <h2>Qué ganas al dejar Excel</h2>
      <table><thead><tr><th>En Excel</th><th>En ClientLabs</th></tr></thead><tbody><tr><td>Numeración a mano</td><td>Automática</td></tr><tr><td>IVA/IRPF calculado a ojo</td><td>Calculado solo</td></tr><tr><td>Sin copia segura</td><td>En la nube</td></tr><tr><td>No cumple Verifactu</td><td>Conforme de serie</td></tr><tr><td>Cliente y factura separados</td><td>Todo en una ficha</td></tr></tbody></table>
      <p>Por qué urge dejarlo, en <Link href="/blog/facturar-en-excel-2026">facturar en Excel te sale caro</Link>.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto tarda la migración?</strong> Unos 10 minutos para clientes; algo más si importas mucho histórico de facturas.</p>
      <p><strong>¿Pierdo mis facturas antiguas?</strong> No: las exportas de Excel e importas, o las conservas como histórico.</p>
      <p><strong>¿Necesito conocimientos técnicos?</strong> No. Subes el archivo y mapeas columnas; es asistido.</p>
      <p><strong>¿Y si mi Excel está desordenado?</strong> Conviene limpiar columnas antes de importar; luego puedes corregir fichas dentro.</p>
      <h2>En resumen</h2>
      <p>Migrar no es empezar de cero: es traer lo que ya tienes y dejar atrás los riesgos de Excel. En diez minutos tienes clientes, datos fiscales y la primera factura conforme. <Link href="/precios">Empieza la migración</Link>.</p>
    </div>
  ),
  "gastos-deducibles-autonomo-2026": (
    <div>
      <h2>Gastos deducibles del autónomo en 2026: la lista con ejemplos</h2>
      <p>Un gasto es deducible cuando está vinculado a tu actividad, lo puedes justificar con factura y lo tienes registrado en tu contabilidad. Si cumple esas tres condiciones, resta en tu IRPF y, casi siempre, te permite recuperar el IVA. Aquí tienes la lista por categorías y lo que Hacienda mira en cada caso.</p>
      <h2>Los 3 requisitos para deducir un gasto</h2>
      <p>Antes de la lista, la regla que decide todo:</p>
      <ol><li><strong>Vinculación con la actividad.</strong> El gasto tiene que estar relacionado con tu trabajo. Una comida con un cliente, sí; la cena del sábado con amigos, no.</li><li><strong>Justificación.</strong> Necesitas <strong>factura completa</strong> a tu nombre y con tu NIF. Un ticket simple no suele bastar para deducir el IVA.</li><li><strong>Registro.</strong> Debe constar en tus libros de ingresos y gastos.</li></ol>
      <p>Si falla uno de los tres, Hacienda puede rechazar la deducción. Hacienda puede revisar hasta <strong>4 años</strong> (prescripción, art. 66 LGT), pero la conservación mercantil de libros y documentación es de <strong>6 años</strong> (art. 30 del Código de Comercio): guarda las facturas <strong>al menos 6 años</strong>.</p>
      <h2>Lista de gastos deducibles por categoría</h2>
      <h3>1. Cuota de autónomos</h3>
      <p>La cuota mensual al RETA es <strong>100 % deducible</strong> como gasto. Es de los más olvidados y de los más claros.</p>
      <h3>2. Suministros y oficina</h3>
      <ul><li><strong>Si tienes local u oficina:</strong> luz, agua, internet, alquiler y gastos del local son deducibles al 100 % (con factura).</li><li><strong>Si trabajas desde casa:</strong> comunica en el modelo <strong>036/037</strong> qué parte de la vivienda afectas a la actividad. Sobre <strong>suministros</strong> (luz, agua, gas, internet) la fórmula es <strong>m² afectos ÷ m² totales × 30 % × importe de la factura</strong>. Ejemplo: 20 % de la casa afecto → deduces el 30 % de ese 20 %, un 6 % de la factura. Tras la resolución del <strong>TEAC de julio de 2023</strong>, se admite esa misma proporción en el <strong>IVA</strong>.</li><li><strong>Si eres titular o inquilino</strong> (alquiler, IBI, comunidad, seguro del hogar): la deducción es la <strong>proporción directa a los m² afectos</strong>, <strong>sin</strong> aplicar el 30 % (ese 30 % es solo para suministros).</li></ul>
      <h3>3. Material y herramientas de trabajo</h3>
      <p>Ordenador, móvil, mobiliario, material de oficina, software, herramientas del oficio. Si el bien dura varios años (un portátil), suele amortizarse en lugar de deducirse de golpe.</p>
      <h3>4. Software y servicios online</h3>
      <p>Tu programa de facturación, CRM, hosting, dominio, suscripciones profesionales. Plenamente deducibles si los usas para la actividad.</p>
      <h3>5. Asesoría y servicios profesionales</h3>
      <p>La gestoría, el abogado o el diseñador que contratas para tu negocio.</p>
      <h3>6. Formación</h3>
      <p>Cursos y formación relacionados con tu actividad.</p>
      <h3>7. Seguros</h3>
      <p>Seguro de responsabilidad civil y seguro médico privado. Este último, deducible hasta <strong>500 €/año por persona</strong> (tú, tu cónyuge e hijos menores de 25 que convivan contigo) y <strong>1.500 €/año</strong> por persona con discapacidad.</p>
      <h3>8. Dietas y manutención</h3>
      <p>Comidas en días de trabajo, con <strong>pago electrónico</strong> (no efectivo), factura a tu nombre, motivo profesional y en un municipio distinto al de tu residencia. Límites: <strong>26,67 €/día en España y 48,08 €/día en el extranjero</strong> sin pernocta; <strong>53,34 €/día en España y 91,35 €/día fuera</strong> con pernocta.</p>
      <h3>9. Vehículo y desplazamientos</h3>
      <p>Es el punto más delicado. El <strong>IVA</strong> del coche y sus gastos se admite al <strong>50 %</strong> por presunción; el <strong>gasto en IRPF</strong> solo si el vehículo se usa <strong>en exclusiva</strong> para la actividad (salvo actividades como el transporte). El transporte público en viajes de trabajo sí es deducible con factura.</p>
      <h3>10. Teléfono e internet</h3>
      <p>Deducible la parte usada para la actividad. Lo más limpio es tener una línea solo profesional.</p>
      <h2>Tabla rápida</h2>
      <table><thead><tr><th>Gasto</th><th>¿Deducible?</th><th>Nota</th></tr></thead><tbody><tr><td>Cuota de autónomos</td><td>Sí, 100 %</td><td>A menudo olvidada</td></tr><tr><td>Local / oficina</td><td>Sí, 100 %</td><td>Con factura</td></tr><tr><td>Suministros desde casa</td><td>Parcial</td><td>m² afectos ÷ totales × 30 % × factura</td></tr><tr><td>Ordenador / móvil</td><td>Sí</td><td>Puede amortizarse</td></tr><tr><td>Software (facturación, CRM)</td><td>Sí, 100 %</td><td>—</td></tr><tr><td>Gestoría</td><td>Sí, 100 %</td><td>—</td></tr><tr><td>Dietas</td><td>Sí, con límite</td><td>26,67 € / 48,08 € sin pernocta · pago electrónico</td></tr><tr><td>Coche</td><td>Depende</td><td>IVA 50 % (presunción); IRPF solo uso exclusivo</td></tr></tbody></table>
      <h2>Cómo no perder deducciones</h2>
      <p>El error típico no es deducir de más, sino <strong>deducir de menos</strong> por no guardar facturas o por no registrarlas. Llevar tus gastos en un único sitio —con la factura adjunta y la categoría asignada— hace que en cada trimestre tengas el cálculo hecho.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Puedo deducir una comida con un cliente?</strong> Sí, si está vinculada a la actividad, tienes factura y la registras. Las comidas particulares, no.</p>
      <p><strong>¿Necesito factura o me vale el ticket?</strong> Para deducir el IVA necesitas factura completa con tu NIF. El ticket simple no suele servir.</p>
      <p><strong>¿La cuota de autónomos desgrava?</strong> Sí, es 100 % deducible como gasto de la actividad.</p>
      <p><strong>¿Cuánto tiempo guardo las facturas?</strong> Hacienda puede revisar hasta 4 años (art. 66 LGT), pero el Código de Comercio obliga a conservar la documentación 6 años (art. 30). Guarda los justificantes al menos 6 años.</p>
      <p><strong>¿Puedo deducir el coche?</strong> El IVA, al 50 % por presunción. El gasto en IRPF solo si el vehículo se usa en exclusiva para la actividad (salvo transporte).</p>
      <h2>En resumen</h2>
      <p>Deducir bien es ordenar bien: factura a tu nombre, vinculación con la actividad y registro. ClientLabs te deja guardar cada gasto con su factura y su categoría, de modo que al cerrar el trimestre el cálculo ya está hecho.</p>
      <blockquote><p>Esto es información general, no asesoramiento fiscal personalizado. Para tu caso concreto, consulta con tu asesor.</p></blockquote>
    </div>
  ),
}
