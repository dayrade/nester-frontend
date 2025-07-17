'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Navbar from '@/components/navigation/navbar'
import { 
  Home, 
  Plus, 
  TrendingUp, 
  MessageSquare, 
  Share2,
  Eye,
  Heart,
  DollarSign,
  Building,
  Calendar,
  ArrowRight,
  Palette,
  Megaphone,
  FileText,
  Globe,
  Bot,
  Camera,
  BookOpen,
  Zap,
  Target,
  Clock,
  Users,
  BarChart3,
  Activity,
  ArrowUpRight
} from 'lucide-react'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils'
import type { 
  PropertyWithImages, 
  SocialPostWithProperty, 
  AnalyticsData,
  Database 
} from '@/types/supabase'

interface DashboardStats {
  totalProperties: number
  activeListings: number
  totalPosts: number
  totalViews: number
  totalEngagement: number
  averagePrice: number
  contentGenerated: number
  micrositesLive: number
  totalLeads: number
  conversionRate: number
  imagesGenerated: number
  brochuresCreated: number
  activeCampaigns: number
}

interface RecentActivity {
  id: string
  type: 'property_added' | 'post_published' | 'content_generated' | 'images_generated' | 'brochure_created' | 'microsite_launched' | 'campaign_started' | 'lead_qualified'
  title: string
  description: string
  timestamp: string
  property_id?: string
  post_id?: string
  status?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProperties, setRecentProperties] = useState<PropertyWithImages[]>([])
  const [recentPosts, setRecentPosts] = useState<SocialPostWithProperty[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      await loadDashboardData(user.id)
    }

    getUser()
  }, [])

  const loadDashboardData = async (userId: string) => {
    try {
      setLoading(true)

      // For demo purposes, let's use sample data to show the UI
      // In production, this would load from Supabase
      const sampleProperties = [
        {
          id: '1',
          address: '123 Sunset Boulevard, Beverly Hills, CA',
          price: 2500000,
          listing_status: 'active',
          content_generation_status: 'microsite_completed',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          property_images: [{ url: '/placeholder-property.jpg' }]
        },
        {
          id: '2',
          address: '456 Ocean Drive, Malibu, CA',
          price: 3200000,
          listing_status: 'active',
          content_generation_status: 'social_campaign_completed',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          property_images: [{ url: '/placeholder-property.jpg' }]
        },
        {
          id: '3',
          address: '789 Hollywood Hills Drive, Los Angeles, CA',
          price: 1800000,
          listing_status: 'pending',
          content_generation_status: 'brochure_completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          property_images: [{ url: '/placeholder-property.jpg' }]
        },
        {
          id: '4',
          address: '321 Venice Beach Walk, Venice, CA',
          price: 1200000,
          listing_status: 'active',
          content_generation_status: 'images_completed',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          property_images: [{ url: '/placeholder-property.jpg' }]
        }
      ]

      const samplePosts = [
        {
          id: '1',
          platform: 'Instagram',
          copy_text: 'Stunning Beverly Hills mansion with panoramic city views! This architectural masterpiece features...',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          property_id: '1',
          properties: sampleProperties[0]
        },
        {
          id: '2',
          platform: 'Facebook',
          copy_text: 'Oceanfront luxury in Malibu! Wake up to the sound of waves in this spectacular beachfront estate...',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          property_id: '2',
          properties: sampleProperties[1]
        }
      ]

      const sampleChatSessions = [
        {
          id: '1',
          lead_qualification_score: 85,
          property_id: '1',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          properties: sampleProperties[0]
        },
        {
          id: '2',
          lead_qualification_score: 72,
          property_id: '2',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          properties: sampleProperties[1]
        },
        {
          id: '3',
          lead_qualification_score: 45,
          property_id: '3',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          properties: sampleProperties[2]
        }
      ]

      // Calculate comprehensive stats from sample data
      const totalViews = 15420
      const totalEngagement = 892
      const averagePrice = sampleProperties.reduce((sum, prop) => sum + prop.price, 0) / sampleProperties.length
      const activeListings = sampleProperties.filter(p => p.listing_status === 'active').length
      
      // Content generation stats
      const contentGenerated = sampleProperties.filter(p => 
        p.content_generation_status && 
        !p.content_generation_status.includes('not_started')
      ).length
      const micrositesLive = sampleProperties.filter(p => 
        p.content_generation_status === 'microsite_completed'
      ).length
      const imagesGenerated = sampleProperties.filter(p => 
        p.content_generation_status?.includes('images_completed')
      ).length
      const brochuresCreated = sampleProperties.filter(p => 
        p.content_generation_status === 'brochure_completed'
      ).length
      const activeCampaigns = sampleProperties.filter(p => 
        p.content_generation_status === 'social_campaign_completed'
      ).length
      
      // Lead stats
      const totalLeads = sampleChatSessions.length
      const qualifiedLeads = sampleChatSessions.filter(s => s.lead_qualification_score >= 70).length
      const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0

      setStats({
        totalProperties: sampleProperties.length,
        activeListings,
        totalPosts: samplePosts.length,
        totalViews,
        totalEngagement,
        averagePrice,
        contentGenerated,
        micrositesLive,
        totalLeads,
        conversionRate,
        imagesGenerated,
        brochuresCreated,
        activeCampaigns
      })

      setRecentProperties(sampleProperties as any)
      setRecentPosts(samplePosts as any)

      // Generate comprehensive recent activity
      const activity: RecentActivity[] = [
        ...properties.slice(0, 2).map(prop => ({
          id: prop.id,
          type: 'property_added' as const,
          title: 'New Property Added',
          description: prop.address,
          timestamp: prop.created_at,
          property_id: prop.id,
          status: prop.listing_status
        })),
        ...posts.slice(0, 2).map(post => ({
          id: post.id,
          type: 'post_published' as const,
          title: 'Social Post Published',
          description: `${post.platform} - ${post.copy_text?.substring(0, 50)}...`,
          timestamp: post.created_at,
          post_id: post.id,
          property_id: post.property_id
        })),
        // Add content generation activities
        ...properties.filter(p => p.content_generation_status?.includes('completed')).slice(0, 3).map(prop => {
          let activityType: RecentActivity['type'] = 'content_generated'
          let title = 'Content Generated'
          
          if (prop.content_generation_status === 'images_completed') {
            activityType = 'images_generated'
            title = 'AI Images Generated'
          } else if (prop.content_generation_status === 'brochure_completed') {
            activityType = 'brochure_created'
            title = 'PDF Brochure Created'
          } else if (prop.content_generation_status === 'microsite_completed') {
            activityType = 'microsite_launched'
            title = 'Microsite Launched'
          } else if (prop.content_generation_status === 'social_campaign_completed') {
            activityType = 'campaign_started'
            title = '70-Day Campaign Started'
          }
          
          return {
            id: `${prop.id}-content`,
            type: activityType,
            title,
            description: prop.address,
            timestamp: prop.updated_at || prop.created_at,
            property_id: prop.id,
            status: prop.content_generation_status
          }
        }),
        // Add lead qualification activities
        ...chatSessions.filter(s => s.lead_qualification_score >= 70).slice(0, 2).map(session => ({
          id: session.id,
          type: 'lead_qualified' as const,
          title: 'Lead Qualified',
          description: `Score: ${session.lead_qualification_score} - ${session.properties?.address}`,
          timestamp: session.updated_at || session.created_at,
          property_id: session.property_id
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = () => {
    router.push('/dashboard/properties?action=add')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your properties.
          </p>
        </div>
        <Button onClick={handleAddProperty} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeListings || 0} active listings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contentGenerated || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.micrositesLive || 0} microsites live
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalLeads || 0} total leads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.averagePrice || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Average property price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Generation Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Images</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.imagesGenerated || 0}</div>
            <p className="text-xs text-muted-foreground">
              Properties with AI images
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">
              70-day campaigns active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDF Brochures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.brochuresCreated || 0}</div>
            <p className="text-xs text-muted-foreground">
              Professional brochures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Microsites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.micrositesLive || 0}</div>
            <p className="text-xs text-muted-foreground">
              White-label websites
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Properties */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Properties</CardTitle>
              <CardDescription>
                Your latest property listings
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/properties')}
              className="gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentProperties.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No properties yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first property to get started
                </p>
                <Button onClick={handleAddProperty} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div 
                    key={property.id} 
                    className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/property/${property.id}`)}
                  >
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      {property.property_images?.[0] ? (
                        <img 
                          src={property.property_images[0].storage_path} 
                          alt={property.address}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <Home className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.address}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatCurrency(property.price || 0)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(property.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.type === 'property_added' && <Home className="h-4 w-4 text-primary" />}
                      {activity.type === 'post_published' && <Share2 className="h-4 w-4 text-primary" />}
                      {activity.type === 'content_generated' && <MessageSquare className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/properties/add')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add Property</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add a new property to your portfolio
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/content')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Content</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Generate images, brochures & microsites
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/social')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Manage 70-day social campaigns
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/leads')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Management</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Track and manage qualified leads
            </p>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  )
}