# BLINDAJE.md — Auditoría y blindaje del MVP

**Fecha:** 10 de junio de 2026 · **Launch:** 23 de junio de 2026
**Alcance:** 110 páginas · 340 API routes · auditoría completa por módulos + arreglos quirúrgicos

---

## 1. Resumen ejecutivo

**Estado: APTO PARA LANZAR, con la lista de verificación manual de la sección 5 completada antes del 23.**

La base del producto es sólida: las 340 rutas API tienen `maxDuration`, cero `console.log` en `/api`, validación Zod generalizada, rate limiting global, crons protegidos por secret, y **todas las queries Prisma están scoped por `userId`** (verificado ruta a ruta; ver nota en §3.6). Los flujos críticos (factura: borrador→emisión→PDF→Verifactu; presupuesto: enviar→aceptar/rechazar→generar PO+albarán+factura; lead→cliente) están completos y funcionan con datos reales.

El problema más grave encontrado **no era de seguridad sino de honestidad de datos**: varias vistas (Finanzas-resumen, Leads, Clientes, Proveedores, Tareas, Equipo) conservaban capas de "datos de diseño" — KPIs con deltas inventados (+22,4% vs Abr), sparklines pseudo-aleatorias, facturas vencidas ficticias de clientes inexistentes ("Hotel Pinsapo S.L."), hashes Verifactu falsos y contadores fabricados (142 envíos AEAT). Una cuenta nueva habría visto datos de otra empresa inventada. **Todo eso se ha eliminado**: ahora cada cifra sale de Prisma o se muestra un estado vacío honesto.

---

## 2. Bugs encontrados y arreglados

