/**
 * scripts/test-emails.ts
 * Envía los 11 emails de ClientLabs a una dirección de test.
 *
 * Ejecutar con:
 *   npx tsx scripts/test-emails.ts
 *
 * Requiere RESEND_API_KEY en .env.local (o .env).
 * Sin API key corre en modo mock: loguea en consola sin enviar.
 */

import * as dotenv from "dotenv"
import { fileURLToPath } from "url"
import * as path from "path"

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Cargar .env.local primero, luego .env como fallback
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import { sendEmail } from "../lib/email"
import {
  welcomeEmail,
  verificationEmail,
  trialExpiringEmail,
  newLeadEmail,
  invoiceSentEmail,
  dailyTasksEmail,
  invoiceDueEmail,
  teamInviteEmail,
  passwordResetEmail,
  leadConvertedEmail,
  planLimitEmail,
} from "../lib/email-templates"

const TEST_EMAIL = "iyanrimada@gmail.com"
const TEST_NAME  = "Iyan"
const MOCK_MODE  = !process.env.RESEND_API_KEY

// ─── Definición de los 11 emails de test ────────────────────────────────────

const emails: Array<{ name: string; subject: string; html: string }> = [
  {
    name: "1. Bienvenida",
    subject: "¡Bienvenido/a a ClientLabs! 🎉",
    html: welcomeEmail(TEST_NAME),
  },
  {
    name: "2. Verificación de email",
    subject: "Verifica tu email — ClientLabs",
    html: verificationEmail(TEST_NAME, "https://clientlabs.io/verify?token=test123"),
  },
  {
    name: "3. Trial expirando (3 días)",
    subject: "Tu periodo de prueba termina en 3 días — ClientLabs",
    html: trialExpiringEmail(TEST_NAME, 3),
  },
  {
    name: "4. Nuevo lead capturado",
    subject: "🎯 Nuevo lead: María García — ClientLabs",
    html: newLeadEmail(TEST_NAME, "María García", "maria@ejemplo.com", "Formulario web"),
  },
  {
    name: "5. Factura enviada al cliente (SIN branding CL)",
    subject: "Factura F-2026-0042 de Estudio Iyan",
    html: invoiceSentEmail("Carlos López", "F-2026-0042", "1.450,00", "Estudio Iyan"),
  },
  {
    name: "6. Resumen diario de tareas",
    subject: "📋 Tus tareas para mañana (4) — ClientLabs",
    html: dailyTasksEmail(TEST_NAME, [
      { title: "Reunión con proveedor Acme",        time: "09:00", type: "meeting",  priority: "HIGH"   },
      { title: "Llamar a María García (lead)",       time: "11:30", type: "call",     priority: "URGENT" },
      { title: "Preparar presupuesto Proyecto X",   time: "14:00", type: "task",     priority: "MEDIUM" },
      { title: "Revisar facturas pendientes",                       type: "task",     priority: "LOW"    },
    ]),
  },
  {
    name: "7. Factura próxima a vencer",
    subject: "⚠️ Factura F-2026-0038 vence pronto — ClientLabs",
    html: invoiceDueEmail(TEST_NAME, "F-2026-0038", "Restaurante El Marinero", "28 de abril de 2026", "890,00"),
  },
  {
    name: "8. Invitación al equipo",
    subject: "Iyan te ha invitado a Estudio Iyan — ClientLabs",
    html: teamInviteEmail(TEST_NAME, "Estudio Iyan", "Admin", "https://clientlabs.io/invite?token=test456"),
  },
  {
    name: "9. Reseteo de contraseña",
    subject: "Restablecer contraseña — ClientLabs",
    html: passwordResetEmail(TEST_NAME, "https://clientlabs.io/reset?token=test789"),
  },
  {
    name: "10. Lead convertido a cliente",
    subject: "🎉 Lead convertido: María García — ClientLabs",
    html: leadConvertedEmail(TEST_NAME, "María García"),
  },
  {
    name: "11. Límite de plan alcanzado",
    subject: "Has alcanzado el límite de leads — ClientLabs",
    html: planLimitEmail(TEST_NAME, "leads", 48, 50),
  },
]

// ─── Envío ───────────────────────────────────────────────────────────────────

async function run() {
  console.log("")
  console.log("╔══════════════════════════════════════════════════╗")
  console.log("║       ClientLabs — Test de emails                ║")
  console.log("╚══════════════════════════════════════════════════╝")
  console.log("")

  if (MOCK_MODE) {
    console.log("⚠️  MODO MOCK — RESEND_API_KEY no encontrada en .env.local")
    console.log("   Los emails se loguean en consola pero NO se envían.")
    console.log("   Añade RESEND_API_KEY a .env.local para envío real.")
    console.log("")
  } else {
    console.log(`✅ Resend configurado — enviando a ${TEST_EMAIL}`)
    console.log(`   From: ${process.env.RESEND_FROM_EMAIL || "ClientLabs <onboarding@resend.dev>"}`)
    console.log("")
  }

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const email of emails) {
    process.stdout.write(`  📧 ${email.name} ... `)

    try {
      const result = await sendEmail(TEST_EMAIL, email.subject, email.html)

      if (result.success) {
        const tag = result.mock ? "🟡 mock" : `✅ id:${result.id}`
        console.log(tag)
        sent++
      } else {
        console.log(`❌ falló`)
        errors.push(`${email.name}: ${JSON.stringify(result.error)}`)
        failed++
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log(`❌ excepción`)
      errors.push(`${email.name}: ${msg}`)
      failed++
    }

    // Pausa entre envíos para no saturar rate limits
    await new Promise(r => setTimeout(r, 800))
  }

  console.log("")
  console.log("──────────────────────────────────────────────────")
  console.log(`📊  Total: ${emails.length}  |  Enviados: ${sent}  |  Fallidos: ${failed}`)

  if (errors.length) {
    console.log("")
    console.log("❌ Errores:")
    errors.forEach(e => console.log("   •", e))
  }

  if (MOCK_MODE) {
    console.log("")
    console.log("──────────────────────────────────────────────────")
    console.log("Para enviar emails reales:")
    console.log("  1. Crea cuenta en https://resend.com (gratis hasta 100/día)")
    console.log("  2. Genera una API key")
    console.log("  3. Añade a .env.local:")
    console.log("     RESEND_API_KEY=re_xxxxxxxxxxxx")
    console.log("     RESEND_FROM_EMAIL=ClientLabs <onboarding@resend.dev>")
    console.log("  4. Ejecuta de nuevo: npx tsx scripts/test-emails.ts")
  }

  console.log("")
}

run().catch(console.error)
