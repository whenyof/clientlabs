import React from "react"
import Link from "next/link"

export const ARTICLES_21_25: Record<string, React.ReactNode> = {
  "como-hacer-una-factura": (
    <div>
      <h2>Cómo hacer una factura: partes obligatorias y plantilla gratis</h2>
      <p>Una factura correcta necesita siempre lo mismo: un número correlativo, la fecha, tus datos y los de tu cliente, la descripción de lo que vendes, la base imponible, el IVA (y la retención de IRPF si te aplica) y el total. Si falta cualquiera de esos datos, la factura no es válida y tu cliente no puede deducirla. Aquí tienes cada parte explicada, la diferencia entre factura completa y simplificada, un ejemplo de cálculo y una plantilla para empezar hoy mismo.</p>
      <h2>Partes obligatorias de una factura</h2>
      <table><thead><tr><th>Elemento</th><th>Qué incluye</th></tr></thead><tbody><tr><td><strong>Número y serie</strong></td><td>Correlativo, sin saltos. Ej.: 2026-001, 2026-002</td></tr><tr><td><strong>Fecha de emisión</strong></td><td>Y, si procede, fecha de la operación</td></tr><tr><td><strong>Tus datos</strong></td><td>Nombre o razón social, NIF y dirección</td></tr><tr><td><strong>Datos del cliente</strong></td><td>Nombre/razón social, NIF y dirección</td></tr><tr><td><strong>Descripción</strong></td><td>Concepto, cantidad y precio unitario</td></tr><tr><td><strong>Base imponible</strong></td><td>Importe antes de impuestos</td></tr><tr><td><strong>IVA</strong></td><td>Tipo aplicado (21 %, 10 % o 4 %) y cuota</td></tr><tr><td><strong>Retención de IRPF</strong></td><td>Solo si tu actividad la lleva (15 % o 7 %)</td></tr><tr><td><strong>Total</strong></td><td>Lo que paga el cliente</td></tr></tbody></table>
      <blockquote><p>El número <strong>no puede tener huecos</strong>: la numeración es correlativa dentro de cada serie. Puedes usar series distintas (por ejemplo, una para facturas y otra para rectificativas), pero cada serie va seguida.</p></blockquote>
      <h2>Ejemplo de cálculo</h2>
      <p>Vendes un servicio profesional por <strong>1.000 €</strong> a una empresa:</p>
      <ul><li>Base imponible: 1.000 €</li><li>IVA (21 %): +210 €</li><li>Retención IRPF (15 %, si aplica): −150 €</li><li><strong>Total a cobrar: 1.060 €</strong></li></ul>
      <p>La retención no la pierdes: es un adelanto de tu IRPF que tu cliente ingresa por ti en Hacienda y que recuperas (o ajustas) en la declaración de la renta. Tanto el IVA como la retención se calculan siempre sobre la <strong>base imponible</strong>, nunca uno sobre otro.</p>
      <h2>Factura completa vs. factura simplificada</h2>
      <ul><li><strong>Factura completa:</strong> la habitual. Lleva todos los datos del cliente (incluido su NIF). Es la que tu cliente necesita para deducir el gasto y el IVA.</li><li><strong>Factura simplificada</strong> (el antiguo "ticket"): lleva menos datos y se permite cuando el importe <strong>no supera los 400 € (IVA incluido)</strong>, o hasta <strong>3.000 €</strong> en determinados sectores (comercio al por menor, hostelería, transporte de personas, aparcamientos, etc.). El problema: si no incluye los datos del destinatario, <strong>no siempre sirve para que el receptor deduzca</strong>.</li></ul>
      <p>Ante la duda, y siempre que tu cliente sea una empresa o un autónomo, emite factura completa.</p>
      <h2>Cómo numerar tus facturas sin liarte</h2>
      <ul><li>Empieza cada año con una serie clara: <code>2026-001</code>.</li><li>No saltes números ni los repitas: la numeración correlativa es obligatoria.</li><li>Si anulas una factura ya emitida, <strong>no la borres</strong>: haz una <strong>factura rectificativa</strong> que la corrija.</li></ul>
      <h2>Y a partir de 2027, Verifactu</h2>
      <p>Si emites con software, a partir de tu fecha de Verifactu (1 de julio de 2027 para autónomos) tus facturas deberán incluir <strong>huella, código QR y encadenamiento</strong>. No es algo que hagas tú a mano: lo añade el programa de forma automática. Si todavía facturas en Excel, es buen momento para planificar el cambio, porque la hoja de cálculo no genera ninguno de esos elementos. Tienes el detalle en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <h2>Descarga la plantilla de factura gratis</h2>
      <p>Hemos preparado una <strong>plantilla de factura editable</strong> con todos los campos obligatorios ya colocados, lista para rellenar.</p>
      <blockquote><p><strong>[Descargar plantilla de factura gratis →](#)</strong> _(introduce tu email y te la enviamos)_</p></blockquote>
      <p>Es un buen punto de partida para salir del paso. El salto siguiente —numeración automática, IVA calculado solo y facturas conformes con Verifactu— ya pide un programa de facturación.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué datos son obligatorios en una factura?</strong> Número correlativo, fecha, datos de emisor y cliente (con NIF), descripción, base imponible, IVA y total. La retención de IRPF, solo si tu actividad la lleva.</p>
      <p><strong>¿Puedo hacer facturas en Excel?</strong> Hoy es legal, pero a partir de julio de 2027 el software de facturación deberá cumplir Verifactu (huella, QR, encadenamiento), algo que Excel no genera. Conviene cambiar con margen.</p>
      <p><strong>¿Cuándo puedo emitir factura simplificada?</strong> Cuando el importe no supera los 400 € (IVA incluido), o hasta 3.000 € en sectores concretos como comercio minorista, hostelería o transporte de viajeros. Aun así, si tu cliente quiere deducir, pídele que te confirme si necesita factura completa.</p>
      <p><strong>¿Tengo que poner IVA siempre?</strong> Casi siempre. Hay operaciones exentas o con inversión del sujeto pasivo, pero por defecto aplicas el tipo que corresponda (21 %, 10 % o 4 %).</p>
      <p><strong>¿Cuándo pongo retención de IRPF?</strong> Cuando tu actividad es profesional y facturas a empresas o a otros autónomos. El tipo general es 15 % (7 % para nuevos autónomos durante el año de alta y los dos siguientes). Lo desarrollamos en <Link href="/blog/retencion-irpf-factura">qué retención de IRPF poner</Link>.</p>
      <p><strong>¿Cómo corrijo una factura con un error?</strong> No la borres: emite una factura rectificativa que la corrija, manteniendo intacta la numeración original.</p>
      <h2>En resumen</h2>
      <p>Hacer una factura es sencillo si no te dejas ningún campo y respetas la numeración correlativa. La plantilla te saca del apuro hoy; cuando factures con frecuencia, ClientLabs numera solo, calcula el IVA y la retención, y emite facturas conformes con Verifactu por ti, para que no tengas que revisar campo por campo en cada emisión.</p>
    </div>
  ),
  "darse-de-alta-como-autonomo-2026": (
    <div>
      <h2>Cómo darte de alta como autónomo en 2026 (Hacienda y SS)</h2>
      <p>Darte de alta como autónomo son <strong>dos trámites</strong>: primero en Hacienda (alta censal con el modelo 036 o 037, declarando tu actividad) y después en la Seguridad Social (alta en el RETA). Los dos son gratuitos, se hacen online y no necesitas gestor para hacerlos. Aquí tienes el orden, los plazos, la documentación y la tarifa plana, para no dejarte nada.</p>
      <h2>Los dos trámites, en orden</h2>
      <h3>1. Hacienda — alta censal (modelo 036 o 037)</h3>
      <p>Comunicas a la Agencia Tributaria que vas a ejercer una actividad económica:</p>
      <ul><li><strong>Modelo 037</strong> (simplificado) o <strong>036</strong> (completo).</li><li>Eliges tu <strong>epígrafe del IAE</strong>, que es el código que identifica tu actividad. Si dudas entre dos, el listado oficial del IAE describe cada epígrafe: elige el que mejor encaje con lo que vas a facturar (puedes darte de alta en varios si haces actividades distintas).</li><li>Declaras tus obligaciones de IVA e IRPF (si tu actividad es profesional o empresarial, lo que determina si retienes o no en factura).</li><li><strong>Plazo:</strong> debe presentarse <strong>antes</strong> de iniciar la actividad.</li></ul>
      <h3>2. Seguridad Social — alta en el RETA</h3>
      <p>Te das de alta en el Régimen Especial de Trabajadores Autónomos:</p>
      <ul><li>Se hace en la Tesorería General de la Seguridad Social (online, con certificado digital o Cl@ve), mediante el <strong>modelo TA.0521</strong>.</li><li>Eliges tu <strong>base de cotización</strong> dentro del sistema de cotización por <strong>ingresos reales</strong>. La pista práctica: estima tus rendimientos netos con prudencia y empieza por una base baja; subir base es fácil (hasta 6 veces al año) y evita pagar de más al principio.</li><li><strong>Plazo:</strong> el alta se tramita <strong>con carácter previo</strong> al inicio de la actividad y hasta <strong>60 días antes</strong>. Si la haces fuera de plazo, surte efecto desde el <strong>día 1 del mes</strong> (pierdes el prorrateo) y puede acarrear recargos.</li></ul>
      <blockquote><p>Orden recomendado: primero Hacienda, después Seguridad Social, y siempre <strong>antes</strong> de emitir tu primera factura.</p></blockquote>
      <h2>Documentación que necesitas</h2>
      <ul><li>DNI o NIE.</li><li>Certificado digital o Cl@ve (para hacerlo todo online).</li><li>Datos de tu actividad: epígrafe del IAE, dirección y fecha de inicio.</li><li>Cuenta bancaria (IBAN) para domiciliar la cuota.</li></ul>
      <h2>La tarifa plana en 2026</h2>
      <p>Los nuevos autónomos pueden acogerse a la <strong>tarifa plana de 80 €/mes</strong> durante los <strong>12 primeros meses</strong>, sea cual sea el tramo que les correspondería por sus ingresos. Lo que conviene saber:</p>
      <ul><li>Esos <strong>80 € son planos</strong> (la tarifa plana no incluye el MEI): es la cuota completa del primer año.</li><li>Es <strong>prorrogable otros 12 meses</strong> si tus rendimientos netos del primer año quedan por debajo del SMI.</li><li>Requisitos: <strong>no haber estado de alta en el RETA en los 2 años anteriores</strong> (3 años si ya disfrutaste antes de esta bonificación) y estar al corriente con Hacienda y la Seguridad Social.</li><li>Para personas con <strong>discapacidad ≥ 33 %</strong>, víctimas de violencia de género o de terrorismo, el periodo inicial bonificado es de <strong>24 meses</strong>.</li><li>Se marca al darse de alta en el <strong>modelo TA.0521</strong>. Si se olvida, se pierde.</li></ul>
      <p>Además, varias comunidades autónomas (Andalucía, Madrid, Galicia, Murcia, La Rioja…) tienen una <strong>"cuota cero"</strong> que cubre esos 80 € y deja tu pago en 0 € durante el periodo bonificado. Pasado ese periodo, pagas según la <strong>cuota por ingresos reales</strong> (tramos). Tienes el detalle de cuánto pagarás después en <Link href="/blog/cuota-autonomos-2026">Cuota de autónomos 2026</Link>.</p>
      <h2>Después del alta: tus obligaciones básicas</h2>
      <p>Una vez dado de alta, tu calendario incluye normalmente:</p>
      <ul><li><strong>IVA trimestral</strong> con el <Link href="/blog/modelo-303">modelo 303</Link>.</li><li><strong>IRPF trimestral</strong> con el <Link href="/blog/modelo-130">modelo 130</Link>, si tributas en estimación directa y no retienes en la mayoría de tus facturas.</li><li><strong>Facturar correctamente</strong> desde el primer día (y, desde julio de 2027, con software conforme a Verifactu).</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto cuesta darse de alta como autónomo?</strong> El alta en Hacienda y en la Seguridad Social es gratuita. El único coste es la cuota mensual del RETA, reducida a 80 € con la tarifa plana (o a 0 € si tu comunidad tiene cuota cero).</p>
      <p><strong>¿Qué hago primero, Hacienda o Seguridad Social?</strong> Primero el alta censal en Hacienda (036/037) y después el alta en el RETA. Todo, antes de empezar a facturar.</p>
      <p><strong>¿Necesito gestor para darme de alta?</strong> No. Puedes hacerlo tú mismo online con certificado digital o Cl@ve. El trámite es sencillo; un gestor solo te ahorra el rato de buscar el epígrafe y la base, pero no es obligatorio.</p>
      <p><strong>¿Cómo sé qué epígrafe del IAE me corresponde?</strong> Mira el listado oficial del IAE y elige el que describe tu actividad real. Si haces varias cosas (por ejemplo, diseño y formación), puedes darte de alta en varios epígrafes. La sección del epígrafe (primera = empresarial, segunda = profesional) determina además si retienes IRPF en factura.</p>
      <p><strong>¿Puedo darme de alta solo unos días al mes?</strong> Sí: hasta <strong>3 altas y 3 bajas por año natural</strong> con efecto el día real (cuota prorrateada por días). A partir de la cuarta, el alta cuenta desde el día 1 y la baja hasta el último día del mes. La baja se comunica en los 3 días naturales siguientes al cese.</p>
      <p><strong>¿Tengo que emitir facturas desde el primer día?</strong> Sí. Toda actividad debe documentarse con factura. Conviene tener listo el método de facturación antes de empezar.</p>
      <h2>En resumen</h2>
      <p>Darse de alta es gratis y se hace online en dos pasos: primero Hacienda (036/037), luego Seguridad Social (RETA), y siempre antes de tu primera factura. Con la tarifa plana de 80 € —o la cuota cero de tu comunidad— el arranque es barato. Cuando tengas el alta, lo siguiente es facturar bien y llevar los impuestos al día: ClientLabs te deja emitir tu primera factura conforme y tener el IVA y el IRPF calculados sin montar una hoja de cálculo.</p>
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
      <p>Si eres autónomo profesional y facturas a empresas o a otros autónomos, por norma general aplicas una retención de IRPF del <strong>15 %</strong>. Si acabas de empezar, puedes usar el <strong>7 %</strong> durante los primeros años. Y hay casos en los que <strong>no se pone retención</strong>: cuando facturas a particulares o cuando tu actividad es empresarial y no profesional. Aquí tienes cuándo va cada una, sin medias tintas.</p>
      <h2>La regla rápida</h2>
      <table><thead><tr><th>Situación</th><th>Retención</th></tr></thead><tbody><tr><td>Autónomo <strong>profesional</strong> → empresa o autónomo</td><td><strong>15 %</strong></td></tr><tr><td><strong>Nuevo</strong> autónomo profesional (año de alta + 2 siguientes)</td><td><strong>7 %</strong></td></tr><tr><td>Factura a un <strong>particular</strong> (consumidor final)</td><td><strong>Sin retención</strong></td></tr><tr><td>Actividad <strong>empresarial</strong> (no profesional) en estimación directa</td><td>Normalmente <strong>sin retención</strong></td></tr><tr><td>Cliente <strong>extranjero</strong> (empresa fuera de España)</td><td><strong>Sin retención</strong></td></tr></tbody></table>
      <blockquote><p>La retención <strong>no es un coste extra ni dinero que pierdes</strong>: es un adelanto de tu IRPF que tu cliente ingresa en Hacienda en tu nombre. Lo recuperas (o ajustas) en la declaración de la renta.</p></blockquote>
      <h2>Ejemplo de cálculo</h2>
      <p>Facturas un servicio profesional de <strong>1.000 €</strong> a una empresa, con retención del 15 %:</p>
      <ul><li>Base imponible: 1.000 €</li><li>IVA (21 %): +210 €</li><li>Retención IRPF (15 %): −150 €</li><li><strong>Total que te paga el cliente: 1.060 €</strong></li></ul>
      <p>Tu cliente te transfiere 1.060 € e ingresa los 150 € de retención a Hacienda a tu nombre. La retención se calcula <strong>siempre sobre la base imponible</strong> (los 1.000 €), nunca sobre el total con IVA.</p>
      <h2>Cuándo se aplica el 7 %</h2>
      <p>Los autónomos <strong>profesionales</strong> que se dan de alta (sin haber ejercido una actividad profesional el año anterior) pueden aplicar el <strong>7 %</strong> el año de alta y los <strong>dos años siguientes</strong>; después salta automáticamente al 15 %.</p>
      <p><strong>Ejemplo:</strong> si te das de alta en mayo de 2026, aplicas el 7 % durante el resto de 2026, todo 2027 y todo 2028, y pasas al 15 % desde enero de 2029.</p>
      <p>Es opcional: puedes poner el 15 % desde el principio si lo prefieres (te retienen más, pero te ajustas más en la Renta). El 7 % te deja más liquidez durante el arranque.</p>
      <h2>Cuándo NO se pone retención</h2>
      <ul><li><strong>Facturas a particulares.</strong> Un consumidor final no practica retención. Si tu cliente es una persona que compra para sí misma, factura sin retención.</li><li><strong>Actividades empresariales</strong> (comercio, hostelería, producción, fabricación) en estimación directa: por norma general no llevan retención en factura. El adelanto del IRPF lo haces tú con el <Link href="/blog/modelo-130">modelo 130</Link>.</li><li><strong>Clientes extranjeros:</strong> las facturas a empresas de fuera de España <strong>no llevan retención de IRPF</strong>, porque la retención solo aplica cuando el pagador es español y está obligado a retener. Esos ingresos cuentan como "sin retención" para la regla del 70 % del <Link href="/blog/modelo-130">modelo 130</Link>.</li></ul>
      <h2>Profesional o empresarial: por qué decide todo</h2>
      <p>La retención va ligada a las actividades <strong>profesionales</strong>, que son las de la <strong>sección segunda del IAE</strong>: consultores, diseñadores, abogados, arquitectos, traductores, médicos, etc. Las <strong>empresariales</strong> (sección primera del IAE: comercio, hostelería, transporte, producción) normalmente <strong>no retienen</strong> en factura.</p>
      <p>Si no sabes en qué sección estás, mira el epígrafe del IAE que declaraste en tu alta censal (modelo 036/037): ahí figura tu actividad y su clasificación. Es el dato que determina si pones retención o no.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué retención pongo si soy nuevo autónomo?</strong> Puedes optar por el 7 % en el año de alta y los dos siguientes; después, el 15 %. También puedes poner el 15 % desde el principio si lo prefieres.</p>
      <p><strong>¿Pongo retención en facturas a particulares?</strong> No. Solo se practica retención cuando el cliente es una empresa u otro autónomo obligado a retener.</p>
      <p><strong>¿La retención es dinero que pierdo?</strong> No. Es un adelanto de tu IRPF: lo regularizas en la declaración de la renta, donde se descuenta de lo que te toca pagar (y puede salirte a devolver).</p>
      <p><strong>¿Quién ingresa la retención en Hacienda?</strong> Tu cliente. Por eso te paga el importe ya descontado: él se encarga de ingresar esa retención a tu nombre con el modelo 111.</p>
      <p><strong>Si me retienen en la mayoría de facturas, ¿tengo que presentar el modelo 130?</strong> No necesariamente. Si el 70 % o más de tus ingresos del año anterior llevaron retención, quedas exento del 130. Lo vemos en <Link href="/blog/modelo-130">Modelo 130</Link>.</p>
      <p><strong>¿La retención cambia el IVA de la factura?</strong> No. IVA y retención son independientes: el IVA se suma, la retención se resta, y ambos se calculan sobre la base imponible.</p>
      <h2>En resumen</h2>
      <p>15 % por defecto, 7 % si estás empezando, y nada cuando facturas a particulares, a clientes extranjeros o si tu actividad es empresarial. La pista que decide todo es tu epígrafe del IAE: profesional retiene, empresarial no. ClientLabs aplica la retención correcta a cada factura según el tipo de cliente y te deja el total ya calculado, sin que tengas que repasar porcentajes en cada emisión.</p>
    </div>
  ),
  "modelo-130": (
    <div>
      <h2>Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula</h2>
      <p>El modelo 130 es el pago fraccionado del IRPF: cada trimestre adelantas a Hacienda el <strong>20 % del beneficio</strong> acumulado de tu actividad. Lo presentan los autónomos en estimación directa que <strong>no</strong> retienen IRPF en la mayoría de sus facturas. Si la mayor parte de lo que facturas ya lleva retención, lo más probable es que estés exento. Aquí tienes quién lo presenta, cómo se calcula y cómo no pagar de más.</p>
      <h2>Qué es exactamente</h2>
      <p>Es la forma de ir pagando tu IRPF a lo largo del año en lugar de soltarlo todo de golpe en la declaración de la renta. Cada trimestre declaras tus ingresos y gastos acumulados y abonas el 20 % de la diferencia. Después, en la Renta, se regulariza todo: lo que adelantaste con los 130 se descuenta de lo que te toca pagar.</p>
      <h2>Quién está obligado (y quién no)</h2>
      <p>La clave está en si tu actividad <strong>retiene IRPF en factura</strong> o no:</p>
      <ul><li><strong>Obligado:</strong> autónomo en <strong>estimación directa</strong> cuya actividad <strong>no</strong> practica retención, o que retuvo en <strong>menos del 70 %</strong> de sus ingresos del año anterior. Esto incluye a la mayoría de <strong>actividades empresariales</strong> (comercio, hostelería, producción), que no retienen en factura.</li><li><strong>Exento:</strong> si el <strong>70 % o más</strong> de tus ingresos del año anterior ya llevaron retención de IRPF en factura. En ese caso, Hacienda ya va cobrando vía retenciones y no presentas el 130. Es lo habitual en muchos <strong>profesionales</strong> (consultores, diseñadores, abogados) que facturan a empresas con retención.</li></ul>
      <p>Un caso especial: si tributas en <strong>módulos</strong> (estimación objetiva), no usas el 130, sino el <strong>modelo 131</strong>.</p>
      <h2>Cómo se calcula</h2>
      <p>La fórmula del trimestre es:</p>
      <p><strong>(Ingresos acumulados − Gastos acumulados) × 20 % − pagos de trimestres anteriores − retenciones soportadas</strong></p>
      <p>Lo importante es que el cálculo es <strong>acumulado</strong>: en cada trimestre sumas todo el año hasta esa fecha y restas lo que ya pagaste en los trimestres previos. No se calcula trimestre suelto.</p>
      <h3>Ejemplo</h3>
      <p>Primer trimestre, actividad sin retención:</p>
      <ul><li>Ingresos acumulados: 9.000 €</li><li>Gastos deducibles acumulados: 3.000 €</li><li>Beneficio: 6.000 €</li><li><strong>Pago fraccionado: 6.000 × 20 % = 1.200 €</strong></li></ul>
      <p>En el segundo trimestre sumarías los ingresos y gastos de enero a junio, calcularías el 20 % del beneficio total y le restarías los 1.200 € ya pagados en el primero.</p>
      <h2>Plazos de presentación en 2026</h2>
      <table><thead><tr><th>Trimestre</th><th>Periodo</th><th>Plazo</th></tr></thead><tbody><tr><td>1T</td><td>enero – marzo</td><td>1 – 20 de abril</td></tr><tr><td>2T</td><td>abril – junio</td><td>1 – 20 de julio</td></tr><tr><td>3T</td><td>julio – septiembre</td><td>1 – 20 de octubre</td></tr><tr><td>4T</td><td>octubre – diciembre</td><td>1 – 30 de enero de 2027</td></tr></tbody></table>
      <p>Con <strong>domiciliación bancaria</strong>, el cargo se adelanta unos 5 días respecto al fin de cada plazo.</p>
      <h2>Los errores que te hacen pagar de más</h2>
      <ul><li><strong>Olvidar gastos deducibles.</strong> Cada gasto que no incluyes hace que pagues un 20 % de más sobre ese importe. Es el error más caro y el más frecuente. Repasa la <Link href="/blog/gastos-deducibles-autonomo-2026">lista de gastos deducibles</Link>.</li><li><strong>No acumular bien.</strong> El 130 es acumulativo; calcular cada trimestre por separado descuadra el total del año.</li><li><strong>Presentar fuera de plazo.</strong> Genera recargo automático.</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Quién presenta el modelo 130?</strong> Autónomos en estimación directa cuya actividad no retiene IRPF, o que retuvieron en menos del 70 % de sus ingresos del año anterior. En módulos se usa el 131.</p>
      <p><strong>¿Cuándo estoy exento del 130?</strong> Cuando el 70 % o más de tus ingresos del año anterior ya llevaron retención de IRPF en factura. Entonces no lo presentas, porque Hacienda ya cobra por la vía de las retenciones.</p>
      <p><strong>¿Cuánto se paga con el 130?</strong> El 20 % del beneficio acumulado (ingresos − gastos), menos lo ya pagado en trimestres anteriores y las retenciones que te hayan practicado.</p>
      <p><strong>¿El 130 es lo mismo que el 303?</strong> No. El <Link href="/blog/modelo-303">303</Link> es el IVA; el 130 es el adelanto del IRPF. Se presentan en los mismos plazos pero son impuestos distintos.</p>
      <p><strong>Si presento el 130, ¿también hago la declaración de la renta?</strong> Sí. El 130 son adelantos a cuenta; en la Renta se regulariza todo y se ajusta lo que falte o sobre.</p>
      <p><strong>¿Puede salir negativo el 130?</strong> Sí. Si un trimestre tienes pérdidas o el beneficio acumulado baja, el resultado puede ser cero o negativo. En ese caso presentas igualmente, pero no ingresas.</p>
      <h2>En resumen</h2>
      <p>El 130 es tu IRPF a plazos: un 20 % del beneficio cada trimestre, salvo que ya retengas en la mayoría de tus facturas. La diferencia entre pagar lo justo y pagar de más está en una sola cosa: registrar todos tus gastos deducibles. ClientLabs lleva tus ingresos y gastos al día y te muestra el resultado del periodo listo para presentar, sin que tengas que acumular cifras a mano.</p>
    </div>
  ),
}
