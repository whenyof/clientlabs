export const maxDuration = 30
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateLeadScore } from '@/lib/scoring/updateLeadScore'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await request.json()
    const uid = session.user!.id

    if (leadId) {
      await updateLeadScore(leadId, uid)
      return NextResponse.json({ success: true, leadId })
    }

    const leads = await prisma.lead.findMany({
      where: { userId: uid },
      select: { id: true },
    })

    await Promise.all(leads.map((l) => updateLeadScore(l.id, uid)))

    return NextResponse.json({ success: true, count: leads.length })
  } catch (error) {
    console.error('Error recalculating scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
