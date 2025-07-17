'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import Navbar from '@/components/navigation/navbar'
import { CampaignManager } from '@/components/marketing/campaign-manager'
import { 
  Target, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  Eye
} from 'lucide-react'

// Sample data for demonstration
const sampleCampaigns = [
  {
    id: '1',
    name: 'Luxury Home Showcase',
    description: 'Promoting high-end properties in downtown area',
    type: 'social' as const,
    status: 'active' as const,
    platforms: [
      { name: 'facebook' as const, enabled: true, settings: {} },
      { name: 'instagram' as const, enabled: true, settings: {} }
    ],
    budget: {
      total: 5000,
      spent: 2300,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      timezone: 'UTC'
    },
    targeting: {
      demographics: {
        ageRange: { min: 25, max: 55 },
        gender: 'all' as const,
        income: { min: 75000, max: 200000 }
      },
      geographic: {
        locations: ['New York', 'Manhattan'],
        radius: 25
      },
      interests: ['Real Estate', 'Luxury Homes', 'Investment']
    },
    content: {
      posts: [
        {
          id: '1',
          type: 'image' as const,
          content: 'Stunning 3BR penthouse with city views',
          media: ['/images/property1.jpg'],
          scheduledFor: new Date('2024-01-15'),
          status: 'published' as const
        }
      ],
      templates: []
    },
    performance: {
      impressions: 15420,
      clicks: 892,
      conversions: 23,
      ctr: 5.8,
      cpc: 2.58,
      roas: 3.2
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'First-Time Buyer Campaign',
    description: 'Targeting young professionals looking for their first home',
    type: 'email' as const,
    status: 'scheduled' as const,
    platforms: [
      { name: 'email' as const, enabled: true, settings: {} }
    ],
    budget: {
      total: 2000,
      spent: 0,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-01'),
      timezone: 'UTC'
    },
    targeting: {
      demographics: {
        ageRange: { min: 22, max: 35 },
        gender: 'all' as const,
        income: { min: 40000, max: 80000 }
      },
      geographic: {
        locations: ['Brooklyn', 'Queens'],
        radius: 15
      },
      interests: ['Home Buying', 'Real Estate', 'Investment']
    },
    content: {
      posts: [],
      templates: [
        {
          id: '1',
          name: 'Welcome Email',
          type: 'email' as const,
          subject: 'Your Dream Home Awaits',
          content: 'Welcome to your home buying journey...'
        }
      ]
    },
    performance: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      roas: 0
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

export default function CampaignsPage() {
  const { user } = useSupabase()
  const [campaigns, setCampaigns] = useState(sampleCampaigns)
  const [loading, setLoading] = useState(false)

  const handleCreateCampaign = (campaign: any) => {
    const newCampaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        roas: 0
      }
    }
    setCampaigns(prev => [...prev, newCampaign])
  }

  const handleUpdateCampaign = (id: string, updates: any) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { ...campaign, ...updates, updatedAt: new Date() }
        : campaign
    ))
  }

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
  }

  const handleDuplicateCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id)
    if (campaign) {
      const duplicated = {
        ...campaign,
        id: Date.now().toString(),
        name: `${campaign.name} (Copy)`,
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          roas: 0
        }
      }
      setCampaigns(prev => [...prev, duplicated])
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-base-content/60">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">Campaign Management</h1>
              <p className="text-base-content/60">Create and manage your marketing campaigns</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Active Campaigns</p>
                    <p className="text-2xl font-bold text-base-content">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Total Budget</p>
                    <p className="text-2xl font-bold text-base-content">
                      ${campaigns.reduce((sum, c) => sum + c.budget.total, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-warning" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Total Impressions</p>
                    <p className="text-2xl font-bold text-base-content">
                      {campaigns.reduce((sum, c) => sum + c.performance.impressions, 0).toLocaleString()}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-info" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Conversions</p>
                    <p className="text-2xl font-bold text-base-content">
                      {campaigns.reduce((sum, c) => sum + c.performance.conversions, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <CampaignManager
          campaigns={campaigns}
          onCreateCampaign={handleCreateCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onDuplicateCampaign={handleDuplicateCampaign}
        />
      </div>
    </div>
  )
}