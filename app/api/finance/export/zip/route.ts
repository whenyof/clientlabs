export const maxDuration = 25
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

function parsePeriod(period: string): { from: Date; to: Date } | null {
  const match = period.match(/^(\d{4})-Q([1-4])$/)
  if (!match) return null
  const year = parseInt(match[1], 10)
  const quarter = parseInt(match[2], 10)
  const startMonth = (quarter - 1) * 3
  const from = new Date(year, startMonth, 1, 0, 0, 0, 0)
  const to = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  return { from, to }
}

function escapeCSV(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawPeriod = searchParams.get("period") || getCurrentQuarter()
  const parsed = parsePeriod(rawPeriod)

  if (!parsed) {
    return NextResponse.json({ error: "Formato de período inválido. Usa YYYY-QN (ej. 2026-Q1)" }, { status: 400 })
  }

  const { from, to } = parsed
  const userId = session.user.id

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        issueDate: { gte: from, lte: to },
        status: { not: "DRAFT" },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        total: true,
        status: true,
        clientId: true,
      },
      orderBy: { issueDate: "asc" },
    })

    const totalImporte = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
    const totalCobrado = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0)
    const totalPendiente = invoices
      .filter((inv) => inv.status !== "PAID")
      .reduce((sum, inv) => sum + Number(inv.total), 0)

    const csvHeaders = ["Número", "Fecha", "Total", "Estado", "ClienteId"]
    const csvRows = invoices.map((inv) => [
      escapeCSV(inv.number),
      escapeCSV(new Date(inv.issueDate).toLocaleDateString("es-ES")),
      escapeCSV(Number(inv.total).toFixed(2)),
      escapeCSV(inv.status),
      escapeCSV(inv.clientId ?? ""),
    ])
    const csvContent = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n")

    const summary = {
      period: rawPeriod,
      totalFacturas: invoices.length,
      totalImporte: parseFloat(totalImporte.toFixed(2)),
      totalCobrado: parseFloat(totalCobrado.toFixed(2)),
      totalPendiente: parseFloat(totalPendiente.toFixed(2)),
    }
    const jsonContent = JSON.stringify(summary, null, 2)

    // No jszip available — build a minimal ZIP manually using Buffer
    // ZIP local file header format (PKZIP spec)
    function makeZip(files: Array<{ name: string; content: string }>): Buffer {
      const localHeaders: Buffer[] = []
      const centralDir: Buffer[] = []
      let offset = 0

      for (const file of files) {
        const nameBytes = Buffer.from(file.name, "utf8")
        const dataBytes = Buffer.from(file.content, "utf8")
        const crc = crc32(dataBytes)
        const size = dataBytes.length

        // Local file header
        const local = Buffer.alloc(30 + nameBytes.length)
        local.writeUInt32LE(0x04034b50, 0) // signature
        local.writeUInt16LE(20, 4)          // version needed
        local.writeUInt16LE(0, 6)           // flags
        local.writeUInt16LE(0, 8)           // compression (stored)
        local.writeUInt16LE(0, 10)          // mod time
        local.writeUInt16LE(0, 12)          // mod date
        local.writeUInt32LE(crc, 14)        // crc32
        local.writeUInt32LE(size, 18)       // compressed size
        local.writeUInt32LE(size, 22)       // uncompressed size
        local.writeUInt16LE(nameBytes.length, 26) // filename length
        local.writeUInt16LE(0, 28)          // extra field length
        nameBytes.copy(local, 30)

        // Central directory entry
        const central = Buffer.alloc(46 + nameBytes.length)
        central.writeUInt32LE(0x02014b50, 0) // signature
        central.writeUInt16LE(20, 4)          // version made
        central.writeUInt16LE(20, 6)          // version needed
        central.writeUInt16LE(0, 8)           // flags
        central.writeUInt16LE(0, 10)          // compression
        central.writeUInt16LE(0, 12)          // mod time
        central.writeUInt16LE(0, 14)          // mod date
        central.writeUInt32LE(crc, 16)        // crc32
        central.writeUInt32LE(size, 20)       // compressed size
        central.writeUInt32LE(size, 24)       // uncompressed size
        central.writeUInt16LE(nameBytes.length, 28) // filename length
        central.writeUInt16LE(0, 30)          // extra field length
        central.writeUInt16LE(0, 32)          // comment length
        central.writeUInt16LE(0, 34)          // disk start
        central.writeUInt16LE(0, 36)          // internal attr
        central.writeUInt32LE(0, 38)          // external attr
        central.writeUInt32LE(offset, 42)     // local header offset
        nameBytes.copy(central, 46)

        localHeaders.push(local, dataBytes)
        centralDir.push(central)
        offset += local.length + dataBytes.length
      }

      const centralDirBuf = Buffer.concat(centralDir)
      const centralDirOffset = offset
      const centralDirSize = centralDirBuf.length

      // End of central directory
      const eocd = Buffer.alloc(22)
      eocd.writeUInt32LE(0x06054b50, 0) // signature
      eocd.writeUInt16LE(0, 4)           // disk number
      eocd.writeUInt16LE(0, 6)           // start disk
      eocd.writeUInt16LE(files.length, 8)  // entries on disk
      eocd.writeUInt16LE(files.length, 10) // total entries
      eocd.writeUInt32LE(centralDirSize, 12)   // central dir size
      eocd.writeUInt32LE(centralDirOffset, 16) // central dir offset
      eocd.writeUInt16LE(0, 20)          // comment length

      return Buffer.concat([...localHeaders, centralDirBuf, eocd])
    }

    function crc32(buf: Buffer): number {
      const table = makeCRCTable()
      let crc = 0xffffffff
      for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
      }
      return (crc ^ 0xffffffff) >>> 0
    }

    function makeCRCTable(): Uint32Array {
      const table = new Uint32Array(256)
      for (let i = 0; i < 256; i++) {
        let c = i
        for (let j = 0; j < 8; j++) {
          c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        }
        table[i] = c
      }
      return table
    }

    const zipBuffer = makeZip([
      { name: `facturas-${rawPeriod}.csv`, content: csvContent },
      { name: `resumen-${rawPeriod}.json`, content: jsonContent },
    ])

    const filename = `facturas-${rawPeriod}.zip`

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    })
  } catch (err) {
    console.error("[export/zip] Error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
