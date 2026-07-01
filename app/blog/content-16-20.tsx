import React from "react"
import Link from "next/link"

export const ARTICLES_16_20: Record<string, React.ReactNode> = {
  "primera-factura-clientlabs": (
    <div>
      <h2>Tu primera factura legal en ClientLabs en menos de 10 minutos</h2>
      <p>Emitir tu primera factura conforme en ClientLabs son cuatro pasos: das de alta al cliente, añades los conceptos, revisas el IVA y la retención, y emites. El programa numera solo, calcula los impuestos y genera una factura con todos los elementos obligatorios (y, cuando aplique Verifactu, su huella y su QR). En menos de 10 minutos la tienes lista para enviar, sin haber tocado una sola fórmula.</p>
      <h2>Antes de empezar</h2>
      <p>Solo necesitas configurar <strong>una vez</strong> tus datos fiscales (NIF, dirección y, si tu actividad lo lleva, tu retención por defecto) en tu perfil. A partir de ahí, cada factura reutiliza esos datos automáticamente: no vuelves a teclearlos nunca.</p>
      <h2>Paso 1: añade el cliente</h2>
      <p>Crea la ficha del cliente con su nombre o razón social, NIF y dirección. Si ya lo tenías de un lead o de un presupuesto anterior, está listo y no tecleas nada dos veces: sus datos ya viajan a la factura.</p>
      <h2>Paso 2: crea la factura y añade conceptos</h2>
      <p>Nueva factura → eliges el cliente → añades las líneas (concepto, cantidad, precio unitario). El programa calcula la <strong>base imponible</strong> automáticamente a medida que añades líneas.</p>
      <h2>Paso 3: revisa IVA y retención</h2>
      <ul><li>Elige el <strong>tipo de IVA</strong> (21 %, 10 % o 4 %).</li><li>Si tu actividad lleva <strong>retención de IRPF</strong>, aplícala (15 % en general, 7 % si eres nuevo autónomo). ¿Dudas de cuál te toca? Lo aclaramos en <Link href="/blog/retencion-irpf-factura">qué retención poner</Link>.</li><li>ClientLabs calcula la cuota de cada impuesto y el <strong>total</strong> por ti, sin que sumes ni restes nada.</li></ul>
      <h2>Paso 4: emite</h2>
      <p>Al emitir, la factura recibe su <strong>número correlativo</strong> y queda registrada de forma inalterable. Cuando Verifactu sea obligatorio para ti (1 de julio de 2027 para autónomos), además llevará huella, QR y encadenamiento sin que hagas nada distinto. La descargas en PDF o la envías directamente al cliente.</p>
      <h2>Qué acabas de evitar</h2>
      <table><thead><tr><th>A mano (o en Excel)</th><th>En ClientLabs</th></tr></thead><tbody><tr><td>Numerar tú (riesgo de saltos)</td><td>Numeración automática</td></tr><tr><td>Calcular IVA/IRPF a ojo</td><td>Calculado solo</td></tr><tr><td>Plantilla a la que le falta un campo</td><td>Todos los campos obligatorios</td></tr><tr><td>Verifactu pendiente</td><td>Conforme de serie</td></tr></tbody></table>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto tardo en hacer mi primera factura?</strong> Menos de 10 minutos, contando la configuración de tus datos la primera vez. A partir de la segunda, son un par de minutos.</p>
      <p><strong>¿La factura es legal?</strong> Sí: lleva todos los elementos obligatorios (número, datos, base, IVA, total) y, cuando aplique Verifactu, huella y QR.</p>
      <p><strong>¿Puedo poner retención de IRPF?</strong> Sí. Eliges el tipo (15 % o 7 %) y ClientLabs calcula el total ya descontado.</p>
      <p><strong>¿Y si me equivoco en una factura ya emitida?</strong> Emites una factura rectificativa; no se borra, para mantener intacta la numeración. Es la forma correcta (y, con Verifactu, la única) de corregir.</p>
      <p><strong>¿Necesito saber de fiscalidad para usarlo?</strong> No. El programa aplica los tipos y calcula los totales; tú solo eliges cliente, conceptos y el tipo de IVA que corresponde.</p>
      <h2>En resumen</h2>
      <p>Cuatro pasos y tienes tu primera factura legal. Lo que en Excel son cálculos, riesgos de numeración y campos que se olvidan, en ClientLabs es elegir cliente, añadir conceptos y emitir. <Link href="/precios">Crea tu cuenta</Link> y emite la primera hoy mismo.</p>
    </div>
  ),
  "pipeline-de-clientlabs": (
    <div>
      <h2>Del primer contacto al cliente: el pipeline de ClientLabs</h2>
      <p>El pipeline de ClientLabs es el recorrido de cada oportunidad por etapas —nuevo, contactado, propuesta, cliente— para que veas de un vistazo qué tienes en marcha y qué toca hacer. Lo que lo hace de verdad útil para un autónomo es que el lead que se convierte en cliente <strong>ya trae sus datos</strong> a la factura: del primer contacto al cobro sin reescribir nada por el camino.</p>
      <h2>Las etapas, de un vistazo</h2>
      <table><thead><tr><th>Etapa</th><th>Qué significa</th><th>Acción típica</th></tr></thead><tbody><tr><td>Nuevo</td><td>Entró un interesado</td><td>Contactar pronto</td></tr><tr><td>Contactado</td><td>Ya hablasteis</td><td>Enviar propuesta</td></tr><tr><td>Propuesta</td><td>Presupuesto enviado</td><td>Hacer seguimiento</td></tr><tr><td>Cliente</td><td>Cerrado</td><td>Facturar</td></tr><tr><td>Perdido</td><td>No salió</td><td>Aprender por qué</td></tr></tbody></table>
      <h2>Paso 1: entra el lead</h2>
      <p>Da igual el canal (formulario web, WhatsApp, una recomendación): el lead entra en el pipeline como "nuevo". Lo importante es que <strong>todo caiga en el mismo sitio</strong>, para que no se te pierda ninguno por estar en una bandeja distinta. El concepto, en <Link href="/blog/sistema-de-leads-simple">sistema de leads simple</Link>.</p>
      <h2>Paso 2: muévelo por etapas</h2>
      <p>A medida que avanzas, cambias la etapa del lead. Cada uno tiene su ficha con todo el historial: qué hablasteis, qué presupuesto enviaste y cuándo toca el siguiente paso. Así, cuando vuelves a un lead después de una semana, no tienes que recordar nada: lo lees.</p>
      <h2>Paso 3: seguimiento que no se olvida</h2>
      <p>Cada oportunidad activa lleva una <strong>tarea con fecha</strong>. De esa forma no dependes de tu memoria para llamar a tiempo: el sistema te dice quién espera una respuesta tuya y desde cuándo. Es justo donde la mayoría de autónomos pierde ventas, y donde el pipeline marca la diferencia.</p>
      <h2>Paso 4: de cliente a factura, sin reteclear</h2>
      <p>Cuando el lead pasa a "cliente", sus datos fiscales <strong>ya están</strong> en la ficha. Generas el presupuesto o la factura desde ahí, sin volver a escribir el NIF ni la dirección. Ese es el ahorro real frente a tener el CRM por un lado y la facturación por otro: el dato se teclea una vez, al principio, y viaja contigo hasta el cobro.</p>
      <h2>Por qué importa unir pipeline y facturación</h2>
      <p>Con herramientas separadas, el dato del cliente vive en dos sitios y, antes o después, se desactualiza: lo cambias en el CRM y se te olvida en el programa de facturas. Con el pipeline conectado a la facturación, el recorrido es uno solo y los datos, también: contacto → propuesta → cliente → factura → cobro, sin saltos ni copias.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué es el pipeline?</strong> La representación por etapas de tus oportunidades de venta, del primer contacto al cierre. Te dice, de un vistazo, qué tienes en marcha y qué toca hacer.</p>
      <p><strong>¿De dónde entran los leads?</strong> De los canales que uses (web, mensajería, recomendaciones); todos caen en la misma lista para que no se pierda ninguno.</p>
      <p><strong>¿El pipeline se conecta con las facturas?</strong> Sí: cuando un lead pasa a cliente, sus datos están listos para facturar sin reteclear. Esa conexión es la diferencia frente a usar un CRM y un programa de facturación por separado.</p>
      <p><strong>¿Sirve si trabajo solo?</strong> Sí, especialmente si trabajas solo: te evita perder oportunidades por falta de seguimiento, que es justo lo que pasa cuando no tienes un equipo que te cubra los olvidos.</p>
      <p><strong>¿Cuántas oportunidades puedo llevar a la vez?</strong> Las que necesites. El sentido del pipeline es precisamente que no dependas de tu memoria, por muchas que tengas abiertas.</p>
      <h2>En resumen</h2>
      <p>El pipeline convierte "tengo varios interesados por ahí" en un sistema con etapas y seguimiento, y enlaza la venta con la factura para que no teclees dos veces. <Link href="/precios">Pruébalo</Link> y lleva tus oportunidades del primer contacto al cobro en un solo flujo, sin que se te enfríe ninguna por el camino.</p>
    </div>
  ),
  "verifactu-en-clientlabs": (
    <div>
      <h2>Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada</h2>
      <p>ClientLabs cumple Verifactu de serie: cada factura que emites lleva su <strong>huella</strong>, su <strong>encadenamiento</strong> con la anterior, el <strong>código QR</strong> y la leyenda obligatoria, y en modo Verifactu se <strong>remite a la Agencia Tributaria</strong> automáticamente. Tú haces la factura como siempre; toda la parte técnica la pone el programa. Aquí tienes qué exige la norma y cómo lo resuelve ClientLabs.</p>
      <h2>Qué exige Verifactu (y qué pone ClientLabs)</h2>
      <table><thead><tr><th>Requisito de Verifactu</th><th>Lo hace ClientLabs</th></tr></thead><tbody><tr><td>Huella / hash inalterable</td><td>Sí, en cada factura</td></tr><tr><td>Encadenamiento con la anterior</td><td>Sí, automático</td></tr><tr><td>Código QR</td><td>Sí, impreso en la factura</td></tr><tr><td>Leyenda "VERI*FACTU" / verificable</td><td>Sí</td></tr><tr><td>Envío a Hacienda (modo Verifactu)</td><td>Sí, automático</td></tr></tbody></table>
      <p>El contexto de la norma, las fechas (autónomos desde el 1 de julio de 2027) y las sanciones, en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <blockquote><p>Una nota de transparencia: la AEAT <strong>no emite un sello de "certificación Verifactu"</strong>. El cumplimiento se acredita mediante la <strong>declaración responsable del fabricante</strong> del software, que asume la responsabilidad técnica. ClientLabs emite con todos los elementos que exige la norma y respalda ese cumplimiento, de modo que la carga de la prueba no recae sobre ti.</p></blockquote>
      <h2>Cómo se ve en la práctica</h2>
      <ol><li><strong>Emites la factura</strong> normal: eliges cliente, conceptos, IVA.</li><li>Al emitir, ClientLabs <strong>genera la huella</strong> y la <strong>encadena</strong> con la factura anterior.</li><li>La factura sale con su <strong>QR y su leyenda</strong> impresos.</li><li>En modo Verifactu, el registro se <strong>envía a la AEAT</strong> sin que hagas nada más.</li></ol>
      <p>No hay configuración técnica: ni certificados que pelear, ni ficheros que subir a mano, ni ajustes que no entiendas. Facturas igual que siempre y la norma se cumple por debajo.</p>
      <h2>Por qué esto te quita un problema de encima</h2>
      <ul><li><strong>Cero riesgo de sanción</strong> por software no conforme: recuerda que la multa por usar un programa que no cumple es de 50.000 € por ejercicio (fija, no por factura), y la falta de QR se sanciona aparte.</li><li><strong>Sin migración a última hora:</strong> cuando llegue tu fecha (1 de julio de 2027 para autónomos), ya estás listo, en lugar de buscar herramienta a contrarreloj junto a miles de autónomos.</li><li><strong>Tranquilidad con tu gestor:</strong> los registros son trazables e inalterables, justo lo que tu asesoría necesita para trabajar con datos fiables.</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿ClientLabs es conforme con Verifactu?</strong> Sí. Cada factura lleva huella, encadenamiento, QR y leyenda, y se remite a Hacienda en modo Verifactu. El cumplimiento se respalda con la declaración responsable del fabricante, como exige la norma (no existe un sello oficial de la AEAT).</p>
      <p><strong>¿Tengo que configurar algo técnico?</strong> No. Emites la factura y el sistema añade todo lo obligatorio automáticamente.</p>
      <p><strong>¿Envía las facturas a Hacienda por mí?</strong> En modo Verifactu, sí, de forma automática al emitir.</p>
      <p><strong>¿Desde cuándo tengo que cumplir Verifactu?</strong> Autónomos, desde el 1 de julio de 2027; empresas, desde el 1 de enero de 2027. Lo ideal es estar listo antes de tu fecha, no justo encima.</p>
      <p><strong>¿Y si emito una factura por error?</strong> La corriges con una rectificativa, que también queda encadenada y registrada. Con Verifactu, borrar una factura sin más no es posible, y ese es justo el objetivo de la norma.</p>
      <h2>En resumen</h2>
      <p>Verifactu suena técnico, pero contigo no lo es: ClientLabs pone huella, QR, encadenamiento y envío a Hacienda en cada factura, y respalda el cumplimiento con su declaración responsable. Tú facturas; la norma se cumple sola. <Link href="/precios">Empieza aquí</Link> y llega a 2027 sin sustos.</p>
    </div>
  ),
  "migrar-de-excel-a-clientlabs": (
    <div>
      <h2>Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min</h2>
      <p>Pasar de Excel a ClientLabs son tres pasos: exportas lo que tienes, lo importas y configuras tus datos fiscales una vez. En unos diez minutos tienes tu cartera dentro, lista para emitir facturas conformes con Verifactu, sin perder tu histórico. El miedo habitual ("voy a perder años de facturas") no se cumple si lo haces con orden.</p>
      <h2>Antes de empezar: qué vas a traer</h2>
      <ul><li>Tu <strong>lista de clientes</strong> (nombre, NIF, dirección, email).</li><li>Tus <strong>facturas o ingresos</strong> anteriores, si quieres conservar el histórico.</li><li>Tus <strong>datos fiscales</strong> para emitir (los configuras una sola vez).</li></ul>
      <h2>Paso 1: exporta tu Excel</h2>
      <p>Guarda tu hoja de clientes en un archivo CSV o Excel, con <strong>una fila por cliente</strong> y columnas claras (nombre, NIF, email, dirección…). Haz lo mismo con las facturas si quieres importarlas. Cuanto más ordenadas estén las columnas, más limpia será la importación.</p>
      <h2>Paso 2: importa en ClientLabs</h2>
      <p>Sube el archivo en la sección de clientes y <strong>mapea las columnas</strong>: le indicas a ClientLabs qué columna es el NIF, cuál el email, cuál la dirección. El programa crea una ficha por cliente. Si algo no cuadra, lo ves y lo corriges <strong>antes</strong> de confirmar, así que no entran datos sucios.</p>
      <h2>Paso 3: configura tus datos fiscales</h2>
      <p>Introduce tu NIF, tu dirección y, si tu actividad lo lleva, tu retención por defecto. A partir de aquí, cada factura reutiliza estos datos automáticamente y no vuelves a teclearlos.</p>
      <h2>Paso 4: emite tu primera factura</h2>
      <p>Con la cartera dentro, creas una factura eligiendo el cliente: numeración, IVA y total automáticos, y conforme a Verifactu. Tienes el detalle en <Link href="/blog/primera-factura-clientlabs">tu primera factura</Link>.</p>
      <h2>Qué ganas al dejar Excel</h2>
      <table><thead><tr><th>En Excel</th><th>En ClientLabs</th></tr></thead><tbody><tr><td>Numeración a mano</td><td>Automática</td></tr><tr><td>IVA/IRPF calculado a ojo</td><td>Calculado solo</td></tr><tr><td>Sin copia segura</td><td>En la nube</td></tr><tr><td>No cumple Verifactu</td><td>Conforme de serie</td></tr><tr><td>Cliente y factura separados</td><td>Todo en una ficha</td></tr></tbody></table>
      <p>El porqué de la urgencia, en <Link href="/blog/facturar-en-excel-2026">facturar en Excel te sale caro</Link>.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto tarda la migración?</strong> Unos 10 minutos para los clientes; algo más si importas mucho histórico de facturas. La parte que de verdad cuesta es ordenar el Excel antes, no la importación en sí.</p>
      <p><strong>¿Pierdo mis facturas antiguas?</strong> No. Las exportas de Excel e importas, o las conservas como histórico. No empiezas de cero.</p>
      <p><strong>¿Necesito conocimientos técnicos para migrar?</strong> No. Subes el archivo y mapeas columnas; el proceso es asistido y revisas todo antes de confirmar.</p>
      <p><strong>¿Y si mi Excel está desordenado?</strong> Conviene limpiar las columnas antes de importar (una fila por cliente, encabezados claros). Aun así, puedes corregir cualquier ficha dentro de ClientLabs después de importar.</p>
      <p><strong>¿Puedo migrar también desde otro programa, no solo desde Excel?</strong> Sí. El proceso es el mismo siempre que puedas exportar tus datos a un archivo CSV o Excel, así que sirve igual para salir de FacturaPlus u otra herramienta.</p>
      <h2>En resumen</h2>
      <p>Migrar no es empezar de cero: es traer lo que ya tienes y dejar atrás los riesgos de Excel. En diez minutos tienes clientes, datos fiscales y la primera factura conforme, sin perder tu histórico. <Link href="/precios">Empieza la migración</Link> con margen, no a contrarreloj cuando llegue Verifactu.</p>
    </div>
  ),
  "gastos-deducibles-autonomo-2026": (
    <div>
      <h2>Gastos deducibles del autónomo en 2026: la lista con ejemplos</h2>
      <p>Un gasto es deducible cuando está vinculado a tu actividad, lo puedes justificar con factura y lo tienes registrado en tu contabilidad. Si cumple esas tres condiciones, <strong>resta en tu IRPF</strong> y, casi siempre, <strong>te permite recuperar el IVA</strong>. Aquí tienes la lista completa por categorías, con los importes concretos que admite Hacienda en cada caso, para que no deduzcas de menos por desconocimiento.</p>
      <h2>Los 3 requisitos para deducir un gasto</h2>
      <p>Antes de la lista, la regla que decide todo. Un gasto solo es deducible si cumple las tres a la vez:</p>
      <ol><li><strong>Vinculación con la actividad.</strong> El gasto tiene que estar relacionado con tu trabajo. Una comida con un cliente, sí; la cena del sábado con amigos, no.</li><li><strong>Justificación.</strong> Necesitas <strong>factura completa</strong> a tu nombre y con tu NIF. Un ticket simple no suele bastar para deducir el IVA.</li><li><strong>Registro.</strong> Debe constar en tus libros de ingresos y gastos.</li></ol>
      <p>Si falla uno de los tres, Hacienda puede rechazar la deducción. Sobre la conservación: Hacienda puede revisar hasta <strong>4 años</strong> (prescripción, art. 66 LGT), pero la obligación mercantil de conservar libros y documentación es de <strong>6 años</strong> (art. 30 del Código de Comercio). Conclusión práctica: <strong>guarda las facturas al menos 6 años</strong>.</p>
      <h2>Lista de gastos deducibles por categoría</h2>
      <h3>1. Cuota de autónomos</h3>
      <p>La cuota mensual al RETA es <strong>100 % deducible</strong> como gasto. Es de los más olvidados y de los más claros: en 2026, con una cuota mínima de unos 206 €/mes, son más de 2.400 € al año que deberías estar deduciendo.</p>
      <h3>2. Suministros y oficina</h3>
      <ul><li><strong>Si tienes local u oficina:</strong> luz, agua, internet, alquiler y gastos del local son deducibles al 100 % (con factura).</li><li><strong>Si trabajas desde casa:</strong> primero comunica en el modelo <strong>036/037</strong> qué porcentaje de la vivienda afectas a la actividad. Sobre los <strong>suministros</strong> (luz, agua, gas, internet), la fórmula es <strong>m² afectos ÷ m² totales × 30 % × importe de la factura</strong>. Ejemplo: si afectas el 20 % de la casa, deduces el 30 % de ese 20 %, es decir, un <strong>6 % de la factura</strong>. Tras la resolución del <strong>TEAC de julio de 2023</strong>, se admite esa misma proporción también en el <strong>IVA</strong>.</li><li><strong>Gastos de titularidad o alquiler de la vivienda</strong> (alquiler, IBI, comunidad, seguro del hogar): aquí la deducción es la <strong>proporción directa a los m² afectos</strong>, <strong>sin</strong> aplicar el 30 % (ese 30 % es exclusivo de los suministros).</li></ul>
      <h3>3. Material y herramientas de trabajo</h3>
      <p>Ordenador, móvil, mobiliario, material de oficina, software, herramientas del oficio. Si el bien dura varios años (un portátil, una máquina), normalmente se <strong>amortiza</strong> (se deduce repartido en varios ejercicios) en lugar de deducirse de golpe.</p>
      <h3>4. Software y servicios online</h3>
      <p>Tu programa de facturación, CRM, hosting, dominio, suscripciones profesionales. Plenamente deducibles si los usas para la actividad. (Sí: tu suscripción a una herramienta como ClientLabs es un gasto deducible más.)</p>
      <h3>5. Asesoría y servicios profesionales</h3>
      <p>La gestoría, el abogado o el diseñador que contratas para tu negocio. 100 % deducibles.</p>
      <h3>6. Formación</h3>
      <p>Cursos y formación relacionados con tu actividad: deducibles. Un curso de marketing si eres comercial, sí; un máster sin relación con tu oficio, dudoso.</p>
      <h3>7. Seguros</h3>
      <p>Seguro de responsabilidad civil de la actividad y seguro médico privado. Este último es deducible hasta <strong>500 €/año por persona</strong> (tú, tu cónyuge e hijos menores de 25 que convivan contigo) y <strong>1.500 €/año</strong> por persona con discapacidad.</p>
      <h3>8. Dietas y manutención</h3>
      <p>Comidas en días de trabajo, siempre que cumplas cuatro condiciones: <strong>pago electrónico</strong> (no efectivo), <strong>factura</strong> a tu nombre, motivo profesional y que sea en un municipio distinto al de tu residencia. Los límites deducibles son:</p>
      <table><thead><tr><th>Situación</th><th>España</th><th>Extranjero</th></tr></thead><tbody><tr><td>Sin pernocta</td><td>26,67 €/día</td><td>48,08 €/día</td></tr><tr><td>Con pernocta</td><td>53,34 €/día</td><td>91,35 €/día</td></tr></tbody></table>
      <h3>9. Vehículo y desplazamientos</h3>
      <p>Es el punto más delicado y donde más gente se equivoca:</p>
      <ul><li>El <strong>IVA</strong> del coche y de sus gastos (combustible, reparaciones) se admite al <strong>50 %</strong> por presunción legal, sin tener que probar nada.</li><li>El <strong>gasto en IRPF</strong>, en cambio, solo es deducible si el vehículo se usa <strong>en exclusiva</strong> para la actividad (excepto en actividades como transporte, mensajería, taxi o comerciales, donde sí se admite el uso mixto).</li><li>El <strong>transporte público</strong> en viajes de trabajo (tren, avión, taxi) es deducible al 100 % con factura.</li></ul>
      <h3>10. Teléfono e internet</h3>
      <p>Deducible la parte usada para la actividad. Lo más limpio, para evitar discusiones con Hacienda, es tener una <strong>línea exclusivamente profesional</strong>: así es 100 % deducible sin tener que prorratear.</p>
      <h2>Tabla rápida</h2>
      <table><thead><tr><th>Gasto</th><th>¿Deducible?</th><th>Nota clave</th></tr></thead><tbody><tr><td>Cuota de autónomos</td><td>Sí, 100 %</td><td>A menudo olvidada (~2.400 €/año)</td></tr><tr><td>Local / oficina</td><td>Sí, 100 %</td><td>Con factura</td></tr><tr><td>Suministros desde casa</td><td>Parcial</td><td>m² afectos ÷ totales × 30 % × factura</td></tr><tr><td>Vivienda (alquiler, IBI…)</td><td>Parcial</td><td>Proporción a m² afectos, sin el 30 %</td></tr><tr><td>Ordenador / móvil</td><td>Sí</td><td>Puede amortizarse</td></tr><tr><td>Software (facturación, CRM)</td><td>Sí, 100 %</td><td>—</td></tr><tr><td>Gestoría y profesionales</td><td>Sí, 100 %</td><td>—</td></tr><tr><td>Seguro médico</td><td>Sí, con límite</td><td>500 €/persona (1.500 € discapacidad)</td></tr><tr><td>Dietas</td><td>Sí, con límite</td><td>26,67 € / 48,08 € sin pernocta · pago electrónico</td></tr><tr><td>Coche</td><td>Depende</td><td>IVA 50 % (presunción); IRPF solo uso exclusivo</td></tr></tbody></table>
      <h2>El error que de verdad te cuesta dinero</h2>
      <p>El error típico del autónomo no es deducir de más, sino <strong>deducir de menos</strong>: olvidar la cuota de autónomos, no pedir factura de un gasto, perder el justificante o no registrar el gasto en el trimestre. Cada gasto que dejas fuera es dinero que pagas de IRPF y de IVA sin necesidad. Llevar todos tus gastos en un único sitio —con la factura adjunta y la categoría asignada— hace que en cada trimestre tengas el cálculo hecho y no se te escape nada.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Puedo deducir una comida con un cliente?</strong> Sí, si está vinculada a la actividad, tienes factura, pagaste de forma electrónica y la registras. Las comidas particulares, no.</p>
      <p><strong>¿Necesito factura o me vale el ticket?</strong> Para deducir el IVA necesitas factura completa con tu NIF. El ticket simple no suele servir; pídela siempre.</p>
      <p><strong>¿La cuota de autónomos desgrava?</strong> Sí, es 100 % deducible como gasto de la actividad. Es de los gastos más claros y de los más olvidados.</p>
      <p><strong>¿Cuánto tiempo guardo las facturas?</strong> Hacienda puede revisar hasta 4 años (art. 66 LGT), pero el Código de Comercio obliga a conservar la documentación 6 años (art. 30). Guarda los justificantes al menos 6 años.</p>
      <p><strong>¿Puedo deducir el coche?</strong> El IVA, al 50 % por presunción legal. El gasto en IRPF, solo si el vehículo se usa en exclusiva para la actividad (salvo transporte, taxi, comerciales y similares).</p>
      <p><strong>¿Cuánto puedo deducir si trabajo desde casa?</strong> De los suministros (luz, agua, gas, internet), el 30 % de la proporción de metros afectos a la actividad. De los gastos de la vivienda (alquiler, IBI, comunidad), la proporción directa de metros afectos, sin el 30 %.</p>
      <h2>En resumen</h2>
      <p>Deducir bien es ordenar bien: factura a tu nombre, vinculación con la actividad y registro. La diferencia entre un autónomo que paga lo justo y otro que paga de más no está en "saber trucos", sino en no perder un solo justificante. ClientLabs te deja guardar cada gasto con su factura y su categoría, de modo que al cerrar el trimestre el cálculo del IVA y del IRPF ya esté hecho y no se te escape ninguna deducción.</p>
    </div>
  ),
}
