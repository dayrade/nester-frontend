'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { Property, SocialPost, SocialStats } from '@/types/supabase'
import Navbar from '@/components/navigation/navbar'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Calendar,
  DollarSign,
  Home,
  Users,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatNumber, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

interface AnalyticsData {
  totalProperties: number
  totalPosts: number
  totalViews: number
  totalEngagement: number
  avgPrice: number
  propertiesByStatus: Record<string, number>
  propertiesByType: Record<string, number>
  postsByPlatform: Record<string, number>
  engagementByPlatform: Record<string, number>
  monthlyStats: Array<{
    month: string
    properties: number
    posts: number
    views: number
    engagement: number
  }>
  topPerformingPosts: Array<{
    id: string
    content: string
    platform: string
    views: number
    engagement: number
    property_title?: string
  }>
  recentActivity: Array<{
    id: string
    type: 'property_added' | 'post_published' | 'content_generated'
    title: string
    timestamp: string
    metadata?: any
  }>
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsPage() {
  const { user } = useSupabase()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate date range
      const now = new Date()
      const daysBack = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[timeRange]
      
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .gte('created_at', startDate.toISOString())
      
      if (propertiesError) throw propertiesError
      
      // Fetch social posts with stats
      const { data: posts, error: postsError } = await supabase
        .from('social_posts')
        .select(`
          *,
          properties!inner(title)
        `)
        .eq('agent_id', user.id)
        .gte('created_at', startDate.toISOString())
      
      if (postsError) throw postsError
      
      // Fetch social stats
      const { data: stats, error: statsError } = await supabase
        .from('social_stats')
        .select('*')
        .in('post_id', posts?.map(p => p.id) || [])
      
      if (statsError) throw statsError
      
      // Process analytics data
      const analyticsData = processAnalyticsData(properties || [], posts || [], stats || [])
      setAnalytics(analyticsData)
      
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (
    properties: Property[], 
    posts: SocialPost[], 
    stats: SocialStats[]
  ): AnalyticsData => {
    // Basic totals
    const totalProperties = properties.length
    const totalPosts = posts.length
    const totalViews = stats.reduce((sum, stat) => sum + (stat.impressions || 0), 0)
    const totalEngagement = stats.reduce((sum, stat) => 
      sum + (stat.engagements || 0) + (stat.clicks || 0) + (stat.shares || 0), 0
    )
    
    // Average price
    const avgPrice = properties.length > 0 
      ? properties.reduce((sum, prop) => sum + (prop.price || 0), 0) / properties.length
      : 0
    
    // Properties by status
    const propertiesByStatus = properties.reduce((acc, prop) => {
      acc[prop.listing_status] = (acc[prop.listing_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Properties by type
    const propertiesByType = properties.reduce((acc, prop) => {
      acc[prop.property_type] = (acc[prop.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Posts by platform
    const postsByPlatform = posts.reduce((acc, post) => {
      const platform = post.platform || 'unknown'
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Engagement by platform
    const engagementByPlatform = posts.reduce((acc, post) => {
      const postStats = stats.filter(stat => stat.post_id === post.id)
      const engagement = postStats.reduce((sum, stat) => 
        sum + (stat.engagements || 0) + (stat.clicks || 0) + (stat.shares || 0), 0
      )
      const platform = post.platform || 'unknown'
      acc[platform] = (acc[platform] || 0) + engagement
      return acc
    }, {} as Record<string, number>)
    
    // Monthly stats (simplified for demo)
    const monthlyStats = generateMonthlyStats(properties, posts)
    
    // Top performing posts
    const topPerformingPosts = posts
      .map(post => {
        const postStats = stats.filter(stat => stat.post_id === post.id)
        const views = postStats.reduce((sum, stat) => sum + (stat.impressions || 0), 0)
        const engagement = postStats.reduce((sum, stat) => 
          sum + (stat.engagements || 0) + (stat.clicks || 0) + (stat.shares || 0), 0
        )
        return {
          id: post.id,
          content: post.copy_text?.substring(0, 100) + '...' || '',
          platform: post.platform || 'unknown',
          views,
          engagement,
          property_title: (post as any).properties?.address
        }
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)
    
    // Recent activity
    const recentActivity = generateRecentActivity(properties, posts)
    
    return {
      totalProperties,
      totalPosts,
      totalViews,
      totalEngagement,
      avgPrice,
      propertiesByStatus,
      propertiesByType,
      postsByPlatform,
      engagementByPlatform,
      monthlyStats,
      topPerformingPosts,
      recentActivity
    }
  }

  const generateMonthlyStats = (properties: Property[], posts: SocialPost[]) => {
    // Simplified monthly stats generation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      properties: Math.floor(Math.random() * 10) + 1,
      posts: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 1000) + 100,
      engagement: Math.floor(Math.random() * 200) + 50
    }))
  }

  const generateRecentActivity = (properties: Property[], posts: SocialPost[]) => {
    const activities: Array<{
      id: string;
      type: 'property_added' | 'post_published';
      title: string;
      timestamp: string;
    }> = []
    
    // Add property activities
    properties.slice(0, 3).forEach(prop => {
      activities.push({
        id: prop.id,
        type: 'property_added' as const,
        title: `Added property: ${prop.address}`,
        timestamp: prop.created_at
      })
    })
    
    // Add post activities
    posts.slice(0, 3).forEach(post => {
      activities.push({
        id: post.id,
        type: 'post_published' as const,
        title: `Published ${post.platform} post`,
        timestamp: post.created_at
      })
    })
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null
    
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0
    
    return (
      <div className={`flex items-center text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-primary" />
              Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Track your property and social media performance
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              className="select select-bordered"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="btn btn-outline">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Analytics</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={fetchAnalytics} className="btn btn-outline btn-error">
              Try Again
            </button>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.totalProperties)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  {getChangeIndicator(analytics.totalProperties, analytics.totalProperties * 0.8)}
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Social Posts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.totalPosts)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Share2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  {getChangeIndicator(analytics.totalPosts, analytics.totalPosts * 0.7)}
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.totalViews)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  {getChangeIndicator(analytics.totalViews, analytics.totalViews * 0.9)}
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(analytics.totalEngagement)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  {getChangeIndicator(analytics.totalEngagement, analytics.totalEngagement * 0.85)}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Properties by Status */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Properties by Status</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.propertiesByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analytics.totalProperties) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Posts by Platform */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Posts by Platform</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.postsByPlatform).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{platform}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analytics.totalPosts) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Posts */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Top Performing Posts</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Content</th>
                        <th>Platform</th>
                        <th>Property</th>
                        <th>Views</th>
                        <th>Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topPerformingPosts.map((post) => (
                        <tr key={post.id}>
                          <td>
                            <div className="max-w-xs truncate">
                              {post.content}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-outline capitalize">
                              {post.platform}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {post.property_title || 'N/A'}
                            </div>
                          </td>
                          <td>{formatNumber(post.views)}</td>
                          <td>{formatNumber(post.engagement)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {activity.type === 'property_added' && <Home className="h-4 w-4 text-primary" />}
                        {activity.type === 'post_published' && <Share2 className="h-4 w-4 text-primary" />}
                        {activity.type === 'content_generated' && <TrendingUp className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}