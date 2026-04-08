export const maxDuration = 20
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single query — userId filter replaces the redundant lead ownership check
    const activities = await prisma.activity.findMany({
      where: { leadId: params.id, userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, title: true, description: true, createdAt: true },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, metadata } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 })
    }

    // Single query — no separate lead ownership check needed
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        leadId: params.id,
        type,
        title,
        description: description ?? null,
        metadata: metadata ?? null,
      },
    })

    const ACTION_MAP: Record<string, string> = {
      CALL: 'call_registered',
      NOTE: 'note_added',
      EMAIL: 'email_sent',
      MEETING: 'meeting_done',
    }
    const scoringAction = ACTION_MAP[type]
    if (scoringAction) {
      const { updateLeadScore } = await import('@/lib/scoring/updateLeadScore')
      await updateLeadScore(params.id, session.user.id, scoringAction)
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('activityId')
    if (!activityId) {
      return NextResponse.json({ error: 'activityId is required' }, { status: 400 })
    }

    // Single query — deleteMany with ownership filter replaces findFirst + delete
    const result = await prisma.activity.deleteMany({
      where: { id: activityId, leadId: params.id, userId: session.user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
