export const maxDuration = 10
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/dashboard/stats
 * Real KPI counts and sums from DB. No mocks.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = session.user.id

        const now = new Date()
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        const endOfMonth = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
        )
        const startOfPrevMonth = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
        )
        const endOfPrevMonth = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
        )
        const sixMonthsAgo = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
        )

        const whereUser = { userId }

        // Postgres aggregation: one query returns up to 6 rows (monthly revenue); no transaction list in Node
        type MonthlyRevenueRow = { month: Date; revenue: number }
        const [monthlyRevenueRows, salesCountThisMonth, salesCountPrevMonth, clientsTotal, leadsTotal, tasksPending, automationsActive, userSettings] =
            await Promise.all([
                prisma.$queryRaw<MonthlyRevenueRow[]>`
                    SELECT
                        (DATE_TRUNC('month', "date" AT TIME ZONE 'UTC'))::date AS month,
                        COALESCE(SUM(amount), 0)::float AS revenue
                    FROM "Transaction"
                    WHERE "userId" = ${userId}
                        AND "type" = 'INCOME'
                        AND "status" = 'COMPLETED'
                        AND "date" >= ${sixMonthsAgo}
                        AND "date" <= ${endOfMonth}
                    GROUP BY month
                    ORDER BY month
                `,
                prisma.sale.count({
                    where: {
                        ...whereUser,
                        saleDate: { gte: startOfMonth, lte: endOfMonth },
                    },
                }),
                prisma.sale.count({
                    where: {
                        ...whereUser,
                        saleDate: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                    },
                }),
                prisma.client.count({ where: whereUser }),
                prisma.lead.count({ where: whereUser }),
                prisma.task.count({
                    where: { ...whereUser, status: 'PENDING' },
                }),
                prisma.automation.count({
                    where: { ...whereUser, active: true },
                }),
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { monthlyRevenueTarget: true },
                }),
            ])

        // Map YYYY-MM (UTC) -> revenue from aggregated rows; validate range and numeric safety
        const monthlyTotals = new Map<string, number>()
        for (const r of monthlyRevenueRows) {
            const revenue = Number(r.revenue)
            if (!Number.isFinite(revenue)) continue
            const monthDate = r.month instanceof Date ? r.month : new Date(r.month)
            if (monthDate < sixMonthsAgo || monthDate > endOfMonth) continue
            const key = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`
            monthlyTotals.set(key, revenue)
        }
        const currentKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
        const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
        const prevKey = `${prevMonthStart.getUTCFullYear()}-${String(prevMonthStart.getUTCMonth() + 1).padStart(2, '0')}`
        const incomeCur = monthlyTotals.get(currentKey) ?? 0
        const incomePrev = monthlyTotals.get(prevKey) ?? 0
        const incomeChange = incomePrev === 0 ? 0 : ((incomeCur - incomePrev) / incomePrev) * 100
        const salesChange = salesCountPrevMonth === 0 ? 0 : ((salesCountThisMonth - salesCountPrevMonth) / salesCountPrevMonth) * 100

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const revenueByMonth: { month: string; revenue: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
            const sum = monthlyTotals.get(key) ?? 0
            revenueByMonth.push({ month: monthNames[d.getUTCMonth()], revenue: Math.round(sum) })
        }

        return NextResponse.json({
            income: incomeCur,
            incomeChange,
            salesCount: salesCountThisMonth,
            salesChange,
            clientsCount: clientsTotal,
            leadsCount: leadsTotal,
            tasksCount: tasksPending,
            botsCount: automationsActive,
            revenueByMonth,
            monthlyRevenueTarget: userSettings?.monthlyRevenueTarget ?? 0,
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { error: 'Failed to load dashboard stats' },
            { status: 500 }
        )
    }
}
