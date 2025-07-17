import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Social Media Campaign Generation Callback Handler
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    const {
      property_id,
      agent_id,
      status,
      job_id,
      generated_posts,
      error_message,
      generation_stats
    } = payload

    if (!property_id || !agent_id) {
      return NextResponse.json(
        { error: 'Property ID and Agent ID are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    if (status === 'completed' && generated_posts) {
      // Process successful campaign generation
      console.log(`Social campaign generation completed for property ${property_id}:`, generation_stats)

      // Insert all generated social posts
      const postsToInsert = generated_posts.map((post: any) => ({
        property_id,
        agent_id,
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags,
        archetype: post.archetype,
        week_theme: post.week_theme,
        day_number: post.day_number,
        post_number_of_day: post.post_number_of_day,
        scheduled_for: post.scheduled_for,
        status: post.auto_publish ? 'scheduled' : 'draft',
        image_urls: post.image_urls || [],
        engagement_hooks: post.engagement_hooks,
        call_to_action: post.call_to_action,
        target_audience: post.target_audience,
        optimal_posting_time: post.optimal_posting_time,
        ai_generation_metadata: {
          job_id,
          archetype: post.archetype,
          week_theme: post.week_theme,
          generation_prompt: post.generation_prompt,
          style_instructions: post.style_instructions,
          never_repeat_check: post.never_repeat_check,
          generated_at: new Date().toISOString()
        }
      }))

      const { error: insertError } = await supabase
        .from('social_posts')
        .insert(postsToInsert)

      if (insertError) {
        console.error('Error inserting social posts:', insertError)
        
        // Update property with error status
        await supabase
          .from('properties')
          .update({
            content_generation_status: 'error',
            content_generation_error: `Failed to save social posts: ${insertError.message}`
          })
          .eq('id', property_id)

        return NextResponse.json(
          { error: 'Failed to save generated social posts' },
          { status: 500 }
        )
      }

      // Update property with completion status
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'social_campaign_completed',
          content_generation_completed_at: new Date().toISOString(),
          social_campaign_stats: {
            total_posts_generated: generated_posts.length,
            posts_by_platform: generation_stats?.posts_by_platform || {},
            posts_by_archetype: generation_stats?.posts_by_archetype || {},
            posts_by_week: generation_stats?.posts_by_week || {},
            generation_duration_minutes: generation_stats?.generation_duration_minutes || 0,
            never_repeat_violations: generation_stats?.never_repeat_violations || 0,
            quality_score: generation_stats?.quality_score || 0,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property completion status:', updateError)
      }

      // Send notification email to agent (optional)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/social-campaign-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id,
            property_id,
            total_posts: generated_posts.length,
            campaign_duration: 70,
            platforms: generation_stats?.platforms_count || 7
          })
        })
      } catch (notificationError) {
        console.error('Failed to send completion notification:', notificationError)
      }

      return NextResponse.json({
        success: true,
        message: 'Social media campaign generated successfully',
        stats: {
          total_posts: generated_posts.length,
          platforms: generation_stats?.platforms_count || 7,
          duration_days: 70,
          never_repeat_violations: generation_stats?.never_repeat_violations || 0
        }
      })

    } else if (status === 'error') {
      // Handle generation error
      console.error(`Social campaign generation failed for property ${property_id}:`, error_message)

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          content_generation_status: 'error',
          content_generation_error: error_message || 'Social media campaign generation failed'
        })
        .eq('id', property_id)

      if (updateError) {
        console.error('Error updating property error status:', updateError)
      }

      return NextResponse.json({
        success: false,
        error: error_message || 'Social media campaign generation failed'
      })

    } else {
      // Handle unknown status
      console.warn(`Unknown social campaign generation status for property ${property_id}:`, status)
      
      return NextResponse.json({
        success: false,
        error: 'Unknown generation status'
      })
    }

  } catch (error) {
    console.error('Social campaign callback error:', error)
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
  
  return NextResponse.json({ message: 'Social campaign callback endpoint' })
}

// Expected payload structure from N8N workflow
interface SocialCampaignCallbackPayload {
  property_id: string
  agent_id: string
  status: 'completed' | 'error' | 'processing'
  job_id: string
  generated_posts?: GeneratedSocialPost[]
  error_message?: string
  generation_stats?: {
    total_posts_generated: number
    posts_by_platform: Record<string, number>
    posts_by_archetype: Record<string, number>
    posts_by_week: Record<string, number>
    generation_duration_minutes: number
    never_repeat_violations: number
    quality_score: number
    platforms_count: number
  }
}

interface GeneratedSocialPost {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter' | 'bluesky' | 'threads'
  content: string
  hashtags: string[]
  archetype: string
  week_theme: string
  day_number: number
  post_number_of_day: number
  scheduled_for: string
  auto_publish: boolean
  image_urls?: string[]
  engagement_hooks: string[]
  call_to_action: string
  target_audience: string
  optimal_posting_time: string
  generation_prompt: string
  style_instructions: string
  never_repeat_check: {
    archetype_last_used: string
    room_feature_last_used: string
    style_last_used: string
    uniqueness_score: number
  }
}