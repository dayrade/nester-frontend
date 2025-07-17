'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { SocialPost, Property } from '@/types/supabase'
import Navbar from '@/components/navigation/navbar'
import { 
  Share2, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Repeat2,
  ExternalLink,
  Filter,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Play
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, formatRelativeTime, formatNumber } from '@/lib/utils'

interface SocialPostWithProperty extends SocialPost {
  properties: Property | null
}

type PlatformFilter = 'all' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok'
type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'failed'

const PLATFORM_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Play
}

const PLATFORM_COLORS = {
  facebook: 'text-blue-600',
  instagram: 'text-pink-600',
  twitter: 'text-sky-500',
  linkedin: 'text-blue-700',
  tiktok: 'text-black'
}

export default function SocialPage() {
  const { user } = useSupabase()
  const [posts, setPosts] = useState<SocialPostWithProperty[]>([])
  const [filteredPosts, setFilteredPosts] = useState<SocialPostWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    if (user) {
      fetchSocialPosts()
    }
  }, [user])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, platformFilter, statusFilter])

  const fetchSocialPosts = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          properties (*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching social posts:', err)
      setError('Failed to load social posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.copy_text?.toLowerCase().includes(query) ||
        post.properties?.address?.toLowerCase().includes(query)
      )
    }
    
    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(post => post.platform === platformFilter)
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }
    
    setFilteredPosts(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { class: 'badge-warning', label: 'Draft' },
      scheduled: { class: 'badge-info', label: 'Scheduled' },
      published: { class: 'badge-success', label: 'Published' },
      failed: { class: 'badge-error', label: 'Failed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'badge-neutral', label: status }
    
    return (
      <span className={`badge badge-sm ${config.class}`}>
        {config.label}
      </span>
    )
  }

  const getPlatformIcon = (platform: string) => {
    const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]
    const colorClass = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]
    
    if (!Icon) return null
    
    return <Icon className={`h-4 w-4 ${colorClass}`} />
  }

  const handlePostAction = async (postId: string, action: 'publish' | 'delete') => {
    if (!user?.id) return
    
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this post?')) return
        
        const { error } = await supabase
          .from('social_posts')
          .delete()
          .eq('id', postId)
          .eq('agent_id', user.id)
        
        if (error) throw error
        
        setPosts(prev => prev.filter(p => p.id !== postId))
      } else if (action === 'publish') {
        // This would trigger the publishing workflow
        // For now, we'll just update the status
        const { error } = await supabase
          .from('social_posts')
          .update({ status: 'scheduled', scheduled_for: new Date().toISOString() })
          .eq('id', postId)
          .eq('agent_id', user.id)
        
        if (error) throw error
        
        // Refresh posts
        fetchSocialPosts()
      }
    } catch (err) {
      console.error(`Error ${action}ing post:`, err)
      alert(`Failed to ${action} post. Please try again.`)
    }
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
              <Share2 className="h-8 w-8 mr-3 text-primary" />
              Social Media
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your social media posts and track engagement
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link href="/dashboard/properties" className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Create Content
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Platform Filter */}
            <div>
              <select
                className="select select-bordered w-full"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading social posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Posts</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={fetchSocialPosts} className="btn btn-outline btn-error">
              Try Again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            {posts.length === 0 ? (
              <div>
                <Share2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Social Posts Yet</h3>
                <p className="text-gray-600 mb-6">
                  Add properties and generate social media content to get started
                </p>
                <Link href="/dashboard/properties" className="btn btn-primary">
                  <Plus className="h-4 w-4" />
                  View Properties
                </Link>
              </div>
            ) : (
              <div>
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Posts Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setPlatformFilter('all')
                    setStatusFilter('all')
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredPosts.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(post.platform)}
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {post.platform}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {post.archetype && `${post.archetype} • `}
                          {formatRelativeTime(post.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(post.status)}
                      
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          {post.status === 'draft' && (
                            <li>
                              <button onClick={() => handlePostAction(post.id, 'publish')}>
                                <Calendar className="h-4 w-4" />
                                Schedule Post
                              </button>
                            </li>
                          )}
                          {post.post_url && (
                            <li>
                              <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                View Post
                              </a>
                            </li>
                          )}
                          <li>
                            <button 
                              onClick={() => handlePostAction(post.id, 'delete')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Info */}
                  {post.properties && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <Link 
                        href={`/property/${post.properties.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {post.properties.title}
                      </Link>
                      <p className="text-xs text-gray-600">
                        {post.properties.address}, {post.properties.city}, {post.properties.state}
                      </p>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-gray-900 whitespace-pre-wrap line-clamp-4">
                      {post.content}
                    </p>
                  </div>
                  
                  {/* Media */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {post.media_urls.slice(0, 4).map((url, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image
                              src={url}
                              alt="Post media"
                              fill
                              className="object-cover rounded-lg"
                            />
                            {post.media_urls!.length > 4 && index === 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <span className="text-white font-medium">
                                  +{post.media_urls!.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Engagement Stats */}
                  {(post.likes_count || post.comments_count || post.shares_count || post.views_count) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 pt-3 border-t">
                      {post.views_count && (
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{formatNumber(post.views_count)}</span>
                        </div>
                      )}
                      {post.likes_count && (
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{formatNumber(post.likes_count)}</span>
                        </div>
                      )}
                      {post.comments_count && (
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{formatNumber(post.comments_count)}</span>
                        </div>
                      )}
                      {post.shares_count && (
                        <div className="flex items-center space-x-1">
                          <Repeat2 className="h-4 w-4" />
                          <span>{formatNumber(post.shares_count)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Scheduled Time */}
                  {post.scheduled_for && post.status === 'scheduled' && (
                    <div className="text-sm text-gray-600 pt-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Scheduled for {formatDate(post.scheduled_for, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}