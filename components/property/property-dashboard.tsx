'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Home, 
  Image, 
  Share2, 
  FileText, 
  MessageCircle, 
  Globe, 
  Download, 
  Eye, 
  RefreshCw,
  ExternalLink,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Camera,
  Palette,
  Megaphone,
  BookOpen,
  Bot,
  ImageIcon
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { apiClient } from '@/lib/api-client'
import type { Database } from '@/types/supabase'

// Types
interface PropertyImage {
  id: string
  original_url: string
  room_type: string
  is_primary: boolean
  style_variant?: string
  storage_path?: string
  alt_text?: string
}

interface PropertyData {
  id: string
  address: string
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  property_type: string
  listing_status: string
  content_generation_status: string | null
  microsite_url?: string
  brochure_pdf_url?: string
  brochure_flipbook_url?: string
  property_images: PropertyImage[]
}

interface ContentStatus {
  images: {
    status: string
    original_count: number
    generated_count: number
    styles: string[]
  }
  social_campaign: {
    status: string
    total_posts: number
    posts_by_platform: Record<string, number>
    campaign_progress: {
      completion_percentage: number
      posts_published: number
      posts_scheduled: number
    }
  }
  brochure: {
    status: string
    pdf_url?: string
    flipbook_url?: string
    page_count?: number
  }
  microsite: {
    status: string
    url?: string
    analytics: {
      total_visits: number
      unique_visitors: number
      lead_captures: number
      conversion_rate: number
    }
  }
  chat_agent: {
    total_sessions: number
    qualified_leads: number
    average_lead_score: number
    recent_activity: number
  }
}

interface PropertyDashboardProps {
  propertyId: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status?: string
  original_images_count?: number
  generated_images_count?: number
  styles_generated?: string[]
  campaign_analytics?: {
    total_posts: number
    posts_by_platform: Record<string, number>
    campaign_progress: {
      completion_percentage: number
      posts_published: number
      posts_scheduled: number
    }
  }
  downloads?: {
    pdf_high_quality?: string
    interactive_flipbook?: string
  }
  generation_details?: {
    page_count?: number
  }
  microsite_url?: string
  analytics?: {
    total_visits: number
    unique_visitors: number
    lead_captures: number
    conversion_rate: number
  }
}

interface ChatSession {
  id: string
  property_id: string
  created_at: string
  updated_at: string
  [key: string]: any
}

// Utility function to safely get image URL
const getImageUrl = (image: PropertyImage | null | undefined): string | null => {
  if (!image) return null
  
  // Try different image URL sources in order of preference
  const imagePath = image.original_url || image.storage_path
  if (!imagePath) return null
  
  // If it's already an absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Use environment variable for storage base URL if available
  const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL
  if (storageBaseUrl) {
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    return `${storageBaseUrl}/${cleanPath}`
  }
  
  // Fallback to API route
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `/api/images/${cleanPath}`
}

// Helper functions
const authenticatedFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers if needed
    },
    ...options
  }
  
  return fetch(url, defaultOptions)
}

