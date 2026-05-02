import React from "react"
import Link from "next/link"

export const ARTICLES_16_20: Record<string, React.ReactNode> = {
  "facturar-excel-vs-software": (
    <div>
      <p>El 60% de los autónomos españoles todavía factura con Excel o Word. No es un dato sorprendente: cuando empiezas tu actividad, abres la herramienta que ya conoces, copias la plantilla de un compañero y empiezas a emitir facturas. Funciona, o al menos lo parece. Hasta que deja de funcionar.</p>
      <p>Este artículo no pretende atacar a Excel. Es una herramienta extraordinaria para muchas cosas. El problema es que facturar no es una de ellas, y en 2026 las razones para migrar son más urgentes que nunca. Analizamos las ventajas reales de Excel, sus límites críticos y por qué el cambio ya no es opcional.</p>

      <h2>Las ventajas reales de Excel para facturar</h2>
      <p>Seamos honestos. Excel tiene ventajas genuinas que explican por qué la mitad del país lo sigue usando:</p>
      <ul>
        <li><strong>Es gratis (o casi):</strong> si ya tienes Microsoft 365, no pagas nada extra. Google Sheets es completamente gratuito. Para un autónomo que empieza, esto importa.</li>
        <li><strong>Lo conoces:</strong> no hay curva de aprendizaje. Abres el archivo, rellenas las celdas, guardas el PDF. Sin tutoriales, sin onboarding.</li>
        <li><strong>Es flexible:</strong> puedes personalizar absolutamente todo. El diseño, los campos, la estructura. Nadie te impone un formato.</li>
        <li><strong>No depende de internet:</strong> funciona sin conexión, sin suscripción, sin que un servidor esté caído el día que más lo necesitas.</li>
      </ul>
      <p>Estas ventajas son reales. Pero tienen un precio oculto que la mayoría de autónomos no calcula hasta que lo paga.</p>

      <h2>Las desventajas críticas de Excel para facturar</h2>

      <h3>Numeración manual: el primer punto de fallo</h3>
      <p>Las facturas deben llevar numeración correlativa y sin huecos. Con Excel, eres tú quien lleva la cuenta. ¿Cuál fue la última? ¿La 2026-045 o la 2026-046? Si tienes varias carpetas, varios archivos o simplemente un mal día, los errores de numeración son casi inevitables.</p>
      <p>Una numeración incorrecta puede suponer una sanción de entre 150 y 300 euros por factura errónea según el artículo 201 de la Ley General Tributaria. No es una amenaza abstracta: la AEAT comprueba la correlatividad en las inspecciones.</p>

      <h3>Sin cálculo automático fiable de IVA e IRPF</h3>
      <p>Puedes crear fórmulas en Excel para calcular el IVA y la retención de IRPF. Pero esas fórmulas pueden romperse. Alguien edita la celda equivocada, copias la fila sin arrastrar la fórmula, o simplemente escribes el porcentaje incorrecto. El resultado: facturas con errores fiscales que te pueden costar una inspección.</p>
      <p>Un error habitual es aplicar el 21% de IVA a servicios que llevan el 0% (servicios educativos, sanitarios) o viceversa. Sin un sistema que valide el tipo correcto según la categoría, el error depende de tu concentración en el momento de la factura.</p>

      <h3>No cumplirá Verifactu en 2027</h3>
      <p>Este es el argumento definitivo. El Reglamento de Facturación aprobado en 2024 obliga a que todo software de facturación genere un registro electrónico verificable de cada factura, con un código hash SHA-256 y envío a la AEAT. Excel, por definición, no puede hacer esto.</p>
      <p>Si en 2027 sigues facturando con Excel cuando tu obligación sea exigible, cada factura emitida sin el sistema Verifactu puede suponer una infracción grave. La multa por incumplimiento puede llegar a los 50.000 euros en los casos más graves.</p>

      <h3>Sin copias de seguridad automáticas</h3>
      <p>Tu archivo de Excel vive en tu ordenador. Si el disco duro falla, si te roban el portátil, si un ransomware cifra tus datos, perderás todos tus registros de facturación. La AEAT te exige conservar las facturas cuatro años. Si no puedes acreditarlas en una inspección porque se perdieron, el problema es tuyo.</p>

      <h3>Sin historial de pagos ni control de morosidad</h3>
      <p>Excel no sabe si te han pagado o no. Puedes añadir una columna de "cobrado/pendiente", pero no te avisa, no te recuerda y no genera informes. ¿Cuánto te deben tus clientes ahora mismo? ¿Qué factura lleva más de 60 días sin cobrar? Responder esas preguntas con Excel requiere revisar manualmente todas tus facturas.</p>

      <h3>Sin envío directo al cliente</h3>
      <p>Con Excel, el proceso es: terminar la factura, exportar a PDF, abrir el correo, adjuntar el PDF, redactar el email, enviar. Son cinco pasos manuales para cada factura. Con un software de facturación, son uno: hacer clic en "Enviar".</p>

      <h3>No genera informes para la declaración</h3>
      <p>Cada trimestre, cuando llega el modelo 303 o el 130, tienes que sumar manualmente tus facturas del período para conocer tu base imponible y la cuota de IVA. Con Excel, eso puede llevar horas. Un software de facturación te da ese resumen en segundos.</p>

      <h2>Cuánto tiempo pierdes facturando en Excel: el cálculo real</h2>
      <p>Hagamos los números de forma honesta. Una factura en Excel requiere:</p>
      <ul>
        <li>Abrir el archivo y localizar la última factura: 2 minutos</li>
        <li>Copiar la plantilla y actualizar los datos del cliente: 5 minutos</li>
        <li>Verificar la numeración correlativa: 2 minutos</li>
        <li>Calcular y comprobar IVA e IRPF manualmente: 5 minutos</li>
        <li>Exportar a PDF: 2 minutos</li>
        <li>Enviar por email con asunto y texto: 5 minutos</li>
        <li>Anotar en el registro de cobros pendientes: 5 minutos</li>
        <li>Archivar el archivo con nombre correcto: 2 minutos</li>
      </ul>
      <p><strong>Total: 28-35 minutos por factura.</strong></p>
      <p>Con un software de facturación moderno como ClientLabs, el mismo proceso lleva entre 90 segundos y 3 minutos. Seleccionas el cliente, añades las líneas, el sistema calcula todo automáticamente, y con un clic envías el PDF por email y registras la factura en el sistema.</p>
      <p>Si emites 10 facturas al mes, estás perdiendo entre 4 y 5 horas mensuales. Si tu tarifa por hora es de 40 euros, eso son 160-200 euros de tiempo perdido cada mes. Al año: casi 2.400 euros de tu propio tiempo desperdiciado en tareas administrativas que se pueden automatizar.</p>

      <h2>El coste real del "ahorro": cuando un error de IVA cuesta 600 euros</h2>
      <p>Muchos autónomos eligen Excel por el argumento del coste. "Para qué pagar un software si ya tengo Excel gratis". El razonamiento parece lógico hasta que llega la primera sanción.</p>
      <p>La AEAT puede sancionar las infracciones tributarias leves con multas de entre el 50% y el 75% de la cuota no ingresada, con un mínimo de 150 euros por infracción. Un error de IVA en una factura de 1.000 euros con una retención incorrecta puede derivar en una liquidación complementaria más la sanción, resultando fácilmente en 300-600 euros de penalización.</p>
      <p>Además, si en una inspección detectan irregularidades sistemáticas (facturas sin numeración correlativa, errores de cálculo reiterados), la sanción puede escalar significativamente. Un software de facturación profesional cuesta entre 10 y 30 euros al mes. El coste de un solo error supera el coste de dos años de suscripción.</p>

      <h2>Qué incluye un software de facturación profesional que Excel no puede hacer</h2>
      <p>La diferencia no es solo la velocidad. Un software moderno incluye funcionalidades que Excel no puede replicar:</p>
      <ul>
        <li><strong>Numeración automática y correlativa:</strong> el sistema asigna el número correcto sin posibilidad de error.</li>
        <li><strong>Cálculos fiscales validados:</strong> IVA, IRPF y recargo de equivalencia calculados correctamente según el tipo de servicio.</li>
        <li><strong>Cumplimiento Verifactu:</strong> cada factura genera automáticamente el hash criptográfico requerido por la AEAT.</li>
        <li><strong>Envío integrado por email:</strong> PDF profesional enviado directamente desde la plataforma en un clic.</li>
        <li><strong>Control de cobros:</strong> registro de qué facturas están pagadas, pendientes o vencidas.</li>
        <li><strong>Recordatorios automáticos:</strong> aviso al cliente cuando una factura lleva X días sin pagar.</li>
        <li><strong>Informes trimestrales:</strong> resumen de ingresos, IVA repercutido y retenciones para preparar tus declaraciones.</li>
        <li><strong>Copias de seguridad automáticas:</strong> tus datos seguros en la nube, accesibles desde cualquier dispositivo.</li>
        <li><strong>Facturas rectificativas:</strong> corrección de facturas con trazabilidad completa.</li>
        <li><strong>Presupuestos convertibles en facturas:</strong> del presupuesto aceptado a la factura en un clic.</li>
      </ul>

      <h2>La transición: cómo migrar de Excel a software en un fin de semana</h2>
      <p>Muchos autónomos postergan el cambio porque creen que la migración es complicada. No lo es. El proceso completo para un autónomo individual con hasta 100 clientes se puede completar en 3-4 horas.</p>
      <p>Lo que necesitas migrar es esencialmente tu lista de clientes (nombre, NIF, dirección, email). Las facturas antiguas se conservan en PDF y no hace falta importarlas: basta con archivarlas tal y como están.</p>
      <p>Con ClientLabs, el proceso es aún más directo: exportas tu lista de clientes de Excel como CSV, la importas en la plataforma, configuras tus datos fiscales (nombre, NIF, dirección, número de serie de facturación) y ya estás listo para emitir tu primera factura legal. Tiempo estimado: menos de una hora para la mayoría de autónomos.</p>

      <h2>Tabla comparativa: Excel vs Software profesional en 10 criterios</h2>
      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Excel / Word</th>
            <th>Software profesional</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Numeración automática</td>
            <td>No — manual y propensa a errores</td>
            <td>Sí — correlativa y sin huecos</td>
          </tr>
          <tr>
            <td>Cálculo de IVA e IRPF</td>
            <td>Manual — fórmulas que pueden fallar</td>
            <td>Automático y validado</td>
          </tr>
          <tr>
            <td>Cumplimiento Verifactu</td>
            <td>No — incompatible por diseño</td>
            <td>Sí — hash y envío a AEAT automático</td>
          </tr>
          <tr>
            <td>Envío al cliente</td>
            <td>Manual — exportar PDF + email</td>
            <td>En un clic desde la plataforma</td>
          </tr>
          <tr>
            <td>Control de cobros</td>
            <td>No — columna manual sin avisos</td>
            <td>Sí — con recordatorios automáticos</td>
          </tr>
          <tr>
            <td>Copias de seguridad</td>
            <td>No — riesgo de pérdida total</td>
            <td>Sí — automáticas en la nube</td>
          </tr>
          <tr>
            <td>Informes fiscales trimestrales</td>
            <td>No — cálculo manual</td>
            <td>Sí — generados automáticamente</td>
          </tr>
          <tr>
            <td>Acceso desde móvil</td>
            <td>Limitado y poco práctico</td>
            <td>Sí — aplicación responsive</td>
          </tr>
          <tr>
            <td>Coste</td>
            <td>0 euros (aparente)</td>
            <td>10-30 euros/mes</td>
          </tr>
          <tr>
            <td>Tiempo por factura</td>
            <td>25-35 minutos</td>
            <td>2-3 minutos</td>
          </tr>
        </tbody>
      </table>

      <h2>Por qué 2026-2027 hace que el cambio sea urgente</h2>
      <p>Si llevas años facturando con Excel y "no ha pasado nada", tienes razón: hasta ahora, el riesgo era principalmente de errores y sanciones por imprecisiones fiscales. Pero Verifactu cambia el escenario completamente.</p>
      <p>El Reglamento de Facturación exige que a partir de 2025 (para grandes empresas) y 2026-2027 (para autónomos y pymes, según el calendario definitivo de la AEAT) todo software de facturación cumpla los requisitos técnicos de la factura verificada. Excel no puede cumplirlos. Punto.</p>
      <p>Esperar al último momento significa migrar con prisas, sin tiempo para aprender la herramienta, y con el riesgo de emitir facturas no conformes durante el período de transición. Los autónomos que cambien ahora tienen tiempo de familiarizarse con el sistema, importar sus datos con calma y empezar 2027 completamente preparados.</p>
      <p>Si todavía usas Excel para facturar y quieres hacer el cambio sin complicaciones, <Link href="/register">empieza gratis en ClientLabs</Link>. En menos de una hora tendrás tu primera factura legal emitida. Sin tarjeta de crédito, sin compromiso.</p>
      <p>Consulta los <Link href="/precios">planes disponibles</Link> para encontrar el que mejor se adapta a tu volumen de facturación.</p>
    </div>
  ),

  "crear-primera-factura-clientlabs": (
    <div>
      <p>Emitir tu primera factura con un nuevo software siempre genera dudas: ¿estoy configurando bien los datos fiscales? ¿La numeración es correcta? ¿El PDF que se genera cumple los requisitos legales? Este tutorial resuelve todas esas preguntas paso a paso, con capturas del proceso real en ClientLabs.</p>
      <p>Al final de esta guía habrás emitido una factura completamente legal, con los cálculos automáticos de IVA e IRPF correctos, enviada al cliente y registrada en el sistema. Tiempo estimado: 15 minutos la primera vez. Las siguientes: menos de 3 minutos.</p>

      <h2>Qué hace que una factura sea legalmente válida en España</h2>
      <p>Antes de entrar al tutorial, conviene tener claro qué exige la normativa. Según el Reglamento de facturación (Real Decreto 1619/2012) y las modificaciones introducidas por Verifactu, una factura válida debe incluir:</p>
      <ul>
        <li>Número de factura correlativo y sin huecos (dentro de su serie)</li>
        <li>Fecha de emisión</li>
        <li>Fecha de operación si es diferente a la de emisión</li>
        <li>Datos completos del emisor: nombre o razón social, NIF, dirección fiscal completa</li>
        <li>Datos completos del destinatario: nombre o razón social, NIF/CIF, dirección</li>
        <li>Descripción detallada de los bienes o servicios prestados</li>
        <li>Base imponible (precio sin impuestos)</li>
        <li>Tipo de IVA aplicado y cuota resultante</li>
        <li>Tipo de retención de IRPF y cuota retenida (si aplica)</li>
        <li>Importe total a pagar</li>
        <li>A partir de 2027: código de verificación Verifactu y QR de la AEAT</li>
      </ul>
      <p>ClientLabs genera todos estos elementos automáticamente. Tu trabajo es introducir los datos correctos; el sistema hace el resto.</p>

      <h2>Paso 0: Configurar tu cuenta (datos fiscales y número de serie)</h2>
      <p>Antes de crear tu primera factura, debes configurar tu perfil fiscal. Sin estos datos, las facturas no serán válidas. Accede a <strong>Ajustes &gt; Datos fiscales</strong> en el panel de ClientLabs.</p>
      <p>Introduce los siguientes datos con exactamente la misma ortografía que aparecen en el Censo de la AEAT:</p>
      <ul>
        <li><strong>Nombre o razón social:</strong> tu nombre completo como autónomo (ej: "María García López") o el nombre de tu empresa si eres SL</li>
        <li><strong>NIF/CIF:</strong> tu número de identificación fiscal (DNI seguido de la letra, ej: 12345678A)</li>
        <li><strong>Dirección fiscal completa:</strong> calle, número, piso/puerta, código postal, municipio y provincia. Debe coincidir con tu domicilio fiscal en la AEAT.</li>
        <li><strong>Actividad:</strong> descripción de tu actividad profesional para que aparezca en las facturas</li>
      </ul>
      <p>A continuación, configura tu <strong>serie de facturación</strong>. La serie es un prefijo que identifica el tipo de factura. Para autónomos, lo más común es usar el año como prefijo: "2026" o "F-2026". Establece también el <strong>número inicial</strong>: si es tu primera factura del año, será el 1. Si ya has emitido facturas anteriores en otro sistema, el número inicial debe ser el siguiente en la secuencia.</p>
      <p>Importante: no cambies la serie o el número inicial una vez hayas emitido la primera factura. La correlatividad es obligatoria y los huecos en la numeración pueden ser sancionables.</p>

      <h2>Paso 1: Crear o seleccionar el cliente</h2>
      <p>Accede a la sección <strong>Clientes</strong> en el menú lateral. Si el cliente ya existe en tu lista, búscalo por nombre o email y haz clic en su ficha. Si es un cliente nuevo, haz clic en <strong>Nuevo cliente</strong>.</p>
      <p>Para que la factura sea válida, debes introducir al menos:</p>
      <ul>
        <li><strong>Nombre o razón social</strong> del cliente</li>
        <li><strong>NIF/CIF:</strong> obligatorio para clientes empresariales y para aplicar retención de IRPF. Para particulares con los que no apliques retención, puede omitirse en algunos casos, pero es siempre recomendable solicitarlo.</li>
        <li><strong>Dirección fiscal:</strong> necesaria para facturas a empresas y para cualquier factura que supere ciertos umbrales o requiera verificación</li>
        <li><strong>Email:</strong> para el envío directo del PDF</li>
      </ul>
      <p>Una vez guardado el cliente, quedará en tu base de datos para futuras facturas. No tendrás que volver a introducir estos datos.</p>

      <h2>Paso 2: Nueva factura — la interfaz explicada</h2>
      <p>Accede a <strong>Facturas &gt; Nueva factura</strong> o haz clic en el botón "Nueva factura" del panel principal. Se abrirá el formulario de creación con los siguientes bloques:</p>
      <ul>
        <li><strong>Bloque superior izquierdo:</strong> selección del cliente (busca el que creaste en el paso anterior) y fecha de emisión (por defecto, hoy)</li>
        <li><strong>Número de factura:</strong> se asigna automáticamente. Puedes ver el número que se asignará antes de guardar. No lo modifiques manualmente a menos que haya una razón específica.</li>
        <li><strong>Fecha de operación:</strong> si el servicio se prestó en una fecha diferente a la de emisión, indícala aquí. Si no, déjala igual que la fecha de emisión.</li>
        <li><strong>Método de pago y plazo:</strong> transferencia bancaria, efectivo, tarjeta, o el que corresponda. Puedes indicar el plazo de pago (30, 60, 90 días) para que el sistema controle los vencimientos.</li>
      </ul>

      <h2>Paso 3: Añadir líneas de factura</h2>
      <p>Este es el núcleo de la factura. Haz clic en <strong>Añadir línea</strong> para agregar cada concepto facturado. Cada línea incluye:</p>
      <ul>
        <li><strong>Descripción:</strong> describe el servicio o producto de forma clara y específica. No uses descripciones genéricas como "servicios profesionales". Escribe: "Diseño de identidad corporativa para proyecto X — octubre 2026" o "Consultoría estratégica — 3 sesiones de 2 horas". Una descripción clara reduce las consultas de clientes y es importante en caso de disputa o inspección.</li>
        <li><strong>Cantidad:</strong> número de unidades, horas, días u otras unidades de medida. Si facturas un proyecto cerrado, usa 1.</li>
        <li><strong>Precio unitario:</strong> precio de cada unidad sin impuestos (base imponible por unidad).</li>
        <li><strong>Tipo de IVA:</strong> selecciona el porcentaje correcto. El 21% es el tipo general para la mayoría de servicios profesionales. El 10% aplica a hostelería, transporte de viajeros y algunos servicios. El 0% aplica a servicios educativos reglados, ciertos servicios sanitarios y otros casos específicos. Si tienes dudas, consulta con tu asesor.</li>
        <li><strong>Retención de IRPF:</strong> si el cliente es una empresa o autónomo español (no un particular ni una empresa extranjera), aplica la retención del 15% (o 7% si estás en tus dos primeros años de actividad). Si el cliente es un particular o una empresa extranjera, la retención es 0%.</li>
      </ul>
      <p>Puedes añadir tantas líneas como necesites. Cada línea calcula su subtotal automáticamente. Si tienes un descuento global, existe un campo específico para aplicarlo al total de la factura.</p>

      <h2>Paso 4: Revisar los cálculos automáticos</h2>
      <p>En la parte inferior derecha del formulario verás el resumen fiscal de la factura en tiempo real. Conforme añades líneas, los valores se actualizan automáticamente:</p>
      <ul>
        <li><strong>Base imponible:</strong> suma de todos los conceptos antes de impuestos. Es el valor sobre el que se calculan el IVA y la retención.</li>
        <li><strong>IVA total:</strong> cuota de IVA resultante (base imponible × tipo de IVA). Si tienes líneas con distintos tipos de IVA, se desglosarán por tipo.</li>
        <li><strong>Retención IRPF:</strong> importe que el cliente retendrá y pagará en tu nombre a la AEAT. Este importe se resta del total a pagar.</li>
        <li><strong>Total a pagar:</strong> lo que el cliente debe ingresarte. La fórmula es: Base imponible + IVA - Retención IRPF.</li>
      </ul>
      <p>Revisa que estos valores son correctos antes de guardar. Un error en este punto, aunque se puede corregir con una factura rectificativa, es una complicación innecesaria.</p>

      <h2>Paso 5: Personalizar la factura</h2>
      <p>ClientLabs permite añadir tu identidad visual a las facturas sin necesidad de conocimientos de diseño. Accede a <strong>Ajustes &gt; Personalización</strong> para configurar:</p>
      <ul>
        <li><strong>Logo:</strong> sube el logo de tu negocio en formato PNG o SVG. Aparecerá en la cabecera del PDF. Si no tienes logo, el sistema usará tu nombre o razón social como texto.</li>
        <li><strong>Color de acento:</strong> puedes elegir el color principal del PDF para que coincida con tu identidad de marca.</li>
        <li><strong>Datos de contacto adicionales:</strong> teléfono, web, redes sociales. Aparecerán en el pie de página del PDF.</li>
        <li><strong>Notas al pie:</strong> texto que aparece en todas tus facturas. Útil para incluir información sobre condiciones de pago, datos bancarios para la transferencia (IBAN) o cualquier aviso legal.</li>
        <li><strong>Datos bancarios:</strong> configura tu IBAN para que aparezca en las facturas de forma automática. Así el cliente sabe a qué cuenta hacer la transferencia sin necesidad de que lo incluyas manualmente en cada factura.</li>
      </ul>

      <h2>Paso 6: Guardar y enviar al cliente</h2>
      <p>Una vez revisados todos los datos, tienes dos opciones:</p>
      <ul>
        <li><strong>Guardar borrador:</strong> guarda la factura sin emitirla. El número de factura no se asigna todavía. Útil si necesitas revisar algo antes de enviar.</li>
        <li><strong>Emitir y enviar:</strong> asigna el número correlativo definitivo, genera el PDF con el código Verifactu (si está activado), y envía el email al cliente automáticamente.</li>
      </ul>
      <p>Al hacer clic en <strong>Emitir y enviar</strong>, el sistema abre un modal con la previsualización del email. El asunto y el cuerpo del mensaje ya están pre-rellenados con el número de factura, el total y tu nombre, pero puedes editarlos antes de enviar. El PDF se adjunta automáticamente.</p>
      <p>Una vez enviada, la factura queda en estado "Enviada" en tu panel. El número de factura queda bloqueado y no se puede reasignar.</p>

      <h2>Paso 7: Registrar el cobro cuando el cliente pague</h2>
      <p>Cuando el cliente realice el pago, accede a la factura en <strong>Facturas</strong> y haz clic en <strong>Registrar cobro</strong>. Indica la fecha de cobro y el importe recibido (que puede ser parcial si se paga en plazos). La factura pasará al estado "Cobrada" y desaparecerá de la lista de pendientes.</p>
      <p>Este registro es importante por dos razones: te permite saber en tiempo real cuánto dinero tienes pendiente de cobro, y el sistema puede enviarte alertas cuando una factura lleva demasiado tiempo sin cobrar.</p>

      <h2>Cómo ClientLabs genera automáticamente el código de control Verifactu</h2>
      <p>A partir de la activación de Verifactu en tu cuenta, cada factura emitida genera automáticamente un registro electrónico. El proceso es invisible para ti: en el momento en que haces clic en "Emitir", el sistema calcula un hash SHA-256 de los datos de la factura (emisor, destinatario, número, fecha, importe), lo incluye en el código QR que aparece en el PDF y lo registra en la cadena de facturas verificadas.</p>
      <p>El cliente puede escanear el QR con su móvil y verificar que la factura es auténtica y no ha sido manipulada. La AEAT también puede verificarlo en cualquier momento.</p>
      <p>Si emites una factura sin conexión a internet, el sistema la marca como pendiente de sincronización y la registra en la AEAT en cuanto se restaura la conexión. La factura sigue siendo válida.</p>

      <h2>Errores comunes al crear la primera factura y cómo evitarlos</h2>
      <ul>
        <li><strong>NIF del cliente incorrecto:</strong> verifica siempre el NIF antes de emitir. Un NIF erróneo invalida la factura para el cliente a efectos de deducción de IVA.</li>
        <li><strong>Dirección fiscal desactualizada:</strong> si el cliente ha cambiado de domicilio, la dirección antigua puede crear problemas. Actualiza la ficha del cliente antes de facturar.</li>
        <li><strong>Aplicar retención a un particular:</strong> la retención de IRPF solo aplica cuando el destinatario es un empresario o profesional que actúa en el ejercicio de su actividad. Nunca a particulares que contratan como consumidores.</li>
        <li><strong>Olvidar indicar el IBAN:</strong> si el cliente paga por transferencia y no incluyes tu número de cuenta en la factura, lo más probable es que te escriba para pedirlo, lo que retrasa el cobro.</li>
        <li><strong>Descripción demasiado vaga:</strong> "Servicios del mes de octubre" no describe qué se ha facturado. En caso de disputa o inspección, una descripción vaga no ayuda. Sé específico.</li>
      </ul>

      <h2>Qué hacer si necesitas modificar una factura ya enviada</h2>
      <p>Una vez emitida y enviada una factura, no se puede editar directamente. Esto es intencional: modificar una factura ya emitida sin dejar rastro es una irregularidad fiscal. La solución correcta es una <strong>factura rectificativa</strong>.</p>
      <p>En ClientLabs, accede a la factura que quieres corregir y haz clic en <strong>Crear rectificativa</strong>. El sistema generará automáticamente una factura rectificativa que referencia a la original, con los datos corregidos. La factura original queda en el historial y la rectificativa queda vinculada a ella, manteniendo la trazabilidad completa.</p>
      <p>Las rectificativas también tienen numeración correlativa propia (generalmente con un prefijo "R" o en una serie separada). ClientLabs lo gestiona automáticamente.</p>
      <p>Si aún no tienes tu cuenta, <Link href="/register">empieza gratis en ClientLabs</Link> y emite tu primera factura legal en menos de 10 minutos. Sin tarjeta de crédito. Consulta los <Link href="/precios">planes disponibles</Link> si quieres ver qué incluye cada opción.</p>
    </div>
  ),

  "gestionar-leads-clientlabs": (
    <div>
      <p>Conseguir clientes no es un acto puntual. Es un proceso: alguien descubre tus servicios, muestra interés, mantiene conversaciones contigo, recibe una propuesta y, si todo va bien, se convierte en cliente. Ese proceso, desde el primer contacto hasta el cierre, es lo que en ventas llamamos el pipeline.</p>
      <p>El problema de la mayoría de autónomos es que ese proceso existe, pero no está sistematizado. Los leads viven en notas del móvil, emails sin responder y conversaciones de WhatsApp. Cuando hay dos o tres leads simultáneos, la situación es manejable. Cuando son diez, alguno se cae. Y ese que se cae podría haber sido tu mejor cliente del año.</p>
      <p>Esta guía explica cómo funciona el sistema de gestión de leads de ClientLabs y cómo usarlo para aumentar tu tasa de conversión de forma sistemática.</p>

      <h2>Qué es el pipeline de ClientLabs y cómo funciona</h2>
      <p>El pipeline es una representación visual de tu proceso comercial. Imagina un tablero con columnas: cada columna es una etapa del proceso, y cada tarjeta dentro de la columna es un lead que está en esa etapa. De un vistazo, sabes dónde está cada oportunidad y qué necesitas hacer a continuación.</p>
      <p>En ClientLabs, el pipeline funciona con un tablero Kanban que puedes actualizar arrastrando tarjetas entre columnas o cambiando el estado directamente desde la ficha del lead. Cada movimiento queda registrado en el historial de actividad del lead.</p>

      <h2>Los 5 estados del pipeline</h2>
      <p>ClientLabs organiza el proceso comercial en cinco estados que cubren el ciclo completo desde el primer contacto hasta el cierre:</p>
      <ul>
        <li><strong>Nuevo:</strong> el lead acaba de entrar. Todavía no has tenido contacto con él. Acción requerida: primer contacto en menos de 24 horas. Los leads que tardan más de un día en recibir respuesta tienen una tasa de conversión hasta un 21 veces menor según estudios del sector.</li>
        <li><strong>Contactado:</strong> has enviado el primer mensaje o llamado. Estás esperando respuesta. Si no responde en 48-72 horas, es el momento de intentar un segundo canal (si te contactó por email, prueba con LinkedIn o viceversa).</li>
        <li><strong>Reunion:</strong> tienes una reunión o llamada agendada. Es la etapa de mayor intención de compra. Antes de la reunión, investiga al lead: su negocio, sus posibles necesidades, sus competidores. Llega preparado.</li>
        <li><strong>Propuesta:</strong> has enviado una propuesta económica. El lead está evaluando. Seguimiento a los 3 días si no hay respuesta. No esperes a que "te llamen si están interesados": el 80% de los cierres requieren seguimiento activo.</li>
        <li><strong>Cerrado:</strong> el lead ha aceptado. En este punto, puedes convertirlo en cliente dentro de ClientLabs con un solo clic, lo que activa la ficha de cliente y te permite empezar a facturarle directamente.</li>
      </ul>
      <p>Hay también un estado especial: <strong>Perdido</strong>. No es un estado del pipeline activo, sino un archivo donde registras los leads que no cerraron y el motivo (precio, timings, eligió a otro proveedor). Este historial es valioso para analizar qué está fallando en tu proceso comercial.</p>

      <h2>Cómo capturar un lead manualmente</h2>
      <p>El método más directo: accede a <strong>Leads &gt; Nuevo lead</strong> y rellena el formulario. Los campos mínimos son nombre y email o teléfono. Pero cuantos más datos añadas desde el inicio, más completa será la ficha y más fácil el seguimiento.</p>
      <p>Campos recomendados al crear un lead:</p>
      <ul>
        <li><strong>Nombre y empresa:</strong> quién es y a qué se dedica</li>
        <li><strong>Origen:</strong> cómo llegó a ti (LinkedIn, referido, web, evento, etc.). Este dato es crucial para saber qué canales te generan más leads de calidad.</li>
        <li><strong>Servicio de interés:</strong> qué tipo de servicio necesita, aunque sea de forma aproximada</li>
        <li><strong>Presupuesto estimado:</strong> si tienes alguna pista, anótala. Filtra conversaciones largas que acaben en "no tenemos presupuesto"</li>
        <li><strong>Notas iniciales:</strong> el contexto de la primera conversación. Lo que te dijo en el primer contacto.</li>
      </ul>
      <p>El lead se creará en estado "Nuevo" y aparecerá en la primera columna de tu pipeline.</p>

      <h2>Cómo capturar leads automáticamente desde tu web</h2>
      <p>ClientLabs incluye un SDK de captación que puedes integrar en tu web para capturar leads directamente desde formularios de contacto. Cuando alguien rellena el formulario de tu web, el lead aparece automáticamente en tu pipeline en estado "Nuevo", sin que tengas que hacer nada manual.</p>
      <p>La integración requiere añadir un fragmento de código JavaScript en tu web y configurar el mapeo de campos (nombre, email, teléfono, mensaje). La documentación de integración está disponible en <strong>Ajustes &gt; Integraciones &gt; SDK Web</strong>. Para la mayoría de webs en WordPress, Wix o Webflow, la integración se completa en menos de 30 minutos.</p>
      <p>Una vez configurado, recibirás una notificación cada vez que llegue un nuevo lead desde tu web.</p>

      <h2>Cómo asignar una puntuación (score) a cada lead</h2>
      <p>No todos los leads merecen la misma atención. El scoring te permite priorizar los leads con más probabilidad de conversión para centrar tu energía donde tiene más impacto.</p>
      <p>En la ficha de cada lead, puedes asignar una puntuación del 1 al 5. El criterio es tuyo, pero una forma práctica de puntuarlos es con la metodología BANT (Budget, Authority, Need, Timeline):</p>
      <ul>
        <li><strong>Budget (Presupuesto):</strong> ¿tiene capacidad económica para contratar tus servicios?</li>
        <li><strong>Authority (Autoridad):</strong> ¿es quien toma las decisiones de compra, o hay alguien por encima?</li>
        <li><strong>Need (Necesidad):</strong> ¿tiene un problema real que tú resuelves, o es solo curiosidad?</li>
        <li><strong>Timeline (Tiempo):</strong> ¿necesita contratar en los próximos 30 días, o es algo para "el año que viene"?</li>
      </ul>
      <p>Un lead que cumple los cuatro criterios merece un score de 5 y atención prioritaria. Un lead con presupuesto insuficiente o sin urgencia real puede esperar. El pipeline de ClientLabs te permite filtrar por score para ver siempre tus oportunidades más calientes.</p>

      <h2>El seguimiento: recordatorios automáticos y tareas vinculadas</h2>
      <p>La característica que más impacto tiene en la tasa de conversión es el sistema de seguimiento. En la ficha de cada lead, puedes crear tareas vinculadas con fecha y hora de vencimiento. Ejemplos prácticos:</p>
      <ul>
        <li>"Llamar el martes a las 10:00 para hacer seguimiento de la propuesta"</li>
        <li>"Enviar casos de éxito relevantes el viernes"</li>
        <li>"Confirmar si recibió el presupuesto y si tiene preguntas — en 3 días"</li>
      </ul>
      <p>ClientLabs te enviará un recordatorio por email antes del vencimiento de la tarea. Además, el sistema detecta automáticamente los leads "estancados": si un lead lleva más de X días sin actividad (configurable en tus ajustes), recibirás una alerta para que retomes el contacto.</p>
      <p>Este sistema elimina el principal motivo por el que se pierden oportunidades: el olvido.</p>

      <h2>Cómo añadir notas e historial de contacto</h2>
      <p>Cada interacción con el lead debería quedar registrada. En la ficha del lead, la sección <strong>Actividad</strong> muestra el historial cronológico de todo lo que ha pasado: cuándo se creó, en qué estados ha estado, qué tareas se han completado y las notas que has añadido manualmente.</p>
      <p>Para añadir una nota, haz clic en <strong>Añadir nota</strong> e introduce el resumen de la conversación. Algunos ejemplos de qué anotar:</p>
      <ul>
        <li>El contenido principal de una reunión o llamada</li>
        <li>Las objeciones que planteó el lead</li>
        <li>Los plazos o condiciones que mencionó</li>
        <li>Información personal relevante (empresa en crecimiento, cambiaron de dirección, tienen un proyecto urgente)</li>
      </ul>
      <p>Si retomas el contacto semanas después, el historial te pone en contexto en segundos. No tienes que recordar nada: está todo ahí.</p>

      <h2>Convertir un lead en cliente: el momento del cierre</h2>
      <p>Cuando el lead acepta la propuesta, mueve su tarjeta al estado <strong>Cerrado</strong> y haz clic en <strong>Convertir en cliente</strong>. Este proceso crea automáticamente una ficha de cliente con todos los datos del lead importados: nombre, empresa, email, teléfono, historial de contacto.</p>
      <p>A partir de ese momento, el cliente aparece en tu sección de <strong>Clientes</strong> y puedes empezar a crearle facturas directamente desde su ficha. El historial del lead, incluyendo las conversaciones y notas, queda vinculado a la ficha del cliente para referencia futura.</p>

      <h2>El dashboard de conversión: las métricas que importan</h2>
      <p>En <strong>Leads &gt; Informes</strong> encontrarás el dashboard de métricas del pipeline. Las más importantes para un autónomo son:</p>
      <ul>
        <li><strong>Tasa de conversión global:</strong> porcentaje de leads que terminan convirtiéndose en clientes. Una tasa del 20-30% es saludable para servicios profesionales. Si estás por debajo del 10%, hay algo que revisar en el proceso (propuesta, pricing, segmento objetivo).</li>
        <li><strong>Valor medio del lead:</strong> importe promedio de los proyectos cerrados. Este dato, combinado con la tasa de conversión, te dice cuántos leads necesitas para alcanzar tu objetivo de facturación mensual.</li>
        <li><strong>Tiempo medio de cierre:</strong> cuántos días pasan desde que entra un lead hasta que se cierra. Si tus cierres tardan 45 días de media, necesitas tener leads en pipeline con 45 días de antelación para tener ingresos en el momento que los necesitas.</li>
        <li><strong>Origen de los mejores leads:</strong> qué canal te trae los leads que más acaban convirtiendo. Con este dato, puedes dejar de invertir tiempo en canales que no funcionan y doblar en los que sí.</li>
      </ul>

      <h2>Automatizaciones: email de bienvenida cuando entra un lead</h2>
      <p>Con el plan correspondiente, ClientLabs permite configurar automatizaciones que se disparan en función de eventos del pipeline. Una de las más útiles es el <strong>email de bienvenida automático</strong>: cuando un nuevo lead entra en el pipeline (ya sea manualmente o desde el formulario web), el sistema envía automáticamente un email personalizado confirmando que has recibido su consulta y cuándo te pondrás en contacto.</p>
      <p>Este automatismo tiene un impacto directo en la percepción profesional: el lead recibe una respuesta inmediata incluso si tú estás ocupado o fuera de horario. Según estudios de HubSpot, responder en los primeros 5 minutos multiplica por 9 la probabilidad de contactar al lead con éxito.</p>

      <h2>Consejos para aumentar tu tasa de conversión con ClientLabs</h2>
      <ul>
        <li><strong>Contacta siempre en las primeras 24 horas:</strong> los leads se enfrían rápido. Si pasan más de 24 horas antes de tu primer contacto, la probabilidad de cierre se reduce drásticamente.</li>
        <li><strong>Usa el historial antes de cada conversación:</strong> revisar las notas antes de llamar o escribir te permite personalizar la conversación y demostrar que recuerdas los detalles. Los clientes lo notan.</li>
        <li><strong>No abandones leads en etapa de propuesta sin seguimiento:</strong> el silencio del cliente no significa un "no". Significa que está ocupado o que necesita un empujoncito. El seguimiento a los 3 y 7 días cierra más del 30% de los presupuestos que parecían perdidos.</li>
        <li><strong>Registra siempre el motivo de pérdida:</strong> cuando pierdas un lead, anota por qué. Después de 20-30 pérdidas, los patrones se vuelven evidentes. Si el 60% dice que es caro, tienes un problema de positioning o de target. Si el 60% dice que eligió a otro, tienes un problema de diferenciación.</li>
        <li><strong>Revisa el pipeline cada mañana:</strong> 10 minutos diarios con el pipeline valen más que dos horas semanales. La constancia en el seguimiento es lo que separa a los autónomos con la agenda llena de los que siempre están buscando el próximo cliente.</li>
      </ul>
      <p>Si quieres empezar a gestionar tus leads de forma sistemática, <Link href="/register">crea tu cuenta gratuita en ClientLabs</Link> y ten tu pipeline configurado en menos de 15 minutos. Consulta los <Link href="/precios">planes disponibles</Link> para ver qué nivel de automatización necesitas.</p>
    </div>
  ),

  "clientlabs-verifactu-facturacion-legal": (
    <div>
      <p>Desde que la AEAT anunció el nuevo Reglamento de facturación (aprobado mediante Real Decreto 1007/2023), el término "Verifactu" se repite en todos los foros de autónomos españoles. Muchos lo han oído, pocos entienden exactamente qué implica, y menos aún han tomado medidas concretas.</p>
      <p>Este artículo explica qué es Verifactu de forma práctica, cómo funciona dentro de ClientLabs y qué debes hacer tú como autónomo para estar en regla. Sin tecnicismos innecesarios, sin alarmismo, con los datos reales.</p>

      <h2>Qué significa que ClientLabs sea "compatible con Verifactu"</h2>
      <p>La compatibilidad con Verifactu no es un sello de calidad opcional ni un distintivo de marketing. Es un requisito técnico legal: a partir de los plazos establecidos por la AEAT, todo sistema informático de facturación debe cumplir los requisitos del Reglamento de facturación para software (RRSF). Un software que no cumple no puede usarse para facturar legalmente en España.</p>
      <p>Cuando decimos que ClientLabs es compatible con Verifactu, significa concretamente que:</p>
      <ul>
        <li>Cada factura genera automáticamente un registro electrónico con la estructura requerida por la AEAT</li>
        <li>Ese registro incluye un código hash criptográfico que garantiza la integridad de la factura</li>
        <li>El sistema mantiene una cadena de registros inalterable que conecta cada factura con la anterior</li>
        <li>Los registros pueden enviarse a la AEAT en tiempo real (modalidad Verifactu) o pueden quedar disponibles para consulta bajo requerimiento (modalidad no Verifactu)</li>
        <li>Cada factura incluye un código QR que permite verificar su autenticidad</li>
      </ul>
      <p>Esto no cambia el proceso de facturación para ti. Sigues creando facturas exactamente igual que antes. El cumplimiento técnico ocurre en segundo plano, de forma completamente transparente.</p>

      <h2>Cómo funciona técnicamente Verifactu en ClientLabs (sin tecnicismos)</h2>

      <h3>El hash SHA-256: una huella dactilar de cada factura</h3>
      <p>Cuando emites una factura en ClientLabs, el sistema genera automáticamente un hash SHA-256 de sus datos. Un hash es una "huella digital" matemática: a partir de los datos de la factura (emisor, destinatario, número, fecha, importe, tipo de IVA...) se calcula un código alfanumérico único. Si se modifica cualquier dato de la factura, aunque sea un espacio o un céntimo, el hash cambia completamente.</p>
      <p>Esto hace imposible modificar una factura emitida sin que el cambio sea detectable. La AEAT puede verificar en cualquier momento que la factura no ha sido alterada desde su emisión.</p>

      <h3>El encadenamiento: cada factura apunta a la anterior</h3>
      <p>Además del hash propio, cada factura incluye en su registro el hash de la factura anterior. Esto crea una "cadena" de facturas en la que cualquier modificación o inserción retroactiva es matemáticamente detectable. No puedes insertar una factura falsa entre dos facturas reales sin romper la cadena.</p>

      <h3>El código QR: verificación instantánea para el receptor</h3>
      <p>Cada PDF generado por ClientLabs incluye un código QR en el pie de página. Este QR contiene la información de verificación de la factura: número, fecha, importe, NIF del emisor y el hash. Cualquier persona con un lector de QR puede verificar que la factura es auténtica escaneando ese código. Si la factura ha sido manipulada, la verificación fallará.</p>

      <h3>El envío a la AEAT en tiempo real</h3>
      <p>En la modalidad Verifactu (la que recomienda y en muchos casos exige la AEAT), cada registro de factura se envía automáticamente a los servidores de la Agencia Tributaria en el momento de la emisión. La AEAT confirma la recepción con un sello de tiempo que queda vinculado al registro.</p>
      <p>Si emites una factura sin conexión a internet, el registro se almacena localmente y se envía en cuanto se restaura la conexión. La factura sigue siendo válida; simplemente el envío a la AEAT se retrasa hasta que hay conectividad.</p>

      <h2>Paso a paso: cómo activar Verifactu en tu cuenta de ClientLabs</h2>
      <p>La activación de Verifactu en ClientLabs está diseñada para ser lo más sencilla posible. No requiere conocimientos técnicos ni gestiones con la AEAT.</p>
      <ol>
        <li><strong>Accede a Ajustes &gt; Facturación &gt; Verifactu.</strong> Encontrarás el panel de configuración con el estado actual (activo/inactivo).</li>
        <li><strong>Verifica que tus datos fiscales están completos.</strong> El sistema comprobará que tienes introducido el NIF, nombre o razón social y dirección fiscal completa. Sin estos datos, Verifactu no puede activarse correctamente.</li>
        <li><strong>Selecciona la modalidad:</strong> "Verifactu" (envío automático en tiempo real a la AEAT) o "No Verifactu" (registros locales disponibles para requerimiento). Para autónomos y pymes, se recomienda la modalidad Verifactu por su simplicidad: no tienes que gestionar nada manualmente.</li>
        <li><strong>Activa el interruptor.</strong> El sistema ejecutará una verificación de configuración y confirmará la activación. A partir de ese momento, todas las facturas que emitas incluirán el código de control Verifactu y el QR de verificación.</li>
        <li><strong>Comprueba con una factura de prueba.</strong> Emite una factura de 0 euros (o usa la función de vista previa) para comprobar que el QR aparece correctamente en el PDF y que los datos son los correctos.</li>
      </ol>
      <p>La activación no afecta a las facturas anteriores. Las facturas emitidas antes de activar Verifactu no tendrán el código de control, pero eso es correcto: solo son exigibles en las facturas emitidas a partir de los plazos legales.</p>

      <h2>Qué ven tus clientes cuando reciben una factura Verifactu de ClientLabs</h2>
      <p>Para tus clientes, el cambio más visible es la presencia del código QR en el pie de la factura. El QR viene acompañado de un texto similar a "Factura verificable conforme al Reglamento de facturación. Verifique su autenticidad en [URL de la AEAT]".</p>
      <p>Los clientes empresariales que reciben tus facturas pueden escanear ese QR para:</p>
      <ul>
        <li>Verificar que la factura es auténtica (no una falsificación o modificación)</li>
        <li>Confirmar los datos del emisor, fecha e importe sin necesidad de contactarte</li>
        <li>Obtener el registro oficial de la AEAT para sus propias comprobaciones fiscales</li>
      </ul>
      <p>En la práctica, la mayoría de clientes no escanearán el QR en cada factura. Pero su presencia transmite profesionalidad y cumplimiento legal. Es un elemento de confianza, especialmente con clientes grandes que tienen departamentos fiscales.</p>

      <h2>Cómo verificar que tus facturas antiguas están en regla</h2>
      <p>Verifactu aplica a las facturas emitidas a partir de los plazos legales. Las facturas anteriores a esos plazos no necesitan cumplir los requisitos técnicos del RRSF, siempre que cumplieran la normativa vigente en el momento de su emisión.</p>
      <p>Si tienes dudas sobre si tus facturas anteriores son correctas, revisa que incluyen los campos obligatorios: número correlativo, fecha, datos del emisor y receptor, descripción del servicio, base imponible, tipo de IVA, cuota de IVA y, si aplica, retención de IRPF. Si las emitiste con un software o plantilla estándar que incluía estos campos, muy probablemente estén en regla.</p>
      <p>Para mayor seguridad, conserva siempre las facturas antiguas en formato PDF junto con cualquier registro de envío o confirmación de recepción del cliente.</p>

      <h2>Preguntas frecuentes</h2>

      <h3>¿Qué pasa si emito una factura sin internet?</h3>
      <p>ClientLabs gestiona este caso automáticamente. Si no hay conexión en el momento de la emisión, la factura se genera con todos los datos correctos y el hash de control. El registro se almacena localmente y se envía a la AEAT en cuanto se recupera la conexión. Aparecerá en tu panel con el estado "Pendiente de sincronización" hasta entonces.</p>
      <p>La factura es completamente válida desde el momento de su emisión. El envío a la AEAT es la parte que queda diferida, no la validez de la factura en sí.</p>

      <h3>¿Puedo anular una factura Verifactu?</h3>
      <p>No se puede eliminar una factura ya emitida en un sistema Verifactu: el registro es inmutable. Lo que sí puedes hacer es emitir una <strong>factura rectificativa</strong> que anule la original. Esta rectificativa también se registra en la cadena Verifactu y se envía a la AEAT.</p>
      <p>En ClientLabs, el proceso de crear una factura rectificativa está integrado en la propia factura: accede a la factura que quieres anular y haz clic en "Crear rectificativa". El sistema lo gestiona automáticamente.</p>

      <h3>¿Puedo usar Verifactu si soy autónomo acogido a la franquicia de IVA?</h3>
      <p>Sí. Los autónomos acogidos a la franquicia de IVA (exentos de repercutir IVA por facturar menos de 85.000 euros) también están obligados a cumplir con Verifactu en los plazos que les correspondan. El sistema simplemente refleja que la factura lleva un 0% de IVA por acogerse a la franquicia, pero los requisitos de registro y control son los mismos.</p>

      <h3>¿Qué pasa si mi software actual no es compatible con Verifactu?</h3>
      <p>A partir del plazo de obligatoriedad para tu tramo, emitir facturas con un software no compatible es una infracción tributaria. Las sanciones pueden ir desde multas fijas hasta porcentajes sobre el importe de las facturas no conformes. La recomendación es migrar antes de que llegue el plazo, no el día antes.</p>

      <h2>Los plazos reales: cuándo es obligatorio para ti</h2>
      <p>El calendario de obligatoriedad de Verifactu está establecido por tipo de contribuyente:</p>
      <ul>
        <li><strong>Grandes empresas (facturación superior a 6 millones de euros):</strong> obligación desde el 1 de julio de 2025.</li>
        <li><strong>Resto de empresas y autónomos:</strong> obligación desde el 1 de enero de 2026 (fecha aplicable a la mayoría de autónomos españoles, conforme al último calendario publicado por la AEAT).</li>
        <li><strong>Contribuyentes acogidos al régimen de módulos:</strong> plazos específicos según su situación. Consulta con tu asesor o en la sede electrónica de la AEAT.</li>
      </ul>
      <p>Es importante verificar las fechas exactas directamente con la AEAT, ya que pueden sufrir modificaciones. En cualquier caso, prepararse ahora es siempre mejor que hacerlo a última hora.</p>

      <h2>Por qué prepararse ahora y no esperar al último momento</h2>
      <p>Migrar a un sistema Verifactu a última hora presenta riesgos concretos:</p>
      <ul>
        <li><strong>Curva de aprendizaje:</strong> aunque ClientLabs está diseñado para ser intuitivo, cualquier cambio de herramienta requiere adaptación. Hacerlo con el plazo encima aumenta el estrés y la probabilidad de errores.</li>
        <li><strong>Migración de datos:</strong> importar tu base de clientes con calma es muy diferente a hacerlo con prisa. Los errores en los datos fiscales de los clientes (NIF incorrecto, dirección desactualizada) generan problemas en las facturas.</li>
        <li><strong>Tiempo de prueba:</strong> conviene usar el sistema unos meses antes de que sea obligatorio para detectar cualquier configuración incorrecta sin consecuencias legales.</li>
        <li><strong>Saturación de los servicios de soporte:</strong> cuando el plazo se acerque, todos los autónomos que han esperado intentarán migrar al mismo tiempo. Los tiempos de respuesta de soporte se disparan.</li>
      </ul>

      <h2>Comparativa: sistemas compatibles vs no compatibles con Verifactu</h2>
      <table>
        <thead>
          <tr>
            <th>Caracteristica</th>
            <th>Excel / plantillas manuales</th>
            <th>Software no compatible</th>
            <th>ClientLabs (compatible)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hash SHA-256 por factura</td>
            <td>No</td>
            <td>No</td>
            <td>Automatico</td>
          </tr>
          <tr>
            <td>Cadena de registros inalterable</td>
            <td>No</td>
            <td>No</td>
            <td>Si</td>
          </tr>
          <tr>
            <td>QR de verificacion en PDF</td>
            <td>No</td>
            <td>Depende</td>
            <td>Si, en todas las facturas</td>
          </tr>
          <tr>
            <td>Envio automatico a la AEAT</td>
            <td>No</td>
            <td>No</td>
            <td>Si, en tiempo real</td>
          </tr>
          <tr>
            <td>Funcionamiento sin internet</td>
            <td>Si (pero sin registro)</td>
            <td>Si (pero sin registro)</td>
            <td>Si, con sincronizacion posterior</td>
          </tr>
          <tr>
            <td>Validez legal a partir de 2026</td>
            <td>No</td>
            <td>No (si no esta certificado)</td>
            <td>Si</td>
          </tr>
        </tbody>
      </table>
      <p>Si quieres asegurarte de que tu facturación cumple con Verifactu desde hoy, <Link href="/register">crea tu cuenta gratuita en ClientLabs</Link>. La activación de Verifactu está incluida en todos los planes. Consulta los <Link href="/precios">planes disponibles</Link> para ver todas las funcionalidades incluidas.</p>
    </div>
  ),

  "migrar-excel-clientlabs": (
    <div>
      <p>Si llevas tiempo facturando con Excel y has decidido dar el paso a un software profesional, la buena noticia es que la migración es mucho más sencilla de lo que parece. Este tutorial te guía por el proceso completo, paso a paso, con tiempos reales y soluciones a los problemas más comunes.</p>
      <p>No necesitas conocimientos técnicos. No necesitas tarjeta de crédito. Y en la mayoría de los casos, en menos de una hora tendrás tu cuenta configurada y estarás listo para emitir tu primera factura legal en ClientLabs.</p>

      <h2>Por qué migrar ahora (y no en 2027)</h2>
      <p>Hay dos razones de peso para no esperar:</p>
      <p><strong>Verifactu:</strong> a partir de 2026 (para la mayoría de autónomos) o 2027, tu software de facturación debe cumplir los requisitos técnicos del Reglamento de Facturación. Excel y las plantillas de Word no pueden cumplirlos por diseño. Si esperas al último momento, migrarás con prisa y con el riesgo de emitir facturas no conformes durante el período de transición.</p>
      <p><strong>Tiempo y dinero:</strong> si emites 8-10 facturas al mes, estás perdiendo entre 3 y 4 horas mensuales en tareas manuales que se pueden automatizar. Eso son 40-50 horas al año. Migrar ahora empieza a recuperar ese tiempo desde el primer mes.</p>

      <h2>Qué necesitas antes de empezar</h2>
      <p>La migración requiere preparar cuatro elementos. Conviene tenerlos listos antes de crear la cuenta para que el proceso sea fluido:</p>
      <ul>
        <li><strong>Tu lista de clientes en Excel:</strong> necesitas los datos de cada cliente con el que hayas trabajado y al que puedas volver a facturar: nombre o razón social, NIF/CIF, dirección fiscal, email y teléfono. Si tienes muchos clientes, exporta la lista completa. Si tienes pocos, puedes introducirlos manualmente.</li>
        <li><strong>Tus datos fiscales:</strong> nombre completo (como aparece en el Censo de la AEAT), NIF, dirección fiscal completa y actividad profesional.</li>
        <li><strong>El número de tu última factura:</strong> para que la numeración correlativa continúe correctamente desde donde la dejaste en Excel. Si tu última factura fue la 2026-037, la primera en ClientLabs deberá ser la 2026-038.</li>
        <li><strong>Tu logo (si tienes uno):</strong> archivo PNG o SVG para que aparezca en las facturas de ClientLabs. Si no tienes logo, no es obligatorio; el sistema usará tu nombre como cabecera.</li>
      </ul>

      <h2>Paso 1: Exporta tu lista de clientes de Excel como CSV</h2>
      <p>Este es el paso que más tiempo ahorra: en lugar de introducir los clientes uno a uno, los importas todos de golpe.</p>
      <p>Abre tu Excel con la lista de clientes. Comprueba que tienes al menos estas columnas: nombre, NIF, email y dirección. Si tienes los datos repartidos en varias hojas o archivos, consolídalos en una sola hoja antes de exportar.</p>
      <p>Para exportar como CSV en Excel:</p>
      <ol>
        <li>Haz clic en <strong>Archivo &gt; Guardar como</strong></li>
        <li>En el desplegable de tipo de archivo, selecciona <strong>CSV (delimitado por comas)</strong></li>
        <li>Elige una ubicación fácil de encontrar (el escritorio, por ejemplo) y haz clic en <strong>Guardar</strong></li>
        <li>Excel te avisará de que el formato CSV no soporta múltiples hojas. Confirma que quieres guardar solo la hoja activa.</li>
      </ol>
      <p>Abre el CSV generado con un editor de texto (Bloc de notas o TextEdit) y comprueba que los datos se ven correctamente, sin caracteres extraños ni columnas mezcladas. Si la codificación de caracteres es incorrecta (ves símbolos raros en lugar de tildes o eñes), guarda el archivo en codificación UTF-8.</p>
      <p>En Google Sheets, el proceso es aún más sencillo: <strong>Archivo &gt; Descargar &gt; Valores separados por comas (.csv)</strong>.</p>

      <h2>Paso 2: Crea tu cuenta en ClientLabs (gratis, sin tarjeta)</h2>
      <p>Accede a <Link href="/register">clientlabs.io/register</Link> e introduce tu email y una contraseña. El proceso completo tarda menos de 2 minutos. No necesitas tarjeta de crédito para el plan gratuito, que te permite emitir hasta 5 facturas al mes.</p>
      <p>Una vez creada la cuenta, recibirás un email de verificación. Haz clic en el enlace del email para confirmar tu dirección. Si no recibes el email en 2 minutos, revisa la carpeta de spam.</p>
      <p>Tras la verificación, accede al panel principal de ClientLabs. El asistente de configuración inicial te guiará por los primeros pasos.</p>

      <h2>Paso 3: Importar clientes desde CSV</h2>
      <p>En el panel de ClientLabs, accede a <strong>Clientes &gt; Importar</strong>. Haz clic en <strong>Seleccionar archivo</strong> y elige el CSV que exportaste en el paso 1.</p>
      <p>El sistema analizará el archivo y mostrará una vista previa con las columnas detectadas. Aquí tienes que hacer el mapeo de campos: indicar qué columna de tu CSV corresponde a cada campo de ClientLabs. Por ejemplo:</p>
      <ul>
        <li>Columna "Nombre empresa" del CSV → campo "Razón social" en ClientLabs</li>
        <li>Columna "CIF" del CSV → campo "NIF/CIF" en ClientLabs</li>
        <li>Columna "Mail" del CSV → campo "Email" en ClientLabs</li>
      </ul>
      <p>Si tu CSV tiene nombres de columna estándar (nombre, email, nif, telefono, direccion), el sistema los detectará automáticamente. Si las columnas tienen nombres personalizados, el mapeo manual tarda 2-3 minutos.</p>
      <p>Una vez confirmado el mapeo, haz clic en <strong>Importar</strong>. El sistema procesará los registros y te mostrará un resumen: cuántos clientes se importaron correctamente, cuántos tuvieron errores (normalmente por NIF mal formateado o email inválido) y cuántos se omitieron por estar duplicados.</p>
      <p>Para los registros con errores, puedes corregirlos directamente en la pantalla de resultados o exportar la lista de errores para corregirlos en Excel y reimportarlos.</p>

      <h2>Paso 4: Configura tus datos fiscales y número de serie</h2>
      <p>Accede a <strong>Ajustes &gt; Datos fiscales</strong> e introduce:</p>
      <ul>
        <li><strong>Nombre o razón social:</strong> exactamente como aparece en el Censo de la AEAT</li>
        <li><strong>NIF:</strong> tu número de identificación fiscal</li>
        <li><strong>Dirección fiscal completa:</strong> calle, número, piso/puerta, código postal, municipio, provincia</li>
        <li><strong>Actividad profesional:</strong> descripción breve de tu actividad</li>
        <li><strong>Datos bancarios (IBAN):</strong> para que aparezcan automáticamente en las facturas</li>
      </ul>
      <p>A continuación, configura tu <strong>serie de facturación</strong> en <strong>Ajustes &gt; Facturación &gt; Series</strong>. Crea una serie nueva (por ejemplo "2026") y establece el número inicial. Si tu última factura en Excel fue la 37, introduce 38 como número inicial. Si prefieres empezar una nueva serie para ClientLabs (por ejemplo "CL-2026-001"), puedes hacerlo también, siempre que mantengas la correlatividad dentro de cada serie.</p>
      <p>Sube tu logo en <strong>Ajustes &gt; Personalización</strong> si lo tienes preparado.</p>

      <h2>Paso 5: Crea tu primera factura para verificar que todo está bien</h2>
      <p>Antes de empezar a facturar en producción, crea una factura de prueba para verificar que la configuración es correcta.</p>
      <p>Accede a <strong>Facturas &gt; Nueva factura</strong>. Selecciona uno de los clientes importados, añade una línea de prueba (por ejemplo "Prueba de configuración" con precio 0) y haz clic en <strong>Vista previa</strong> (no en "Emitir" todavía).</p>
      <p>En la vista previa, comprueba:</p>
      <ul>
        <li>Tu nombre y NIF aparecen correctamente en la cabecera</li>
        <li>Tu dirección fiscal es correcta</li>
        <li>El número de la factura es el que estableciste como inicial</li>
        <li>El logo aparece si lo configuraste</li>
        <li>Los datos del cliente son correctos</li>
        <li>El QR de Verifactu aparece en el pie (si lo activaste)</li>
      </ul>
      <p>Si algo no está bien, vuelve a los ajustes y corrígelo antes de emitir. Una vez que estés satisfecho con la vista previa, ya estás listo para empezar a facturar en serio.</p>
      <p>Descarta esta factura de prueba haciendo clic en "Descartar borrador". Los borradores no emitidos no consumen número de factura.</p>

      <h2>Paso 6: Archivar las facturas antiguas de Excel</h2>
      <p>Un punto importante: <strong>no necesitas importar tus facturas antiguas</strong> a ClientLabs. Las facturas anteriores a tu migración están bien donde están: en PDF. Lo que la AEAT puede pedirte en una inspección son los PDF de las facturas, no un acceso a tu software de facturación.</p>
      <p>Lo que sí debes hacer es asegurarte de que esas facturas antiguas están conservadas correctamente:</p>
      <ul>
        <li><strong>Organiza los PDFs:</strong> crea una carpeta por año (Facturas_2024, Facturas_2025) con todas las facturas en PDF dentro. Si algunas solo existen en Excel, expórtalas a PDF ahora y archívalas.</li>
        <li><strong>Copia de seguridad:</strong> sube esas carpetas a Google Drive, Dropbox u otro servicio en la nube. No dejes que las facturas antiguas vivan solo en tu disco duro local.</li>
        <li><strong>Periodo de conservación:</strong> la AEAT puede revisar los últimos 4 años de actividad fiscal (el plazo general de prescripción). Conserva todas las facturas de los últimos 4 años más el año en curso. Las facturas anteriores a ese periodo puedes archivarlas en otro lugar, aunque es recomendable conservarlas indefinidamente si el almacenamiento lo permite.</li>
      </ul>
      <p>Tu archivo de Excel original no hace falta que lo importes, pero tampoco lo borres: consérvalo también como referencia histórica. Si en una inspección la AEAT pide un registro de tus facturas de 2023, poder mostrar el Excel original de ese año, junto con los PDFs correspondientes, es mucho mejor que no tener nada.</p>

      <h2>Los 3 problemas más comunes en la migración y cómo resolverlos</h2>

      <h3>Problema 1: El CSV tiene errores de codificación (tildes y eñes mal)</h3>
      <p>Este es el problema más frecuente. Cuando exportas desde Excel en Windows, el CSV suele guardarse en codificación Windows-1252 en lugar de UTF-8, lo que causa que las tildes, eñes y otros caracteres especiales se vean como caracteres extraños.</p>
      <p>Solución: abre el CSV con el Bloc de notas (Windows) o TextEdit (Mac), haz clic en <strong>Archivo &gt; Guardar como</strong> y selecciona la codificación UTF-8 en el desplegable de la ventana de guardado. Guarda con el mismo nombre y vuelve a importar en ClientLabs.</p>

      <h3>Problema 2: Los NIF de los clientes no tienen el formato correcto</h3>
      <p>La importación de ClientLabs valida el formato de los NIF/CIF de los clientes. Si tienes NIF guardados como "12.345.678-A" (con puntos y guión) en lugar de "12345678A" (sin separadores), el sistema los rechazará.</p>
      <p>Solución: antes de exportar el CSV, aplica en Excel la función SUSTITUIR para eliminar los puntos y guiones de la columna de NIF. La fórmula es: =SUSTITUIR(SUSTITUIR(SUSTITUIR(A2,".",""),"-","")," ","")</p>

      <h3>Problema 3: La numeración de la primera factura no es correlativa con la última de Excel</h3>
      <p>Si configuras el número inicial incorrecto en ClientLabs, generarás una brecha en la numeración (un hueco entre el último número de Excel y el primero de ClientLabs) que puede ser problemática en una inspección.</p>
      <p>Solución: antes de crear ninguna factura en ClientLabs, verifica el número de tu última factura emitida en Excel. Accede a <strong>Ajustes &gt; Facturación &gt; Series</strong> y comprueba que el número inicial está configurado como el siguiente en la secuencia. Si tienes varias series (por ejemplo, facturas nacionales e internacionales), configura cada una por separado.</p>

      <h2>Cuánto tiempo tarda la migración real</h2>
      <p>Las estimaciones honestas, basadas en el número de clientes activos que tienes que importar:</p>
      <ul>
        <li><strong>Menos de 20 clientes:</strong> 30-45 minutos en total. Puedes introducirlos manualmente sin necesidad de exportar CSV.</li>
        <li><strong>Entre 20 y 100 clientes:</strong> 60-90 minutos. Exportar el CSV, limpiar los datos y hacer la importación es más rápido que introducirlos a mano, aunque requiere un poco de preparación previa.</li>
        <li><strong>Entre 100 y 500 clientes:</strong> 2-3 horas. La mayor parte del tiempo se irá en limpiar y verificar el CSV para asegurarse de que los datos son correctos.</li>
        <li><strong>Más de 500 clientes:</strong> un día de trabajo. En estos casos, el equipo de soporte de ClientLabs puede ayudarte con la migración.</li>
      </ul>
      <p>En todos los casos, la configuración de datos fiscales y la verificación con una factura de prueba añaden 15-20 minutos adicionales.</p>

      <h2>Qué funciones puedes activar desde el día 1 que Excel no tiene</h2>
      <p>Una vez completada la migración, tienes acceso inmediato a funcionalidades que Excel nunca podrá ofrecer:</p>
      <ul>
        <li><strong>Envío de facturas por email en un clic:</strong> directo desde la plataforma, con el PDF adjunto automáticamente</li>
        <li><strong>Control de cobros y vencimientos:</strong> saber en tiempo real qué facturas están pendientes de cobro y cuáles llevan más de 30, 60 o 90 días vencidas</li>
        <li><strong>Recordatorios automáticos de pago:</strong> el sistema puede enviar un email al cliente cuando una factura lleva X días sin pagar</li>
        <li><strong>Presupuestos convertibles en facturas:</strong> envía un presupuesto al cliente y, cuando lo acepte, conviértelo en factura con un clic</li>
        <li><strong>Dashboard financiero:</strong> tus ingresos del mes, la previsión del trimestre y el IVA pendiente de declarar, de un vistazo</li>
        <li><strong>Informes para la declaración trimestral:</strong> el resumen de ingresos, IVA repercutido y retenciones del trimestre, generado automáticamente</li>
        <li><strong>Pipeline de leads integrado:</strong> desde que captas un lead hasta que le envías la primera factura, todo en la misma plataforma</li>
      </ul>

      <h2>Soporte: cómo contactar con el equipo de ClientLabs si tienes problemas</h2>
      <p>Si encuentras algún problema durante la migración que no resuelves por tu cuenta, el equipo de ClientLabs está disponible a través de los siguientes canales:</p>
      <ul>
        <li><strong>Chat en la plataforma:</strong> el método más rápido. Disponible desde el panel de ClientLabs haciendo clic en el icono de chat en la esquina inferior derecha. Respuesta habitual en menos de 4 horas en horario laboral.</li>
        <li><strong>Email de soporte:</strong> para consultas más detalladas o adjuntar archivos (como el CSV con problemas). La dirección está disponible en la sección de Ajustes &gt; Ayuda.</li>
        <li><strong>Base de conocimiento:</strong> artículos paso a paso sobre la importación de clientes, configuración de series y solución de problemas comunes. Accesible desde el menú de ayuda de la plataforma.</li>
      </ul>
      <p>Para casos de migración compleja (más de 500 clientes, múltiples series de facturación, migración desde otro software de facturación), el equipo de ClientLabs ofrece sesiones de soporte personalizado.</p>
      <p>Si todavía no tienes cuenta, <Link href="/register">empieza gratis en ClientLabs</Link> ahora mismo. La migración desde Excel es gratuita y está incluida en todos los planes. Consulta los <Link href="/precios">planes disponibles</Link> para ver qué capacidades necesitas según tu volumen de facturación.</p>
    </div>
  ),
}