| # | Módulo | Bug | Fix | Fichero |
|---|--------|-----|-----|---------|
| 1 | Finanzas (resumen) | Pestaña "Resumen" llena de datos fabricados: 142 envíos AEAT falsos, banner "Cero rechazos" inventado, contadores de estado `\|\| 96/28/7/11`, aging simulado (58%/30%/8%/4% con "22 fact."), "Próximos vencimientos" y "Vencidas" con facturas y clientes ficticios, top-clientes con tendencias pRnd y fallback inventado, plazos fiscales con días restantes congelados | Reescrito sobre datos reales: KPIs con deltas reales del servidor (`trends.incomeGrowth/...`), aging desde `/api/invoicing/aging` (servicio SQL real), vencimientos/vencidas calculados de `/api/billing` (facturas reales, click → detalle), top clientes sin columna falsa, calendario fiscal AEAT con días calculados en vivo, estados vacíos honestos | `app/dashboard/finance/FinanceView.tsx` |
| 2 | Finanzas (tabs) | Las pestañas Facturas/Presupuestos/Albaranes/Pedidos/Gastos/Productos/Impuestos/Verifactu/Configuración del FinanceView eran **maquetas con tablas de datos falsos** que se mostraban cuando el array real venía vacío (cuenta nueva = facturas inventadas), mientras las páginas reales y funcionales existían en `/dashboard/finance/*` sin enlazar | Maquetas eliminadas; `?tab=` legado redirige a la página real (`invoicing`, `presupuestos`, `albaranes`, `pedidos`, `gastos`, `productos`, `trimestral`, `settings?section=verifactu`, `configuracion`). Sidebar actualizado para enlazar directo a las páginas reales | `FinanceView.tsx`, `Sidebar.tsx` |
| 3 | Finanzas (header) | Selector 7d/30d/MTD/QTD/YTD solo cambiaba estado local (no refrescaba datos); botones "Exportar libro" y "Nueva factura" muertos | Selector wired a `?period=` (server-side ya lo soportaba); "Exportar libro" → CSV real `/api/finance/export?period=`; "Nueva factura" → `/dashboard/finance/invoicing` | `FinanceView.tsx` |
| 4 | Leads | KPIs con sparklines pseudo-aleatorias (pRnd) y deltas inventados (+24,3% "vs Abr"); conversión del funnel hardcodeada a 68%; subtítulo "Ø 4,8/día · +18%" falso; selector 30d/90d/YTD decorativo; "Exportar CSV", "Atribución", "Ver todos", "Detalle por etapa" muertos; "auto-priorizados por IA" y emoji ✨ (prohibido) | KPIs solo con valores reales; conversión por etapa calculada de los conteos reales; media diaria calculada de `dailyData`; selector muerto eliminado; "Exportar CSV" wired a `/api/settings/export/leads` (real, scoped); enlaces muertos eliminados; emoji → icono Lucide `Flame`; subtítulo honesto | `app/dashboard/leads/components/LeadsPageView.tsx` |
| 5 | Leads (ficha) | Card "Recomendaciones IA" con botones muertos ("Hacer esto →") y claims inventados ("3x más conversión"); feature IA fuera del MVP | Eliminada de la ficha del lead (componente intacto en `src/domains` por si se retoma) | `modules/leads/components/LeadPanel.tsx` |
| 6 | Clientes | KPIs con deltas falsos ("+15 vs Abr"); donut de "Sector" 100% fabricado con pRnd (los clientes no tienen campo sector); chips "Con MRR"/"Nuevos < 90d" con conteos inventados (total×0,27 / ×0,09) pese a que el filtro real existía; "actualizado hace 4 min" falso; selector 30d/90d/YTD muerto; "Exportar CSV" y links "Detalle" muertos | KPIs valores-solo; donut sustituido por "Distribución por valor" (facturación real por cliente); chips con conteos reales del dataset; subtítulos honestos; export wired a `/api/settings/export/clients` | `modules/clients/components/ClientsView.tsx` |
| 7 | Proveedores | "Vencimiento de pagos" era una simulación (×0,18 / ×0,15…) con botón "Pagar todo" muerto y "Próximo lote: 02 jun" hardcodeado; "IVA soportado Q2" estimado como gasto×3×0,21; deltas falsos; fecha "Próxima" de contratos generada con pRnd; tendencia falsa en top proveedores; selector de período y "Importar gastos" muertos | Card simulada eliminada; KPIs ahora: gasto mensual, activos, contratos recurrentes y gasto recurrente (todos reales); columna "Próxima" eliminada; delta falso fuera; export wired a `/api/settings/export/providers`; muertos eliminados | `modules/providers/components/ProvidersView.tsx` |
| 8 | Tareas | KPIs con deltas falsos (+12,5%, −33,3% "vs sem ant.") y sparklines hardcodeadas `[82,84,85…]`; botón "Automatizar" muerto (feature fuera de MVP); links "Equipo"/"Agenda"/"Todos los proyectos" muertos | KPIs valores-solo (abiertas, vencen 7d, vencidas, ratio cierre — todos reales); botón y links muertos eliminados | `modules/tasks/dashboard/TasksView.tsx` |
| 9 | Equipo | KPIs completamente inventados ("1.284 acciones", "62% carga", "734h", "+18%"), claims falsos ("3 invitaciones pendientes", "Plan Business · 8/10 puestos"), 3 botones muertos, heatmap pRnd en código muerto | Página reducida a header honesto + componente real `TeamMembers` (datos e invitaciones reales) | `app/dashboard/team/page.tsx` |
| 10 | Albaranes | Serie inconsistente: conversión pedido→albarán generaba `A-YYYY-NNN` mientras el resto del sistema usa `ALB-YYYY-NNN` (dos secuencias paralelas → numeración incoherente) | Unificado a `ALB-` | `app/api/purchase-orders/[id]/convert-delivery/route.ts` |
| 11 | Rendimiento | Autosave de notas de reunión cada 5s (incumple regla de polling ≥30s que causó la suspensión en Vercel) | 30.000 ms; `beforeunload` ya cubría la salida | `app/meeting/[taskId]/MeetingView.tsx` |
| 12 | Navegación | Items fuera de MVP visibles y activos en el sidebar: Email Marketing, Automatizaciones, Informes, Asistente IA, Integraciones | Renderizados deshabilitados con badge **"Próximamente"** (opacity 0.45, not-allowed) — reversible quitando `comingSoon: true` | `app/dashboard/components/Sidebar.tsx` |

