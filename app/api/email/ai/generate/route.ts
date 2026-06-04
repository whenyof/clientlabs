export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { gateFeature } from "@/lib/api-gate"
import { z } from "zod"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BodySchema = z.object({
  type: z.enum(["subject", "content", "improve"]),
  prompt: z.string().min(1).max(1000),
  existingContent: z.string().optional(),
  tone: z.enum(["profesional", "cercano", "urgente", "informativo"]).default("profesional"),
  audience: z.string().optional(),
})

function buildPrompt(type: string, prompt: string, tone: string, existingContent?: string): string {
  if (type === "subject") {
    return `Genera 5 asuntos de email de marketing para: "${prompt}"
Tono: ${tone}
Reglas:
- Máximo 60 caracteres cada uno
- Incluye emojis apropiados
- Formato: una línea por asunto, sin numeración ni viñetas, solo el texto del asunto
- En español
- Deben invitar a abrir el email`
  }

  if (type === "content") {
    return `Escribe el contenido HTML de un email de marketing para: "${prompt}"
Tono: ${tone}
Reglas:
- Empieza con "Hola {{nombre}},"
- Máximo 300 palabras
- Párrafos cortos (2-3 líneas)
- Un CTA claro al final como <a href="#">Ver más</a>
- En español
- Usa únicamente HTML básico: <p>, <strong>, <em>, <a href="#">, <br>
- No incluyas <html>, <head>, <body> ni estilos inline`
  }

  // improve
  return `Mejora este email de marketing:
---
${existingContent ?? ""}
---
Instrucción: ${prompt}
Reglas:
- Mantén el mismo tono pero mejora claridad y CTA
- Responde solo con el HTML mejorado, sin explicaciones
- Usa únicamente HTML básico: <p>, <strong>, <em>, <a href="#">, <br>`
}

export async function POST(request: NextRequest) {
  const gate = await gateFeature("ai")
  if (!gate.allowed) return gate.error!

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { type, prompt, tone, existingContent } = parsed.data

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: buildPrompt(type, prompt, tone, existingContent) }],
    })

    const text = message.content[0]?.type === "text" ? message.content[0].text.trim() : ""

    if (type === "subject") {
      const subjects = text.split("\n").map(l => l.trim()).filter(l => l.length > 0 && l.length <= 80).slice(0, 5)
      return NextResponse.json({ subjects })
    }

    return NextResponse.json({ content: text })
  } catch (err) {
    console.error("[api/email/ai/generate] error:", err)
    return NextResponse.json({ error: "Error generando contenido" }, { status: 500 })
  }
}
