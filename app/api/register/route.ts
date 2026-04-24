export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
const registerSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email("Email no válido").max(255),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "Contraseña demasiado larga"),
})

export async function POST(req: NextRequest) {
  // Rate limit — solo si Upstash está configurado (evita timeout en local sin Redis)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous"
    try {
      const { Ratelimit } = await import("@upstash/ratelimit")
      const { Redis } = await import("@upstash/redis")
      const rl = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "clientlabs:register",
      })
      const { success } = await rl.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera un momento antes de intentarlo de nuevo." },
          { status: 429 }
        )
      }
    } catch {
      // Fail-open si Redis cae
    }
  }

  // Validar y sanitizar inputs antes de cualquier operación
  let parsed: z.infer<typeof registerSchema>
  try {
    const raw = await req.json()
    const result = registerSchema.safeParse(raw)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    parsed = result.data
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 })
  }

  const { name, email, password } = parsed
  const normalizedEmail = email.toLowerCase().trim()

  const exists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  // Devolver la misma respuesta tanto si el email existe como si no (previene user enumeration)
  if (exists) {
    return NextResponse.json({ success: true })
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name: name ?? null,
      email: normalizedEmail,
      password: hashed,
      role: "USER",
      plan: "FREE",
      onboardingCompleted: false,
      selectedSector: null,
    },
  })

  return NextResponse.json({ success: true })
}
