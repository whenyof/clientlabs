/**
 * Email de anuncio de lanzamiento + referidos — diseño "Email Lanzamiento v2"
 * de Claude Design, integrado tal cual (tablas, CSS inline, MSO para Outlook).
 * Merge fields cableados como parámetros; el copy del premio grande está
 * corregido respecto al diseño: el BUSINESS de por vida exige 25 conversiones
 * a plan de pago, no 25 altas en la waitlist.
 */
export function buildReferralAnnouncementEmail(opts: {
  /** URL del panel de referidos (botón "Obtener mi enlace") */
  panelUrl: string
  /** Nombre del destinatario; sin él, el saludo es "Hola," */
  nombre?: string | null
  /** Enlace de baja; fallback mailto mientras no exista flujo de unsubscribe */
  unsubscribeUrl?: string
}): string {
  const { panelUrl } = opts
  const saludo = opts.nombre?.trim() ? `Hola ${opts.nombre.trim()},` : "Hola,"
  const unsubscribeUrl = opts.unsubscribeUrl ?? "mailto:hola@clientlabs.io?subject=Baja%20de%20la%20lista"
  const privacyUrl = "https://clientlabs.io/privacidad"

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>El 23 de junio lanzamos ClientLabs</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  a { text-decoration: none; }
  .hover-btn:hover { background: #17c088 !important; }

  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 22px !important; padding-right: 22px !important; }
    .hero-pad { padding-left: 26px !important; padding-right: 26px !important; }
    .hero-h1 { font-size: 30px !important; line-height: 36px !important; }
    .mes-num { font-size: 46px !important; line-height: 50px !important; }
    .feat-col { display: block !important; width: 100% !important; }
    .feat-col-l { padding-right: 0 !important; }
    .feat-col-r { padding-left: 0 !important; }
    .btn-a { display: block !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#EEF3F1; font-family: 'Inter Tight', 'Inter', Helvetica, Arial, sans-serif;">

  <!-- Preheader (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#EEF3F1; opacity:0;">
    El 23 de junio lanzamos. Por cada persona que invites y entre, 1 mes gratis. Y con 25 invitados que contraten un plan, Business de por vida.
    &#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF3F1;">
    <tr>
      <td align="center" style="padding:36px 14px;">

        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="width:600px; max-width:600px; background:#ffffff; border-radius:20px; box-shadow:0 1px 2px rgba(11,31,42,.05), 0 20px 60px rgba(11,31,42,.08);">

          <!-- ════════ HEADER / LOGO (3 cuadrados) ════════ -->
          <tr>
            <td align="center" style="padding:34px 40px 26px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- 3-square mark, email-safe (table cells, no SVG) -->
                  <td valign="middle" style="padding-right:11px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="13" height="13" style="width:13px; height:13px; background:#ABCFCC; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="5" style="width:5px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="13" height="13" style="width:13px; height:13px; background:#63A6A1; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="5" style="width:5px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="13" height="13" style="width:13px; height:13px; background:#0F766E; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:600; font-size:21px; letter-spacing:-0.03em; color:#0B1F2A;">ClientLabs</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ════════ HERO ════════ -->
          <tr>
            <td style="padding:0 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0B1F2A; border-radius:16px;">
                <tr>
                  <td class="hero-pad" align="center" style="padding:42px 44px 0 44px;">
                    <p style="margin:0; font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:#5fdcae;">Lanzamiento oficial</p>
                    <h1 class="hero-h1" style="margin:18px 0 0 0; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:700; font-size:38px; line-height:44px; letter-spacing:-0.03em; color:#ffffff;">El 23 de junio<br>lanzamos <span style="color:#1FA97A;">ClientLabs</span></h1>
                    <p style="margin:14px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:17px; line-height:24px; color:#9fb0b9;">Y tú entras el primero.</p>
                  </td>
                </tr>
                <!-- 3-square motif as hero baseline ornament -->
                <tr>
                  <td align="center" style="padding:30px 0 36px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="11" height="11" style="width:11px; height:11px; background:#16463f; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="6" style="width:6px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="11" height="11" style="width:11px; height:11px; background:#157a5c; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="6" style="width:6px; font-size:0; line-height:0;">&nbsp;</td>
                        <td width="11" height="11" style="width:11px; height:11px; background:#1FA97A; border-radius:3px; font-size:0; line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ════════ SALUDO ════════ -->
          <tr>
            <td class="px" style="padding:36px 44px 0 44px;" align="left">
              <p style="margin:0 0 14px 0; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:700; font-size:19px; letter-spacing:-0.01em; color:#0B1F2A;">${saludo}</p>
              <p style="margin:0 0 14px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:15.5px; line-height:25px; color:#3f4f58;">
                Gracias por estar en la waitlist de ClientLabs. Sois los primeros, y eso no se me olvida.
              </p>
              <p style="margin:0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:15.5px; line-height:25px; color:#3f4f58;">
                <strong style="color:#0B1F2A;">El 23 de junio lanzamos.</strong> Esto es lo que tendrás desde el primer día, todo en el mismo sitio:
              </p>
            </td>
          </tr>

          <!-- ════════ FEATURES (2 columnas) ════════ -->
          <tr>
            <td class="px" style="padding:22px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="feat-col feat-col-l" width="50%" valign="top" style="padding-right:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Leads y clientes <span style="color:#8695a0;">(CRM)</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Proveedores</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Tareas y proyectos</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="feat-col feat-col-r" width="50%" valign="top" style="padding-left:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Informes</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="middle" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Equipo</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="22" height="22" align="center" valign="top" style="width:22px; height:22px; background:#EAF6F0; border-radius:6px; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:bold; color:#0F766E; line-height:22px;">&#10003;</td>
                              <td style="padding-left:10px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:21px; color:#23333c;">Facturación con <strong style="color:#0B1F2A;">Verifactu</strong>, lista para la nueva normativa</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ════════ ROADMAP ════════ -->
          <tr>
            <td class="px" style="padding:26px 44px 0 44px;" align="left">
              <p style="margin:0 0 16px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:15.5px; line-height:25px; color:#3f4f58;">
                Y esto llega en los meses siguientes, en este orden:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F9F8; border-radius:14px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 14px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="26" height="26" align="center" valign="middle" style="width:26px; height:26px; background:#ABCFCC; border-radius:7px; font-family:'JetBrains Mono','Courier New',monospace; font-size:13px; font-weight:bold; color:#0B1F2A; line-height:26px;">1</td>
                              <td style="padding-left:12px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; color:#23333c;">Email marketing</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 14px 0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="26" height="26" align="center" valign="middle" style="width:26px; height:26px; background:#63A6A1; border-radius:7px; font-family:'JetBrains Mono','Courier New',monospace; font-size:13px; font-weight:bold; color:#ffffff; line-height:26px;">2</td>
                              <td style="padding-left:12px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; color:#23333c;">Automatizaciones</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="26" height="26" align="center" valign="middle" style="width:26px; height:26px; background:#0F766E; border-radius:7px; font-family:'JetBrains Mono','Courier New',monospace; font-size:13px; font-weight:bold; color:#ffffff; line-height:26px;">3</td>
                              <td style="padding-left:12px; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:14.5px; color:#23333c;">Asistente de IA</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ════════ REFERIDOS (la estrella) ════════ -->
          <tr>
            <td style="padding:34px 14px 0 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EAF6F0; border:1.5px solid #bfe3d3; border-radius:16px;">
                <tr>
                  <td class="hero-pad" align="center" style="padding:36px 40px 0 40px;">
                    <p style="margin:0; font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#0d7a56;">Por estar aquí, tienes algo más</p>
                    <p style="margin:20px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:16px; line-height:24px; color:#3f4f58;">Por cada persona que invites y entre,</p>
                    <p class="mes-num" style="margin:6px 0 0 0; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:800; font-size:56px; line-height:60px; letter-spacing:-0.04em; color:#0B1F2A;">1 mes <span style="color:#0F766E;">gratis</span></p>
                  </td>
                </tr>
                <tr>
                  <td class="hero-pad" align="center" style="padding:24px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top:1px solid #cde7da; font-size:0; line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                    <p style="margin:18px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:16px; line-height:24px; color:#3f4f58;">Y si 25 de tus invitados contratan un plan,</p>
                    <p style="margin:6px 0 0 0; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:800; font-size:24px; line-height:32px; letter-spacing:-0.02em; color:#0d7a56;">ClientLabs BUSINESS gratis de por vida<span style="color:#8aa89a;">*</span></p>
                  </td>
                </tr>
                <!-- CTA -->
                <tr>
                  <td align="center" style="padding:28px 40px 36px 40px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${panelUrl}" style="height:54px;v-text-anchor:middle;width:280px;" arcsize="28%" stroke="f" fillcolor="#0B1F2A">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">Obtener mi enlace &rarr;</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="${panelUrl}" class="btn-a" style="background:#0B1F2A; color:#ffffff; display:inline-block; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; letter-spacing:-0.01em; line-height:54px; text-align:center; text-decoration:none; padding:0 44px; border-radius:14px;">Obtener mi enlace &nbsp;&rarr;</a>
                    <!--<![endif]-->
                    <p style="margin:14px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:12.5px; line-height:18px; color:#7d958a;">
                      Tu enlace personal: <a href="${panelUrl}" style="color:#0d7a56; text-decoration:underline; word-break:break-all;">${panelUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ════════ CIERRE + FIRMA ════════ -->
          <tr>
            <td class="px" style="padding:34px 44px 0 44px;" align="left">
              <p style="margin:0 0 18px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:15.5px; line-height:25px; color:#3f4f58;">
                Gracias por confiar antes que nadie.
              </p>
              <p style="margin:0; font-family:'Inter Tight','Inter',Helvetica,Arial,sans-serif; font-weight:700; font-size:17px; letter-spacing:-0.01em; color:#0B1F2A;">Iyan</p>
              <p style="margin:2px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:13px; color:#8695a0;">Fundador de ClientLabs</p>
            </td>
          </tr>

          <!-- ════════ FOOTER (dentro de la tarjeta) ════════ -->
          <tr>
            <td class="px" style="padding:32px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #e6ebee; font-size:0; line-height:0;">&nbsp;</td></tr></table>
            </td>
          </tr>
          <tr>
            <td class="px" align="center" style="padding:24px 44px 34px 44px;">
              <!-- mini logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td width="9" height="9" style="width:9px; height:9px; background:#ABCFCC; border-radius:2px; font-size:0; line-height:0;">&nbsp;</td>
                  <td width="4" style="width:4px; font-size:0; line-height:0;">&nbsp;</td>
                  <td width="9" height="9" style="width:9px; height:9px; background:#63A6A1; border-radius:2px; font-size:0; line-height:0;">&nbsp;</td>
                  <td width="4" style="width:4px; font-size:0; line-height:0;">&nbsp;</td>
                  <td width="9" height="9" style="width:9px; height:9px; background:#0F766E; border-radius:2px; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:13px; color:#4a5a63;">
                <a href="https://clientlabs.io" style="color:#4a5a63; font-weight:600;">clientlabs.io</a>
                &nbsp;&middot;&nbsp;
                <a href="${privacyUrl}" style="color:#4a5a63;">Privacidad</a>
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->

        <!-- ════════ SMALL PRINT (fuera de la tarjeta) ════════ -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="width:600px; max-width:600px;">
          <tr>
            <td class="px" align="center" style="padding:26px 36px 0 36px;">
              <p style="margin:0 0 12px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:11px; line-height:17px; color:#93a39c;">
                *Condiciones del programa de referidos: el mes gratis se obtiene por cada persona invitada con tu enlace que se registre en la waitlist y confirme su email. ClientLabs BUSINESS de por vida requiere que 25 de tus invitados contraten un plan de pago tras el lanzamiento (no basta con unirse a la lista). Premios no acumulables con otras promociones y sujetos a verificaci&oacute;n anti&#8209;fraude. Detalles completos en <a href="https://clientlabs.io" style="color:#7d958a; text-decoration:underline;">clientlabs.io</a>.
              </p>
              <p style="margin:0 0 12px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:11px; line-height:17px; color:#93a39c;">
                Recibiste este email porque est&aacute;s en la lista de acceso anticipado de ClientLabs.
                &nbsp;<a href="${unsubscribeUrl}" style="color:#7d958a; text-decoration:underline;">Darme de baja</a>
              </p>
              <p style="margin:0 0 36px 0; font-family:'Inter',Helvetica,Arial,sans-serif; font-size:11px; line-height:17px; color:#a9b6b0;">
                &copy; 2026 ClientLabs &middot; <a href="mailto:hola@clientlabs.io" style="color:#a9b6b0;">hola@clientlabs.io</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}
