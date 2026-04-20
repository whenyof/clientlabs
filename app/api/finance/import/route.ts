export const maxDuration = 30

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const tipo = (formData.get("tipo") as string) || "factura"
    const saleId = (formData.get("saleId") as string | null) || null
    const providerOrderId = (formData.get("providerOrderId") as string | null) || null
    const metaRaw = formData.get("meta") as string | null
    const meta = metaRaw ? JSON.parse(metaRaw) : {}

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    const documento = await prisma.documentoImportado.create({
      data: {
        userId: session.user.id,
        tipo,
        saleId: saleId || null,
        providerOrderId: providerOrderId || null,
        numero: meta.numero || null,
        concepto: meta.concepto || null,
        importe: meta.importe ? parseFloat(meta.importe) : null,
        fecha: meta.fecha ? new Date(meta.fecha) : new Date(),
        clienteProveedor: meta.clienteProveedor || null,
        estadoPago: meta.estadoPago || "pendiente",
        nombreArchivo: file.name,
        tamanoArchivo: file.size,
        mimeType: file.type || null,
      },
    })

    return NextResponse.json(documento)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    console.error("Import error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
