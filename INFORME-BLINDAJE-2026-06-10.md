# Informe de blindaje final — 10 junio 2026

Pasada de blindaje pre-lanzamiento (lanzamiento: 23 junio 2026). Metodología: cada hallazgo de subagente fue re-verificado contra los archivos reales antes de actuar (hubo dos falsos positivos graves de subagentes, documentados abajo). Ningún commit ni push realizado. Stripe y la lógica Verifactu/AEAT no se han tocado.

---

## 1. Resumen ejecutivo

| Área | Estado |
|---|---|
| Dashboard principal | ✅ OK — 100% datos reales verificados, sin cambios necesarios |
| Leads | ✅ Corregido — `estimatedValue` cableado de punta a punta; panel de integraciones saneado |
| Clientes / Client 360 | ✅ OK — endpoints dudosos verificados como existentes |
| Proveedores | ✅ OK — 1 nota menor (números de pedido aleatorios) |
| Tareas y Proyectos | ✅ OK — invalidación Redis verificada |
| Facturación | ✅ Corregido — bug real de IVA en albaranes arreglado; portal móvil arreglado |
| Verifactu/AEAT | ⚠️ AUDITADO, NO MODIFICADO — hallazgos críticos para founder + gestor (sección 3) |
| Informes | ✅ ACTIVADO — reconstruido con datos 100% reales (el código anterior era mock) |
| Equipo | ✅ OK — flujo de invitación verificado de punta a punta |
| Ajustes | ✅ OK — 1 mock huérfano eliminado |
| Mock eliminado | 4 zonas: `/dashboard/integrations`, `/dashboard/analytics`, `settings/Integrations.tsx`, `settings/Billing.tsx` |

---

## 2. Detalle por módulo

### 2.1 Dashboard principal — OK, sin cambios

Verificado personalmente (no solo por subagente):

- **KPIs**: `/api/dashboard/summary` — ingresos vía `Invoice.aggregate` con `status: "PAID", type: "CUSTOMER", paidAt: { gte, lte }` (línea 66). Deltas calculados de verdad periodo vs periodo anterior. Sparklines vía `DATE_TRUNC` SQL real (líneas 80–86). Las 31 queries del endpoint scoped por `userId`.
- **Pipeline comercial**: `prisma.lead.groupBy(["leadStatus"])` con `_sum.estimatedValue` (summary/route.ts:85–90) → muestra conteos y valor, no nombres. *Nota: hasta hoy `estimatedValue` siempre era 0 porque nada lo escribía — corregido en Leads, ver 2.2.*
- **Salud de cartera**: reglas reales (champions top 20% por `totalSpent`, riesgo 30+ días sin actividad o facturas vencidas, churn 60+ días), scoped por userId.
- **Selector 7d/30d/MTD/QTD/YTD**: escribe `?period=` en la URL (`DashboardView.tsx:219–226`) y re-consulta.
- **Exportar**: `DashboardView.tsx:276` → `/api/dashboard/export?format=xlsx|pdf&period=...` — endpoint existe, `maxDuration 25`, valida formato y periodo, scoped userId.
- **Topbar**: `QuickCreateMenu` ("+ Nuevo") — los 6 items navegan a rutas verificadas como existentes (leads, clients, invoicing?newInvoice=1, presupuestos, albaranes, providers). `HelpMenu` ("?") → mailto. Buscador → `/api/search` (existe). Notificaciones → `/api/notifications` (existe, `refetchInterval: 30_000` cumple la regla).
- **Falsos "0%" / gradientes**: los matches de "0%/100%" en el código son stops de gradientes SVG, no datos.
- **Sin `Math.random()` ni cifras hardcodeadas** en dashboard, summary ni export.

### 2.2 Leads — corregido

**Botón "Conectar" (bug reportado)** — diagnóstico completo:

- El botón (`app/dashboard/leads/components/LeadsPageView.tsx:185` y `modules/leads/components/ConnectWebButton.tsx:12`) **ya apuntaba a `/dashboard/connect`**, que tras trazarlo es el panel de integraciones REAL (tabs Conexiones/Formularios/Actividad, react-query contra `/api/integrations`, `/api/forms`, `/api/calendar/token`). Git confirma que apunta ahí desde antes del último rediseño.
- El "panel equivocado" existía como ruta paralela: **`/dashboard/integrations` era un prototipo 100% mock** (12 integraciones falsas "Conectado", webhooks inventados con dominios `estudiovega.io`, archivo `mock.ts`), accesible por URL directa. Un segundo mock huérfano vivía en `app/dashboard/settings/components/Integrations.tsx` (toggles falsos en estado local).
- **Causa probable de la percepción del bug**: `/dashboard/connect` está gateado por `can("calendarSync")` (`connect/page.tsx:789`) → en plan STARTER/FREE el botón "Conectar" muestra un **UpgradeWall** en vez del panel. Eso es decisión de `plan-gates.ts` (calendarSync: false en STARTER) y NO lo he tocado — decide tú si el hub de integraciones debe gatearse por esa feature key (ver sección 4, punto P3).

Fixes aplicados:
- `app/dashboard/integrations/page.tsx` → reescrito como redirect permanente a `/dashboard/connect`; borrados `mock.ts`, `components/` (8 archivos), `hooks/`, `loading.tsx`.
- `app/dashboard/settings/components/Integrations.tsx` → eliminado (huérfano, sin importadores — verificado por grep).
- Sidebar (`app/dashboard/components/Sidebar.tsx:123`): item "Integraciones" pasaba de `comingSoon: true → /dashboard/integrations` (mock) a item activo → `/dashboard/connect` (panel real). Las features diferidas (Marketing, Automatizaciones, IA) siguen `comingSoon` intactas.
- `components/layout/DashboardHeader.tsx:36`: añadido título "Integraciones" para `/dashboard/connect`.

**`estimatedValue` (requisito del checklist)** — estaba roto de punta a punta:
- El form de alta no tenía el campo; el POST `/api/leads` guardaba `budget` solo en `metadata` JSON; el PATCH no permitía editarlo; **nada escribía la columna `Lead.estimatedValue` que el pipeline del dashboard suma** → el valor del pipeline siempre era 0.
- Fixes:
  - `modules/leads/actions/index.ts` (createLead, ~línea 455): acepta `estimatedValue`, valida y escribe la columna real.
  - `modules/leads/components/CreateLeadManualDialog.tsx`: input "Valor estimado (€)" en el alta manual.
  - `app/api/leads/[id]/route.ts:39–51`: PATCH acepta `estimatedValue` (validación numérica, `""`→null, errores 400).
  - `src/domains/leads/components/LeadInfoCard.tsx`: campo editable + formato es-ES en vista.
  - `modules/leads/components/LeadPanel.tsx` + `app/dashboard/leads/[id]/page.tsx`: select del campo y serialización Decimal→number.
  - `app/api/leads/route.ts:263–276`: el `budget` entrante ahora también escribe `estimatedValue` (se mantiene `metadata.budget` por compatibilidad).

**Resto verificado OK**: listado (cursor pagination, filtros server-side, scoped), kanban (PATCH `/api/leads/{id}/stage` con optimistic update y rollback), importación CSV/XLSX, analítica (`/api/leads/analytics`, caché Redis), conversión lead→cliente (`convertLeadToClient` crea Client, enlaza `clientId` y registra activity — verificado en `modules/leads/actions/index.ts:~440`).

### 2.3 Clientes — OK

- Listado: GET `/api/clients`, scoped, búsqueda/filtros reales.
- Client 360: 8 cargas paralelas (KPIs, invoices, sales, payments, riesgo, rentabilidad, timeline) — todo Prisma/SQL real, sin mocks.
- Los 4 endpoints que el subagente no pudo verificar **los verifiqué yo: existen los 4** — `/api/quotes/[id]/pdf`, `/api/purchase-orders/[id]/pdf`, `/api/purchase-orders/[id]/generate-doc`, `/api/workspace/members`.
- Card "Tareas y reuniones": trazado completo — `ClientTasksCard` → `NewTaskModal` con `defaultEntityType="CLIENT"` → POST `/api/tasks` → `mapEntityToTaskFields` escribe `clientId` + `sourceModule/sourceId` → aparece en el módulo Tareas (GET `/api/tasks?entityType=CLIENT&entityId=` soportado, `tasks/route.ts:42–43`).
- Flujo presupuesto → tracking → firma: cableado real (ver 2.6 portal).

### 2.4 Proveedores — OK (1 nota)

