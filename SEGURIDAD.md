# SEGURIDAD.md — Auditoría de seguridad pre-lanzamiento

**Fecha:** 10 de junio de 2026 · **Lanzamiento previsto:** 23 de junio de 2026
**Método:** inspección de código + grep sistemático + `npm audit`. No había `semgrep` ni `gitleaks` en el entorno → escaneo de secretos hecho por grep de patrones (sk_live/whsec/AKIA/BEGIN/password). Hallazgos de subagentes **verificados manualmente** uno a uno antes de asignar severidad.
**Alcance respetado:** solo lectura. No se modificó código, BBDD, ni se hizo commit/push.

---

## 1. Resumen ejecutivo

| Severidad | Nº |
|-----------|----|
| CRÍTICA   | 0  |
| ALTA      | 3  |
| MEDIA     | 6  |
| BAJA      | 5  |
| Dependencias (npm audit) | 1 high + 8 moderate |

**¿Hay algún CRÍTICO que bloquee el lanzamiento?** **No hay fuga de datos cross-tenant explotable** — el riesgo nº1 que se temía. Revisé las ~150 rutas API: todo acceso a recursos de negocio está scoped por `userId`, y los `$queryRawUnsafe` van parametrizados. El primer barrido automático marcó "16 IDOR CRÍTICOS", pero **son falsos positivos**: todos tienen `findFirst({id, userId})` con 404 previo, así que el `update/delete` nunca alcanza un recurso ajeno (ver §4).

**Sin embargo, NO recomiendo lanzar sin resolver los 3 hallazgos ALTA**, todos en autenticación: (A-01) el 2FA es decorativo — el middleware no lo exige; (A-02) el rate limiting es global y *fail-open*, sin protección dedicada contra fuerza bruta de contraseña/OTP; (A-03) login sin verificación de email + account-linking automático de Google. Ninguno es una brecha de datos por sí solo, pero juntos debilitan seriamente el acceso a las cuentas en un producto que maneja datos fiscales reales.

---

## 2. Tabla de hallazgos (ordenada por severidad)

