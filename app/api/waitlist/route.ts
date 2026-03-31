import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const count = await prisma.waitlistEntry.count()
  return NextResponse.json({ count })
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está en lista", alreadyIn: true }, { status: 409 })
    }

    await prisma.waitlistEntry.create({
      data: { email, source: source ?? "whitelist" },
    })

    const position = await prisma.waitlistEntry.count()

    try {
      await sendWaitlistConfirmation(email)
    } catch (e) {
      console.error("Waitlist email error:", e)
    }

    return NextResponse.json({ success: true, position })
  } catch (e) {
    console.error("POST /api/waitlist:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

async function sendWaitlistConfirmation(email: string) {
  if (!process.env.RESEND_API_KEY) return

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ClientLabs <hola@clientlabs.io>",
      to: email,
      subject: "Ya estás dentro — Acceso anticipado a ClientLabs",
      html: `
        <div style="font-family:system-ui;max-width:520px;margin:0 auto;padding:40px 20px">
          <div style="background:#0B1F2A;border-radius:16px;padding:40px;text-align:center;margin-bottom:24px">
            <h1 style="color:white;font-size:28px;margin:0 0 8px">Ya estás dentro.</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0">Gracias por apuntarte a ClientLabs</p>
          </div>
          <h2 style="font-size:18px;color:#0B1F2A;margin:0 0 16px">Esto es lo que tienes reservado:</h2>
          <div style="background:#F8FAFB;border-radius:12px;padding:20px;margin-bottom:20px">
            <p style="margin:0 0 10px;font-size:14px;color:#475569">✅ <strong>1 mes completamente gratis</strong></p>
            <p style="margin:0 0 10px;font-size:14px;color:#475569">✅ <strong>Precio bloqueado</strong> para siempre</p>
            <p style="margin:0;font-size:14px;color:#475569">✅ <strong>Acceso antes</strong> que el resto</p>
          </div>
          <p style="font-size:14px;color:#64748B;line-height:1.6">
            Te avisaremos cuando abramos las puertas. Mientras tanto, escríbenos a
            <a href="mailto:hola@clientlabs.io" style="color:#1FA97A">hola@clientlabs.io</a>
          </p>
          <p style="font-size:13px;color:#94A3B8;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:20px">
            ClientLabs · clientlabs.io
          </p>
        </div>
      `,
    }),
  })
}
