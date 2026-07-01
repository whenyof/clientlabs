# Inventario completo del blog — ClientLabs

> Informe generado en modo solo-lectura. **No se ha modificado ningún archivo de contenido.** Las imágenes se ignoran por completo (no se listan portadas, alt ni rutas de `img`).

## PASO 1 — Dónde vive el contenido del blog

**Respuesta corta: el contenido está en ARCHIVOS, NO en la base de datos.**

Verificación de la hipótesis de base de datos:
- `prisma/schema.prisma` **sí** tiene un `model Post { id, title, slug, content, excerpt, category, published, publishedAt, ... }` (línea 789) — pinta de modelo de blog.
- **Pero está muerto:** no hay ninguna llamada `prisma.post.*` en todo el código (`app/`, `lib/`, `src/`, `modules/`, `workers/`, `scripts/`), ningún seed lo rellena, y la página `/blog` no lo consulta.
- **Comprobación en vivo (script Prisma `prisma.post.count()` ejecutado contra la BD):** **`Post rows in DB: 0`** → la tabla está vacía.
- La ruta real de artículos (`app/(marketing)/blog/page.tsx` y `[slug]/page.tsx`) importa `ARTICLES` de `app/blog/data.ts` y `ARTICLE_CONTENT` de `app/blog/content.tsx`. Nada de Prisma.

Por tanto el contenido vive así:

| Pieza | Ruta | Rol |
|---|---|---|
| **Metadatos (fuente de verdad)** | `app/blog/data.ts` | Array `ARTICLES: ArticleMeta[]` con slug, título, categoría, descripción, tags, fecha, `relatedSlugs`, `coverImage`. |
| **Cuerpos renderizados (live)** | `app/blog/content.tsx` → `content-2.tsx`, `content-6-10.tsx`, `content-11-15.tsx`, `content-16-20.tsx`, `content-21-25.tsx` | `ARTICLE_CONTENT: Record<string, React.ReactNode>` — el cuerpo de cada artículo como **JSX** (h2/p/ul/table…). Es lo que se publica. |
| **Cuerpos en Markdown (espejo)** | `content/blog/*.md` (25 ficheros) | Markdown 1:1 con el JSX (frontmatter + cuerpo). **No está referenciado por ningún import** (no hay `gray-matter` ni loader). Sirve como fuente editable. |
| **Páginas (rutas)** | `app/(marketing)/blog/page.tsx`, `app/(marketing)/blog/[slug]/page.tsx`, `app/(marketing)/blog/categoria/[cat]/page.tsx` | Listado, artículo y categoría. El artículo lee `ARTICLES` + `ARTICLE_CONTENT`. |
| **`model Post` (Prisma)** | `prisma/schema.prisma:789` | Modelo de blog **sin usar y con 0 filas**. No es la fuente del contenido. |

**Formato:** TypeScript/TSX (live) con espejo en Markdown. **Total: 25 artículos.**

Los cuerpos de abajo se extraen del espejo Markdown `content/blog/*.md`, **verificado 1:1 contra el JSX live** de `ARTICLE_CONTENT` (mismos h2/p/listas/tablas).

La plantilla de `[slug]/page.tsx` añade a **todos** los artículos: JSON-LD (`Article` + `BreadcrumbList`), bloque de relacionados y una **caja CTA fija** («Gestiona todo esto desde un solo panel / Empezar gratis», `START_HREF`). Por eso **todos** los artículos tienen CTA.

### Notas de discrepancia detectadas

- ⚠️ **Marcadores `[VERIFICAR antes de publicar]` dentro del cuerpo** de varios artículos (comparativas y calendario). Se renderizarían tal cual al usuario. Afecta a: `calendario-fiscal-autonomo-2026`, `mejores-programas-facturacion-autonomos-2026`, `clientlabs-vs-holded`, `alternativas-facturaplus`, `mejores-crm-gratis-autonomos`.
- Los `meta_description` del frontmatter `.md` coinciden con `description` de `data.ts` en los casos revisados.

---

## PASO 2 — Tabla resumen

| # | Título | Slug / URL | Palabras | Estado | Flags |
|---|---|---|---:|---|---|
| 1 | Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya | `/blog/verifactu-2026` | 886 | Publicado | [CTA] [DATO_FISCAL] [FECHA] |
| 2 | Factura electrónica obligatoria: a quién afecta y desde cuándo | `/blog/factura-electronica-obligatoria` | 534 | Publicado | [CTA] [FECHA] |
| 3 | 7 errores de factura que más multas generan al autónomo | `/blog/errores-factura-autonomo` | 619 | Publicado | [CTA] [DATO_FISCAL] [FECHA] |
| 4 | Modelo 303: cómo calcular tu IVA sin equivocarte de casilla | `/blog/modelo-303` | 530 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |
| 5 | Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos) | `/blog/cuota-autonomos-2026` | 620 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |
| 6 | Cómo dejar de perder clientes potenciales: un sistema de leads simple | `/blog/sistema-de-leads-simple` | 527 | Publicado | [CTA] |
| 7 | Clientes y proveedores sin caos: todo centralizado en un sitio | `/blog/clientes-y-proveedores-centralizados` | 484 | Publicado | [CTA] |
| 8 | Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos) | `/blog/que-es-un-crm` | 517 | Publicado | [CTA] |
| 9 | Cómo conseguir clientes por internet sin gastar en anuncios | `/blog/conseguir-clientes-por-internet` | 496 | Publicado | [CTA] |
| 10 | Calendario fiscal del autónomo 2026: todas las fechas clave | `/blog/calendario-fiscal-autonomo-2026` | 563 | Publicado | [CTA] [DATO_FISCAL] [FECHA] [VERIFICAR] |
| 11 | Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu) | `/blog/mejores-programas-facturacion-autonomos-2026` | 684 | Publicado | [CONSULTAR] [CTA] [FECHA] [VERIFICAR] |
| 12 | ClientLabs vs Holded: cuál te conviene según tu tipo de negocio | `/blog/clientlabs-vs-holded` | 559 | Publicado | [CTA] [FECHA] [VERIFICAR] |
| 13 | FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu | `/blog/alternativas-facturaplus` | 522 | Publicado | [CTA] [FECHA] [VERIFICAR] |
| 14 | Los mejores CRM gratis para autónomos (y cuándo se quedan cortos) | `/blog/mejores-crm-gratis-autonomos` | 579 | Publicado | [CTA] [FECHA] [VERIFICAR] |
| 15 | Facturar en Excel en 2026: por qué te acaba saliendo caro | `/blog/facturar-en-excel-2026` | 515 | Publicado | [CTA] [FECHA] |
| 16 | Tu primera factura legal en ClientLabs en menos de 10 minutos | `/blog/primera-factura-clientlabs` | 447 | Publicado | [CTA] [DATO_FISCAL] |
| 17 | Del primer contacto al cliente: el pipeline de ClientLabs | `/blog/pipeline-de-clientlabs` | 501 | Publicado | [CTA] |
| 18 | Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada | `/blog/verifactu-en-clientlabs` | 441 | Publicado | [CTA] [FECHA] |
| 19 | Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min | `/blog/migrar-de-excel-a-clientlabs` | 459 | Publicado | [CTA] |
| 20 | Gastos deducibles del autónomo en 2026: la lista con ejemplos | `/blog/gastos-deducibles-autonomo-2026` | 1024 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |
| 21 | Cómo hacer una factura: partes obligatorias y plantilla gratis | `/blog/como-hacer-una-factura` | 757 | Publicado | [CTA] [DATO_FISCAL] [FECHA] |
| 22 | Cómo darte de alta como autónomo en 2026 (Hacienda y SS) | `/blog/darse-de-alta-como-autonomo-2026` | 785 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |
| 23 | Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio | `/blog/kit-digital-2026` | 587 | Publicado | [CTA] [DATO_FISCAL] [FECHA] |
| 24 | Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones | `/blog/retencion-irpf-factura` | 659 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |
| 25 | Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula | `/blog/modelo-130` | 620 | Publicado | [CONSULTAR] [CTA] [DATO_FISCAL] [FECHA] |

> **Estado:** los 25 están en el array `ARTICLES` y `generateStaticParams()` los genera → todos **publicados**. No existe campo `draft`/`status`; los marcadores `[VERIFICAR antes de publicar]` indican que algunos **no están listos** pese a estar live.

---

## PASO 2 + 3 — Detalle por artículo

