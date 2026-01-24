import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AutomationService {
  /**
   * Log automation execution
   */
  static async logAutomationExecution(
    automationId: string,
    userId: string,
    action: string,
    result: string,
    leadId?: string,
    error?: string
  ) {
    try {
      await prisma.automationLog.create({
        data: {
          userId,
          automationId,
          leadId,
          action,
          result,
          error
        }
      })
    } catch (error) {
      console.error('Error logging automation execution:', error)
      // Don't throw - logging shouldn't break the main flow
    }
  }

  /**
   * Execute automation based on trigger
   */
  static async executeAutomation(
    automationId: string,
    triggerData: any,
    userId: string
  ): Promise<boolean> {
    try {
      const automation = await prisma.automation.findFirst({
        where: {
          id: automationId,
          userId,
          active: true
        }
      })

      if (!automation) {
        return false
      }

      // Check if trigger conditions match
      const triggerMatch = this.checkTriggerMatch(automation.trigger, triggerData)

      if (!triggerMatch) {
        return false
      }

      // Execute actions
      const results = []
      for (const action of automation.actions as any[]) {
        try {
          const result = await this.executeAction(action, triggerData, userId)
          results.push(result)

          // Log successful action
          await this.logAutomationExecution(
            automationId,
            userId,
            `Executed: ${action.type}`,
            'success',
            triggerData.leadId
          )
        } catch (error) {
          // Log failed action
          await this.logAutomationExecution(
            automationId,
            userId,
            `Failed: ${action.type}`,
            'error',
            triggerData.leadId,
            error instanceof Error ? error.message : 'Unknown error'
          )
        }
      }

      return results.length > 0
    } catch (error) {
      console.error('Error executing automation:', error)
      return false
    }
  }

  /**
   * Check if trigger conditions match
   */
  private static checkTriggerMatch(trigger: any, triggerData: any): boolean {
    try {
      // Simple trigger matching logic
      // In a real implementation, this would be more sophisticated

      if (trigger.type === 'lead_score_changed' && triggerData.scoreChanged) {
        return triggerData.newScore >= (trigger.minScore || 0)
      }

      if (trigger.type === 'lead_stage_changed' && triggerData.stageChanged) {
        return triggerData.newStage === trigger.targetStage
      }

      if (trigger.type === 'lead_created' && triggerData.leadCreated) {
        return true
      }

      return false
    } catch (error) {
      console.error('Error checking trigger match:', error)
      return false
    }
  }

  /**
   * Execute a single automation action
   */
  private static async executeAction(action: any, triggerData: any, userId: string): Promise<any> {
    try {
      switch (action.type) {
        case 'send_email':
          return await this.sendEmail(action, triggerData, userId)

        case 'update_lead_score':
          return await this.updateLeadScore(action, triggerData, userId)

        case 'change_lead_stage':
          return await this.changeLeadStage(action, triggerData, userId)

        case 'create_task':
          return await this.createTask(action, triggerData, userId)

        case 'send_notification':
          return await this.sendNotification(action, triggerData, userId)

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      console.error('Error executing action:', error)
      throw error
    }
  }

  // Action implementations
  private static async sendEmail(action: any, triggerData: any, userId: string) {
    // TODO: Integrate with email service
    console.log('Sending email:', action.template, 'to lead:', triggerData.leadId)
    return { status: 'email_queued' }
  }

  private static async updateLeadScore(action: any, triggerData: any, userId: string) {
    const { LeadScoringService } = await import('./leadScoring')

    const newScore = await LeadScoringService.calculateLeadScore(triggerData.leadId)
    return { status: 'score_updated', newScore }
  }

  private static async changeLeadStage(action: any, triggerData: any, userId: string) {
    const { PipelineService } = await import('./pipelineService')

    const result = await PipelineService.updateLeadStage(
      triggerData.leadId,
      action.stageId,
      userId
    )
    return { status: 'stage_changed', newStage: result.stage?.name }
  }

  private static async createTask(action: any, triggerData: any, userId: string) {
    // TODO: Integrate with task management
    console.log('Creating task:', action.title, 'for lead:', triggerData.leadId)
    return { status: 'task_created' }
  }

  private static async sendNotification(action: any, triggerData: any, userId: string) {
    // TODO: Integrate with notification system
    console.log('Sending notification:', action.message, 'to user:', userId)
    return { status: 'notification_sent' }
  }

  /**
   * Process automation triggers (called from webhook or scheduled job)
   */
  static async processTriggers(triggerType: string, triggerData: any) {
    try {
      // Find all active automations that match this trigger type
      const automations = await prisma.automation.findMany({
        where: {
          active: true,
          trigger: {
            path: ['type'],
            equals: triggerType
          }
        }
      })

      const results = []
      for (const automation of automations) {
        const result = await this.executeAutomation(
          automation.id,
          triggerData,
          automation.userId
        )
        results.push({ automationId: automation.id, success: result })
      }

      return results
    } catch (error) {
      console.error('Error processing automation triggers:', error)
      throw error
    }
  }
}