- CRUD, detalle, tareas (`ProviderTask`), órdenes (`ProviderOrder`), import y ficheros: endpoints reales, scoped.
- **Nota (no tocado)**: el número de pedido a proveedor se genera con sufijo aleatorio — `PRO-YYYYMM-` + `Math.floor(1000 + Math.random()*9000)` (`app/dashboard/providers/actions.ts:2519–2523`). No es dato falso (es un identificador), pero hay riesgo teórico de colisión. Candidato a contador secuencial post-lanzamiento.

### 2.5 Tareas y Proyectos — OK

- CRUD completo; completar tarea invalida Redis: `invalidateCachedData('dashboard-v6-${userId}')` en `app/api/tasks/[id]/complete/route.ts:49` — verificado.
- Reuniones `type=MEETING` con `meetingUrl/meetingType/meetingNotes`; la vista `/meeting/[taskId]` llama a `/api/meeting/[taskId]/save-notes` — **el subagente afirmó que ese endpoint no existía; existe** (`app/api/meeting/[taskId]/save-notes/route.ts`). Falso positivo corregido en este informe.
- Multi-asignados vía `TaskAssignee` relacional; vinculación LEAD/CLIENT/PROVIDER/SALE vía `sourceModule`+`sourceId`+columnas directas.
- Proyectos: modelo Prisma real, CRUD persistente, relación a cliente, gateado PRO (decisión de producto, intacta).
- `autoCreateTaskOnRisk`: sí está en schema (`prisma/schema.prisma:1700`) y en actions — el reporte previo de "no persistido" no se confirma.

### 2.6 Facturación — corregido (zona Verifactu intacta)

**Albarán → factura con taxRate real** — el cable estaba bien al final y roto al principio:
- La conversión (`app/api/delivery-notes/[id]/convert-invoice/route.ts:74`) ya usaba `taxPercent: item.taxRate ?? 21` y pasa por `invoiceService.createInvoice` (DRAFT, serie INV, sin Verifactu hasta emitir). El motor (`invoice.engine.ts:calculateTotals`) calcula IVA por línea correctamente.
- **El bug real estaba aguas arriba**: el modal "Nuevo albarán" (`NewDeliveryNoteModal.tsx`) no capturaba ni precio ni IVA, y al precargar desde presupuesto **descartaba `unitPrice` y `taxRate` de cada línea** → todo albarán acababa con taxRate 21 por defecto y la factura salía al 21% aunque el presupuesto fuera al 10%.
- Fixes en `app/dashboard/finance/components/NewDeliveryNoteModal.tsx`:
  - Columnas nuevas "Precio €" e "IVA %" (selector 21/10/4/0) por línea.
  - La precarga desde presupuesto arrastra `unitPrice` y `taxRate` reales de cada línea.
  - El guardado descarta líneas vacías, normaliza cantidad (el API exige `quantity > 0` y antes fallaba en silencio) y muestra el error del servidor con toast.
- Fix en `app/api/delivery-notes/route.ts`: el checkbox "Entregado" del modal **se ignoraba** (el servidor forzaba `delivered: true`); ahora el schema acepta `delivered` y lo persiste (líneas 15, 90, 108).
- Con esto: una línea al 10% en presupuesto → albarán al 10% → factura al 10%. (Prueba en navegador pendiente de ti, ver sección 5.)

**Flujo canónico de documentos** (verificado): `GenerateDocumentsModal` → `/api/quotes/[id]/generate-documents` y `/api/purchase-orders/[id]/generate-doc` — ambos usan serie "INV", `taxRate` por línea y `invoiceService.createInvoice` (correctos).

**Facturas**: listado/detalle/emitir/cancelar/rectificativas reales; PDF vía jsPDF con import dinámico; numeración ver sección 3.

**Portal de cliente** (`app/doc/[token]` + `/api/doc/[token]`):
- Aceptar/rechazar/firmar: POST con `ALLOWED_ACTIONS = ["accept","reject","download"]`, firma con nombre + checkbox, persiste decisión. Pixel: `/api/doc/[token]/pixel` + tracking endpoints — existen.
- **Fix móvil**: el panel de firma era una columna fija de 272px junto al PDF → en pantallas <720px el PDF quedaba inutilizable y la firma poco accesible. Añadida media query que apila PDF y panel verticalmente (`app/doc/[token]/page.tsx`, clases `docp-main`/`docp-panel` + bloque `<style>`).

### 2.7 Informes — ACTIVADO (reconstruido)

