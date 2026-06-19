import React from "react"
import Link from "next/link"

export const ARTICLES_1_5: Record<string, React.ReactNode> = {
  "verifactu-2026": (
    <div>
      <h2>Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya</h2>
      <p>Verifactu es el sistema de facturación verificable que exige la normativa española para que cada factura emitida por software sea trazable e inalterable. La novedad de 2026 es el calendario: el 2 de diciembre de 2025 se aprobó un aplazamiento, así que la obligación entra <strong>el 1 de enero de 2027 para empresas y el 1 de julio de 2027 para autónomos</strong>. Los requisitos técnicos no han cambiado, solo las fechas.</p>
      <h2>Qué es Verifactu (en una frase)</h2>
      <p>Es la parte del Reglamento que regula los Sistemas Informáticos de Facturación (RD 1007/2023 y Orden HAC/1177/2024). Obliga a que tu programa de facturación genere registros que no se puedan borrar ni manipular y, en modo Verifactu, los remita a la Agencia Tributaria. No es un impuesto nuevo ni un trámite que hagas tú a mano: es un requisito que debe cumplir el <strong>software</strong> que usas para facturar.</p>
      <h2>Por qué se aplazó a 2027</h2>
      <p>El calendario original situaba la obligación en 2026. El <strong>2 de diciembre de 2025</strong> se aprobó un aplazamiento que mueve las fechas un año, dando más margen tanto a los obligados como a los fabricantes de software. Lo importante: <strong>solo cambió el calendario</strong>, no los requisitos técnicos del sistema.</p>
      <table><thead><tr><th>Obligado</th><th>Fecha desde la que es obligatorio</th></tr></thead><tbody><tr><td>Empresas (sujetas al Impuesto sobre Sociedades)</td><td>1 de enero de 2027</td></tr><tr><td>Autónomos y resto de obligados</td><td>1 de julio de 2027</td></tr></tbody></table>
      <h2>Qué te obliga ya (aunque la fecha sea 2027)</h2>
      <p>Que la obligación general llegue en 2027 no significa que puedas ignorarla:</p>
      <ul><li><strong>Si usas software de facturación, debe ir hacia un sistema conforme.</strong> Cuando llegue tu fecha, el programa tendrá que generar facturas con todos los elementos obligatorios. Elegir ahora una herramienta ya conforme te evita migrar con prisas.</li><li><strong>Cada factura emitida por software debe llevar:</strong> huella o *hash*, encadenamiento con la factura anterior, código QR y, en modo Verifactu, la leyenda **"VERI*FACTU"** o "factura verificable".</li><li><strong>El encadenamiento importa.</strong> Cada registro se enlaza con el anterior, de forma que no se pueda colar ni eliminar una factura sin dejar rastro.</li></ul>
      <h2>Sanciones: por qué no conviene improvisar</h2>
      <ul><li>Hasta <strong>50.000 €</strong> por usar (o fabricar) software de facturación no conforme.</li><li><strong>1.000 €</strong> por cada factura emitida sin el código QR o sin la leyenda obligatoria.</li></ul>
      <p>No son multas simbólicas: el coste de no adaptarse supera con creces el de cambiar de programa a tiempo.</p>
      <h2>Quién está exento</h2>
      <ul><li><strong>País Vasco y Navarra:</strong> tienen régimen foral propio y su sistema es <strong>TicketBAI</strong>, no Verifactu.</li><li><strong>Quien factura 100 % a mano</strong>, sin ningún software. En la práctica, en cuanto usas un programa para facturar, entras en el ámbito de la norma.</li></ul>
      <h2>Verifactu no es lo mismo que la factura electrónica B2B</h2>
      <p>Es la confusión más habitual. Son <strong>dos obligaciones distintas</strong>:</p>
      <ul><li><strong>Verifactu</strong> regula *cómo* tu software registra y conserva cada factura (huella, QR, encadenamiento).</li><li><strong>La factura electrónica obligatoria entre empresas</strong> (Ley Crea y Crece) regula que las facturas entre empresas y autónomos sean electrónicas y estructuradas. Está <strong>pendiente del reglamento definitivo</strong>; cuando se publique, habrá <strong>1 año de plazo para grandes empresas y 2 años para autónomos y pymes</strong>.</li></ul>
      <p>Puedes cumplir una y no la otra, así que conviene tenerlas separadas en la cabeza.</p>
      <h2>Qué hacer ahora, sin agobios</h2>
      <ol><li>Comprueba si tu programa de facturación es (o será) conforme a Verifactu.</li><li>Si facturas en Excel o en Word, ve pensando en dar el salto: esos métodos no generan huella ni QR.</li><li>No esperes a 2027 para decidir. Migrar con margen es barato; hacerlo a contrarreloj, no.</li></ol>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Verifactu es obligatorio en 2026?</strong> No. Tras el aplazamiento del 2 de diciembre de 2025, la obligación entra el 1 de enero de 2027 para empresas y el 1 de julio de 2027 para autónomos.</p>
      <p><strong>¿Tengo que enviar yo las facturas a Hacienda?</strong> No manualmente. Lo hace el software en modo Verifactu. Tu trabajo es usar un programa conforme.</p>
      <p><strong>Si facturo a mano en papel, ¿me afecta?</strong> No, mientras no uses ningún software para emitir facturas. En cuanto usas un programa, entras en el ámbito de la norma.</p>
      <p><strong>¿Verifactu sustituye al modelo 303 o al 130?</strong> No. Verifactu regula la emisión de facturas; el <Link href="/blog/modelo-303">modelo 303</Link> y el <Link href="/blog/modelo-130">modelo 130</Link> siguen siendo tus declaraciones de IVA e IRPF.</p>
      <p><strong>¿Qué pasa si mi software no lleva QR ni leyenda?</strong> Te expones a 1.000 € por factura sin QR o leyenda y hasta 50.000 € por usar software no conforme.</p>
      <h2>En resumen</h2>
      <p>Verifactu llega en 2027, no en 2026, pero la decisión que sí puedes tomar ya es elegir un programa de facturación que cumpla de serie. ClientLabs emite facturas conformes —con huella, QR y encadenamiento— sin que tengas que configurar nada técnico, para que llegues a tu fecha sin sustos.</p>
    </div>
  ),
  "factura-electronica-obligatoria": (
    <div>
      <h2>Factura electrónica obligatoria: a quién afecta y desde cuándo</h2>
      <p>La factura electrónica obligatoria entre empresas y autónomos llega con la Ley Crea y Crece, pero todavía <strong>no está en vigor</strong>: depende de un reglamento que aún no se ha publicado. Cuando se publique, habrá <strong>1 año de plazo para grandes empresas y 2 años para autónomos y pymes</strong>. Y ojo: esto <strong>no es lo mismo que Verifactu</strong>.</p>
      <h2>Qué es (y qué no)</h2>
      <p>La Ley Crea y Crece obliga a que las facturas <strong>entre empresas y autónomos (B2B)</strong> sean electrónicas y estructuradas, para reducir la morosidad y digitalizar las relaciones comerciales. No afecta a las facturas a particulares (B2C).</p>
      <h2>A quién afecta y desde cuándo</h2>
      <ul><li>Afecta a <strong>operaciones B2B</strong> (empresa/autónomo → empresa/autónomo).</li><li>Está <strong>pendiente del reglamento definitivo</strong>.</li><li>Tras su publicación: <strong>1 año para grandes empresas</strong> y <strong>2 años para autónomos y pymes</strong> [los plazos cuentan desde la publicación del reglamento].</li></ul>
      <p>Como la fecha de partida aún no existe, no hay calendario cerrado: lo razonable es estar preparado, no correr.</p>
      <h2>La confusión clave: Crea y Crece ≠ Verifactu</h2>
      <p>Son <strong>dos obligaciones distintas</strong> y mucha gente las mezcla:</p>
      <table><thead><tr><th></th><th>Factura electrónica B2B (Crea y Crece)</th><th>Verifactu (RD 1007/2023)</th></tr></thead><tbody><tr><td>Qué regula</td><td>Que la factura entre empresas sea <strong>electrónica y estructurada</strong></td><td>Cómo el <strong>software</strong> registra y conserva cada factura</td></tr><tr><td>A quién</td><td>Operaciones B2B</td><td>Quien factura con software</td></tr><tr><td>Estado</td><td>Pendiente de reglamento</td><td>Aprobado, con calendario</td></tr><tr><td>Fechas</td><td>1 año (grandes) / 2 años (pymes) tras el reglamento</td><td>Empresas 1/1/2027, autónomos 1/7/2027</td></tr></tbody></table>
      <p>Puedes estar sujeto a una, a la otra o a ambas. Tienes el detalle de la segunda en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <h2>Qué hacer ahora</h2>
      <ol><li><strong>No confundir plazos:</strong> Verifactu tiene fechas (2027); Crea y Crece aún no.</li><li><strong>Usar software que emita en formato electrónico estructurado</strong>, para no rehacer nada cuando llegue el reglamento.</li><li><strong>Estar al día de la publicación</strong> del reglamento de Crea y Crece.</li></ol>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿La factura electrónica B2B ya es obligatoria?</strong> No. Falta el reglamento definitivo. Cuando se publique, habrá 1 año (grandes empresas) y 2 años (autónomos y pymes).</p>
      <p><strong>¿Tengo que hacer factura electrónica a mis clientes particulares?</strong> No. La obligación de Crea y Crece es para operaciones entre empresas y autónomos (B2B).</p>
      <p><strong>¿Es lo mismo que Verifactu?</strong> No. Verifactu regula cómo tu software registra las facturas; Crea y Crece, que las facturas B2B sean electrónicas.</p>
      <p><strong>¿Qué hago mientras tanto?</strong> Usar un programa que ya emita en formato electrónico y sea conforme con Verifactu, para no migrar dos veces.</p>
      <h2>En resumen</h2>
      <p>La factura electrónica B2B llegará, pero aún sin fecha; Verifactu sí la tiene. Tener un software preparado para ambas te evita sustos. ClientLabs emite facturas conformes con Verifactu y en formato electrónico, listo para lo que venga.</p>
    </div>
  ),
  "errores-factura-autonomo": (
    <div>
      <h2>7 errores de factura que más multas generan al autónomo</h2>
      <p>La mayoría de sanciones por facturación no vienen de fraudes, sino de descuidos: numeración con saltos, datos incompletos o un IVA mal calculado. Estos son los siete errores que más caro salen y cómo evitarlos antes de que lleguen al trimestre o a una inspección.</p>
      <h2>1. Numeración con saltos o repetida</h2>
      <p>La factura debe ir con <strong>número correlativo y sin huecos</strong>. Saltarte un número o repetirlo es una señal de alarma para Hacienda. Solución: numeración automática y series claras (<code>2026-001</code>, <code>2026-002</code>).</p>
      <h2>2. Datos obligatorios incompletos</h2>
      <p>Falta el NIF del cliente, la dirección o el desglose del IVA. Una factura incompleta <strong>no es deducible</strong> para tu cliente y es subsanable solo hasta cierto punto. Revisa la lista en <Link href="/blog/como-hacer-una-factura">cómo hacer una factura</Link>.</p>
      <h2>3. Tipo de IVA equivocado</h2>
      <p>Aplicar 21 % donde correspondía 10 % (o al revés). El error se arrastra al <Link href="/blog/modelo-303">modelo 303</Link> y puede acabar en una regularización con recargo.</p>
      <h2>4. Olvidar la retención de IRPF</h2>
      <p>Si eres profesional y facturas a empresas, debes aplicar retención (15 % o 7 %). Olvidarla descuadra tu IRPF. Lo aclaramos en <Link href="/blog/retencion-irpf-factura">qué retención poner</Link>.</p>
      <h2>5. Borrar una factura ya emitida</h2>
      <p>Si te equivocas, <strong>no la elimines</strong>: emite una <strong>factura rectificativa</strong>. Borrar rompe la numeración y, con Verifactu, el encadenamiento.</p>
      <h2>6. Facturar sin software conforme (de cara a 2027)</h2>
      <p>A partir del 1 de julio de 2027, las facturas por software deben llevar huella, QR y encadenamiento (Verifactu). Emitir sin eso expone a <strong>1.000 € por factura</strong> sin QR o leyenda y hasta <strong>50.000 €</strong> por software no conforme. Contexto en <Link href="/blog/verifactu-2026">Verifactu en 2026</Link>.</p>
      <h2>7. No guardar las facturas</h2>
      <p>Sin el justificante, no puedes deducir un gasto ni defender un ingreso. Hacienda revisa hasta 4 años (art. 66 LGT) y el Código de Comercio obliga a conservar 6 años: guarda todo <strong>mínimo 6 años</strong>.</p>
      <h2>Tabla resumen</h2>
      <table><thead><tr><th>Error</th><th>Riesgo</th><th>Cómo evitarlo</th></tr></thead><tbody><tr><td>Numeración con saltos</td><td>Factura inválida</td><td>Numeración automática</td></tr><tr><td>Datos incompletos</td><td>No deducible</td><td>Plantilla con todos los campos</td></tr><tr><td>IVA mal aplicado</td><td>Regularización + recargo</td><td>Tipos predefinidos</td></tr><tr><td>Sin retención IRPF</td><td>IRPF descuadrado</td><td>Reglas por tipo de cliente</td></tr><tr><td>Borrar facturas</td><td>Rompe numeración</td><td>Rectificativa</td></tr><tr><td>Software no conforme</td><td>Hasta 50.000 €</td><td>Programa con Verifactu</td></tr><tr><td>No archivar</td><td>Pierdes la deducción</td><td>Guardar mínimo 6 años</td></tr></tbody></table>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué pasa si me salto un número de factura?</strong> La numeración debe ser correlativa; un salto puede invalidar la factura y llamar la atención de Hacienda. Usa una rectificativa si anulas.</p>
      <p><strong>¿Puedo corregir una factura ya enviada?</strong> Sí, con una factura rectificativa. Nunca borrándola.</p>
      <p><strong>¿Cuánto puede costarme facturar mal?</strong> Con Verifactu, hasta 1.000 € por factura sin QR/leyenda y hasta 50.000 € por software no conforme; antes de eso, recargos por errores de IVA o IRPF.</p>
      <p><strong>¿Cuánto guardo las facturas?</strong> Hacienda revisa hasta 4 años (art. 66 LGT); por el Código de Comercio (art. 30), conserva la documentación un mínimo de 6 años.</p>
      <h2>En resumen</h2>
      <p>Casi todos estos errores desaparecen con un programa que numere, calcule impuestos y conserve cada factura. ClientLabs hace ese trabajo por ti y emite conforme a Verifactu, para que el trimestre no traiga sorpresas.</p>
    </div>
  ),
  "modelo-303": (
    <div>
      <h2>Modelo 303: cómo calcular tu IVA sin equivocarte de casilla</h2>
      <p>El modelo 303 es la declaración trimestral del IVA: pagas a Hacienda el <strong>IVA que has cobrado</strong> a tus clientes menos el <strong>IVA que has pagado</strong> en tus gastos. Si cobraste más del que pagaste, ingresas la diferencia; si pagaste más, sale a compensar o a devolver. Aquí va el cálculo y las casillas que más se confunden.</p>
      <h2>La fórmula</h2>
      <p><strong>IVA repercutido (el que cobras) − IVA soportado (el que pagas) = resultado</strong></p>
      <ul><li>Resultado <strong>positivo</strong> → ingresas esa cantidad.</li><li>Resultado <strong>negativo</strong> → a compensar en trimestres siguientes (o a devolver en el último).</li></ul>
      <h2>Ejemplo</h2>
      <p>Un trimestre:</p>
      <ul><li>Facturas emitidas: 10.000 € de base → <strong>IVA repercutido (21 %): 2.100 €</strong></li><li>Gastos con IVA: 3.000 € de base → <strong>IVA soportado (21 %): 630 €</strong></li><li><strong>A ingresar: 2.100 − 630 = 1.470 €</strong></li></ul>
      <h2>Las casillas que más se confunden</h2>
      <ul><li><strong>IVA repercutido:</strong> el de tus facturas emitidas, separado por tipo (21 %, 10 %, 4 %).</li><li><strong>IVA soportado deducible:</strong> el de tus gastos <strong>vinculados a la actividad</strong> y con factura. Aquí está el error típico: meter IVA de gastos que no son deducibles. Revisa <Link href="/blog/gastos-deducibles-autonomo-2026">qué puedes deducir</Link>.</li><li><strong>Resultado:</strong> la diferencia. Si sale negativo, marca "a compensar".</li></ul>
      <h2>Plazos trimestrales en 2026</h2>
      <table><thead><tr><th>Trimestre</th><th>Periodo</th><th>Plazo</th></tr></thead><tbody><tr><td>1T</td><td>enero–marzo</td><td>1–20 de abril</td></tr><tr><td>2T</td><td>abril–junio</td><td>1–20 de julio</td></tr><tr><td>3T</td><td>julio–septiembre</td><td>1–20 de octubre</td></tr><tr><td>4T</td><td>octubre–diciembre</td><td>1–30 de enero (2027)</td></tr></tbody></table>
      <p>Si un plazo cae en festivo o fin de semana, pasa al siguiente día hábil. En enero se presenta además el <strong>modelo 390</strong> (resumen anual de IVA), hasta el 30-31 de enero.</p>
      <h2>Errores que cuestan dinero</h2>
      <ul><li><strong>Deducir IVA de gastos no afectos</strong> a la actividad.</li><li><strong>No separar por tipos</strong> de IVA.</li><li><strong>Olvidar facturas</strong> del trimestre (descuadra con tus registros).</li><li><strong>Presentar tarde:</strong> recargo automático.</li></ul>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Qué es el modelo 303?</strong> La autoliquidación trimestral del IVA: IVA cobrado menos IVA pagado deducible.</p>
      <p><strong>¿Cuándo se presenta?</strong> En abril, julio, octubre y enero, dentro de los primeros 20 días (30 en el 4T).</p>
      <p><strong>¿Qué pasa si sale negativo?</strong> Lo compensas en los siguientes trimestres; en el último del año puedes pedir devolución.</p>
      <p><strong>¿El 303 es lo mismo que el 130?</strong> No. El 303 es el IVA; el <Link href="/blog/modelo-130">130</Link> es el adelanto del IRPF.</p>
      <p><strong>¿Qué IVA de mis gastos puedo deducir?</strong> El de gastos vinculados a la actividad y con factura completa. Detalle en <Link href="/blog/gastos-deducibles-autonomo-2026">gastos deducibles</Link>.</p>
      <h2>En resumen</h2>
      <p>El 303 es restar dos cifras bien llevadas. El truco no es la fórmula, sino tener cada factura e ingreso registrado. ClientLabs te muestra el IVA repercutido y soportado del trimestre listo para el 303, sin cuadrar nada a mano.</p>
      <blockquote><p>Información general, no asesoramiento personalizado.</p></blockquote>
    </div>
  ),
  "cuota-autonomos-2026": (
    <div>
      <h2>Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos)</h2>
      <p>Desde 2023, los autónomos cotizan por <strong>ingresos reales</strong>: cuanto más ganas (rendimiento neto), más alta es tu base mínima y, por tanto, tu cuota. En 2026 sigue ese sistema de tramos, con la <strong>tarifa plana</strong> para quien empieza. Aquí tienes cómo funciona y cómo estimar lo que te toca pagar.</p>
      <h2>Cómo funciona la cotización por ingresos reales</h2>
      <ol><li><strong>Estimas tu rendimiento neto</strong> mensual (ingresos − gastos − deducciones).</li><li>Ese rendimiento te sitúa en un <strong>tramo</strong>, con una base mínima y máxima.</li><li>Eliges una base dentro del tramo y sobre ella se calcula la cuota.</li><li>La Seguridad Social <strong>regulariza</strong> al año siguiente según lo que ganaste de verdad.</li></ol>
      <blockquote><p>Cuotas de 2026 según la <strong>Orden PJC/297/2026</strong> (BOE de 31 de marzo de 2026). Las cuotas están <strong>congeladas</strong> respecto a 2025. Hay 15 tramos por rendimiento neto y el tipo general es del <strong>30,50 %</strong> sobre la base.</p></blockquote>
      <h2>Tabla de tramos (estructura)</h2>
      <table><thead><tr><th>Rendimiento neto</th><th>Cuota 2026/mes</th></tr></thead><tbody><tr><td>≤ 670 €/mes (tramo más bajo)</td><td>200 €</td></tr><tr><td>Tramos intermedios</td><td>entre 200 € y 590 €</td></tr><tr><td>&gt; 6.000 €/mes (tramo más alto)</td><td>590 €</td></tr></tbody></table>
      <p>Hay <strong>15 tramos</strong>: 3 en la <strong>tabla reducida</strong> (rendimientos por debajo de 1.166,70 €/mes) y 12 en la <strong>tabla general</strong>. La cuota va de <strong>200 €/mes</strong> (rendimientos ≤ 670 €/mes) a <strong>590 €/mes</strong> (más de 6.000 €/mes).</p>
      <p>La idea: a más rendimiento, mayor base mínima y mayor cuota. Sobre la cuota se aplica además el <strong>MEI</strong>, que en 2026 sube al <strong>0,9 %</strong> (desde el 0,8 %) y seguirá subiendo hasta el 1,2 % en 2029.</p>
      <h2>La tarifa plana para nuevos autónomos</h2>
      <p>Si te das de alta por primera vez (o llevas años sin serlo), puedes acogerte a la <strong>tarifa plana</strong>: <strong>80 € de base los 12 primeros meses</strong> (con el MEI, la cuota real ronda los <strong>88,64 €/mes</strong>), prorrogable otros 12 si tus rendimientos quedan por debajo del SMI. Detalle del alta en <Link href="/blog/darse-de-alta-como-autonomo-2026">cómo darte de alta como autónomo</Link>.</p>
      <h2>Cómo estimar tu cuota</h2>
      <ol><li>Calcula tu <strong>rendimiento neto</strong> medio (ingresos − gastos deducibles).</li><li>Búscalo en la <strong>tabla de tramos</strong> vigente de 2026.</li><li>Recuerda que puedes <strong>cambiar de base hasta 6 veces al año</strong> si tus ingresos varían.</li></ol>
      <p>Llevar bien tus ingresos y <Link href="/blog/gastos-deducibles-autonomo-2026">gastos deducibles</Link> te da el rendimiento neto real, que es la base de todo este cálculo.</p>
      <h2>Preguntas frecuentes</h2>
      <p><strong>¿Cuánto paga un autónomo en 2026?</strong> Entre 200 €/mes (rendimientos ≤ 670 €/mes) y 590 €/mes (más de 6.000 €/mes), según los 15 tramos de la Orden PJC/297/2026. Las cuotas están congeladas respecto a 2025.</p>
      <p><strong>¿Qué es la tarifa plana?</strong> 80 € de base los primeros 12 meses (cuota real ≈ 88,64 €/mes con el MEI), prorrogable otros 12 si tus rendimientos no superan el SMI.</p>
      <p><strong>¿Puedo cambiar mi cuota si gano menos?</strong> Sí, puedes cambiar la base de cotización hasta 6 veces al año.</p>
      <p><strong>¿Qué pasa si me equivoco al estimar?</strong> La Seguridad Social regulariza al año siguiente con tus ingresos reales: te devuelve o te reclama la diferencia.</p>
      <h2>En resumen</h2>
      <p>Tu cuota depende de lo que ganas, así que conocer tu rendimiento neto real es clave. ClientLabs te da ingresos y gastos al día para que estimes tu tramo y no pagues de más ni de menos.</p>
      <blockquote><p>Información general; confirma las cifras de 2026 con la tabla oficial o tu asesor.</p></blockquote>
    </div>
  ),
}
