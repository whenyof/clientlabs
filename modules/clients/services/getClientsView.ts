import "server-only"
import { prisma } from "@/lib/prisma"
import { deriveClientStatus, isClientForgotten } from "@/lib/logic/client-status"

/**
 * Datos de la vista de Clientes calculados EN SERVER.
 *
 * Por qué en server y no SQL puro: el estado derivado (deriveClientStatus +
 * isClientForgotten) parsea `notes` buscando recordatorios futuros, algo no
 * expresable en SQL sin cambiar los números. Para que los KPIs/contadores sean
 * idénticos a los de hoy, derivamos en JS sobre el set completo con columnas
 * MÍNIMAS (no se envían las filas al navegador, solo los agregados + la página).
 *
 * Agregados sobre TODO el set del usuario (sin filtros), igual que hoy.
 * Tabla: set completo derivado → filtros (status/búsqueda/segmento) → orden →
 * página (offset). Esto además arregla el bug de >100 (hoy tabla y chips mrr/new
 * se calculaban solo sobre las primeras 100 filas).
 */

export type ClientsViewParams = {
  status?: string // effectiveStatus: all | ACTIVE | INACTIVE | VIP | FOLLOW_UP
  search?: string
  segment?: string // all | vip | healthy | risk | churn | mrr | new
  sortBy?: string // name | totalSpent | createdAt
  sortOrder?: "asc" | "desc"
  offset?: number
  pageSize?: number
  /**
   * Path de tecleo/paginación: devuelve SOLO la tabla (items/total/hasMore), sin
   * recalcular agregados, y empuja la búsqueda a SQL para traer únicamente las
   * coincidencias. El cliente conserva los KPIs del SSR (invariantes a filtros).
   */
  tableOnly?: boolean
}

const PAGE_SIZE_DEFAULT = 50
const PAGE_SIZE_MAX = 50

