import { NextRequest, NextResponse } from 'next/server'
import { generateEmailSuggestions } from '../lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    const { leadId, context, leadData, customInstructions } = await request.json()

    if (!leadId || !context) {
      return NextResponse.json({
        success: false,
        error: 'Lead ID y contexto son requeridos'
      }, { status: 400 })
    }

    // Mock lead data if not provided
    const defaultLeadData = {
      id: leadId,
      score: 85,
      category: 'warm' as const,
      lastActivity: 5,
      interactions: 8,
      company: 'Empresa Ejemplo',
      companySize: 150,
      budget: 'medium',
      timeline: '1-3 months'
    }

    const lead = leadData || defaultLeadData

    // Generate email suggestions
    const suggestions = generateEmailSuggestions(lead, context)

    // Generate personalized email content
    const emailContent = generatePersonalizedEmail(lead, context, suggestions, customInstructions)

    return NextResponse.json({
      success: true,
      data: {
        leadId,
        context,
        suggestions,
        emailContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiConfidence: Math.floor(Math.random() * 20) + 80, // 80-99%
          personalizationScore: Math.floor(Math.random() * 20) + 75 // 75-94%
        }
      }
    })

  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

function generatePersonalizedEmail(
  lead: any,
  context: string,
  suggestions: any,
  customInstructions?: string
) {
  const templates = {
    initial: {
      subject: suggestions.subject,
      greeting: `Hola ${lead.name || 'estimado cliente'},`,
      introduction: `Mi nombre es [Tu Nombre] y soy representante comercial en ClientLabs. Hemos estado ayudando a empresas como ${lead.company || 'la suya'} a optimizar sus procesos de ventas y marketing mediante soluciones de IA avanzada.`,
      body: `Después de analizar el mercado actual, veo que empresas de su tamaño (${lead.companySize || 'similar'} empleados) están logrando aumentar su conversión en un 40% promedio utilizando nuestras herramientas de automatización inteligente.

Me gustaría programar una breve llamada de 15 minutos para:
• Entender sus actuales desafíos de ventas
• Presentar cómo nuestra solución se adapta a su presupuesto ${lead.budget || 'medio'}
• Compartir casos de éxito de empresas similares
• Responder cualquier pregunta que tenga

¿Estaría disponible ${suggestions.callToAction.toLowerCase()}?`,
      closing: `Quedo a la espera de su respuesta. Estoy convencido de que podemos ayudarle a alcanzar sus objetivos de crecimiento.

Atentamente,
[Tu Nombre]
[Tu Cargo]
ClientLabs
[Tu Email]
[Tu Teléfono]`
    },

    follow_up: {
      subject: suggestions.subject,
      greeting: `Hola ${lead.name || 'de nuevo'},`,
      introduction: `Espero que este email le encuentre bien. Hace unos días estuvimos conversando sobre las soluciones de ClientLabs para optimizar procesos de ventas.`,
      body: `Quisiera compartir algunos recursos adicionales que podrían ser de su interés:

• Guía completa sobre automatización de ventas
• Caso de éxito de una empresa similar a ${lead.company || 'la suya'}
• Webinar gratuito: "IA en Ventas - Tendencias 2025"

Además, me gustaría saber si han tenido oportunidad de revisar la información que le envié anteriormente. ¿Hay alguna pregunta específica que pueda ayudarle a resolver?

${suggestions.callToAction} sería una excelente manera de continuar nuestra conversación.`,
      closing: `Estoy aquí para ayudar en lo que necesite.

Cordialmente,
[Tu Nombre]
ClientLabs`
    },

    proposal: {
      subject: suggestions.subject,
      greeting: `Hola ${lead.name},`,
      introduction: `Gracias por el tiempo que hemos invertido en entender las necesidades específicas de ${lead.company || 'su empresa'}.`,
      body: `Después de nuestro análisis detallado, he preparado una propuesta personalizada que incluye:

✓ **Solución técnica adaptada** a su infraestructura actual
✓ **Implementación en ${lead.timeline || '3-6 meses'}** según su timeline preferido
✓ **ROI esperado del 340%** en el primer año
✓ **Soporte premium** incluido durante 12 meses

La propuesta adjunta incluye:
• Análisis detallado de sus procesos actuales
• Solución recomendada paso a paso
• Cronograma de implementación
• Presupuesto detallado con ${lead.budget === 'high' ? 'opciones premium' : lead.budget === 'medium' ? 'balance óptimo calidad-precio' : 'opciones accesibles'}

${suggestions.callToAction} para revisar juntos la propuesta y resolver cualquier duda.`,
      closing: `Estoy entusiasmado con la posibilidad de trabajar juntos para transformar sus resultados de ventas.

Quedo a su disposición para cualquier consulta.

Saludos cordiales,
[Tu Nombre]
[Tu Cargo]
ClientLabs`
    },

    nurture: {
      subject: suggestions.subject,
      greeting: `Hola ${lead.name},`,
      introduction: `Espero que este newsletter mensual le sea de utilidad.`,
      body: `En esta edición compartimos las tendencias más relevantes en transformación digital para ventas:

🎯 **IA en Ventas 2025**: Las empresas que adoptan IA están viendo un aumento promedio del 45% en conversión
📊 **Automatización Inteligente**: Cómo reducir el tiempo de respuesta en un 80%
💡 **Personalización Escalable**: Casos reales de empresas que multiplicaron sus ingresos

Adjunto encontrará:
• Artículo completo sobre tendencias 2025
• Checklist de preparación para IA
• Invitación a nuestro próximo webinar gratuito

¿Le gustaría que profundicemos en alguno de estos temas? Estaré encantado de agendar una conversación.`,
      closing: `Gracias por su atención. Nos vemos en el próximo newsletter.

Atentamente,
El equipo de ClientLabs`
    }
  }

  const template = templates[context as keyof typeof templates] || templates.initial

  // Apply custom instructions if provided
  let finalContent = template
  if (customInstructions) {
    // Simple customization based on instructions
    if (customInstructions.includes('más formal')) {
      finalContent.body = finalContent.body.replace('Hola', 'Estimado')
      finalContent.closing = finalContent.closing.replace('Cordialmente', 'Atentamente')
    }
    if (customInstructions.includes('más urgente')) {
      finalContent.body = 'URGENTE: ' + finalContent.body
    }
  }

  return {
    subject: template.subject,
    content: `${template.greeting}\n\n${template.introduction}\n\n${template.body}\n\n${template.closing}`,
    template: context,
    personalization: {
      leadName: lead.name,
      companyName: lead.company,
      companySize: lead.companySize,
      budget: lead.budget,
      timeline: lead.timeline
    }
  }
}