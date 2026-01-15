import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req:Request) {
  const { email, password } = await req.json()

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data:{ email, password: hash }
  })

  return NextResponse.json({ ok:true })
}