### 1. Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"verifactu-2026"` · **Espejo Markdown:** `content/blog/verifactu-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/verifactu-2026`
- **Título (H1):** Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya
- **Meta title:** `Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Verifactu se aplazó: empresas el 1 de enero de 2027 y autónomos el 1 de julio de 2027. Qué cambia, qué requisitos siguen vigentes y las sanciones.
- **Categoría:** Normativa (`normativa`) · **Tags:** verifactu 2026, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-05-01 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 886
- **Flags:**
  - **[FECHA]** — «la obligación entra **el 1 de enero de 2027 para empresas y el 1 de julio de 2027 para autónomos**» y «El **2 de diciembre de 2025** se aprobó un aplazamiento». Calendario sensible a cambios normativos.
  - **[DATO_FISCAL]** — «Hasta **50.000 €** por usar (o fabricar) software de facturación no conforme» y «**1.000 €** por cada factura emitida sin el código QR o sin la leyenda». Citan RD 1007/2023 y Orden HAC/1177/2024.
  - **[CTA]** — Sí. Cierre promocional: «ClientLabs emite facturas conformes —con huella, QR y encadenamiento— sin que tengas que configurar nada técnico». Además la plantilla de ruta añade la caja «Empezar gratis».

#### Cuerpo completo — verifactu-2026 (Markdown literal)

# Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya

Verifactu es el sistema de facturación verificable que exige la normativa española para que cada factura emitida por software sea trazable e inalterable. La novedad de 2026 es el calendario: el 2 de diciembre de 2025 se aprobó un aplazamiento, así que la obligación entra **el 1 de enero de 2027 para empresas y el 1 de julio de 2027 para autónomos**. Los requisitos técnicos no han cambiado, solo las fechas.

## Qué es Verifactu (en una frase)

Es la parte del Reglamento que regula los Sistemas Informáticos de Facturación (RD 1007/2023 y Orden HAC/1177/2024). Obliga a que tu programa de facturación genere registros que no se puedan borrar ni manipular y, en modo Verifactu, los remita a la Agencia Tributaria. No es un impuesto nuevo ni un trámite que hagas tú a mano: es un requisito que debe cumplir el **software** que usas para facturar.

## Por qué se aplazó a 2027

El calendario original situaba la obligación en 2026. El **2 de diciembre de 2025** se aprobó un aplazamiento que mueve las fechas un año, dando más margen tanto a los obligados como a los fabricantes de software. Lo importante: **solo cambió el calendario**, no los requisitos técnicos del sistema.

| Obligado | Fecha desde la que es obligatorio |
|---|---|
| Empresas (sujetas al Impuesto sobre Sociedades) | 1 de enero de 2027 |
| Autónomos y resto de obligados | 1 de julio de 2027 |

## Qué te obliga ya (aunque la fecha sea 2027)

Que la obligación general llegue en 2027 no significa que puedas ignorarla:

- **Si usas software de facturación, debe ir hacia un sistema conforme.** Cuando llegue tu fecha, el programa tendrá que generar facturas con todos los elementos obligatorios. Elegir ahora una herramienta ya conforme te evita migrar con prisas.
- **Cada factura emitida por software debe llevar:** huella o *hash*, encadenamiento con la factura anterior, código QR y, en modo Verifactu, la leyenda **"VERI*FACTU"** o "factura verificable".
- **El encadenamiento importa.** Cada registro se enlaza con el anterior, de forma que no se pueda colar ni eliminar una factura sin dejar rastro.

## Sanciones: por qué no conviene improvisar

- Hasta **50.000 €** por usar (o fabricar) software de facturación no conforme.
- **1.000 €** por cada factura emitida sin el código QR o sin la leyenda obligatoria.

No son multas simbólicas: el coste de no adaptarse supera con creces el de cambiar de programa a tiempo.

## Quién está exento

- **País Vasco y Navarra:** tienen régimen foral propio y su sistema es **TicketBAI**, no Verifactu.
- **Quien factura 100 % a mano**, sin ningún software. En la práctica, en cuanto usas un programa para facturar, entras en el ámbito de la norma.

## Verifactu no es lo mismo que la factura electrónica B2B

Es la confusión más habitual. Son **dos obligaciones distintas**:

- **Verifactu** regula *cómo* tu software registra y conserva cada factura (huella, QR, encadenamiento).
- **La factura electrónica obligatoria entre empresas** (Ley Crea y Crece) regula que las facturas entre empresas y autónomos sean electrónicas y estructuradas. Está **pendiente del reglamento definitivo**; cuando se publique, habrá **1 año de plazo para grandes empresas y 2 años para autónomos y pymes**.

Puedes cumplir una y no la otra, así que conviene tenerlas separadas en la cabeza.

## Qué hacer ahora, sin agobios

1. Comprueba si tu programa de facturación es (o será) conforme a Verifactu.
2. Si facturas en Excel o en Word, ve pensando en dar el salto: esos métodos no generan huella ni QR.
3. No esperes a 2027 para decidir. Migrar con margen es barato; hacerlo a contrarreloj, no.

## Preguntas frecuentes

**¿Verifactu es obligatorio en 2026?**
No. Tras el aplazamiento del 2 de diciembre de 2025, la obligación entra el 1 de enero de 2027 para empresas y el 1 de julio de 2027 para autónomos.

**¿Tengo que enviar yo las facturas a Hacienda?**
No manualmente. Lo hace el software en modo Verifactu. Tu trabajo es usar un programa conforme.

**Si facturo a mano en papel, ¿me afecta?**
No, mientras no uses ningún software para emitir facturas. En cuanto usas un programa, entras en el ámbito de la norma.

**¿Verifactu sustituye al modelo 303 o al 130?**
No. Verifactu regula la emisión de facturas; el [modelo 303](/blog/modelo-303) y el [modelo 130](/blog/modelo-130) siguen siendo tus declaraciones de IVA e IRPF.

**¿Qué pasa si mi software no lleva QR ni leyenda?**
Te expones a 1.000 € por factura sin QR o leyenda y hasta 50.000 € por usar software no conforme.

## En resumen

Verifactu llega en 2027, no en 2026, pero la decisión que sí puedes tomar ya es elegir un programa de facturación que cumpla de serie. ClientLabs emite facturas conformes —con huella, QR y encadenamiento— sin que tengas que configurar nada técnico, para que llegues a tu fecha sin sustos.

**Enlaces internos sugeridos:**
- [Factura electrónica obligatoria: a quién afecta de verdad y desde cuándo](/blog/factura-electronica-obligatoria)
- [7 errores de factura que más multas generan al autónomo](/blog/errores-factura-autonomo)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu)](/blog/mejores-programas-facturacion-autonomos-2026)
- [Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada](/blog/verifactu-en-clientlabs)

---

### 2. Factura electrónica obligatoria: a quién afecta y desde cuándo

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"factura-electronica-obligatoria"` · **Espejo Markdown:** `content/blog/factura-electronica-obligatoria.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/factura-electronica-obligatoria`
- **Título (H1):** Factura electrónica obligatoria: a quién afecta y desde cuándo
- **Meta title:** `Factura electrónica obligatoria: a quién afecta y desde cuándo | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Factura electrónica obligatoria entre empresas (Ley Crea y Crece): a quién afecta, plazos de 1 y 2 años y en qué se diferencia de Verifactu.
- **Categoría:** Normativa (`normativa`) · **Tags:** factura electrónica obligatoria, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-05-02 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 534
- **Flags:**
  - **[FECHA]** — «todavía **no está en vigor**… habrá **1 año de plazo para grandes empresas y 2 años para autónomos y pymes**» (los plazos cuentan desde la publicación del reglamento, aún pendiente).
  - **[CTA]** — Sí. Cierre: «ClientLabs emite facturas conformes con Verifactu y en formato electrónico, listo para lo que venga». + caja «Empezar gratis» de la plantilla.

#### Cuerpo completo — factura-electronica-obligatoria (Markdown literal)

# Factura electrónica obligatoria: a quién afecta y desde cuándo

La factura electrónica obligatoria entre empresas y autónomos llega con la Ley Crea y Crece, pero todavía **no está en vigor**: depende de un reglamento que aún no se ha publicado. Cuando se publique, habrá **1 año de plazo para grandes empresas y 2 años para autónomos y pymes**. Y ojo: esto **no es lo mismo que Verifactu**.

## Qué es (y qué no)

La Ley Crea y Crece obliga a que las facturas **entre empresas y autónomos (B2B)** sean electrónicas y estructuradas, para reducir la morosidad y digitalizar las relaciones comerciales. No afecta a las facturas a particulares (B2C).

## A quién afecta y desde cuándo

- Afecta a **operaciones B2B** (empresa/autónomo → empresa/autónomo).
- Está **pendiente del reglamento definitivo**.
- Tras su publicación: **1 año para grandes empresas** y **2 años para autónomos y pymes** [los plazos cuentan desde la publicación del reglamento].

Como la fecha de partida aún no existe, no hay calendario cerrado: lo razonable es estar preparado, no correr.

## La confusión clave: Crea y Crece ≠ Verifactu

Son **dos obligaciones distintas** y mucha gente las mezcla:

| | Factura electrónica B2B (Crea y Crece) | Verifactu (RD 1007/2023) |
|---|---|---|
| Qué regula | Que la factura entre empresas sea **electrónica y estructurada** | Cómo el **software** registra y conserva cada factura |
| A quién | Operaciones B2B | Quien factura con software |
| Estado | Pendiente de reglamento | Aprobado, con calendario |
| Fechas | 1 año (grandes) / 2 años (pymes) tras el reglamento | Empresas 1/1/2027, autónomos 1/7/2027 |

Puedes estar sujeto a una, a la otra o a ambas. Tienes el detalle de la segunda en [Verifactu en 2026](/blog/verifactu-2026).

## Qué hacer ahora

1. **No confundir plazos:** Verifactu tiene fechas (2027); Crea y Crece aún no.
2. **Usar software que emita en formato electrónico estructurado**, para no rehacer nada cuando llegue el reglamento.
3. **Estar al día de la publicación** del reglamento de Crea y Crece.

## Preguntas frecuentes

**¿La factura electrónica B2B ya es obligatoria?**
No. Falta el reglamento definitivo. Cuando se publique, habrá 1 año (grandes empresas) y 2 años (autónomos y pymes).

**¿Tengo que hacer factura electrónica a mis clientes particulares?**
No. La obligación de Crea y Crece es para operaciones entre empresas y autónomos (B2B).

**¿Es lo mismo que Verifactu?**
No. Verifactu regula cómo tu software registra las facturas; Crea y Crece, que las facturas B2B sean electrónicas.

**¿Qué hago mientras tanto?**
Usar un programa que ya emita en formato electrónico y sea conforme con Verifactu, para no migrar dos veces.

## En resumen

La factura electrónica B2B llegará, pero aún sin fecha; Verifactu sí la tiene. Tener un software preparado para ambas te evita sustos. ClientLabs emite facturas conformes con Verifactu y en formato electrónico, listo para lo que venga.

**Enlaces internos sugeridos:**
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [7 errores de factura que más multas generan al autónomo](/blog/errores-factura-autonomo)
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)
- [Calendario fiscal del autónomo 2026](/blog/calendario-fiscal-autonomo-2026)

---

### 3. 7 errores de factura que más multas generan al autónomo

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"errores-factura-autonomo"` · **Espejo Markdown:** `content/blog/errores-factura-autonomo.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/errores-factura-autonomo`
- **Título (H1):** 7 errores de factura que más multas generan al autónomo
- **Meta title:** `7 errores de factura que más multas generan al autónomo | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Los 7 errores de facturación que más sanciones y problemas causan a los autónomos en España, con cómo detectarlos y evitarlos antes del trimestre.
- **Categoría:** Guía (`guia`) · **Tags:** errores facturación autónomo, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-28 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 619
- **Flags:**
  - **[FECHA]** — «A partir del **1 de julio de 2027**, las facturas por software deben llevar huella, QR y encadenamiento (Verifactu)».
  - **[DATO_FISCAL]** — «**1.000 € por factura** sin QR o leyenda y hasta **50.000 €** por software no conforme»; «retención (15 % o 7 %)»; «Aplicar 21 % donde correspondía 10 %».
  - **[CTA]** — Sí. Cierre promociona facturación conforme de ClientLabs + caja «Empezar gratis».

#### Cuerpo completo — errores-factura-autonomo (Markdown literal)

# 7 errores de factura que más multas generan al autónomo

La mayoría de sanciones por facturación no vienen de fraudes, sino de descuidos: numeración con saltos, datos incompletos o un IVA mal calculado. Estos son los siete errores que más caro salen y cómo evitarlos antes de que lleguen al trimestre o a una inspección.

## 1. Numeración con saltos o repetida
La factura debe ir con **número correlativo y sin huecos**. Saltarte un número o repetirlo es una señal de alarma para Hacienda. Solución: numeración automática y series claras (`2026-001`, `2026-002`).

## 2. Datos obligatorios incompletos
Falta el NIF del cliente, la dirección o el desglose del IVA. Una factura incompleta **no es deducible** para tu cliente y es subsanable solo hasta cierto punto. Revisa la lista en [cómo hacer una factura](/blog/como-hacer-una-factura).

## 3. Tipo de IVA equivocado
Aplicar 21 % donde correspondía 10 % (o al revés). El error se arrastra al [modelo 303](/blog/modelo-303) y puede acabar en una regularización con recargo.

## 4. Olvidar la retención de IRPF
Si eres profesional y facturas a empresas, debes aplicar retención (15 % o 7 %). Olvidarla descuadra tu IRPF. Lo aclaramos en [qué retención poner](/blog/retencion-irpf-factura).

## 5. Borrar una factura ya emitida
Si te equivocas, **no la elimines**: emite una **factura rectificativa**. Borrar rompe la numeración y, con Verifactu, el encadenamiento.

## 6. Facturar sin software conforme (de cara a 2027)
A partir del 1 de julio de 2027, las facturas por software deben llevar huella, QR y encadenamiento (Verifactu). Emitir sin eso expone a **1.000 € por factura** sin QR o leyenda y hasta **50.000 €** por software no conforme. Contexto en [Verifactu en 2026](/blog/verifactu-2026).

## 7. No guardar las facturas
Sin el justificante, no puedes deducir un gasto ni defender un ingreso. Hacienda revisa hasta 4 años (art. 66 LGT) y el Código de Comercio obliga a conservar 6 años: guarda todo **mínimo 6 años**.

## Tabla resumen

| Error | Riesgo | Cómo evitarlo |
|---|---|---|
| Numeración con saltos | Factura inválida | Numeración automática |
| Datos incompletos | No deducible | Plantilla con todos los campos |
| IVA mal aplicado | Regularización + recargo | Tipos predefinidos |
| Sin retención IRPF | IRPF descuadrado | Reglas por tipo de cliente |
| Borrar facturas | Rompe numeración | Rectificativa |
| Software no conforme | Hasta 50.000 € | Programa con Verifactu |
| No archivar | Pierdes la deducción | Guardar mínimo 6 años |

## Preguntas frecuentes

**¿Qué pasa si me salto un número de factura?**
La numeración debe ser correlativa; un salto puede invalidar la factura y llamar la atención de Hacienda. Usa una rectificativa si anulas.

**¿Puedo corregir una factura ya enviada?**
Sí, con una factura rectificativa. Nunca borrándola.

**¿Cuánto puede costarme facturar mal?**
Con Verifactu, hasta 1.000 € por factura sin QR/leyenda y hasta 50.000 € por software no conforme; antes de eso, recargos por errores de IVA o IRPF.

**¿Cuánto guardo las facturas?**
Hacienda revisa hasta 4 años (art. 66 LGT); por el Código de Comercio (art. 30), conserva la documentación un mínimo de 6 años.

## En resumen

Casi todos estos errores desaparecen con un programa que numere, calcule impuestos y conserve cada factura. ClientLabs hace ese trabajo por ti y emite conforme a Verifactu, para que el trimestre no traiga sorpresas.

**Enlaces internos sugeridos:**
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [Qué retención de IRPF pongo en mis facturas](/blog/retencion-irpf-factura)
- [Modelo 303: cómo calcular tu IVA sin equivocarte de casilla](/blog/modelo-303)
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Facturar en Excel en 2026: por qué te acaba saliendo caro](/blog/facturar-en-excel-2026)

---

### 4. Modelo 303: cómo calcular tu IVA sin equivocarte de casilla

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"modelo-303"` · **Espejo Markdown:** `content/blog/modelo-303.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/modelo-303`
- **Título (H1):** Modelo 303: cómo calcular tu IVA sin equivocarte de casilla
- **Meta title:** `Modelo 303: cómo calcular tu IVA sin equivocarte de casilla | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Modelo 303 de IVA: qué es, cómo se calcula (IVA repercutido menos soportado), las casillas clave y los plazos trimestrales de 2026. Con ejemplo.
- **Categoría:** Normativa (`normativa`) · **Tags:** modelo 303, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-25 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 530
- **Flags:**
  - **[CONSULTAR]** — Disclaimer de cierre: «> Información general, no asesoramiento personalizado.» (no deriva todo a un asesor, pero acota la respuesta).
  - **[FECHA]** — Plazos trimestrales referidos a 2026.
  - **[DATO_FISCAL]** — Cálculo IVA repercutido − IVA soportado y casillas concretas del modelo; conviene verificar casillas vigentes.
  - **[CTA]** — Sí. Cierre con ClientLabs + caja «Empezar gratis».

#### Cuerpo completo — modelo-303 (Markdown literal)

# Modelo 303: cómo calcular tu IVA sin equivocarte de casilla

El modelo 303 es la declaración trimestral del IVA: pagas a Hacienda el **IVA que has cobrado** a tus clientes menos el **IVA que has pagado** en tus gastos. Si cobraste más del que pagaste, ingresas la diferencia; si pagaste más, sale a compensar o a devolver. Aquí va el cálculo y las casillas que más se confunden.

## La fórmula

**IVA repercutido (el que cobras) − IVA soportado (el que pagas) = resultado**

- Resultado **positivo** → ingresas esa cantidad.
- Resultado **negativo** → a compensar en trimestres siguientes (o a devolver en el último).

## Ejemplo

Un trimestre:

- Facturas emitidas: 10.000 € de base → **IVA repercutido (21 %): 2.100 €**
- Gastos con IVA: 3.000 € de base → **IVA soportado (21 %): 630 €**
- **A ingresar: 2.100 − 630 = 1.470 €**

## Las casillas que más se confunden

- **IVA repercutido:** el de tus facturas emitidas, separado por tipo (21 %, 10 %, 4 %).
- **IVA soportado deducible:** el de tus gastos **vinculados a la actividad** y con factura. Aquí está el error típico: meter IVA de gastos que no son deducibles. Revisa [qué puedes deducir](/blog/gastos-deducibles-autonomo-2026).
- **Resultado:** la diferencia. Si sale negativo, marca "a compensar".

## Plazos trimestrales en 2026

| Trimestre | Periodo | Plazo |
|---|---|---|
| 1T | enero–marzo | 1–20 de abril |
| 2T | abril–junio | 1–20 de julio |
| 3T | julio–septiembre | 1–20 de octubre |
| 4T | octubre–diciembre | 1–30 de enero (2027) |

Si un plazo cae en festivo o fin de semana, pasa al siguiente día hábil. En enero se presenta además el **modelo 390** (resumen anual de IVA), hasta el 30-31 de enero.

## Errores que cuestan dinero

- **Deducir IVA de gastos no afectos** a la actividad.
- **No separar por tipos** de IVA.
- **Olvidar facturas** del trimestre (descuadra con tus registros).
- **Presentar tarde:** recargo automático.

## Preguntas frecuentes

**¿Qué es el modelo 303?**
La autoliquidación trimestral del IVA: IVA cobrado menos IVA pagado deducible.

**¿Cuándo se presenta?**
En abril, julio, octubre y enero, dentro de los primeros 20 días (30 en el 4T).

**¿Qué pasa si sale negativo?**
Lo compensas en los siguientes trimestres; en el último del año puedes pedir devolución.

**¿El 303 es lo mismo que el 130?**
No. El 303 es el IVA; el [130](/blog/modelo-130) es el adelanto del IRPF.

**¿Qué IVA de mis gastos puedo deducir?**
El de gastos vinculados a la actividad y con factura completa. Detalle en [gastos deducibles](/blog/gastos-deducibles-autonomo-2026).

## En resumen

El 303 es restar dos cifras bien llevadas. El truco no es la fórmula, sino tener cada factura e ingreso registrado. ClientLabs te muestra el IVA repercutido y soportado del trimestre listo para el 303, sin cuadrar nada a mano.

> Información general, no asesoramiento personalizado.

**Enlaces internos sugeridos:**
- [Modelo 130 de IRPF: qué es, quién lo presenta y cómo calcularlo](/blog/modelo-130)
- [Gastos deducibles del autónomo en 2026](/blog/gastos-deducibles-autonomo-2026)
- [Calendario fiscal del autónomo 2026](/blog/calendario-fiscal-autonomo-2026)
- [Qué retención de IRPF pongo en mis facturas](/blog/retencion-irpf-factura)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)

---

### 5. Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos)

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"cuota-autonomos-2026"` · **Espejo Markdown:** `content/blog/cuota-autonomos-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/cuota-autonomos-2026`
- **Título (H1):** Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos)
- **Meta title:** `Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos) | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cuota de autónomos 2026 por ingresos reales: cómo funcionan los tramos, la tarifa plana para nuevos y cómo estimar lo que pagarás cada mes.
- **Categoría:** Normativa (`normativa`) · **Tags:** cuota autónomos 2026, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-20 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 620
- **Flags:**
  - **[CONSULTAR]** — «> Información general; confirma las cifras de 2026 con la tabla oficial o tu asesor.»
  - **[FECHA]** — «En **2026** sigue ese sistema de tramos»; cuotas «**congeladas** respecto a 2025»; MEI que «seguirá subiendo hasta el 1,2 % en 2029».
  - **[DATO_FISCAL]** — Cifras muy concretas a verificar: «tipo general es del **30,50 %**», «de **200 €/mes** … a **590 €/mes**», «**15 tramos**», tarifa plana «**80 € de base** … cuota real ronda los **88,64 €/mes**», «MEI … sube al **0,9 %**», «**Orden PJC/297/2026** (BOE de 31 de marzo de 2026)».
  - **[CTA]** — Sí. Cierre con ClientLabs («ingresos y gastos al día para que estimes tu tramo») + caja.

#### Cuerpo completo — cuota-autonomos-2026 (Markdown literal)

# Cuota de autónomos 2026: cuánto pagas según tus ingresos (tramos)

Desde 2023, los autónomos cotizan por **ingresos reales**: cuanto más ganas (rendimiento neto), más alta es tu base mínima y, por tanto, tu cuota. En 2026 sigue ese sistema de tramos, con la **tarifa plana** para quien empieza. Aquí tienes cómo funciona y cómo estimar lo que te toca pagar.

## Cómo funciona la cotización por ingresos reales

1. **Estimas tu rendimiento neto** mensual (ingresos − gastos − deducciones).
2. Ese rendimiento te sitúa en un **tramo**, con una base mínima y máxima.
3. Eliges una base dentro del tramo y sobre ella se calcula la cuota.
4. La Seguridad Social **regulariza** al año siguiente según lo que ganaste de verdad.

> Cuotas de 2026 según la **Orden PJC/297/2026** (BOE de 31 de marzo de 2026). Las cuotas están **congeladas** respecto a 2025. Hay 15 tramos por rendimiento neto y el tipo general es del **30,50 %** sobre la base.

## Tabla de tramos (estructura)

| Rendimiento neto | Cuota 2026/mes |
|---|---|
| ≤ 670 €/mes (tramo más bajo) | 200 € |
| Tramos intermedios | entre 200 € y 590 € |
| > 6.000 €/mes (tramo más alto) | 590 € |

Hay **15 tramos**: 3 en la **tabla reducida** (rendimientos por debajo de 1.166,70 €/mes) y 12 en la **tabla general**. La cuota va de **200 €/mes** (rendimientos ≤ 670 €/mes) a **590 €/mes** (más de 6.000 €/mes).

La idea: a más rendimiento, mayor base mínima y mayor cuota. Sobre la cuota se aplica además el **MEI**, que en 2026 sube al **0,9 %** (desde el 0,8 %) y seguirá subiendo hasta el 1,2 % en 2029.

## La tarifa plana para nuevos autónomos

Si te das de alta por primera vez (o llevas años sin serlo), puedes acogerte a la **tarifa plana**: **80 € de base los 12 primeros meses** (con el MEI, la cuota real ronda los **88,64 €/mes**), prorrogable otros 12 si tus rendimientos quedan por debajo del SMI. Detalle del alta en [cómo darte de alta como autónomo](/blog/darse-de-alta-como-autonomo-2026).

## Cómo estimar tu cuota

1. Calcula tu **rendimiento neto** medio (ingresos − gastos deducibles).
2. Búscalo en la **tabla de tramos** vigente de 2026.
3. Recuerda que puedes **cambiar de base hasta 6 veces al año** si tus ingresos varían.

Llevar bien tus ingresos y [gastos deducibles](/blog/gastos-deducibles-autonomo-2026) te da el rendimiento neto real, que es la base de todo este cálculo.

## Preguntas frecuentes

**¿Cuánto paga un autónomo en 2026?**
Entre 200 €/mes (rendimientos ≤ 670 €/mes) y 590 €/mes (más de 6.000 €/mes), según los 15 tramos de la Orden PJC/297/2026. Las cuotas están congeladas respecto a 2025.

**¿Qué es la tarifa plana?**
80 € de base los primeros 12 meses (cuota real ≈ 88,64 €/mes con el MEI), prorrogable otros 12 si tus rendimientos no superan el SMI.

**¿Puedo cambiar mi cuota si gano menos?**
Sí, puedes cambiar la base de cotización hasta 6 veces al año.

**¿Qué pasa si me equivoco al estimar?**
La Seguridad Social regulariza al año siguiente con tus ingresos reales: te devuelve o te reclama la diferencia.

## En resumen

Tu cuota depende de lo que ganas, así que conocer tu rendimiento neto real es clave. ClientLabs te da ingresos y gastos al día para que estimes tu tramo y no pagues de más ni de menos.

> Información general; confirma las cifras de 2026 con la tabla oficial o tu asesor.

**Enlaces internos sugeridos:**
- [Cómo darte de alta como autónomo en 2026](/blog/darse-de-alta-como-autonomo-2026)
- [Gastos deducibles del autónomo en 2026](/blog/gastos-deducibles-autonomo-2026)
- [Calendario fiscal del autónomo 2026](/blog/calendario-fiscal-autonomo-2026)
- [Modelo 130 de IRPF: qué es y cómo calcularlo](/blog/modelo-130)
- [Modelo 303: cómo calcular tu IVA](/blog/modelo-303)

---

### 6. Cómo dejar de perder clientes potenciales: un sistema de leads simple

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"sistema-de-leads-simple"` · **Espejo Markdown:** `content/blog/sistema-de-leads-simple.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/sistema-de-leads-simple`
- **Título (H1):** Cómo dejar de perder clientes potenciales: un sistema de leads simple
- **Meta title:** `Cómo dejar de perder clientes potenciales: un sistema de leads simple | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Un sistema de leads simple para autónomos: captar, clasificar y hacer seguimiento sin que se enfríe ningún cliente potencial. En 4 pasos.
- **Categoría:** Negocio (`negocio`) · **Tags:** sistema de leads autónomos, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-18 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 527
- **Flags:**
  - **[CTA]** — Sí. Promociona el flujo de leads de ClientLabs + caja «Empezar gratis».

#### Cuerpo completo — sistema-de-leads-simple (Markdown literal)

# Cómo dejar de perder clientes potenciales: un sistema de leads simple

La mayoría de autónomos no pierde clientes por falta de interesados, sino por no seguirlos a tiempo: un email sin contestar, un presupuesto que se olvidó, un "te llamo la semana que viene" que nunca llega. Un sistema de leads simple resuelve eso con cuatro pasos: captar, clasificar, hacer seguimiento y medir.

## Qué es un lead (y por qué se enfría)

Un lead es un cliente potencial: alguien que ha mostrado interés. Se enfría cuando pasa el tiempo sin respuesta. La estadística es cruel: cuanto más tardas en contestar, menos probable es cerrar. El sistema existe para que **nadie se quede sin seguimiento**.

## Los 4 pasos

### 1. Captar todo en un sitio
Email, WhatsApp, formulario de la web, recomendación... da igual de dónde venga: que **todo entre en la misma lista**. Si los leads viven en tres bandejas distintas, alguno se pierde.

### 2. Clasificar por estado
Asigna a cada lead una etapa simple: **nuevo → contactado → propuesta enviada → cliente / perdido**. Con eso ya sabes de un vistazo qué tienes pendiente.

### 3. Hacer seguimiento con recordatorios
Cada lead activo necesita un **próximo paso con fecha**. "Llamar el martes" es un sistema; "ya me acordaré" no lo es.

### 4. Medir para mejorar
Cuántos leads entran, cuántos cierras y dónde se caen. Si pierdes muchos en "propuesta enviada", quizá el problema es el precio o el seguimiento.

## Tabla: del caos al sistema

| Sin sistema | Con sistema de leads |
|---|---|
| Leads en 3 bandejas | Una lista única |
| "Ya me acordaré" | Próximo paso con fecha |
| No sabes cuántos pierdes | Mides la conversión |
| Respondes tarde | Sigues a tiempo |

## Cómo montarlo sin complicarte

Puedes empezar con una hoja, pero en cuanto tienes volumen conviene un CRM: centraliza la captación, marca el estado y te recuerda el seguimiento. Y si está unido a la facturación, el lead que se convierte en cliente ya tiene sus datos listos para facturar. Más en [qué es un CRM](/blog/que-es-un-crm).

## Preguntas frecuentes

**¿Qué es un lead?**
Un cliente potencial que ha mostrado interés en lo que ofreces.

**¿Por qué pierdo leads?**
Casi siempre por seguir tarde o no seguir. El sistema obliga a fijar un próximo paso.

**¿Necesito un CRM para esto?**
No para empezar, pero ayuda cuando tienes más leads de los que puedes recordar.

**¿Cómo sé si mi sistema funciona?**
Mide cuántos leads entran y cuántos cierras; si la conversión sube, va bien.

## En resumen

Captar, clasificar, seguir y medir: cuatro pasos para que ningún interesado se enfríe. ClientLabs reúne tus leads de todos los canales, te marca el siguiente paso y, cuando cierran, ya tienes su ficha lista para facturar.

**Enlaces internos sugeridos:**
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)
- [Cómo conseguir clientes por internet sin gastar en anuncios](/blog/conseguir-clientes-por-internet)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)
- [Los mejores CRM gratis para autónomos](/blog/mejores-crm-gratis-autonomos)

---

### 7. Clientes y proveedores sin caos: todo centralizado en un sitio

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"clientes-y-proveedores-centralizados"` · **Espejo Markdown:** `content/blog/clientes-y-proveedores-centralizados.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/clientes-y-proveedores-centralizados`
- **Título (H1):** Clientes y proveedores sin caos: todo centralizado en un sitio
- **Meta title:** `Clientes y proveedores sin caos: todo centralizado en un sitio | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo centralizar clientes y proveedores en un solo lugar para no perder datos ni tiempo: ficha única, historial y documentos enlazados.
- **Categoría:** Negocio (`negocio`) · **Tags:** centralizar clientes y proveedores, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-15 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 484
- **Flags:**
  - **[CTA]** — Sí. Fuerte enfoque de producto (8 menciones a ClientLabs) + caja.

#### Cuerpo completo — clientes-y-proveedores-centralizados (Markdown literal)

# Clientes y proveedores sin caos: todo centralizado en un sitio

Tener los clientes en la agenda, los proveedores en una hoja y las facturas en el correo es la receta del caos: datos duplicados, contactos desactualizados y media hora buscando "¿dónde guardé el presupuesto?". Centralizar significa una **ficha única** por cada cliente y proveedor, con su historial y sus documentos enlazados.

## El problema de tener los datos repartidos

- El **mismo cliente** aparece con datos distintos en dos sitios.
- No sabes **cuánto te debe** un cliente ni **cuánto debes** a un proveedor.
- Pierdes tiempo **buscando** facturas y presupuestos.
- Si cambia un teléfono, lo actualizas en un sitio y no en otro.

## Qué significa centralizar de verdad

Una ficha por contacto que reúna:

- **Datos fiscales** (NIF, dirección) para facturar sin volver a teclear.
- **Historial:** conversaciones, presupuestos, pedidos, facturas.
- **Estado de cobros y pagos:** qué está pendiente.
- **Documentos enlazados:** todo colgado de la misma ficha.

## Clientes y proveedores, dos caras de lo mismo

| | Cliente | Proveedor |
|---|---|---|
| Qué controlas | Lo que te deben, presupuestos, facturas emitidas | Lo que debes, pedidos, facturas recibidas |
| Para qué sirve | Cobrar a tiempo, dar seguimiento | Controlar gastos y pagos |
| Dato clave | Saldo pendiente de cobro | Saldo pendiente de pago |

Centralizar ambos te da, de un vistazo, **cuánto entra y cuánto sale**.

## Cómo dar el paso sin migración eterna

1. **Exporta** lo que tengas (agenda, Excel) a un archivo.
2. **Impórtalo** en una herramienta que una clientes, proveedores y facturación.
3. A partir de ahí, **una sola ficha** por contacto: se acabó el duplicado.

En ClientLabs puedes traer tu cartera desde un archivo y dejar cada cliente y proveedor con su historial al lado; el proceso es el mismo que en [migrar de Excel a ClientLabs](/blog/migrar-de-excel-a-clientlabs).

## Preguntas frecuentes

**¿Por qué centralizar clientes y proveedores?**
Para no duplicar datos, saber qué te deben y qué debes, y encontrar cualquier documento en segundos.

**¿Puedo llevar proveedores y clientes en la misma herramienta?**
Sí, y es lo recomendable: ves el dinero que entra y sale en un mismo lugar.

**¿Y mis datos actuales?**
Se exportan e importan; no empiezas de cero.

**¿Esto es un CRM?**
Es parte de lo que hace un CRM. Más en [qué es un CRM](/blog/que-es-un-crm).

## En resumen

Centralizar es pasar de "¿dónde estaba esto?" a tenerlo todo en una ficha. ClientLabs reúne clientes, proveedores, sus documentos y sus saldos para que dejes de perseguir datos.

**Enlaces internos sugeridos:**
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Cómo dejar de perder clientes potenciales: un sistema de leads simple](/blog/sistema-de-leads-simple)
- [Migra de Excel a ClientLabs en 10 minutos](/blog/migrar-de-excel-a-clientlabs)
- [Gastos deducibles del autónomo en 2026](/blog/gastos-deducibles-autonomo-2026)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)

---

### 8. Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"que-es-un-crm"` · **Espejo Markdown:** `content/blog/que-es-un-crm.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/que-es-un-crm`
- **Título (H1):** Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)
- **Meta title:** `Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos) | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Qué es un CRM explicado para autónomos: para qué sirve, qué problemas resuelve frente a Excel y la agenda, y cuándo te empieza a hacer falta.
- **Categoría:** Negocio (`negocio`) · **Tags:** qué es un CRM, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-10 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 517
- **Flags:**
  - **[CTA]** — Sí. Posiciona ClientLabs como CRM para autónomos + caja.

#### Cuerpo completo — que-es-un-crm (Markdown literal)

# Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)

Un CRM es un programa para guardar tus clientes y oportunidades de venta en un solo sitio: quién es cada contacto, qué habéis hablado, en qué punto está la venta y qué toca hacer después. Frente al Excel y la agenda, su ventaja es que **nada se pierde** y que tú (o tu equipo) tenéis el contexto delante en cada llamada.

## Qué hace un CRM, en concreto

- **Ficha de cada cliente:** datos, historial de conversaciones, presupuestos y facturas.
- **Pipeline de ventas:** en qué etapa está cada oportunidad (nuevo, contactado, propuesta, cliente).
- **Tareas y seguimiento:** recordatorios para no dejar enfriar a un interesado.
- **Visión del negocio:** cuántas oportunidades tienes y cuánto valen.

## Por qué Excel y la agenda se quedan cortos

| Con Excel/agenda | Con un CRM |
|---|---|
| El estado de cada venta está en tu cabeza | Lo ves en el pipeline |
| Los datos se duplican y se desactualizan | Una sola ficha por cliente |
| Se te olvida hacer seguimiento | Tareas y recordatorios |
| Nadie más puede consultarlo | El equipo ve lo mismo |
| Cliente aquí, factura allá | Todo enlazado |

No es que Excel "esté mal": es que no se diseñó para seguir relaciones a lo largo del tiempo.

## Cuándo te empieza a hacer falta

- Cuando **pierdes oportunidades** por no llamar a tiempo.
- Cuando tienes **más contactos de los que recuerdas**.
- Cuando **trabaja más gente** y necesitáis ver lo mismo.
- Cuando el cliente está en un sitio y su **factura en otro**.

## CRM y facturación: el salto que de verdad ahorra

Para un autónomo, lo que más tiempo ahorra no es un CRM aislado, sino uno **unido a la facturación**: del primer contacto a la factura sin teclear los datos dos veces. Lo cuentas en [del primer contacto al cliente](/blog/pipeline-de-clientlabs).

## Preguntas frecuentes

**¿Qué es un CRM en palabras simples?**
Un sitio donde guardas tus clientes y el estado de cada venta, con su historial y los próximos pasos.

**¿Un autónomo necesita un CRM?**
Si gestionas más de un puñado de clientes o pierdes oportunidades por falta de seguimiento, sí.

**¿Un CRM incluye facturación?**
No siempre. Los hay solo de ventas; las soluciones todo-en-uno unen CRM y facturación.

**¿Excel puede hacer de CRM?**
Para empezar, pero no escala: se duplica, se desactualiza y no avisa de seguimientos.

## En resumen

Un CRM convierte "lo tengo en la cabeza" en un sistema. Si además factura, dejas de saltar entre programas. ClientLabs une CRM y facturación para que cada cliente tenga su historial y sus facturas en la misma ficha.

**Enlaces internos sugeridos:**
- [Cómo dejar de perder clientes potenciales: un sistema de leads simple](/blog/sistema-de-leads-simple)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)
- [Los mejores CRM gratis para autónomos (y cuándo se quedan cortos)](/blog/mejores-crm-gratis-autonomos)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)
- [Cómo conseguir clientes por internet sin gastar en anuncios](/blog/conseguir-clientes-por-internet)

---

### 9. Cómo conseguir clientes por internet sin gastar en anuncios

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"conseguir-clientes-por-internet"` · **Espejo Markdown:** `content/blog/conseguir-clientes-por-internet.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/conseguir-clientes-por-internet`
- **Título (H1):** Cómo conseguir clientes por internet sin gastar en anuncios
- **Meta title:** `Cómo conseguir clientes por internet sin gastar en anuncios | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo conseguir clientes por internet sin pagar publicidad: canales orgánicos que funcionan para autónomos y cómo no perder los leads que llegan.
- **Categoría:** Negocio (`negocio`) · **Tags:** conseguir clientes por internet, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-05 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 496
- **Flags:**
  - **[CTA]** — Sí. Cierra enlazando captación → CRM de ClientLabs + caja.

#### Cuerpo completo — conseguir-clientes-por-internet (Markdown literal)

# Cómo conseguir clientes por internet sin gastar en anuncios

Puedes conseguir clientes por internet sin pagar anuncios apoyándote en canales orgánicos: una web que aparezca en Google, reseñas, contenido útil y recomendaciones. Es más lento que la publicidad, pero más barato y duradero. La clave no es solo atraer: es **no perder** a quien llega.

## Canales que funcionan sin presupuesto

### 1. Aparecer en Google (SEO local y de servicios)
Una web sencilla optimizada para lo que ofreces y tu zona ("fisioterapeuta en Valencia") capta gente que ya está buscando. Es el canal con mejor retorno a medio plazo.

### 2. Ficha de Google (perfil de empresa)
Imprescindible si atiendes localmente: apareces en el mapa y en búsquedas cercanas. Gratis.

### 3. Reseñas y boca a boca digital
Las opiniones de clientes convencen más que cualquier anuncio. Pide reseñas a tus clientes satisfechos.

### 4. Contenido útil
Responder dudas reales de tu cliente (como hace este blog) atrae a quien busca esa respuesta y te posiciona como referencia.

### 5. Redes donde esté tu cliente
No en todas: en las que use tu público. Mejor una bien llevada que cinco abandonadas.

## Tabla: orgánico vs. anuncios

| | Orgánico | Anuncios |
|---|---|---|
| Coste | Tiempo | Dinero |
| Velocidad | Lento al principio | Inmediato |
| Duración | Se acumula | Para cuando dejas de pagar |
| Confianza | Alta (reseñas, contenido) | Media |

## El error que tira el esfuerzo a la basura

Atraer leads y no seguirlos. Si llegan contactos por la web o por WhatsApp y nadie los ordena ni responde a tiempo, el trabajo de captación se pierde. Por eso, antes de invertir más en atraer, monta un [sistema de leads simple](/blog/sistema-de-leads-simple) que recoja todo lo que entra.

## Preguntas frecuentes

**¿Se puede conseguir clientes sin pagar publicidad?**
Sí: SEO, ficha de Google, reseñas, contenido y redes orgánicas. Es más lento pero sostenible.

**¿Qué canal da más resultado?**
Para servicios locales, aparecer en Google y tener una buena ficha de empresa suele ser lo más rentable.

**¿Cuánto tardan en llegar clientes?**
El orgánico tarda semanas o meses en arrancar, pero luego se acumula.

**¿Y si ya me llegan leads pero no cierro?**
El problema no es la captación, es el seguimiento. Ordena tus leads y responde a tiempo.

## En resumen

Internet trae clientes sin gastar en anuncios si combinas visibilidad (Google, reseñas, contenido) con un buen seguimiento. ClientLabs recoge los leads que te lleguen de cualquier canal y te recuerda el siguiente paso para que no se pierda ninguno.

**Enlaces internos sugeridos:**
- [Cómo dejar de perder clientes potenciales: un sistema de leads simple](/blog/sistema-de-leads-simple)
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)
- [Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio](/blog/kit-digital-2026)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)

---

### 10. Calendario fiscal del autónomo 2026: todas las fechas clave

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"calendario-fiscal-autonomo-2026"` · **Espejo Markdown:** `content/blog/calendario-fiscal-autonomo-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/calendario-fiscal-autonomo-2026`
- **Título (H1):** Calendario fiscal del autónomo 2026: todas las fechas clave
- **Meta title:** `Calendario fiscal del autónomo 2026: todas las fechas clave | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Calendario fiscal del autónomo 2026: fechas de IVA (303), IRPF (130), resúmenes anuales y renta, para presentar a tiempo y evitar recargos.
- **Categoría:** Normativa (`normativa`) · **Tags:** calendario fiscal autónomo 2026, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-04-01 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 563
- **Flags:**
  - **[VERIFICAR]** — ⚠️ Marcador editorial visible en el cuerpo: «La campaña suele ir de **abril a junio** **[VERIFICAR fechas exactas 2027 antes de publicar]**». No debería publicarse con ese texto.
  - **[FECHA]** — Todas las fechas trimestrales de 2026; «la obligación de software conforme empieza el **1 de julio de 2027**».
  - **[DATO_FISCAL]** — «Modelo 349 … **trimestral** si el total de operaciones no supera **50.000 € (IVA excl.)**»; modelos 180/190 hasta el 30-31 de enero.
  - **[CTA]** — Sí. Cierre con ClientLabs + caja.

#### Cuerpo completo — calendario-fiscal-autonomo-2026 (Markdown literal)

# Calendario fiscal del autónomo 2026: todas las fechas clave

Como autónomo, tus citas con Hacienda son sobre todo trimestrales: IVA (modelo 303) e IRPF (modelo 130) en abril, julio, octubre y enero, más los resúmenes anuales de enero y la declaración de la renta en primavera. Presentar fuera de plazo genera recargos automáticos, así que apunta estas fechas.

## Calendario trimestral

| Trimestre | Periodo | Modelos | Plazo |
|---|---|---|---|
| 1T | enero–marzo | 303, 130 | 1–20 de abril |
| 2T | abril–junio | 303, 130 | 1–20 de julio |
| 3T | julio–septiembre | 303, 130 | 1–20 de octubre |
| 4T | octubre–diciembre | 303, 130 | 1–30 de enero (2027) |

Si un plazo termina en sábado, domingo o festivo, se traslada al siguiente día hábil.

## Citas anuales (enero)

- **Modelo 390:** resumen anual del IVA, hasta el **30-31 de enero**.
- **Modelos 180 / 190:** resúmenes anuales de retenciones (alquiler, nóminas), hasta el **30-31 de enero**.
- **Modelo 347** (operaciones con terceros): en **febrero**.

## La renta (primavera)

- **Modelo 100 (IRPF):** la declaración de la renta. La campaña suele ir de **abril a junio** [VERIFICAR fechas exactas 2027 antes de publicar]. Aquí se regulariza todo lo adelantado con los modelos 130 y las retenciones.

## Otras fechas a tener en cuenta

- **Cuota de autónomos:** se paga **cada mes** (domiciliada). Ver [cuota de autónomos 2026](/blog/cuota-autonomos-2026).
- **Modelo 349** (operaciones intracomunitarias): **mensual** por defecto; **trimestral** si el total de operaciones no supera **50.000 € (IVA excl.)** ni en el trimestre en curso ni en cada uno de los 4 trimestres anteriores.
- **Verifactu:** no es una "fecha de presentación", pero recuerda que para autónomos la obligación de software conforme empieza el **1 de julio de 2027**.

## Cómo no pagar recargos

1. **Domicilia y anticipa:** con domiciliación bancaria, el cargo se adelanta unos **5 días** respecto al fin del plazo.
2. **Lleva el trimestre al día**, no la última semana: el atasco genera errores.
3. **Avisos:** ponte recordatorios el día 1 de cada mes de cierre (abril, julio, octubre, enero).

## Preguntas frecuentes

**¿Cuándo presento el IVA y el IRPF trimestral?**
En los 20 primeros días de abril, julio y octubre, y hasta el 30 de enero el cuarto trimestre.

**¿Qué presento en enero?**
El 4T del 303 y 130, más los resúmenes anuales 390 y 180/190 (hasta el 30-31 de enero). El 347 se presenta en febrero.

**¿Cuándo es la declaración de la renta?**
La campaña suele ir de abril a junio [VERIFICAR fechas exactas 2027 antes de publicar].

**¿Qué pasa si presento tarde?**
Se aplica un recargo que aumenta cuanto más tardes; si Hacienda te lo reclama antes, es mayor.

## En resumen

El calendario del autónomo es repetitivo: cuatro trimestres y un par de citas anuales. Tener ingresos, gastos e impuestos en un mismo sitio convierte cada cierre en revisar y enviar. ClientLabs te muestra el 303 y el 130 del trimestre listos para presentar.

> Confirma las fechas exactas de 2026 en el calendario oficial de la Agencia Tributaria.

**Enlaces internos sugeridos:**
- [Modelo 303: cómo calcular tu IVA sin equivocarte de casilla](/blog/modelo-303)
- [Modelo 130 de IRPF: qué es y cómo calcularlo](/blog/modelo-130)
- [Cuota de autónomos 2026: tabla de tramos](/blog/cuota-autonomos-2026)
- [Gastos deducibles del autónomo en 2026](/blog/gastos-deducibles-autonomo-2026)
- [Cómo darte de alta como autónomo en 2026](/blog/darse-de-alta-como-autonomo-2026)

---

### 11. Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu)

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"mejores-programas-facturacion-autonomos-2026"` · **Espejo Markdown:** `content/blog/mejores-programas-facturacion-autonomos-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/mejores-programas-facturacion-autonomos-2026`
- **Título (H1):** Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu)
- **Meta title:** `Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu) | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Comparamos 8 programas de facturación para autónomos en 2026: cuáles son conformes con Verifactu, para qué perfil sirve cada uno y qué evitar.
- **Categoría:** Comparativa (`comparativa`) · **Tags:** mejores programas de facturación autónomos, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-28 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 684
- **Flags:**
  - **[VERIFICAR]** — ⚠️ Tabla comparativa con **7+ celdas «[VERIFICAR antes de publicar]»** (Holded, Quipu, Declarando, Billin, FacturaDirecta, Sage…). Datos de conformidad/precio sin confirmar; no apto para publicar tal cual.
  - **[FECHA]** — Comparativa anclada a 2026 + Verifactu; «Última revisión: 19 de junio de 2026».
  - **[CONSULTAR]** — Secciones orientativas tipo «Si tu prioridad es la gestoría» (orientación, no evasión).
  - **[CTA]** — Sí. ClientLabs aparece como opción recomendada (8 menciones) + caja.

#### Cuerpo completo — mejores-programas-facturacion-autonomos-2026 (Markdown literal)

# Los 8 mejores programas de facturación para autónomos en 2026 (con Verifactu)

El mejor programa de facturación para un autónomo en 2026 es el que cumple Verifactu de serie, se aprende en una tarde y no te cobra por funciones que no usas. Verifactu será obligatorio para autónomos el 1 de julio de 2027, así que elegir ahora una herramienta conforme te ahorra migrar con prisas. Estos son ocho a considerar y para qué perfil encaja cada uno.

## Qué mirar antes de elegir

1. **Que sea conforme con Verifactu** (huella, QR, encadenamiento). Es lo primero.
2. **Que cubra tu flujo real:** facturas, presupuestos, gastos e impuestos trimestrales.
3. **Que no te cobre de más:** muchos venden por módulos lo que otros incluyen.
4. **Que se entienda:** si necesitas un curso para emitir una factura, mal empezamos.

## Comparación rápida

| Programa | Perfil ideal | Verifactu | Nota |
|---|---|---|---|
| ClientLabs | Autónomo/pyme que quiere CRM + facturación en uno | Sí, de serie | Todo en uno, sin módulos sueltos |
| Holded | Pyme con necesidades contables avanzadas | [VERIFICAR antes de publicar] | Potente pero más complejo |
| Quipu | Autónomo centrado en facturación y gestoría | [VERIFICAR antes de publicar] | Buen enlace con asesorías |
| Declarando | Autónomo que quiere asesoría incluida | [VERIFICAR antes de publicar] | Enfoque fiscal + asesor |
| Billin | Facturación sencilla | [VERIFICAR antes de publicar] | Simple, menos gestión global |
| FacturaDirecta | Autónomo técnico | [VERIFICAR antes de publicar] | Correcto y económico |
| Sage | Empresa con contabilidad formal | [VERIFICAR antes de publicar] | Orientado a contabilidad |
| Excel / Word | — | **No** | No genera huella ni QR: descártalo para 2027 |

> Última revisión: 19 de junio de 2026. Los precios y la conformidad con Verifactu de cada herramienta cambian; confírmalos en su web. [VERIFICAR antes de publicar]

## Por perfil

### Si quieres CRM y facturación en el mismo sitio
Herramientas todo-en-uno como **ClientLabs** unen clientes, facturas, presupuestos, gastos e impuestos, para no saltar entre programas. Encaja si gestionas clientes además de facturar.

### Si necesitas contabilidad avanzada
**Holded** o **Sage** dan más profundidad contable, a cambio de una curva de aprendizaje mayor. Tienes el detalle en [ClientLabs vs Holded](/blog/clientlabs-vs-holded).

### Si tu prioridad es la gestoría
**Quipu** y **Declarando** ponen el foco en la relación con tu asesor y el cumplimiento fiscal. Quipu destaca por el enlace con asesorías; Declarando incluye asesoramiento en su propuesta [VERIFICAR antes de publicar].

### Si solo quieres emitir facturas
**Billin** o **FacturaDirecta** son opciones sencillas si no necesitas gestión global del negocio.

## Lo que debes descartar

**Excel y Word.** Hoy son legales, pero no generan huella, QR ni encadenamiento, así que no servirán cuando Verifactu sea obligatorio. Si aún facturas así, lee [por qué Excel te sale caro](/blog/facturar-en-excel-2026).

## Preguntas frecuentes

**¿Cuál es el mejor programa de facturación para autónomos?**
El que cumple Verifactu, cubre tu flujo (facturas, gastos, impuestos) y se entiende sin formación. Para quien además gestiona clientes, una opción todo-en-uno como ClientLabs evita usar varios programas.

**¿Todos cumplen Verifactu?**
Los programas profesionales se están adaptando. Confirma que el que elijas sea conforme antes del 1 de julio de 2027.

**¿Quipu o Holded?**
Quipu encaja mejor con autónomos centrados en facturación y gestoría; Holded, con pymes que necesitan contabilidad avanzada.

**¿Puedo seguir con Excel?**
Hasta tu fecha de Verifactu, sí. Después, no: Excel no genera los registros obligatorios.

## En resumen

No hay un único "mejor": hay el mejor para tu perfil. Si facturas y además gestionas clientes, ClientLabs reúne CRM y facturación con Verifactu de serie. Pruébalo y compara con tu herramienta actual.

**Enlaces internos sugeridos:**
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [ClientLabs vs Holded: cuál te conviene según tu tipo de negocio](/blog/clientlabs-vs-holded)
- [FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu](/blog/alternativas-facturaplus)
- [Facturar en Excel en 2026: por qué te acaba saliendo caro](/blog/facturar-en-excel-2026)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)

---

### 12. ClientLabs vs Holded: cuál te conviene según tu tipo de negocio

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"clientlabs-vs-holded"` · **Espejo Markdown:** `content/blog/clientlabs-vs-holded.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/clientlabs-vs-holded`
- **Título (H1):** ClientLabs vs Holded: cuál te conviene según tu tipo de negocio
- **Meta title:** `ClientLabs vs Holded: cuál te conviene según tu tipo de negocio | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** ClientLabs vs Holded en 2026: diferencias reales en facturación, CRM, contabilidad y curva de aprendizaje. Cuál encaja según tu tipo de negocio.
- **Categoría:** Comparativa (`comparativa`) · **Tags:** ClientLabs vs Holded, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-25 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 559
- **Flags:**
  - **[VERIFICAR]** — ⚠️ Tabla con «Verifactu | Sí, de serie | **[VERIFICAR antes de publicar]**» y «Precio | **[VERIFICAR]** | **[VERIFICAR]**». Conformidad y precio de Holded sin confirmar.
  - **[FECHA]** — Comparativa 2026 + Verifactu; «Holded se está adaptando [VERIFICAR]».
  - **[CTA]** — Sí, muy fuerte (16 menciones): comparativa de marca propia favorable a ClientLabs + caja.

#### Cuerpo completo — clientlabs-vs-holded (Markdown literal)

# ClientLabs vs Holded: cuál te conviene según tu tipo de negocio

Resumido: **ClientLabs** encaja con autónomos y pequeñas empresas que quieren CRM y facturación en un solo sitio, fácil de usar. **Holded** es un ERP más potente, orientado a pymes con necesidades contables y de inventario, a cambio de una curva de aprendizaje mayor. La elección depende de cuánta contabilidad necesitas y cuánto valoras la sencillez.

## En qué se parecen

Ambos cubren lo básico de un negocio en España: facturación con vistas a Verifactu, presupuestos, gestión de clientes y control de cobros. Si solo necesitas eso, cualquiera de los dos sirve.

## En qué se diferencian

| | ClientLabs | Holded |
|---|---|---|
| Enfoque | CRM + facturación todo-en-uno | ERP / contabilidad avanzada |
| Curva de aprendizaje | Baja | Media-alta |
| CRM y pipeline de ventas | Integrado | Disponible, más orientado a empresa |
| Contabilidad formal / inventario | Lo esencial | Más profundo |
| Perfil ideal | Autónomo y pyme pequeña | Pyme con gestión compleja |
| Verifactu | Sí, de serie | [VERIFICAR antes de publicar] |
| Precio | [VERIFICAR antes de publicar] | [VERIFICAR antes de publicar] |

> Última revisión: 19 de junio de 2026. Precios y conformidad con Verifactu cambian; confírmalos en cada web. [VERIFICAR antes de publicar]

## Cuándo elegir ClientLabs

- Gestionas **clientes y ventas** además de facturar y quieres el pipeline al lado de las facturas.
- Quieres **empezar el primer día** sin formación.
- Eres autónomo o equipo pequeño y no necesitas contabilidad de doble partida ni inventario complejo.

## Cuándo elegir Holded

- Necesitas **contabilidad formal**, inventario o funciones de ERP.
- Tienes una **pyme con más volumen** y un responsable que saque partido a su profundidad.
- Te compensa invertir tiempo en aprenderlo a cambio de más potencia.

## ¿Y Quipu?

Si dudabas entre estos dos y Quipu, ten en cuenta que **Quipu** se orienta a la facturación y al enlace con la gestoría: buen encaje si tu prioridad es la relación con tu asesor más que el CRM o el inventario. Lo comparamos junto a otros en [los mejores programas de facturación](/blog/mejores-programas-facturacion-autonomos-2026).

## Preguntas frecuentes

**¿Qué es mejor, ClientLabs o Holded?**
Depende. ClientLabs gana en sencillez y en unir CRM con facturación; Holded gana en profundidad contable y funciones de ERP.

**¿Los dos cumplen Verifactu?**
ClientLabs sí, de serie. Holded se está adaptando [VERIFICAR antes de publicar]; confírmalo antes de tu fecha de obligatoriedad.

**¿Cuál es más fácil de usar?**
ClientLabs tiene una curva más baja; Holded requiere más aprendizaje a cambio de más opciones.

**¿Puedo migrar mis datos?**
Sí, ambos permiten importar clientes y facturas; en ClientLabs puedes traer tu cartera desde un archivo.

## En resumen

Si quieres facturar y gestionar clientes sin complicarte, ClientLabs. Si necesitas un ERP con contabilidad e inventario, Holded. Para muchos autónomos, lo segundo es más de lo que necesitan.

**Enlaces internos sugeridos:**
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Migra de Excel a ClientLabs: clientes, facturas y datos fiscales en 10 min](/blog/migrar-de-excel-a-clientlabs)
- [FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu](/blog/alternativas-facturaplus)

---

### 13. FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"alternativas-facturaplus"` · **Espejo Markdown:** `content/blog/alternativas-facturaplus.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/alternativas-facturaplus`
- **Título (H1):** FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu
- **Meta title:** `FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** FacturaPlus se quedó atrás y no encaja con Verifactu. Aquí tienes 6 alternativas modernas para autónomos y pymes, con sus puntos fuertes y para quién.
- **Categoría:** Comparativa (`comparativa`) · **Tags:** alternativas a FacturaPlus, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-15 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 522
- **Flags:**
  - **[VERIFICAR]** — ⚠️ «Confirma precios y conformidad con Verifactu de cada una en su web. **[VERIFICAR antes de publicar]**».
  - **[FECHA]** — «Verifactu será obligatorio en **2027**»; «Última revisión: 19 de junio de 2026».
  - **[CTA]** — Sí. ClientLabs como primera alternativa (10 menciones) + caja.

#### Cuerpo completo — alternativas-facturaplus (Markdown literal)

# FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu

FacturaPlus fue un clásico, pero es un programa descatalogado y de escritorio, sin actualizaciones, que no encaja con un mundo en el que Verifactu será obligatorio en 2027. Si todavía lo usas, lo sensato es migrar a una herramienta en la nube y conforme. Estas son seis alternativas y para qué perfil sirve cada una.

## Por qué cambiar de FacturaPlus

- **Sin mantenimiento.** Es software antiguo; no recibe actualizaciones legales.
- **De escritorio.** Dependes de un ordenador concreto; sin copia en la nube.
- **Verifactu.** Necesitas un sistema que genere huella, QR y encadenamiento. Un programa descatalogado no te lo va a dar.

## 6 alternativas modernas

| Alternativa | Para quién | Punto fuerte |
|---|---|---|
| ClientLabs | Autónomo/pyme que quiere CRM + facturación | Todo en uno, fácil, Verifactu de serie |
| Holded | Pyme con contabilidad avanzada | Profundidad de ERP |
| Quipu | Autónomo + gestoría | Enlace con asesorías |
| Billin | Facturación sencilla | Simplicidad |
| FacturaDirecta | Autónomo técnico | Económico y correcto |
| Sage | Empresa con contabilidad formal | Contabilidad robusta |

> Última revisión: 19 de junio de 2026. Confirma precios y conformidad con Verifactu de cada una en su web. [VERIFICAR antes de publicar]

## Cómo elegir el reemplazo

1. **En la nube**, para no depender de un equipo concreto y tener copia de seguridad.
2. **Conforme con Verifactu**, para llegar a 2027 sin migrar otra vez.
3. **Que importe tus datos** de FacturaPlus (clientes, facturas) sin empezar de cero.
4. **Que cubra impuestos** trimestrales si no quieres saltar a otra herramienta para el IVA.

## Migrar sin perder el histórico

El miedo habitual es perder años de facturas. Lo razonable es exportar tus datos de FacturaPlus y **importarlos** en la nueva herramienta. En ClientLabs puedes traer tu cartera de clientes y tus facturas desde un archivo; lo cuentas con detalle en [migrar de Excel a ClientLabs](/blog/migrar-de-excel-a-clientlabs) (el proceso es equivalente).

## Preguntas frecuentes

**¿FacturaPlus sigue siendo legal en 2026?**
Puedes seguir usándolo hasta tu fecha de Verifactu, pero al no generar huella ni QR no servirá cuando la norma sea obligatoria.

**¿Cuál es la mejor alternativa a FacturaPlus?**
Depende de tu perfil: ClientLabs si quieres CRM + facturación fácil; Holded si necesitas contabilidad avanzada; Quipu si tu foco es la gestoría.

**¿Puedo recuperar mis facturas antiguas?**
Sí, exportándolas e importándolas en la nueva herramienta.

**¿Tengo que cambiar ya?**
Cuanto antes mejor: migrar con margen es sencillo; hacerlo con la obligación encima, no.

## En resumen

FacturaPlus cumplió su etapa, pero hoy te deja expuesto de cara a Verifactu. Una herramienta en la nube y conforme te quita ese problema; ClientLabs, además, te une la facturación con la gestión de clientes.

**Enlaces internos sugeridos:**
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Facturar en Excel en 2026: por qué te acaba saliendo caro](/blog/facturar-en-excel-2026)
- [Migra de Excel a ClientLabs en 10 minutos](/blog/migrar-de-excel-a-clientlabs)
- [ClientLabs vs Holded](/blog/clientlabs-vs-holded)

---

### 14. Los mejores CRM gratis para autónomos (y cuándo se quedan cortos)

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"mejores-crm-gratis-autonomos"` · **Espejo Markdown:** `content/blog/mejores-crm-gratis-autonomos.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/mejores-crm-gratis-autonomos`
- **Título (H1):** Los mejores CRM gratis para autónomos (y cuándo se quedan cortos)
- **Meta title:** `Los mejores CRM gratis para autónomos (y cuándo se quedan cortos) | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Los mejores CRM gratis para autónomos en 2026, qué incluyen de verdad y en qué momento un plan gratuito se te queda corto y conviene dar el salto.
- **Categoría:** Comparativa (`comparativa`) · **Tags:** mejor CRM gratis autónomos, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-10 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 579
- **Flags:**
  - **[VERIFICAR]** — ⚠️ Varias celdas «[VERIFICAR antes de publicar]» (HubSpot, Pipedrive) y nota «Confirma los límites de cada plan gratuito en su web».
  - **[FECHA]** — «Última revisión: 19 de junio de 2026»; vigencia 2026.
  - **[CTA]** — Sí. ClientLabs en la tabla y cierre (4 menciones) + caja.

#### Cuerpo completo — mejores-crm-gratis-autonomos (Markdown literal)

# Los mejores CRM gratis para autónomos (y cuándo se quedan cortos)

Un CRM gratis es una buena forma de empezar a ordenar tus clientes y oportunidades sin gastar nada. El problema llega cuando creces: los planes gratuitos limitan contactos, esconden funciones clave tras el pago y casi nunca incluyen facturación. Aquí tienes opciones gratis reales y la señal de que ya se te han quedado cortas.

## Qué esperar (y qué no) de un CRM gratis

- **Sí:** guardar contactos, registrar el estado de cada oportunidad y un pipeline básico.
- **A medias:** automatizaciones, informes y usuarios extra suelen estar capados.
- **No:** facturación con Verifactu. Un CRM no es un programa de facturación.

## Opciones gratis a considerar

| CRM | Bien para | Límite habitual del plan gratis |
|---|---|---|
| HubSpot CRM | Empezar con un pipeline visual | Funciones avanzadas de pago [VERIFICAR antes de publicar] |
| Trello / Notion (montado a mano) | Quien quiere algo muy simple | No es un CRM real; lo montas tú |
| Pipedrive (prueba) | Pipeline de ventas | Prueba limitada, luego de pago [VERIFICAR antes de publicar] |
| ClientLabs | Autónomo que además factura | Empieza con prueba; une CRM + facturación |

> Última revisión: 19 de junio de 2026. Confirma los límites de cada plan gratuito en su web: cambian a menudo. [VERIFICAR antes de publicar]

## Cuándo un CRM gratis se te queda corto

Da el salto cuando notes alguna de estas señales:

1. **Pierdes oportunidades** porque el seguimiento depende de tu memoria o de notas sueltas.
2. **Tienes los clientes en el CRM y las facturas en otro sitio**, y te toca duplicar datos.
3. **Necesitas automatizar** recordatorios o tareas y el plan gratis no te deja.
4. **Trabaja más gente** y el gratis solo permite un usuario.

En ese punto, mantener "gratis pero disperso" sale más caro en tiempo que una herramienta que lo una todo.

## CRM y facturación: por qué juntarlos

El salto más rentable para un autónomo no es pagar por un CRM más potente, sino **unir el CRM con la facturación**: que del primer contacto a la factura no tengas que teclear los datos dos veces. Lo desarrollamos en [qué es un CRM](/blog/que-es-un-crm).

## Preguntas frecuentes

**¿Cuál es el mejor CRM gratis para autónomos?**
Para un pipeline visual, HubSpot CRM es de los más usados. Si además facturas, te interesa una herramienta que una CRM y facturación en lugar de dos gratuitas separadas.

**¿Un CRM gratis incluye facturación?**
Casi nunca. Un CRM gestiona clientes y ventas; facturar con Verifactu es otra herramienta.

**¿Notion o Excel sirven como CRM?**
Para empezar, sí, pero los montas a mano y no escalan: en cuanto creces, el mantenimiento te come el tiempo.

**¿Cuándo dejo el plan gratis?**
Cuando pierdes oportunidades, duplicas datos o necesitas automatizar y más usuarios.

## En resumen

Empezar gratis está bien; quedarte ahí cuando ya pierdes clientes o duplicas datos, no. ClientLabs une CRM y facturación para que dejes de saltar entre herramientas en cuanto el "gratis" empieza a costarte tiempo.

**Enlaces internos sugeridos:**
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Cómo dejar de perder clientes potenciales: un sistema de leads simple](/blog/sistema-de-leads-simple)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)

---

### 15. Facturar en Excel en 2026: por qué te acaba saliendo caro

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"facturar-en-excel-2026"` · **Espejo Markdown:** `content/blog/facturar-en-excel-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/facturar-en-excel-2026`
- **Título (H1):** Facturar en Excel en 2026: por qué te acaba saliendo caro
- **Meta title:** `Facturar en Excel en 2026: por qué te acaba saliendo caro | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Facturar en Excel sigue siendo legal en 2026, pero no cumplirá Verifactu y te expone a errores y multas. Qué riesgos asumes y cuándo dar el salto.
- **Categoría:** Negocio (`negocio`) · **Tags:** facturar en Excel, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-05 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 515
- **Flags:**
  - **[FECHA]** — «conformes con **Verifactu**» y «Hasta tu fecha de Verifactu, sí»; vigencia atada a 2026/2027.
  - **[CTA]** — Sí. Empuja a herramienta todo-en-uno (ClientLabs, 4 menciones) + caja.

#### Cuerpo completo — facturar-en-excel-2026 (Markdown literal)

# Facturar en Excel en 2026: por qué te acaba saliendo caro

Facturar en Excel todavía es legal en 2026, pero tiene fecha de caducidad: cuando Verifactu sea obligatorio (1 de julio de 2027 para autónomos), tu hoja de cálculo no servirá, porque no genera huella, código QR ni encadenamiento. Y antes de eso, ya te cuesta tiempo y errores. Esto es lo que pierdes y cuándo conviene cambiar.

## Lo que Excel no puede hacer en 2027

Verifactu exige que cada factura emitida por software lleve:

- **Huella o hash** que la haga inalterable.
- **Encadenamiento** con la factura anterior.
- **Código QR** y, en modo Verifactu, la leyenda obligatoria.

Excel no genera nada de esto. Por eso, llegado el plazo, dejará de ser una opción válida. Tienes el contexto en [Verifactu en 2026](/blog/verifactu-2026).

## El coste oculto antes incluso de Verifactu

Aunque la obligación sea en 2027, Excel ya te cuesta hoy:

| Problema | Qué te cuesta |
|---|---|
| Numeración a mano | Saltos o duplicados → facturas inválidas |
| Cálculo manual de IVA/IRPF | Errores que arrastras al trimestre |
| Sin control de cobros | Facturas que se te olvidan de cobrar |
| Sin copia segura | Un archivo corrupto y pierdes el año |
| Datos duplicados | Cliente en una hoja, factura en otra |

El "gratis" de Excel se paga en horas y en sustos con Hacienda.

## Cuándo dar el salto

- Si emites **más de unas pocas facturas al mes**.
- Si ya has tenido un **error de numeración o de IVA**.
- Si quieres llegar a **2027 sin migrar con prisas**.
- Si pierdes tiempo cuadrando el **trimestre** a mano.

## Qué ganas al cambiar

Un programa de facturación numera solo, calcula el IVA y la retención, controla cobros y —lo importante— emite facturas **conformes con Verifactu**. Si además gestionas clientes, una herramienta todo-en-uno te evita duplicar datos.

## Preguntas frecuentes

**¿Es ilegal facturar en Excel en 2026?**
No, todavía es legal. Pero no cumplirá Verifactu cuando sea obligatorio (1 de julio de 2027 para autónomos).

**¿Qué le falta a Excel para ser válido?**
Huella, código QR y encadenamiento. Excel no los genera.

**¿Puedo seguir con Excel hasta 2027?**
Puedes, pero asumes el riesgo de errores y tendrás que migrar igual. Hacerlo con margen es más cómodo.

**¿Migrar es complicado?**
No: exportas tus datos y los importas. En ClientLabs traes clientes y facturas desde un archivo en minutos.

## En resumen

Excel no es gratis: se paga en tiempo, errores y, a partir de 2027, en incumplir Verifactu. Cambiar con margen es barato. ClientLabs te deja migrar tu Excel y emitir facturas conformes desde el primer día.

**Enlaces internos sugeridos:**
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Migra de Excel a ClientLabs: clientes, facturas y datos fiscales en 10 min](/blog/migrar-de-excel-a-clientlabs)
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [7 errores de factura que más multas generan al autónomo](/blog/errores-factura-autonomo)

---

### 16. Tu primera factura legal en ClientLabs en menos de 10 minutos

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"primera-factura-clientlabs"` · **Espejo Markdown:** `content/blog/primera-factura-clientlabs.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/primera-factura-clientlabs`
- **Título (H1):** Tu primera factura legal en ClientLabs en menos de 10 minutos
- **Meta title:** `Tu primera factura legal en ClientLabs en menos de 10 minutos | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo emitir tu primera factura legal en ClientLabs en menos de 10 minutos: alta de cliente, conceptos, IVA, retención y factura conforme a Verifactu.
- **Categoría:** Tutorial (`tutorial`) · **Tags:** primera factura ClientLabs, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-03-01 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 447
- **Flags:**
  - **[DATO_FISCAL]** — Menciona IVA y retención al construir la factura (valores ilustrativos).
  - **[CTA]** — Sí, máximo (16 menciones): tutorial puro de producto + caja «Empezar gratis».

#### Cuerpo completo — primera-factura-clientlabs (Markdown literal)

# Tu primera factura legal en ClientLabs en menos de 10 minutos

Emitir tu primera factura conforme en ClientLabs son cuatro pasos: das de alta al cliente, añades los conceptos, revisas IVA y retención, y emites. El programa numera, calcula los impuestos y genera una factura con todos los elementos obligatorios (y, cuando aplique Verifactu, su huella y QR). En menos de 10 minutos la tienes lista para enviar.

## Antes de empezar

Solo necesitas tus datos fiscales (NIF, dirección) configurados una vez en tu perfil. A partir de ahí, cada factura reutiliza esos datos.

## Paso 1: añade el cliente
Crea la ficha del cliente con su nombre/razón social, NIF y dirección. Si ya lo tenías de un lead o presupuesto, está listo: no tecleas dos veces.

## Paso 2: crea la factura y añade conceptos
Nueva factura → eliges el cliente → añades líneas (concepto, cantidad, precio). El programa calcula la **base imponible** automáticamente.

## Paso 3: revisa IVA y retención
- Elige el **tipo de IVA** (21 %, 10 % o 4 %).
- Si tu actividad lleva **retención de IRPF**, aplícala (15 % o 7 %). Dudas en [qué retención poner](/blog/retencion-irpf-factura).
- ClientLabs calcula la cuota y el **total** por ti.

## Paso 4: emite
Al emitir, la factura recibe su **número correlativo** y queda registrada. Cuando Verifactu sea obligatorio, además llevará huella, QR y encadenamiento sin que tengas que hacer nada. La descargas en PDF o la envías al cliente.

## Qué acabas de evitar

| A mano | En ClientLabs |
|---|---|
| Numerar tú (riesgo de saltos) | Numeración automática |
| Calcular IVA/IRPF | Calculado solo |
| Plantilla incompleta | Todos los campos obligatorios |
| Verifactu pendiente | Conforme de serie |

## Preguntas frecuentes

**¿Cuánto tardo en hacer la primera factura?**
Menos de 10 minutos, contando configurar tus datos la primera vez.

**¿La factura es legal?**
Sí: lleva todos los elementos obligatorios y, con Verifactu, huella y QR.

**¿Puedo poner retención de IRPF?**
Sí, eliges el tipo y ClientLabs calcula el total.

**¿Y si me equivoco?**
Emites una factura rectificativa; no se borra para mantener la numeración.

## En resumen

Cuatro pasos y tienes tu primera factura legal. Lo que en Excel son cálculos y riesgos, en ClientLabs es elegir cliente, conceptos y emitir. [Crea tu cuenta](/precios) y emite la primera hoy.

**Enlaces internos sugeridos:**
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [Qué retención de IRPF pongo en mis facturas](/blog/retencion-irpf-factura)
- [Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada](/blog/verifactu-en-clientlabs)
- [Migra de Excel a ClientLabs en 10 minutos](/blog/migrar-de-excel-a-clientlabs)
- [Del primer contacto al cliente: el pipeline de ClientLabs](/blog/pipeline-de-clientlabs)

---

### 17. Del primer contacto al cliente: el pipeline de ClientLabs

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"pipeline-de-clientlabs"` · **Espejo Markdown:** `content/blog/pipeline-de-clientlabs.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/pipeline-de-clientlabs`
- **Título (H1):** Del primer contacto al cliente: el pipeline de ClientLabs
- **Meta title:** `Del primer contacto al cliente: el pipeline de ClientLabs | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo funciona el pipeline de ClientLabs: del lead al cliente con estados, seguimiento y la factura conectada, sin teclear los mismos datos dos veces.
- **Categoría:** Tutorial (`tutorial`) · **Tags:** pipeline ClientLabs, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-02-25 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 501
- **Flags:**
  - **[CTA]** — Sí. Tutorial de producto (8 menciones) con CTA inline «[Pruébalo](/precios)» + caja.

#### Cuerpo completo — pipeline-de-clientlabs (Markdown literal)

# Del primer contacto al cliente: el pipeline de ClientLabs

El pipeline de ClientLabs es el recorrido de cada oportunidad por etapas —nuevo, contactado, propuesta, cliente— para que veas de un vistazo qué tienes en marcha y qué toca hacer. Lo que lo hace útil para un autónomo es que el lead que se convierte en cliente **ya trae sus datos** a la factura: del primer contacto al cobro sin reescribir nada.

## Las etapas, de un vistazo

| Etapa | Qué significa | Acción típica |
|---|---|---|
| Nuevo | Entró un interesado | Contactar pronto |
| Contactado | Ya hablasteis | Enviar propuesta |
| Propuesta | Presupuesto enviado | Hacer seguimiento |
| Cliente | Cerrado | Facturar |
| Perdido | No salió | Aprender por qué |

## Paso 1: entra el lead
Da igual el canal (formulario web, WhatsApp, recomendación): el lead entra en el pipeline como "nuevo". Lo importante es que **todo caiga en el mismo sitio**. Concepto en [sistema de leads simple](/blog/sistema-de-leads-simple).

## Paso 2: muévelo por etapas
A medida que avanzas, cambias la etapa. Cada lead tiene su ficha con el historial: qué hablasteis, qué presupuesto enviaste, cuándo toca el siguiente paso.

## Paso 3: seguimiento que no se olvida
Cada oportunidad activa lleva una **tarea con fecha**. Así no dependes de la memoria para llamar a tiempo.

## Paso 4: de cliente a factura, sin reteclear
Cuando el lead pasa a "cliente", sus datos fiscales **ya están** en la ficha. Generas el presupuesto o la factura desde ahí, sin volver a escribir NIF ni dirección. Es el ahorro real frente a tener el CRM y la facturación separados.

## Por qué importa unir pipeline y facturación

Con herramientas separadas, el dato del cliente vive en dos sitios y se desactualiza. Con el pipeline conectado a la facturación, el recorrido es uno solo: contacto → propuesta → cliente → factura → cobro.

## Preguntas frecuentes

**¿Qué es el pipeline?**
La representación por etapas de tus oportunidades de venta, del primer contacto al cierre.

**¿De dónde entran los leads?**
De los canales que uses (web, mensajería, recomendaciones); todos a la misma lista.

**¿El pipeline se conecta con las facturas?**
Sí: cuando un lead pasa a cliente, sus datos están listos para facturar sin reteclear.

**¿Sirve si trabajo solo?**
Sí: te evita perder oportunidades por falta de seguimiento, aunque no tengas equipo.

## En resumen

El pipeline convierte "tengo varios interesados" en un sistema con etapas y seguimiento, y enlaza la venta con la factura. [Pruébalo](/precios) y lleva tus oportunidades del primer contacto al cobro en un solo flujo.

**Enlaces internos sugeridos:**
- [Cómo dejar de perder clientes potenciales: un sistema de leads simple](/blog/sistema-de-leads-simple)
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Tu primera factura legal en ClientLabs en menos de 10 minutos](/blog/primera-factura-clientlabs)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)
- [Cómo conseguir clientes por internet sin gastar en anuncios](/blog/conseguir-clientes-por-internet)

---

### 18. Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"verifactu-en-clientlabs"` · **Espejo Markdown:** `content/blog/verifactu-en-clientlabs.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/verifactu-en-clientlabs`
- **Título (H1):** Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada
- **Meta title:** `Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo ClientLabs cumple Verifactu: cada factura con huella, encadenamiento, QR y leyenda, y el envío a Hacienda automático, sin configurar nada técnico.
- **Categoría:** Tutorial (`tutorial`) · **Tags:** Verifactu ClientLabs, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-02-20 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 441
- **Flags:**
  - **[FECHA]** — Atado a Verifactu (calendario 2027).
  - **[CTA]** — Sí. Tutorial de producto (13 menciones) + caja.

#### Cuerpo completo — verifactu-en-clientlabs (Markdown literal)

# Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada

ClientLabs cumple Verifactu de serie: cada factura que emites lleva su **huella**, su **encadenamiento** con la anterior, el **código QR** y la leyenda obligatoria, y en modo Verifactu se **remite a la Agencia Tributaria** automáticamente. Tú haces la factura como siempre; la parte técnica la pone el programa.

## Qué exige Verifactu (y qué pone ClientLabs)

| Requisito de Verifactu | Lo hace ClientLabs |
|---|---|
| Huella / hash inalterable | Sí, en cada factura |
| Encadenamiento con la anterior | Sí, automático |
| Código QR | Sí, impreso en la factura |
| Leyenda "VERI*FACTU" / verificable | Sí |
| Envío a Hacienda (modo Verifactu) | Sí, automático |

Contexto de la norma y fechas en [Verifactu en 2026](/blog/verifactu-2026).

## Cómo se ve en la práctica

1. **Emites la factura** normal: cliente, conceptos, IVA.
2. Al emitir, ClientLabs **genera la huella** y la **encadena** con la factura anterior.
3. La factura sale con su **QR y leyenda**.
4. En modo Verifactu, el registro se **envía a la AEAT** sin que hagas nada.

No hay configuración técnica: ni certificados que pelear ni ficheros que subir a mano.

## Por qué esto te quita un problema

- **Cero riesgo de sanción** por factura sin QR o leyenda (hasta 1.000 € cada una) o por software no conforme (hasta 50.000 €).
- **Sin migración a última hora:** cuando llegue tu fecha (1 de julio de 2027 para autónomos), ya estás listo.
- **Tranquilidad con tu gestor:** los registros son trazables e inalterables.

## Preguntas frecuentes

**¿ClientLabs es conforme con Verifactu?**
Sí. Cada factura lleva huella, encadenamiento, QR y leyenda, y se remite a Hacienda en modo Verifactu.

**¿Tengo que configurar algo técnico?**
No. Emites la factura y el sistema añade todo lo obligatorio.

**¿Envía las facturas a Hacienda por mí?**
En modo Verifactu, sí, de forma automática.

**¿Desde cuándo tengo que cumplir?**
Autónomos, desde el 1 de julio de 2027; empresas, desde el 1 de enero de 2027. Mejor estar listo antes.

## En resumen

Verifactu suena técnico, pero contigo no lo es: ClientLabs pone huella, QR, encadenamiento y envío a Hacienda en cada factura. Tú facturas; la norma se cumple sola. [Empieza aquí](/precios).

**Enlaces internos sugeridos:**
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Tu primera factura legal en ClientLabs en menos de 10 minutos](/blog/primera-factura-clientlabs)
- [Factura electrónica obligatoria: a quién afecta y desde cuándo](/blog/factura-electronica-obligatoria)
- [7 errores de factura que más multas generan al autónomo](/blog/errores-factura-autonomo)
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)

---

### 19. Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"migrar-de-excel-a-clientlabs"` · **Espejo Markdown:** `content/blog/migrar-de-excel-a-clientlabs.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/migrar-de-excel-a-clientlabs`
- **Título (H1):** Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min
- **Meta title:** `Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo migrar de Excel a ClientLabs en 10 minutos: exporta tus clientes y facturas, impórtalos y configura tus datos fiscales. Sin perder histórico.
- **Categoría:** Tutorial (`tutorial`) · **Tags:** migrar de Excel a ClientLabs, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-02-15 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 459
- **Flags:**
  - **[CTA]** — Sí, máximo (14 menciones): tutorial de migración al producto + caja.

#### Cuerpo completo — migrar-de-excel-a-clientlabs (Markdown literal)

# Migra de Excel a ClientLabs: clientes, facturas y datos en 10 min

Pasar de Excel a ClientLabs son tres pasos: exportas lo que tienes, lo importas y configuras tus datos fiscales una vez. En unos diez minutos tienes tu cartera dentro, listo para emitir facturas conformes con Verifactu, sin perder tu histórico.

## Antes de empezar: qué vas a traer

- Tu **lista de clientes** (nombre, NIF, dirección, email).
- Tus **facturas o ingresos** anteriores, si quieres el histórico.
- Tus **datos fiscales** para emitir (los configuras una vez).

## Paso 1: exporta tu Excel
Guarda tu hoja de clientes en un archivo (CSV o Excel) con una fila por cliente y columnas claras (nombre, NIF, email...). Lo mismo con facturas si las quieres importar.

## Paso 2: importa en ClientLabs
Sube el archivo en la sección de clientes y **mapea las columnas** (esta columna es el NIF, esta el email...). ClientLabs crea una ficha por cliente. Si algo no cuadra, lo corriges antes de confirmar.

## Paso 3: configura tus datos fiscales
Introduce tu NIF, dirección y, si aplica, tu retención por defecto. A partir de aquí, cada factura reutiliza estos datos.

## Paso 4: emite tu primera factura
Con la cartera dentro, creas una factura eligiendo el cliente: numeración, IVA y total automáticos, y conforme a Verifactu. Tienes el detalle en [tu primera factura](/blog/primera-factura-clientlabs).

## Qué ganas al dejar Excel

| En Excel | En ClientLabs |
|---|---|
| Numeración a mano | Automática |
| IVA/IRPF calculado a ojo | Calculado solo |
| Sin copia segura | En la nube |
| No cumple Verifactu | Conforme de serie |
| Cliente y factura separados | Todo en una ficha |

Por qué urge dejarlo, en [facturar en Excel te sale caro](/blog/facturar-en-excel-2026).

## Preguntas frecuentes

**¿Cuánto tarda la migración?**
Unos 10 minutos para clientes; algo más si importas mucho histórico de facturas.

**¿Pierdo mis facturas antiguas?**
No: las exportas de Excel e importas, o las conservas como histórico.

**¿Necesito conocimientos técnicos?**
No. Subes el archivo y mapeas columnas; es asistido.

**¿Y si mi Excel está desordenado?**
Conviene limpiar columnas antes de importar; luego puedes corregir fichas dentro.

## En resumen

Migrar no es empezar de cero: es traer lo que ya tienes y dejar atrás los riesgos de Excel. En diez minutos tienes clientes, datos fiscales y la primera factura conforme. [Empieza la migración](/precios).

**Enlaces internos sugeridos:**
- [Facturar en Excel en 2026: por qué te acaba saliendo caro](/blog/facturar-en-excel-2026)
- [Tu primera factura legal en ClientLabs en menos de 10 minutos](/blog/primera-factura-clientlabs)
- [Clientes y proveedores sin caos: todo centralizado en un sitio](/blog/clientes-y-proveedores-centralizados)
- [Verifactu en ClientLabs: QR, huella y envío a Hacienda sin tocar nada](/blog/verifactu-en-clientlabs)
- [FacturaPlus está obsoleto: 6 alternativas modernas con Verifactu](/blog/alternativas-facturaplus)

---

### 20. Gastos deducibles del autónomo en 2026: la lista con ejemplos

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"gastos-deducibles-autonomo-2026"` · **Espejo Markdown:** `content/blog/gastos-deducibles-autonomo-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/gastos-deducibles-autonomo-2026`
- **Título (H1):** Gastos deducibles del autónomo en 2026: la lista con ejemplos
- **Meta title:** `Gastos deducibles del autónomo en 2026: la lista con ejemplos | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Lista de gastos deducibles del autónomo en 2026 por categorías, con ejemplos y los 3 requisitos que exige Hacienda para que un gasto cuente.
- **Categoría:** Guía (`guia`) · **Tags:** gastos deducibles autónomo, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 5 min
- **Nº de palabras (cuerpo):** 1024
- **Flags:**
  - **[CONSULTAR]** — «> Esto es información general, no asesoramiento fiscal personalizado. Para tu caso concreto, **consulta con tu asesor**.»
  - **[FECHA]** — Lista referida a 2026; cita «resolución del **TEAC de julio de 2023**».
  - **[DATO_FISCAL]** — Muy denso, a verificar: fórmula suministros «**m² afectos ÷ m² totales × 30 % × importe**», seguro médico «**500 €/año por persona**» / «**1.500 €/año**» discapacidad, dietas «**26,67 €/día** en España y **48,08 €/día** en el extranjero» (sin pernocta) / «**53,34 €/día** … **91,35 €/día**» (con pernocta), vehículo «**IVA … al 50 %**».
  - **[CTA]** — Sí. Cierre con ClientLabs (guardar gasto + factura + categoría) + caja.

#### Cuerpo completo — gastos-deducibles-autonomo-2026 (Markdown literal)

# Gastos deducibles del autónomo en 2026: la lista con ejemplos

Un gasto es deducible cuando está vinculado a tu actividad, lo puedes justificar con factura y lo tienes registrado en tu contabilidad. Si cumple esas tres condiciones, resta en tu IRPF y, casi siempre, te permite recuperar el IVA. Aquí tienes la lista por categorías y lo que Hacienda mira en cada caso.

## Los 3 requisitos para deducir un gasto

Antes de la lista, la regla que decide todo:

1. **Vinculación con la actividad.** El gasto tiene que estar relacionado con tu trabajo. Una comida con un cliente, sí; la cena del sábado con amigos, no.
2. **Justificación.** Necesitas **factura completa** a tu nombre y con tu NIF. Un ticket simple no suele bastar para deducir el IVA.
3. **Registro.** Debe constar en tus libros de ingresos y gastos.

Si falla uno de los tres, Hacienda puede rechazar la deducción. Hacienda puede revisar hasta **4 años** (prescripción, art. 66 LGT), pero la conservación mercantil de libros y documentación es de **6 años** (art. 30 del Código de Comercio): guarda las facturas **al menos 6 años**.

## Lista de gastos deducibles por categoría

### 1. Cuota de autónomos
La cuota mensual al RETA es **100 % deducible** como gasto. Es de los más olvidados y de los más claros.

### 2. Suministros y oficina
- **Si tienes local u oficina:** luz, agua, internet, alquiler y gastos del local son deducibles al 100 % (con factura).
- **Si trabajas desde casa:** comunica en el modelo **036/037** qué parte de la vivienda afectas a la actividad. Sobre **suministros** (luz, agua, gas, internet) la fórmula es **m² afectos ÷ m² totales × 30 % × importe de la factura**. Ejemplo: 20 % de la casa afecto → deduces el 30 % de ese 20 %, un 6 % de la factura. Tras la resolución del **TEAC de julio de 2023**, se admite esa misma proporción en el **IVA**.
- **Si eres titular o inquilino** (alquiler, IBI, comunidad, seguro del hogar): la deducción es la **proporción directa a los m² afectos**, **sin** aplicar el 30 % (ese 30 % es solo para suministros).

### 3. Material y herramientas de trabajo
Ordenador, móvil, mobiliario, material de oficina, software, herramientas del oficio. Si el bien dura varios años (un portátil), suele amortizarse en lugar de deducirse de golpe.

### 4. Software y servicios online
Tu programa de facturación, CRM, hosting, dominio, suscripciones profesionales. Plenamente deducibles si los usas para la actividad.

### 5. Asesoría y servicios profesionales
La gestoría, el abogado o el diseñador que contratas para tu negocio.

### 6. Formación
Cursos y formación relacionados con tu actividad.

### 7. Seguros
Seguro de responsabilidad civil y seguro médico privado. Este último, deducible hasta **500 €/año por persona** (tú, tu cónyuge e hijos menores de 25 que convivan contigo) y **1.500 €/año** por persona con discapacidad.

### 8. Dietas y manutención
Comidas en días de trabajo, con **pago electrónico** (no efectivo), factura a tu nombre, motivo profesional y en un municipio distinto al de tu residencia. Límites: **26,67 €/día en España y 48,08 €/día en el extranjero** sin pernocta; **53,34 €/día en España y 91,35 €/día fuera** con pernocta.

### 9. Vehículo y desplazamientos
Es el punto más delicado. El **IVA** del coche y sus gastos se admite al **50 %** por presunción; el **gasto en IRPF** solo si el vehículo se usa **en exclusiva** para la actividad (salvo actividades como el transporte). El transporte público en viajes de trabajo sí es deducible con factura.

### 10. Teléfono e internet
Deducible la parte usada para la actividad. Lo más limpio es tener una línea solo profesional.

## Tabla rápida

| Gasto | ¿Deducible? | Nota |
|---|---|---|
| Cuota de autónomos | Sí, 100 % | A menudo olvidada |
| Local / oficina | Sí, 100 % | Con factura |
| Suministros desde casa | Parcial | m² afectos ÷ totales × 30 % × factura |
| Ordenador / móvil | Sí | Puede amortizarse |
| Software (facturación, CRM) | Sí, 100 % | — |
| Gestoría | Sí, 100 % | — |
| Dietas | Sí, con límite | 26,67 € / 48,08 € sin pernocta · pago electrónico |
| Coche | Depende | IVA 50 % (presunción); IRPF solo uso exclusivo |

## Cómo no perder deducciones

El error típico no es deducir de más, sino **deducir de menos** por no guardar facturas o por no registrarlas. Llevar tus gastos en un único sitio —con la factura adjunta y la categoría asignada— hace que en cada trimestre tengas el cálculo hecho.

## Preguntas frecuentes

**¿Puedo deducir una comida con un cliente?**
Sí, si está vinculada a la actividad, tienes factura y la registras. Las comidas particulares, no.

**¿Necesito factura o me vale el ticket?**
Para deducir el IVA necesitas factura completa con tu NIF. El ticket simple no suele servir.

**¿La cuota de autónomos desgrava?**
Sí, es 100 % deducible como gasto de la actividad.

**¿Cuánto tiempo guardo las facturas?**
Hacienda puede revisar hasta 4 años (art. 66 LGT), pero el Código de Comercio obliga a conservar la documentación 6 años (art. 30). Guarda los justificantes al menos 6 años.

**¿Puedo deducir el coche?**
El IVA, al 50 % por presunción. El gasto en IRPF solo si el vehículo se usa en exclusiva para la actividad (salvo transporte).

## En resumen

Deducir bien es ordenar bien: factura a tu nombre, vinculación con la actividad y registro. ClientLabs te deja guardar cada gasto con su factura y su categoría, de modo que al cerrar el trimestre el cálculo ya está hecho.

> Esto es información general, no asesoramiento fiscal personalizado. Para tu caso concreto, consulta con tu asesor.

**Enlaces internos sugeridos:**
- [Modelo 303: cómo calcular tu IVA sin equivocarte de casilla](/blog/modelo-303)
- [Modelo 130 de IRPF: qué es, quién lo presenta y cómo calcularlo](/blog/modelo-130)
- [Calendario fiscal del autónomo 2026: todas las fechas para no pagar recargos](/blog/calendario-fiscal-autonomo-2026)
- [Cuota de autónomos 2026: cuánto pagas según tus ingresos (tabla de tramos)](/blog/cuota-autonomos-2026)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)

---

### 21. Cómo hacer una factura: partes obligatorias y plantilla gratis

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"como-hacer-una-factura"` · **Espejo Markdown:** `content/blog/como-hacer-una-factura.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/como-hacer-una-factura`
- **Título (H1):** Cómo hacer una factura: partes obligatorias y plantilla gratis
- **Meta title:** `Cómo hacer una factura: partes obligatorias y plantilla gratis | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo hacer una factura correcta en 2026: todas las partes obligatorias, tipos de factura y una plantilla gratis lista para descargar y usar.
- **Categoría:** Guía (`guia`) · **Tags:** cómo hacer una factura, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 757
- **Flags:**
  - **[DATO_FISCAL]** — «IVA … (**21 %, 10 % o 4 %**)» y «Retención de IRPF … (p. ej. **15 % o 7 %**)».
  - **[FECHA]** — Ejemplos con serie «**2026-001**»; «en 2026».
  - **[CTA]** — Sí. Ofrece «plantilla gratis» y cierra con ClientLabs (3 menciones) + caja.

#### Cuerpo completo — como-hacer-una-factura (Markdown literal)

# Cómo hacer una factura: partes obligatorias y plantilla gratis

Una factura correcta necesita siempre: un número correlativo, la fecha, tus datos y los de tu cliente, la descripción de lo que vendes, la base imponible, el IVA (y la retención de IRPF si te aplica) y el total. Si falta alguno de esos datos, la factura no es válida y tu cliente no puede deducirla. Aquí tienes cada parte explicada y una plantilla para empezar hoy.

## Partes obligatorias de una factura

| Elemento | Qué incluye |
|---|---|
| **Número y serie** | Correlativo, sin saltos. Ej.: 2026-001, 2026-002 |
| **Fecha de emisión** | Y, si procede, fecha de la operación |
| **Tus datos** | Nombre o razón social, NIF y dirección |
| **Datos del cliente** | Nombre/razón social, NIF y dirección |
| **Descripción** | Concepto, cantidad y precio unitario |
| **Base imponible** | Importe antes de impuestos |
| **IVA** | Tipo aplicado (21 %, 10 % o 4 %) y cuota |
| **Retención de IRPF** | Solo si tu actividad la lleva (p. ej. 15 % o 7 %) |
| **Total** | Lo que paga el cliente |

> El número **no puede tener huecos**: la numeración es correlativa. Puedes usar series distintas (por ejemplo, una para facturas y otra para rectificativas), pero cada serie va seguida.

## Ejemplo de cálculo

Vendes un servicio por **1.000 €**:

- Base imponible: 1.000 €
- IVA (21 %): +210 €
- Retención IRPF (15 %, si aplica): −150 €
- **Total a cobrar: 1.060 €**

La retención no la pierdes: es un adelanto de tu IRPF que tu cliente ingresa por ti en Hacienda.

## Factura completa vs. factura simplificada

- **Factura completa:** la habitual. Lleva todos los datos del cliente. Es la que tu cliente necesita para deducir.
- **Factura simplificada** (el antiguo "ticket"): se permite por debajo de cierto importe y con menos datos, pero no siempre sirve para que el receptor deduzca.

Ante la duda, emite factura completa.

## Cómo numerar tus facturas sin liarte

- Empieza cada año con una serie clara: `2026-001`.
- No saltes números ni los repitas.
- Si anulas una factura ya emitida, no la borres: haz una **factura rectificativa**.

## Y a partir de 2027, Verifactu

Si emites con software, a partir de 2027 tus facturas deberán incluir **huella, código QR y encadenamiento** (normativa Verifactu). No es algo que hagas tú a mano: lo añade el programa. Si aún facturas en Excel, es buen momento para planificar el cambio. Tienes el detalle en [Verifactu en 2026](/blog/verifactu-2026).

## Descarga la plantilla de factura gratis

Hemos preparado una **plantilla de factura editable** con todos los campos obligatorios ya colocados, lista para rellenar.

> **[Descargar plantilla de factura gratis →](#)** _(introduce tu email y te la enviamos)_

Es un buen punto de partida. El salto siguiente —numeración automática, IVA calculado y facturas conformes con Verifactu— ya pide un programa de facturación.

## Preguntas frecuentes

**¿Qué datos son obligatorios en una factura?**
Número correlativo, fecha, datos de emisor y cliente (con NIF), descripción, base imponible, IVA y total. La retención de IRPF, solo si tu actividad la lleva.

**¿Puedo hacer facturas en Excel?**
Sí, hoy es legal, pero a partir de 2027 el software de facturación deberá cumplir Verifactu (huella, QR, encadenamiento), algo que Excel no genera.

**¿Tengo que poner IVA siempre?**
Casi siempre. Hay operaciones exentas o con inversión del sujeto pasivo, pero por defecto aplicas el tipo que corresponda (21 %, 10 % o 4 %).

**¿Cuándo pongo retención de IRPF?**
Cuando tu actividad profesional la lleva y facturas a empresas o a otros autónomos. El tipo general es 15 % (7 % para nuevos autónomos durante un tiempo). Lo desarrollamos en [qué retención de IRPF poner](/blog/retencion-irpf-factura).

**¿Cómo corrijo una factura con un error?**
No la borres: emite una **factura rectificativa** que la corrija.

## En resumen

Hacer una factura es sencillo si no te dejas ningún campo. La plantilla te saca del apuro hoy; cuando factures con frecuencia, ClientLabs numera, calcula el IVA y emite facturas conformes con Verifactu por ti.

**Enlaces internos sugeridos:**
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [¿Qué retención de IRPF pongo en mis facturas? 15 %, 7 % y cuándo no aplica](/blog/retencion-irpf-factura)
- [7 errores de factura que más multas generan al autónomo](/blog/errores-factura-autonomo)
- [Gastos deducibles del autónomo en 2026: la lista con ejemplos](/blog/gastos-deducibles-autonomo-2026)
- [Tu primera factura legal en ClientLabs en menos de 10 minutos](/blog/primera-factura-clientlabs)

---

### 22. Cómo darte de alta como autónomo en 2026 (Hacienda y SS)

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"darse-de-alta-como-autonomo-2026"` · **Espejo Markdown:** `content/blog/darse-de-alta-como-autonomo-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/darse-de-alta-como-autonomo-2026`
- **Título (H1):** Cómo darte de alta como autónomo en 2026 (Hacienda y SS)
- **Meta title:** `Cómo darte de alta como autónomo en 2026 (Hacienda y SS) | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Cómo darse de alta como autónomo en 2026: alta en Hacienda (036/037) y en la Seguridad Social (RETA), plazos, tarifa plana y documentación.
- **Categoría:** Guía (`guia`) · **Tags:** darse de alta como autónomo, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 785
- **Flags:**
  - **[CONSULTAR]** — «> Información general, no asesoramiento personalizado. Confirma epígrafe y base de cotización con tu asesor.» y «Un **gestor** te ayuda a elegir epígrafe y base de cotización».
  - **[FECHA]** — «La **tarifa plana en 2026**»; vigencia 2026.
  - **[DATO_FISCAL]** — «**80 € de base** … cuota real ronda los **88,64 €/mes**», «**2 años sin alta en el RETA**», discapacidad «**≥ 33 %** … **24 meses**», «**cuota cero**» autonómica, modelos 036/037 y **TA.0521**.
  - **[CTA]** — Sí. Cierre con ClientLabs (primera factura + IVA/IRPF) + caja.

#### Cuerpo completo — darse-de-alta-como-autonomo-2026 (Markdown literal)

# Cómo darte de alta como autónomo en 2026 (Hacienda y SS)

Darte de alta como autónomo son **dos trámites**: primero en Hacienda (alta censal con el modelo 036 o 037, declarando tu actividad) y después en la Seguridad Social (alta en el RETA). Ambos son gratuitos y se hacen online. Aquí tienes el orden, los plazos y la documentación para no dejarte nada.

## Los dos trámites, en orden

### 1. Hacienda — alta censal (modelo 036 o 037)
Comunicas a la Agencia Tributaria que vas a ejercer una actividad económica:

- **Modelo 037** (simplificado) o **036** (completo).
- Eliges tu **epígrafe del IAE** (el código de tu actividad).
- Declaras tus obligaciones de IVA e IRPF.
- **Plazo:** debe presentarse **antes** de iniciar la actividad.

### 2. Seguridad Social — alta en el RETA
Te das de alta en el Régimen Especial de Trabajadores Autónomos:

- Se hace en la Tesorería General de la Seguridad Social (online con certificado o Cl@ve).
- Eliges tu **base de cotización** dentro del sistema de cotización por **ingresos reales**.
- **Plazo:** el alta (modelo **TA.0521**) se tramita **con carácter previo** al inicio de la actividad y hasta **60 días antes**. Si la haces fuera de plazo, surte efecto desde el **día 1 del mes** (pierdes el prorrateo) y puede acarrear recargos o sanciones.

> Orden recomendado: primero Hacienda, después Seguridad Social, y siempre **antes** de emitir tu primera factura.

## Documentación que necesitas

- DNI o NIE.
- Certificado digital o Cl@ve (para hacerlo online).
- Datos de tu actividad: epígrafe IAE, dirección, fecha de inicio.
- Cuenta bancaria (IBAN) para la domiciliación de la cuota.

## La tarifa plana en 2026

Los nuevos autónomos pueden acogerse a la **tarifa plana**: **80 € de base los 12 primeros meses** (con el MEI, la cuota real ronda los **88,64 €/mes**), prorrogable **12 meses más** si tus rendimientos netos del primer año no superan el SMI. Requisitos: **2 años sin alta en el RETA** (3 si ya usaste antes la bonificación) y estar al corriente con Hacienda y la Seguridad Social. Para personas con **discapacidad ≥ 33 %** o **víctimas de violencia de género o de terrorismo** son **24 meses**. Se marca al darse de alta en el **modelo TA.0521**; si se olvida, se pierde. Además, varias comunidades (Andalucía, Madrid, Galicia, Murcia…) tienen una **"cuota cero"** que puede dejarla en 0 €. Pasado el periodo bonificado, pagas según la **cuota por ingresos reales** (tramos).

Tienes el detalle de cuánto pagarás después en [Cuota de autónomos 2026](/blog/cuota-autonomos-2026).

## Después del alta: tus obligaciones básicas

Una vez dado de alta, tu calendario incluye normalmente:

- **IVA trimestral** con el [modelo 303](/blog/modelo-303).
- **IRPF trimestral** con el [modelo 130](/blog/modelo-130), si tributas en estimación directa.
- **Facturar correctamente** desde el primer día (y, desde 2027, con software conforme a Verifactu).

## Preguntas frecuentes

**¿Cuánto cuesta darse de alta como autónomo?**
El alta en Hacienda y en la Seguridad Social es gratuita. El coste es la cuota mensual del RETA, reducida con la tarifa plana al principio.

**¿Qué hago primero, Hacienda o Seguridad Social?**
Primero el alta censal en Hacienda (036/037) y después el alta en el RETA. Todo, antes de empezar a facturar.

**¿Puedo darme de alta solo unos días al mes?**
Sí: hasta **3 altas y 3 bajas por año natural** con efecto el día real (cuota prorrateada por días). A partir de la 4.ª, el alta cuenta desde el día 1 y la baja hasta el último día del mes (pagas el mes completo). La baja se comunica en los **3 días naturales** siguientes al cese.

**¿Necesito gestor para darme de alta?**
No es obligatorio: puedes hacerlo tú online con certificado o Cl@ve. Un gestor te ayuda a elegir epígrafe y base de cotización.

**¿Tengo que emitir facturas desde el primer día?**
Sí, toda actividad debe documentarse con factura. Conviene tener listo el método antes de empezar.

## En resumen

Darse de alta es gratis y se hace online en dos pasos: Hacienda y Seguridad Social. Cuando tengas el alta, lo siguiente es facturar bien y llevar tus impuestos al día: ClientLabs te deja emitir tu primera factura conforme y tener el IVA y el IRPF calculados sin montar una hoja de cálculo.

> Información general, no asesoramiento personalizado. Confirma epígrafe y base de cotización con tu asesor.

**Enlaces internos sugeridos:**
- [Cuota de autónomos 2026: cuánto pagas según tus ingresos (tabla de tramos)](/blog/cuota-autonomos-2026)
- [Calendario fiscal del autónomo 2026: todas las fechas para no pagar recargos](/blog/calendario-fiscal-autonomo-2026)
- [Gastos deducibles del autónomo en 2026: la lista con ejemplos](/blog/gastos-deducibles-autonomo-2026)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [Modelo 130 de IRPF: qué es, quién lo presenta y cómo calcularlo](/blog/modelo-130)

---

### 23. Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"kit-digital-2026"` · **Espejo Markdown:** `content/blog/kit-digital-2026.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/kit-digital-2026`
- **Título (H1):** Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio
- **Meta title:** `Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Kit Digital 2026: qué es el bono de digitalización, quién puede pedirlo, en qué se gasta y cómo solicitarlo paso a paso a través de un agente digitalizador.
- **Categoría:** Negocio (`negocio`) · **Tags:** kit digital 2026, autónomos, 2026
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 587
- **Flags:**
  - **[FECHA]** — Programa de ayudas atado a 2026 («Kit Digital 2026»); convocatorias y plazos cambian.
  - **[DATO_FISCAL]** — Importes del bono por segmento de empresa (verificar cuantías y convocatoria vigentes).
  - **[CTA]** — Sí. Posiciona ClientLabs como solución subvencionable (6 menciones) + caja.

#### Cuerpo completo — kit-digital-2026 (Markdown literal)

# Kit Digital 2026: cómo conseguir la ayuda para digitalizar tu negocio

El Kit Digital es una ayuda pública (financiada con fondos europeos) que te da un **bono** para digitalizar tu negocio: web, CRM, facturación, ciberseguridad y más. Lo solicitas tú, pero el servicio lo prestas a través de un **agente digitalizador** adherido. Aquí tienes quién puede pedirlo, en qué se gasta y cómo solicitarlo.

> Programa regulado por la **Orden TDF/39/2026** (BOE de 28 de enero de 2026): **activo hasta agotar fondos**, sin fecha de cierre fija. Importe vigente en la web oficial: [kitdigital.red.es](https://kitdigital.red.es).

## Qué es el bono digital

Una subvención en forma de "bono" que cubre soluciones de digitalización concretas (las llamadas categorías). No es dinero en mano: pagas la solución a un agente digitalizador y la ayuda cubre el importe del bono.

## Quién puede pedirlo

- **Autónomos** (incluidos los que llevan **6 meses o más de alta en el RETA**, tras la ampliación de 2026) y **pymes**, al corriente de sus obligaciones.
- Para autónomos, el bono se mueve en un **rango de 2.000 a 3.000 €** según la convocatoria (la numeración de segmentos varía entre fuentes). Importe vigente en [kitdigital.red.es](https://kitdigital.red.es).

## En qué puedes gastarlo

Categorías del catálogo (incluyen las que cubre ClientLabs):

- Sitio web y presencia en internet.
- Gestión de clientes (**CRM**).
- Gestión de procesos y facturación electrónica.
- Ciberseguridad.
- Comunicaciones seguras, oficina virtual, etc.

El catálogo incluye **gestión de clientes (CRM)** y **factura electrónica**, así que **ClientLabs** encaja como solución a contratar **a través de un agente digitalizador**: usas el bono para poner en marcha tu CRM y tu facturación conforme con Verifactu. (Importe concreto en [kitdigital.red.es](https://kitdigital.red.es).)

## Cómo solicitarlo (pasos)

1. **Hazte el test de diagnóstico digital** en la plataforma oficial.
2. **Regístrate** y solicita la ayuda en la sede electrónica del programa.
3. **Espera la concesión** del bono.
4. **Elige un agente digitalizador** y la solución (por ejemplo, CRM + facturación).
5. **Firmáis el acuerdo** y se presta el servicio; el bono cubre el importe.

> El bono **no se cobra en dinero**: lo recibe el **agente digitalizador**; tú solo pagas el **IVA** y el exceso sobre el tope del bono.

## Preguntas frecuentes

**¿El Kit Digital sigue disponible en 2026?**
Sí. La Orden TDF/39/2026 lo mantiene activo hasta agotar fondos, sin fecha de cierre fija.

**¿Cuánto dan?**
Para autónomos, entre 2.000 y 3.000 € según convocatoria. El importe vigente, en kitdigital.red.es.

**¿En qué lo puedo gastar?**
En soluciones de digitalización: web, CRM, facturación, ciberseguridad, etc.

**¿Puedo usarlo para un CRM y facturación?**
Sí: gestión de clientes (CRM) y factura electrónica están en el catálogo, y ClientLabs encaja vía agente digitalizador.

**¿Lo gestiono yo o el agente?**
La solicitud la haces tú; la solución la presta el agente digitalizador.

## En resumen

El Kit Digital te ayuda a pagar la digitalización que ya ibas a necesitar. Si lo vas a usar en gestión de clientes y facturación, ClientLabs es una opción elegible a través de agente digitalizador, con CRM y facturación conforme a Verifactu.

> Confirma cuantías, requisitos y plazos en la sede oficial del programa antes de solicitarlo.

**Enlaces internos sugeridos:**
- [Qué es un CRM (y por qué tu Excel y tu agenda se quedan cortos)](/blog/que-es-un-crm)
- [Verifactu en 2026: por qué se aplazó a 2027 y qué te obliga ya](/blog/verifactu-2026)
- [Los 8 mejores programas de facturación para autónomos en 2026](/blog/mejores-programas-facturacion-autonomos-2026)
- [Cómo conseguir clientes por internet sin gastar en anuncios](/blog/conseguir-clientes-por-internet)
- [Migra de Excel a ClientLabs en 10 minutos](/blog/migrar-de-excel-a-clientlabs)

---

### 24. Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"retencion-irpf-factura"` · **Espejo Markdown:** `content/blog/retencion-irpf-factura.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/retencion-irpf-factura`
- **Título (H1):** Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones
- **Meta title:** `Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Qué retención de IRPF poner en tus facturas: 15 % general, 7 % para nuevos autónomos y cuándo no se aplica. Con ejemplo de cálculo y FAQ.
- **Categoría:** Guía (`guia`) · **Tags:** retención IRPF factura autónomo, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 659
- **Flags:**
  - **[CONSULTAR]** — «> Información general, no asesoramiento personalizado. Confirma tu caso con tu asesor.» y «Si dudas de tu epígrafe, **confírmalo con tu asesor**».
  - **[DATO_FISCAL]** — «retención de IRPF del **15 %**», «**7 %** … el año de alta y los **dos siguientes**», «se calcula siempre sobre la **base imponible**».
  - **[FECHA]** — Ejemplo: «alta en **mayo de 2026** → 7 % el resto de 2026, todo 2027 y todo 2028, y 15 % desde 2029».
  - **[CTA]** — Sí. Cierre con ClientLabs + caja.

#### Cuerpo completo — retencion-irpf-factura (Markdown literal)

# Qué retención de IRPF pongo en mis facturas: 15 %, 7 % y excepciones

Si eres autónomo profesional y facturas a empresas o a otros autónomos, en general aplicas una retención de IRPF del **15 %**. Si acabas de empezar, puedes usar el **7 %** durante los primeros años. Y hay casos en los que **no se pone retención**: cuando facturas a particulares o cuando tu actividad no es profesional. Aquí tienes cuándo va cada una.

## La regla rápida

| Situación | Retención |
|---|---|
| Autónomo profesional → empresa o autónomo | **15 %** |
| Nuevo autónomo profesional (año de alta + 2 siguientes) | **7 %** |
| Factura a un particular (consumidor final) | **Sin retención** |
| Actividad empresarial (no profesional) en estimación directa | Normalmente **sin retención** |

> La retención **no es un coste extra**: es un adelanto de tu IRPF que tu cliente ingresa en Hacienda por ti. Lo recuperas (o ajustas) en la declaración de la renta.

## Ejemplo de cálculo

Facturas un servicio profesional por **1.000 €** a una empresa, con retención del 15 %:

- Base imponible: 1.000 €
- IVA (21 %): +210 €
- Retención IRPF (15 %): −150 €
- **Total a cobrar: 1.060 €**

Tu cliente te paga 1.060 € e ingresa los 150 € de retención a Hacienda a tu nombre.

## Cuándo se aplica el 7 %

Los autónomos profesionales que se dan de alta (sin haber ejercido actividad profesional el año anterior) aplican el **7 %** el año de alta y los **dos siguientes**; después salta automáticamente al **15 %**. Ejemplo: alta en mayo de 2026 → 7 % el resto de 2026, todo 2027 y todo 2028, y 15 % desde 2029. La retención se calcula siempre sobre la **base imponible**, nunca sobre el total con IVA.

## Cuándo NO se pone retención

- **Facturas a particulares.** Un consumidor final no practica retención.
- **Actividades empresariales** (no profesionales) en estimación directa: por norma general no llevan retención en factura; el adelanto de IRPF lo haces tú con el [modelo 130](/blog/modelo-130).
- **Clientes extranjeros:** las facturas a empresas de fuera de España **no llevan retención de IRPF** (solo aplica cuando el pagador es español y está obligado a retener). Esos ingresos cuentan como **sin retención** para la regla del 70 % del [modelo 130](/blog/modelo-130).

## ¿Profesional o empresarial? Por qué importa

La retención va ligada a las actividades **profesionales** (las de la sección segunda del IAE: consultores, diseñadores, abogados, etc.). Las **empresariales** (comercio, hostelería, producción) normalmente no retienen en factura. Si dudas de tu epígrafe, confírmalo con tu asesor.

## Preguntas frecuentes

**¿Qué retención pongo si soy nuevo autónomo?**
Puedes optar por el 7 % en el año de alta y los dos siguientes; después, el 15 %.

**¿Pongo retención en facturas a particulares?**
No. Solo se practica retención cuando el cliente es una empresa u otro autónomo.

**¿La retención es dinero que pierdo?**
No. Es un adelanto de tu IRPF: lo regularizas en la declaración de la renta.

**¿Quién ingresa la retención en Hacienda?**
Tu cliente. Por eso te paga el importe ya descontado.

**Si me retienen, ¿tengo que presentar el modelo 130?**
Depende. Quien factura con retención a la mayor parte de sus clientes puede quedar exento del 130. Lo vemos en [Modelo 130](/blog/modelo-130).

## En resumen

15 % por defecto, 7 % si empiezas, y nada cuando facturas a particulares. ClientLabs aplica la retención correcta a cada factura y te deja el total calculado, sin que tengas que repasar porcentajes.

> Información general, no asesoramiento personalizado. Confirma tu caso con tu asesor.

**Enlaces internos sugeridos:**
- [Modelo 130 de IRPF: qué es, quién lo presenta y cómo calcularlo](/blog/modelo-130)
- [Cómo hacer una factura: partes obligatorias y plantilla gratis](/blog/como-hacer-una-factura)
- [Modelo 303: cómo calcular tu IVA sin equivocarte de casilla](/blog/modelo-303)
- [Gastos deducibles del autónomo en 2026: la lista con ejemplos](/blog/gastos-deducibles-autonomo-2026)
- [Calendario fiscal del autónomo 2026](/blog/calendario-fiscal-autonomo-2026)

---

### 25. Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula

- **Archivo (cuerpo live):** `app/blog/content-*.tsx` → clave `"modelo-130"` · **Espejo Markdown:** `content/blog/modelo-130.md` · **Metadatos:** `app/blog/data.ts`
- **Slug / URL:** `/blog/modelo-130`
- **Título (H1):** Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula
- **Meta title:** `Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula | ClientLabs Blog` (la plantilla añade el sufijo; el H1 coincide con el título)
- **Meta description:** Modelo 130 de IRPF: qué es, quién está obligado, cómo se calcula el pago fraccionado del 20 % y cuándo estás exento. Con ejemplo y plazos 2026.
- **Categoría:** Normativa (`normativa`) · **Tags:** modelo 130, autónomos
- **Estado:** Publicado · **Fecha (`publishedAt`):** 2026-06-19 · **Lectura:** 4 min
- **Nº de palabras (cuerpo):** 620
- **Flags:**
  - **[CONSULTAR]** — Disclaimer de cierre: «> Información general, no asesoramiento personalizado.»
  - **[DATO_FISCAL]** — «**20 % del beneficio** acumulado»; «Exento: si **el 70 % o más** de tus ingresos … ya llevaron retención». Plazos 2026.
  - **[FECHA]** — «plazos 2026» (vencimientos trimestrales del año).
  - **[CTA]** — Sí. Cierre con ClientLabs («el resultado del periodo listo para presentar») + caja.

#### Cuerpo completo — modelo-130 (Markdown literal)

# Modelo 130 de IRPF: qué es, quién lo presenta y cómo se calcula

El modelo 130 es el pago fraccionado del IRPF: cada trimestre adelantas a Hacienda el **20 % del beneficio** acumulado de tu actividad. Lo presentan los autónomos en estimación directa que **no** retienen IRPF en la mayoría de sus facturas. Si la mayor parte de tu facturación ya lleva retención, normalmente estás exento.

## Qué es exactamente

Es la forma de ir pagando tu IRPF a lo largo del año en vez de todo de golpe en la renta. Declaras tus ingresos y gastos del trimestre y abonas el 20 % de la diferencia. Luego, en la declaración de la renta, se regulariza.

## Quién está obligado (y quién no)

- **Obligado:** autónomo en **estimación directa** cuya actividad **no** practica retención, o que retuvo en **menos del 70 %** de sus ingresos del **año anterior**. En **módulos** (estimación objetiva) se usa el **modelo 131**, no el 130.
- **Exento:** si **el 70 % o más** de tus ingresos del año anterior ya llevaron retención de IRPF en factura. En ese caso, Hacienda ya va cobrando vía retenciones y no presentas el 130.

Por eso muchos profesionales (que sí retienen) no presentan el 130, mientras que comerciantes y actividades empresariales (que no retienen) sí.

## Cómo se calcula

Fórmula básica del trimestre:

**(Ingresos acumulados − Gastos acumulados) × 20 % − pagos de trimestres anteriores − retenciones**

### Ejemplo
Primer trimestre, actividad sin retención:

- Ingresos: 9.000 €
- Gastos deducibles: 3.000 €
- Beneficio: 6.000 €
- Pago fraccionado: 6.000 × 20 % = **1.200 €**

El cálculo es **acumulado**: en el segundo trimestre sumas todo el año hasta ahí y restas lo ya pagado.

## Plazos de presentación en 2026

| Trimestre | Periodo | Plazo |
|---|---|---|
| 1T | enero–marzo | 1–20 de abril |
| 2T | abril–junio | 1–20 de julio |
| 3T | julio–septiembre | 1–20 de octubre |
| 4T | octubre–diciembre | 1–30 de enero (2027) |

Con **domiciliación bancaria**, el cargo se adelanta unos **5 días** respecto al fin de cada plazo.

## Errores que cuestan dinero

- **Olvidar gastos deducibles:** cada gasto que no incluyes hace que pagues 20 % de más. Revisa la [lista de gastos deducibles](/blog/gastos-deducibles-autonomo-2026).
- **No acumular bien:** el 130 es acumulativo; no se calcula trimestre suelto.
- **Presentar fuera de plazo:** genera recargos.

## Preguntas frecuentes

**¿Quién presenta el modelo 130?**
Autónomos en estimación directa cuya actividad no retiene IRPF (o retiene en menos del 70 % de sus ingresos).

**¿Cuándo estoy exento del 130?**
Cuando el 70 % o más de tus ingresos del año anterior ya llevaron retención de IRPF en factura.

**¿Cuánto se paga?**
El 20 % del beneficio acumulado (ingresos − gastos), menos lo ya pagado y las retenciones soportadas.

**¿El 130 es lo mismo que el 303?**
No. El [303](/blog/modelo-303) es el IVA; el 130 es el adelanto del IRPF.

**¿Si presento el 130 también hago la declaración de la renta?**
Sí. El 130 son adelantos; en la renta se regulariza todo.

## En resumen

El 130 es tu IRPF a plazos: 20 % del beneficio cada trimestre, salvo que ya retengas en la mayoría de tus facturas. Llevar ingresos y gastos en un único sitio hace que el cálculo de cada trimestre esté hecho. ClientLabs te muestra el resultado del periodo listo para presentar.

> Información general, no asesoramiento personalizado.

**Enlaces internos sugeridos:**
- [Modelo 303: cómo calcular tu IVA sin equivocarte de casilla](/blog/modelo-303)
- [Qué retención de IRPF pongo en mis facturas](/blog/retencion-irpf-factura)
- [Gastos deducibles del autónomo en 2026](/blog/gastos-deducibles-autonomo-2026)
- [Calendario fiscal del autónomo 2026](/blog/calendario-fiscal-autonomo-2026)
- [Cuota de autónomos 2026: tabla de tramos](/blog/cuota-autonomos-2026)

---

## PASO 4 — Recuento final

- **Total de artículos:** 25
- **Palabras totales (cuerpos):** 14.915 · media 597 palabras/artículo
- **Con [CONSULTAR]** (derivan a asesor/gestor o disclaimer «información general»): **7** → modelo-303, cuota-autonomos-2026, mejores-programas-facturacion-autonomos-2026, gastos-deducibles-autonomo-2026, darse-de-alta-como-autonomo-2026, retencion-irpf-factura, modelo-130
- **Con [FECHA]** (años/plazos: 2025–2029, Verifactu, Kit Digital…): **18**
- **Con [DATO_FISCAL]** (cifras fiscales a verificar): **12**
- **Con [LATAM]:** **0** (ninguno: todo el contenido es de fiscalidad española — Hacienda, RETA, IRPF, IVA).
- **Con [CTA]:** **25** (todos: cierre promocional + caja «Empezar gratis» de la plantilla).
- **Sin [CTA]:** **0**
- ⚠️ **Con marcador editorial `[VERIFICAR antes de publicar]` visible en el cuerpo:** **5** → calendario-fiscal-autonomo-2026, mejores-programas-facturacion-autonomos-2026, clientlabs-vs-holded, alternativas-facturaplus, mejores-crm-gratis-autonomos
