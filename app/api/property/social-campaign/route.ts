import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database, SocialPostWithStats } from '@/types/supabase'

// 70-Day Autonomous Social Media Campaign Generator
export async function POST(request: NextRequest) {
  try {
    const { property_id, campaign_settings = {} } = await request.json()

    if (!property_id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify user authentication and property ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get property details with images and brand context
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('id', property_id)
      .eq('agent_id', user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      )
    }

    // Get agent's brand assets and social media preferences
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    // Check if campaign already exists
    const { data: existingPosts } = await supabase
      .from('social_posts')
      .select('id')
      .eq('property_id', property_id)
      .limit(1)

    if (existingPosts && existingPosts.length > 0 && !campaign_settings.regenerate) {
      return NextResponse.json(
        { error: 'Social media campaign already exists for this property. Use regenerate=true to recreate.' },
        { status: 400 }
      )
    }

    // Prepare 70-day campaign generation payload
    const campaignPayload = {
      property_id,
      agent_id: user.id,
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
        year_built: property.year_built
      },
      brand_context: {
        company_name: brandData?.company_name || 'Nester',
        persona_tone: brandData?.persona_tone || 'Professional & Authoritative',
        persona_style: brandData?.persona_style || 'Concise & Factual',
        key_phrases: brandData?.persona_key_phrases || ['Discover your dream home'],
        avoid_phrases: brandData?.persona_phrases_to_avoid || ['cheap', 'deal'],
        brand_tier: brandData?.brand_tier || 'nester_default',
        primary_color: brandData?.primary_color || brandData?.nester_primary_color,
        secondary_color: brandData?.secondary_color || brandData?.nester_secondary_color
      },
      campaign_structure: {
        duration_days: 70,
        posts_per_day: 3,
        total_posts: 210,
        weekly_themes: [
          { week: 1, theme: 'The Grand Unveiling', focus: 'property_introduction' },
          { week: 2, theme: 'Home Features Spotlight', focus: 'feature_highlights' },
          { week: 3, theme: 'Neighborhood Discovery', focus: 'location_benefits' },
          { week: 4, theme: 'Lifestyle & Community', focus: 'lifestyle_appeal' },
          { week: 5, theme: 'Investment Opportunity', focus: 'financial_benefits' },
          { week: 6, theme: 'Behind the Scenes', focus: 'process_transparency' },
          { week: 7, theme: 'Buyer Stories & Testimonials', focus: 'social_proof' },
          { week: 8, theme: 'Final Features Showcase', focus: 'unique_selling_points' },
          { week: 9, theme: 'Last Call Marketing', focus: 'urgency_creation' },
          { week: 10, theme: 'Closing Push', focus: 'final_opportunity' }
        ],
        content_archetypes: [
          'feature_spotlight',
          'before_after_styling',
          'local_gem',
          'data_insight',
          'poll_question',
          'lifestyle_story',
          'meet_the_expert',
          'virtual_tour_teaser',
          'neighborhood_highlight',
          'investment_analysis'
        ],
        platforms: [
          'instagram',
          'facebook', 
          'linkedin',
          'tiktok',
          'twitter',
          'bluesky',
          'threads'
        ]
      },
      visual_assets: {
        available_images: property.property_images?.length || 0,
        style_variations: ['contemporary', 'bohemian', 'traditional', 'scandinavian'],
        aspect_ratios: ['1:1', '9:16', '16:9'],
        template_system: 'modular_components_tailwind_daisyui'
      },
      scheduling_algorithm: {
        never_repeat_rule: true,
        optimal_timing: true,
        platform_specific_optimization: true,
        engagement_based_adjustment: true
      },
      campaign_settings: {
        auto_publish: campaign_settings.auto_publish || false,
        start_date: campaign_settings.start_date || new Date().toISOString(),
        timezone: campaign_settings.timezone || 'America/New_York',
        regenerate: campaign_settings.regenerate || false
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/social-campaign/callback`
    }

    // Trigger N8N Social Media Campaign Generation Workflow
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/social-campaign-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify(campaignPayload)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N social campaign generation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate social media campaign generation' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Update property with campaign generation status
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        content_generation_status: 'generating_social_campaign',
        content_generation_started_at: new Date().toISOString()
      })
      .eq('id', property_id)

    if (updateError) {
      console.error('Error updating property with campaign job:', updateError)
    }

    return NextResponse.json({
      success: true,
      job_id: n8nResult.execution_id || n8nResult.job_id,
      status: 'generating',
      message: '70-day social media campaign generation initiated. This will take 10-15 minutes.',
      estimated_completion: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      campaign_details: {
        duration_days: 70,
        total_posts: 210,
        posts_per_day: 3,
        platforms: 7,
        weekly_themes: 10,
        content_archetypes: 10,
        never_repeat_guarantee: true
      }
    })

  } catch (error) {
    console.error('Social campaign generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get social media campaign status and analytics
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

    // Get property and social posts
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        content_generation_status,
        content_generation_started_at,
        content_generation_completed_at
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

    // Get social posts with stats
    const { data: socialPosts, error: postsError } = await supabase
      .from('social_posts')
      .select(`
        *,
        social_stats(*)
      `)
      .eq('property_id', propertyId)
      .order('scheduled_time', { ascending: true })

    if (postsError) {
      console.error('Error fetching social posts:', postsError)
    }

    const posts = socialPosts || []

    // Calculate campaign analytics
    const campaignAnalytics = {
      total_posts: posts.length,
      posts_by_platform: posts.reduce((acc, post) => {
        if (post.platform) {
          acc[post.platform] = (acc[post.platform] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      posts_by_status: posts.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      posts_by_archetype: posts.reduce((acc, post) => {
        if (post.archetype) {
          acc[post.archetype] = (acc[post.archetype] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      total_engagement: posts.reduce((sum, post) => {
        const stats = Array.isArray(post.social_stats) ? post.social_stats[0] : null
        return sum + (stats?.engagements || 0) + (stats?.clicks || 0) + (stats?.shares || 0)
      }, 0),
      total_reach: posts.reduce((sum, post) => {
        const stats = Array.isArray(post.social_stats) ? post.social_stats[0] : null
        return sum + (stats?.impressions || 0)
      }, 0),
      total_impressions: posts.reduce((sum, post) => {
        const stats = Array.isArray(post.social_stats) ? post.social_stats[0] : null
        return sum + (stats?.impressions || 0)
      }, 0),
      campaign_progress: {
        days_elapsed: property.content_generation_started_at 
          ? Math.floor((Date.now() - new Date(property.content_generation_started_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        posts_published: posts.filter(p => p.status === 'published').length,
        posts_scheduled: posts.filter(p => p.status === 'scheduled').length,
        completion_percentage: Math.round((posts.length / 210) * 100)
      }
    }

    return NextResponse.json({
      property_id: propertyId,
      status: property.content_generation_status || 'not_started',
      started_at: property.content_generation_started_at,
      completed_at: property.content_generation_completed_at,
      campaign_analytics: campaignAnalytics,
      recent_posts: posts.slice(0, 10).map(post => ({
        id: post.id,
        platform: post.platform,
        content: post.copy_text?.substring(0, 100) + '...',
        archetype: post.archetype,
        status: post.status,
        scheduled_for: post.scheduled_time,
        published_at: post.posted_time
      }))
    })

  } catch (error) {
    console.error('Error getting social campaign status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 70-Day Campaign Architecture Details
const CAMPAIGN_ARCHITECTURE = {
  overview: {
    duration: '70 days (10 weeks)',
    total_posts: 210,
    posts_per_day: 3,
    platforms: 7,
    never_repeat_content: true
  },
  weekly_themes: {
    week_1: { theme: 'The Grand Unveiling', focus: 'Property introduction and first impressions' },
    week_2: { theme: 'Home Features Spotlight', focus: 'Detailed room and feature highlights' },
    week_3: { theme: 'Neighborhood Discovery', focus: 'Local amenities and community benefits' },
    week_4: { theme: 'Lifestyle & Community', focus: 'Living experience and social aspects' },
    week_5: { theme: 'Investment Opportunity', focus: 'Financial benefits and market analysis' },
    week_6: { theme: 'Behind the Scenes', focus: 'Process transparency and expertise' },
    week_7: { theme: 'Buyer Stories & Testimonials', focus: 'Social proof and success stories' },
    week_8: { theme: 'Final Features Showcase', focus: 'Unique selling points and differentiators' },
    week_9: { theme: 'Last Call Marketing', focus: 'Urgency creation and scarcity messaging' },
    week_10: { theme: 'Closing Push', focus: 'Final opportunity and call-to-action' }
  },
  content_archetypes: {
    feature_spotlight: 'Highlight specific rooms or property features',
    before_after_styling: 'Show AI-restyled room transformations',
    local_gem: 'Showcase neighborhood attractions and amenities',
    data_insight: 'Market statistics, commute times, school ratings',
    poll_question: 'Engagement-driving interactive content',
    lifestyle_story: 'Day-in-the-life scenarios for potential buyers',
    meet_the_expert: 'Agent/developer expertise and credentials',
    virtual_tour_teaser: 'Preview clips of property walkthrough',
    neighborhood_highlight: 'Community events and local culture',
    investment_analysis: 'ROI potential and market trends'
  },
  platform_optimization: {
    instagram: { formats: ['feed_post', 'story', 'reel'], optimal_times: ['11am', '2pm', '5pm'] },
    facebook: { formats: ['post', 'story'], optimal_times: ['9am', '1pm', '3pm'] },
    linkedin: { formats: ['post', 'article'], optimal_times: ['8am', '12pm', '5pm'] },
    tiktok: { formats: ['video', 'slideshow'], optimal_times: ['6am', '10am', '7pm'] },
    twitter: { formats: ['tweet', 'thread'], optimal_times: ['9am', '12pm', '6pm'] },
    bluesky: { formats: ['post'], optimal_times: ['10am', '2pm', '8pm'] },
    threads: { formats: ['post'], optimal_times: ['11am', '3pm', '7pm'] }
  },
  never_repeat_algorithm: {
    archetype_exclusion: '24 hours between same archetype',
    room_feature_exclusion: '48 hours between same room/feature',
    style_exclusion: '72 hours between same styling approach',
    content_uniqueness: 'Every post is completely unique across 70 days'
  }
}