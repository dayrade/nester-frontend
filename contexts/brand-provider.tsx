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
            companyName: data.company_name || 'Nester',
            logo: data.logo_url || '/nester-logo.svg',
            primaryColor: data.primary_color || '#2563eb',
            secondaryColor: data.secondary_color || '#64748b',
            accentColor: data.accent_color || '#f59e0b',
            fontFamily: data.font_family || 'Inter',
            aiPersona: data.ai_persona || 'professional',
            brandVoice: data.brand_voice || 'friendly',
            targetAudience: data.target_audience || 'homebuyers',
            specialties: data.specialties || ['residential']
          })
        } else {
          // Set default brand assets
          setBrandAssets({
            companyName: 'Nester',
            logo: '/nester-logo.svg',
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            accentColor: '#f59e0b',
            fontFamily: 'Inter',
            aiPersona: 'professional',
            brandVoice: 'friendly',
            targetAudience: 'homebuyers',
            specialties: ['residential']
          })
        }
      } catch (error) {
        console.error('Error fetching brand assets:', error)
        // Set default brand assets on error
        setBrandAssets({
          companyName: 'Nester',
          logo: '/nester-logo.svg',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#f59e0b',
          fontFamily: 'Inter',
          aiPersona: 'professional',
          brandVoice: 'friendly',
          targetAudience: 'homebuyers',
          specialties: ['residential']
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
          logo_url: assets.logo,
          primary_color: assets.primaryColor,
          secondary_color: assets.secondaryColor,
          accent_color: assets.accentColor,
          font_family: assets.fontFamily,
          ai_persona: assets.aiPersona,
          brand_voice: assets.brandVoice,
          target_audience: assets.targetAudience,
          specialties: assets.specialties,
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