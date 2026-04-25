/**
 * Email templates for ClientLabs.
 *
 * NOTE: invoiceSentEmail has NO ClientLabs branding — it's sent to end-clients.
 * All others HAVE ClientLabs branding.
 */

// ─── Shared brand helpers ────────────────────────────────────────────────────

const BRAND_GREEN = "#1FA97A"
const DARK_BG = "#0B1F2A"

function brandHeader(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${DARK_BG};border-radius:16px 16px 0 0;padding:32px;text-align:center">
      <tr><td>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 20px">
          <tr>
            <td style="vertical-align:middle;padding-right:8px">
              <img src="https://clientlabs.io/logo.PNG" width="28" height="28" alt="CL" style="display:block;border:0;border-radius:6px">
            </td>
            <td style="vertical-align:middle">
              <span style="font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.02em">Client<span style="color:${BRAND_GREEN}">Labs</span></span>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  `
}

function brandFooter(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#F8FAFB;border-top:1px solid #E2E8F0;border-radius:0 0 16px 16px;padding:20px 24px;text-align:center">
      <tr><td>
        <p style="font-size:13px;font-weight:600;color:${DARK_BG};margin:0 0 8px">Client<span style="color:${BRAND_GREEN}">Labs</span></p>
        <p style="margin:0 0 8px">
          <a href="https://clientlabs.io" style="font-size:10px;color:#94A3B8;text-decoration:none">clientlabs.io</a>&nbsp;·&nbsp;
          <a href="https://clientlabs.io/privacidad" style="font-size:10px;color:#94A3B8;text-decoration:none">Privacidad</a>
        </p>
        <p style="font-size:10px;color:#CBD5E1;line-height:1.6;margin:0">
          © 2026 ClientLabs · hola@clientlabs.io
        </p>
      </td></tr>
    </table>
  `
}

function wrapEmail(content: string, withBrand = true): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#E2E8F0;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%">
        <tr><td>
          ${withBrand ? brandHeader() : ""}
          <div style="background:#fff;padding:32px;${withBrand ? "" : "border-radius:16px"}">
            ${content}
          </div>
          ${withBrand ? brandFooter() : `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#F8FAFB;border-top:1px solid #E2E8F0;border-radius:0 0 16px 16px;padding:16px 24px;text-align:center">
              <tr><td><p style="font-size:10px;color:#CBD5E1;margin:0">© 2026 ClientLabs · hola@clientlabs.io</p></td></tr>
            </table>
          `}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px auto">
    <tr><td style="background:${BRAND_GREEN};border-radius:8px">
      <a href="${url}" style="display:block;padding:12px 28px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;white-space:nowrap">${label}</a>
    </td></tr>
  </table>`
}

// ─── 1. Welcome email ────────────────────────────────────────────────────────

export function welcomeEmail(name: string): string {
  const content = `
    <h1 style="font-size:24px;font-weight:700;color:#0F172A;margin:0 0 8px">¡Bienvenido/a, ${name}!</h1>
    <p style="font-size:15px;color:#0F172A;font-weight:500;margin:0 0 6px">Tu CRM inteligente para autónomos y pymes ya está listo.</p>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 24px">
      Con ClientLabs puedes gestionar tus clientes, leads, tareas, finanzas y mucho más desde un único lugar.
      Empieza explorando el dashboard y configura tu perfil de negocio.
    </p>
    ${btn("Ir al dashboard", "https://app.clientlabs.io/dashboard")}
    <p style="font-size:13px;color:#64748B;line-height:1.75;margin:16px 0 0">
      Si tienes cualquier pregunta, responde directamente a este email.<br>
      — El equipo de ClientLabs
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 2. Verification email ───────────────────────────────────────────────────

