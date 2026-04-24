export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runAutomation } from "@/lib/automations/engine"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("[cron/check-automations] CRON_SECRET not configured — blocking endpoint")
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahora = new Date()
  let procesadas = 0
  const errores: string[] = []

  try {
    const usuarios = await prisma.user.findMany({ select: { id: true } })

    for (const { id: userId } of usuarios) {

      // ─── 1. LEAD_SIN_CONTACTAR ───────────────────────────────────────────────
      // Leads con leadStatus=NEW creados hace más de 48h
      try {
        const hace48h = new Date(ahora)
        hace48h.setHours(hace48h.getHours() - 48)

        const leadsNoContactados = await prisma.lead.findMany({
          where: {
            userId,
            leadStatus: "NEW",
            createdAt: { lte: hace48h },
          },
          select: { id: true, name: true, email: true, createdAt: true },
          take: 10,
        }).catch(() => [])

        for (const lead of leadsNoContactados) {
          await runAutomation(userId, "LEAD_SIN_CONTACTAR", {
            "lead.nombre": lead.name ?? "Sin nombre",
            "lead.email": lead.email ?? "",
            "lead.fecha": lead.createdAt.toLocaleDateString("es-ES"),
            leadId: lead.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`LEAD_SIN_CONTACTAR: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 2. LEAD_STALLED ─────────────────────────────────────────────────────
      // Leads sin actividad en X días (por defecto 14)
      try {
        const auto = await prisma.automatizacion.findUnique({
          where: { userId_tipo: { userId, tipo: "LEAD_STALLED" } },
        })
        const dias = ((auto?.config as Record<string, unknown>)?.dias as number) ?? 14

        const fechaLimite = new Date(ahora)
        fechaLimite.setDate(fechaLimite.getDate() - dias)

        const leadsEstancados = await prisma.lead.findMany({
          where: {
            userId,
            leadStatus: { notIn: ["CONVERTED", "LOST", "STALLED"] },
            lastActionAt: { lte: fechaLimite },
          },
          select: { id: true, name: true, email: true, leadStatus: true, lastActionAt: true },
          take: 10,
        }).catch(() => [])

        for (const lead of leadsEstancados) {
          await runAutomation(userId, "LEAD_STALLED", {
            "lead.nombre": lead.name ?? "Sin nombre",
            "lead.email": lead.email ?? "",
            "lead.estado": lead.leadStatus,
            "lead.ultimoContacto": lead.lastActionAt?.toLocaleDateString("es-ES") ?? "—",
            leadId: lead.id,
          })
          // Marcar como STALLED para no re-disparar mañana
          await prisma.lead
            .update({ where: { id: lead.id }, data: { leadStatus: "STALLED", status: "STALLED" } })
            .catch(() => {})
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`LEAD_STALLED: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 3. FACTURA_VENCIDA_AVISO ─────────────────────────────────────────────
      // Email al autónomo cuando una factura lleva X días vencida
      try {
        const auto = await prisma.automatizacion.findUnique({
          where: { userId_tipo: { userId, tipo: "FACTURA_VENCIDA_AVISO" } },
        })
        const dias = ((auto?.config as Record<string, unknown>)?.dias as number) ?? 3

        const limite = new Date(ahora)
        limite.setDate(limite.getDate() - dias)

        const facturas = await prisma.invoice.findMany({
          where: {
            userId,
            status: { in: ["SENT", "OVERDUE", "PARTIAL"] },
            dueDate: { lte: limite },
          },
          select: {
            id: true,
            number: true,
            total: true,
            dueDate: true,
            Client: { select: { name: true } },
          },
          take: 10,
        }).catch(() => [])

        for (const f of facturas) {
          await runAutomation(userId, "FACTURA_VENCIDA_AVISO", {
            "cliente.nombre": f.Client?.name ?? "Cliente",
            "factura.numero": f.number,
            "factura.total": String(f.total),
            "factura.vencimiento": f.dueDate.toLocaleDateString("es-ES"),
            "factura.diasRetraso": String(dias),
            facturaId: f.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`FACTURA_VENCIDA_AVISO: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 4. FACTURA_VENCIDA ───────────────────────────────────────────────────
      // Email al cliente cuando su factura lleva X días vencida
      try {
        const auto = await prisma.automatizacion.findUnique({
          where: { userId_tipo: { userId, tipo: "FACTURA_VENCIDA" } },
        })
        const dias = ((auto?.config as Record<string, unknown>)?.dias as number) ?? 3

        const limite = new Date(ahora)
        limite.setDate(limite.getDate() - dias)

        const facturas = await prisma.invoice.findMany({
          where: {
            userId,
            status: { in: ["SENT", "OVERDUE", "PARTIAL"] },
            dueDate: { lte: limite },
          },
          select: {
            id: true,
            number: true,
            total: true,
            dueDate: true,
            Client: { select: { name: true, email: true } },
          },
          take: 10,
        }).catch(() => [])

        for (const f of facturas) {
          const clientEmail = f.Client?.email
          if (!clientEmail) continue

          await runAutomation(userId, "FACTURA_VENCIDA", {
            "cliente.nombre": f.Client?.name ?? "Cliente",
            "cliente.email": clientEmail,
            "factura.numero": f.number,
            "factura.total": String(f.total),
            "factura.vencimiento": f.dueDate.toLocaleDateString("es-ES"),
            facturaId: f.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`FACTURA_VENCIDA: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 5. PRESUPUESTO_EXPIRA_AVISO ──────────────────────────────────────────
      // Email al autónomo cuando un presupuesto caduca en X días
      try {
        const auto = await prisma.automatizacion.findUnique({
          where: { userId_tipo: { userId, tipo: "PRESUPUESTO_EXPIRA_AVISO" } },
        })
        const dias = ((auto?.config as Record<string, unknown>)?.dias as number) ?? 3

        const enXDias = new Date(ahora)
        enXDias.setDate(enXDias.getDate() + dias)

        const quotes = await prisma.quote.findMany({
          where: {
            userId,
            status: "SENT",
            validUntil: { gte: ahora, lte: enXDias },
            deletedAt: null,
          },
          select: {
            id: true,
            number: true,
            total: true,
            validUntil: true,
            client: { select: { name: true } },
          },
          take: 10,
        }).catch(() => [])

        for (const q of quotes) {
          await runAutomation(userId, "PRESUPUESTO_EXPIRA_AVISO", {
            "cliente.nombre": q.client?.name ?? "Cliente",
            "presupuesto.numero": q.number,
            "presupuesto.total": String(q.total),
            "presupuesto.expira": q.validUntil.toLocaleDateString("es-ES"),
            "presupuesto.dias": String(dias),
            facturaId: q.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`PRESUPUESTO_EXPIRA_AVISO: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 6. PRESUPUESTO_EXPIRA ────────────────────────────────────────────────
      // Email al cliente cuando su presupuesto caduca en X días
      try {
        const auto = await prisma.automatizacion.findUnique({
          where: { userId_tipo: { userId, tipo: "PRESUPUESTO_EXPIRA" } },
        })
        const dias = ((auto?.config as Record<string, unknown>)?.dias as number) ?? 3

        const enXDias = new Date(ahora)
        enXDias.setDate(enXDias.getDate() + dias)

        const quotes = await prisma.quote.findMany({
          where: {
            userId,
            status: "SENT",
            validUntil: { gte: ahora, lte: enXDias },
            deletedAt: null,
          },
          select: {
            id: true,
            number: true,
            total: true,
            validUntil: true,
            client: { select: { name: true, email: true } },
          },
          take: 10,
        }).catch(() => [])

        for (const q of quotes) {
          const clientEmail = q.client?.email
          if (!clientEmail) continue

          await runAutomation(userId, "PRESUPUESTO_EXPIRA", {
            "cliente.nombre": q.client?.name ?? "Cliente",
            "cliente.email": clientEmail,
            "presupuesto.numero": q.number,
            "presupuesto.expira": q.validUntil.toLocaleDateString("es-ES"),
            facturaId: q.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`PRESUPUESTO_EXPIRA: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 7. SEGUIMIENTO_DIA_3 ─────────────────────────────────────────────────
      // Leads que llevan exactamente 3 días sin respuesta
      try {
        const hace3dias = new Date(ahora)
        hace3dias.setDate(hace3dias.getDate() - 3)
        hace3dias.setHours(0, 0, 0, 0)
        const hace2dias = new Date(ahora)
        hace2dias.setDate(hace2dias.getDate() - 2)
        hace2dias.setHours(0, 0, 0, 0)

        const leads = await prisma.lead.findMany({
          where: {
            userId,
            leadStatus: { notIn: ["CONVERTED", "LOST", "CONTACTED"] },
            createdAt: { gte: hace3dias, lt: hace2dias },
          },
          select: { id: true, name: true, email: true },
          take: 10,
        }).catch(() => [])

        for (const lead of leads) {
          if (!lead.email) continue
          await runAutomation(userId, "SEGUIMIENTO_DIA_3", {
            "lead.nombre": lead.name ?? "Sin nombre",
            "lead.email": lead.email,
            leadId: lead.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`SEGUIMIENTO_DIA_3: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 8. SEGUIMIENTO_DIA_7 ─────────────────────────────────────────────────
      // Último intento a los 7 días sin respuesta
      try {
        const hace7dias = new Date(ahora)
        hace7dias.setDate(hace7dias.getDate() - 7)
        hace7dias.setHours(0, 0, 0, 0)
        const hace6dias = new Date(ahora)
        hace6dias.setDate(hace6dias.getDate() - 6)
        hace6dias.setHours(0, 0, 0, 0)

        const leads = await prisma.lead.findMany({
          where: {
            userId,
            leadStatus: { notIn: ["CONVERTED", "LOST", "CONTACTED"] },
            createdAt: { gte: hace7dias, lt: hace6dias },
          },
          select: { id: true, name: true, email: true },
          take: 10,
        }).catch(() => [])

        for (const lead of leads) {
          if (!lead.email) continue
          await runAutomation(userId, "SEGUIMIENTO_DIA_7", {
            "lead.nombre": lead.name ?? "Sin nombre",
            "lead.email": lead.email,
            leadId: lead.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`SEGUIMIENTO_DIA_7: ${e instanceof Error ? e.message : String(e)}`)
      }

      // ─── 9. TAREA_VENCIDA ─────────────────────────────────────────────────────
      // Tareas que vencieron ayer y siguen sin completar
      try {
        const ayer = new Date(ahora)
        ayer.setDate(ayer.getDate() - 1)
        ayer.setHours(0, 0, 0, 0)
        const hoy = new Date(ahora)
        hoy.setHours(0, 0, 0, 0)

        const tareas = await prisma.task.findMany({
          where: {
            userId,
            status: { notIn: ["DONE", "CANCELLED"] },
            dueDate: { gte: ayer, lt: hoy },
          },
          select: { id: true, title: true, dueDate: true },
          take: 10,
        }).catch(() => [])

        for (const tarea of tareas) {
          await runAutomation(userId, "TAREA_VENCIDA", {
            "tarea.nombre": tarea.title,
            "tarea.fechaLimite": tarea.dueDate?.toLocaleDateString("es-ES") ?? "—",
            dias: "1",
            tareaId: tarea.id,
          })
          procesadas++
        }
      } catch (e: unknown) {
        errores.push(`TAREA_VENCIDA: ${e instanceof Error ? e.message : String(e)}`)
      }

      // CUMPLEANOS_CLIENTE omitido — Client no tiene campo birthDate en el schema actual

    } // fin loop usuarios

    return NextResponse.json({
      ok: true,
      procesadas,
      ...(errores.length > 0 ? { errores } : {}),
      timestamp: ahora.toISOString(),
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    )
  }
}
