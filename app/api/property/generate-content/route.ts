import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const { property_id, content_types, regenerate = false } = await request.json()

    if (!property_id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify user authentication and property ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*),
        agent_brands!inner(agent_id)
      `)
      .eq('id', property_id)
      .eq('agent_brands.agent_id', user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Get agent's brand assets for personalization
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    // Prepare content generation payload
    const contentPayload = {
      property_id,
      property_data: {
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
        lot_size: property.lot_size
      },
      brand_context: {
        company_name: brandData?.company_name || 'Nester',
        persona_tone: brandData?.persona_tone || 'Professional & Authoritative',
        persona_style: brandData?.persona_style || 'Concise & Factual',
        key_phrases: brandData?.persona_key_phrases || ['Discover your dream home'],
        avoid_phrases: brandData?.persona_phrases_to_avoid || ['cheap', 'deal'],
        agent_name: user.email?.split('@')[0] || 'Agent'
      },
      content_types: content_types || [
        'social_posts',
        'property_description',
        'email_campaigns',
        'virtual_tour_script'
      ],
      regenerate,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/content/callback`
    }

    // Trigger N8N content generation workflow
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/content-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify(contentPayload)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N content generation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate content generation' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Update property with generation job ID
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        content_generation_job_id: n8nResult.execution_id || n8nResult.job_id,
        content_generation_status: 'processing',
        content_generation_started_at: new Date().toISOString()
      })
      .eq('id', property_id)

    if (updateError) {
      console.error('Error updating property with job ID:', updateError)
    }

    return NextResponse.json({
      success: true,
      job_id: n8nResult.execution_id || n8nResult.job_id,
      status: 'processing',
      message: 'Content generation initiated. This may take a few minutes.',
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get content generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('property_id')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get property and content generation status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        content_generation_status,
        content_generation_started_at,
        content_generation_completed_at,
        content_generation_job_id
      `)
      .eq('id', propertyId)
      .eq('agent_id', user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Get generated content count
    const { data: socialPosts, error: postsError } = await supabase
      .from('social_posts')
      .select('id, platform, status')
      .eq('property_id', propertyId)

    const contentStats = {
      social_posts: socialPosts?.length || 0,
      platforms: Array.from(new Set(socialPosts?.map(p => p.platform) || [])),
      published_posts: socialPosts?.filter(p => p.status === 'published').length || 0,
      scheduled_posts: socialPosts?.filter(p => p.status === 'scheduled').length || 0
    }

    return NextResponse.json({
      property_id: propertyId,
      status: property.content_generation_status || 'not_started',
      job_id: property.content_generation_job_id,
      started_at: property.content_generation_started_at,
      completed_at: property.content_generation_completed_at,
      content_stats: contentStats
    })

  } catch (error) {
    console.error('Error getting content generation status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Content generation capabilities and pricing
const CONTENT_GENERATION_CAPABILITIES = {
  social_posts: {
    name: 'Social Media Posts',
    description: 'AI-generated posts for Instagram, Facebook, Twitter, LinkedIn',
    platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
    archetypes: [
      'luxury_showcase',
      'family_friendly',
      'investment_opportunity',
      'first_time_buyer',
      'neighborhood_highlight'
    ],
    estimated_time: '2-3 minutes'
  },
  property_description: {
    name: 'Enhanced Property Description',
    description: 'Professional, SEO-optimized property descriptions',
    features: ['seo_optimized', 'emotional_appeal', 'feature_highlighting'],
    estimated_time: '1-2 minutes'
  },
  email_campaigns: {
    name: 'Email Marketing Campaigns',
    description: 'Targeted email sequences for different buyer personas',
    campaign_types: ['new_listing', 'price_reduction', 'open_house', 'just_sold'],
    estimated_time: '3-4 minutes'
  },
  virtual_tour_script: {
    name: 'Virtual Tour Script',
    description: 'Engaging narration script for virtual property tours',
    features: ['room_by_room', 'feature_highlights', 'emotional_storytelling'],
    estimated_time: '2-3 minutes'
  }
}