| ID | Sev | Categoría | Fichero:línea | Descripción | Impacto | Fix propuesto (NO aplicado) |
|----|-----|-----------|---------------|-------------|---------|------------------------------|
| A-01 | **ALTA** | Auth / 2FA | `middleware.ts:147-155` + `lib/auth.ts:122-127` | El JWT pone `twoFactorVerified=false` al iniciar sesión, pero el middleware **nunca comprueba ese flag**. Solo se vuelve `true` si el usuario visita `/auth/2fa-verify`, y nada le obliga. | Un atacante con la contraseña de una cuenta con 2FA activado entra al dashboard **sin** introducir el segundo factor. El 2FA es puramente decorativo. | En el middleware, tras el `getToken`: si `token.twoFactorEnabled && !token.twoFactorVerified` y la ruta no es `/auth/2fa-verify`, redirigir a `/auth/2fa-verify`. |
| A-02 | **ALTA** | Rate limiting / fuerza bruta | `middleware.ts:20-69`; `app/api/auth/2fa/verify-session/route.ts`; `verify-code/route.ts`; `forgot-password/route.ts` | El único rate limit es global (60 req/min/IP) en el middleware, **condicional a que Upstash esté configurado y *fail-open*** si Redis falla (`return NextResponse.next()` en el catch, l.65). Los endpoints de login, verificación de OTP (6 dígitos), 2FA verify-session y forgot-password **no tienen límite dedicado por cuenta**. | Fuerza bruta de contraseñas y de códigos OTP/2FA (espacio de 10⁶) evadible rotando IP; si Upstash cae, no hay límite alguno. | Rate limit dedicado por email/usuario (p.ej. 5 intentos/15 min) en login, 2fa/verify-session, verify-code y forgot-password, con bloqueo temporal. Considerar fail-closed en endpoints de auth. |
| A-03 | **ALTA** | Auth / OAuth | `lib/auth.ts:27` (`allowDangerousEmailAccountLinking: true`) + `lib/auth.ts:40-66` (`authorize` sin check `emailVerified`) | Login con credenciales **no exige email verificado**, y Google tiene linking automático por email. Combinados: una cuenta de credenciales no verificada con el email X queda vinculada a quien luego entre con Google de X (y viceversa). | Vector de toma de cuenta / vinculación no consentida de identidades sobre el mismo email. | Exigir `user.emailVerified` en `authorize()` (login bloqueado hasta verificar); revisar si `allowDangerousEmailAccountLinking` es necesario — si no, quitarlo, o confirmar el linking explícitamente. |
| M-01 | MEDIA | Auth | `lib/auth.ts:48-66` | Registro+login sin verificación de email obligatoria (relacionado con A-03 pero con impacto propio). | Alta de cuentas con email de terceros que no se controla (la víctima no podrá registrarse luego; spam de verificación). Cuenta nueva = sin datos ajenos, por eso MEDIA. | Bloquear login hasta `emailVerified != null`. |
| M-02 | MEDIA | Stripe / idempotencia | `app/api/stripe/webhook/route.ts:30-272` | El webhook verifica la firma correctamente (`constructEvent`, l.22) pero **no deduplica por `event.id`**. Stripe reentrega eventos. | Reprocesado de eventos: posible doble alta de asiento, doble actualización de suscripción o emails duplicados. | Tabla `ProcessedWebhookEvent(eventId unique)`; al entrar, si el `event.id` ya existe, responder 200 sin reprocesar. |
| M-03 | MEDIA | XSS / inyección HTML | `lib/email-templates.ts` (p.ej. l.280, 316, 332, 357) | Nombre de usuario/cliente interpolado en el HTML del email sin escapar, pese a existir `lib/sanitize.ts`. | Un nombre tipo `<img src=x onerror=...>` inyecta HTML en los correos transaccionales (impacto limitado al cliente de correo del destinatario). | Escapar todas las interpolaciones dinámicas con `sanitizeHtml()` antes de meterlas en las plantillas. |
| M-04 | MEDIA | Tokens públicos / entropía | `prisma/schema.prisma` (`DocumentView.token`, `WorkspaceInvite.token`, `PublicForm.token` = `@default(cuid())`) + `app/api/doc/[token]/route.ts:19-30` | Los enlaces públicos sin sesión usan `cuid()` (timestamp+contador, menor entropía que aleatorio puro). `/api/doc/[token]` expone sin auth datos financieros (número, importe, datos de cliente y del emisor) y permite **aceptar/rechazar/firmar** el documento. | Si un token se adivina/filtra, lectura de PII financiera y acciones sobre documentos ajenos. La adivinación de cuid es difícil en la práctica → MEDIA, no ALTA. | Generar estos tokens con `crypto.randomBytes(32).toString("hex")` (como ya se hace en scan-sessions y reset). DocumentView ya expira a 30 días (OK). |
| M-05 | MEDIA | Multi-tenant / hardening | ~14 rutas (ver §4 lista completa) | Patrón *check-then-act*: `findFirst({id, userId})` (404 si no es tuyo) seguido de `update/delete({where:{id}})` sin `userId`. **No explotable hoy** (la validación previa corta), pero frágil ante refactors. | Defensa en profundidad ausente; un cambio futuro que mueva o elimine el check reabriría IDOR. | Añadir `userId` al `where` del `update/delete` (o usar `updateMany/deleteMany` con `{id, userId}`, como ya hacen invoicing, client-sales y client-purchases). |
| M-06 | MEDIA | Fuga de info en errores | `app/api/clients/[id]/route.ts:73-75`; `app/api/stripe/webhook/route.ts:26` | Se devuelve `err.message` crudo al cliente en algún camino de error. | Posible exposición de detalles internos (estructura, Prisma) al cliente. | Responder mensajes genéricos; loguear el detalle solo en servidor. |
| B-01 | BAJA | Logs | múltiples en `app/api/**` (`console.error("...", err)`) | Se loguea el objeto `err` completo; podría arrastrar PII/datos sensibles a los logs. | Privacidad en logs (no expuesto al cliente). | Loguear `err?.message` y un logger que recorte PII. |
| B-02 | BAJA | Config | `app/api/webhooks/stripe/route.ts:46-52` | Segundo webhook Stripe que solo verifica firma y no procesa nada (TODO). El activo es `/api/stripe/webhook`. | Confusión de despliegue: si se configura esta URL en Stripe, los pagos no se reflejan (ya señalado en BLINDAJE §3.1). | Eliminar `/api/webhooks/stripe` o consolidar, y confirmar la URL dada de alta en el panel de Stripe. |
| B-03 | BAJA | Sesión | `lib/auth/session-tracking.ts` (existe `revokeSession`, no se comprueba) | Hay sistema de revocación de sesiones por `jti` pero el middleware/JWT **no comprueba** `isSessionRevoked`. | "Cerrar sesión en otros dispositivos" no invalida realmente el JWT hasta su expiración (7 días). | Comprobar revocación del `jti` en el callback `jwt` o middleware. |
| B-04 | BAJA | Config crons | `app/api/cron/sync-calendar/route.ts:21`, `billing/reminders/route.ts:13` | `CRON_SECRET || CALENDAR_SYNC_CRON_SECRET` (fallback a nombre alterno). | Inconsistencia de config; ningún cron queda sin auth (todos validan secret), pero el fallback puede confundir. | Unificar en `CRON_SECRET`. |
| B-05 | BAJA | Dependencias | `package-lock.json` | `npm audit`: **1 high** (`tmp` <0.2.6, path traversal — transitiva, probablemente dev/tooling) + 8 moderate (`next`, `next-auth`, `resend`, `postcss`, `exceljs`, `svix`, `brace-expansion`, `uuid`). | Vulnerabilidades conocidas en dependencias; la mayoría transitivas/dev. | Revisar con `npm audit`; actualizar `next`/`next-auth` en ventana controlada y re-test (no en esta pasada). |

---

## 3. Sección CRÍTICOS

**No se ha encontrado ninguna vulnerabilidad de severidad CRÍTICA.**

