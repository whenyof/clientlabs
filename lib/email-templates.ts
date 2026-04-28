/**
 * Email templates for ClientLabs.
 *
 * NOTES:
 * - invoiceSentEmail and quoteSentEmail have NO ClientLabs branding — sent to end-clients.
 * - All others have ClientLabs branding + noreply notice in footer.
 * - Logo is CSS-rendered (no external image dependency).
 */

// ─── Shared brand helpers ────────────────────────────────────────────────────

const BRAND_GREEN = "#1FA97A"
const DARK_BG     = "#0B1F2A"

function logoHtml(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
      <tr>
        <td style="vertical-align:middle;padding-right:10px">
          <!--[if !mso]><!-->
          <img src="https://clientlabs.io/logo-trimmed.png"
               width="36" height="36" border="0" alt="ClientLabs"
               style="display:block;border:0;border-radius:8px;width:36px;height:36px">
          <!--<![endif]-->
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
            href="#" style="width:36pt;height:36pt;" arcsize="22%" stroke="f" fillcolor="${BRAND_GREEN}">
            <v:textbox inset="0,0,0,0"><center style="color:#fff;font-family:Arial;font-weight:800;font-size:14px">CL</center></v:textbox>
          </v:roundrect>
          <![endif]-->
        </td>
        <td style="vertical-align:middle">
          <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.03em;font-family:Arial,sans-serif">Client<span style="color:${BRAND_GREEN}">Labs</span></span>
        </td>
      </tr>
    </table>
  `
}

function brandHeader(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:${DARK_BG};border-radius:14px 14px 0 0;padding:28px 32px;text-align:center">
      <tr><td>${logoHtml()}</td></tr>
    </table>
  `
}

function brandFooter(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:#F1F5F9;border-top:1px solid #E2E8F0;border-radius:0 0 14px 14px;padding:20px 28px;text-align:center">
      <tr><td>
        <p style="font-size:11px;font-weight:700;color:#475569;margin:0 0 6px;font-family:Arial,sans-serif;letter-spacing:0.02em">
          Client<span style="color:${BRAND_GREEN}">Labs</span>
        </p>
        <p style="font-size:11px;color:#94A3B8;margin:0 0 10px;font-family:Arial,sans-serif">
          <a href="https://clientlabs.io" style="color:#94A3B8;text-decoration:none">clientlabs.io</a>
          &nbsp;·&nbsp;
          <a href="https://clientlabs.io/privacidad" style="color:#94A3B8;text-decoration:none">Privacidad</a>
          &nbsp;·&nbsp;
          <a href="mailto:hola@clientlabs.io" style="color:#94A3B8;text-decoration:none">hola@clientlabs.io</a>
        </p>
        <p style="font-size:10px;color:#CBD5E1;margin:0;font-family:Arial,sans-serif;line-height:1.6">
          Este es un mensaje automático generado por ClientLabs.<br>
          Por favor, <strong>no respondas a este correo</strong> — no está monitoreado.<br>
          Si necesitas ayuda escríbenos a
          <a href="mailto:hola@clientlabs.io" style="color:#94A3B8;text-decoration:none">hola@clientlabs.io</a>.
        </p>
        <p style="font-size:10px;color:#CBD5E1;margin:10px 0 0;font-family:Arial,sans-serif">
          © 2026 ClientLabs. Todos los derechos reservados.
        </p>
      </td></tr>
    </table>
  `
}

function wrapEmail(content: string, withBrand = true): string {
  const footer = withBrand
    ? brandFooter()
    : `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="background:#F1F5F9;border-top:1px solid #E2E8F0;border-radius:0 0 14px 14px;padding:16px 24px;text-align:center">
        <tr><td>
          <p style="font-size:10px;color:#CBD5E1;margin:0;font-family:Arial,sans-serif">
            © 2026 ClientLabs. Todos los derechos reservados.
          </p>
        </td></tr>
      </table>
    `

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
</head>
<body style="margin:0;padding:0;background:#DDE3EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background:#DDE3EA;padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
        style="max-width:580px;width:100%;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.10)">
        <tr><td>
          ${withBrand ? brandHeader() : ""}
          <div style="background:#ffffff;padding:36px 36px 28px;${withBrand ? "" : "border-radius:14px 14px 0 0"}">
            ${content}
          </div>
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string, color = BRAND_GREEN): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px auto 0">
      <tr>
        <td style="background:${color};border-radius:9px;mso-padding-alt:0">
          <a href="${url}"
            style="display:block;padding:13px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;white-space:nowrap;font-family:Arial,sans-serif;letter-spacing:0.01em">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `
}

