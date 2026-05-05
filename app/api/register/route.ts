export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email-service"

const registerSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email("Email no válido").max(255),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "Contraseña demasiado larga"),
  ref: z.string().max(30).optional(),
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

  // Validar y sanitizar inputs
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

  const { name, email, password, ref: refCode } = parsed
  const normalizedEmail = email.toLowerCase().trim()

  // Generate unique referral code for the new user
  const firstName = name?.split(" ")[0]?.toUpperCase().slice(0, 8) ?? "REF"
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  const newReferralCode = `CL-${firstName}-${rand}`

  try {
    // safePrismaQuery reintenta en P1001 (Neon cold start)
    const exists = await safePrismaQuery(
      () => prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
      3,   // hasta 3 reintentos
      1000 // 1s entre reintentos (Neon tarda ~5-10s en despertar)
    )

    // Misma respuesta tanto si existe como si no (previene user enumeration)
    if (exists) return NextResponse.json({ success: true })

    const hashed = await bcrypt.hash(password, 10)

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const newUser = await safePrismaQuery(
      () => prisma.user.create({
        data: {
          name: name ?? null,
          email: normalizedEmail,
          password: hashed,
          role: "USER",
          plan: "TRIAL",
          isTrial: true,
          planExpiresAt: trialEndsAt,
          onboardingCompleted: false,
          selectedSector: null,
          referralCode: newReferralCode,
          referredByCode: refCode ?? null,
        },
      }),
      2,
      500
    )

    // Create workspace for the new user
    await safePrismaQuery(() =>
      prisma.workspace.create({
        data: {
          name: `Workspace de ${name ?? normalizedEmail}`,
          ownerId: newUser.id,
          members: {
            create: { userId: newUser.id, role: "OWNER" },
          },
        },
      })
    )

    // Create referral record if referred by someone
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode }, select: { id: true } })
      if (referrer) {
        await safePrismaQuery(() =>
          prisma.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: newUser.id,
              referredEmail: normalizedEmail,
              code: refCode,
              status: "registered",
            },
          })
        ).catch(() => null)
      }
    }

    // Send welcome email non-blocking
    sendWelcomeEmail(normalizedEmail, name ?? "Usuario").catch(console.error)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code ?? ""
    const msg = String((err as { message?: string })?.message ?? "")
    const isConnection = code === "P1001" || msg.includes("Can't reach database")

    if (isConnection) {
      return NextResponse.json(
        { error: "La base de datos está arrancando, espera unos segundos e inténtalo de nuevo." },
        { status: 503 }
      )
    }
    console.error("[Register] Error:", err)
    return NextResponse.json({ error: "Error interno. Inténtalo de nuevo." }, { status: 500 })
  }
}
