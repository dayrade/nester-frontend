'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { Property, PropertyImage, SocialPost } from '@/types/supabase'
import Navbar from '@/components/navigation/navbar'
import { 
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  ExternalLink,
  Share2,
  Edit,
  Trash2,
  Plus,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  Loader2,
  AlertCircle,
  Camera,
  Play,
  Download,
  Copy,
  Check
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, supabaseHelpers } from '@/lib/supabase'
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from '@/lib/utils'
import { authenticatedFetch, apiClient } from '@/lib/api-client'
import MortgageCalculator from '@/components/property/mortgage-calculator'

interface PropertyWithImages extends Property {
  property_images: PropertyImage[]
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSupabase()
  const [property, setProperty] = useState<PropertyWithImages | null>(null)
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)

  useEffect(() => {
    if (params.id && user) {
      fetchPropertyDetails()
    }
  }, [params.id, user])

  const fetchPropertyDetails = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch property details
      const propertyId = Array.isArray(params.id) ? params.id[0] : params.id
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('agent_id', user.id)
        .single()
      
      if (propertyError) {
        if (propertyError.code === 'PGRST116') {
          setError('Property not found or you do not have access to it.')
        } else {
          throw propertyError
        }
        return
      }
      
      // Fetch property images via backend API
      const { data: imagesData } = await supabaseHelpers.getPropertyImages(propertyId)
      
      // Combine property data with images
      const propertyWithImages = {
        ...propertyData,
        property_images: imagesData || []
      }
      
      setProperty(propertyWithImages)
      
      // Fetch social posts for this property
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .eq('property_id', propertyId)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
      
      if (postsError) throw postsError
      
      setSocialPosts(postsData || [])
      
    } catch (err) {
      console.error('Error fetching property details:', err)
      setError('Failed to load property details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async () => {
    if (!property || !user?.id) return
    
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)
        .eq('agent_id', user.id)
      
      if (error) throw error
      
      router.push('/dashboard/properties')
    } catch (err) {
      console.error('Error deleting property:', err)
      alert('Failed to delete property. Please try again.')
    }
  }

  const handleGenerateContent = async () => {
    if (!property) return
    
    try {
      setIsGeneratingContent(true)
      
      const result = await apiClient.generatePropertyContent(property.id)
      
      if (result.success) {
        // Refresh social posts
        setTimeout(() => {
          fetchPropertyDetails()
        }, 2000)
        
        alert('Content generation started! New posts will appear shortly.')
      } else {
        throw new Error(result.error || 'Failed to generate content')
      }
    } catch (err) {
      console.error('Error generating content:', err)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGeneratingContent(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'badge-success', label: 'Active' },
      pending: { class: 'badge-warning', label: 'Pending' },
      sold: { class: 'badge-info', label: 'Sold' },
      withdrawn: { class: 'badge-error', label: 'Withdrawn' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { class: 'badge-neutral', label: status }
    
    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading property details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Property</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link href="/dashboard/properties" className="btn btn-outline btn-error">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images = property.property_images || []
  const mainImage = images[selectedImageIndex] || null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/properties" 
              className="btn btn-ghost btn-circle"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {property.address}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(property.listing_status)}
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <Link href={`/property/edit/${property.id}`}>
                    <Edit className="h-4 w-4" />
                    Edit Property
                  </Link>
                </li>
                <li>
                  <button onClick={() => copyToClipboard(window.location.href)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </li>
                {property.listing_url && (
                  <li>
                    <a href={property.listing_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      View Original Listing
                    </a>
                  </li>
                )}
                <li>
                  <button 
                    onClick={handleDeleteProperty}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Property
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-0">
                {images.length > 0 ? (
                  <div>
                    {/* Main Image */}
                    <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={mainImage?.storage_path || '/placeholder-property.svg'}
                        alt={property.address}
                        fill
                        className="object-cover rounded-t-lg cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                      />
                      <div className="absolute top-4 right-4">
                        <button 
                          onClick={() => setShowImageModal(true)}
                          className="btn btn-sm bg-black/50 text-white border-none hover:bg-black/70"
                        >
                          <Camera className="h-4 w-4" />
                          View All ({images.length})
                        </button>
                      </div>
                    </div>
                    
                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                      <div className="p-4">
                        <div className="flex space-x-2 overflow-x-auto">
                          {images.map((image, index) => (
                            <button
                              key={image.id}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                selectedImageIndex === index
                                  ? 'border-primary'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={image.storage_path}
                                alt={`Property image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Property Details</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bed className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                  )}
                  
                  {property.bathrooms && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bath className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                  )}
                  
                  {property.square_feet && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Square className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(property.square_feet)}
                      </p>
                      <p className="text-sm text-gray-600">Sq Ft</p>
                    </div>
                  )}
                  
                  {property.year_built && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{property.year_built}</p>
                      <p className="text-sm text-gray-600">Year Built</p>
                    </div>
                  )}
                </div>
                
                {property.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Posts */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-xl">Social Media Posts</h2>
                  <button 
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent}
                    className="btn btn-primary btn-sm"
                  >
                    {isGeneratingContent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                  </button>
                </div>
                
                {socialPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Social Posts Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Generate AI-powered social media content for this property
                    </p>
                    <button 
                      onClick={handleGenerateContent}
                      disabled={isGeneratingContent}
                      className="btn btn-primary"
                    >
                      {isGeneratingContent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {socialPosts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="badge badge-outline capitalize">
                              {post.platform}
                            </span>
                            <span className={`badge badge-sm ${
                              post.status === 'published' ? 'badge-success' :
                              post.status === 'scheduled' ? 'badge-info' :
                              post.status === 'draft' ? 'badge-warning' : 'badge-error'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(post.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 mb-3 whitespace-pre-wrap">
                          {post.copy_text}
                        </p>
                        
                        {post.image_path && (
                          <div className="mb-3">
                            <div className="relative aspect-square max-w-xs">
                              <Image
                                src={post.image_path}
                                alt="Social media content"
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                        

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Key Info */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(property.price || 0)}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {property.property_type} • {property.listing_status}
                  </p>
                </div>
                
                <div className="divider"></div>
                
                <div className="space-y-3">
                  {property.lot_size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lot Size:</span>
                      <span className="font-medium">{formatNumber(property.lot_size)} sq ft</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium">
                      {formatDate(property.created_at, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  

                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <Link 
                    href={`/property/edit/${property.id}`}
                    className="btn btn-outline w-full justify-start"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Property
                  </Link>
                  
                  <button 
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent}
                    className="btn btn-primary w-full justify-start"
                  >
                    {isGeneratingContent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                  </button>
                  
                  <button 
                    onClick={() => copyToClipboard(window.location.href)}
                    className="btn btn-outline w-full justify-start"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  
                  {property.listing_url && (
                    <a 
                      href={property.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Original
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Mortgage Calculator */}
            <MortgageCalculator 
              propertyPrice={property.price || 0}
              className=""
            />

            {/* Content Generation Status */}
            {property.content_generation_status && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">Content Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`badge ${
                        property.content_generation_status === 'completed' ? 'badge-success' :
                        property.content_generation_status === 'processing' ? 'badge-warning' :
                        property.content_generation_status === 'failed' ? 'badge-error' :
                        'badge-neutral'
                      }`}>
                        {property.content_generation_status}
                      </span>
                    </div>
                    

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Property Images</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            {images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video">
                  <Image
                    src={images[selectedImageIndex]?.storage_path || '/placeholder-property.svg'}
                    alt={`Property image ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.storage_path}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => setShowImageModal(false)}></div>
        </div>
      )}
    </div>
  )
}