export async function getClientsView(
  userId: string,
  params: ClientsViewParams = {},
  referenceNow: Date = new Date(),
) {
  const pageSize = Math.min(Math.max(params.pageSize ?? PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX)
  const offset = Math.max(params.offset ?? 0, 0)
  const segment = params.segment ?? "all"
  const statusFilter = params.status ?? "all"
  const search = (params.search ?? "").trim().toLowerCase()
  const sortBy = params.sortBy ?? "createdAt"
  const sortOrder: "asc" | "desc" = params.sortOrder === "asc" ? "asc" : "desc"
  const tableOnly = params.tableOnly ?? false

  // Búsqueda en SQL solo en el path tableOnly (tecleo/paginación): trae únicamente
  // las coincidencias en vez de todo el set, así el coste por tecla escala con los
  // resultados y no con el total de clientes. En ese path NO se recalculan agregados
  // (el cliente conserva los del SSR). SSR y refetch tras mutación siguen cargando
  // el set completo para que KPIs/contadores sean exactos.
  const useSqlSearch = tableOnly && search.length > 0
  const rowWhere = useSqlSearch
    ? {
        userId,
        OR: [
          { name:        { contains: search, mode: "insensitive" as const } },
          { email:       { contains: search, mode: "insensitive" as const } },
          { companyName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { userId }

  // 1. Set (completo, o solo coincidencias si useSqlSearch), columnas mínimas.
  const all = await prisma.client.findMany({
    where: rowWhere,
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      status: true,
      totalSpent: true,
      updatedAt: true,
      createdAt: true,
      notes: true,
      Task: { where: { status: "PENDING" }, select: { id: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })

  // 2. Revenue por cliente (facturas de cliente pagadas) — fuente de verdad.
  const revenueRows = all.length
    ? await prisma.invoice.groupBy({
        by: ["clientId"],
        where: { userId, clientId: { in: all.map((c) => c.id) }, paidAt: { not: null }, type: "CUSTOMER" },
        _sum: { total: true },
      })
    : []
  const revenueMap = new Map(revenueRows.map((r) => [r.clientId, Number(r._sum.total) || 0]))

  // 3. Derivación (misma lógica que el cliente). invoiceRevenue = revenue ?? 0
  //    (coincide con page.tsx; el fallback a totalSpent quedaba muerto al ser 0).
  const derived = all.map((c) => {
    const effectiveStatus = deriveClientStatus(c as never, referenceNow)
    const forgotten = isClientForgotten(c as never, referenceNow)
    const invoiceRevenue = revenueMap.get(c.id) ?? 0
    return { ...c, effectiveStatus, isForgotten: forgotten, invoiceRevenue }
  })

  // 4. Agregados sobre TODO el set (idénticos a hoy salvo el fix de mrr/new >100).
  //    Solo SSR/refetch — en el path tableOnly no se calculan (el cliente conserva
  //    los del SSR, invariantes a los filtros).
  const ninetyDaysAgo = new Date(referenceNow.getTime() - 90 * 86_400_000)
  let aggregates: {
    kpis: { total: number; active: number; vip: number; followup: number; inactive: number; totalRevenue: number }
    segCounts: { all: number; vip: number; healthy: number; risk: number; churn: number; mrr: number; new: number }
    distributionTop6: { name: string; value: number }[]
    attention: { id: string; name: string | null; effectiveStatus: string; isForgotten: boolean; updatedAt: Date }[]
    cohort: ReturnType<typeof buildCohort>
  } | null = null
  if (!tableOnly) {
    const kpis = {
      total: derived.length,
      active: derived.filter((c) => c.effectiveStatus === "ACTIVE" && !c.isForgotten).length,
      vip: derived.filter((c) => c.effectiveStatus === "VIP").length,
      followup: derived.filter((c) => c.effectiveStatus === "FOLLOW_UP").length,
      inactive: derived.filter((c) => c.effectiveStatus === "INACTIVE" || c.isForgotten).length,
      totalRevenue: derived.reduce((sum, c) => sum + (c.invoiceRevenue ?? 0), 0),
    }
    const segCounts = {
      all: kpis.total,
      vip: kpis.vip,
      healthy: kpis.active,
      risk: kpis.followup,
      churn: kpis.inactive,
      mrr: derived.filter((c) => (c.invoiceRevenue ?? 0) > 0).length,
      new: derived.filter((c) => new Date(c.createdAt) >= ninetyDaysAgo).length,
    }
    const distributionTop6 = derived
      .map((c) => ({ name: c.name ?? "—", value: c.invoiceRevenue ?? 0 }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
    const attention = derived
      .filter((c) => c.effectiveStatus === "FOLLOW_UP" || c.effectiveStatus === "INACTIVE" || c.isForgotten)
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        name: c.name,
        effectiveStatus: c.effectiveStatus,
        isForgotten: c.isForgotten,
        updatedAt: c.updatedAt,
      }))
    const cohort = buildCohort(derived, referenceNow)
    aggregates = { kpis, segCounts, distributionTop6, attention, cohort }
  }

  // 5. Tabla: filtros + segmento + orden + página sobre el set completo derivado.
  let rows = derived
  if (statusFilter && statusFilter !== "all") rows = rows.filter((c) => c.effectiveStatus === statusFilter)
  if (search) {
    rows = rows.filter(
      (c) =>
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.companyName?.toLowerCase().includes(search),
    )
  }
  if (segment === "vip") rows = rows.filter((c) => c.effectiveStatus === "VIP")
  else if (segment === "healthy") rows = rows.filter((c) => c.effectiveStatus === "ACTIVE")
  else if (segment === "risk") rows = rows.filter((c) => c.effectiveStatus === "FOLLOW_UP")
  else if (segment === "churn") rows = rows.filter((c) => c.effectiveStatus === "INACTIVE" || c.isForgotten)
  else if (segment === "mrr") rows = rows.filter((c) => (c.invoiceRevenue ?? 0) > 0)
  else if (segment === "new") rows = rows.filter((c) => new Date(c.createdAt) >= ninetyDaysAgo)

  rows.sort((a, b) => {
    let valA: number | string, valB: number | string
    if (sortBy === "name") {
      valA = a.name?.toLowerCase() || ""
      valB = b.name?.toLowerCase() || ""
    } else if (sortBy === "totalSpent") {
      valA = a.invoiceRevenue ?? 0
      valB = b.invoiceRevenue ?? 0
    } else {
      valA = new Date(a.createdAt).getTime()
      valB = new Date(b.createdAt).getTime()
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1
    if (valA > valB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const total = rows.length
  const pageIdsOrdered = rows.slice(offset, offset + pageSize).map((c) => c.id)
  const hasMore = offset + pageSize < total

  // 6. Carga pesada SOLO de la página: campos completos para la tabla.
  const pageRowsRaw = pageIdsOrdered.length
    ? await prisma.client.findMany({
        where: { id: { in: pageIdsOrdered }, userId },
        include: {
          Task: { where: { status: "PENDING" }, select: { id: true } },
          Sale: { select: { id: true }, take: 1 },
        },
      })
    : []
  const pageById = new Map(pageRowsRaw.map((r) => [r.id, r]))
  const derivedById = new Map(derived.map((d) => [d.id, d]))

  // Reordenar según el orden calculado y aplicar estado derivado + revenue.
  const items = pageIdsOrdered
    .map((id) => {
      const row = pageById.get(id)
      const d = derivedById.get(id)
      if (!row || !d) return null
      return {
        ...row,
        status: d.effectiveStatus, // derivedLogic sobrescribe status con el derivado
        effectiveStatus: d.effectiveStatus,
        isForgotten: d.isForgotten,
        invoiceRevenue: d.invoiceRevenue,
      }
    })
    .filter(Boolean)

  return {
    items,
    total,
    hasMore,
    aggregates, // null en el path tableOnly; el cliente conserva los del SSR
  }
}

/** Cohorte por trimestre de alta (réplica exacta de la lógica del cliente). */
function buildCohort(
  derived: { createdAt: Date; updatedAt: Date }[],
  referenceNow: Date,
) {
  const now = referenceNow
  const quarters: { label: string; start: number; clients: Date[] }[] = []
  for (let q = 5; q >= 0; q--) {
    const qDate = new Date(now.getFullYear(), now.getMonth() - q * 3, 1)
    const qEnd = new Date(qDate.getFullYear(), qDate.getMonth() + 3, 0)
    const qLabel = `${qDate.getFullYear()}-Q${Math.ceil((qDate.getMonth() + 1) / 3)}`
    const inQuarter = derived
      .filter((c) => {
        const d = new Date(c.createdAt)
        return d >= qDate && d <= qEnd
      })
      .map((c) => new Date(c.updatedAt))
    if (inQuarter.length > 0) quarters.push({ label: qLabel, start: inQuarter.length, clients: inQuarter })
  }
  return quarters.slice(-6).map((q) => {
    const ret = Array.from({ length: 12 }, (_, m) => {
      if (m === 0) return 100
      const cutoff = new Date(now.getFullYear(), now.getMonth() - (11 - m), 1)
      if (cutoff > now) return null
      const active = q.clients.filter((d) => d >= cutoff).length
      return q.start > 0 ? Math.round((active / q.start) * 100) : null
    })
    return { co: q.label, start: q.start, ret }
  })
}

export type ClientsViewData = Awaited<ReturnType<typeof getClientsView>>
