import React from "react"
import Link from "next/link"

export const ARTICLES_21_25: Record<string, React.ReactNode> = {
  "como-hacer-una-factura": (
    <div>
      <h2>Cómo hacer una factura: partes obligatorias y plantilla gratis</h2>
      <p>Una factura correcta necesita siempre: un número correlativo, la fecha, tus datos y los de tu cliente, la descripción de lo que vendes, la base imponible, el IVA (y la retención de IRPF si te aplica) y el total. Si falta alguno de esos datos, la factura no es válida y tu cliente no puede deducirla. Aquí tienes cada parte explicada y una plantilla para empezar hoy.</p>
      <h2>Partes obligatorias de una factura</h2>
      <table><thead><tr><th>Elemento</th><th>Qué incluye</th></tr></thead><tbody><tr><td><strong>Número y serie</strong></td><td>Correlativo, sin saltos. Ej.: 2026-001, 2026-002</td></tr><tr><td><strong>Fecha de emisión</strong></td><td>Y, si procede, fecha de la operación</td></tr><tr><td><strong>Tus datos</strong></td><td>Nombre o razón social, NIF y dirección</td></tr><tr><td><strong>Datos del cliente</strong></td><td>Nombre/razón social, NIF y dirección</td></tr><tr><td><strong>Descripción</strong></td><td>Concepto, cantidad y precio unitario</td></tr><tr><td><strong>Base imponible</strong></td><td>Importe antes de impuestos</td></tr><tr><td><strong>IVA</strong></td><td>Tipo aplicado (21 %, 10 % o 4 %) y cuota</td></tr><tr><td><strong>Retención de IRPF</strong></td><td>Solo si tu actividad la lleva (p. ej. 15 % o 7 %)</td></tr><tr><td><strong>Total</strong></td><td>Lo que paga el cliente</td></tr></tbody></table>
      <blockquote><p>El número <strong>no puede tener huecos</strong>: la numeración es correlativa. Puedes usar series distintas (por ejemplo, una para facturas y otra para rectificativas), pero cada serie va seguida.</p></blockquote>
      <h2>Ejemplo de cálculo</h2>
      <p>Vendes un servicio por <strong>1.000 €</strong>:</p>
      <ul><li>Base imponible: 1.000 €</li><li>IVA (21 %): +210 €</li><li>Retención IRPF (15 %, si aplica): −150 €</li><li><strong>Total a cobrar: 1.060 €</strong></li></ul>
      <p>La retención no la pierdes: es un adelanto de tu IRPF que tu cliente ingresa por ti en Hacienda.</p>
      <h2>Factura completa vs. factura simplificada</h2>
      <ul><li><strong>Factura completa:</strong> la habitual. Lleva todos los datos del cliente. Es la que tu cliente necesita para deducir.</li><li><strong>Factura simplificada</strong> (el antiguo "ticket"): se permite por debajo de cierto importe y con menos datos, pero no siempre sirve para que el receptor deduzca.</li></ul>
      <p>Ante la duda, emite factura completa.</p>
      <h2>Cómo numerar tus facturas sin liarte</h2>
      <ul><li>Empieza cada año con una serie clara: <code>2026-001</code>.</li><li>No saltes números ni los repitas.</li><li>Si anulas una factura ya emitida, no la borres: haz una <strong>factura rectificativa</strong>.</li></ul>
      <h2>Y a partir de 2027, Verifactu</h2>
      <p>Si emites con software, a partir de 2027 tus facturas deberán incluir <strong>huella, código QR y encadenamiento</strong> (normativa Verifactu). No es algo que hagas tú a mano: lo añade el programa. Si aún facturas en Excel, es buen momento para planificar el cambio. Tienes el detalle en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <h2>Descarga la plantilla de factura gratis</h2>
      <p>Hemos preparado una <strong>plantilla de factura editable</strong> con todos los campos obligatorios ya colocados, lista para rellenar.</p>
      <blockquote><p><strong>[Descargar plantilla de factura gratis →](#)</strong> _(introduce tu email y te la enviamos)_</p></blockquote>
      <p>Es un buen punto de partida. El salto siguiente —numeración automática, IVA calculado y facturas conformes con Verifactu— ya pide un programa de facturación.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué datos son obligatorios en una factura?</strong> Número correlativo, fecha, datos de emisor y cliente (con NIF), descripción, base imponible, IVA y total. La retención de IRPF, solo si tu actividad la lleva.</p>
      <p><strong>¿Puedo hacer facturas en Excel?</strong> Sí, hoy es legal, pero a partir de 2027 el software de facturación deberá cumplir Verifactu (huella, QR, encadenamiento), algo que Excel no genera.</p>
      <p><strong>¿Tengo que poner IVA siempre?</strong> Casi siempre. Hay operaciones exentas o con inversión del sujeto pasivo, pero por defecto aplicas el tipo que corresponda (21 %, 10 % o 4 %).</p>
      <p><strong>¿Cuándo pongo retención de IRPF?</strong> Cuando tu actividad profesional la lleva y facturas a empresas o a otros autónomos. El tipo general es 15 % (7 % para nuevos autónomos durante un tiempo). Lo desarrollamos en <Link href="/blog/retencion-irpf-factura">qué retención de IRPF poner</Link>.</p>
      <p><strong>¿Cómo corrijo una factura con un error?</strong> No la borres: emite una <strong>factura rectificativa</strong> que la corrija.</p>
      <h2>En resumen</h2>
      <p>Hacer una factura es sencillo si no te dejas ningún campo. La plantilla te saca del apuro hoy; cuando factures con frecuencia, ClientLabs numera, calcula el IVA y emite facturas conformes con Verifactu por ti.</p>
    </div>
  ),
  "darse-de-alta-como-autonomo-2026": (
    <div>
      <h2>Cómo darte de alta como autónomo en 2026 (Hacienda y SS)</h2>
      <p>Darte de alta como autónomo son <strong>dos trámites</strong>: primero en Hacienda (alta censal con el modelo 036 o 037, declarando tu actividad) y después en la Seguridad Social (alta en el RETA). Ambos son gratuitos y se hacen online. Aquí tienes el orden, los plazos y la documentación para no dejarte nada.</p>
      <h2>Los dos trámites, en orden</h2>
      <h3>1. Hacienda — alta censal (modelo 036 o 037)</h3>
      <p>Comunicas a la Agencia Tributaria que vas a ejercer una actividad económica:</p>
      <ul><li><strong>Modelo 037</strong> (simplificado) o <strong>036</strong> (completo).</li><li>Eliges tu <strong>epígrafe del IAE</strong> (el código de tu actividad).</li><li>Declaras tus obligaciones de IVA e IRPF.</li><li><strong>Plazo:</strong> debe presentarse <strong>antes</strong> de iniciar la actividad.</li></ul>
      <h3>2. Seguridad Social — alta en el RETA</h3>
      <p>Te das de alta en el Régimen Especial de Trabajadores Autónomos:</p>
      <ul><li>Se hace en la Tesorería General de la Seguridad Social (online con certificado o Cl@ve).</li><li>Eliges tu <strong>base de cotización</strong> dentro del sistema de cotización por <strong>ingresos reales</strong>.</li><li><strong>Plazo:</strong> el alta (modelo <strong>TA.0521</strong>) se tramita <strong>con carácter previo</strong> al inicio de la actividad y hasta <strong>60 días antes</strong>. Si la haces fuera de plazo, surte efecto desde el <strong>día 1 del mes</strong> (pierdes el prorrateo) y puede acarrear recargos o sanciones.</li></ul>
      <blockquote><p>Orden recomendado: primero Hacienda, después Seguridad Social, y siempre <strong>antes</strong> de emitir tu primera factura.</p></blockquote>
      <h2>Documentación que necesitas</h2>
      <ul><li>DNI o NIE.</li><li>Certificado digital o Cl@ve (para hacerlo online).</li><li>Datos de tu actividad: epígrafe IAE, dirección, fecha de inicio.</li><li>Cuenta bancaria (IBAN) para la domiciliación de la cuota.</li></ul>
      <h2>La tarifa plana en 2026</h2>
      <p>Los nuevos autónomos pueden acogerse a la <strong>tarifa plana</strong>: <strong>80 € de base los 12 primeros meses</strong> (con el MEI, la cuota real ronda los <strong>88,64 €/mes</strong>), prorrogable <strong>12 meses más</strong> si tus rendimientos netos del primer año no superan el SMI. Requisitos: <strong>2 años sin alta en el RETA</strong> (3 si ya usaste antes la bonificación) y estar al corriente con Hacienda y la Seguridad Social. Para personas con <strong>discapacidad ≥ 33 %</strong> o <strong>víctimas de violencia de género o de terrorismo</strong> son <strong>24 meses</strong>. Se marca al darse de alta en el <strong>modelo TA.0521</strong>; si se olvida, se pierde. Además, varias comunidades (Andalucía, Madrid, Galicia, Murcia…) tienen una <strong>"cuota cero"</strong> que puede dejarla en 0 €. Pasado el periodo bonificado, pagas según la <strong>cuota por ingresos reales</strong> (tramos).</p>
      <p>Tienes el detalle de cuánto pagarás después en <Link href="/blog/cuota-autonomos-2026">Cuota de autónomos 2026</Link>.</p>
      <h2>Después del alta: tus obligaciones básicas</h2>
      <p>Una vez dado de alta, tu calendario incluye normalmente:</p>
      <ul><li><strong>IVA trimestral</strong> con el <Link href="/blog/modelo-303">modelo 303</Link>.</li><li><strong>IRPF trimestral</strong> con el <Link href="/blog/modelo-130">modelo 130</Link>, si tributas en estimación directa.</li><li><strong>Facturar correctamente</strong> desde el primer día (y, desde 2027, con software conforme a Verifactu).</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto cuesta darse de alta como autónomo?</strong> El alta en Hacienda y en la Seguridad Social es gratuita. El coste es la cuota mensual del RETA, reducida con la tarifa plana al principio.</p>
      <p><strong>¿Qué hago primero, Hacienda o Seguridad Social?</strong> Primero el alta censal en Hacienda (036/037) y después el alta en el RETA. Todo, antes de empezar a facturar.</p>
      <p><strong>¿Puedo darme de alta solo unos días al mes?</strong> Sí: hasta <strong>3 altas y 3 bajas por año natural</strong> con efecto el día real (cuota prorrateada por días). A partir de la 4.ª, el alta cuenta desde el día 1 y la baja hasta el último día del mes (pagas el mes completo). La baja se comunica en los <strong>3 días naturales</strong> siguientes al cese.</p>
      <p><strong>¿Necesito gestor para darme de alta?</strong> No es obligatorio: puedes hacerlo tú online con certificado o Cl@ve. Un gestor te ayuda a elegir epígrafe y base de cotización.</p>
      <p><strong>¿Tengo que emitir facturas desde el primer día?</strong> Sí, toda actividad debe documentarse con factura. Conviene tener listo el método antes de empezar.</p>
      <h2>En resumen</h2>
      <p>Darse de alta es gratis y se hace online en dos pasos: Hacienda y Seguridad Social. Cuando tengas el alta, lo siguiente es facturar bien y llevar tus impuestos al día: ClientLabs te deja emitir tu primera factura conforme y tener el IVA y el IRPF calculados sin montar una hoja de cálculo.</p>
      <blockquote><p>Información general, no asesoramiento personalizado. Confirma epígrafe y base de cotización con tu asesor.</p></blockquote>
    </div>
  ),
  "kit-digital-2026": (
    <div>
      <h2>Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio</h2>
      <p>El Kit Digital es una ayuda pública (financiada con fondos europeos) que te da un <strong>bono</strong> para digitalizar tu negocio: web, CRM, facturación, ciberseguridad y más. Lo solicitas tú, pero el servicio lo prestas a través de un <strong>agente digitalizador</strong> adherido. Aquí tienes quién puede pedirlo, en qué se gasta y cómo solicitarlo.</p>
      <blockquote><p>Programa regulado por la <strong>Orden TDF/39/2026</strong> (BOE de 28 de enero de 2026): <strong>activo hasta agotar fondos</strong>, sin fecha de cierre fija. Importe vigente en la web oficial: <a href="https://kitdigital.red.es" target="_blank" rel="noopener noreferrer">kitdigital.red.es</a>.</p></blockquote>
      <h2>Qué es el bono digital</h2>
      <p>Una subvención en forma de "bono" que cubre soluciones de digitalización concretas (las llamadas categorías). No es dinero en mano: pagas la solución a un agente digitalizador y la ayuda cubre el importe del bono.</p>
      <h2>Quién puede pedirlo</h2>
      <ul><li><strong>Autónomos</strong> (incluidos los que llevan <strong>6 meses o más de alta en el RETA</strong>, tras la ampliación de 2026) y <strong>pymes</strong>, al corriente de sus obligaciones.</li><li>Para autónomos, el bono se mueve en un <strong>rango de 2.000 a 3.000 €</strong> según la convocatoria (la numeración de segmentos varía entre fuentes). Importe vigente en <a href="https://kitdigital.red.es" target="_blank" rel="noopener noreferrer">kitdigital.red.es</a>.</li></ul>
      <h2>En qué puedes gastarlo</h2>
      <p>Categorías del catálogo (incluyen las que cubre ClientLabs):</p>
      <ul><li>Sitio web y presencia en internet.</li><li>Gestión de clientes (<strong>CRM</strong>).</li><li>Gestión de procesos y facturación electrónica.</li><li>Ciberseguridad.</li><li>Comunicaciones seguras, oficina virtual, etc.</li></ul>
      <p>El catálogo incluye <strong>gestión de clientes (CRM)</strong> y <strong>factura electrónica</strong>, así que <strong>ClientLabs</strong> encaja como solución a contratar <strong>a través de un agente digitalizador</strong>: usas el bono para poner en marcha tu CRM y tu facturación conforme con Verifactu. (Importe concreto en <a href="https://kitdigital.red.es" target="_blank" rel="noopener noreferrer">kitdigital.red.es</a>.)</p>
      <h2>Cómo solicitarlo (pasos)</h2>
      <ol><li><strong>Hazte el test de diagnóstico digital</strong> en la plataforma oficial.</li><li><strong>Regístrate</strong> y solicita la ayuda en la sede electrónica del programa.</li><li><strong>Espera la concesión</strong> del bono.</li><li><strong>Elige un agente digitalizador</strong> y la solución (por ejemplo, CRM + facturación).</li><li><strong>Firmáis el acuerdo</strong> y se presta el servicio; el bono cubre el importe.</li></ol>
      <blockquote><p>El bono <strong>no se cobra en dinero</strong>: lo recibe el <strong>agente digitalizador</strong>; tú solo pagas el <strong>IVA</strong> y el exceso sobre el tope del bono.</p></blockquote>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿El Kit Digital sigue disponible en 2026?</strong> Sí. La Orden TDF/39/2026 lo mantiene activo hasta agotar fondos, sin fecha de cierre fija.</p>
      <p><strong>¿Cuánto dan?</strong> Para autónomos, entre 2.000 y 3.000 € según convocatoria. El importe vigente, en kitdigital.red.es.</p>
      <p><strong>¿En qué lo puedo gastar?</strong> En soluciones de digitalización: web, CRM, facturación, ciberseguridad, etc.</p>
      <p><strong>¿Puedo usarlo para un CRM y facturación?</strong> Sí: gestión de clientes (CRM) y factura electrónica están en el catálogo, y ClientLabs encaja vía agente digitalizador.</p>
      <p><strong>¿Lo gestiono yo o el agente?</strong> La solicitud la haces tú; la solución la presta el agente digitalizador.</p>
      <h2>En resumen</h2>
      <p>El Kit Digital te ayuda a pagar la digitalización que ya ibas a necesitar. Si lo vas a usar en gestión de clientes y facturación, ClientLabs es una opción elegible a través de agente digitalizador, con CRM y facturación conforme a Verifactu.</p>
      <blockquote><p>Confirma cuantías, requisitos y plazos en la sede oficial del programa antes de solicitarlo.</p></blockquote>
    </div>
  ),
  "retencion-irpf-factura": (
    <div>
      <h2>Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones</h2>
      <p>Si eres autónomo profesional y facturas a empresas o a otros autónomos, en general aplicas una retención de IRPF del <strong>15 %</strong>. Si acabas de empezar, puedes usar el <strong>7 %</strong> durante los primeros años. Y hay casos en los que <strong>no se pone retención</strong>: cuando facturas a particulares o cuando tu actividad no es profesional. Aquí tienes cuándo va cada una.</p>
      <h2>La regla rápida</h2>
      <table><thead><tr><th>Situación</th><th>Retención</th></tr></thead><tbody><tr><td>Autónomo profesional → empresa o autónomo</td><td><strong>15 %</strong></td></tr><tr><td>Nuevo autónomo profesional (año de alta + 2 siguientes)</td><td><strong>7 %</strong></td></tr><tr><td>Factura a un particular (consumidor final)</td><td><strong>Sin retención</strong></td></tr><tr><td>Actividad empresarial (no profesional) en estimación directa</td><td>Normalmente <strong>sin retención</strong></td></tr></tbody></table>
      <blockquote><p>La retención <strong>no es un coste extra</strong>: es un adelanto de tu IRPF que tu cliente ingresa en Hacienda por ti. Lo recuperas (o ajustas) en la declaración de la renta.</p></blockquote>
      <h2>Ejemplo de cálculo</h2>
      <p>Facturas un servicio profesional por <strong>1.000 €</strong> a una empresa, con retención del 15 %:</p>
      <ul><li>Base imponible: 1.000 €</li><li>IVA (21 %): +210 €</li><li>Retención IRPF (15 %): −150 €</li><li><strong>Total a cobrar: 1.060 €</strong></li></ul>
      <p>Tu cliente te paga 1.060 € e ingresa los 150 € de retención a Hacienda a tu nombre.</p>
      <h2>Cuándo se aplica el 7 %</h2>
      <p>Los autónomos profesionales que se dan de alta (sin haber ejercido actividad profesional el año anterior) aplican el <strong>7 %</strong> el año de alta y los <strong>dos siguientes</strong>; después salta automáticamente al <strong>15 %</strong>. Ejemplo: alta en mayo de 2026 → 7 % el resto de 2026, todo 2027 y todo 2028, y 15 % desde 2029. La retención se calcula siempre sobre la <strong>base imponible</strong>, nunca sobre el total con IVA.</p>
      <h2>Cuándo NO se pone retención</h2>
      <ul><li><strong>Facturas a particulares.</strong> Un consumidor final no practica retención.</li><li><strong>Actividades empresariales</strong> (no profesionales) en estimación directa: por norma general no llevan retención en factura; el adelanto de IRPF lo haces tú con el <Link href="/blog/modelo-130">modelo 130</Link>.</li><li><strong>Clientes extranjeros:</strong> las facturas a empresas de fuera de España <strong>no llevan retención de IRPF</strong> (solo aplica cuando el pagador es español y está obligado a retener). Esos ingresos cuentan como <strong>sin retención</strong> para la regla del 70 % del <Link href="/blog/modelo-130">modelo 130</Link>.</li></ul>
      <h2>¿Profesional o empresarial? Por qué importa</h2>
      <p>La retención va ligada a las actividades <strong>profesionales</strong> (las de la sección segunda del IAE: consultores, diseñadores, abogados, etc.). Las <strong>empresariales</strong> (comercio, hostelería, producción) normalmente no retienen en factura. Si dudas de tu epígrafe, confírmalo con tu asesor.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué retención pongo si soy nuevo autónomo?</strong> Puedes optar por el 7 % en el año de alta y los dos siguientes; después, el 15 %.</p>
      <p><strong>¿Pongo retención en facturas a particulares?</strong> No. Solo se practica retención cuando el cliente es una empresa u otro autónomo.</p>
      <p><strong>¿La retención es dinero que pierdo?</strong> No. Es un adelanto de tu IRPF: lo regularizas en la declaración de la renta.</p>
      <p><strong>¿Quién ingresa la retención en Hacienda?</strong> Tu cliente. Por eso te paga el importe ya descontado.</p>
      <p><strong>Si me retienen, ¿tengo que presentar el modelo 130?</strong> Depende. Quien factura con retención a la mayor parte de sus clientes puede quedar exento del 130. Lo vemos en <Link href="/blog/modelo-130">Modelo 130</Link>.</p>
      <h2>En resumen</h2>
      <p>15 % por defecto, 7 % si empiezas, y nada cuando facturas a particulares. ClientLabs aplica la retención correcta a cada factura y te deja el total calculado, sin que tengas que repasar porcentajes.</p>
      <blockquote><p>Información general, no asesoramiento personalizado. Confirma tu caso con tu asesor.</p></blockquote>
    </div>
  ),
  "modelo-130": (
    <div>
      <h2>Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula</h2>
      <p>El modelo 130 es el pago fraccionado del IRPF: cada trimestre adelantas a Hacienda el <strong>20 % del beneficio</strong> acumulado de tu actividad. Lo presentan los autónomos en estimación directa que <strong>no</strong> retienen IRPF en la mayoría de sus facturas. Si la mayor parte de tu facturación ya lleva retención, normalmente estás exento.</p>
      <h2>Qué es exactamente</h2>
      <p>Es la forma de ir pagando tu IRPF a lo largo del año en vez de todo de golpe en la renta. Declaras tus ingresos y gastos del trimestre y abonas el 20 % de la diferencia. Luego, en la declaración de la renta, se regulariza.</p>
      <h2>Quién está obligado (y quién no)</h2>
      <ul><li><strong>Obligado:</strong> autónomo en <strong>estimación directa</strong> cuya actividad <strong>no</strong> practica retención, o que retuvo en <strong>menos del 70 %</strong> de sus ingresos del <strong>año anterior</strong>. En <strong>módulos</strong> (estimación objetiva) se usa el <strong>modelo 131</strong>, no el 130.</li><li><strong>Exento:</strong> si <strong>el 70 % o más</strong> de tus ingresos del año anterior ya llevaron retención de IRPF en factura. En ese caso, Hacienda ya va cobrando vía retenciones y no presentas el 130.</li></ul>
      <p>Por eso muchos profesionales (que sí retienen) no presentan el 130, mientras que comerciantes y actividades empresariales (que no retienen) sí.</p>
      <h2>Cómo se calcula</h2>
      <p>Fórmula básica del trimestre:</p>
      <p><strong>(Ingresos acumulados − Gastos acumulados) × 20 % − pagos de trimestres anteriores − retenciones</strong></p>
      <h3>Ejemplo</h3>
      <p>Primer trimestre, actividad sin retención:</p>
      <ul><li>Ingresos: 9.000 €</li><li>Gastos deducibles: 3.000 €</li><li>Beneficio: 6.000 €</li><li>Pago fraccionado: 6.000 × 20 % = <strong>1.200 €</strong></li></ul>
      <p>El cálculo es <strong>acumulado</strong>: en el segundo trimestre sumas todo el año hasta ahí y restas lo ya pagado.</p>
      <h2>Plazos de presentación en 2026</h2>
      <table><thead><tr><th>Trimestre</th><th>Periodo</th><th>Plazo</th></tr></thead><tbody><tr><td>1T</td><td>enero–marzo</td><td>1–20 de abril</td></tr><tr><td>2T</td><td>abril–junio</td><td>1–20 de julio</td></tr><tr><td>3T</td><td>julio–septiembre</td><td>1–20 de octubre</td></tr><tr><td>4T</td><td>octubre–diciembre</td><td>1–30 de enero (2027)</td></tr></tbody></table>
      <p>Con <strong>domiciliación bancaria</strong>, el cargo se adelanta unos <strong>5 días</strong> respecto al fin de cada plazo.</p>
      <h2>Errores que cuestan dinero</h2>
      <ul><li><strong>Olvidar gastos deducibles:</strong> cada gasto que no incluyes hace que pagues 20 % de más. Revisa la <Link href="/blog/gastos-deducibles-autonomo-2026">lista de gastos deducibles</Link>.</li><li><strong>No acumular bien:</strong> el 130 es acumulativo; no se calcula trimestre suelto.</li><li><strong>Presentar fuera de plazo:</strong> genera recargos.</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Quién presenta el modelo 130?</strong> Autónomos en estimación directa cuya actividad no retiene IRPF (o retiene en menos del 70 % de sus ingresos).</p>
      <p><strong>¿Cuándo estoy exento del 130?</strong> Cuando el 70 % o más de tus ingresos del año anterior ya llevaron retención de IRPF en factura.</p>
      <p><strong>¿Cuánto se paga?</strong> El 20 % del beneficio acumulado (ingresos − gastos), menos lo ya pagado y las retenciones soportadas.</p>
      <p><strong>¿El 130 es lo mismo que el 303?</strong> No. El <Link href="/blog/modelo-303">303</Link> es el IVA; el 130 es el adelanto del IRPF.</p>
      <p><strong>¿Si presento el 130 también hago la declaración de la renta?</strong> Sí. El 130 son adelantos; en la renta se regulariza todo.</p>
      <h2>En resumen</h2>
      <p>El 130 es tu IRPF a plazos: 20 % del beneficio cada trimestre, salvo que ya retengas en la mayoría de tus facturas. Llevar ingresos y gastos en un único sitio hace que el cálculo de cada trimestre esté hecho. ClientLabs te muestra el resultado del periodo listo para presentar.</p>
      <blockquote><p>Información general, no asesoramiento personalizado.</p></blockquote>
    </div>
  ),
}
