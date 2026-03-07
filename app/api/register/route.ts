import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  const exists = await prisma.user.findUnique({
    where: { email },
  })

  if (exists)
    return NextResponse.json(
      { error: "User exists" },
      { status: 400 }
    )

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name: name ?? null,
      email,
      password: hashed,
      role: "USER",
      plan: "FREE",
      onboardingCompleted: false,
      selectedSector: null,
    },
  })

  return NextResponse.json({ success: true })
}