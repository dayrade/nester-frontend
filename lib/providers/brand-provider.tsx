'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './supabase-provider'
import type { BrandAssets, AgentBrand } from '@/types/supabase'

type BrandContext = {
  brandAssets: BrandAssets | null
  loading: boolean
  refreshBrand: () => Promise<void>
  updateBrand: (brandData: Partial<AgentBrand>) => Promise<void>
}

const Context = createContext<BrandContext | undefined>(undefined)

// Default Nester brand assets
const DEFAULT_BRAND_ASSETS: BrandAssets = {
  mode: 'nester_default',
  logo: '/assets/nester-logo.svg',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
  companyName: 'Nester',
  persona: {
    tone: 'Professional & Authoritative',
    style: 'Concise & Factual',
    keyPhrases: ['Discover your dream home', 'Premium real estate marketing'],
    avoidPhrases: ['cheap', 'deal', 'bargain']
  }
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brandAssets, setBrandAssets] = useState<BrandAssets | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, supabase } = useSupabase()

  const resolveBrandAssets = async (agentId: string): Promise<BrandAssets> => {
    try {
      const { data: brandData, error } = await supabase
        .from('agent_brands')
        .select('*')
        .eq('agent_id', agentId)
        .single()

      if (error || !brandData) {
        // Create default brand record for new users
        const { error: insertError } = await supabase
          .from('agent_brands')
          .insert({
            agent_id: agentId,
            has_custom_branding: false,
            brand_tier: 'nester_default',
            persona_tone: 'Professional & Authoritative',
            persona_style: 'Concise & Factual',
            persona_key_phrases: ['Discover your dream home'],
            persona_phrases_to_avoid: ['cheap', 'deal'],
            nester_logo_path: '/assets/nester-logo.svg',
            nester_primary_color: '#2563eb',
            nester_secondary_color: '#64748b',
            nester_font_family: 'Inter'
          })
        
        if (insertError) {
          console.error('Error creating default brand:', insertError)
        }
        
        return DEFAULT_BRAND_ASSETS
      }

      // Determine brand mode based on custom branding setup
      const hasCustomBranding = !!(
        brandData.logo_storage_path ||
        brandData.primary_color ||
        brandData.company_name
      )

      if (hasCustomBranding) {
        // WHITE-LABEL MODE
        return {
          mode: 'white_label',
          logo: brandData.logo_storage_path || brandData.nester_logo_path,
          primaryColor: brandData.primary_color || brandData.nester_primary_color,
          secondaryColor: brandData.secondary_color || brandData.nester_secondary_color,
          fontFamily: brandData.font_family || brandData.nester_font_family,
          companyName: brandData.company_name || 'Nester',
          persona: {
            tone: brandData.persona_tone,
            style: brandData.persona_style,
            keyPhrases: brandData.persona_key_phrases || ['Discover your dream home'],
            avoidPhrases: brandData.persona_phrases_to_avoid || ['cheap', 'deal']
          }
        }
      } else {
        // NESTER DEFAULT MODE
        return {
          mode: 'nester_default',
          logo: brandData.nester_logo_path,
          primaryColor: brandData.nester_primary_color,
          secondaryColor: brandData.nester_secondary_color,
          fontFamily: brandData.nester_font_family,
          companyName: 'Nester',
          persona: {
            tone: brandData.persona_tone,
            style: brandData.persona_style,
            keyPhrases: brandData.persona_key_phrases || ['Discover your dream home'],
            avoidPhrases: brandData.persona_phrases_to_avoid || ['cheap', 'deal']
          }
        }
      }
    } catch (error) {
      console.error('Error resolving brand assets:', error)
      return DEFAULT_BRAND_ASSETS
    }
  }

  const injectBrandCSS = (assets: BrandAssets) => {
    const root = document.documentElement
    
    // Inject CSS variables
    root.style.setProperty('--brand-primary', assets.primaryColor)
    root.style.setProperty('--brand-secondary', assets.secondaryColor)
    root.style.setProperty('--brand-font', assets.fontFamily)
    root.style.setProperty('--brand-logo', `url('${assets.logo}')`)
    root.style.setProperty('--company-name', `'${assets.companyName}'`)
    
    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', assets.primaryColor)
    }
  }

  const refreshBrand = async () => {
    if (!user) {
      setBrandAssets(DEFAULT_BRAND_ASSETS)
      injectBrandCSS(DEFAULT_BRAND_ASSETS)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const assets = await resolveBrandAssets(user.id)
      setBrandAssets(assets)
      injectBrandCSS(assets)
    } catch (error) {
      console.error('Error refreshing brand:', error)
      setBrandAssets(DEFAULT_BRAND_ASSETS)
      injectBrandCSS(DEFAULT_BRAND_ASSETS)
    } finally {
      setLoading(false)
    }
  }

  const updateBrand = async (brandData: Partial<AgentBrand>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('agent_brands')
        .upsert({
          agent_id: user.id,
          ...brandData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      // Refresh brand assets after update
      await refreshBrand()
    } catch (error) {
      console.error('Error updating brand:', error)
      throw error
    }
  }

  useEffect(() => {
    refreshBrand()
  }, [user])

  const value = {
    brandAssets,
    loading,
    refreshBrand,
    updateBrand,
  }

  return (
    <Context.Provider value={value}>
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