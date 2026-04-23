import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { invalidateCachedData } from '@/lib/redis-cache'
import { updateLeadScore } from '@/lib/scoring/updateLeadScore'
import { runAutomation } from '@/lib/automations/engine'
import { gateLimit } from '@/lib/api-gate'
import { notifyNewLead, notifyPlanLimit } from '@/lib/notification-service'
import { getLimit } from '@/lib/plan-gates'
import type { PlanType } from '@prisma/client'

const createLeadSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200).trim(),
  email: z.string().email("Email no válido").max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).trim().optional(),
  source: z.string().max(100).optional(),
  budget: z.union([z.string().max(50), z.number()]).optional(),
  notes: z.string().max(5000).trim().optional(),
})

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/leads
 *
 * Supports:
 *  - Cursor-based pagination (cursor=<id>, limit=20)
 *  - Offset-based pagination (page=1, limit=20) — legacy fallback
 *  - Server-side filters: status, temperature, source
 *  - Server-side search (ILIKE on name, email, phone)
 *  - Configurable sort (sortBy, sortOrder)
 *
 * All queries are scoped to the authenticated user via compound indexes.
 */

function withCors(response: NextResponse, origin: string | null): NextResponse {
    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
    } else {
        response.headers.set('Access-Control-Allow-Origin', '*')
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
}

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin')
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    }
    if (origin) {
        headers['Access-Control-Allow-Origin'] = origin
        headers['Access-Control-Allow-Credentials'] = 'true'
    } else {
        headers['Access-Control-Allow-Origin'] = '*'
    }
    return new NextResponse(null, { status: 204, headers })
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  console.warn("[api/leads] handler invoked")
  try {
    const session = await getServerSession(authOptions)
    console.warn("[api/leads] userId:", session?.user?.id ?? "NULL")

    if (!session?.user?.id) {
      return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), origin)
    }

    const { searchParams } = new URL(request.url)

    // ── Pagination params ──
    const cursor = searchParams.get('cursor')       // cursor-based (preferred)
    const page = Number(searchParams.get('page') ?? 1) // offset-based (legacy)
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100) // max 100

    // ── Filter params ──
    const statusFilter = searchParams.get('status')
    const temperatureFilter = searchParams.get('temperature')
    const sourceFilter = searchParams.get('source')
    const search = searchParams.get('search')?.trim()

    // ── Sort params ──
    const sortBy = searchParams.get('sortBy') ?? 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'

    // Validate sortBy to prevent injection
    const ALLOWED_SORT_FIELDS = ['createdAt', 'score', 'lastActionAt', 'temperature', 'name', 'email']
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt'

    const stale = searchParams.get('stale') === 'true'
    const showConverted = searchParams.get('showConverted') === 'true'
    const showLost = searchParams.get('showLost') === 'true'

    // ── Build WHERE clause ──
    const where: Prisma.LeadWhereInput = {
      userId: session.user.id,
    }

    // Status filtering logic
    const statusInclusions: any[] = []
    const statusExclusions: any[] = []

    if (statusFilter && statusFilter !== 'all') {
      statusInclusions.push(statusFilter)
    } else {
      if (!showConverted) statusExclusions.push('CONVERTED')
      if (!showLost) statusExclusions.push('LOST')
    }

    if (stale) {
      where.lastActionAt = {
        lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      }
      statusExclusions.push('CONVERTED', 'LOST')
    }

    // Apply combined status filters
    if (statusInclusions.length > 0) {
      where.leadStatus = { in: statusInclusions as any }
    } else if (statusExclusions.length > 0) {
      where.leadStatus = { notIn: Array.from(new Set(statusExclusions)) as any }
    }

    if (temperatureFilter && temperatureFilter !== 'all') {
      where.temperature = temperatureFilter as any
    }

    if (sourceFilter && sourceFilter !== 'all') {
      where.source = sourceFilter
    }

    // ── Search: server-side ILIKE across name, email, phone ──
    if (search && search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // ── Build ORDER BY ──
    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [safeSortBy]: sortOrder,
    }

    // ── Execute query ──
    const useCursor = !!cursor
    const offset = useCursor ? undefined : (page - 1) * limit

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        take: limit + 1, // Fetch one extra to detect hasNext
        ...(useCursor
          ? {
              cursor: { id: cursor },
              skip: 1, // skip the cursor itself
            }
          : {
              skip: offset,
            }),
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          phone: true,
          source: true,
          leadStatus: true,
          temperature: true,
          score: true,
          priority: true,
          tags: true,
          notes: true,
          converted: true,
          clientId: true,
          lastActionAt: true,
          createdAt: true,
          updatedAt: true,
          conversionProbability: true,
          aiSegment: true,
          metadata: true,
        },
      }),
      prisma.lead.count({ where }),
    ])

    // ── Determine if there are more results ──
    const hasNext = leads.length > limit
    const results = hasNext ? leads.slice(0, limit) : leads
    const nextCursor = hasNext ? results[results.length - 1]?.id : null

    return withCors(NextResponse.json({
      leads: results,
      pagination: {
        // Cursor-based pagination
        nextCursor,
        hasNext,
        // Offset-based (legacy compatibility)
        page: useCursor ? undefined : page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        status: statusFilter ?? 'all',
        temperature: temperatureFilter ?? 'all',
        source: sourceFilter ?? 'all',
        search: search ?? '',
        sortBy: safeSortBy,
        sortOrder,
      },
    }), origin)
  } catch (error) {
    console.error('[api/leads] GET error:', error)
    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), origin)
  }
}


