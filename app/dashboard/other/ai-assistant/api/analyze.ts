      case 'lead_scoring': {
        const leads: LeadData[] = data.leads || mockLeadScores.map(l => ({
          id: l.leadId,
          name: l.name,
          email: l.email,
          company: l.company,
          interactions: Math.floor(Math.random() * 20) + 1,
          timeSinceLastActivity: Math.floor(Math.random() * 90) + 1,
          source: ['referral', 'social', 'email', 'conference'][Math.floor(Math.random() * 4)] as LeadData['source'],
          companySize: Math.floor(Math.random() * 500) + 10,
          budget: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as LeadData['budget'],
          timeline: ['immediate', '1-3 months', '3-6 months'][Math.floor(Math.random() * 3)] as LeadData['timeline']
        }))

        const scoredLeads = leads.map((lead: LeadData) => ({
          ...lead,
          scoring: calculateLeadScore(lead)
        }))