/**
 * API Route: GET /api/automations/[id]/details
 *
 * Returns full rule data, execution stats, and recent executions.
 * Multi-tenant enforcement.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        })

        if (!rule) {
            return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
        }

        // Stats
        const [totalExecutions, successCount, lastExecution] = await Promise.all([
            prisma.automationExecution.count({
                where: { automationId: id },
            }),
            prisma.automationExecution.count({
                where: { automationId: id, status: 'SUCCESS' },
            }),
            prisma.automationExecution.findFirst({
                where: { automationId: id },
                orderBy: { executedAt: 'desc' },
                select: { executedAt: true },
            }),
        ])

        const failureCount = totalExecutions - successCount
        const successRate = totalExecutions > 0
            ? Math.round((successCount / totalExecutions) * 100)
            : 0

        // Recent executions with lead info
        const recentExecutions = await prisma.automationExecution.findMany({
            where: { automationId: id },
            orderBy: { executedAt: 'desc' },
            take: 20,
            select: {
                id: true,
                leadId: true,
                status: true,
                errorMessage: true,
                executedAt: true,
            },
        })

        // Fetch lead names for the executions
        const leadIds = [...new Set(recentExecutions.map((e) => e.leadId))]
        const leads = await prisma.lead.findMany({
            where: { id: { in: leadIds }, userId: session.user.id },
            select: { id: true, name: true, email: true },
        })
        const leadMap = new Map(leads.map((l) => [l.id, l]))

        const enrichedExecutions = recentExecutions.map((e) => {
            const lead = leadMap.get(e.leadId)
            return {
                ...e,
                leadName: lead?.name || lead?.email || 'Unknown',
                leadEmail: lead?.email || null,
            }
        })

        return NextResponse.json({
            rule: {
                id: rule.id,
                name: rule.name,
                triggerType: rule.triggerType,
                triggerValue: rule.triggerValue,
                conditions: rule.conditions,
                actions: rule.actions,
                isActive: rule.isActive,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt,
            },
            stats: {
                totalExecutions,
                successCount,
                failureCount,
                successRate,
                lastExecutedAt: lastExecution?.executedAt || null,
            },
            recentExecutions: enrichedExecutions,
        })
    } catch (error) {
        console.error('[GET /api/automations/:id/details]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
