import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/dashboard/current-month
 * Returns cumulative daily revenue for the current month,
 * only up to and including today (no future days).
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = session.user.id

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const currentDay = now.getDate()
        const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0)
        const endOfToday = new Date(year, month, currentDay, 23, 59, 59, 999)

        // Fetch all INCOME + COMPLETED transactions from day 1 to today
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                type: 'INCOME',
                status: 'COMPLETED',
                date: { gte: startOfMonth, lte: endOfToday },
            },
            select: { date: true, amount: true },
            orderBy: { date: 'asc' },
        })

        // Group revenue by day of month
        const dailyRevenue = new Map<number, number>()
        for (const tx of transactions) {
            const day = new Date(tx.date).getDate()
            dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + (tx.amount ?? 0))
        }

        // Build cumulative array ONLY from day 1 to currentDay
        let cumulative = 0
        const result: { day: number; revenue: number }[] = []
        for (let d = 1; d <= currentDay; d++) {
            cumulative += dailyRevenue.get(d) ?? 0
            result.push({ day: d, revenue: cumulative })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('[current-month]', error)
        return NextResponse.json(
            { error: 'Failed to load current month data' },
            { status: 500 }
        )
    }
}