**El subagente afirmó que el módulo estaba "completamente implementado y funcional, solo falta quitar el badge". Era falso.** Verificado línea a línea, `ReportingView.tsx` contenía: 6 "informes guardados" inventados con autores y horas falsos, heatmap de cohortes hardcodeado, KPI "Beneficio neto" = ingresos×0.32, "Nuevos clientes" = ventas×0.4, "Tasa conversión" = 18+x, "NPS = 72" literal, embudo con cifras fijas (840/612/310/148/96), línea "Plan" sintética con multiplicadores inventados, "Última sincronización hace 2 min" falso, y 6+ botones muertos (Exportar PDF, Programar envío, Nuevo informe, CSV×2, Personal.).

Reconstruido con alcance acotado:
- **`modules/reporting/actions/getReportsOverview.ts` (nuevo)**: server action con agregados 100% reales scoped por userId — ingresos (misma definición que el dashboard: `Invoice PAID/CUSTOMER` por `paidAt`, para que dashboard e informes cuadren siempre), facturas emitidas/pagadas/vencidas + pendiente de cobro, leads creados/convertidos/conversión, clientes nuevos/totales, proveedores activos/totales, serie mensual 12 meses (SQL `DATE_TRUNC`, idéntico al del dashboard) y top 5 clientes por ingresos (groupBy + nombres scoped).
- **`modules/reporting/components/ReportingView.tsx` (reescrito)**: KPIs con deltas reales vs periodo anterior (y "sin periodo anterior" honesto cuando no hay base), gráfica SVG de ingresos 12 meses, card Facturación, top clientes, cartera, leads/conversión. **Estados vacíos honestos** en cada card.
- **Exportación**: reutiliza la infraestructura existente del dashboard — botones Excel y PDF llaman a `/api/dashboard/export?format=…&period=…` con el periodo activo.
- Selector de periodo 7d/30d/MTD/QTD/YTD (mismos presets que el dashboard) que re-consulta.
- Badge "Próximamente" quitado del sidebar (`Sidebar.tsx:115`). Email Marketing, Automatizaciones y Asistente IA siguen `comingSoon` sin tocar.
- Limpieza: borrados los componentes muertos del módulo (ReportingChart/Breakdown/Forecast/YoY/Insight/KPIs/PeriodPicker, `getReportingData.ts`, `utils.ts`, `types.ts` — basados en el modelo `Sale`, que habría descuadrado los ingresos respecto al dashboard). `app/dashboard/reporting/page.tsx` simplificado.
- **`/dashboard/analytics` (página legacy)**: renderizaba widgets vacíos sin backend y arrastraba un `mock.ts` con `Math.random()` para revenue. Convertida en redirect a `/dashboard/reporting`; borrados sus 18 componentes huérfanos + mock. (El `AnimatedCard` que ai-assistant reutilizaba se recolocó en `app/dashboard/ai-assistant/components/AnimatedCard.tsx` con imports actualizados — ai-assistant sigue diferido, solo se evitó romper su compilación.)

**No fabricado** (sin fuente de datos real hoy → candidatos post-lanzamiento, sección 6): informes guardados/plantillas, envíos programados, cohortes de retención, NPS, beneficio neto (requiere gastos imputados), plan vs real.

### 2.8 Equipo — OK

Verificado de punta a punta en código:
- Aceptar invitación: transacción que crea `WorkspaceMember` (status default `ACTIVE`, schema:3109) + borra invite + **`onboardingCompleted: true`** (`app/api/settings/team/invite/accept/route.ts:79–95`).
- `app/dashboard/layout.tsx:38–50`: si onboarding incompleto pero hay membership ACTIVE → entra al dashboard. Sin membership y sin Stripe → `/plan`. **Un invitado no acaba bloqueado en /precios.**
- `callbackUrl`: `/invite/[token]` sin sesión → `/login?callbackUrl=/invite/<token>`; `Login.tsx:29,54` y `Register.tsx:41–90` lo respetan (con `safeCallbackUrl` sanitizado) y Register lo arrastra a través de `/verify`.
- Roles: persisten en `workspace.settings.rolePermissions`; el endpoint exige OWNER/ADMIN (`role-permissions/route.ts:58`). Listado y eliminación de miembros: endpoints existen.

### 2.9 Ajustes — OK (1 mock eliminado)

