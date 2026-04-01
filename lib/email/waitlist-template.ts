function iconCell(bg: string, color: string, char: string): string {
  return `<td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr><td align="center" valign="middle" style="width:34px;height:34px;background-color:${bg};border-radius:9px;font-size:16px;line-height:34px;text-align:center;color:${color};font-weight:600;">${char}</td></tr>
        </table>
      </td>`
}

function benefit(bg: string, color: string, char: string, title: string, desc: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      ${iconCell(bg, color, char)}
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">${title}</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">${desc}</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>`
}

export function buildWaitlistEmail(position: number): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ya estás dentro — ClientLabs</title>
</head>
<body style="margin:0;padding:0;background-color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#E2E8F0;">
  Bienvenido/a. 1 mes gratis + 50% descuento de por vida reservado.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#E2E8F0;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

<!-- HEADER -->
<tr><td style="background-color:#0B1F2A;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td align="center">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="background-color:#1FA97A;border-radius:8px;width:34px;height:34px;text-align:center;vertical-align:middle;">
      <img src="https://clientlabs.io/logo.PNG" width="20" height="20" alt="CL" style="display:block;margin:7px auto;border:0;" />
    </td>
    <td style="padding-left:9px;vertical-align:middle;">
      <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Client<span style="color:#1FA97A;">Labs</span></span>
    </td>
  </tr>
  </table>
  </td></tr>
  </table>

  <div style="width:60px;height:60px;border-radius:50%;background-color:rgba(31,169,122,0.15);border:2px solid rgba(31,169,122,0.35);margin:0 auto 18px;font-size:26px;line-height:60px;text-align:center;color:#1FA97A;font-weight:700;">&#10003;</div>

  <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.2;">Ya estás dentro.</h1>
  <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0;">Bienvenido/a al acceso anticipado de ClientLabs</p>
</td></tr>

<!-- BODY -->
<tr><td style="background-color:#ffffff;padding:32px;">

  <p style="font-size:15px;font-weight:500;color:#0F172A;margin:0 0 8px;">Hola,</p>
  <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 28px;">
    Gracias por unirte. Eres una de las primeras personas en confiar en ClientLabs antes del lanzamiento oficial — y eso tiene su recompensa. Aquí tienes todo lo que tienes reservado.
  </p>

  <!-- POSICIÓN -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
  <tr><td style="background-color:#0B1F2A;border-radius:12px;padding:24px;text-align:center;">
    <p style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Tu posición en la lista de espera</p>
    <p style="font-size:48px;font-weight:700;color:#1FA97A;line-height:1;margin:0;letter-spacing:-0.03em;">#${position}</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:6px 0 0;">De los primeros en acceder cuando abramos</p>
  </td></tr>
  </table>

  <p style="font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px;">Lo que tienes reservado</p>

  ${benefit("#E1F5EE", "#0F6E56", "&#10003;", "1 mes completamente gratis", "Acceso completo a todos los módulos durante 30 días. Sin tarjeta. Sin compromiso.")}
  ${benefit("#FEF3C7", "#854F0B", "&#9733;", "50% de descuento de por vida", "Tu precio early adopter queda fijo para siempre. Aunque canceles y vuelvas, el descuento se mantiene.")}
  ${benefit("#DBEAFE", "#1E40AF", "&#9650;", "Acceso prioritario al lanzamiento", "Entras el primer día antes de que abramos al público general. Tu cuenta queda activada automáticamente.")}
  ${benefit("#EDE9FE", "#5B21B6", "&#9670;", "Ofertas exclusivas pre-lanzamiento", "Promociones, features en beta y condiciones que nunca estarán disponibles para el público.")}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:26px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      ${iconCell("#F0FDF9", "#0F6E56", "&#9998;")}
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">Influencia directa en el producto</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Tu feedback tiene peso real. Las features que pidas en beta tienen prioridad en el roadmap.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td style="height:1px;background-color:#E2E8F0;font-size:0;line-height:0;"></td></tr>
  </table>

  <!-- FECHA LANZAMIENTO -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:26px;">
  <tr><td style="background-color:#F0FDF9;border:1px solid #9FE1CB;border-radius:10px;padding:18px;text-align:center;">
    <p style="font-size:10px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 5px;">Fecha de lanzamiento oficial</p>
    <p style="font-size:19px;font-weight:700;color:#0B1F2A;letter-spacing:-0.02em;margin:0 0 3px;">23 de Junio de 2026</p>
    <p style="font-size:11px;color:#475569;margin:0;">Te avisaremos unos días antes con todos los detalles</p>
  </td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td style="height:1px;background-color:#E2E8F0;font-size:0;line-height:0;"></td></tr>
  </table>

  <p style="font-size:13px;color:#64748B;line-height:1.75;margin:0;">
    Si tienes cualquier pregunta o quieres contarnos algo sobre tu negocio, responde directamente a este email — lo leeremos personalmente.<br><br>
    Un saludo,<br>
    <strong style="color:#0F172A;font-size:14px;">Iyan</strong><br>
    <span style="color:#94A3B8;font-size:12px;">Fundador de ClientLabs</span>
  </p>

</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#F8FAFB;border-top:1px solid #E2E8F0;border-radius:0 0 16px 16px;padding:22px 24px;text-align:center;">
  <p style="font-size:13px;font-weight:600;color:#0B1F2A;margin:0 0 10px;">Client<span style="color:#1FA97A;">Labs</span></p>
  <p style="margin:0 0 10px;">
    <a href="https://clientlabs.io" style="font-size:10px;color:#94A3B8;text-decoration:none;">clientlabs.io</a>
    &nbsp;·&nbsp;
    <a href="https://clientlabs.io/privacidad" style="font-size:10px;color:#94A3B8;text-decoration:none;">Privacidad</a>
    &nbsp;·&nbsp;
    <a href="https://clientlabs.io/cookies" style="font-size:10px;color:#94A3B8;text-decoration:none;">Cookies</a>
  </p>
  <p style="font-size:10px;color:#CBD5E1;line-height:1.6;margin:0;">
    Recibiste este email porque te apuntaste a la lista de acceso anticipado de ClientLabs.<br>
    © 2026 ClientLabs · hola@clientlabs.io
  </p>
</td></tr>

</table>
</td></tr>
</table>

</body>
</html>`
}
