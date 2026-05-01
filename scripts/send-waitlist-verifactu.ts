/**
 * Script: Envío email Verifactu a toda la waitlist
 * Uso: npx tsx scripts/send-waitlist-verifactu.ts
 */
import * as dotenv from "dotenv"
import * as path from "path"
// Cargar .env.local antes que nada (donde está RESEND_API_KEY)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import { sendEmail } from "../lib/email"

const prisma = new PrismaClient()

const GREEN = "#1FA97A"
const NAVY = "#0B1F2A"

function verifactuEmail(): { subject: string; html: string } {
  return {
    subject: "ClientLabs ya cumple con Verifactu — Y para ti, GRATIS de por vida",
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ClientLabs — Verifactu</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 28px">
      <div style="display:inline-block;background:${NAVY};border-radius:12px;padding:12px 24px">
        <span style="font-size:22px;font-weight:800;color:${GREEN};letter-spacing:-0.5px">Client</span><span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">Labs</span>
      </div>
    </div>

    <!-- Card principal -->
    <div style="background:#fff;border-radius:16px;padding:40px 36px;box-shadow:0 2px 12px rgba(0,0,0,0.07)">

      <!-- Badge -->
      <div style="text-align:center;margin-bottom:20px">
        <span style="display:inline-block;background:#F0FDF9;color:${GREEN};font-size:12px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:6px 16px;border-radius:20px;border:1px solid #bbf0db">
          Novedad
        </span>
      </div>

      <!-- Título -->
      <h1 style="color:${NAVY};font-size:26px;font-weight:800;margin:0 0 10px;text-align:center;line-height:1.3">
        Ya cumplimos con Verifactu
      </h1>
      <p style="color:#6b7280;font-size:15px;text-align:center;margin:0 0 28px;line-height:1.6">
        La normativa de facturación electrónica de la AEAT,<br>integrada de forma nativa en ClientLabs.
      </p>

      <!-- Separador degradado -->
      <div style="height:2px;background:linear-gradient(90deg,transparent,${GREEN},transparent);margin:0 0 28px;border-radius:2px"></div>

      <!-- Intro -->
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 16px">
        Hola,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 20px">
        Tenemos una gran novedad: <strong>ClientLabs ya está certificado con Verifactu</strong>, el sistema de facturación verificable de la Agencia Tributaria española. Esto significa que todas las facturas que emitas desde ClientLabs ahora:
      </p>

      <!-- Lista de beneficios -->
      <div style="background:#F9FAFB;border-radius:12px;padding:20px 24px;margin:0 0 24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:7px 0;font-size:14px;color:${NAVY}"><span style="color:${GREEN};font-weight:700;margin-right:10px">✓</span>Se registran automáticamente en la AEAT en tiempo real</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:${NAVY};border-top:1px solid #e5e7eb"><span style="color:${GREEN};font-weight:700;margin-right:10px">✓</span>Incluyen código QR verificable de Hacienda en el PDF</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:${NAVY};border-top:1px solid #e5e7eb"><span style="color:${GREEN};font-weight:700;margin-right:10px">✓</span>Cumplen con la Ley Antifraude (Ley 11/2021)</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:${NAVY};border-top:1px solid #e5e7eb"><span style="color:${GREEN};font-weight:700;margin-right:10px">✓</span>Llevan hash encadenado e integridad garantizada</td></tr>
          <tr><td style="padding:7px 0;font-size:14px;color:${NAVY};border-top:1px solid #e5e7eb"><span style="color:${GREEN};font-weight:700;margin-right:10px">✓</span>Facturas completas (F1), simplificadas (F2) y rectificativas (R1-R5)</td></tr>
        </table>
      </div>

      <!-- Oferta especial waitlist -->
      <div style="background:${NAVY};border-radius:14px;padding:28px 28px 24px;margin:0 0 28px">
        <p style="color:${GREEN};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 10px;text-align:center">
          Exclusivo para ti · Waitlist
        </p>
        <h2 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 12px;text-align:center;line-height:1.3">
          Verifactu GRATIS<br>de por vida
        </h2>
        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 6px;text-align:center">
          Por estar en nuestra waitlist antes del lanzamiento,<br>
          tendrás Verifactu incluido en tu plan
        </p>
        <p style="color:#fff;font-size:15px;font-weight:700;text-align:center;margin:0 0 18px">
          sin coste adicional — para siempre.
        </p>
        <div style="border-top:1px solid #1e3a4a;padding-top:16px;text-align:center">
          <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6">
            Los nuevos usuarios registrados después del lanzamiento<br>
            pagarán un suplemento de 2 €/mes por Verifactu.
          </p>
        </div>
      </div>

      <!-- Texto cierre -->
      <p style="color:#374151;font-size:15px;line-height:1.75;margin:0 0 28px">
        Gracias por confiar en nosotros desde el principio. Estamos construyendo ClientLabs para que gestionar tu negocio sea más fácil, más seguro y 100 % legal.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:0 0 20px">
        <a href="https://clientlabs.io"
           style="display:inline-block;background:${GREEN};color:#fff;padding:15px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.2px">
          Ir a ClientLabs →
        </a>
      </div>

      <p style="color:${NAVY};font-size:14px;font-weight:700;text-align:center;margin:0">
        El equipo de ClientLabs
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:28px 0 8px;font-size:12px;color:#9ca3af">
      <p style="margin:0 0 6px">ClientLabs — Tu negocio, bajo control.</p>
      <p style="margin:0 0 16px">
        <a href="https://clientlabs.io" style="color:${GREEN};text-decoration:none;font-weight:600">clientlabs.io</a>
      </p>
      <p style="margin:0;font-size:11px;color:#d1d5db;line-height:1.6">
        Recibes este email porque te apuntaste a la waitlist de ClientLabs.<br>
        Para darte de baja responde a este email con "BAJA".
      </p>
    </div>

  </div>
</body>
</html>`,
  }
}

async function main() {
  console.log("════════════════════════════════════════════")
  console.log("   ENVÍO WAITLIST — VERIFACTU ANNOUNCEMENT  ")
  console.log("════════════════════════════════════════════\n")

  const fromAddr = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "ClientLabs <onboarding@resend.dev>"
  const hasKey = !!process.env.RESEND_API_KEY
  console.log(`FROM:  ${fromAddr}`)
  console.log(`RESEND: ${hasKey ? "configurado" : "NO configurado — modo simulación"}\n`)

  const subscribers = await prisma.waitlistEntry.findMany({
    select: { email: true, source: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  // Deduplicate just in case
  const unique = Array.from(new Map(subscribers.map(s => [s.email.toLowerCase(), s])).values())
  console.log(`Suscriptores únicos: ${unique.length}\n`)

  if (unique.length === 0) {
    console.log("Sin suscriptores — nada que enviar.")
    await prisma.$disconnect()
    return
  }

  const { subject, html } = verifactuEmail()
  let sent = 0
  let failed = 0

  for (const sub of unique) {
    try {
      const result = await sendEmail(sub.email, subject, html)
      if (result.success) {
        const tag = result.mock ? " [simulado]" : ""
        console.log(`  OK  ${sub.email}${tag}`)
        sent++
      } else {
        console.log(`  ERR ${sub.email} — ${JSON.stringify(result.error)}`)
        failed++
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log(`  ERR ${sub.email} — ${msg}`)
      failed++
    }
    // 600ms entre emails para respetar rate limits de Resend (100 req/s en free tier)
    await new Promise(r => setTimeout(r, 600))
  }

  console.log("\n════════════════════════════════════════════")
  console.log(`  ENVIADOS:  ${sent}`)
  console.log(`  FALLIDOS:  ${failed}`)
  console.log(`  TOTAL:     ${unique.length}`)
  console.log("════════════════════════════════════════════")

  await prisma.$disconnect()
}

main().catch(e => {
  console.error("ERROR FATAL:", e)
  process.exit(1)
})