- **Card "Indicadores"**: confirmado eliminada — grep de "Indicadores" en settings devuelve 0 resultados.
- Perfil fiscal: recoge NIF, dirección, ciudad, CP, país (necesario para Verifactu). Sección `verifactu` registrada en el mapa de secciones.
- Suscripción: `PlansSection` lee el plan real de `/api/settings/profile` (BD actualizada por el webhook de Stripe) y `BillingHistory` lee `/api/stripe/invoices`. **Eliminado** `settings/components/Billing.tsx`: componente huérfano con array `PLANS` hardcodeado y `current: true` falso — no estaba registrado en el mapa de secciones ni importado por nadie (verificado), pero violaba la regla de cero mock.
- Import/export, zona de peligro (desactivar/eliminar/descargar datos/cerrar sesiones) y 2FA: endpoints existen y cableados.

### 2.10 Listados e integridad cruzada — OK

- Leads: dashboard pipeline y kanban leen la misma tabla `Lead` scoped por userId (groupBy `leadStatus` vs findMany por stage) → cuadran.
- Ingresos: dashboard, export e Informes usan la misma definición (`PAID`+`CUSTOMER`+`paidAt`) → cuadran por construcción.
- Facturas: listado `/api/invoicing` scoped por userId.
- Paginación/filtros/búsqueda server-side verificados en leads (cursor), clientes e invoices.

---

## 3. ⚠️ VERIFACTU / AEAT — PARA REVISIÓN DEL FOUNDER + GESTOR — NO modificado por mí

Todo lo de esta sección está **diagnosticado y dejado intacto**, como pediste. Verifiqué personalmente cada afirmación contra los archivos.

### 3.1 Dónde se llama a Verifactu (lib/verifactu.ts) — 6 puntos de entrada

1. `modules/invoicing/services/invoice.service.ts:413+` — **issueInvoice (canónico, correcto)**: envía SOLO al emitir, awaited con try/catch.
2. `app/api/quotes/[id]/convert-invoice/route.ts` — **VIOLACIÓN** (ver 3.3).
3. `app/api/purchase-orders/[id]/convert-invoice/route.ts` — **VIOLACIÓN** (ver 3.3).
4. `app/api/invoicing/[id]/cancel/route.ts:27` — anulación (`cancelVerifactuInvoice`), fire-and-forget.
5. `app/api/invoicing/[id]/verifactu-status/route.ts` — polling de estado.
6. `app/api/settings/verifactu/activate/route.ts:54` — alta de NIF.

### 3.2 Numeración

- **Emisión canónica**: número asignado SOLO al emitir, vía `consumeNextNumber` (transaccional, `invoice.repository.ts:424–444`) → sin duplicados por concurrencia. DRAFT usa placeholder "BORRADOR". ✅
- **Formato**: `formatIssuedInvoiceNumber` produce `YYYY-NNNN` (p. ej. `2026-0001`) e **ignora el prefijo de la serie** (`invoice.engine.ts:85–87`, parámetro `_series` descartado). La serie interna es "INV" pero el número visible NO lleva "INV-". Si tu gestor espera literalmente `INV-2026-001`, hay que decidir si el formato actual es el deseado. **Decisión tuya.**
- **Huecos posibles** (sin modificar): (a) cancelar una factura SENT deja su número huérfano (`cancelInvoice` permite cancelar SENT); (b) si Verifactu falla tras asignar número, la factura queda numerada y SENT sin registro AEAT. La numeración en sí no genera huecos (el contador nunca retrocede ni reusa), pero la serie emitida puede contener números cuya factura está CANCELED — consúltalo con el gestor (las anulaciones via rectificativa R están soportadas: `createRectification`, R1–R5 con lógica F2→R5).

### 3.3 🔴 CRÍTICO: dos rutas API legacy violan las tres reglas a la vez

`app/api/quotes/[id]/convert-invoice/route.ts` y `app/api/purchase-orders/[id]/convert-invoice/route.ts`:

- Crean la factura en **DRAFT** y la envían a Verifactu **inmediatamente** (fire-and-forget, sin await) → **firma en borrador**, prohibido por tu propia regla.
- Usan **series paralelas**: `FAC-YYYY-NNN` (quotes, líneas 8–18) y `F-YYYY-NNN` (purchase-orders, líneas 8–17) → rompe la serie unificada.
- Numeración **no transaccional** (findFirst por createdAt + incremento en memoria) → condición de carrera con duplicados posibles.
- El payload a Verifactu lleva **`tipo_impositivo: "21.00"` hardcodeado** sobre la base total — si el documento tenía líneas al 10%, **se declara mal el IVA a la AEAT**.

