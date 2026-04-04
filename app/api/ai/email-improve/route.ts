export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPTS: Record<string, string> = {
  improve:
    "Eres un asistente experto en comunicación comercial. Mejora el email que te proporcionen: hazlo más profesional, persuasivo y claro. Mantén el mismo idioma que el email original. Responde únicamente con un JSON con las claves 'subject' y 'message'.",
  shorter:
    "Eres un asistente experto en comunicación comercial. Haz el email más corto y directo, eliminando lo que no aporte valor. Mantén el mismo idioma que el email original. Responde únicamente con un JSON con las claves 'subject' y 'message'.",
  tone:
    "Eres un asistente experto en comunicación comercial. Cambia el tono del email a uno más formal y profesional. Mantén el mismo idioma que el email original. Responde únicamente con un JSON con las claves 'subject' y 'message'.",
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { subject?: string; message?: string; action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { subject, message, action } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  if (!action || !SYSTEM_PROMPTS[action]) {
    return NextResponse.json({ error: "action must be improve | shorter | tone" }, { status: 400 })
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[action],
      messages: [
        {
          role: "user",
          content: `Asunto: ${subject ?? ""}\n\nMensaje:\n${message}`,
        },
      ],
    })

    const text = response.content[0]?.type === "text" ? response.content[0].text : ""

    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as { subject?: string; message?: string }
    return NextResponse.json({
      subject: parsed.subject ?? subject ?? "",
      message: parsed.message ?? message,
    })
  } catch (err) {
    console.error("AI email-improve error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