**Verificación:** typecheck (tsc) de los 10 ficheros modificados y su grafo de imports → **0 errores**; eslint → 0 errores (solo warnings preexistentes). Los `$queryRawUnsafe` existentes usan placeholders parametrizados con `userId` (seguros, verificados).

---

## 3. NO arreglado — requiere decisión humana

| # | Severidad | Tema | Detalle | Por qué no se tocó |
|---|-----------|------|---------|--------------------|
| 3.1 | **ALTA** | Webhook Stripe duplicado | `/api/webhooks/stripe` verifica la firma pero **no procesa ningún evento** (TODO vacío, devuelve 200). El webhook real es `/api/stripe/webhook`. Si en el dashboard de Stripe está configurada la URL equivocada, los pagos se cobrarán pero las suscripciones no se actualizarán en BD, **silenciosamente** | Es config externa: hay que comprobar en Stripe qué URL está dada de alta (ver §5). Borrar la ruta sin saberlo podría romper la configuración actual |
| 3.2 | **ALTA** | IVA 21% hardcodeado en albarán→factura | `delivery-notes/[id]/convert-invoice` aplica 21% fijo por línea. `DeliveryNoteItem` **no tiene campo `taxRate`** — arreglarlo de verdad requiere migración de schema (prohibida por las reglas). Clientes con productos al 10%/4%/exento generarían facturas fiscalmente incorrectas por esta vía | Requiere migración (`ALTER TABLE delivery_note_items ADD COLUMN "taxRate" DOUBLE PRECISION DEFAULT 21`) o leer el taxRate del Quote vinculado. Documentado, no improvisado |
| 3.3 | **ALTA** | Verifactu se dispara con la factura aún en DRAFT en esa misma conversión | En albarán→factura se crea la factura como `DRAFT` con número definitivo y se envía a Verifactu inmediatamente; el flujo canónico (CLAUDE.md) firma al **emitir** (`issueInvoice`). Además usa serie `F-` mientras el servicio principal usa otra numeración | Cambiar el momento de firma fiscal es decisión de negocio/legal, no un fix seguro de última hora |
| 3.4 | MEDIA | Gastos nacen en estado `SENT` | Las facturas recibidas se crean directamente como SENT sin paso de borrador/edición | Decisión de producto razonable para facturas recibidas; cambiarla altera el flujo |
| 3.5 | MEDIA | Fórmula de tasa de conversión de leads | `convertidos / (convertidos + activos)` mezcla cohortes (convertidos del mes vs activos totales). Es consistente en frontend y backend, pero discutible | Cambiar la métrica de negocio a 13 días del launch no es quirúrgico; decidir definición y cambiarla en ambos sitios a la vez |
| 3.6 | BAJA | Patrón check-then-act en 8 rutas `[id]` | `tasks/[id]`, `sales/[id]`, `campaigns/[id]`, `email/templates/[id]`, `custom-fields/[fieldId]`, `finance/budgets/[id]`, `finance/goals/[id]`, `reminders/[id]`: validan ownership con `findFirst({id, userId})` (→404 si no es tuyo) y luego hacen `update({where:{id}})`. **No explotable** (la validación es en la misma request), pero como endurecimiento se puede pasar a `updateMany({where:{id, userId}})` | Cambiarlo altera el shape de las respuestas (updateMany no devuelve el registro); riesgo > beneficio ahora |
| 3.7 | BAJA | `npm run build` completo pendiente | El sandbox de esta auditoría limita cada proceso a ~45 s; el typecheck dirigido de todo lo modificado pasó con 0 errores, pero ejecuta `npx tsc --noEmit && npm run build` en local para la pasada final | Limitación del entorno, no del código |
| 3.8 | BAJA | Páginas finance secundarias | `informes` ya muestra "Próximamente" (correcto). `banco`, `rectificativas`, `trimestres` (vs `trimestral`), `income`, `purchases` existen pero no están enlazadas desde el sidebar — accesibles solo por URL directa | No enlazadas = no rompen nada; revisar tras el launch |

---

## 4. Features ocultadas con "Próximamente"

