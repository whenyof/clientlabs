import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PipelineService {
  /**
   * Update lead stage
   */
  static async updateLeadStage(leadId: string, stageId: string, userId: string) {
    try {
      // Verify stage belongs to user
      const stage = await prisma.pipelineStage.findFirst({
        where: {
          id: stageId,
          userId
        }
      })

      if (!stage) {
        throw new Error('Stage not found or access denied')
      }

      // Update lead stage
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: { stageId },
        include: {
          stage: true
        }
      })

      // Log activity
      await prisma.activity.create({
        data: {
          userId,
          leadId,
          type: 'stage_change',
          title: `Stage updated to ${stage.name}`,
          description: `Lead moved to ${stage.name} stage`,
          metadata: {
            oldStage: updatedLead.stage?.name,
            newStage: stage.name,
            stageId
          }
        }
      })

      return updatedLead
    } catch (error) {
      console.error('Error updating lead stage:', error)
      throw error
    }
  }

  /**
   * Create default pipeline stages for a user
   */
  static async createDefaultStages(userId: string) {
    try {
      const defaultStages = [
        { name: 'New', order: 0, color: '#6366f1' },
        { name: 'Contacted', order: 1, color: '#f59e0b' },
        { name: 'Qualified', order: 2, color: '#10b981' },
        { name: 'Proposal', order: 3, color: '#8b5cf6' },
        { name: 'Closed', order: 4, color: '#ef4444' }
      ]

      const stages = await prisma.$transaction(
        defaultStages.map(stage =>
          prisma.pipelineStage.create({
            data: {
              userId,
              ...stage
            }
          })
        )
      )

      return stages
    } catch (error) {
      console.error('Error creating default stages:', error)
      throw error
    }
  }

  /**
   * Get pipeline stages for a user
   */
  static async getStages(userId: string) {
    try {
      return await prisma.pipelineStage.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
        include: {
          leads: {
            select: {
              id: true,
              name: true,
              aiScore: true,
              status: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error getting pipeline stages:', error)
      throw error
    }
  }

  /**
   * Update stage order
   */
  static async updateStageOrder(userId: string, stageUpdates: { id: string; order: number }[]) {
    try {
      await prisma.$transaction(
        stageUpdates.map(update =>
          prisma.pipelineStage.update({
            where: {
              id: update.id,
              userId // Ensure user owns the stage
            },
            data: { order: update.order }
          })
        )
      )
    } catch (error) {
      console.error('Error updating stage order:', error)
      throw error
    }
  }
}