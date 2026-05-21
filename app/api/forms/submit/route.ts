export const maxDuration = 10

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const submitSchema = z.object({
  token: z.string().min(1),
  data: z.record(z.string(), z.string().max(2000)),
})

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const parsed = submitSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos no válidos" }, { status: 400 })
    }

    const { token, data } = parsed.data

    const form = await prisma.publicForm.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        active: true,
        fields: true,
        successMessage: true,
        redirectUrl: true,
      },
    })

    if (!form || !form.active) {
      return NextResponse.json({ error: "Formulario no disponible" }, { status: 404 })
    }

    const fields = form.fields as Array<{ key: string; label: string; type: string; required: boolean }>

    for (const field of fields) {
      if (field.required && !data[field.key]?.trim()) {
        return NextResponse.json({ error: `El campo "${field.label}" es obligatorio` }, { status: 400 })
      }
    }

    const nameField = fields.find(f => f.key === "nombre" || f.key === "name" || f.type === "text")
    const emailField = fields.find(f => f.key === "email" || f.type === "email")

    const leadName = (nameField ? data[nameField.key] : null) || "Contacto formulario"
    const leadEmail = (emailField ? data[emailField.key] : null) || null

    const lead = await prisma.lead.create({
      data: {
        userId: form.userId,
        name: leadName.slice(0, 200),
        email: leadEmail?.slice(0, 255) || null,
        source: "public_form",
        status: "NUEVO",
        additionalInfo: JSON.stringify(data),
      },
      select: { id: true, name: true, email: true },
    })

    await prisma.publicForm.update({
      where: { id: form.id },
      data: { submissions: { increment: 1 } },
    })

    const { runAutomation } = await import("@/lib/automations/engine")
    runAutomation(form.userId, "LEAD_NUEVO", {
      leadId: lead.id,
      nombre: lead.name ?? "",
      email: lead.email ?? "",
      fuente: "public_form",
    }).catch(() => {})

    return NextResponse.json({
      ok: true,
      message: form.successMessage,
      redirectUrl: form.redirectUrl,
    })
  } catch (err) {
    console.error("POST /api/forms/submit error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
