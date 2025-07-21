'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './supabase-provider'
import type { BrandAssets } from '@/types/supabase'

type BrandContext = {
  brandAssets: BrandAssets | null
  loading: boolean
  updateBrandAssets: (assets: Partial<BrandAssets>) => Promise<void>
}

const Context = createContext<BrandContext | undefined>(undefined)

export default function BrandProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, supabase } = useSupabase()
  const [brandAssets, setBrandAssets] = useState<BrandAssets | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBrandAssets(null)
      setLoading(false)
      return
    }

    const fetchBrandAssets = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_brands')
          .select('*')
          .eq('agent_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setBrandAssets({
            mode: data.has_custom_branding ? 'white_label' : 'nester_default',
            companyName: data.company_name || 'Nester',
            logo: data.logo_storage_path || '/nester-logo.svg',
            primaryColor: data.primary_color || '#2563eb',
            secondaryColor: data.secondary_color || '#64748b',
            fontFamily: data.font_family || 'Inter',
            persona: {
              tone: data.persona_tone || 'Professional & Authoritative',
              style: data.persona_style || 'Concise & Factual',
              keyPhrases: data.persona_key_phrases || ['Discover your dream home', 'Premium real estate marketing'],
              avoidPhrases: data.persona_phrases_to_avoid || ['cheap', 'deal', 'bargain']
            }
          })
        } else {
          // Set default brand assets
          setBrandAssets({
            mode: 'nester_default',
            companyName: 'Nester',
            logo: '/nester-logo.svg',
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            fontFamily: 'Inter',
            persona: {
              tone: 'professional',
              style: 'friendly',
              keyPhrases: ['homebuyers'],
              avoidPhrases: []
            }
          })
        }
      } catch (error) {
        console.error('Error fetching brand assets:', error)
        // Set default brand assets on error
        setBrandAssets({
          mode: 'nester_default',
          companyName: 'Nester',
          logo: '/nester-logo.svg',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Inter',
          persona: {
            tone: 'professional',
            style: 'friendly',
            keyPhrases: ['homebuyers'],
            avoidPhrases: []
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBrandAssets()
  }, [user, supabase])

  const updateBrandAssets = async (assets: Partial<BrandAssets>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('agent_brands')
        .upsert({
          agent_id: user.id,
          company_name: assets.companyName,
          logo_storage_path: assets.logo,
          primary_color: assets.primaryColor,
          secondary_color: assets.secondaryColor,
          font_family: assets.fontFamily,
          has_custom_branding: assets.mode === 'white_label',
          persona_tone: assets.persona?.tone,
          persona_style: assets.persona?.style,
          persona_key_phrases: assets.persona?.keyPhrases,
          persona_phrases_to_avoid: assets.persona?.avoidPhrases,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setBrandAssets(prev => prev ? { ...prev, ...assets } : null)
    } catch (error) {
      console.error('Error updating brand assets:', error)
      throw error
    }
  }

  return (
    <Context.Provider value={{ brandAssets, loading, updateBrandAssets }}>
      {children}
    </Context.Provider>
  )
}

export const useBrand = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useBrand must be used inside BrandProvider')
  }
  return context
}