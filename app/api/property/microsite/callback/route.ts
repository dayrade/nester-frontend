import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Microsite Generation Callback Handler
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    const {
      property_id,
      agent_id,
      status,
      job_id,
      microsite_data,
      deployment_info,
      error_message
    } = payload

    if (!property_id || !agent_id) {
      return NextResponse.json(
        { error: 'Property ID and Agent ID are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    if (status === 'completed' && microsite_data && deployment_info) {
      // Process successful microsite generation and deployment
      console.log(`Microsite generation completed for property ${property_id}:`, deployment_info)

      // Prepare comprehensive update data
      const updateData = {
        content_generation_status: 'microsite_completed',
        microsite_url: deployment_info.live_url,
        microsite_slug: deployment_info.slug,
        microsite_generation_metadata: {
          job_id,
          deployment_info: {
            live_url: deployment_info.live_url,
            preview_url: deployment_info.preview_url,
            admin_url: deployment_info.admin_url,
            deployment_id: deployment_info.deployment_id,
            domain: deployment_info.domain,
            ssl_enabled: deployment_info.ssl_enabled,
            cdn_enabled: deployment_info.cdn_enabled
          },
          
          // Generation Details
          generation_details: {
            template_used: microsite_data.template_style,
            sections_generated: microsite_data.sections_generated || [],
            pages_created: microsite_data.pages_created || 1,
            components_used: microsite_data.components_used || [],
            generation_duration_minutes: microsite_data.generation_duration_minutes,
            build_time_seconds: deployment_info.build_time_seconds,
            deployment_time_seconds: deployment_info.deployment_time_seconds
          },
          
          // Technical Specifications
          technical_specs: {
            framework: microsite_data.framework || 'next_js_14',
            styling: microsite_data.styling || 'tailwind_css_daisyui',
            hosting_platform: deployment_info.hosting_platform || 'vercel',
            performance_score: deployment_info.performance_score,
            accessibility_score: deployment_info.accessibility_score,
            seo_score: deployment_info.seo_score,
            mobile_friendly: deployment_info.mobile_friendly
          },
          
          // Brand Customization Applied
          brand_customization: {
            white_label_applied: microsite_data.white_label_applied || false,
            custom_domain_configured: deployment_info.custom_domain_configured || false,
            brand_colors_applied: microsite_data.brand_colors_applied || false,
            logo_integrated: microsite_data.logo_integrated || false,
            custom_fonts_loaded: microsite_data.custom_fonts_loaded || false,
            social_media_integrated: microsite_data.social_media_integrated || false
          },
          
          // Interactive Features Enabled
          features_enabled: {
            chat_widget: microsite_data.features?.chat_widget || false,
            contact_forms: microsite_data.features?.contact_forms || false,
            virtual_tour: microsite_data.features?.virtual_tour || false,
            photo_gallery: microsite_data.features?.photo_gallery || false,
            neighborhood_map: microsite_data.features?.neighborhood_map || false,
            mortgage_calculator: microsite_data.features?.mortgage_calculator || false,
            social_sharing: microsite_data.features?.social_sharing || false,
            lead_capture: microsite_data.features?.lead_capture || false
          },
          
          // SEO Configuration
          seo_configuration: {
            meta_tags_generated: microsite_data.seo?.meta_tags_generated || false,
            structured_data_added: microsite_data.seo?.structured_data_added || false,
            sitemap_generated: microsite_data.seo?.sitemap_generated || false,
            robots_txt_created: microsite_data.seo?.robots_txt_created || false,
            open_graph_configured: microsite_data.seo?.open_graph_configured || false,
            twitter_cards_configured: microsite_data.seo?.twitter_cards_configured || false
          },
          
          // Analytics Integration
          analytics_integration: {
            google_analytics_configured: microsite_data.analytics?.google_analytics || false,
            facebook_pixel_configured: microsite_data.analytics?.facebook_pixel || false,
            conversion_tracking_enabled: microsite_data.analytics?.conversion_tracking || false,
            heat_mapping_enabled: microsite_data.analytics?.heat_mapping || false
          },
          
          // Quality Metrics
          quality_metrics: {
            overall_score: deployment_info.quality_score || 0,
            performance_score: deployment_info.performance_score || 0,
            accessibility_score: deployment_info.accessibility_score || 0,
            seo_score: deployment_info.seo_score || 0,
            mobile_score: deployment_info.mobile_score || 0,
            security_score: deployment_info.security_score || 0
          },
          
          // File Assets Generated
          assets_generated: {
            total_files: microsite_data.assets?.total_files || 0,
            optimized_images: microsite_data.assets?.optimized_images || 0,
            css_files: microsite_data.assets?.css_files || 0,
            js_files: microsite_data.assets?.js_files || 0,
            total_size_mb: microsite_data.assets?.total_size_mb || 0,
            compressed_size_mb: microsite_data.assets?.compressed_size_mb || 0
          },
          
          completed_at: new Date().toISOString()
        },
        
        // Initialize analytics tracking
        microsite_analytics: {
          total_visits: 0,
          unique_visitors: 0,
          page_views: 0,
          average_session_duration: 0,
          bounce_rate: 0,
          conversion_rate: 0,
          lead_captures: 0,
          last_updated: new Date().toISOString()
        }
      }

      // Update property with microsite completion data
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property with microsite data:', updateError)
        return NextResponse.json(
          { error: 'Failed to save microsite generation results' },
          { status: 500 }
        )
      }

      // Configure analytics tracking for the new microsite
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/setup-tracking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id,
            microsite_url: deployment_info.live_url,
            tracking_config: {
              google_analytics: microsite_data.analytics?.google_analytics_id,
              facebook_pixel: microsite_data.analytics?.facebook_pixel_id,
              conversion_goals: ['contact_form_submit', 'phone_click', 'email_click', 'chat_initiated']
            }
          })
        })
      } catch (analyticsError) {
        console.error('Failed to setup analytics tracking:', analyticsError)
      }

      // Send notification email to agent
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/microsite-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id,
            property_id,
            microsite_url: deployment_info.live_url,
            preview_url: deployment_info.preview_url,
            admin_url: deployment_info.admin_url,
            template_style: microsite_data.template_style,
            features_enabled: Object.keys(microsite_data.features || {}).filter(key => microsite_data.features[key]).length,
            performance_score: deployment_info.performance_score
          })
        })
      } catch (notificationError) {
        console.error('Failed to send microsite completion notification:', notificationError)
      }

      // Submit microsite to search engines for indexing
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/seo/submit-sitemap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            microsite_url: deployment_info.live_url,
            sitemap_url: `${deployment_info.live_url}/sitemap.xml`
          })
        })
      } catch (seoError) {
        console.error('Failed to submit sitemap to search engines:', seoError)
      }

      return NextResponse.json({
        success: true,
        message: 'White-label microsite generated and deployed successfully',
        microsite: {
          live_url: deployment_info.live_url,
          preview_url: deployment_info.preview_url,
          admin_url: deployment_info.admin_url,
          ssl_enabled: deployment_info.ssl_enabled,
          performance_score: deployment_info.performance_score
        },
        generation_stats: {
          template_used: microsite_data.template_style,
          sections_generated: microsite_data.sections_generated?.length || 0,
          features_enabled: Object.keys(microsite_data.features || {}).filter(key => microsite_data.features[key]).length,
          generation_time_minutes: microsite_data.generation_duration_minutes,
          deployment_time_seconds: deployment_info.deployment_time_seconds,
          total_files_generated: microsite_data.assets?.total_files || 0,
          white_label_applied: microsite_data.white_label_applied
        }
      })

    } else if (status === 'error') {
      // Handle generation error
      console.error(`Microsite generation failed for property ${property_id}:`, error_message)

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'error',
          content_generation_error: error_message || 'Microsite generation failed'
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property error status:', updateError)
      }

      return NextResponse.json({
        success: false,
        error: error_message || 'Microsite generation failed'
      })

    } else if (status === 'processing') {
      // Handle processing status update
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'generating_microsite',
          microsite_generation_progress: microsite_data?.progress_percentage || 0
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating microsite progress:', updateError)
      }

      return NextResponse.json({
        success: true,
        status: 'processing',
        progress: microsite_data?.progress_percentage || 0,
        current_step: microsite_data?.current_step || 'Processing',
        estimated_completion: microsite_data?.estimated_completion
      })

    } else {
      // Handle unknown status
      console.warn(`Unknown microsite generation status for property ${property_id}:`, status)
      
      return NextResponse.json({
        success: false,
        error: 'Unknown generation status'
      })
    }

  } catch (error) {
    console.error('Microsite callback error:', error)
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
  
  return NextResponse.json({ message: 'Microsite generation callback endpoint' })
}

