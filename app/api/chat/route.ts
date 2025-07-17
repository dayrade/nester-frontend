import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { Anthropic } from '@anthropic-ai/sdk'

// Initialize Claude AI client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// AI-Powered Property Chat Agent
export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      property_id, 
      session_id, 
      visitor_info = {},
      context = {} 
    } = await request.json()

    if (!message || !property_id) {
      return NextResponse.json(
        { error: 'Message and property ID are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get property details with agent brand context
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get agent's brand and persona settings
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', property.agent_id)
      .single()

    // Get or create chat session
    let chatSession
    if (session_id) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('property_id', property_id)
        .single()
      
      chatSession = existingSession
    }

    if (!chatSession) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          property_id,
          visitor_info: {
            ip_address: visitor_info.ip_address,
            user_agent: visitor_info.user_agent,
            referrer: visitor_info.referrer,
            location: visitor_info.location,
            device_type: visitor_info.device_type
          },
          conversation_history: [],
          lead_qualification_score: 0,
          identified_interests: [],
          session_metadata: {
            started_at: new Date().toISOString(),
            platform: context.platform || 'web',
            source: context.source || 'property_page'
          }
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating chat session:', sessionError)
        return NextResponse.json(
          { error: 'Failed to create chat session' },
          { status: 500 }
        )
      }

      chatSession = newSession
    }

    // Prepare AI context with property and brand information
    const aiContext = {
      property: {
        address: property.address,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_feet: property.square_feet,
        property_type: property.property_type,
        description: property.description,
        features: property.features,
        neighborhood_info: property.neighborhood_info,
        year_built: property.year_built,
        listing_status: property.listing_status,
        days_on_market: property.days_on_market,
        school_district: property.school_district,
        walkability_score: property.walkability_score,
        hoa_fees: property.hoa_fees,
        property_taxes: property.property_taxes
      },
      agent: {
        name: brandData?.agent_name || 'Real Estate Professional',
        company: brandData?.company_name || 'Nester',
        phone: brandData?.agent_phone,
        email: brandData?.agent_email,
        website: brandData?.agent_website
      },
      brand_persona: {
        tone: brandData?.persona_tone || 'Professional & Authoritative',
        style: brandData?.persona_style || 'Concise & Factual',
        key_phrases: brandData?.persona_key_phrases || ['Discover your dream home'],
        avoid_phrases: brandData?.persona_phrases_to_avoid || ['cheap', 'deal']
      },
      conversation_history: chatSession.conversation_history || [],
      lead_qualification: {
        current_score: chatSession.lead_qualification_score || 0,
        identified_interests: chatSession.identified_interests || [],
        qualification_criteria: [
          'budget_range',
          'timeline',
          'financing_status',
          'current_living_situation',
          'family_size',
          'work_location',
          'specific_requirements'
        ]
      }
    }

    // Generate AI response using Claude
    const aiResponse = await generateAIResponse(message, aiContext)

    // Update conversation history
    const updatedHistory = [
      ...(chatSession.conversation_history || []),
      {
        timestamp: new Date().toISOString(),
        user_message: message,
        ai_response: aiResponse.response,
        lead_signals: aiResponse.lead_signals,
        qualification_updates: aiResponse.qualification_updates
      }
    ]

    // Calculate updated lead qualification score
    const updatedScore = calculateLeadScore(
      chatSession.lead_qualification_score || 0,
      aiResponse.lead_signals
    )

    // Update identified interests
    const updatedInterests = [
      ...new Set([
        ...(chatSession.identified_interests || []),
        ...aiResponse.identified_interests
      ])
    ]

    // Update chat session
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        conversation_history: updatedHistory,
        lead_qualification_score: updatedScore,
        identified_interests: updatedInterests,
        last_interaction_at: new Date().toISOString(),
        total_messages: (chatSession.total_messages || 0) + 1
      })
      .eq('id', chatSession.id)

    if (updateError) {
      console.error('Error updating chat session:', updateError)
    }

    // Determine if this is a qualified lead
    const isQualifiedLead = updatedScore >= 70 // Threshold for qualified lead

    // If qualified lead, trigger lead notification
    if (isQualifiedLead && !chatSession.lead_notified) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/qualified-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: property.agent_id,
            property_id,
            session_id: chatSession.id,
            lead_score: updatedScore,
            visitor_info: chatSession.visitor_info,
            key_interests: updatedInterests,
            conversation_summary: aiResponse.conversation_summary
          })
        })

        // Mark as notified
        await supabase
          .from('chat_sessions')
          .update({ lead_notified: true })
          .eq('id', chatSession.id)
      } catch (notificationError) {
        console.error('Failed to send lead notification:', notificationError)
      }
    }

    return NextResponse.json({
      response: aiResponse.response,
      session_id: chatSession.id,
      lead_qualification: {
        score: updatedScore,
        is_qualified: isQualifiedLead,
        interests: updatedInterests,
        next_questions: aiResponse.suggested_questions
      },
      agent_contact: {
        name: aiContext.agent.name,
        phone: aiContext.agent.phone,
        email: aiContext.agent.email,
        should_show_contact: updatedScore >= 50 // Show contact info for warm leads
      },
      suggested_actions: aiResponse.suggested_actions
    })

  } catch (error) {
    console.error('Chat agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate AI response using Claude
async function generateAIResponse(message: string, context: any) {
  const systemPrompt = `You are an AI-powered real estate assistant for ${context.agent.company}. You represent ${context.agent.name} and are helping potential buyers learn about a specific property.

PROPERTY DETAILS:
- Address: ${context.property.address}
- Price: $${context.property.price?.toLocaleString()}
- ${context.property.bedrooms} bedrooms, ${context.property.bathrooms} bathrooms
- ${context.property.square_feet} sq ft
- Type: ${context.property.property_type}
- Year Built: ${context.property.year_built}
- Description: ${context.property.description}
- Features: ${context.property.features?.join(', ')}
- Neighborhood: ${context.property.neighborhood_info}

BRAND PERSONA:
- Tone: ${context.brand_persona.tone}
- Style: ${context.brand_persona.style}
- Use these phrases: ${context.brand_persona.key_phrases?.join(', ')}
- Avoid these phrases: ${context.brand_persona.avoid_phrases?.join(', ')}

YOUR ROLE:
1. Answer questions about the property professionally and accurately
2. Identify buyer interests and qualification signals
3. Guide conversations toward scheduling viewings or contacting the agent
4. Provide helpful neighborhood and market insights
5. Qualify leads by understanding their needs, timeline, and budget

LEAD QUALIFICATION SIGNALS TO IDENTIFY:
- Budget range mentions
- Timeline for buying/moving
- Current living situation
- Family size and needs
- Financing status
- Specific requirements or preferences
- Work location and commute needs

RESPOND WITH:
- Helpful, accurate information about the property
- Follow-up questions to better understand their needs
- Suggestions for next steps (viewing, contacting agent, etc.)
- Professional but friendly tone matching the brand persona`

  const conversationHistory = context.conversation_history
    .slice(-10) // Last 10 exchanges for context
    .map((exchange: any) => 
      `Human: ${exchange.user_message}\nAssistant: ${exchange.ai_response}`
    ).join('\n\n')

  const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory}

Current message: ${message}

Please respond naturally and helpfully. Also identify any lead qualification signals in this message.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    // Analyze message for lead signals
    const leadSignals = analyzeLeadSignals(message)
    const identifiedInterests = extractInterests(message, context.property)
    const qualificationUpdates = extractQualificationData(message)
    const suggestedQuestions = generateFollowUpQuestions(message, context)
    const suggestedActions = determineSuggestedActions(leadSignals, context)

    return {
      response: aiResponse,
      lead_signals: leadSignals,
      identified_interests: identifiedInterests,
      qualification_updates: qualificationUpdates,
      suggested_questions: suggestedQuestions,
      suggested_actions: suggestedActions,
      conversation_summary: generateConversationSummary(context.conversation_history, message, aiResponse)
    }

  } catch (error) {
    console.error('Claude AI error:', error)
    return {
      response: "I apologize, but I'm experiencing technical difficulties. Please feel free to contact our agent directly for immediate assistance.",
      lead_signals: [],
      identified_interests: [],
      qualification_updates: {},
      suggested_questions: [],
      suggested_actions: ['contact_agent'],
      conversation_summary: 'Technical error occurred during conversation'
    }
  }
}