function divider(): string {
  return `<div style="height:1px;background:#E2E8F0;margin:24px 0"></div>`
}

// ─── 1. Welcome email ────────────────────────────────────────────────────────

export function welcomeEmail(name: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 6px;letter-spacing:-0.02em">
      ¡Bienvenido/a, ${name}!
    </h1>
    <p style="font-size:15px;font-weight:600;color:${BRAND_GREEN};margin:0 0 16px">
      Tu negocio, bajo control.
    </p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Con ClientLabs puedes gestionar tus clientes, leads, tareas y finanzas desde un único lugar.
      Tu cuenta está lista — empieza por el dashboard y configura tu perfil de negocio.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:16px 20px;margin-bottom:8px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="font-size:13px;color:#0F172A;padding:4px 0">✅ &nbsp;Gestión de clientes y leads</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#0F172A;padding:4px 0">✅ &nbsp;Facturación y presupuestos</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#0F172A;padding:4px 0">✅ &nbsp;Tareas y calendario</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#0F172A;padding:4px 0">✅ &nbsp;Automatizaciones y recordatorios</td>
        </tr>
      </table>
    </div>
    ${btn("Abrir mi dashboard", "https://app.clientlabs.io/dashboard")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;margin:0;line-height:1.6">
      ¿Tienes alguna pregunta? Escríbenos a
      <a href="mailto:hola@clientlabs.io" style="color:${BRAND_GREEN};text-decoration:none;font-weight:600">hola@clientlabs.io</a>
      y te respondemos lo antes posible.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 2. Verification email (link-based) ─────────────────────────────────────

export function verificationEmail(name: string, verifyUrl: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">Verifica tu email</h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, haz clic en el botón de abajo para confirmar tu dirección de correo y activar tu cuenta en ClientLabs.
    </p>
    ${btn("Verificar mi email", verifyUrl)}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      El enlace expira en <strong>24 horas</strong>.<br>
      Si no has creado una cuenta en ClientLabs, ignora este mensaje.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 3. Trial expiring email ─────────────────────────────────────────────────

export function trialExpiringEmail(name: string, daysLeft: number): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Tu periodo de prueba termina en ${daysLeft} día${daysLeft === 1 ? "" : "s"}
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, tu prueba gratuita de ClientLabs está llegando a su fin. Activa tu plan para seguir accediendo a todos tus datos y funcionalidades sin interrupción.
    </p>
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;padding:18px;margin-bottom:8px;text-align:center">
      <p style="font-size:28px;font-weight:800;color:#92400E;margin:0 0 4px;letter-spacing:-0.02em">
        ${daysLeft} día${daysLeft === 1 ? "" : "s"}
      </p>
      <p style="font-size:12px;color:#92400E;font-weight:600;margin:0;text-transform:uppercase;letter-spacing:0.08em">
        restante${daysLeft === 1 ? "" : "s"} de prueba
      </p>
    </div>
    ${btn("Activar mi plan ahora", "https://app.clientlabs.io/dashboard/settings/billing")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
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
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Nuevo lead capturado
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, tienes un nuevo lead registrado en ClientLabs. Respóndele lo antes posible para aumentar tus posibilidades de conversión.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:18px 20px;margin-bottom:8px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:5px 0;border-bottom:1px solid #D1FAE5">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Nombre</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${leadName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #D1FAE5">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Email</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${leadEmail}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0 0">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Fuente</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${source}</span>
          </td>
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
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 4px;letter-spacing:-0.02em">
      Factura ${invoiceNumber}
    </h1>
    <p style="font-size:13px;color:#64748B;margin:0 0 20px">${businessName}</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${clientName}, te adjuntamos la factura <strong>${invoiceNumber}</strong>.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:22px;margin-bottom:20px;text-align:center">
      <p style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;font-weight:600">
        Total factura
      </p>
      <p style="font-size:36px;font-weight:800;color:#0F172A;margin:0;letter-spacing:-0.03em">${totalFormatted}</p>
    </div>
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Para cualquier consulta sobre esta factura, contacta directamente con ${businessName}.
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
    URGENT: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW:    "#10B981",
  }

  const taskRows = tasks
    .map((t, i) => {
      const color = PRIORITY_COLORS[t.priority ?? "MEDIUM"] ?? PRIORITY_COLORS.MEDIUM
      const isLast = i === tasks.length - 1
      return `
        <tr>
          <td style="padding:10px 0;${isLast ? "" : "border-bottom:1px solid #F1F5F9"}">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;width:10px;padding-right:12px">
                  <div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>
                </td>
                <td style="vertical-align:middle">
                  <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0">${t.title}</p>
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
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 4px;letter-spacing:-0.02em">
      Buenos días, ${name} ☀️
    </h1>
    <p style="font-size:14px;color:#475569;margin:0 0 20px">
      Tienes <strong>${tasks.length} tarea${tasks.length === 1 ? "" : "s"}</strong> programadas para hoy.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:6px 16px;margin-bottom:8px">
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
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Factura próxima a vencer
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> vence el <strong>${dueDate}</strong>. Recuerda hacer el seguimiento para cobrarla a tiempo.
    </p>
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;padding:20px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px">Total pendiente</p>
      <p style="font-size:32px;font-weight:800;color:#92400E;margin:0;letter-spacing:-0.02em">${totalFormatted}</p>
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
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Invitación a unirte al equipo
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      <strong>${inviterName}</strong> te ha invitado a unirte al espacio de trabajo <strong>${workspaceName}</strong> en ClientLabs con el rol de <strong>${role}</strong>.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:16px 20px;margin-bottom:8px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:4px 0;border-bottom:1px solid #D1FAE5">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Workspace</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${workspaceName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0 0">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Tu rol</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${role}</span>
          </td>
        </tr>
      </table>
    </div>
    ${btn("Aceptar invitación", acceptUrl)}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Si no esperabas esta invitación, ignora este mensaje. El enlace expira en <strong>7 días</strong>.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 9. Password reset email ─────────────────────────────────────────────────

export function passwordResetEmail(name: string, resetUrl: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Restablecer tu contraseña
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ClientLabs. Haz clic en el botón para crear una nueva.
    </p>
    ${btn("Restablecer contraseña", resetUrl)}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      El enlace expira en <strong>1 hora</strong>.<br>
      Si no solicitaste este cambio, ignora este mensaje — tu contraseña actual sigue siendo válida.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 10. Lead converted email ────────────────────────────────────────────────

export function leadConvertedEmail(name: string, leadName: string): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Tienes un nuevo cliente 🎉
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, el lead <strong>${leadName}</strong> ha sido convertido a cliente con éxito. Ya aparece en tu lista de clientes en ClientLabs.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:18px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#0F6E56;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px">Cliente añadido</p>
      <p style="font-size:20px;font-weight:700;color:#0F172A;margin:0">${leadName}</p>
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
  const pct = Math.round((current / max) * 100)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Has alcanzado el límite de tu plan
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, has utilizado el <strong>${pct}%</strong> de tu cuota de <strong>${resource}</strong> (${current} de ${max}). Actualiza tu plan para seguir creciendo sin límites.
    </p>
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;padding:18px;margin-bottom:8px">
      <p style="font-size:12px;color:#92400E;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.06em">${resource}</p>
      <div style="background:#FDE68A;border-radius:99px;height:10px;overflow:hidden">
        <div style="background:#D97706;height:10px;width:${pct}%;border-radius:99px"></div>
      </div>
      <p style="font-size:12px;color:#92400E;margin:6px 0 0;text-align:right">${current} / ${max}</p>
    </div>
    ${btn("Ver planes disponibles", "https://app.clientlabs.io/dashboard/settings/billing")}
  `
  return wrapEmail(content, true)
}

// ─── 12. Verification code email (6-digit OTP) ───────────────────────────────

export function verificationCodeEmail(code: string): string {
  const content = `
    <div style="text-align:center">
      <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 10px;letter-spacing:-0.02em">
        Verifica tu email
      </h1>
      <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 28px">
        Introduce el siguiente código en ClientLabs para activar tu cuenta:
      </p>
      <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:14px;padding:22px 36px;display:inline-block;margin-bottom:24px">
        <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#0B1F2A;font-family:'Courier New',Courier,monospace">
          ${code}
        </span>
      </div>
      <p style="font-size:13px;color:#64748B;margin:0 0 6px">
        ⏱ Este código expira en <strong>10 minutos</strong>.
      </p>
    </div>
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;line-height:1.6">
      Si no has creado una cuenta en ClientLabs, ignora este mensaje.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 13. Invoice paid email ──────────────────────────────────────────────────

export function invoicePaidEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  total: number
): string {
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Factura cobrada
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> ha sido marcada como pagada.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:22px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#0F6E56;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">Importe cobrado</p>
      <p style="font-size:36px;font-weight:800;color:#0F6E56;margin:0;letter-spacing:-0.03em">${totalFormatted}</p>
    </div>
    ${btn("Ver factura", "https://app.clientlabs.io/dashboard/finance/invoicing")}
  `
  return wrapEmail(content, true)
}

// ─── 14. Invoice overdue email ───────────────────────────────────────────────

export function invoiceOverdueEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
): string {
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Factura vencida sin cobrar
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> venció el <strong>${dueDate}</strong> y sigue pendiente de cobro. Te recomendamos enviar un recordatorio al cliente.
    </p>
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:22px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#991B1B;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">Importe vencido</p>
      <p style="font-size:36px;font-weight:800;color:#991B1B;margin:0;letter-spacing:-0.03em">${totalFormatted}</p>
    </div>
    ${btn("Ver factura", "https://app.clientlabs.io/dashboard/finance/invoicing")}
  `
  return wrapEmail(content, true)
}

// ─── 15. Quote sent email (NO ClientLabs branding) ───────────────────────────

export function quoteSentEmail(
  clientName: string,
  quoteNumber: string,
  total: number,
  businessName: string
): string {
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 4px;letter-spacing:-0.02em">
      Presupuesto ${quoteNumber}
    </h1>
    <p style="font-size:13px;color:#64748B;margin:0 0 20px">${businessName}</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${clientName}, te enviamos el presupuesto <strong>${quoteNumber}</strong> para tu revisión.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:22px;margin-bottom:20px;text-align:center">
      <p style="font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;font-weight:600">
        Total presupuestado
      </p>
      <p style="font-size:36px;font-weight:800;color:#0F172A;margin:0;letter-spacing:-0.03em">${totalFormatted}</p>
    </div>
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Para cualquier consulta, contacta directamente con ${businessName}.
    </p>
  `
  return wrapEmail(content, false)
}

// ─── 16. Subscription activated email ────────────────────────────────────────

export function subscriptionActivatedEmail(
  name: string,
  plan: string,
  nextBillingDate: string
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Suscripción activada 🎉
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, tu suscripción al plan <strong>${plan}</strong> está activa. Ya tienes acceso completo a todas las funcionalidades de ClientLabs.
    </p>
    <div style="background:#F0FDF9;border:1px solid #BBF7E0;border-radius:10px;padding:18px 20px;margin-bottom:8px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:5px 0;border-bottom:1px solid #D1FAE5">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Plan activo</span><br>
            <span style="font-size:14px;font-weight:700;color:#0F172A">${plan}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0 0">
            <span style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em">Próxima facturación</span><br>
            <span style="font-size:14px;font-weight:600;color:#0F172A">${nextBillingDate}</span>
          </td>
        </tr>
      </table>
    </div>
    ${btn("Ir al dashboard", "https://app.clientlabs.io/dashboard")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Puedes gestionar tu suscripción en cualquier momento desde
      <a href="https://app.clientlabs.io/dashboard/settings/billing" style="color:${BRAND_GREEN};text-decoration:none">Ajustes → Facturación</a>.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 17. Payment failed email ─────────────────────────────────────────────────

export function paymentFailedEmail(
  name: string,
  plan: string,
  retryDate: string
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      No hemos podido procesar tu pago
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, el cobro de tu suscripción al plan <strong>${plan}</strong> no ha podido completarse. Actualiza tu método de pago para evitar la suspensión de tu cuenta.
    </p>
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:10px;padding:18px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#92400E;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px">
        Próximo intento de cobro
      </p>
      <p style="font-size:18px;font-weight:700;color:#92400E;margin:0">${retryDate}</p>
    </div>
    ${btn("Actualizar método de pago", "https://app.clientlabs.io/dashboard/settings/billing")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Si crees que se trata de un error bancario, contacta con tu entidad financiera o escríbenos a
      <a href="mailto:hola@clientlabs.io" style="color:${BRAND_GREEN};text-decoration:none">hola@clientlabs.io</a>.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 18. Subscription cancelled email ────────────────────────────────────────

export function subscriptionCancelledEmail(
  name: string,
  plan: string,
  accessUntil: string
): string {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.02em">
      Suscripción cancelada
    </h1>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 20px">
      Hola ${name}, hemos procesado la cancelación de tu plan <strong>${plan}</strong>. Seguirás teniendo acceso completo hasta la fecha indicada.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:20px;margin-bottom:8px;text-align:center">
      <p style="font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px">
        Acceso hasta
      </p>
      <p style="font-size:20px;font-weight:700;color:#0F172A;margin:0">${accessUntil}</p>
    </div>
    ${btn("Reactivar mi suscripción", "https://app.clientlabs.io/dashboard/settings/billing")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
      Gracias por haber confiado en ClientLabs. Si quieres contarnos por qué cancelaste o tienes algún comentario, escríbenos a
      <a href="mailto:hola@clientlabs.io" style="color:${BRAND_GREEN};text-decoration:none">hola@clientlabs.io</a>.
    </p>
  `
  return wrapEmail(content, true)
}

// ─── 19. Weekly business summary email ───────────────────────────────────────

interface WeeklyStats {
  newLeads: number
  invoicedAmount: number
  tasksCompleted: number
  openInvoices: number
  weekLabel: string
}

export function weeklyBusinessSummaryEmail(name: string, stats: WeeklyStats): string {
  const invoicedFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(stats.invoicedAmount)

  function statCard(emoji: string, label: string, value: string, accent = "#0F172A"): string {
    return `
      <td style="width:50%;padding:5px">
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px 10px;text-align:center">
          <p style="font-size:20px;margin:0 0 6px">${emoji}</p>
          <p style="font-size:20px;font-weight:800;color:${accent};margin:0 0 4px;letter-spacing:-0.02em">${value}</p>
          <p style="font-size:10px;color:#94A3B8;margin:0;text-transform:uppercase;letter-spacing:0.07em;font-weight:600">${label}</p>
        </div>
      </td>
    `
  }

  const overdueColor = stats.openInvoices > 0 ? "#92400E" : "#0F172A"

  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 4px;letter-spacing:-0.02em">
      Resumen semanal
    </h1>
    <p style="font-size:14px;color:#94A3B8;margin:0 0 22px">${stats.weekLabel}</p>
    <p style="font-size:14px;color:#475569;line-height:1.8;margin:0 0 18px">
      Hola ${name}, aquí tienes un resumen de lo que ha pasado en tu negocio esta semana.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px">
      <tr>
        ${statCard("🎯", "Nuevos leads", String(stats.newLeads), BRAND_GREEN)}
        ${statCard("💶", "Facturado", invoicedFormatted, BRAND_GREEN)}
      </tr>
      <tr>
        ${statCard("✅", "Tareas completadas", String(stats.tasksCompleted))}
        ${statCard("⏳", "Facturas abiertas", String(stats.openInvoices), overdueColor)}
      </tr>
    </table>
    ${btn("Ver dashboard completo", "https://app.clientlabs.io/dashboard")}
    ${divider()}
    <p style="font-size:12px;color:#94A3B8;margin:0;text-align:center;line-height:1.6">
      Recibes este resumen cada lunes a las 9:00.<br>
      Puedes desactivarlo en
      <a href="https://app.clientlabs.io/dashboard/settings" style="color:${BRAND_GREEN};text-decoration:none">Ajustes → Notificaciones</a>.
    </p>
  `
  return wrapEmail(content, true)
}