// Expected payload structure from N8N workflow
interface MicrositeCallbackPayload {
  property_id: string
  agent_id: string
  status: 'completed' | 'error' | 'processing'
  job_id: string
  microsite_data?: {
    template_style: string
    sections_generated: string[]
    pages_created: number
    components_used: string[]
    generation_duration_minutes: number
    framework: string
    styling: string
    white_label_applied: boolean
    brand_colors_applied: boolean
    logo_integrated: boolean
    custom_fonts_loaded: boolean
    social_media_integrated: boolean
    features: {
      chat_widget: boolean
      contact_forms: boolean
      virtual_tour: boolean
      photo_gallery: boolean
      neighborhood_map: boolean
      mortgage_calculator: boolean
      social_sharing: boolean
      lead_capture: boolean
    }
    seo: {
      meta_tags_generated: boolean
      structured_data_added: boolean
      sitemap_generated: boolean
      robots_txt_created: boolean
      open_graph_configured: boolean
      twitter_cards_configured: boolean
    }
    analytics: {
      google_analytics: boolean
      facebook_pixel: boolean
      conversion_tracking: boolean
      heat_mapping: boolean
      google_analytics_id?: string
      facebook_pixel_id?: string
    }
    assets: {
      total_files: number
      optimized_images: number
      css_files: number
      js_files: number
      total_size_mb: number
      compressed_size_mb: number
    }
    progress_percentage?: number
    current_step?: string
    estimated_completion?: string
  }
  deployment_info?: {
    live_url: string
    preview_url: string
    admin_url: string
    deployment_id: string
    domain: string
    ssl_enabled: boolean
    cdn_enabled: boolean
    hosting_platform: string
    build_time_seconds: number
    deployment_time_seconds: number
    custom_domain_configured: boolean
    performance_score: number
    accessibility_score: number
    seo_score: number
    mobile_score: number
    security_score: number
    quality_score: number
    mobile_friendly: boolean
  }
  error_message?: string
}

// Microsite Quality Scoring System
const QUALITY_SCORING = {
  performance: {
    description: 'Page load speed, Core Web Vitals, optimization',
    weight: 25,
    thresholds: {
      excellent: 90,
      good: 75,
      needs_improvement: 50
    }
  },
  accessibility: {
    description: 'WCAG compliance, screen reader compatibility',
    weight: 20,
    thresholds: {
      excellent: 95,
      good: 85,
      needs_improvement: 70
    }
  },
  seo: {
    description: 'Meta tags, structured data, sitemap, indexability',
    weight: 20,
    thresholds: {
      excellent: 90,
      good: 80,
      needs_improvement: 60
    }
  },
  mobile: {
    description: 'Mobile responsiveness and usability',
    weight: 15,
    thresholds: {
      excellent: 95,
      good: 85,
      needs_improvement: 70
    }
  },
  security: {
    description: 'SSL, security headers, vulnerability scanning',
    weight: 10,
    thresholds: {
      excellent: 95,
      good: 85,
      needs_improvement: 70
    }
  },
  brand_consistency: {
    description: 'Brand colors, fonts, messaging alignment',
    weight: 10,
    thresholds: {
      excellent: 90,
      good: 80,
      needs_improvement: 60
    }
  }
}