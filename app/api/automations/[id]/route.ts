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

        const rule = await prisma.automationRule.findFirst({
            where: { id, userId: session.user.id },
            include: {
                executions: {
                    take: 20,
                    orderBy: { executedAt: 'desc' },
                },
            },
        })

        if (!rule) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        return NextResponse.json({ data: rule })
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

        const existing = await prisma.automationRule.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        const body = await request.json()
        const { name, triggerType, triggerValue, conditions, actions, isActive } = body

        const rule = await prisma.automationRule.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(triggerType !== undefined && { triggerType }),
                ...(triggerValue !== undefined && { triggerValue: triggerValue as Prisma.InputJsonValue }),
                ...(conditions !== undefined && { conditions: conditions as Prisma.InputJsonValue }),
                ...(actions !== undefined && { actions: actions as Prisma.InputJsonValue }),
                ...(isActive !== undefined && { isActive }),
            },
        })

        return NextResponse.json({ data: rule })
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

        const existing = await prisma.automationRule.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        await prisma.automationRule.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[DELETE /api/automations/:id]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
