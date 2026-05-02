import React from "react"
import Link from "next/link"

export const ARTICLES_1_5: Record<string, React.ReactNode> = {
  "verifactu-guia-completa": (
    <div>
      <p>Verifactu es, sin duda, el cambio normativo más importante para los autónomos y pymes españoles en los últimos años. El Real Decreto 1007/2023, que aprueba el Reglamento de Facturación Electrónica, obliga a que todo software de facturación cumpla una serie de requisitos técnicos rigurosos a partir de 2027. Si aún no has empezado a prepararte, este artículo te explica exactamente qué es, qué implica y cómo adaptarte a tiempo.</p>

      <h2>Qué es Verifactu y por qué nace</h2>
      <p>Verifactu es el sistema de verificación de facturas impulsado por la Agencia Tributaria española. Su objetivo es claro: eliminar el fraude fiscal en la facturación, garantizar la integridad de los registros y que Hacienda pueda contrastar en tiempo real las facturas emitidas por cualquier contribuyente con las recibidas por sus clientes.</p>
      <p>El sistema nace como respuesta a la proliferación de software de doble uso: programas de facturación que permitían emitir una factura para el cliente y otra versión manipulada para la declaración fiscal. Verifactu pone fin a esta práctica imponiendo requisitos técnicos que hacen imposible modificar o eliminar facturas una vez registradas.</p>
      <p>El marco legal que regula todo esto es el Real Decreto 1007/2023, de 5 de diciembre, por el que se aprueba el Reglamento que establece los requisitos que deben adoptar los sistemas y programas informáticos o electrónicos que soporten los procesos de facturación de empresarios y profesionales. Este reglamento desarrolla la disposición adicional decimoséptima de la Ley 58/2003, General Tributaria.</p>

      <h2>Diferencia entre Verifactu y factura electrónica B2B</h2>
      <p>Existe una confusión frecuente entre Verifactu y la facturación electrónica B2B que obliga la Ley Crea y Crece (Ley 18/2022). Son dos sistemas distintos con objetivos diferentes:</p>
      <ul>
        <li><strong>Verifactu:</strong> es un requisito técnico para el software de facturación. No obliga a enviar facturas electrónicas a los clientes, sino a que el propio sistema informático genere facturas con integridad garantizada, firme cada registro con un hash SHA-256 encadenado y, opcionalmente, envíe los datos a la AEAT en tiempo real. Su objetivo es el control tributario interno.</li>
        <li><strong>Factura electrónica B2B (Ley Crea y Crece):</strong> obliga a las empresas a intercambiar facturas en formato electrónico estructurado con sus proveedores y clientes empresariales. Su objetivo es agilizar los pagos y reducir la morosidad comercial.</li>
      </ul>
      <p>Un autónomo puede cumplir con Verifactu sin tener que enviar facturas electrónicas estructuradas a sus clientes, y viceversa. Aunque en la práctica, un software homologado Verifactu generalmente también facilita el cumplimiento de la facturación electrónica B2B.</p>
      <p>Para más detalle sobre la facturación electrónica B2B, puedes consultar nuestro artículo <Link href="/blog/facturacion-electronica-obligatoria-espana">Facturación electrónica obligatoria en España: todo lo que necesitas saber en 2026</Link>.</p>

      <h2>Fechas de entrada en vigor</h2>
      <p>El calendario de implantación de Verifactu es gradual y por tipo de contribuyente:</p>
      <ul>
        <li><strong>Grandes empresas y grupos fiscales (IS):</strong> obligatorio a partir del 1 de enero de 2027. Se consideran grandes empresas las que superan los 6 millones de euros de cifra de negocios.</li>
        <li><strong>Autónomos, pymes y resto de contribuyentes:</strong> obligatorio a partir del 1 de julio de 2027.</li>
      </ul>
      <p>Estos plazos afectan a los desarrolladores de software: los programas de facturación deben estar certificados y disponibles antes de esas fechas para que los usuarios puedan migrar. Si usas un software comercial, el proveedor es quien debe hacer el trabajo de certificación. Si usas una solución a medida o desarrollada internamente, la responsabilidad recae directamente sobre ti o tu empresa.</p>
      <p>Aunque las fechas parecen lejanas, la adaptación de los sistemas informáticos lleva tiempo. La AEAT recomienda iniciar el proceso de revisión y migración a partir del segundo semestre de 2026 como máximo.</p>

      <h2>Requisitos técnicos del sistema Verifactu</h2>
      <p>El Reglamento de Facturación establece una serie de requisitos técnicos que debe cumplir cualquier software de facturación homologado. Los más relevantes son:</p>

      <h3>Hash SHA-256 y encadenamiento de registros</h3>
      <p>Cada registro de factura debe incluir un huella digital (hash) calculada mediante el algoritmo SHA-256. Además, el hash de cada factura debe incluir el hash de la factura anterior del mismo emisor, creando una cadena criptográfica que hace imposible modificar o eliminar registros sin que se detecte la manipulación. Esta es la piedra angular del sistema: garantiza la integridad de la información sin posibilidad de alteración retroactiva.</p>

      <h3>Código QR verificable</h3>
      <p>Todas las facturas deben incluir un código QR que, al ser escaneado, permite al receptor (cliente, inspector, proveedor) verificar en la sede electrónica de la AEAT que la factura existe y que sus datos son correctos. Este código QR contiene, como mínimo, el NIF del emisor, el número y serie de la factura, la fecha de expedición, el tipo de factura, el importe total y la cuota de IVA.</p>

      <h3>Formato XML estructurado</h3>
      <p>Los registros de facturación deben generarse en formato XML conforme al esquema técnico publicado por la AEAT. Este XML es el que se envía a Hacienda en los sistemas de remisión voluntaria (modalidad Verifactu) o que se custodia internamente en los sistemas que no remiten en tiempo real.</p>

      <h3>Registro en la AEAT (modalidad Verifactu)</h3>
      <p>El reglamento distingue dos modalidades de cumplimiento. En la modalidad Verifactu stricto sensu, el software envía cada registro de factura a la AEAT en el momento de su emisión. En la modalidad sin envío, el software genera los registros con todos los requisitos técnicos pero los almacena localmente sin transmitirlos de forma automática. La modalidad Verifactu con envío a la AEAT ofrece ventajas adicionales: simplifica el cumplimiento del SII para quienes están obligados y facilita las devoluciones del IVA.</p>

      <h2>Qué información debe incluir cada registro de factura</h2>
      <p>El artículo 10 del Reglamento de Facturación establece los campos mínimos que debe contener cada registro de facturación en el sistema informático:</p>
      <ul>
        <li><strong>Identificación del software:</strong> nombre, versión y número de identificación del sistema.</li>
        <li><strong>Datos del emisor:</strong> NIF, nombre o razón social.</li>
        <li><strong>Datos de la factura:</strong> número y serie, fecha de expedición, tipo de factura (completa, simplificada, rectificativa).</li>
        <li><strong>Datos del destinatario:</strong> NIF y nombre (obligatorio en facturas completas, opcional en simplificadas).</li>
        <li><strong>Datos económicos:</strong> base imponible por tipo de IVA, tipo impositivo, cuota de IVA, retenciones de IRPF si las hubiera e importe total.</li>
        <li><strong>Hash SHA-256:</strong> de este registro encadenado con el anterior.</li>
        <li><strong>Firma electrónica:</strong> del registro de factura según los esquemas técnicos de la AEAT.</li>
        <li><strong>Indicador de Verifactu:</strong> si el registro se envía a la AEAT o se almacena localmente.</li>
      </ul>

      <h2>Qué pasa si no cumples: sanciones</h2>
      <p>El incumplimiento de los requisitos del Reglamento de Facturación tiene consecuencias económicas significativas. El artículo 201 bis de la Ley General Tributaria, modificado por la Ley 11/2021 de medidas de prevención del fraude fiscal, establece el régimen sancionador:</p>
      <ul>
        <li><strong>Uso de software de doble uso o que permita manipulación de registros:</strong> multa de 50.000 euros por ejercicio en el que se haya producido el incumplimiento, con un límite de 150.000 euros por tres ejercicios consecutivos.</li>
        <li><strong>Incumplimiento de requisitos técnicos del Reglamento sin que haya manipulación de datos:</strong> multa de hasta 10.000 euros por ejercicio.</li>
        <li><strong>Falta de certificación del software utilizado:</strong> el fabricante o importador del software puede ser sancionado adicionalmente.</li>
      </ul>
      <p>Es importante destacar que la responsabilidad recae tanto sobre el fabricante del software como sobre el usuario. Si utilizas un software no homologado a sabiendas, puedes ser sancionado aunque no hayas manipulado ningún dato.</p>

      <h2>Cómo prepararte: pasos concretos</h2>
      <p>Aunque las fechas de obligatoriedad son en 2027, el proceso de adaptación debe empezar cuanto antes. Estos son los pasos recomendados:</p>

      <h3>1. Audita tu sistema de facturación actual</h3>
      <p>Identifica qué software usas para emitir facturas. Si es un programa comercial, contacta al proveedor para saber si ya tienen certificación Verifactu o cuándo la tendrán disponible. Si facturas con Excel, Word o cualquier solución no homologada, tienes que migrar a un sistema certificado antes de julio de 2027.</p>

      <h3>2. Verifica la hoja de ruta del proveedor</h3>
      <p>Pide a tu proveedor de software la declaración responsable de conformidad con el RD 1007/2023. Un proveedor serio debe poder facilitarte este documento y explicarte exactamente cuándo estará disponible la versión certificada. Si no tienen respuesta clara, es señal de alerta.</p>

      <h3>3. Migra con tiempo</h3>
      <p>No esperes a las fechas límite. Migrar a un nuevo software de facturación requiere: importar clientes y series de facturas, configurar los datos fiscales, hacer pruebas con facturas reales y que tu equipo (si lo tienes) aprenda a usarlo. Este proceso puede llevar entre 1 y 4 semanas según la complejidad de tu operación.</p>

      <h3>4. Forma a tu equipo</h3>
      <p>Si hay otras personas que emiten facturas en tu negocio, asegúrate de que entienden los nuevos requisitos: no se pueden editar ni eliminar facturas ya registradas, todas las facturas deben tener el código QR visible y los datos deben ser correctos desde el primer momento.</p>

      <h3>5. Revisa tu archivo de facturas</h3>
      <p>Verifactu aplica a las facturas emitidas a partir de la fecha de obligatoriedad. Las facturas anteriores no necesitan ser re-generadas, pero debes seguir conservándolas durante el plazo legal de 4 años.</p>

      <h2>Por qué usar software homologado como ClientLabs</h2>
      <p>Adaptar un sistema de facturación a Verifactu no es trivial: requiere implementar el algoritmo SHA-256, el encadenamiento de registros, la generación del XML según el esquema de la AEAT, el código QR y, opcionalmente, la integración con los webservices de la AEAT para el envío en tiempo real. Todo esto tiene que ser auditado y certificado.</p>
      <p>ClientLabs, diseñado desde el principio para autónomos y pymes españolas, incorpora el cumplimiento Verifactu en su hoja de ruta como requisito obligatorio, de forma que cuando llegue la fecha de obligatoriedad tus facturas ya cumplan automáticamente con todos los requisitos técnicos. No tendrás que preocuparte por el hash, el XML ni el QR: el sistema lo gestiona por ti.</p>
      <p>Además, al centralizar la gestión de clientes, facturas y seguimiento de cobros en una sola plataforma, eliminas la fragmentación entre herramientas que complica el cumplimiento normativo. Si todavía facturas con soluciones no homologadas, este es el momento de hacer el cambio. <Link href="/register">Empieza gratis en ClientLabs</Link> y migra a un sistema preparado para Verifactu antes de que sea obligatorio.</p>

      <h2>Preguntas frecuentes sobre Verifactu</h2>

      <h3>¿Afecta Verifactu a las facturas simplificadas (tickets)?</h3>
      <p>Sí. Las facturas simplificadas también deben cumplir con los requisitos del Reglamento de Facturación, incluido el encadenamiento de registros y el código QR. Esto afecta especialmente a comercios y hostelería.</p>

      <h3>¿Es obligatorio enviar las facturas a la AEAT en tiempo real?</h3>
      <p>No necesariamente. El reglamento permite dos modalidades: envío en tiempo real (modalidad Verifactu) o almacenamiento local con capacidad de remisión a requerimiento. La modalidad Verifactu con envío automático es opcional pero ofrece ventajas fiscales.</p>

      <h3>¿Qué pasa con las facturas emitidas antes de la fecha de obligatoriedad?</h3>
      <p>Las facturas emitidas antes de la fecha de entrada en vigor no necesitan cumplir con los nuevos requisitos. A partir de esa fecha, todas las facturas nuevas deben generarse con el software certificado.</p>

      <h3>¿Puedo seguir usando Excel después de julio de 2027?</h3>
      <p>No. Excel no puede cumplir con los requisitos técnicos del Reglamento: no puede generar el hash SHA-256 encadenado, no puede firmar electrónicamente los registros y no puede integrarse con los webservices de la AEAT. Debes migrar a un software certificado.</p>
    </div>
  ),

  "facturacion-electronica-obligatoria-espana": (
    <div>
      <p>La facturación electrónica ha dejado de ser una opción para los negocios españoles. La Ley Crea y Crece y el Real Decreto 1007/2023 han establecido un marco normativo que obligará a autónomos y empresas a emitir y recibir facturas en formato electrónico estructurado. En 2026, muchas empresas ya están adaptándose. Esta guía te explica todo lo que necesitas saber para cumplir a tiempo y sin sorpresas.</p>

      <h2>El marco legal: Ley Crea y Crece (Ley 18/2022)</h2>
      <p>La Ley 18/2022, de 28 de septiembre, de creación y crecimiento de empresas, conocida popularmente como Ley Crea y Crece, introdujo en España la obligatoriedad de la facturación electrónica en las relaciones comerciales entre empresas y autónomos (B2B). Esta ley modifica la Ley 56/2007 de Medidas de Impulso de la Sociedad de la Información y establece que todos los empresarios y profesionales deberán expedir, remitir y recibir facturas electrónicas en sus relaciones comerciales con otros empresarios y profesionales.</p>
      <p>Sin embargo, la ley solo establece el mandato general. Los detalles técnicos y el calendario de implementación se desarrollan en el reglamento pendiente de publicación definitiva, que fijará los formatos válidos, los plazos exactos por tamaño de empresa y los requisitos de las plataformas de intercambio. Este reglamento estaba en tramitación avanzada a lo largo de 2025 y 2026.</p>

      <h2>Diferencia entre factura electrónica B2B y Verifactu</h2>
      <p>Uno de los puntos de mayor confusión entre los autónomos es la diferencia entre la factura electrónica obligatoria por la Ley Crea y Crece y el sistema Verifactu del RD 1007/2023. Son dos sistemas diferentes con objetivos distintos:</p>
      <ul>
        <li><strong>Facturación electrónica B2B (Ley Crea y Crece):</strong> obliga a que las facturas emitidas entre empresas y autónomos se intercambien en formato electrónico estructurado (no simplemente un PDF). El objetivo es facilitar el procesamiento automático, acelerar los cobros y reducir la morosidad. Afecta al intercambio de facturas entre emisor y receptor.</li>
        <li><strong>Verifactu (RD 1007/2023):</strong> es un requisito sobre el software de facturación. Obliga a que el programa informático que genera las facturas cumpla requisitos técnicos de integridad e inalterabilidad. Afecta al sistema interno de facturación, no necesariamente al formato de entrega al cliente.</li>
      </ul>
      <p>En la práctica, un software moderno y homologado cumple ambos requisitos simultáneamente, pero es importante entender que son obligaciones distintas con calendarios y ámbitos de aplicación diferentes. Para más detalle sobre Verifactu, consulta nuestra <Link href="/blog/verifactu-guia-completa">guía completa de Verifactu 2026</Link>.</p>

      <h2>Quién está obligado y desde cuándo</h2>
      <p>La Ley Crea y Crece establece una implantación escalonada según el tamaño del negocio:</p>
      <ul>
        <li><strong>Empresas con facturación anual superior a 8 millones de euros:</strong> primer grupo en quedar obligado, una vez publicado el reglamento de desarrollo y transcurrido el plazo de adaptación previsto (estimado 12 meses desde la publicación del reglamento).</li>
        <li><strong>Resto de empresarios y autónomos:</strong> segundo grupo, con un plazo de adaptación de 24 meses desde la publicación del reglamento.</li>
      </ul>
      <p>Importante: la obligación afecta únicamente a las relaciones B2B, es decir, cuando tanto el emisor como el receptor son empresarios o profesionales. Las facturas emitidas a consumidores finales (B2C) no están afectadas por la Ley Crea y Crece, aunque sí por otros requisitos de facturación general.</p>

      <h2>Formatos válidos de factura electrónica</h2>
      <p>No todos los formatos digitales son igualmente válidos como factura electrónica en el sentido legal del término. El reglamento de desarrollo de la Ley Crea y Crece previsiblemente aceptará los siguientes formatos:</p>

      <h3>Facturae (XML)</h3>
      <p>Facturae es el formato XML de factura electrónica desarrollado por el Ministerio de Hacienda y las Cámaras de Comercio. Es el formato oficial para la facturación con las administraciones públicas a través de FACe (Punto General de Entrada de Facturas de la Administración del Estado) y con las administraciones locales y autonómicas. Es el formato más implantado en España para el sector público y previsiblemente el de referencia para el sector privado.</p>

      <h3>UBL (Universal Business Language)</h3>
      <p>UBL es el estándar internacional de factura electrónica más usado en Europa, respaldado por OASIS y adoptado por países como Alemania (ZUGFeRD/XRechnung) y los países nórdicos. El reglamento de desarrollo de la Ley Crea y Crece previsiblemente lo reconocerá como formato válido para el intercambio B2B.</p>

      <h3>Peppol</h3>
      <p>Peppol es la red paneuropea de intercambio de documentos electrónicos, especialmente facturas. Permite el intercambio transfronterizo de facturas en toda la Unión Europea sin acuerdos bilaterales. Para autónomos con clientes europeos, la compatibilidad con Peppol puede ser un criterio de selección importante en el software.</p>

      <h3>PDF firmado electrónicamente</h3>
      <p>Un PDF firmado con firma electrónica reconocida (según el Reglamento eIDAS) puede considerarse factura electrónica si cumple los requisitos de autenticidad e integridad. Sin embargo, es el formato menos automatizable para el receptor, por lo que su uso en entornos B2B está disminuyendo frente a los formatos XML.</p>

      <h2>El SII: Suministro Inmediato de Información</h2>
      <p>El Suministro Inmediato de Información (SII) es el sistema de llevanza de libros registro del IVA en tiempo real que ya están obligados a utilizar las grandes empresas desde 2017. Afecta a empresas con facturación superior a 6 millones de euros, grupos de IVA, inscritos en el Registro de Devolución Mensual (REDEME) y contribuyentes que voluntariamente se acogen al sistema.</p>
      <p>Con el SII, estas empresas deben comunicar a la AEAT los datos de cada factura emitida o recibida en un plazo de 4 días hábiles desde su fecha de expedición o contabilización. El sistema genera automáticamente los libros de registro del IVA en la sede electrónica de la AEAT, lo que simplifica la presentación de declaraciones trimestrales y anuales.</p>
      <p>Los autónomos y pymes no están obligados al SII, aunque pueden acogerse voluntariamente. La llegada de Verifactu comparte filosofía con el SII pero tiene un ámbito de aplicación mucho más amplio.</p>

      <h2>Qué significa "factura verificable" con código QR</h2>
      <p>Bajo el sistema Verifactu, toda factura emitida debe incluir un código QR único que permite verificar su autenticidad en la sede electrónica de la AEAT. Cuando el receptor escanea el código QR de la factura recibida, puede acceder a la información que el emisor ha registrado en la AEAT y confirmar que la factura es auténtica y que sus datos no han sido manipulados.</p>
      <p>Esto tiene implicaciones prácticas importantes:</p>
      <ul>
        <li>Las empresas pueden verificar la autenticidad de las facturas recibidas antes de procesarlas para pago y deducción del IVA.</li>
        <li>La AEAT puede detectar automáticamente inconsistencias entre las facturas declaradas por el emisor y las que el receptor afirma haber recibido.</li>
        <li>El fraude del tipo "facturas falsas" se vuelve prácticamente imposible para quienes usen software homologado.</li>
      </ul>

      <h2>Comparativa: facturar en Word o PDF vs. software homologado</h2>
      <p>Muchos autónomos siguen facturando con Word, Excel o generando PDFs manuales. Esta práctica tiene un coste oculto que va mucho más allá del riesgo de multa a partir de 2027:</p>
      <ul>
        <li><strong>Tiempo:</strong> crear una factura manualmente en Word lleva entre 5 y 15 minutos. Con software, entre 30 segundos y 2 minutos. Multiplica eso por el número de facturas al mes y obtienes horas de trabajo improductivo.</li>
        <li><strong>Errores:</strong> los cálculos manuales de IVA, IRPF y total son fuente constante de errores. Un error en una factura requiere una rectificativa, con el proceso administrativo que implica.</li>
        <li><strong>Seguimiento de cobros:</strong> con PDFs manuales, saber qué facturas están pendientes de cobro requiere revisar manualmente cada una. Con software, tienes un panel en tiempo real.</li>
        <li><strong>Preparación de declaraciones:</strong> con PDFs manuales, tienes que sumar manualmente las bases imponibles y cuotas de IVA de cada factura cada trimestre. Con software, el resumen se genera automáticamente.</li>
        <li><strong>Cumplimiento normativo:</strong> a partir de 2027, los PDFs manuales no serán legalmente válidos para los contribuyentes obligados a cumplir con Verifactu. El cambio es inevitable, así que mejor hacerlo antes.</li>
      </ul>

      <h2>Pasos para adaptarse a la facturación electrónica</h2>
      <p>La adaptación a la facturación electrónica no ocurre de un día para otro. Estos son los pasos recomendados para hacerlo de forma ordenada:</p>
      <ul>
        <li><strong>Paso 1: Inventario de herramientas actuales.</strong> Identifica qué software usas ahora para facturar. Si es una herramienta comercial, consulta su hoja de ruta para cumplimiento Verifactu y B2B.</li>
        <li><strong>Paso 2: Evalúa tus necesidades.</strong> ¿Cuántas facturas emites al mes? ¿Tienes clientes que ya te piden facturas en formato electrónico? ¿Tienes empleados que también emiten facturas?</li>
        <li><strong>Paso 3: Selecciona un software homologado.</strong> Busca un software que cumpla o tenga comprometido el cumplimiento con Verifactu y los estándares de factura electrónica B2B.</li>
        <li><strong>Paso 4: Migra tus datos.</strong> Importa la base de clientes, las series de facturas y el histórico de facturas si el software lo permite.</li>
        <li><strong>Paso 5: Prueba antes de la obligatoriedad.</strong> Emite facturas reales con el nuevo sistema antes de que sea obligatorio para detectar problemas en condiciones no críticas.</li>
        <li><strong>Paso 6: Informa a tus clientes.</strong> Si vas a enviar facturas en un nuevo formato, avisa a tus clientes con antelación y asegúrate de que pueden recibirlas y procesarlas correctamente.</li>
      </ul>

      <h2>ClientLabs como solución para autónomos españoles</h2>
      <p>ClientLabs está diseñado específicamente para autónomos y pymes españoles, lo que significa que la adaptación a Verifactu y a los requisitos de facturación electrónica B2B es parte de su desarrollo central, no un añadido posterior. Al usar ClientLabs, no tendrás que preocuparte por los detalles técnicos del hash SHA-256, el XML estructurado o el código QR: el sistema los incorpora automáticamente en cada factura.</p>
      <p>Además, al integrar la gestión de clientes, el pipeline de ventas y la facturación en una sola plataforma, reduces la fragmentación de herramientas que complica el cumplimiento normativo. Desde el momento en que cierras un trato, puedes generar la factura en segundos con todos los datos correctos y enviársela directamente al cliente. <Link href="/precios">Ver planes de ClientLabs</Link> y elige el que mejor se adapta a tu volumen de facturación.</p>
    </div>
  ),

  "errores-facturacion-autonomos": (
    <div>
      <p>La facturación es una de las obligaciones más críticas para cualquier autónomo en España. Un error en una factura no es solo un problema administrativo: puede derivar en sanciones de la AEAT, problemas con clientes que no pueden deducirse el IVA o situaciones de impago difíciles de resolver. Estos son los diez errores más frecuentes en la facturación de autónomos y las consecuencias reales de cada uno.</p>

      <h2>Error 1: Numeración no correlativa de facturas</h2>
      <p>El artículo 6 del Real Decreto 1619/2012, Reglamento de Facturación, obliga a que las facturas tengan una numeración correlativa dentro de cada serie. No pueden saltarse números, ni repetirse, ni ir hacia atrás.</p>
      <p><strong>Por qué ocurre:</strong> muchos autónomos que cambian de software de facturación, mezclan facturas de varios proyectos o clientes sin gestionar correctamente las series, o simplemente eliminan facturas ya emitidas para corregir errores (cuando lo correcto es emitir una factura rectificativa).</p>
      <p><strong>Consecuencias:</strong> la AEAT puede considerar que la numeración discontinua indica ocultación de operaciones. En una inspección, tendrás que justificar cada salto de número, lo cual puede ser imposible si no llevas un registro riguroso.</p>
      <p><strong>Cómo evitarlo:</strong> usa un software de facturación que gestione automáticamente la numeración correlativa. Si necesitas anular una factura ya emitida, emite una factura rectificativa que la cancele, nunca la elimines. Si tienes distintos tipos de clientes o actividades, crea series separadas (A-2026, B-2026...) con numeración correlativa dentro de cada serie.</p>

      <h2>Error 2: Falta de datos obligatorios en la factura</h2>
      <p>El artículo 6 del Reglamento de Facturación establece los datos mínimos que debe contener una factura completa. Los más frecuentemente omitidos son el NIF del cliente y su dirección fiscal completa.</p>
      <p><strong>Datos obligatorios que con frecuencia faltan:</strong></p>
      <ul>
        <li>NIF o CIF del destinatario de la factura (imprescindible para que pueda deducirse el IVA)</li>
        <li>Domicilio fiscal del destinatario (no el de entrega, sino el fiscal)</li>
        <li>NIF del emisor (confundir con número de teléfono o número de cuenta)</li>
        <li>Descripción detallada del servicio o bien (no vale "servicios" o "trabajos")</li>
        <li>Tipo de IVA aplicado (no solo el porcentaje, sino especificado en la factura)</li>
      </ul>
      <p><strong>Consecuencias:</strong> una factura sin NIF del destinatario no le permite a tu cliente deducirse el IVA. Si es una empresa, te reclamará una factura rectificativa. Si es un inspector de Hacienda, rechazará la factura como justificante de gasto.</p>
      <p><strong>Cómo evitarlo:</strong> crea una ficha de cliente completa antes de emitir la primera factura. Solicita siempre el NIF y la dirección fiscal en el momento del alta, no cuando ya tienes que facturar. Un buen CRM con gestión de clientes integrada, como ClientLabs, almacena estos datos y los incorpora automáticamente en cada factura.</p>

      <h2>Error 3: Aplicar el tipo de IVA incorrecto</h2>
      <p>No todos los servicios y productos tributan al 21%. España tiene cuatro tipos de IVA (general 21%, reducido 10%, superreducido 4% y exento 0%) y la aplicación incorrecta del tipo puede derivar en liquidaciones adicionales con recargos e intereses.</p>
      <p><strong>Errores más frecuentes:</strong></p>
      <ul>
        <li>Aplicar el 21% a servicios de hostelería que tributan al 10%</li>
        <li>Aplicar IVA a servicios médicos o educativos que están exentos</li>
        <li>No aplicar IVA a servicios prestados a clientes de la UE cuando sí corresponde (operaciones intracomunitarias)</li>
        <li>Aplicar IVA español a servicios prestados a clientes extranjeros fuera de la UE (no devenga IVA español)</li>
      </ul>
      <p><strong>Consecuencias:</strong> cobrar de menos IVA del debido implica tener que pagarlo de tu bolsillo al liquidar el trimestre. Cobrar de más y declararlo implica una liquidación que perjudica a tu cliente. Si la AEAT detecta errores sistemáticos, puede iniciar un procedimiento de comprobación limitada.</p>
      <p><strong>Cómo evitarlo:</strong> consulta el artículo 90 y siguientes de la Ley del IVA (Ley 37/1992) para verificar el tipo aplicable a tu actividad concreta. Si tienes dudas, consulta a un asesor fiscal. No asumas que "como todos en mi sector facturan al 21%, yo también". La AEAT no acepta esa justificación.</p>

      <h2>Error 4: No aplicar retención de IRPF cuando es obligatorio</h2>
      <p>Los autónomos que ejercen actividades profesionales (no empresariales) deben aplicar una retención del 15% de IRPF en sus facturas cuando el destinatario es una persona jurídica o empresario obligado a retener. Los nuevos autónomos en sus dos primeros años pueden aplicar el tipo reducido del 7%.</p>
      <p><strong>Errores frecuentes:</strong> no incluir la retención en facturas a empresas, aplicar el 15% cuando aún corresponde el 7% de los primeros años, o aplicar retención cuando el destinatario es un particular (que no está obligado a retener).</p>
      <p><strong>Consecuencias:</strong> si no aplicas retención cuando debes hacerlo, la empresa cliente puede reclamarte una factura rectificativa o, en el caso de que ya haya pagado sin retención, tendrás que regularizar la situación en tu declaración anual de IRPF. Además, la AEAT puede imponerte recargos e intereses por las retenciones no practicadas.</p>
      <p><strong>Cómo evitarlo:</strong> clasifica claramente a tus clientes: personas físicas particulares (sin retención), empresas y autónomos españoles (con retención 15% o 7%), clientes de la UE (normalmente sin retención, con aplicación del mecanismo de inversión del sujeto pasivo), y clientes extracomunitarios (sin retención española). Un software de facturación te permite configurar el tipo de retención por cliente y aplicarlo automáticamente.</p>

      <h2>Error 5: Confundir base imponible con precio total</h2>
      <p>Este es uno de los errores más básicos pero también uno de los más frecuentes, especialmente entre autónomos que empiezan. La base imponible es el importe del servicio o producto antes de impuestos. El precio total incluye la base imponible más el IVA menos la retención de IRPF.</p>
      <p><strong>Ejemplo práctico:</strong> si facturas un servicio de consultoría por 1.000 euros, la factura tiene que reflejar: base imponible 1.000 €, IVA 21% = 210 €, retención IRPF 15% = -150 €, total a pagar = 1.060 €. El modelo 303 del IVA solo se rellena con los 1.000 € de base y los 210 € de cuota, no con el total de 1.060 €.</p>
      <p><strong>Consecuencias:</strong> declarar el total como base imponible en el modelo 303 implica pagar de más al Trimestre. Declarar solo el total en el modelo 347 implica errores en la información de operaciones con terceros.</p>
      <p><strong>Cómo evitarlo:</strong> familiarízate con los conceptos básicos de facturación y usa software que calcule automáticamente cada componente. El modelo 303 siempre usa bases imponibles, nunca importes totales con IVA incluido.</p>

      <h2>Error 6: No conservar facturas los 4 años reglamentarios</h2>
      <p>El artículo 29 de la Ley General Tributaria obliga a conservar todas las facturas emitidas y recibidas durante el plazo de prescripción tributaria, que en general es de 4 años desde el último día del plazo de presentación de la declaración correspondiente. En la práctica, se recomienda conservarlas durante al menos 5 años para tener margen.</p>
      <p><strong>Por qué ocurre:</strong> cambio de ordenador sin hacer copia de seguridad, uso de software de facturación que se da de baja sin exportar los datos, eliminación accidental de archivos, o simplemente no tener un sistema de archivo organizado.</p>
      <p><strong>Consecuencias:</strong> si la AEAT inicia una inspección y no puedes presentar las facturas de un ejercicio, se puede considerar que no tienes los gastos justificados, lo que implica una liquidación adicional del IRPF con todos esos gastos no deducibles. Las sanciones por falta de conservación de documentos pueden alcanzar los 600 euros por infracción, con un mínimo de 150 euros.</p>
      <p><strong>Cómo evitarlo:</strong> usa software en la nube que haga copias de seguridad automáticas. Si guardas las facturas en local, crea copias periódicas en un disco externo o en almacenamiento en la nube (Google Drive, Dropbox). Crea una carpeta por año fiscal y dentro por tipo de documento. Nunca borres facturas de los últimos 5 años.</p>

      <h2>Error 7: Emitir facturas simplificadas cuando no procede</h2>
      <p>Las facturas simplificadas (equivalentes al antiguo tique) solo pueden emitirse en determinados casos previstos en el artículo 4 del Reglamento de Facturación: operaciones cuyo destinatario es un consumidor final (no empresario), operaciones en determinados sectores (hostelería, comercio minorista, transporte de personas...) o cuando el importe no supera 400 euros (IVA incluido).</p>
      <p><strong>Por qué ocurre:</strong> algunos autónomos emiten facturas simplificadas a sus clientes empresariales para "simplificar" el proceso, sin saber que el cliente empresarial no puede deducirse el IVA de una factura simplificada si en ella no constan sus datos de identificación.</p>
      <p><strong>Consecuencias:</strong> tu cliente empresa no puede deducirse el IVA de la factura simplificada. Cuando lo descubre, te reclamará una factura completa rectificativa, con el coste administrativo que supone. En casos reiterados, puede afectar a la relación comercial.</p>
      <p><strong>Cómo evitarlo:</strong> regla simple: si tu cliente es una empresa o un autónomo, siempre emite factura completa con todos sus datos de identificación. Solo usa facturas simplificadas para ventas a particulares.</p>

      <h2>Error 8: No declarar operaciones con el mismo cliente que superen 3.005,06 euros (Modelo 347)</h2>
      <p>El artículo 33 del Real Decreto 1065/2007 obliga a presentar el Modelo 347 (Declaración Anual de Operaciones con Terceras Personas) cuando el conjunto de operaciones realizadas con un mismo cliente o proveedor en el año supera los 3.005,06 euros, IVA incluido.</p>
      <p><strong>Por qué ocurre:</strong> muchos autónomos con facturación baja creen que no les afecta, pero con clientes recurrentes es muy fácil superar ese umbral. También hay quienes desconocen la obligación por completo.</p>
      <p><strong>Consecuencias:</strong> la no presentación del Modelo 347 cuando procede es una infracción tributaria leve con sanción mínima de 200 euros y máxima de 20.000 euros, según el artículo 198 de la LGT. Además, si la AEAT detecta discrepancias entre tu 347 y el de tu cliente, pueden iniciarse actuaciones de comprobación.</p>
      <p><strong>Cómo evitarlo:</strong> al cierre de cada año, revisa cuánto has facturado a cada cliente y cuánto has pagado a cada proveedor. Si alguno supera los 3.005,06 euros, debes incluirlo en el Modelo 347 que se presenta en febrero del año siguiente. Un software de facturación que agrupe las facturas por cliente facilita enormemente este control.</p>

      <h2>Error 9: Retrasar la emisión de facturas</h2>
      <p>El artículo 11 del Reglamento de Facturación obliga a emitir las facturas en el momento de la operación o, si el destinatario es un empresario o profesional, en el plazo de un mes desde que se realiza la operación. Si se trata de entregas intracomunitarias de bienes, el plazo es el decimoquinto día del mes siguiente al que se inicia la expedición.</p>
      <p><strong>Por qué ocurre:</strong> dejar la facturación "para el viernes", acumular facturas del mes para emitirlas todas de golpe, o simplemente olvidar facturar proyectos pequeños hasta que el cliente lo reclama.</p>
      <p><strong>Consecuencias:</strong> retrasar la facturación retrasa el cobro. Si el devengo del IVA se produce en un trimestre y la factura se emite en el siguiente, puede haber problemas de imputación temporal en la liquidación del modelo 303. Además, una factura emitida fuera del plazo legal tiene fecha contable diferente a la de prestación del servicio, lo que puede crear complicaciones en auditorías.</p>
      <p><strong>Cómo evitarlo:</strong> emite la factura en el mismo momento en que terminas el trabajo o realizas la entrega. Con software de facturación móvil, puedes hacerlo desde cualquier lugar en menos de dos minutos. Establece el hábito de facturar inmediatamente, no acumules.</p>

      <h2>Error 10: No tener copia de seguridad de la contabilidad</h2>
      <p>La pérdida de los registros contables no es solo un problema de organización: es un riesgo fiscal y legal. Si pierdes tus facturas emitidas, no podrás justificar los ingresos declarados. Si pierdes las facturas recibidas, perderás las deducciones de IVA e IRPF que ya has aplicado.</p>
      <p><strong>Por qué ocurre:</strong> fallo de hardware, robo del ordenador, daño por agua o incendio, o simplemente no tener ningún sistema de copia de seguridad configurado. También ocurre cuando se cambia de software de facturación sin exportar los datos históricos.</p>
      <p><strong>Consecuencias:</strong> ante una inspección de Hacienda sin poder presentar la documentación, la AEAT puede estimar de oficio los ingresos y gastos usando métodos indirectos, que casi siempre resultan desfavorables para el contribuyente. El artículo 53 de la LGT permite a la AEAT usar el método de estimación indirecta cuando el contribuyente no puede aportar la documentación requerida.</p>
      <p><strong>Cómo evitarlo:</strong> usa software de facturación en la nube que incluya copias de seguridad automáticas y cifradas. Si usas software local, configura copias de seguridad diarias en un servicio externo (Google Drive, Dropbox, OneDrive). Verifica periódicamente que las copias se están realizando correctamente y que puedes restaurarlas.</p>

      <h2>Un sistema que previene todos estos errores</h2>
      <p>La mayoría de estos errores tienen una solución común: un software de facturación diseñado específicamente para autónomos españoles que automatice la numeración correlativa, valide los datos obligatorios antes de emitir, calcule automáticamente el tipo de IVA e IRPF según el cliente, genere las copias de seguridad automáticamente y te recuerde las obligaciones del Modelo 347 al cierre del año.</p>
      <p>ClientLabs incorpora todos estos controles y está diseñado para que un autónomo sin conocimientos fiscales avanzados facture correctamente desde el primer día. <Link href="/register">Empieza gratis</Link> y cierra estos riesgos antes de que te causen un problema con la AEAT.</p>
    </div>
  ),

  "modelo-303-iva-trimestral-guia": (
    <div>
      <p>El Modelo 303 es la declaración trimestral del IVA: el formulario que todo autónomo sujeto a este impuesto debe presentar a la AEAT cuatro veces al año. Aunque a primera vista parece complicado, su lógica es simple: declaras el IVA que has cobrado a tus clientes, restas el IVA que tú has pagado en tus gastos, y la diferencia es lo que ingresas (o lo que compensas). Esta guía te explica cada paso en detalle para 2026.</p>

      <h2>Qué es el Modelo 303 y quién debe presentarlo</h2>
      <p>El Modelo 303 es la autoliquidación del Impuesto sobre el Valor Añadido para el régimen general. Deben presentarlo todos los empresarios y profesionales (autónomos) que realicen actividades sujetas a IVA, es decir, la gran mayoría de actividades económicas salvo las expresamente exentas (servicios médicos, educativos, determinados servicios financieros y otros contemplados en los artículos 20 a 26 de la Ley del IVA).</p>
      <p>No están obligados a presentar el Modelo 303 los autónomos acogidos al régimen de franquicia del IVA (facturación anual inferior a 85.000 euros que hayan optado por acogerse a este régimen), los que tributan en el régimen simplificado (módulos para ciertas actividades) mediante el Modelo 310/311, o los que realizan exclusivamente operaciones exentas de IVA sin derecho a deducción.</p>
      <p>Si tienes dudas sobre si estás obligado, consulta tu declaración de alta en Hacienda (Modelo 036 o 037) o consulta a tu asesor fiscal.</p>

      <h2>Plazos de presentación de cada trimestre en 2026</h2>
      <p>El Modelo 303 se presenta cuatro veces al año, uno por cada trimestre natural. Los plazos para 2026 son:</p>
      <ul>
        <li><strong>1T (enero, febrero, marzo):</strong> del 1 al 20 de abril de 2026. Si el día 20 cae en fin de semana o festivo, el plazo se amplía al siguiente día hábil.</li>
        <li><strong>2T (abril, mayo, junio):</strong> del 1 al 20 de julio de 2026.</li>
        <li><strong>3T (julio, agosto, septiembre):</strong> del 1 al 20 de octubre de 2026.</li>
        <li><strong>4T (octubre, noviembre, diciembre):</strong> del 1 al 30 de enero de 2027. El cuarto trimestre tiene un plazo más amplio (hasta el día 30) porque coincide con las fiestas navideñas y la preparación de declaraciones anuales.</li>
      </ul>
      <p>Los autónomos que domicilian el pago tienen hasta el día 15 de cada mes para presentar la declaración. El cargo en cuenta se produce el último día del plazo.</p>

      <h2>Cómo calcular el IVA repercutido e IVA soportado</h2>
      <p>Antes de rellenar el formulario, necesitas calcular dos cifras fundamentales:</p>

      <h3>IVA repercutido (el que has cobrado)</h3>
      <p>Es la suma de todo el IVA que has facturado a tus clientes durante el trimestre. Para calcularlo, agrupa todas las facturas emitidas del trimestre por tipo de IVA (21%, 10%, 4%) y suma la base imponible y la cuota de IVA de cada grupo.</p>
      <p>Por ejemplo, si en el 1T de 2026 has emitido facturas con bases imponibles de 10.000 € al 21%, el IVA repercutido al 21% es 2.100 €. Si además tienes 2.000 € en facturas al 10%, el IVA repercutido al 10% es 200 €. Total IVA repercutido: 2.300 €.</p>

      <h3>IVA soportado deducible (el que has pagado)</h3>
      <p>Es la suma del IVA de todas las facturas de gastos que has recibido en el trimestre, siempre que esos gastos estén relacionados con tu actividad económica y tengas la factura completa con todos los datos en regla.</p>
      <p>No todo el IVA soportado es deducible. No puedes deducir el IVA de gastos personales, de entretenimiento no relacionado con la actividad, de vehículos turismo (salvo excepciones), o de servicios recibidos de terceros que no son empresarios o profesionales.</p>

      <h2>Las principales casillas del Modelo 303</h2>
      <p>El formulario tiene muchas casillas, pero para un autónomo en régimen general sin operaciones especiales, las más relevantes son:</p>

      <h3>Sección de IVA devengado (facturas emitidas)</h3>
      <ul>
        <li><strong>Casilla 01:</strong> base imponible de las operaciones sujetas al tipo impositivo del 21% (el más habitual).</li>
        <li><strong>Casilla 03:</strong> cuota de IVA al 21% (resultado de multiplicar la casilla 01 por 0,21).</li>
        <li><strong>Casilla 04:</strong> base imponible de las operaciones al tipo reducido del 10%.</li>
        <li><strong>Casilla 06:</strong> cuota de IVA al 10%.</li>
        <li><strong>Casilla 07:</strong> base imponible de las operaciones al tipo superreducido del 4%.</li>
        <li><strong>Casilla 09:</strong> cuota de IVA al 4%.</li>
        <li><strong>Casilla 12:</strong> importe de las rectificaciones de IVA devengado de periodos anteriores (positivo si rectificas al alza, negativo si al baja).</li>
        <li><strong>Casilla 21:</strong> total de cuotas de IVA devengado (suma de casillas 03, 06, 09 y 12).</li>
      </ul>

      <h3>Sección de IVA deducible (facturas de gastos recibidas)</h3>
      <ul>
        <li><strong>Casilla 28:</strong> base imponible de las compras y gastos en operaciones interiores (las facturas de gastos que recibes de proveedores españoles).</li>
        <li><strong>Casilla 29:</strong> cuota de IVA deducible en operaciones interiores corrientes.</li>
        <li><strong>Casilla 36:</strong> cuota de IVA deducible total (suma de todas las casillas de IVA soportado).</li>
      </ul>

      <h3>Sección de resultado</h3>
      <ul>
        <li><strong>Casilla 46:</strong> diferencia entre el IVA devengado (casilla 21) y el IVA deducible (casilla 36). Es el resultado de la autoliquidación antes de ajustes.</li>
        <li>Si la casilla 46 es positiva: tienes que ingresar ese importe a la AEAT.</li>
        <li>Si la casilla 46 es negativa: tienes un crédito a tu favor que puedes compensar en el siguiente trimestre o, si es el cuarto trimestre, solicitar la devolución.</li>
      </ul>

      <h2>Diferencia entre cuota a ingresar y cuota negativa</h2>
      <p>Cuando el resultado de la casilla 46 es positivo, tienes que pagar ese importe a Hacienda. El pago se puede hacer mediante domiciliación bancaria, pago en entidad colaboradora (banco) o en la sede electrónica de la AEAT con tarjeta o cargo en cuenta.</p>
      <p>Cuando el resultado es negativo, significa que el IVA que has pagado en tus gastos supera al IVA que has cobrado en tus facturas. En este caso:</p>
      <ul>
        <li><strong>En el 1T, 2T y 3T:</strong> la cuota negativa queda pendiente de compensación en el siguiente trimestre. No puedes pedir la devolución, solo compensar.</li>
        <li><strong>En el 4T:</strong> puedes elegir entre compensar en el 1T del año siguiente o solicitar la devolución. La devolución puede tardar entre 6 meses y 12 meses si no estás inscrito en el REDEME (Registro de Devolución Mensual).</li>
        <li><strong>REDEME:</strong> los autónomos con saldos negativos recurrentes pueden inscribirse en el Registro de Devolución Mensual para solicitar devoluciones mensualmente, con tramitación más rápida pero con mayor control por parte de la AEAT.</li>
      </ul>

      <h2>Errores comunes al presentar el Modelo 303</h2>
      <ul>
        <li><strong>Incluir el importe total de la factura (con IVA) en las bases imponibles:</strong> las casillas de bases imponibles solo admiten la base, sin IVA. Si incluyes el total, estarás pagando de más.</li>
        <li><strong>Olvidar facturas de gastos de final de trimestre:</strong> las facturas que llegan en los primeros días del mes siguiente (del último mes del trimestre) son fáciles de omitir. Incluye todas las facturas cuya fecha de expedición esté dentro del trimestre.</li>
        <li><strong>No incluir el saldo a compensar del trimestre anterior:</strong> si el trimestre anterior tuvo resultado negativo a compensar, debes trasladarlo a la casilla correspondiente del trimestre actual. Si no lo haces, estás pagando de más.</li>
        <li><strong>Presentar sin certificado digital o Cl@ve:</strong> el Modelo 303 solo puede presentarse por vía telemática. Necesitas certificado digital, DNI electrónico o Cl@ve PIN. Si no tienes ninguno, solicítalo con tiempo antes del plazo.</li>
        <li><strong>Confundir la fecha de devengo con la fecha de cobro:</strong> el IVA se devenga cuando se presta el servicio o se entrega el bien, no cuando cobras. Debes declarar el IVA en el trimestre del devengo aunque no hayas cobrado todavía (con excepciones en el criterio de caja).</li>
      </ul>

      <h2>Qué es la prorrata del IVA y cuándo se aplica</h2>
      <p>La prorrata del IVA se aplica cuando un autónomo realiza simultáneamente operaciones que dan derecho a deducción del IVA y operaciones exentas que no dan ese derecho. En este caso, no puede deducirse el 100% del IVA soportado, sino solo una proporción (la prorrata) calculada en función del peso de las operaciones con derecho a deducción sobre el total.</p>
      <p>Por ejemplo, un médico que compagina consulta privada (exenta de IVA) con servicios estéticos (sujetos a IVA al 21%) no puede deducirse el 100% del IVA de sus gastos comunes, sino solo la proporción que corresponde a los ingresos de los servicios estéticos sobre el total de sus ingresos.</p>
      <p>La prorrata definitiva se calcula al cierre del año en el cuarto trimestre y en la declaración anual del Modelo 390. Durante el año se aplica una prorrata provisional basada en la del año anterior.</p>

      <h2>Cómo presentar el Modelo 303 telemáticamente en la AEAT</h2>
      <p>El proceso paso a paso en la sede electrónica de la AEAT:</p>
      <ul>
        <li><strong>Paso 1:</strong> accede a la sede electrónica de la AEAT (sede.agenciatributaria.gob.es) con tu certificado digital, DNI electrónico o Cl@ve PIN.</li>
        <li><strong>Paso 2:</strong> ve a la sección "Trámites destacados" o utiliza el buscador para encontrar el "Modelo 303".</li>
        <li><strong>Paso 3:</strong> selecciona el ejercicio y período (trimestre) correspondiente.</li>
        <li><strong>Paso 4:</strong> rellena las casillas con los datos de tus facturas emitidas y recibidas.</li>
        <li><strong>Paso 5:</strong> revisa el resultado calculado por el sistema.</li>
        <li><strong>Paso 6:</strong> si el resultado es a ingresar, selecciona el método de pago (domiciliación, NRC bancario o cargo en cuenta).</li>
        <li><strong>Paso 7:</strong> presenta la declaración y guarda el justificante PDF con el número de referencia de presentación.</li>
      </ul>
      <p>Si tienes Cl@ve PIN y no certificado digital, el proceso es similar pero requiere que generes un código PIN en el momento de la presentación a través de la app o la web de Cl@ve.</p>

      <h2>Cómo simplificar el proceso con las herramientas adecuadas</h2>
      <p>Preparar el Modelo 303 manualmente implica revisar cada factura del trimestre, clasificarla por tipo de IVA, sumar las bases y las cuotas, y cruzar los datos. Este proceso puede llevar entre 1 y 4 horas dependiendo del volumen de facturas.</p>
      <p>Con ClientLabs, el resumen de IVA del trimestre se genera automáticamente a partir de las facturas emitidas y recibidas registradas en el sistema. El informe te muestra exactamente qué valores corresponden a cada casilla del Modelo 303, reduciendo el tiempo de preparación a menos de 15 minutos y minimizando el riesgo de error. <Link href="/register">Prueba ClientLabs gratis</Link> antes de que llegue el próximo trimestre y verifica la diferencia por ti mismo.</p>
    </div>
  ),

  "cuota-autonomos-2026": (
    <div>
      <p>El sistema de cotización de autónomos en España vive desde 2023 su mayor reforma en décadas. El antiguo sistema de base de cotización libre dio paso a un modelo de cotización por ingresos reales, donde cada autónomo cotiza en función de lo que efectivamente gana. En 2026, el sistema está plenamente consolidado y conocer sus reglas puede suponer una diferencia de cientos de euros anuales en tu cuota mensual.</p>

      <h2>El nuevo sistema de cotización por ingresos reales</h2>
      <p>El Real Decreto-ley 13/2022, de 26 de julio, estableció el nuevo sistema de cotización para trabajadores autónomos basado en el rendimiento neto anual. Este sistema sustituyó al anterior modelo en el que el autónomo elegía libremente su base de cotización (con un mínimo y un máximo), independientemente de sus ingresos reales.</p>
      <p>El nuevo modelo funciona así: al inicio de cada año, el autónomo comunica a la Seguridad Social una previsión de sus rendimientos netos anuales. En función de esa previsión, se le asigna un tramo y una cuota mensual provisional. Al cierre del año, la Agencia Tributaria comunica a la Seguridad Social los rendimientos netos reales del contribuyente y se realiza una regularización: si ganó más de lo previsto, paga la diferencia; si ganó menos, la Seguridad Social le devuelve el exceso pagado.</p>
      <p>Los rendimientos netos para calcular el tramo de cotización son los ingresos de la actividad menos los gastos deducibles menos el 7% adicional en concepto de gastos de difícil justificación (o el porcentaje real de gastos si es mayor). La propia cuota de autónomos también es deducible para calcular el rendimiento neto.</p>

      <h2>Tabla de tramos de rendimientos netos 2026</h2>
      <p>Para 2026, la tabla de tramos y cuotas mensuales mínimas y máximas es la siguiente (los valores exactos se publican anualmente en la Ley de Presupuestos Generales del Estado o disposición equivalente; los que se muestran son los vigentes según el calendario de la reforma):</p>
      <ul>
        <li><strong>Tramo 1 — Rendimiento neto inferior a 670 €/mes:</strong> cuota mínima 200 €/mes, cuota máxima 260 €/mes.</li>
        <li><strong>Tramo 2 — Rendimiento neto entre 670 € y 900 €/mes:</strong> cuota mínima 220 €/mes, cuota máxima 280 €/mes.</li>
        <li><strong>Tramo 3 — Rendimiento neto entre 900 € y 1.166,70 €/mes (equivalente al SMI):</strong> cuota mínima 260 €/mes, cuota máxima 350 €/mes.</li>
        <li><strong>Tramo 4 — Rendimiento neto entre 1.166,70 € y 1.300 €/mes:</strong> cuota mínima 310 €/mes, cuota máxima 400 €/mes.</li>
        <li><strong>Tramo 5 — Rendimiento neto entre 1.300 € y 1.500 €/mes:</strong> cuota mínima 340 €/mes, cuota máxima 450 €/mes.</li>
        <li><strong>Tramo 6 — Rendimiento neto entre 1.500 € y 1.700 €/mes:</strong> cuota mínima 370 €/mes, cuota máxima 490 €/mes.</li>
        <li><strong>Tramo 7 — Rendimiento neto entre 1.700 € y 1.850 €/mes:</strong> cuota mínima 380 €/mes, cuota máxima 510 €/mes.</li>
        <li><strong>Tramo 8 — Rendimiento neto entre 1.850 € y 2.030 €/mes:</strong> cuota mínima 390 €/mes, cuota máxima 530 €/mes.</li>
        <li><strong>Tramo 9 — Rendimiento neto entre 2.030 € y 2.330 €/mes:</strong> cuota mínima 420 €/mes, cuota máxima 560 €/mes.</li>
        <li><strong>Tramo 10 — Rendimiento neto entre 2.330 € y 2.760 €/mes:</strong> cuota mínima 460 €/mes, cuota máxima 590 €/mes.</li>
        <li><strong>Tramo 11 — Rendimiento neto entre 2.760 € y 3.190 €/mes:</strong> cuota mínima 490 €/mes, cuota máxima 620 €/mes.</li>
        <li><strong>Tramo 12 — Rendimiento neto entre 3.190 € y 3.620 €/mes:</strong> cuota mínima 530 €/mes, cuota máxima 650 €/mes.</li>
        <li><strong>Tramo 13 — Rendimiento neto entre 3.620 € y 4.050 €/mes:</strong> cuota mínima 560 €/mes, cuota máxima 680 €/mes.</li>
        <li><strong>Tramo 14 — Rendimiento neto entre 4.050 € y 6.000 €/mes:</strong> cuota mínima 590 €/mes, cuota máxima 720 €/mes.</li>
        <li><strong>Tramo 15 — Rendimiento neto superior a 6.000 €/mes:</strong> cuota mínima 650 €/mes, cuota máxima 1.267 €/mes.</li>
      </ul>
      <p>Importante: dentro de cada tramo puedes elegir cualquier base de cotización entre la mínima y la máxima del tramo. Una base de cotización más alta implica mayor cuota mensual pero también mayores prestaciones futuras (jubilación, incapacidad temporal, etc.).</p>

      <h2>Cuota mínima y máxima en 2026</h2>
      <p>La cuota mínima posible en 2026 para un autónomo con rendimientos netos muy bajos (inferiores a 670 €/mes) es aproximadamente 200 euros al mes. La cuota máxima para un autónomo en el tramo 15 que cotice por la base máxima puede superar los 1.267 euros al mes.</p>
      <p>Esto supone una variación significativa respecto al sistema anterior, donde la cuota mínima rondaba los 294 euros al mes y la base máxima estaba más limitada. El nuevo sistema beneficia a los autónomos con ingresos bajos y perjudica, en términos de cuota mínima obligatoria, a los que cotizan voluntariamente por la base mínima independientemente de sus ingresos.</p>

      <h2>Tarifa plana para nuevos autónomos: 80 euros al mes</h2>
      <p>Los autónomos que causan alta en el RETA por primera vez, o que no hayan estado en situación de alta en los dos años inmediatamente anteriores (o en los tres si han disfrutado de bonificaciones previas), tienen derecho a la tarifa plana reducida.</p>
      <p>En 2026, la tarifa plana es de 80 euros al mes durante los primeros 12 meses de actividad, independientemente del tramo de ingresos en que se encuentre el autónomo. Esta tarifa es fija y no depende de los rendimientos declarados.</p>
      <p>Transcurridos los primeros 12 meses, si los rendimientos netos previstos del autónomo son inferiores al Salario Mínimo Interprofesional (SMI), puede prorrogarse la bonificación por 12 meses adicionales, aunque con una cuota algo superior a los 80 euros iniciales. Si los ingresos superan el SMI, el autónomo pasa directamente al tramo que le corresponde por sus rendimientos.</p>
      <p>Para solicitar la tarifa plana, debes indicarlo explícitamente en el momento de causar el alta en el RETA a través de la plataforma Import@ss. No se concede de forma automática si no la solicitas en el momento del alta.</p>

      <h2>Cómo cambiar de tramo durante el año</h2>
      <p>Una de las ventajas del nuevo sistema es la flexibilidad para ajustar la cuota a lo largo del año. Puedes solicitar el cambio de tramo de cotización hasta 6 veces durante el año natural, con efectividad en el primer día del mes siguiente a la solicitud.</p>
      <p>Los periodos en que se pueden solicitar cambios de tramo son:</p>
      <ul>
        <li>Del 1 al 31 de enero: con efectividad el 1 de febrero.</li>
        <li>Del 1 al 28/29 de marzo: con efectividad el 1 de abril.</li>
        <li>Del 1 al 31 de mayo: con efectividad el 1 de junio.</li>
        <li>Del 1 al 31 de julio: con efectividad el 1 de agosto.</li>
        <li>Del 1 al 30 de septiembre: con efectividad el 1 de octubre.</li>
        <li>Del 1 al 30 de noviembre: con efectividad el 1 de diciembre.</li>
      </ul>
      <p>Para hacer el cambio, accede a Import@ss (importass.seg-social.es) con tu usuario y contraseña o certificado digital. El proceso es completamente online y no requiere ir a ninguna oficina.</p>

      <h2>Regularización anual de cuotas</h2>
      <p>Tras el cierre del ejercicio fiscal, la Agencia Tributaria comunica a la Tesorería General de la Seguridad Social los rendimientos netos reales de cada autónomo. A partir de ese dato, la Seguridad Social realiza la regularización anual:</p>
      <ul>
        <li><strong>Si cotizaste por encima del tramo real:</strong> la Seguridad Social te devuelve las cuotas pagadas en exceso, generalmente en los meses siguientes a la comunicación de la AEAT (que puede tardar varios meses desde el cierre del ejercicio).</li>
        <li><strong>Si cotizaste por debajo del tramo real:</strong> recibirás un cargo adicional por las cuotas pendientes. Este cargo incluye los intereses correspondientes al periodo de infracotización.</li>
      </ul>
      <p>Para evitar sorpresas en la regularización, actualiza regularmente tu previsión de ingresos a lo largo del año y solicita el cambio de tramo cuando detectes que tus ingresos reales se están desviando significativamente de la previsión inicial.</p>

      <h2>Compatibilidad con prestación por desempleo</h2>
      <p>Los trabajadores por cuenta ajena que perciben una prestación de desempleo y deciden darse de alta como autónomos pueden capitalizar la prestación o compatibilizarla con el inicio de la actividad en determinadas circunstancias.</p>
      <p>La compatibilización de la prestación de desempleo con el alta como autónomo es posible durante un máximo de 270 días (9 meses) bajo ciertas condiciones: el autónomo debe solicitarlo al SEPE antes de iniciar la actividad, la actividad autónoma no puede haberse ejercido en los 24 meses anteriores y la prestación reconocida debe tener un período pendiente de al menos 3 meses.</p>
      <p>Durante el período de compatibilización, el SEPE continúa abonando la prestación de desempleo y el autónomo paga la cuota del RETA. Una vez terminado el período de compatibilización, el autónomo puede capitalizar el importe restante de la prestación como un pago único para inversión en el negocio.</p>

      <h2>Cómo reducir legalmente la cuota: gastos deducibles para bajar el rendimiento neto</h2>
      <p>La base sobre la que se calcula el tramo de cotización son los rendimientos netos, no los ingresos brutos. Por tanto, todo gasto legalmente deducible que reduzcas del beneficio bruto reduce también el rendimiento neto y, potencialmente, te coloca en un tramo de cotización inferior.</p>
      <p>Los gastos deducibles más relevantes para los autónomos son:</p>
      <ul>
        <li><strong>La propia cuota del RETA:</strong> es deducible al 100% en el IRPF. Al ser deducible, reduce el rendimiento neto, lo que a su vez reduce la base de cotización. Hay un efecto circular que reduce ligeramente el coste real de la cuota.</li>
        <li><strong>Gastos de suministros del local o despacho:</strong> si trabajas desde un local dedicado exclusivamente a la actividad, son deducibles al 100%. Si trabajas desde casa, puedes deducir una proporción de los gastos de suministros (luz, agua, internet, teléfono) en función de los metros cuadrados dedicados a la actividad.</li>
        <li><strong>Amortizaciones de activos:</strong> los equipos informáticos, el mobiliario de oficina y otros activos usados en la actividad se amortizan anualmente según las tablas de la AEAT, reduciendo el rendimiento neto cada año.</li>
        <li><strong>Gastos de formación:</strong> cursos, libros, suscripciones a publicaciones profesionales y eventos del sector son deducibles si están directamente relacionados con la actividad.</li>
        <li><strong>Gastos de marketing y publicidad:</strong> creación y mantenimiento de web, publicidad en redes sociales, material corporativo e impresión de tarjetas son deducibles al 100%.</li>
        <li><strong>Seguros profesionales:</strong> la póliza de responsabilidad civil y otros seguros relacionados con la actividad profesional son deducibles.</li>
        <li><strong>Gastos de gestoría y asesoría:</strong> los honorarios de tu gestor fiscal o asesor son deducibles al 100%.</li>
      </ul>
      <p>Un gasto adicional a tener en cuenta es la deducción por gastos de difícil justificación: en la estimación directa simplificada, puedes deducir un 7% adicional sobre el rendimiento neto previo (con límite de 2.000 euros anuales) sin necesidad de justificar con facturas.</p>

      <h2>Autónomos societarios: diferencias en cotización</h2>
      <p>Los socios trabajadores de sociedades mercantiles que controlan más del 25% del capital y ejercen funciones de dirección o gerencia también deben darse de alta en el RETA como autónomos societarios. Sin embargo, tienen ciertas particularidades en la cotización:</p>
      <ul>
        <li>No tienen acceso a la tarifa plana de 80 euros (la bonificación para nuevos autónomos no aplica a los autónomos societarios).</li>
        <li>La base mínima de cotización para autónomos societarios en 2026 es superior a la del resto de autónomos (en torno a los 1.000-1.100 euros de base, con la cuota correspondiente).</li>
        <li>El rendimiento neto para determinar el tramo de cotización se calcula de forma diferente: se incluyen tanto los rendimientos del trabajo (salario que se paga la sociedad) como la parte proporcional de los rendimientos del capital social.</li>
      </ul>

      <h2>Lleva el control de tu rendimiento neto con ClientLabs</h2>
      <p>Para gestionar correctamente la cuota de autónomos bajo el nuevo sistema, necesitas conocer en todo momento cuál es tu rendimiento neto acumulado en el año. Esto requiere llevar un registro actualizado de todos tus ingresos y gastos deducibles.</p>
      <p>ClientLabs centraliza la gestión de facturas emitidas y recibidas, lo que te permite tener siempre visible tu facturación acumulada del año. Con esos datos, puedes estimar tu rendimiento neto actual y decidir si debes solicitar un cambio de tramo antes de que termine el próximo período de solicitud. <Link href="/register">Empieza gratis en ClientLabs</Link> y deja de hacer estos cálculos con hojas de cálculo cada vez que necesitas tomar una decisión sobre tu cotización.</p>

      <h2>Preguntas frecuentes sobre la cuota de autónomos 2026</h2>

      <h3>¿Qué pasa si no declaro mis ingresos correctamente y la regularización resulta en una deuda?</h3>
      <p>Si la regularización determina que cotizaste por debajo del tramo que te correspondía, la Seguridad Social te reclamará la diferencia más los intereses correspondientes. No hay sanción adicional si la diferencia es por una previsión incorrecta de buena fe, pero sí si se detecta que la declaración de ingresos fue deliberadamente inexacta.</p>

      <h3>¿Puedo cotizar por la base máxima aunque mis ingresos sean bajos?</h3>
      <p>Sí. El sistema permite elegir cualquier base de cotización dentro del rango de tu tramo. Si quieres acumular más derechos de jubilación o protección social, puedes cotizar por encima de la base mínima de tu tramo, pagando una cuota mensual mayor.</p>

      <h3>¿Cómo afecta el nuevo sistema a los autónomos con ingresos muy variables?</h3>
      <p>Los autónomos con ingresos estacionales o muy variables son los que más se benefician de la posibilidad de cambiar de tramo hasta 6 veces al año. En meses de alta actividad puedes estar en un tramo superior, y en meses de baja actividad, reducir la cuota cambiando a un tramo inferior.</p>
    </div>
  ),
}
