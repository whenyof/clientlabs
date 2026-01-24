import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { LeadScoringService } from '@/lib/services/leadScoring'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await request.json()

    if (leadId) {
      // Recalculate single lead score
      const newScore = await LeadScoringService.calculateLeadScore(leadId)
      return NextResponse.json({
        success: true,
        leadId,
        newScore
      })
    } else {
      // Recalculate all user leads
      await LeadScoringService.recalculateAllScores(session.user.id)
      return NextResponse.json({
        success: true,
        message: 'All lead scores recalculated'
      })
    }
  } catch (error) {
    console.error('Error recalculating scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}