// Main component
export default function PropertyDashboard({ propertyId }: PropertyDashboardProps) {
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [contentStatus, setContentStatus] = useState<ContentStatus>({
    images: {
      status: 'not_started',
      original_count: 0,
      generated_count: 0,
      styles: []
    },
    social_campaign: {
      status: 'not_started',
      total_posts: 0,
      posts_by_platform: {},
      campaign_progress: {
        completion_percentage: 0,
        posts_published: 0,
        posts_scheduled: 0
      }
    },
    brochure: {
      status: 'not_started'
    },
    microsite: {
      status: 'not_started',
      analytics: {
        total_visits: 0,
        unique_visitors: 0,
        lead_captures: 0,
        conversion_rate: 0
      }
    },
    chat_agent: {
      total_sessions: 0,
      qualified_leads: 0,
      average_lead_score: 0,
      recent_activity: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    if (propertyId) {
      fetchPropertyData()
    }
  }, [propertyId])

  const fetchPropertyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch property details using API client
      const propertyResult = await apiClient.getProperty(propertyId)
      
      if (!propertyResult.success || !propertyResult.data) {
        throw new Error(propertyResult.error || 'Failed to fetch property')
      }
      
      // Fetch property images using API client
      const imagesResult = await apiClient.getPropertyImages(propertyId)
      
      // Combine property data with images
      const propertyWithImages: PropertyData = {
        ...propertyResult.data,
        property_images: imagesResult.success ? imagesResult.data || [] : []
      }
      
      setProperty(propertyWithImages)

      // Fetch content generation status for each component
      await Promise.all([
        fetchImageStatus(),
        fetchSocialCampaignStatus(),
        fetchBrochureStatus(),
        fetchMicrositeStatus(),
        fetchChatAgentStatus()
      ])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Error fetching property data:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchImageStatus = async () => {
    try {
      const response = await authenticatedFetch(`/api/property/generate-images?property_id=${propertyId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      setContentStatus(prev => ({
        ...prev,
        images: {
          status: data.status || 'not_started',
          original_count: data.original_images_count || 0,
          generated_count: data.generated_images_count || 0,
          styles: data.styles_generated || []
        }
      }))
    } catch (error) {
      console.error('Error fetching image status:', error)
      setContentStatus(prev => ({
        ...prev,
        images: {
          ...prev.images,
          status: 'error'
        }
      }))
    }
  }

  const fetchSocialCampaignStatus = async () => {
    try {
      const response = await authenticatedFetch(`/api/property/social-campaign?property_id=${propertyId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      setContentStatus(prev => ({
        ...prev,
        social_campaign: {
          status: data.status || 'not_started',
          total_posts: data.campaign_analytics?.total_posts || 0,
          posts_by_platform: data.campaign_analytics?.posts_by_platform || {},
          campaign_progress: data.campaign_analytics?.campaign_progress || {
            completion_percentage: 0,
            posts_published: 0,
            posts_scheduled: 0
          }
        }
      }))
    } catch (error) {
      console.error('Error fetching social campaign status:', error)
      setContentStatus(prev => ({
        ...prev,
        social_campaign: {
          ...prev.social_campaign,
          status: 'error'
        }
      }))
    }
  }

  const fetchBrochureStatus = async () => {
    try {
      const response = await authenticatedFetch(`/api/property/brochure?property_id=${propertyId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      setContentStatus(prev => ({
        ...prev,
        brochure: {
          status: data.status || 'not_started',
          pdf_url: data.downloads?.pdf_high_quality,
          flipbook_url: data.downloads?.interactive_flipbook,
          page_count: data.generation_details?.page_count
        }
      }))
    } catch (error) {
      console.error('Error fetching brochure status:', error)
      setContentStatus(prev => ({
        ...prev,
        brochure: {
          ...prev.brochure,
          status: 'error'
        }
      }))
    }
  }

  const fetchMicrositeStatus = async () => {
    try {
      const response = await authenticatedFetch(`/api/property/microsite?property_id=${propertyId}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      setContentStatus(prev => ({
        ...prev,
        microsite: {
          status: data.status || 'not_started',
          url: data.microsite_url,
          analytics: data.analytics || {
            total_visits: 0,
            unique_visitors: 0,
            lead_captures: 0,
            conversion_rate: 0
          }
        }
      }))
    } catch (error) {
      console.error('Error fetching microsite status:', error)
      setContentStatus(prev => ({
        ...prev,
        microsite: {
          ...prev.microsite,
          status: 'error'
        }
      }))
    }
  }

  const fetchChatAgentStatus = async () => {
    try {
      const { data: chatSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('property_id', propertyId)

      if (error) {
        console.error('Error fetching chat sessions:', error)
        return
      }

      const sessions = chatSessions || []
      const totalSessions = sessions.length
      const qualifiedLeads = 0 // TODO: Implement lead qualification logic
      const averageScore = 0 // TODO: Implement lead scoring
      const recentActivity = sessions.filter(session => 
        new Date(session.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length

      setContentStatus(prev => ({
        ...prev,
        chat_agent: {
          total_sessions: totalSessions,
          qualified_leads: qualifiedLeads,
          average_lead_score: averageScore,
          recent_activity: recentActivity
        }
      }))
    } catch (error) {
      console.error('Error fetching chat agent status:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPropertyData()
    setRefreshing(false)
  }

  const generateContent = async (contentType: string) => {
    try {
      let endpoint = ''
      const payload = { property_id: propertyId }

      switch (contentType) {
        case 'images':
          endpoint = '/api/property/generate-images'
          break
        case 'social':
          endpoint = '/api/property/social-campaign'
          break
        case 'brochure':
          endpoint = '/api/property/brochure'
          break
        case 'microsite':
          endpoint = '/api/property/microsite'
          break
        default:
          console.warn(`Unknown content type: ${contentType}`)
          return
      }

      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      
      if (data.success) {
        // Refresh data after a short delay
        setTimeout(() => fetchPropertyData(), 2000)
      } else {
        throw new Error(data.error || `Failed to generate ${contentType}`)
      }
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error)
      // You might want to show a toast notification here
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string }> = {
      'not_started': { variant: 'secondary', text: 'Not Started' },
      'generating': { variant: 'default', text: 'Generating...' },
      'generating_images': { variant: 'default', text: 'Generating Images...' },
      'generating_social_campaign': { variant: 'default', text: 'Creating Campaign...' },
      'generating_brochure': { variant: 'default', text: 'Creating Brochure...' },
      'generating_microsite': { variant: 'default', text: 'Building Microsite...' },
      'completed': { variant: 'default', text: 'Completed' },
      'images_completed': { variant: 'default', text: 'Images Ready' },
      'social_campaign_completed': { variant: 'default', text: 'Campaign Live' },
      'brochure_completed': { variant: 'default', text: 'Brochure Ready' },
      'microsite_completed': { variant: 'default', text: 'Microsite Live' },
      'error': { variant: 'destructive', text: 'Error' }
    }

    const config = statusConfig[status] || statusConfig['not_started']
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return 'Price not available'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Error Loading Property</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Property not found</h2>
          <p className="text-muted-foreground">The requested property could not be found.</p>
        </div>
      </div>
    )
  }

  // Get primary image for display
  const primaryImage = property.property_images?.find(img => img.is_primary) || 
                      property.property_images?.[0] || null
  const imageUrl = getImageUrl(primaryImage)
  const imageCount = property.property_images?.length || 0

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{property.address}</h1>
          <p className="text-muted-foreground">
            {formatPrice(property.price)} • {property.bedrooms} bed • {property.bathrooms} bath • {formatNumber(property.square_feet)} sq ft
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(property.content_generation_status || 'not_started')}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Property Image Preview */}
      {property.property_images && property.property_images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Property Images ({imageCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden max-w-md">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={primaryImage?.alt_text || property.address}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+Error'
                    }}
                  />
                  {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      +{imageCount - 1} more
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* AI-Restyled Images */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              AI-Restyled Images
            </CardTitle>
            {getStatusBadge(contentStatus.images.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Original Images:</span>
                <span>{contentStatus.images.original_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Generated Images:</span>
                <span>{contentStatus.images.generated_count}</span>
              </div>
              {contentStatus.images.styles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contentStatus.images.styles.map((style, index) => (
                    <Badge key={`${style}-${index}`} variant="outline" className="text-xs">
                      {style}
                    </Badge>
                  ))}
                </div>
              )}
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => generateContent('images')}
                disabled={contentStatus.images.status === 'generating'}
              >
                <Camera className="h-4 w-4 mr-2" />
                {contentStatus.images.status === 'not_started' ? 'Generate Images' : 'Regenerate'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              70-Day Social Campaign
            </CardTitle>
            {getStatusBadge(contentStatus.social_campaign.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Posts:</span>
                <span>{contentStatus.social_campaign.total_posts}/210</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Progress:</span>
                <span>{contentStatus.social_campaign.campaign_progress.completion_percentage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Published:</span>
                <span>{contentStatus.social_campaign.campaign_progress.posts_published}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Scheduled:</span>
                <span>{contentStatus.social_campaign.campaign_progress.posts_scheduled}</span>
              </div>
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => generateContent('social')}
                disabled={contentStatus.social_campaign.status === 'generating'}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {contentStatus.social_campaign.status === 'not_started' ? 'Create Campaign' : 'View Campaign'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Brochure */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              PDF Brochure
            </CardTitle>
            {getStatusBadge(contentStatus.brochure.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentStatus.brochure.page_count && (
                <div className="flex justify-between text-sm">
                  <span>Pages:</span>
                  <span>{contentStatus.brochure.page_count}</span>
                </div>
              )}
              {contentStatus.brochure.pdf_url && (
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={contentStatus.brochure.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                  {contentStatus.brochure.flipbook_url && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={contentStatus.brochure.flipbook_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        View Flipbook
                      </a>
                    </Button>
                  )}
                </div>
              )}
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => generateContent('brochure')}
                disabled={contentStatus.brochure.status === 'generating'}
              >
                <FileText className="h-4 w-4 mr-2" />
                {contentStatus.brochure.status === 'not_started' ? 'Create Brochure' : 'Regenerate'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* White-Label Microsite */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              White-Label Microsite
            </CardTitle>
            {getStatusBadge(contentStatus.microsite.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Visits:</span>
                  <p className="font-medium">{contentStatus.microsite.analytics.total_visits}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Leads:</span>
                  <p className="font-medium">{contentStatus.microsite.analytics.lead_captures}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Visitors:</span>
                  <p className="font-medium">{contentStatus.microsite.analytics.unique_visitors}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conv. Rate:</span>
                  <p className="font-medium">{contentStatus.microsite.analytics.conversion_rate.toFixed(1)}%</p>
                </div>
              </div>
              {contentStatus.microsite.url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={contentStatus.microsite.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Microsite
                  </a>
                </Button>
              )}
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => generateContent('microsite')}
                disabled={contentStatus.microsite.status === 'generating'}
              >
                <Globe className="h-4 w-4 mr-2" />
                {contentStatus.microsite.status === 'not_started' ? 'Create Microsite' : 'Regenerate'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Agent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Chat Agent
            </CardTitle>
            <Badge variant="default">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Sessions:</span>
                  <p className="font-medium">{contentStatus.chat_agent.total_sessions}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Qualified:</span>
                  <p className="font-medium">{contentStatus.chat_agent.qualified_leads}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Score:</span>
                  <p className="font-medium">{contentStatus.chat_agent.average_lead_score.toFixed(0)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Today:</span>
                  <p className="font-medium">{contentStatus.chat_agent.recent_activity}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                View Conversations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics Overview
            </CardTitle>
            <Badge variant="outline">Live</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Reach:</span>
                  <p className="font-medium">
                    {(contentStatus.microsite.analytics.total_visits + 
                      contentStatus.social_campaign.total_posts * 100).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Engagement:</span>
                  <p className="font-medium">
                    {contentStatus.chat_agent.total_sessions + contentStatus.microsite.analytics.lead_captures}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Conversion:</span>
                  <p className="font-medium">{contentStatus.chat_agent.qualified_leads}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ROI Score:</span>
                  <p className="font-medium text-green-600">High</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate all marketing content for this property with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                generateContent('images')
                generateContent('social')
                generateContent('brochure')
                generateContent('microsite')
              }}
              disabled={property.content_generation_status?.includes('generating') || false}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate All Content
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Assets
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Marketing Package
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}