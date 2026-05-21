export const maxDuration = 10
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PipelineService } from '@/lib/services/pipelineService'

const stageSchema = z.object({ stageId: z.string().nullable() })

export async function PATCH(
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
    const parsed = stageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'stageId requerido' }, { status: 400 })
    }

    const updatedLead = await PipelineService.updateLeadStage(
      params.id,
      parsed.data.stageId,
      session.user.id
    )

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Error updating lead stage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}