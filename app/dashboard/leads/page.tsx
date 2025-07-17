'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import Navbar from '@/components/navigation/navbar'
import { LeadManagement } from '@/components/leads/lead-management'
import { 
  Users, 
  TrendingUp, 
  Phone,
  Mail,
  DollarSign,
  Target
} from 'lucide-react'

// Sample data for demonstration
const sampleLeads = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    source: 'website' as const,
    status: 'qualified' as const,
    priority: 'high' as const,
    interestedProperty: 'Luxury Downtown Condo',
    budget: {
      min: 800000,
      max: 1200000,
      currency: 'USD'
    },
    preferences: {
      propertyType: ['condo', 'apartment'],
      bedrooms: { min: 2, max: 3 },
      bathrooms: { min: 2, max: 3 },
      location: ['Downtown', 'Midtown'],
      amenities: ['gym', 'parking', 'doorman']
    },
    timeline: 'immediate',
    notes: 'Looking for move-in ready property. Prefers high floor with city views.',
    assignedAgent: 'agent-1',
    tags: ['hot-lead', 'luxury-buyer'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContact: new Date('2024-01-18')
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 987-6543',
    source: 'social' as const,
    status: 'new' as const,
    priority: 'medium' as const,
    interestedProperty: 'Family Home in Suburbs',
    budget: {
      min: 400000,
      max: 600000,
      currency: 'USD'
    },
    preferences: {
      propertyType: ['house'],
      bedrooms: { min: 3, max: 4 },
      bathrooms: { min: 2, max: 3 },
      location: ['Suburbs', 'Westside'],
      amenities: ['garage', 'yard', 'good-schools']
    },
    timeline: '3-6 months',
    notes: 'First-time buyer. Needs guidance through the process.',
    assignedAgent: 'agent-2',
    tags: ['first-time-buyer'],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    lastContact: new Date('2024-01-22')
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 456-7890',
    source: 'referral' as const,
    status: 'proposal' as const,
    priority: 'urgent' as const,
    interestedProperty: 'Investment Property Portfolio',
    budget: {
      min: 2000000,
      max: 5000000,
      currency: 'USD'
    },
    preferences: {
      propertyType: ['apartment', 'commercial'],
      bedrooms: { min: 1, max: 10 },
      bathrooms: { min: 1, max: 10 },
      location: ['Downtown', 'Financial District'],
      amenities: ['high-roi', 'low-maintenance']
    },
    timeline: 'immediate',
    notes: 'Experienced investor looking for portfolio expansion. Cash buyer.',
    assignedAgent: 'agent-1',
    tags: ['investor', 'cash-buyer', 'portfolio'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    lastContact: new Date('2024-01-24')
  }
]

const sampleActivities = [
  {
    id: '1',
    leadId: '1',
    type: 'call' as const,
    description: 'Initial consultation call - discussed budget and preferences',
    timestamp: new Date('2024-01-18T10:30:00'),
    agentId: 'agent-1',
    outcome: 'positive',
    nextAction: 'Send property listings',
    duration: 45
  },
  {
    id: '2',
    leadId: '1',
    type: 'email' as const,
    description: 'Sent curated property listings matching criteria',
    timestamp: new Date('2024-01-18T14:15:00'),
    agentId: 'agent-1',
    outcome: 'sent',
    nextAction: 'Follow up in 2 days'
  },
  {
    id: '3',
    leadId: '2',
    type: 'note' as const,
    description: 'Lead expressed interest in suburban properties with good school districts',
    timestamp: new Date('2024-01-22T09:00:00'),
    agentId: 'agent-2',
    outcome: 'neutral',
    nextAction: 'Research school districts'
  },
  {
    id: '4',
    leadId: '3',
    type: 'meeting' as const,
    description: 'In-person meeting to discuss investment strategy and portfolio goals',
    timestamp: new Date('2024-01-24T16:00:00'),
    agentId: 'agent-1',
    outcome: 'positive',
    nextAction: 'Prepare investment proposal',
    duration: 90
  },
  {
    id: '5',
    leadId: '3',
    type: 'proposal-sent' as const,
    description: 'Sent comprehensive investment proposal with 3 property options',
    timestamp: new Date('2024-01-25T11:30:00'),
    agentId: 'agent-1',
    outcome: 'sent',
    nextAction: 'Follow up within 48 hours'
  }
]

export default function LeadsPage() {
  const { user } = useSupabase()
  const [leads, setLeads] = useState(sampleLeads)
  const [activities, setActivities] = useState(sampleActivities)
  const [loading, setLoading] = useState(false)

  const handleCreateLead = (lead: any) => {
    const newLead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContact: new Date()
    }
    setLeads(prev => [...prev, newLead])
  }

  const handleUpdateLead = (id: string, updates: any) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id 
        ? { ...lead, ...updates, updatedAt: new Date() }
        : lead
    ))
  }

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id))
    setActivities(prev => prev.filter(activity => activity.leadId !== id))
  }

  const handleAddActivity = (activity: any) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setActivities(prev => [...prev, newActivity])
    
    // Update lead's last contact date
    setLeads(prev => prev.map(lead => 
      lead.id === activity.leadId 
        ? { ...lead, lastContact: new Date(), updatedAt: new Date() }
        : lead
    ))
  }

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    hotLeads: leads.filter(l => l.priority === 'urgent' || l.priority === 'high').length,
    totalValue: leads.reduce((sum, l) => sum + l.budget.max, 0),
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'closed-won').length / leads.length * 100) : 0
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">Lead Management</h1>
              <p className="text-base-content/60">Track and manage your sales leads</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Total Leads</p>
                    <p className="text-2xl font-bold text-base-content">{stats.totalLeads}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Hot Leads</p>
                    <p className="text-2xl font-bold text-base-content">{stats.hotLeads}</p>
                  </div>
                  <Target className="h-8 w-8 text-error" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Pipeline Value</p>
                    <p className="text-2xl font-bold text-base-content">
                      ${(stats.totalValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-success" />
                </div>
              </div>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Conversion Rate</p>
                    <p className="text-2xl font-bold text-base-content">
                      {stats.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <LeadManagement
          leads={leads}
          activities={activities}
          onCreateLead={handleCreateLead}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onAddActivity={handleAddActivity}
        />
      </div>
    </div>
  )
}