export function verificationEmail(name: string, verifyUrl: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Verifica tu email</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, haz clic en el botón de abajo para confirmar tu dirección de correo y activar tu cuenta.
    </p>
    ${btn("Verificar email", verifyUrl)}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:16px 0 0">
      Si no has creado una cuenta en ClientLabs, ignora este email.
      El enlace expira en 24 horas.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 3. Trial expiring email ─────────────────────────────────────────────────

export function trialExpiringEmail(name: string, daysLeft: number): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Tu periodo de prueba termina en ${daysLeft} día${daysLeft === 1 ? "" : "s"}</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, tu prueba gratuita de ClientLabs está por finalizar.
      No pierdas el acceso a tus datos y funcionalidades.
    </p>
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
      <p style="font-size:13px;font-weight:600;color:#92400E;margin:0">
        ⏰ ${daysLeft} día${daysLeft === 1 ? "" : "s"} restante${daysLeft === 1 ? "" : "s"}
      </p>
    </div>
    ${btn("Activar mi plan", "https://app.clientlabs.io/dashboard/settings/billing")}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:16px 0 0">
      Si ya has actualizado tu plan, ignora este mensaje.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 4. New lead notification ────────────────────────────────────────────────

export function newLeadEmail(
  name: string,
  leadName: string,
  leadEmail: string,
  source: string
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">🎯 Nuevo lead: ${leadName}</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, tienes un nuevo lead en ClientLabs.
    </p>
    <div style="background:#F0FDF9;border:1px solid #9FE1CB;border-radius:10px;padding:16px;margin-bottom:20px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="font-size:12px;color:#64748B;padding-bottom:6px"><strong style="color:#0F172A">Nombre:</strong> ${leadName}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#64748B;padding-bottom:6px"><strong style="color:#0F172A">Email:</strong> ${leadEmail}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#64748B"><strong style="color:#0F172A">Fuente:</strong> ${source}</td>
        </tr>
      </table>
    </div>
    ${btn("Ver lead en ClientLabs", "https://app.clientlabs.io/dashboard/leads")}
  `
  return wrapEmail(content, true)
}

// ─── 5. Invoice sent email (NO ClientLabs branding) ─────────────────────────

export function invoiceSentEmail(
  clientName: string,
  invoiceNumber: string,
  total: number,
  businessName: string
): string {
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Factura ${invoiceNumber}</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${clientName}, te adjuntamos la factura ${invoiceNumber} de ${businessName}.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center">
      <p style="font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px">Total factura</p>
      <p style="font-size:32px;font-weight:700;color:#0F172A;margin:0;letter-spacing:-0.02em">${totalFormatted}</p>
    </div>
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Si tienes alguna consulta sobre esta factura, contacta con ${businessName} directamente.
    </p>
  `
  return wrapEmail(content, false)
}

// ─── 6. Daily tasks email ────────────────────────────────────────────────────

interface TaskItem {
  title: string
  priority?: string
  type?: string
  time?: string | null
}

export function dailyTasksEmail(name: string, tasks: TaskItem[]): string {
  const PRIORITY_COLORS: Record<string, string> = {
    HIGH:   "#EF4444",
    MEDIUM: "#F59E0B",
    LOW:    "#10B981",
    URGENT: "#EF4444",
  }

  const taskRows = tasks
    .map((t) => {
      const color = PRIORITY_COLORS[t.priority ?? "MEDIUM"] ?? PRIORITY_COLORS.MEDIUM
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #F1F5F9">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;width:8px">
                  <div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>
                </td>
                <td style="vertical-align:middle">
                  <p style="font-size:13px;font-weight:500;color:#0F172A;margin:0">${t.title}</p>
                  ${t.time ? `<p style="font-size:11px;color:#94A3B8;margin:2px 0 0">${t.time}</p>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join("")

  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 6px">Buenos días, ${name} ☀️</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Tienes <strong>${tasks.length} tarea${tasks.length === 1 ? "" : "s"}</strong> para mañana.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;margin-bottom:20px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${taskRows}
      </table>
    </div>
    ${btn("Ver mis tareas", "https://app.clientlabs.io/dashboard/tasks")}
  `
  return wrapEmail(content, true)
}

// ─── 7. Invoice due reminder ─────────────────────────────────────────────────

export function invoiceDueEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
): string {
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">⚠️ Factura próxima a vencer</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> vence el <strong>${dueDate}</strong>.
    </p>
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
      <p style="font-size:12px;color:#92400E;font-weight:600;margin:0 0 4px">Total pendiente</p>
      <p style="font-size:28px;font-weight:700;color:#92400E;margin:0">${totalFormatted}</p>
    </div>
    ${btn("Ver factura", "https://app.clientlabs.io/dashboard/finance/invoicing")}
  `
  return wrapEmail(content, true)
}

// ─── 8. Team invite email ────────────────────────────────────────────────────

export function teamInviteEmail(
  inviterName: string,
  workspaceName: string,
  role: string,
  acceptUrl: string
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Invitación a ${workspaceName}</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      <strong>${inviterName}</strong> te ha invitado a unirte al espacio de trabajo <strong>${workspaceName}</strong> en ClientLabs como <strong>${role}</strong>.
    </p>
    ${btn("Aceptar invitación", acceptUrl)}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:16px 0 0">
      Si no esperabas esta invitación, puedes ignorar este email.
      El enlace expira en 7 días.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 9. Password reset email ─────────────────────────────────────────────────

export function passwordResetEmail(name: string, resetUrl: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Restablecer contraseña</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ClientLabs.
    </p>
    ${btn("Restablecer contraseña", resetUrl)}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:16px 0 0">
      Si no solicitaste el restablecimiento, ignora este email.
      El enlace expira en 1 hora.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 10. Lead converted email ────────────────────────────────────────────────

export function leadConvertedEmail(name: string, leadName: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">🎉 ¡Nuevo cliente!</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, el lead <strong>${leadName}</strong> ha sido convertido a cliente.
    </p>
    <div style="background:#F0FDF9;border:1px solid #9FE1CB;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
      <p style="font-size:15px;font-weight:600;color:#0F6E56;margin:0">${leadName} → Cliente</p>
    </div>
    ${btn("Ver clientes", "https://app.clientlabs.io/dashboard/clients")}
  `
  return wrapEmail(content, true)
}

// ─── 11. Plan limit email ────────────────────────────────────────────────────

export function planLimitEmail(
  name: string,
  resource: string,
  current: number,
  max: number
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 8px">Has alcanzado el límite de tu plan</h1>
    <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 20px">
      Hola ${name}, has alcanzado el límite de <strong>${resource}</strong> en tu plan actual
      (${current} de ${max}).
    </p>
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center">
      <p style="font-size:13px;font-weight:600;color:#92400E;margin:0">
        ${current} / ${max} ${resource} utilizados
      </p>
    </div>
    <p style="font-size:14px;color:#475569;margin:0 0 20px">
      Actualiza tu plan para continuar creciendo sin límites.
    </p>
    ${btn("Ver planes", "https://app.clientlabs.io/dashboard/settings/billing")}
  `
  return wrapEmail(content, true)
}
