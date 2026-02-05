import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/dashboard/stats
 * Real KPI counts and sums from DB. No mocks.
 */
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const whereUser = { userId }

    // Current month aggregates
    const [
      incomeThisMonth,
      incomePrevMonth,
      salesCountThisMonth,
      salesCountPrevMonth,
      clientsTotal,
      leadsTotal,
      tasksPending,
      automationsActive,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...whereUser,
          type: 'INCOME',
          status: 'COMPLETED',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...whereUser,
          type: 'INCOME',
          status: 'COMPLETED',
          date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
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
    ])

    const incomeCur = incomeThisMonth._sum.amount ?? 0
    const incomePrev = incomePrevMonth._sum.amount ?? 0
    const incomeChange = incomePrev === 0 ? 0 : ((incomeCur - incomePrev) / incomePrev) * 100
    const salesChange = salesCountPrevMonth === 0 ? 0 : ((salesCountThisMonth - salesCountPrevMonth) / salesCountPrevMonth) * 100

    // Revenue by month (last 6 months) from Transaction INCOME
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const txList = await prisma.transaction.findMany({
      where: {
        ...whereUser,
        type: 'INCOME',
        status: 'COMPLETED',
        date: { gte: sixMonthsAgo, lte: endOfMonth },
      },
      select: { date: true, amount: true },
    })
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const revenueByMonth: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const sum = txList
        .filter((r) => {
          const dt = new Date(r.date)
          return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth()
        })
        .reduce((acc, r) => acc + r.amount, 0)
      revenueByMonth.push({ month: monthNames[d.getMonth()], revenue: Math.round(sum) })
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
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard stats' },
      { status: 500 }
    )
  }
}
