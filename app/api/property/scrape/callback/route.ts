import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

interface ScrapingResult {
  success: boolean
  property_id: string
  execution_id: string
  data?: {
    address: string
    price?: number
    bedrooms?: number
    bathrooms?: number
    square_feet?: number
    property_type?: string
    description?: string
    features?: string[]
    neighborhood_info?: string
    images?: Array<{
      url: string
      alt?: string
      is_primary?: boolean
    }>
    listing_agent?: {
      name?: string
      phone?: string
      email?: string
    }
    property_details?: {
      year_built?: number
      lot_size?: number
      garage_spaces?: number
      heating?: string
      cooling?: string
      flooring?: string[]
    }
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if configured
    const signature = request.headers.get('x-n8n-signature')
    if (process.env.N8N_WEBHOOK_SECRET && signature) {
      // Implement signature verification here if needed
      // const isValid = verifySignature(body, signature, process.env.N8N_WEBHOOK_SECRET)
      // if (!isValid) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      // }
    }

    const result: ScrapingResult = await request.json()

    if (!result.property_id || !result.execution_id) {
      return NextResponse.json(
        { error: 'Missing required fields: property_id, execution_id' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Find the property by scraping job ID
    const { data: property, error: findError } = await supabase
      .from('properties')
      .select('*')
      .eq('scraping_job_id', result.execution_id)
      .single()

    if (findError || !property) {
      console.error('Property not found for execution_id:', result.execution_id)
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (result.success && result.data) {
      // Update property with scraped data
      const updateData = {
        address: result.data.address,
        price: result.data.price,
        bedrooms: result.data.bedrooms,
        bathrooms: result.data.bathrooms,
        square_feet: result.data.square_feet,
        property_type: result.data.property_type || 'house',
        description: result.data.description,
        features: result.data.features || [],
        neighborhood_info: result.data.neighborhood_info,
        listing_status: 'active',
        scraping_completed_at: new Date().toISOString(),
        // Additional details
        year_built: result.data.property_details?.year_built,
        lot_size: result.data.property_details?.lot_size,
        garage_spaces: result.data.property_details?.garage_spaces,
        heating_type: result.data.property_details?.heating,
        cooling_type: result.data.property_details?.cooling,
        flooring_types: result.data.property_details?.flooring,
        // Listing agent info
        listing_agent_name: result.data.listing_agent?.name,
        listing_agent_phone: result.data.listing_agent?.phone,
        listing_agent_email: result.data.listing_agent?.email
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', property.id)

      if (updateError) {
        console.error('Error updating property:', updateError)
        return NextResponse.json(
          { error: 'Failed to update property' },
          { status: 500 }
        )
      }

      // Process and store images
      if (result.data.images && result.data.images.length > 0) {
        await processPropertyImages(supabase, property.id, result.data.images)
      }

      // Trigger content generation workflow
      await triggerContentGeneration(property.id)

      console.log(`Property ${property.id} successfully updated with scraped data`)

    } else {
      // Handle scraping failure
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          listing_status: 'error',
          scraping_error: result.error || 'Unknown scraping error',
          scraping_completed_at: new Date().toISOString()
        })
        .eq('id', property.id)

      if (updateError) {
        console.error('Error updating property with error status:', updateError)
      }

      console.error(`Property scraping failed for ${property.id}:`, result.error)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Scraping callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processPropertyImages(
  supabase: any,
  propertyId: string,
  images: Array<{ url: string; alt?: string; is_primary?: boolean }>
) {
  try {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Download and store image
      const imageResponse = await fetch(image.url)
      if (!imageResponse.ok) continue

      const imageBuffer = await imageResponse.arrayBuffer()
      const fileExt = image.url.split('.').pop()?.split('?')[0] || 'jpg'
      const fileName = `${propertyId}/${Date.now()}-${i}.${fileExt}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, imageBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }

      // Create image record
      const { error: imageError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          storage_path: fileName,
          original_url: image.url,
          alt_text: image.alt,
          display_order: i,
          is_primary: image.is_primary || i === 0
        })

      if (imageError) {
        console.error('Error creating image record:', imageError)
      }
    }
  } catch (error) {
    console.error('Error processing property images:', error)
  }
}

async function triggerContentGeneration(propertyId: string) {
  try {
    // Trigger N8N content generation workflow
    const response = await fetch(`${process.env.N8N_WEBHOOK_URL}/content-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify({
        property_id: propertyId,
        generate_all: true, // Generate all content types
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/content/callback`
      })
    })

    if (!response.ok) {
      console.error('Failed to trigger content generation:', await response.text())
    }
  } catch (error) {
    console.error('Error triggering content generation:', error)
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Property scraping callback endpoint - POST only',
    timestamp: new Date().toISOString()
  })
}