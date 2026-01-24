import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PipelineService } from '@/lib/services/pipelineService'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stageId } = await request.json()

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      )
    }

    const updatedLead = await PipelineService.updateLeadStage(
      params.id,
      stageId,
      session.user.id
    )

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Error updating lead stage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}