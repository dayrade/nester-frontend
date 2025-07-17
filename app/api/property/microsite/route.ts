import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// White-Label Microsite Generator
export async function POST(request: NextRequest) {
  try {
    const { property_id, microsite_settings = {} } = await request.json()

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

    // Get comprehensive property details with all related data
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

    // Get agent's complete brand configuration
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    // Check if microsite already exists
    if (property.microsite_url && !microsite_settings.regenerate) {
      return NextResponse.json({
        success: true,
        microsite_url: property.microsite_url,
        status: 'existing',
        message: 'Microsite already exists. Use regenerate=true to recreate.'
      })
    }

    // Generate unique microsite subdomain/path
    const micrositeSlug = generateMicrositeSlug(property.address, property_id)
    const micrositeUrl = `${process.env.NEXT_PUBLIC_MICROSITE_DOMAIN}/${micrositeSlug}`

    // Prepare comprehensive microsite generation payload
    const micrositePayload = {
      property_id,
      agent_id: user.id,
      microsite_slug: micrositeSlug,
      microsite_url: micrositeUrl,
      
      // Property Data
      property_data: {
        // Core Details
        address: property.address,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_feet: property.square_feet,
        lot_size: property.lot_size,
        property_type: property.property_type,
        listing_status: property.listing_status,
        year_built: property.year_built,
        
        // Enhanced Details
        description: property.description,
        features: property.features,
        neighborhood_info: property.neighborhood_info,
        school_district: property.school_district,
        hoa_fees: property.hoa_fees,
        property_taxes: property.property_taxes,
        
        // Location & Scores
        latitude: property.latitude,
        longitude: property.longitude,
        walkability_score: property.walkability_score,
        transit_score: property.transit_score,
        bike_score: property.bike_score,
        
        // Market Information
        days_on_market: property.days_on_market,
        price_per_sqft: property.price && property.square_feet ? property.price / property.square_feet : null,
        
        // Media Assets
        images: property.property_images?.map(img => ({
          url: img.image_url,
          caption: img.caption,
          room_type: img.room_type,
          is_primary: img.is_primary,
          style_variant: img.style_variant,
          alt_text: img.alt_text
        })) || [],
        
        // Virtual Tour & Media
        virtual_tour_url: property.virtual_tour_url,
        video_tour_url: property.video_tour_url,
        floor_plan_url: property.floor_plan_url
      },
      
      // Complete Brand Configuration
      brand_configuration: {
        // Company Identity
        company_name: brandData?.company_name || 'Nester',
        agent_name: brandData?.agent_name || 'Real Estate Professional',
        agent_title: brandData?.agent_title || 'Licensed Real Estate Agent',
        agent_bio: brandData?.agent_bio,
        agent_photo_url: brandData?.agent_photo_url,
        
        // Contact Information
        agent_phone: brandData?.agent_phone,
        agent_email: brandData?.agent_email,
        agent_website: brandData?.agent_website,
        office_address: brandData?.office_address,
        
        // Visual Brand Identity
        logo_url: brandData?.logo_url || brandData?.nester_logo_url,
        favicon_url: brandData?.favicon_url,
        primary_color: brandData?.primary_color || brandData?.nester_primary_color,
        secondary_color: brandData?.secondary_color || brandData?.nester_secondary_color,
        accent_color: brandData?.accent_color || brandData?.nester_accent_color,
        background_color: brandData?.background_color,
        text_color: brandData?.text_color,
        
        // Typography
        primary_font: brandData?.primary_font || 'Inter',
        secondary_font: brandData?.secondary_font || 'Playfair Display',
        
        // Brand Personality
        persona_tone: brandData?.persona_tone || 'Professional & Authoritative',
        persona_style: brandData?.persona_style || 'Concise & Factual',
        key_phrases: brandData?.persona_key_phrases || ['Discover your dream home'],
        tagline: brandData?.company_tagline,
        
        // Social Media
        social_media: {
          facebook: brandData?.facebook_url,
          instagram: brandData?.instagram_url,
          linkedin: brandData?.linkedin_url,
          twitter: brandData?.twitter_url,
          youtube: brandData?.youtube_url
        },
        
        // Brand Tier & White Label Settings
        brand_tier: brandData?.brand_tier || 'nester_default',
        white_label_enabled: brandData?.brand_tier !== 'nester_default',
        hide_nester_branding: brandData?.brand_tier === 'enterprise',
        custom_domain_enabled: brandData?.brand_tier === 'enterprise'
      },
      
      // Microsite Configuration
      microsite_configuration: {
        // Layout & Design
        template_style: microsite_settings.template_style || 'modern_luxury',
        layout_type: microsite_settings.layout_type || 'single_page', // single_page, multi_page
        hero_style: microsite_settings.hero_style || 'full_screen_gallery',
        navigation_style: microsite_settings.navigation_style || 'sticky_header',
        
        // Content Sections
        enabled_sections: microsite_settings.enabled_sections || [
          'hero_gallery',
          'property_overview',
          'features_amenities',
          'photo_gallery',
          'neighborhood_info',
          'virtual_tour',
          'contact_form',
          'agent_profile',
          'similar_properties'
        ],
        
        // Interactive Features
        enable_chat_widget: microsite_settings.enable_chat_widget !== false,
        enable_contact_forms: microsite_settings.enable_contact_forms !== false,
        enable_virtual_tour: microsite_settings.enable_virtual_tour !== false,
        enable_photo_gallery: microsite_settings.enable_photo_gallery !== false,
        enable_neighborhood_map: microsite_settings.enable_neighborhood_map !== false,
        enable_mortgage_calculator: microsite_settings.enable_mortgage_calculator !== false,
        enable_social_sharing: microsite_settings.enable_social_sharing !== false,
        
        // SEO & Analytics
        seo_optimization: {
          meta_title: `${property.address} - ${brandData?.company_name || 'Nester'}`,
          meta_description: property.description?.substring(0, 160) || `Beautiful ${property.property_type} for sale`,
          keywords: generateSEOKeywords(property, brandData),
          og_image: property.property_images?.find(img => img.is_primary)?.image_url,
          structured_data: true
        },
        
        // Performance & Technical
        performance_optimization: {
          lazy_loading: true,
          image_optimization: true,
          cdn_enabled: true,
          mobile_optimized: true,
          pwa_enabled: microsite_settings.pwa_enabled || false
        },
        
        // Lead Capture
        lead_capture: {
          contact_form_style: microsite_settings.contact_form_style || 'floating_button',
          required_fields: microsite_settings.required_fields || ['name', 'email', 'phone'],
          optional_fields: microsite_settings.optional_fields || ['message', 'timeline', 'financing_status'],
          auto_responder_enabled: microsite_settings.auto_responder_enabled !== false,
          lead_notification_email: brandData?.agent_email
        },
        
        // Custom Features
        custom_css: microsite_settings.custom_css,
        custom_javascript: microsite_settings.custom_javascript,
        google_analytics_id: brandData?.google_analytics_id,
        facebook_pixel_id: brandData?.facebook_pixel_id
      },
      
      // Technical Specifications
      technical_specs: {
        framework: 'next_js_14',
        styling: 'tailwind_css_daisyui',
        hosting: 'vercel_edge',
        database: 'supabase',
        cdn: 'vercel_edge_network',
        ssl_enabled: true,
        compression_enabled: true,
        caching_strategy: 'edge_caching'
      },
      
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/microsite/callback`
    }

    // Trigger N8N Microsite Generation Workflow
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/microsite-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify(micrositePayload)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N microsite generation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate microsite generation' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Update property with microsite generation status
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        microsite_url: micrositeUrl,
        microsite_slug: micrositeSlug,
        microsite_generation_started_at: new Date().toISOString(),
        content_generation_status: 'generating_microsite'
      })
      .eq('id', property_id)

    if (updateError) {
      console.error('Error updating property with microsite info:', updateError)
    }

    return NextResponse.json({
      success: true,
      job_id: n8nResult.execution_id || n8nResult.job_id,
      status: 'generating',
      microsite_url: micrositeUrl,
      microsite_slug: micrositeSlug,
      message: 'White-label microsite generation initiated. This will take 3-5 minutes.',
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      microsite_details: {
        template_style: micrositePayload.microsite_configuration.template_style,
        white_label_enabled: micrositePayload.brand_configuration.white_label_enabled,
        sections_count: micrositePayload.microsite_configuration.enabled_sections.length,
        interactive_features: Object.keys(micrositePayload.microsite_configuration)
          .filter(key => key.startsWith('enable_') && micrositePayload.microsite_configuration[key as keyof typeof micrositePayload.microsite_configuration])
          .length,
        seo_optimized: true,
        mobile_responsive: true
      }
    })

  } catch (error) {
    console.error('Microsite generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get microsite status and analytics
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

    // Get property with microsite information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        microsite_url,
        microsite_slug,
        microsite_generation_started_at,
        microsite_analytics,
        content_generation_status
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

    // Get chat sessions for this property (microsite engagement)
    const { data: chatSessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    const micrositeStatus = {
      property_id: propertyId,
      microsite_url: property.microsite_url,
      microsite_slug: property.microsite_slug,
      status: property.content_generation_status?.includes('microsite') 
        ? property.content_generation_status 
        : property.microsite_url ? 'completed' : 'not_started',
      started_at: property.microsite_generation_started_at,
      
      // Analytics Data
      analytics: property.microsite_analytics || {
        total_visits: 0,
        unique_visitors: 0,
        page_views: 0,
        average_session_duration: 0,
        bounce_rate: 0,
        conversion_rate: 0,
        lead_captures: 0
      },
      
      // Engagement Metrics
      engagement: {
        chat_sessions: chatSessions?.length || 0,
        qualified_leads: chatSessions?.filter(session => session.lead_qualification_score >= 70).length || 0,
        total_messages: chatSessions?.reduce((sum, session) => sum + (session.total_messages || 0), 0) || 0,
        average_lead_score: chatSessions?.length 
          ? chatSessions.reduce((sum, session) => sum + (session.lead_qualification_score || 0), 0) / chatSessions.length
          : 0
      },
      
      // Recent Activity
      recent_visitors: chatSessions?.slice(0, 5).map(session => ({
        session_id: session.id,
        started_at: session.created_at,
        lead_score: session.lead_qualification_score,
        interests: session.identified_interests,
        location: session.visitor_info?.location,
        device: session.visitor_info?.device_type
      })) || []
    }

    return NextResponse.json(micrositeStatus)

  } catch (error) {
    console.error('Error getting microsite status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate unique microsite slug
function generateMicrositeSlug(address: string, propertyId: string): string {
  const cleanAddress = address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
  
  const shortId = propertyId.substring(0, 8)
  return `${cleanAddress}-${shortId}`
}

// Generate SEO keywords
function generateSEOKeywords(property: any, brandData: any): string[] {
  const keywords = [
    property.property_type,
    'for sale',
    property.address?.split(',')[1]?.trim(), // City
    `${property.bedrooms} bedroom`,
    `${property.bathrooms} bathroom`,
    brandData?.company_name || 'real estate',
    'home',
    'house',
    'property'
  ].filter(Boolean)

  if (property.features) {
    keywords.push(...property.features.slice(0, 5))
  }

  return keywords
}

// Available Microsite Templates
const MICROSITE_TEMPLATES = {
  modern_luxury: {
    description: 'Clean, minimalist design with premium feel',
    best_for: 'High-end properties, luxury homes',
    features: ['Full-screen gallery', 'Smooth animations', 'Premium typography']
  },
  classic_elegance: {
    description: 'Traditional layout with sophisticated styling',
    best_for: 'Historic homes, traditional properties',
    features: ['Classic navigation', 'Elegant typography', 'Warm color schemes']
  },
  contemporary_bold: {
    description: 'Dynamic layouts with strong visual impact',
    best_for: 'Modern condos, urban properties',
    features: ['Bold typography', 'Dynamic layouts', 'High contrast design']
  },
  family_friendly: {
    description: 'Warm, approachable design emphasizing lifestyle',
    best_for: 'Family homes, suburban properties',
    features: ['Lifestyle focus', 'Warm colors', 'Family-oriented content']
  },
  investment_focused: {
    description: 'Data-driven layout with ROI emphasis',
    best_for: 'Investment properties, commercial real estate',
    features: ['Financial data display', 'ROI calculators', 'Market analytics']
  }
}