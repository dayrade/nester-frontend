import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// PDF Brochure Generation Callback Handler
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    const {
      property_id,
      agent_id,
      status,
      job_id,
      brochure_files,
      generation_metadata,
      error_message
    } = payload

    if (!property_id || !agent_id) {
      return NextResponse.json(
        { error: 'Property ID and Agent ID are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    if (status === 'completed' && brochure_files) {
      // Process successful brochure generation
      console.log(`Brochure generation completed for property ${property_id}:`, generation_metadata)

      // Prepare update data with all generated files and metadata
      const updateData = {
        content_generation_status: 'brochure_completed',
        brochure_pdf_url: brochure_files.pdf_high_quality,
        brochure_flipbook_url: brochure_files.interactive_flipbook,
        brochure_generation_metadata: {
          job_id,
          template_style: generation_metadata?.template_style,
          final_page_count: generation_metadata?.page_count,
          generation_duration_minutes: generation_metadata?.generation_duration_minutes,
          
          // File Information
          file_sizes: {
            pdf_high_quality_mb: generation_metadata?.file_sizes?.pdf_high_quality_mb,
            pdf_web_optimized_mb: generation_metadata?.file_sizes?.pdf_web_optimized_mb,
            flipbook_size_mb: generation_metadata?.file_sizes?.flipbook_size_mb
          },
          
          // Additional Download Links
          web_pdf_url: brochure_files.pdf_web_optimized,
          social_snippets_urls: brochure_files.social_media_snippets,
          email_version_url: brochure_files.email_friendly_version,
          
          // Preview Assets
          cover_preview_url: brochure_files.cover_preview,
          page_thumbnails: brochure_files.page_thumbnails || [],
          
          // AI Enhancement Details
          ai_enhancements: {
            enhanced_descriptions: generation_metadata?.ai_enhancements?.enhanced_descriptions || false,
            market_insights_generated: generation_metadata?.ai_enhancements?.market_insights || false,
            lifestyle_narrative_created: generation_metadata?.ai_enhancements?.lifestyle_narrative || false,
            investment_analysis_included: generation_metadata?.ai_enhancements?.investment_analysis || false
          },
          
          // Brand Customization Level
          brand_customization_level: generation_metadata?.brand_customization_level || 'standard',
          
          // Quality Metrics
          quality_score: generation_metadata?.quality_score || 0,
          accessibility_compliance: generation_metadata?.accessibility_compliance || false,
          
          // Generation Settings Used
          settings_used: {
            template_style: generation_metadata?.settings?.template_style,
            orientation: generation_metadata?.settings?.orientation,
            size: generation_metadata?.settings?.size,
            content_density: generation_metadata?.settings?.content_density,
            sections_included: generation_metadata?.settings?.sections_included || []
          },
          
          completed_at: new Date().toISOString()
        }
      }

      // Update property with brochure completion data
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property with brochure data:', updateError)
        return NextResponse.json(
          { error: 'Failed to save brochure generation results' },
          { status: 500 }
        )
      }

      // Upload files to Supabase Storage if needed
      try {
        if (brochure_files.pdf_high_quality && !brochure_files.pdf_high_quality.includes('supabase')) {
          // Files are hosted externally, optionally copy to Supabase storage
          // This would be implemented based on storage strategy
        }
      } catch (storageError) {
        console.error('Storage operation error:', storageError)
        // Non-critical error, continue with success response
      }

      // Send notification email to agent
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/brochure-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id,
            property_id,
            brochure_url: brochure_files.pdf_high_quality,
            flipbook_url: brochure_files.interactive_flipbook,
            page_count: generation_metadata?.page_count,
            template_style: generation_metadata?.template_style
          })
        })
      } catch (notificationError) {
        console.error('Failed to send brochure completion notification:', notificationError)
      }

      return NextResponse.json({
        success: true,
        message: 'PDF brochure generated successfully',
        files: {
          pdf_high_quality: brochure_files.pdf_high_quality,
          pdf_web_optimized: brochure_files.pdf_web_optimized,
          interactive_flipbook: brochure_files.interactive_flipbook,
          cover_preview: brochure_files.cover_preview
        },
        metadata: {
          page_count: generation_metadata?.page_count,
          file_size_mb: generation_metadata?.file_sizes?.pdf_high_quality_mb,
          generation_duration: generation_metadata?.generation_duration_minutes,
          quality_score: generation_metadata?.quality_score
        }
      })

    } else if (status === 'error') {
      // Handle generation error
      console.error(`Brochure generation failed for property ${property_id}:`, error_message)

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'error',
          content_generation_error: error_message || 'Brochure generation failed'
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property error status:', updateError)
      }

      return NextResponse.json({
        success: false,
        error: error_message || 'Brochure generation failed'
      })

    } else if (status === 'processing') {
      // Handle processing status update
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'generating_brochure',
          brochure_generation_progress: generation_metadata?.progress_percentage || 0
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating brochure progress:', updateError)
      }

      return NextResponse.json({
        success: true,
        status: 'processing',
        progress: generation_metadata?.progress_percentage || 0,
        current_step: generation_metadata?.current_step || 'Processing'
      })

    } else {
      // Handle unknown status
      console.warn(`Unknown brochure generation status for property ${property_id}:`, status)
      
      return NextResponse.json({
        success: false,
        error: 'Unknown generation status'
      })
    }

  } catch (error) {
    console.error('Brochure callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  
  return NextResponse.json({ message: 'Brochure generation callback endpoint' })
}

// Expected payload structure from N8N workflow
interface BrochureCallbackPayload {
  property_id: string
  agent_id: string
  status: 'completed' | 'error' | 'processing'
  job_id: string
  brochure_files?: {
    pdf_high_quality: string // Print-ready 300 DPI PDF
    pdf_web_optimized: string // Web-friendly smaller PDF
    interactive_flipbook: string // HTML5 flipbook URL
    email_friendly_version?: string // Email-optimized version
    social_media_snippets?: string[] // Social media ready images
    cover_preview: string // Cover page preview image
    page_thumbnails?: string[] // Thumbnail images of each page
  }
  generation_metadata?: {
    template_style: string
    page_count: number
    generation_duration_minutes: number
    file_sizes: {
      pdf_high_quality_mb: number
      pdf_web_optimized_mb: number
      flipbook_size_mb: number
    }
    ai_enhancements: {
      enhanced_descriptions: boolean
      market_insights: boolean
      lifestyle_narrative: boolean
      investment_analysis: boolean
    }
    brand_customization_level: 'basic' | 'standard' | 'premium' | 'enterprise'
    quality_score: number // 0-100
    accessibility_compliance: boolean
    settings: {
      template_style: string
      orientation: string
      size: string
      content_density: string
      sections_included: string[]
    }
    progress_percentage?: number // For processing status
    current_step?: string // For processing status
  }
  error_message?: string
}

// Brochure Quality Metrics
const QUALITY_METRICS = {
  content_completeness: {
    description: 'All required sections populated with relevant content',
    weight: 25
  },
  visual_design: {
    description: 'Professional layout, typography, and visual hierarchy',
    weight: 25
  },
  brand_consistency: {
    description: 'Proper use of brand colors, fonts, and messaging',
    weight: 20
  },
  image_quality: {
    description: 'High-resolution images with proper placement',
    weight: 15
  },
  content_accuracy: {
    description: 'Accurate property details and market information',
    weight: 10
  },
  accessibility: {
    description: 'Screen reader friendly and accessibility compliant',
    weight: 5
  }
}