**Atenuante verificado**: ninguna UI llama a estas rutas (grep exhaustivo: cero referencias desde componentes). Son endpoints huérfanos pero **accesibles para cualquier usuario autenticado vía HTTP directo**. El flujo que la UI usa de verdad (`generate-documents` / `generate-doc` / `delivery-notes/convert-invoice`) es el correcto (serie INV, DRAFT sin Verifactu, taxRate por línea).

**Recomendación (no aplicada)**: eliminar ambos archivos o devolver 410 Gone antes del lanzamiento. Es un cambio de 2 archivos; lo dejé intacto por tu regla cardinal 4.

### 3.4 Envío a la AEAT — estado real (lo que el founder preguntó)

- **No existe botón de envío manual** a la AEAT, y según git no se eliminó recientemente nada parecido: el envío es **automático al emitir** (`issueInvoice`) cuando `verifactuEnabled` + API key de Verifacti.
- Lo que SÍ existe en la UI: badge de estado en el listado — "Pendiente AEAT / Verificada AEAT / Rechazada AEAT" (`modules/invoicing/components/InvoiceRow.tsx:16–29`, solo facturas CUSTOMER) y botón "Ver factura verificada" que abre `verifactuUrl` (QR AEAT). El estado se refresca por polling vía `/api/invoicing/[id]/verifactu-status` (API Verifacti real).
- **Hueco funcional**: si Verifacti falla al emitir, la factura queda SENT sin `verifactuUuid` y **no hay reintento ni endpoint de reenvío** — la factura queda emitida y sin registrar salvo intervención manual en BD. Los campos del schema (`verifactuUuid/Status/Qr/Huella/Url/SentAt`, schema:2026–2037) se rellenan correctamente cuando el envío funciona.
- **Recomendación (no aplicada)**: añadir acción "Reintentar envío a Verifactu" para facturas SENT sin uuid, o cola con reintentos. Decisión founder + gestor.

### 3.5 Tipos F1/F2/R1–R5

Default F1; F2 (simplificada) selectable; rectificativas: original F2 → R5, resto R1 por defecto (`invoice.service.ts:644–645`); F2/R5 omiten NIF del receptor en el payload (correcto para simplificadas).

---

## 4. Decisiones que quedan en tu mano (no son bugs, no las toqué)

- **P1 — `/dashboard/connect` gateado por `calendarSync`** (`connect/page.tsx:789`): en STARTER el botón "Conectar" de Leads muestra UpgradeWall. Si el hub de integraciones debe ser accesible en el plan de lanzamiento, cambia la feature key del gate en ese archivo (y/o `plan-gates.ts`). No lo cambié por ser decisión de producto/pricing.
- **P2 — Rutas convert-invoice legacy** (sección 3.3): recomendación de eliminarlas, pendiente de tu OK.
- **P3 — Formato del número de factura** `2026-0001` vs `INV-2026-001` (sección 3.2): confírmalo con el gestor.
- **P4 — Números de pedido a proveedor aleatorios** (sección 2.4): contador secuencial como mejora.

---

## 5. Acciones manuales pendientes del founder

1. **NO hay cambios de schema Prisma** — no necesitas `db push` ni `prisma generate` por esta pasada. (Todos los campos usados ya existían.)
2. **En tu Mac**: `npx tsc --noEmit` y `npm run build` — el sandbox de esta sesión tiene un límite de 45 s por proceso y el typecheck completo del repo no cabe (ver sección 7). Todos los archivos tocados pasaron un chequeo sintáctico con esbuild, pero el typecheck completo del proyecto debes ejecutarlo tú. Reinicia el dev server tras el pull de estos cambios.
3. **Pruebas de navegador que solo tú puedes hacer**:
   - Crear presupuesto con una línea al 10% → albarán desde presupuesto (verifica que la línea trae 10%) → convertir a factura → comprobar IVA 10% en el PDF.
   - Abrir `/dashboard/reporting` con tu cuenta real y validar que los KPIs cuadran con el dashboard.
   - Pulsar "Conectar" en Leads con tu plan actual (si ves UpgradeWall → decisión P1).
   - Portal `/doc/<token>` desde un móvil real (firma apilada bajo el PDF).
   - Flujo de invitación con un email nuevo de prueba.
4. **Revisión con el gestor**: toda la sección 3 (Verifactu), en particular 3.3 y el formato de numeración.
5. **Vault de Obsidian**: no era accesible desde esta sesión (solo estaba montada la carpeta del repo). Pendiente de registrar: log de sesión 2026-06-10, problema ABIERTO "rutas convert-invoice legacy Verifactu" (severidad alta, area facturación) y actualización de la nota de Informes en 02-Features.