| Feature | Dónde | Mecanismo |
|---------|-------|-----------|
| Email Marketing | Sidebar → Inteligencia | Item deshabilitado + badge "Próximamente" (la página además conserva su UpgradeWall) |
| Automatizaciones | Sidebar → Inteligencia | Ídem (gating `can("automations")` intacto en la página) |
| Informes (Reporting) | Sidebar → Inteligencia | Ídem |
| Asistente IA | Sidebar → Inteligencia | Ídem (antes era un link activo a una página con datos demo) |
| Integraciones | Sidebar → Sistema | Ídem |
| Recomendaciones IA en ficha de lead | `/dashboard/leads/[id]` | Card retirada del panel |
| Multi-workspace | Workspace switcher del sidebar | **Ya estaba correcto**: "+ Añadir workspace · Próximamente" deshabilitado |
| Heatmap de actividad de equipo | `/dashboard/team` | Ya estaba comentado; código muerto eliminado |

Nota: las páginas ocultas siguen accesibles por URL directa pero todas tienen gate de plan (UpgradeWall) o no exponen datos falsos críticos. `dashboard/analytics`, `connect` y `notifications` ya estaban fuera del menú con gating correcto.

---

## 5. Verificación manual recomendada antes del 23

**Stripe (crítico):**
1. En el dashboard de Stripe → Webhooks, confirmar que la URL configurada es **`/api/stripe/webhook`** (NO `/api/webhooks/stripe`, que acepta y descarta eventos). Hacer un pago de prueba en modo live con tarjeta real y verificar que el plan del usuario cambia en BD.
2. Probar: alta trial → expiración → downgrade; upgrade PRO→BUSINESS; portal de cliente de Stripe; añadir asiento de equipo. Verificar que precios en `/precios` coinciden con los Price IDs reales de Stripe (14,99 € / 29,99 €).

**Facturación legal (crítico):**
3. Emitir una factura real con perfil fiscal completo y revisar el PDF con tu gestor: numeración correlativa, NIF, desglose IVA/IRPF, serie. Verificar el envío Verifactu real (QR + huella) contra el entorno de producción de Verifacti/AEAT.
4. Probar una conversión albarán→factura con productos a IVA reducido y confirmar el impacto del 21% hardcodeado (§3.2) — si vendes solo servicios al 21%, no te afecta para el launch.
5. Generar los modelos 303/130 desde `/dashboard/finance/trimestral` y contrastar cifras con la gestoría.

**Emails (crítico):**
6. Verificar dominio en Resend (SPF/DKIM) y que llegan de verdad: verificación de cuenta, invitación de equipo, recordatorio de factura, recordatorio de documento, aceptación de presupuesto. Revisar carpeta de spam.

**Flujo completo de cuenta nueva:**
7. Registro desde cero → verificación → onboarding → sector → dashboard. Confirmar que **todos** los KPIs/gráficos muestran estados vacíos correctos (tras este blindaje deberían — cualquier cifra distinta de 0/— en una cuenta virgen es un bug).
8. Crear lead → moverlo en kanban → convertir a cliente → presupuesto → enviar al portal (`/doc/[token]`) → aceptar con firma → generar pedido+albarán+factura → emitir → cobrar. Es el happy path completo del MVP.

**Portal de cliente:**
9. Abrir un presupuesto desde el link público en móvil, aceptar/rechazar/firmar, y comprobar el tracking (visto/abierto) y el pixel.

**Varios:**
10. `npx tsc --noEmit` y `npm run build` en local (§3.7), y pasada de las rutas principales con la consola del navegador abierta.
11. Auditoría de seguridad pre-launch ya planificada en CLAUDE.md (`semgrep` + `gitleaks` + `npm audit`) — sigue pendiente de fecha antes del 23.
12. RGPD: probar exportación de datos (`/api/settings/export/all`) y borrado de cuenta con un usuario de prueba.

---

*Auditoría realizada de forma autónoma. Sin commits, sin migraciones, sin librerías nuevas, sin tocar datos. Todos los cambios son reversibles vía `git diff`/`git checkout` manual por el propietario.*