// Analyze message for lead qualification signals
function analyzeLeadSignals(message: string): string[] {
  const signals = []
  const lowerMessage = message.toLowerCase()

  // Budget signals
  if (lowerMessage.includes('budget') || lowerMessage.includes('afford') || lowerMessage.includes('price range')) {
    signals.push('budget_discussion')
  }

  // Timeline signals
  if (lowerMessage.includes('when') || lowerMessage.includes('timeline') || lowerMessage.includes('move') || lowerMessage.includes('buy')) {
    signals.push('timeline_interest')
  }

  // Financing signals
  if (lowerMessage.includes('mortgage') || lowerMessage.includes('loan') || lowerMessage.includes('financing') || lowerMessage.includes('pre-approved')) {
    signals.push('financing_discussion')
  }

  // Viewing interest
  if (lowerMessage.includes('see') || lowerMessage.includes('visit') || lowerMessage.includes('tour') || lowerMessage.includes('viewing')) {
    signals.push('viewing_interest')
  }

  // Family/living situation
  if (lowerMessage.includes('family') || lowerMessage.includes('kids') || lowerMessage.includes('children') || lowerMessage.includes('spouse')) {
    signals.push('family_situation')
  }

  // Urgency signals
  if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('quickly') || lowerMessage.includes('soon')) {
    signals.push('urgency')
  }

  return signals
}