## 6. Diferido intencionadamente (no tocado, por diseño)

- Email Marketing, Automatizaciones, Asistente IA: siguen `comingSoon` y deshabilitados en el sidebar. El código interno de ai-assistant contiene `Math.random()` en helpers — irrelevante mientras esté diferido, pero límpialo antes de activarlo algún día.
- Multi-workspace / `workspaceId`: no añadido, como ordenado.
- Stripe (webhook, env, secret): intacto.
- Lógica Verifactu (firma, hash, numeración, envío): intacta — solo auditada.
- Informes avanzados sin fuente de datos (cohortes, NPS, beneficio neto, plan vs real, informes guardados/programados): no fabricados; candidatos post-lanzamiento.

## 7. Honestidad — qué NO pude verificar

- **`npx tsc --noEmit` y `npm run build` completos**: el sandbox mata cualquier proceso a los 45 s y el typecheck del repo entero tarda más. Mitigación aplicada: chequeo sintáctico esbuild (Linux) de los 20 archivos modificados → 0 errores; revisión manual de tipos en cada edit; verificación por grep de que ningún archivo borrado tiene importadores. Riesgo residual de error de tipos: bajo, pero existe — por eso es la acción manual nº 2.
- **Ninguna prueba de ejecución en navegador/BD real**: todo lo afirmado es trazado estático de código (botón → handler → endpoint → query). Los flujos con efectos (emails Resend, webhooks, pixel) no se dispararon.
- **Subagentes**: dos falsos positivos detectados y corregidos por verificación directa — (1) "Informes está completamente implementado, solo quitar badge" (era mayormente mock), (2) "/api/meeting/[taskId] sin implementación" (existe). También un diagnóstico invertido en el bug de "Conectar" (el agente no detectó que /dashboard/integrations era mock). Todos los hallazgos de este informe que importan fueron verificados por mí contra los archivos, con rutas y líneas citadas.
- El **rendimiento real** del nuevo `getReportsOverview` (17 queries en Promise.all) no se midió; son counts/aggregates indexados por userId y no es endpoint de polling, pero si lo ves lento cabe añadir caché Redis con TTL 60 s como en el dashboard.

## 8. Inventario de archivos tocados

**Modificados (13)**: `app/dashboard/components/Sidebar.tsx` (items Informes/Integraciones) · `components/layout/DashboardHeader.tsx` (+1 título) · `app/dashboard/leads/[id]/page.tsx` · `modules/leads/components/LeadPanel.tsx` · `src/domains/leads/components/LeadInfoCard.tsx` · `modules/leads/components/CreateLeadManualDialog.tsx` · `modules/leads/actions/index.ts` · `app/api/leads/route.ts` · `app/api/leads/[id]/route.ts` · `app/dashboard/finance/components/NewDeliveryNoteModal.tsx` · `app/api/delivery-notes/route.ts` · `app/doc/[token]/page.tsx` · `app/dashboard/ai-assistant/components/{AssistantChat,ActionRecommendations}.tsx` (import AnimatedCard).

**Reescritos (4)**: `app/dashboard/integrations/page.tsx` (→redirect) · `app/dashboard/analytics/page.tsx` (→redirect) · `modules/reporting/components/ReportingView.tsx` · `app/dashboard/reporting/page.tsx`.

**Nuevos (3)**: `modules/reporting/actions/getReportsOverview.ts` · `modules/reporting/actions/index.ts` (reescrito) · `app/dashboard/ai-assistant/components/AnimatedCard.tsx` (reubicado desde analytics).

**Eliminados (~35 archivos, todos verificados sin importadores)**: `app/dashboard/integrations/{mock.ts,loading.tsx,components/*,hooks/*}` · `app/dashboard/analytics/{mock.ts,lib/*,components/*}` · `app/dashboard/settings/components/{Integrations,Billing}.tsx` · `components/layout/{Sidebar,DashboardWrapper}.tsx` (legacy sin uso) · `modules/reporting/{types.ts,utils.ts,actions/getReportingData.ts,components/Reporting{Chart,Breakdown,Forecast,YoY,Insight,KPIs,PeriodPicker}.tsx}`.

**Sin commit ni push** — todo queda en el working tree para tu revisión.
