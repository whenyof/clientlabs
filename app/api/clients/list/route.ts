export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getClientsView } from "@/modules/clients/services/getClientsView"

/**
 * GET /api/clients/list
 * Vista de Clientes paginada con agregados calculados en server.
 * Params: status, search, segment, sortBy, sortOrder, offset, pageSize.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sp = request.nextUrl.searchParams
  try {
    const data = await getClientsView(session.user.id, {
      status: sp.get("status") ?? undefined,
      search: sp.get("search") ?? undefined,
      segment: sp.get("segment") ?? undefined,
      sortBy: sp.get("sortBy") ?? undefined,
      sortOrder: (sp.get("sortOrder") as "asc" | "desc") ?? undefined,
      offset: sp.get("offset") ? Number(sp.get("offset")) : undefined,
      pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
    })
    return NextResponse.json({ success: true, ...data })
  } catch (e) {
    console.error("[GET /api/clients/list]:", e)
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 })
  }
}