// POST /api/leads
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  try {
    const gate = await gateLimit("maxLeadsTotal", (userId) =>
      prisma.lead.count({ where: { userId } })
    )
    if (!gate.allowed) return withCors(gate.error!, origin)

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), origin)
    }

    const raw = await request.json()
    const parsed = createLeadSchema.safeParse(raw)

    if (!parsed.success) {
      return withCors(
        NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
          { status: 400 }
        ),
        origin
      )
    }

    const { name, email, phone, company, source, budget, notes } = parsed.data

    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        source: source || 'Web',
        leadStatus: 'NEW',
        status: 'NEW', // @deprecated — kept in sync with leadStatus
        notes,
        metadata: {
          ...(company ? { company } : {}),
          ...(budget !== undefined && budget !== "" ? { budget: parseFloat(String(budget)) } : {}),
        },
      },
      include: {
        stage: true,
      },
    })

    await updateLeadScore(lead.id, session.user.id, 'manual_import')

    const updatedLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: { stage: true },
    })

    await prisma.activity.create({
      data: {
        userId: session.user.id,
        leadId: lead.id,
        type: 'lead_created',
        title: 'Lead creado',
        description: `Nuevo lead ${name ?? email ?? 'sin nombre'} creado`,
        metadata: { source },
      },
    })

    await invalidateCachedData(`leads-kpis-${session.user.id}`)

    // Notificación + alerta de límite (non-blocking)
    notifyNewLead(session.user.id, lead.name ?? "Sin nombre", lead.id).catch(() => {})
    // Warn at 80% of plan limit
    const currentCount = await prisma.lead.count({ where: { userId: session.user.id } }).catch(() => 0)
    const planType = (session.user.plan ?? "FREE") as PlanType
    const maxLeads = getLimit(planType, "maxLeadsTotal")
    if (maxLeads !== Infinity && currentCount >= Math.floor(maxLeads * 0.8)) {
      notifyPlanLimit(session.user.id, "leads", currentCount, maxLeads).catch(() => {})
    }

    // Dispara automatización LEAD_NUEVO sin bloquear la respuesta
    runAutomation(session.user.id, "LEAD_NUEVO", {
      "lead.nombre": lead.name ?? "Sin nombre",
      "lead.email": lead.email ?? "—",
      "lead.telefono": lead.phone ?? "—",
      "lead.fuente": lead.source ?? "Web",
      "lead.fecha": new Date().toLocaleDateString("es-ES"),
      leadId: lead.id,
    }).catch(() => {})

    // Confirmación automática al lead si tiene email
    if (lead.email) {
      runAutomation(session.user.id, "CONFIRMACION_LEAD", {
        "lead.nombre": lead.name ?? "Sin nombre",
        "lead.email": lead.email,
        leadId: lead.id,
      }).catch(() => {})
    }

    return withCors(NextResponse.json(updatedLead, { status: 201 }), origin)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/leads] create error:', error)
    }

    return withCors(NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    ), origin)
  }
}