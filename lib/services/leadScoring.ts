import { prisma } from '@/lib/prisma'

export interface ScoringEvent {
 leadId: string
 rule: string
 points: number
 metadata?: any
}

export class LeadScoringService {
 /**
 * Calculate lead score based on activities and behavior
 */
 static async calculateLeadScore(leadId: string): Promise<number> {
 try {
 // Get lead and recent activities
 const lead = await prisma.lead.findUnique({
 where: { id: leadId },
 include: {
 activities: {
 where: {
 createdAt: {
 gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
 }
 },
 orderBy: { createdAt: 'desc' }
 },
 leadScores: {
 orderBy: { createdAt: 'desc' },
 take: 10
 }
 }
 })

 if (!lead) {
 throw new Error('Lead not found')
 }

 let totalScore = 0
 const appliedRules: ScoringEvent[] = []

 // Rule 1: Website visits and time spent
 const visitActivities = lead.activities.filter(a =>
 a.type === 'page_view' || (a.metadata as any)?.page
 )

 for (const activity of visitActivities) {
 // +30 points for visiting pricing page
 if ((activity.metadata as any)?.page?.includes('pricing')) {
 totalScore += 30
 appliedRules.push({
 leadId,
 rule: 'pricing_page_visit',
 points: 30,
 metadata: { activityId: activity.id }
 })
 }

 // +20 points for opening emails
 if (activity.type === 'email_open') {
 totalScore += 20
 appliedRules.push({
 leadId,
 rule: 'email_opened',
 points: 20,
 metadata: { activityId: activity.id }
 })
 }

 // Time-based scoring
 const timeSpent = (activity.metadata as any)?.timeSpent || 0
 if (timeSpent >= 120) { // 2+ minutes
 totalScore += 10
 appliedRules.push({
 leadId,
 rule: 'high_engagement_2min',
 points: 10,
 metadata: { timeSpent, activityId: activity.id }
 })
 }
 if (timeSpent >= 300) { // 5+ minutes
 totalScore += 10
 appliedRules.push({
 leadId,
 rule: 'high_engagement_5min',
 points: 10,
 metadata: { timeSpent, activityId: activity.id }
 })
 }
 if (timeSpent >= 600) { // 10+ minutes
 totalScore += 20
 appliedRules.push({
 leadId,
 rule: 'high_engagement_10min',
 points: 20,
 metadata: { timeSpent, activityId: activity.id }
 })
 }
 }

 // Rule 2: Recency penalty
 const lastActivity = lead.activities[0]
 if (lastActivity) {
 const daysSinceLastActivity = Math.floor(
 (Date.now() - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24)
 )

 if (daysSinceLastActivity >= 7) {
 const penalty = Math.min(daysSinceLastActivity * 2, 50) // Max 50 points penalty
 totalScore -= penalty
 appliedRules.push({
 leadId,
 rule: 'inactivity_penalty',
 points: -penalty,
 metadata: { daysSinceLastActivity }
 })
 }
 }

 // Rule 3: Lead source bonus
 switch (lead.source) {
 case 'Referral':
 totalScore += 25
 appliedRules.push({
 leadId,
 rule: 'referral_bonus',
 points: 25
 })
 break
 case 'Partner':
 totalScore += 20
 appliedRules.push({
 leadId,
 rule: 'partner_bonus',
 points: 20
 })
 break
 case 'Ads':
 totalScore += 15
 appliedRules.push({
 leadId,
 rule: 'paid_ads_bonus',
 points: 15
 })
 break
 }

  // Rule 4: Manual activities (align with manual scoring actions)
  const manualCalls = lead.activities.filter(a => a.type === 'CALL').length
  const manualNotes = lead.activities.filter(a => a.type === 'NOTE').length
  
  if (manualCalls > 0) {
    const callPoints = manualCalls * 20
    totalScore += callPoints
    appliedRules.push({ leadId, rule: 'manual_calls', points: callPoints })
  }
  if (manualNotes > 0) {
    const notePoints = manualNotes * 10
    totalScore += notePoints
    appliedRules.push({ leadId, rule: 'manual_notes', points: notePoints })
  }

  // Ensure score doesn't go below 0 and cap at 100
  totalScore = Math.max(0, Math.min(100, totalScore))

  // Derive temperature
  const temperature = LeadScoringService.getLeadTempFromScore(totalScore)

  // Update lead score, temperature and log scoring events
  await prisma.lead.update({
    where: { id: leadId },
    data: { 
      aiPrediction: totalScore,
      score: Math.round(totalScore),
      temperature
    }
  })

  // Log scoring events
  for (const rule of appliedRules) {
    await prisma.leadScore.create({
      data: {
        userId: lead.userId,
        leadId,
        score: Math.round(totalScore),
        rule: rule.rule,
        points: rule.points,
        metadata: rule.metadata
      }
    })
  }

  return totalScore
  } catch (error) {
  console.error('Error calculating lead score:', error)
  throw error
  }
  }

  /**
  * Get lead temperature based on score
  */
  static getLeadTempFromScore(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 70) return 'HOT'
  if (score >= 40) return 'WARM'
  return 'COLD'
  }

 /**
 * Recalculate scores for all leads (batch operation)
 */
 static async recalculateAllScores(userId: string): Promise<void> {
 try {
 const leads = await prisma.lead.findMany({
 where: { userId },
 select: { id: true }
 })

 console.log(`Recalculating scores for ${leads.length} leads...`)

 for (const lead of leads) {
 await this.calculateLeadScore(lead.id)
 }

 console.log('✅ All lead scores recalculated')
 } catch (error) {
 console.error('Error recalculating all scores:', error)
 throw error
 }
 }

 /**
 * Get scoring history for a lead
 */
 static async getScoringHistory(leadId: string, limit = 20) {
 try {
 return await prisma.leadScore.findMany({
 where: { leadId },
 orderBy: { createdAt: 'desc' },
 take: limit
 })
 } catch (error) {
 console.error('Error getting scoring history:', error)
 throw error
 }
 }
}