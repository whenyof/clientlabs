export const maxDuration = 10

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params
  const form = await prisma.publicForm.findUnique({
    where: { token: params.token },
    select: {
      nombre: true,
      descripcion: true,
      fields: true,
      successMessage: true,
      active: true,
    },
  })

  if (!form) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json(form)
}
