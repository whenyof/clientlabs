import { LeadData, calculateLeadScore } from '../lib/scoring';
import { prisma } from '@/lib/prisma';

export async function analyzeData(type: string, data: any) {
  switch (type) {
    case 'lead_scoring': {
      // Use provided leads or fetch real leads from the database
      let leads: LeadData[] = data.leads || []

      if (leads.length === 0) {
        const dbLeads = await prisma.lead.findMany({
          where: { userId: data.userId },
          select: {
            id: true,
            name: true,
            email: true,
            score: true,
            source: true,
            createdAt: true,
            lastActionAt: true,
          },
          take: 50,
        })

        leads = dbLeads.map(l => ({
          id: l.id,
          name: l.name ?? '',
          email: l.email ?? '',
          company: '',
          interactions: 0,
          timeSinceLastActivity: l.lastActionAt
            ? Math.floor((Date.now() - new Date(l.lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
            : 90,
          source: (l.source as LeadData['source']) ?? 'other',
          companySize: 0,
          budget: 'medium' as LeadData['budget'],
          timeline: '1-3 months' as LeadData['timeline'],
        }))
      }

      const scoredLeads = leads.map((lead: LeadData) => ({
        ...lead,
        scoring: calculateLeadScore(lead)
      }))

      return scoredLeads;
    }
    default:
      return null;
  }
}