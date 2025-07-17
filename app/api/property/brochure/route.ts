import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Professional PDF Brochure Generator
export async function POST(request: NextRequest) {
  try {
    const { property_id, brochure_settings = {} } = await request.json()

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

    // Get comprehensive property details with images
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

    // Get agent's brand assets and preferences
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    // Prepare comprehensive brochure generation payload
    const brochurePayload = {
      property_id,
      agent_id: user.id,
      property_data: {
        // Basic Information
        address: property.address,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_feet: property.square_feet,
        lot_size: property.lot_size,
        property_type: property.property_type,
        listing_status: property.listing_status,
        year_built: property.year_built,
        
        // Detailed Information
        description: property.description,
        features: property.features,
        neighborhood_info: property.neighborhood_info,
        school_district: property.school_district,
        hoa_fees: property.hoa_fees,
        property_taxes: property.property_taxes,
        
        // Location Data
        latitude: property.latitude,
        longitude: property.longitude,
        walkability_score: property.walkability_score,
        transit_score: property.transit_score,
        bike_score: property.bike_score,
        
        // Market Data
        days_on_market: property.days_on_market,
        price_per_sqft: property.price && property.square_feet ? property.price / property.square_feet : null,
        
        // Images
        images: property.property_images?.map(img => ({
          url: img.image_url,
          caption: img.caption,
          room_type: img.room_type,
          is_primary: img.is_primary,
          style_variant: img.style_variant
        })) || []
      },
      brand_context: {
        // Company Information
        company_name: brandData?.company_name || 'Nester',
        agent_name: brandData?.agent_name || 'Real Estate Professional',
        agent_title: brandData?.agent_title || 'Licensed Real Estate Agent',
        agent_phone: brandData?.agent_phone,
        agent_email: brandData?.agent_email,
        agent_website: brandData?.agent_website,
        
        // Brand Identity
        logo_url: brandData?.logo_url || brandData?.nester_logo_url,
        primary_color: brandData?.primary_color || brandData?.nester_primary_color,
        secondary_color: brandData?.secondary_color || brandData?.nester_secondary_color,
        accent_color: brandData?.accent_color || brandData?.nester_accent_color,
        
        // Brand Personality
        persona_tone: brandData?.persona_tone || 'Professional & Authoritative',
        persona_style: brandData?.persona_style || 'Concise & Factual',
        key_phrases: brandData?.persona_key_phrases || ['Discover your dream home'],
        
        // Brand Tier
        brand_tier: brandData?.brand_tier || 'nester_default',
        white_label_enabled: brandData?.brand_tier !== 'nester_default'
      },
      brochure_specifications: {
        // Layout Options
        template_style: brochure_settings.template_style || 'modern_luxury',
        page_count: brochure_settings.page_count || 'auto', // 2, 4, 6, 8, or 'auto'
        orientation: brochure_settings.orientation || 'portrait', // portrait or landscape
        size: brochure_settings.size || 'letter', // letter, a4, legal
        
        // Content Sections
        include_sections: brochure_settings.include_sections || [
          'cover_page',
          'property_overview',
          'feature_highlights',
          'photo_gallery',
          'floor_plan',
          'neighborhood_map',
          'market_analysis',
          'agent_profile',
          'contact_information'
        ],
        
        // Design Preferences
        color_scheme: brochure_settings.color_scheme || 'brand_colors',
        typography: brochure_settings.typography || 'modern_serif',
        image_treatment: brochure_settings.image_treatment || 'high_contrast',
        
        // Content Density
        content_density: brochure_settings.content_density || 'balanced', // minimal, balanced, detailed
        
        // Special Features
        include_qr_code: brochure_settings.include_qr_code !== false,
        include_virtual_tour_link: brochure_settings.include_virtual_tour_link !== false,
        include_social_media: brochure_settings.include_social_media !== false,
        watermark_protection: brochure_settings.watermark_protection || false
      },
      advanced_features: {
        // AI-Enhanced Content
        ai_enhanced_descriptions: true,
        market_insights_generation: true,
        lifestyle_narrative: true,
        investment_analysis: brochure_settings.include_investment_analysis || false,
        
        // Interactive Elements (for digital version)
        clickable_links: true,
        embedded_video_thumbnails: brochure_settings.include_video_links || false,
        
        // Accessibility
        screen_reader_friendly: true,
        high_contrast_version: brochure_settings.accessibility_version || false
      },
      output_formats: {
        // Primary Output
        pdf_high_quality: true, // Print-ready 300 DPI
        pdf_web_optimized: true, // Web-friendly smaller file size
        
        // Additional Formats
        interactive_flipbook: brochure_settings.generate_flipbook !== false,
        social_media_snippets: brochure_settings.generate_social_snippets || false,
        email_friendly_version: brochure_settings.generate_email_version || false
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/brochure/callback`
    }

    // Trigger N8N PDF Brochure Generation Workflow
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/brochure-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify(brochurePayload)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N brochure generation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate brochure generation' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Update property with brochure generation status
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        content_generation_status: 'generating_brochure',
        brochure_generation_started_at: new Date().toISOString()
      })
      .eq('id', property_id)

    if (updateError) {
      console.error('Error updating property with brochure job:', updateError)
    }

    return NextResponse.json({
      success: true,
      job_id: n8nResult.execution_id || n8nResult.job_id,
      status: 'generating',
      message: 'Professional PDF brochure generation initiated. This will take 5-8 minutes.',
      estimated_completion: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      brochure_details: {
        template_style: brochurePayload.brochure_specifications.template_style,
        estimated_pages: brochurePayload.brochure_specifications.page_count,
        output_formats: Object.keys(brochurePayload.output_formats).filter(key => 
          brochurePayload.output_formats[key as keyof typeof brochurePayload.output_formats]
        ),
        brand_customization: brochurePayload.brand_context.white_label_enabled,
        ai_enhanced: true
      }
    })

  } catch (error) {
    console.error('Brochure generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get brochure generation status and download links
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

    // Get property with brochure information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        brochure_generation_started_at,
        brochure_pdf_url,
        brochure_flipbook_url,
        brochure_generation_metadata,
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

    const brochureStatus = {
      property_id: propertyId,
      status: property.content_generation_status?.includes('brochure') 
        ? property.content_generation_status 
        : 'not_started',
      started_at: property.brochure_generation_started_at,
      
      // Download Links
      downloads: {
        pdf_high_quality: property.brochure_pdf_url,
        interactive_flipbook: property.brochure_flipbook_url,
        web_optimized_pdf: property.brochure_generation_metadata?.web_pdf_url,
        social_snippets: property.brochure_generation_metadata?.social_snippets_urls
      },
      
      // Generation Details
      generation_details: property.brochure_generation_metadata ? {
        template_used: property.brochure_generation_metadata.template_style,
        page_count: property.brochure_generation_metadata.final_page_count,
        file_sizes: property.brochure_generation_metadata.file_sizes,
        generation_duration: property.brochure_generation_metadata.generation_duration_minutes,
        ai_enhancements_applied: property.brochure_generation_metadata.ai_enhancements,
        brand_customization_level: property.brochure_generation_metadata.brand_customization_level
      } : null,
      
      // Preview Information
      preview: property.brochure_generation_metadata ? {
        cover_image_url: property.brochure_generation_metadata.cover_preview_url,
        page_thumbnails: property.brochure_generation_metadata.page_thumbnails || []
      } : null
    }

    return NextResponse.json(brochureStatus)

  } catch (error) {
    console.error('Error getting brochure status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Brochure Template Styles Available
const BROCHURE_TEMPLATES = {
  modern_luxury: {
    description: 'Clean, minimalist design with premium typography',
    best_for: 'High-end properties, luxury homes',
    color_schemes: ['monochrome', 'brand_colors', 'gold_accent']
  },
  classic_elegance: {
    description: 'Traditional layout with sophisticated styling',
    best_for: 'Historic homes, traditional properties',
    color_schemes: ['navy_gold', 'forest_cream', 'brand_colors']
  },
  contemporary_bold: {
    description: 'Dynamic layouts with strong visual hierarchy',
    best_for: 'Modern condos, urban properties',
    color_schemes: ['high_contrast', 'vibrant_accent', 'brand_colors']
  },
  family_friendly: {
    description: 'Warm, approachable design emphasizing lifestyle',
    best_for: 'Family homes, suburban properties',
    color_schemes: ['warm_earth', 'soft_pastels', 'brand_colors']
  },
  investment_focused: {
    description: 'Data-driven layout with financial emphasis',
    best_for: 'Investment properties, commercial real estate',
    color_schemes: ['corporate_blue', 'success_green', 'brand_colors']
  }
}