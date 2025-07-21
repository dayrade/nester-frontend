'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
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
  ArrowUpRight,
  Settings
} from 'lucide-react'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils'
import { useLoading } from '@/hooks/use-loading'
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
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { showLoader, hideLoader, withLoading, isLoading } = useLoading()
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
      await withLoading(
        () => loadDashboardData(user.id),
        'NESTER' 
      )
    }

    getUser()
  }, [])

  const loadDashboardData = async (userId: string) => {
    try {

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
        ...sampleProperties.slice(0, 2).map(prop => ({
          id: prop.id,
          type: 'property_added' as const,
          title: 'New Property Added',
          description: prop.address,
          timestamp: prop.created_at,
          property_id: prop.id,
          status: prop.listing_status
        })),
        ...samplePosts.slice(0, 2).map(post => ({
          id: post.id,
          type: 'post_published' as const,
          title: 'Social Post Published',
          description: `${post.platform} - ${post.copy_text?.substring(0, 50)}...`,
          timestamp: post.created_at,
          post_id: post.id,
          property_id: post.property_id
        })),
        // Add content generation activities
        ...sampleProperties.filter(p => p.content_generation_status?.includes('completed')).slice(0, 3).map(prop => {
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
        ...sampleChatSessions.filter(s => s.lead_qualification_score >= 70).slice(0, 2).map(session => ({
          id: session.id,
          type: 'lead_qualified' as const,
          title: 'Lead Qualified',
          description: `Score: ${session.lead_qualification_score} - ${session.properties?.address}`,
          timestamp: session.updated_at || session.created_at,
          property_id: session.property_id
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

      setRecentActivity(activity)
      
      // Simulate loading delay to demonstrate the loader
      await new Promise(resolve => setTimeout(resolve, 1500))
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  const handleAddProperty = () => {
    router.push('/dashboard/properties?action=add')
  }

  if (isLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                Welcome back! Here's what's happening with your properties.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/analytics')} className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button onClick={handleAddProperty} className="gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs sm:text-sm px-2 sm:px-4">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Add Property</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Properties</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalProperties || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+12%</span>
              </div>
              <p className="text-xs text-gray-600">
                {stats?.activeListings || 0} active listings
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Content Generated</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.contentGenerated || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+8%</span>
              </div>
              <p className="text-xs text-gray-600">
                {stats?.micrositesLive || 0} microsites live
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Lead Conversion</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{(stats?.conversionRate || 0).toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+5%</span>
              </div>
              <p className="text-xs text-gray-600">
                {stats?.totalLeads || 0} total leads
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Portfolio Value</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.averagePrice || 0)}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+15%</span>
              </div>
              <p className="text-xs text-gray-600">
                Average property price
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Generation Overview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Content Generation</h2>
            <p className="text-sm sm:text-base text-gray-600">AI-powered marketing assets for your properties</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/content')} className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 self-start sm:self-auto">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Generate Content</span>
            <span className="xs:hidden">Generate</span>
          </Button>
        </div>
        
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">AI Images</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.imagesGenerated || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Properties with AI images
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Social Campaigns</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.activeCampaigns || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                70-day campaigns active
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">PDF Brochures</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.brochuresCreated || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Professional brochures
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Live Microsites</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.micrositesLive || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                White-label websites
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Recent Properties */}
        <Card className="lg:col-span-4 border-0 shadow-lg bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Recent Properties</CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600">
                Your latest property listings
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/properties')}
              className="gap-1 sm:gap-2 hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm self-start sm:self-auto"
            >
              View All
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recentProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-6">
                  Add your first property to get started with AI-powered marketing
                </p>
                <Button onClick={handleAddProperty} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProperties.map((property) => (
                  <div 
                    key={property.id} 
                    className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
                    onClick={() => router.push(`/property/${property.id}`)}
                  >
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {property.property_images?.[0] ? (
                        <img 
                          src={property.property_images[0].storage_path} 
                          alt={property.address}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <Home className="h-7 w-7 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{property.address}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-bold text-green-600">{formatCurrency(property.price || 0)}</span>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          {property.listing_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatRelativeTime(property.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                        <span className="text-xs text-gray-600 capitalize">{property.content_generation_status?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Latest updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'property_added':
                        return { icon: Home, color: 'from-blue-500 to-indigo-500' }
                      case 'post_published':
                        return { icon: Share2, color: 'from-green-500 to-emerald-500' }
                      case 'content_generated':
                        return { icon: MessageSquare, color: 'from-purple-500 to-pink-500' }
                      case 'images_generated':
                        return { icon: Camera, color: 'from-pink-500 to-rose-500' }
                      case 'brochure_created':
                        return { icon: FileText, color: 'from-orange-500 to-amber-500' }
                      case 'microsite_launched':
                        return { icon: Globe, color: 'from-cyan-500 to-blue-500' }
                      case 'campaign_started':
                        return { icon: Megaphone, color: 'from-violet-500 to-purple-500' }
                      case 'lead_qualified':
                        return { icon: Target, color: 'from-emerald-500 to-teal-500' }
                      default:
                        return { icon: Activity, color: 'from-gray-500 to-slate-500' }
                    }
                  }
                  
                  const { icon: Icon, color } = getActivityIcon(activity.type)
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${color} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                          {activity.status && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {activity.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">Get started with common tasks</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 group" onClick={() => router.push('/dashboard/properties/add')}>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Add Property</h3>
              <p className="text-sm text-gray-600">
                Add a new property to your portfolio
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  Quick Start
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 group" onClick={() => router.push('/dashboard/content')}>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI Content</h3>
              <p className="text-sm text-gray-600">
                Generate images, brochures & microsites
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  AI Powered
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 group" onClick={() => router.push('/dashboard/social')}>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Megaphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Social Campaigns</h3>
              <p className="text-sm text-gray-600">
                Manage 70-day social campaigns
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                  Marketing
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 group" onClick={() => router.push('/dashboard/leads')}>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Lead Management</h3>
              <p className="text-sm text-gray-600">
                Track and manage qualified leads
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  CRM
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}