// Extract interests from message
function extractInterests(message: string, property: any): string[] {
  const interests = []
  const lowerMessage = message.toLowerCase()

  // Property features
  if (lowerMessage.includes('kitchen')) interests.push('kitchen')
  if (lowerMessage.includes('bathroom')) interests.push('bathrooms')
  if (lowerMessage.includes('bedroom')) interests.push('bedrooms')
  if (lowerMessage.includes('garage')) interests.push('garage')
  if (lowerMessage.includes('yard') || lowerMessage.includes('garden')) interests.push('outdoor_space')
  if (lowerMessage.includes('basement')) interests.push('basement')
  if (lowerMessage.includes('pool')) interests.push('pool')

  // Location interests
  if (lowerMessage.includes('school')) interests.push('schools')
  if (lowerMessage.includes('commute') || lowerMessage.includes('work')) interests.push('commute')
  if (lowerMessage.includes('shopping')) interests.push('shopping')
  if (lowerMessage.includes('restaurant')) interests.push('dining')
  if (lowerMessage.includes('park')) interests.push('parks')
  if (lowerMessage.includes('transport')) interests.push('transportation')

  return interests
}

// Extract qualification data
function extractQualificationData(message: string): Record<string, any> {
  const data: Record<string, any> = {}
  const lowerMessage = message.toLowerCase()

  // Extract budget range
  const budgetMatch = message.match(/\$([\d,]+)(?:\s*(?:to|-)\s*\$([\d,]+))?/)
  if (budgetMatch) {
    data.budget_range = {
      min: parseInt(budgetMatch[1].replace(/,/g, '')),
      max: budgetMatch[2] ? parseInt(budgetMatch[2].replace(/,/g, '')) : null
    }
  }

  // Extract timeline
  if (lowerMessage.includes('month')) {
    const monthMatch = message.match(/(\d+)\s*months?/)
    if (monthMatch) {
      data.timeline_months = parseInt(monthMatch[1])
    }
  }

  return data
}

// Generate follow-up questions
function generateFollowUpQuestions(message: string, context: any): string[] {
  const questions = []
  const leadScore = context.lead_qualification.current_score

  if (leadScore < 30) {
    questions.push("What's most important to you in your next home?")
    questions.push("Are you currently looking to buy in this area?")
  } else if (leadScore < 60) {
    questions.push("What's your timeline for making a move?")
    questions.push("Would you like to schedule a viewing of this property?")
  } else {
    questions.push("Would you like me to connect you directly with our agent?")
    questions.push("Are you ready to make an offer if this property meets your needs?")
  }

  return questions
}

// Determine suggested actions
function determineSuggestedActions(leadSignals: string[], context: any): string[] {
  const actions = []
  const score = context.lead_qualification.current_score

  if (leadSignals.includes('viewing_interest')) {
    actions.push('schedule_viewing')
  }

  if (leadSignals.includes('budget_discussion') && leadSignals.includes('timeline_interest')) {
    actions.push('contact_agent')
  }

  if (score >= 70) {
    actions.push('priority_follow_up')
  }

  if (leadSignals.includes('urgency')) {
    actions.push('immediate_response')
  }

  return actions
}

// Calculate lead score
function calculateLeadScore(currentScore: number, leadSignals: string[]): number {
  let newScore = currentScore

  const scoreIncrements = {
    budget_discussion: 15,
    timeline_interest: 12,
    viewing_interest: 20,
    financing_discussion: 10,
    family_situation: 8,
    urgency: 15
  }

  leadSignals.forEach(signal => {
    if (scoreIncrements[signal as keyof typeof scoreIncrements]) {
      newScore += scoreIncrements[signal as keyof typeof scoreIncrements]
    }
  })

  return Math.min(newScore, 100) // Cap at 100
}

// Generate conversation summary
function generateConversationSummary(history: any[], currentMessage: string, response: string): string {
  const totalMessages = history.length + 1
  const interests = history.flatMap(h => h.lead_signals || [])
  
  return `${totalMessages} message conversation. Key interests: ${interests.join(', ') || 'General inquiry'}. Latest: ${currentMessage.substring(0, 100)}...`
}