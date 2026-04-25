export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = passwordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })
  )

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  if (!user.password) {
    return NextResponse.json({ error: "Tu cuenta usa inicio de sesión social. No puedes cambiar la contraseña aquí." }, { status: 400 })
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  await safePrismaQuery(() =>
    prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })
  )

  return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
}
