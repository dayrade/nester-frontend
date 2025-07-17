import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const { url, agent_id } = await request.json()

    if (!url || !agent_id) {
      return NextResponse.json(
        { error: 'URL and agent_id are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== agent_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Determine platform from URL
    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json(
        { error: 'Unsupported platform. Supported platforms: Zillow, Realtor.com, Redfin' },
        { status: 400 }
      )
    }

    // Trigger N8N workflow for property scraping
    const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/property-scraper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify({
        url,
        platform,
        agent_id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/property/scrape/callback`
      })
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N workflow error:', errorText)
      return NextResponse.json(
        { error: 'Failed to initiate property scraping' },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()

    // Create pending property record
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        agent_id,
        address: 'Processing...', // Will be updated by callback
        listing_url: url,
        listing_platform: platform,
        listing_status: 'processing',
        scraping_job_id: n8nResult.execution_id || n8nResult.job_id
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Error creating property record:', propertyError)
      return NextResponse.json(
        { error: 'Failed to create property record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      property_id: property.id,
      status: 'processing',
      message: 'Property scraping initiated. You will be notified when complete.'
    })

  } catch (error) {
    console.error('Property scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function detectPlatform(url: string): string | null {
  const hostname = new URL(url).hostname.toLowerCase()
  
  if (hostname.includes('zillow.com')) {
    return 'zillow'
  } else if (hostname.includes('realtor.com')) {
    return 'realtor'
  } else if (hostname.includes('redfin.com')) {
    return 'redfin'
  } else if (hostname.includes('homes.com')) {
    return 'homes'
  } else if (hostname.includes('trulia.com')) {
    return 'trulia'
  }
  
  return null
}

// Supported platforms and their scraping capabilities
const PLATFORM_CAPABILITIES = {
  zillow: {
    name: 'Zillow',
    supports: ['basic_info', 'images', 'description', 'features', 'neighborhood']
  },
  realtor: {
    name: 'Realtor.com',
    supports: ['basic_info', 'images', 'description', 'features']
  },
  redfin: {
    name: 'Redfin',
    supports: ['basic_info', 'images', 'description', 'features', 'neighborhood']
  },
  homes: {
    name: 'Homes.com',
    supports: ['basic_info', 'images', 'description']
  },
  trulia: {
    name: 'Trulia',
    supports: ['basic_info', 'images', 'description', 'neighborhood']
  }
}

export async function GET() {
  return NextResponse.json({
    supported_platforms: PLATFORM_CAPABILITIES,
    message: 'Property scraping API - POST to scrape a property URL'
  })
}