En particular, el riesgo más temido en un SaaS multi-tenant —que un usuario lea o modifique datos de otro (IDOR cross-tenant)— **no existe de forma explotable** en el código auditado:

- Las ~150 rutas API obtienen la sesión (`getServerSession` / `getSessionUserId` / `getUserWorkspace`) y filtran por `userId`/`workspaceId`.
- Los repositorios de facturación usan `updateMany/deleteMany` con `{id, userId}` (cerrado a nivel de query).
- Los `$queryRawUnsafe` de `modules/client360` y `modules/invoicing/aging` pasan `userId`/`clientId` como **parámetros** (`$1`, `$2`), no concatenados → sin inyección SQL.
- Sin `dangerouslySetInnerHTML` en la app; path traversal correctamente bloqueado en `app/api/files/[...path]/route.ts` (valida que la ruta resuelta empiece por `UPLOADS_ROOT`).

Dicho esto, los 3 hallazgos **ALTA** (A-01 2FA decorativo, A-02 rate limiting fail-open, A-03 sin verificación de email + linking) afectan al perímetro de autenticación y, en un producto con datos fiscales, deberían cerrarse antes del 23. Los detallo en la tabla anterior con su fix.

---

## 4. Multi-tenant: detalle del falso positivo "16 IDOR críticos"

El barrido automático inicial reportó 16 rutas como "IDOR CRÍTICO" por hacer `update/delete({where:{id}})` sin `userId`. **Verifiqué las 16 a mano: todas tienen una validación de pertenencia inmediatamente antes** (`findFirst({where:{id, userId}})` → 404, o un servicio que filtra por userId). El `update/delete` por `id` solo se ejecuta sobre un recurso ya confirmado como propio, por lo que **no permite acceso cross-tenant**. Se reclasifican como **M-05 (hardening / defensa en profundidad)**, no crítico.

Rutas con patrón check-then-act (recomendado endurecer, no urgente):
`quotes/[id]/accept`, `quotes/[id]/reject`, `quotes/[id]/send`, `quotes/[id]/expire`, `quotes/[id]` (PATCH), `tasks/[id]` (PATCH/DELETE), `sales/[id]` (PATCH), `automations/[id]` (PUT/DELETE), `campaigns/[id]` (PATCH/DELETE), `email/templates/[id]` (PATCH/DELETE), `email/ab-test/[id]` (DELETE), `finance/budgets/[id]`, `finance/goals/[id]`, `forms/[id]`, `custom-fields/[fieldId]`, `leads/[id]` (PATCH), `reminders/[id]`, `projects/[id]` (PATCH), `purchase-orders/[id]/confirm`, `delivery-notes/[id]/deliver`, `settings/invoice-series/[id]`.

(Coincide con lo ya anotado en BLINDAJE.md §3.6.)

---

## 5. Falsos positivos descartados (para no perder tiempo)

| Reportado como | Veredicto | Por qué |
|----------------|-----------|---------|
| 16 IDOR cross-tenant CRÍTICOS | **Falso positivo → M-05 hardening** | Todos tienen `findFirst({id,userId})` con 404 previo; el update/delete nunca toca recurso ajeno. Verificado fichero a fichero. |
| `app/api/billing/[id]/*` "sin scope de userId" | **Falso positivo** | Son `export { POST } from "@/app/api/invoicing/[id]/..."` — re-exports de los handlers de invoicing, que sí validan ownership vía servicio+repo (`updateMany/deleteMany {id,userId}`). |
| SQL injection en `$queryRawUnsafe` | **Falso positivo** | `userId`/`clientId` van como parámetros (`$1`,`$2`), no concatenados. |
| XSS por `dangerouslySetInnerHTML` | **No aplica** | No existe ningún uso en `app/` ni `components/`. |
| Path traversal en subida/descarga | **Mitigado** | `files/[...path]` valida prefijo `UPLOADS_ROOT`; uploads sanitizan nombre (timestamp+random) y validan MIME/tamaño. |
| Secretos hardcodeados / `.env` commiteado | **No encontrado** | `.env*` está en `.gitignore`; no hay claves `sk_live`/`whsec`/`AKIA`/PEM en el código; los `NEXT_PUBLIC_*` son publishable key de Stripe y SDK key (públicos por diseño). |
| Endpoints admin sin protección | **Bien implementado** | `/api/admin/*` validan rol ADMIN en backend (`getServerSession` + `user.role`), y el middleware bloquea `/admin` a no-ADMIN. |
| CRON sin auth | **Bien implementado** | `/api/cron/*` es "público" en el middleware pero cada handler valida `CRON_SECRET` por header. |
| Reset de contraseña | **Bien implementado** | Token `randomBytes(32)`, expira 1h, un solo uso; forgot-password no revela si el email existe (siempre 200). |

---

*Auditoría en modo solo-lectura. Severidades calibradas tras verificación manual; el orden de prioridad para arreglar (uno a uno, con tu OK) sería: A-01 → A-02 → A-03 → M-02 → M-04 → resto.*
