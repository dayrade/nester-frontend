import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, requestUrl.origin)
    )
  }

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth/error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      if (data.user) {
        // Create or update user record
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            role: 'agent',
            updated_at: new Date().toISOString()
          })

        if (upsertError) {
          console.error('User upsert error:', upsertError)
          // Don't fail the auth flow for this
        }

        // Check if user has brand settings, create default if not
        const { data: existingBrand } = await supabase
          .from('agent_brands')
          .select('id')
          .eq('agent_id', data.user.id)
          .single()

        if (!existingBrand) {
          const { error: brandError } = await supabase
            .from('agent_brands')
            .insert({
              agent_id: data.user.id,
              has_custom_branding: false,
              brand_tier: 'nester_default',
              persona_tone: 'Professional & Authoritative',
              persona_style: 'Concise & Factual',
              persona_key_phrases: ['Discover your dream home', 'Premium real estate marketing'],
              persona_phrases_to_avoid: ['cheap', 'deal', 'bargain'],
              nester_logo_path: '/assets/nester-logo.svg',
              nester_primary_color: '#2563eb',
              nester_secondary_color: '#64748b',
              nester_font_family: 'Inter'
            })

          if (brandError) {
            console.error('Brand creation error:', brandError)
          }
        }
      }

      // Successful authentication - redirect to intended destination
      return NextResponse.redirect(new URL(next, requestUrl.origin))
      
    } catch (error) {
      console.error('Auth callback unexpected error:', error)
      return NextResponse.redirect(
        new URL('/auth/error?error=unexpected_error', requestUrl.origin)
      )
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
}

// Handle POST requests (for some OAuth flows)
export async function POST(request: NextRequest) {
  return GET(request)
}