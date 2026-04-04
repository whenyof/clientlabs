export const maxDuration = 10
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

        const rules = await prisma.automation.findMany({
            where: { userId: session.user.id },
            include: {
                logs: {
                    take: 1,
                    orderBy: { executedAt: 'desc' },
                    select: { executedAt: true, result: true },
                },
                _count: { select: { logs: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        const data = rules.map((r) => {
            const trigger = (r.trigger || {}) as Record<string, unknown>
            return {
                id: r.id,
                name: r.name,
                triggerType: trigger.triggerType ?? 'ON_EVENT',
                triggerValue: trigger.triggerValue,
                conditions: trigger.conditions ?? [],
                actions: r.actions,
                isActive: r.active,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                lastExecution: r.logs[0] ? { executedAt: r.logs[0].executedAt, status: r.logs[0].result } : null,
                totalExecutions: r._count.logs,
            }
        })

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

        const rule = await prisma.automation.create({
            data: {
                userId: session.user.id,
                name,
                trigger: {
                    triggerType,
                    triggerValue,
                    conditions: conditions || [],
                } as Prisma.InputJsonValue,
                actions: actions as Prisma.InputJsonValue,
                active: isActive ?? true,
            },
        })
        const trigger = (rule.trigger || {}) as Record<string, unknown>
        const data = {
            id: rule.id,
            name: rule.name,
            triggerType: trigger.triggerType ?? 'ON_EVENT',
            triggerValue: trigger.triggerValue,
            conditions: trigger.conditions ?? [],
            actions: rule.actions,
            isActive: rule.active,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/automations]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
