/**
 * API Route: GET/POST /api/automations
 * Multi-tenant CRUD for automation rules.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/* ── GET /api/automations ───────────────────────────── */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const rules = await prisma.automationRule.findMany({
            where: { userId: session.user.id },
            include: {
                executions: {
                    take: 1,
                    orderBy: { executedAt: 'desc' },
                    select: { executedAt: true, status: true },
                },
                _count: { select: { executions: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        const data = rules.map((r) => ({
            id: r.id,
            name: r.name,
            triggerType: r.triggerType,
            triggerValue: r.triggerValue,
            conditions: r.conditions,
            actions: r.actions,
            isActive: r.isActive,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            lastExecution: r.executions[0] || null,
            totalExecutions: r._count.executions,
        }))

        return NextResponse.json({ data })
    } catch (error) {
        console.error('[GET /api/automations]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/* ── POST /api/automations ──────────────────────────── */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, triggerType, triggerValue, conditions, actions, isActive } = body

        if (!name || !triggerType || !triggerValue || !actions) {
            return NextResponse.json(
                { error: 'Missing required fields: name, triggerType, triggerValue, actions' },
                { status: 400 }
            )
        }

        if (!['ON_EVENT', 'ON_SCORE_THRESHOLD'].includes(triggerType)) {
            return NextResponse.json(
                { error: 'triggerType must be ON_EVENT or ON_SCORE_THRESHOLD' },
                { status: 400 }
            )
        }

        const rule = await prisma.automationRule.create({
            data: {
                userId: session.user.id,
                name,
                triggerType,
                triggerValue: triggerValue as Prisma.InputJsonValue,
                conditions: (conditions || []) as Prisma.InputJsonValue,
                actions: actions as Prisma.InputJsonValue,
                isActive: isActive ?? true,
            },
        })

        return NextResponse.json({ data: rule }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/automations]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
