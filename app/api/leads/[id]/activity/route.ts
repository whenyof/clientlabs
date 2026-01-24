import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, metadata } = body

    // Verify lead belongs to user
    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        leadId: params.id,
        type,
        title,
        description,
        metadata
      }
    })

    // Update lead's last activity timestamp
    await prisma.lead.update({
      where: { id: params.id },
      data: { lastActivity: new Date() }
    })

    // Recalculate lead score if relevant activity
    if (['email_open', 'page_view', 'meeting_booked'].includes(type)) {
      const { LeadScoringService } = await import('@/lib/services/leadScoring')
      await LeadScoringService.calculateLeadScore(params.id)
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}