import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// AI Image Generation API Route for 4-Style Property Restyling
export async function POST(request: NextRequest) {
  try {
    const { property_id, regenerate = false } = await request.json()

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

    // Get property and its images
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

    if (!property.property_images || property.property_images.length === 0) {
      return NextResponse.json(
        { error: 'No images found for this property' },
        { status: 400 }
      )
    }

    // Get agent's brand assets for context
    const { data: brandData } = await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', user.id)
      .single()

    // Prepare image generation payload for N8N workflow
    const imageGenerationPayload = {
      property_id,
      agent_id: user.id,
      property_data: {
        address: property.address,
        property_type: property.property_type,
        description: property.description,
        features: property.features
      },
      brand_context: {
        company_name: brandData?.company_name || 'Nester',
        brand_tier: brandData?.brand_tier || 'nester_default'
      },
      images: property.property_images.map(img => ({
        id: img.id,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        is_primary: img.is_primary
      })),
      styles: [
        'contemporary',
        'bohemian', 
        'traditional',
        'scandinavian'
      ],
      aspect_ratios: ['1:1', '9:16', '16:9'],
      regenerate,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/images/callback`
    }

    // Trigger N8N AI Image Generation Workflow
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/ai-image-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify(imageGenerationPayload)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N AI image generation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate AI image generation' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Update property with image generation job ID
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        content_generation_status: 'processing_images',
        content_generation_started_at: new Date().toISOString()
      })
      .eq('id', property_id)

    if (updateError) {
      console.error('Error updating property with image job:', updateError)
    }

    return NextResponse.json({
      success: true,
      job_id: n8nResult.execution_id || n8nResult.job_id,
      status: 'processing',
      message: 'AI image generation initiated. This will take 5-10 minutes.',
      estimated_completion: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      styles_generating: ['contemporary', 'bohemian', 'traditional', 'scandinavian'],
      total_images_expected: property.property_images.length * 4 * 3 // 4 styles × 3 aspect ratios
    })

  } catch (error) {
    console.error('AI image generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get AI image generation status
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

    // Get property and AI-generated images
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        content_generation_status,
        content_generation_started_at,
        property_images(*)
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

    // Count generated images by style
    const imagesByStyle = {
      contemporary: property.property_images?.filter(img => 
        img.storage_path?.includes('/contemporary/')).length || 0,
      bohemian: property.property_images?.filter(img => 
        img.storage_path?.includes('/bohemian/')).length || 0,
      traditional: property.property_images?.filter(img => 
        img.storage_path?.includes('/traditional/')).length || 0,
      scandinavian: property.property_images?.filter(img => 
        img.storage_path?.includes('/scandinavian/')).length || 0
    }

    const totalGenerated = Object.values(imagesByStyle).reduce((sum, count) => sum + count, 0)
    const originalImages = property.property_images?.filter(img => 
      !img.storage_path?.includes('/contemporary/') &&
      !img.storage_path?.includes('/bohemian/') &&
      !img.storage_path?.includes('/traditional/') &&
      !img.storage_path?.includes('/scandinavian/')
    ).length || 0

    return NextResponse.json({
      property_id: propertyId,
      status: property.content_generation_status || 'not_started',
      started_at: property.content_generation_started_at,
      original_images: originalImages,
      generated_images: totalGenerated,
      images_by_style: imagesByStyle,
      completion_percentage: originalImages > 0 ? Math.round((totalGenerated / (originalImages * 4)) * 100) : 0
    })

  } catch (error) {
    console.error('Error getting AI image generation status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// AI Image Generation Capabilities
const AI_IMAGE_CAPABILITIES = {
  styles: {
    contemporary: {
      name: 'Contemporary',
      description: 'Clean, minimalist, neutral palette, modern elements - magazine editorial quality',
      characteristics: ['soft neutral palette', 'minimal high-quality elements', 'matt finishes', 'clean lines', 'modern lighting']
    },
    bohemian: {
      name: 'Bohemian', 
      description: 'Layered textures, warm colors, eclectic elements, natural features - Architectural Digest standard',
      characteristics: ['layered textures', 'warm earth tones', 'terracotta and jewel accents', 'natural materials', 'curated artistic elements']
    },
    traditional: {
      name: 'Traditional',
      description: 'Classic elements, refined palette, timeless features - luxury publication level',
      characteristics: ['soft neutrals (greige, sage, dusky blue)', 'classic proportions', 'quality materials', 'brass accents', 'timeless elements']
    },
    scandinavian: {
      name: 'Scandinavian',
      description: 'Bright, cozy, natural materials, hygge aesthetic - premium lifestyle magazine quality',
      characteristics: ['bright whites', 'warm wood tones', 'soft greys', 'clean lines', 'natural textiles', 'leafy plants']
    }
  },
  preservation_requirements: [
    'Preserve all window views and exterior elements identically',
    'Maintain precise space dimensions and layout', 
    'Keep all fitted features, built-ins, fixtures in identical positions',
    'Only restyle appearance, never move or reorient elements',
    'Achieve editorial quality styling suitable for high-end design publications'
  ],
  aspect_ratios: {
    '1:1': 'Square format for Instagram feed posts',
    '9:16': 'Vertical format for Instagram Stories, TikTok, Reels',
    '16:9': 'Horizontal format for Facebook, LinkedIn, YouTube'
  },
  estimated_time: '5-10 minutes per property',
  quality_standard: 'Magazine editorial quality suitable for high-end design publications'
}