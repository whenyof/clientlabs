/**
 * API Route: GET/PUT/DELETE /api/automations/[id]
 * Single automation rule operations with multi-tenant enforcement.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/* ── GET /api/automations/:id ───────────────────────── */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const rule = await prisma.automation.findFirst({
            where: { id, userId: session.user.id },
            include: {
                logs: {
                    take: 20,
                    orderBy: { executedAt: 'desc' },
                },
            },
        })

        if (!rule) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

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
            executions: rule.logs.map((l) => ({
                id: l.id,
                automationId: l.automationId,
                leadId: l.leadId,
                status: l.result,
                errorMessage: l.error,
                executedAt: l.executedAt,
            })),
        }
        return NextResponse.json({ data })
    } catch (error) {
        console.error('[GET /api/automations/:id]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/* ── PUT /api/automations/:id ───────────────────────── */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const existing = await prisma.automation.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true, trigger: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        const body = await request.json()
        const { name, triggerType, triggerValue, conditions, actions, isActive } = body
        const currentTrigger = (existing.trigger || {}) as Record<string, unknown>
        const updateData: Parameters<typeof prisma.automation.update>[0]['data'] = {
            ...(name !== undefined && { name }),
            ...(actions !== undefined && { actions: actions as Prisma.InputJsonValue }),
            ...(isActive !== undefined && { active: isActive }),
        }
        if (triggerType !== undefined || triggerValue !== undefined || conditions !== undefined) {
            updateData.trigger = {
                ...currentTrigger,
                ...(triggerType !== undefined && { triggerType }),
                ...(triggerValue !== undefined && { triggerValue }),
                ...(conditions !== undefined && { conditions }),
            } as Prisma.InputJsonValue
        }

        const rule = await prisma.automation.update({
            where: { id },
            data: updateData,
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
        return NextResponse.json({ data })
    } catch (error) {
        console.error('[PUT /api/automations/:id]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/* ── DELETE /api/automations/:id ────────────────────── */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const existing = await prisma.automation.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        await prisma.automation.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[DELETE /api/automations/:id]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
