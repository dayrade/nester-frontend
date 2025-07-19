'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { PropertyData } from '@/types/supabase'
import { ArrowLeft, Link as LinkIcon, FileText, Upload, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLoading } from '@/hooks/use-loading'

type InputMethod = 'url' | 'manual'

export default function AddPropertyPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const { brandAssets } = useBrand()
  const { withLoading } = useLoading()
  
  // All state hooks must be declared at the top
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [inputMethod, setInputMethod] = useState<InputMethod>('url')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [propertyUrl, setPropertyUrl] = useState('')
  const [formData, setFormData] = useState<Partial<PropertyData>>({
    address: '',
    price: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    square_feet: undefined,
    property_type: 'house',
    description: '',
    features: [],
    neighborhood_info: ''
  })
  const [images, setImages] = useState<File[]>([])

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading) {
        if (!user) {
          // Redirect to login with return URL
          router.push('/auth/login?redirect=/property/add')
          return
        }
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [user, authLoading, router])

  // Show loading while checking authentication
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="card bg-white shadow-lg max-w-md w-full mx-4">
          <div className="card-body text-center">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to add properties. Please sign in or create an account to continue.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login?redirect=/property/add" className="btn btn-primary w-full">
                Sign In
              </Link>
              <Link href="/auth/login?mode=signup&redirect=/property/add" className="btn btn-outline w-full">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !propertyUrl.trim()) return

    setError('')

    try {
      await withLoading(async () => {
      // Call N8N workflow to scrape property data
      const response = await fetch('/api/property/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: propertyUrl,
          agent_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape property data')
      }

        // Redirect to property page
        router.push(`/property/${result.property_id}`)
      }, 'Scraping property data...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.address?.trim()) return

    setError('')

    try {
      await withLoading(async () => {
        // Prepare property data for API
        const propertyData = {
          agent_id: user.id,
          address: formData.address!,
          price: formData.price,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          square_feet: formData.square_feet,
          property_type: formData.property_type!,
          description: formData.description,
          features: formData.features,
          neighborhood_info: formData.neighborhood_info,
          listing_status: 'active'
        }

        // Create property via API
        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create property')
        }

        const property = result.data

        // Upload images if any
        if (images.length > 0) {
          const uploadPromises = images.map(async (file, index) => {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('displayOrder', index.toString())
            formData.append('isPrimary', (index === 0).toString())
            formData.append('altText', `Property image ${index + 1}`)
            
            const uploadResponse = await fetch(`/api/properties/${property.id}/images`, {
              method: 'POST',
              body: formData
            })

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json()
              throw new Error(errorData.error || `Failed to upload image ${index + 1}`)
            }

            return await uploadResponse.json()
          })

          await Promise.all(uploadPromises)
        }

        // Trigger content generation
        await fetch('/api/property/generate-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            property_id: property.id
          })
        })

        // Redirect to property page
        router.push(`/property/${property.id}`)
      }, 'Creating property and uploading images...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files].slice(0, 10)) // Max 10 images
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Link href="/dashboard" className="btn btn-ghost btn-sm self-start">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline ml-1">Back to Dashboard</span>
              <span className="xs:hidden ml-1">Back</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {brandAssets?.logo && (
                <Image
                  src={brandAssets.logo}
                  alt={brandAssets.companyName || 'Logo'}
                  width={32}
                  height={32}
                  className="h-6 w-auto sm:h-8"
                />
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Property</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Input Method Selection */}
        <div className="card bg-white shadow-sm mb-6 sm:mb-8">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">How would you like to add your property?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setInputMethod('url')}
                className={`p-4 sm:p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'url'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Import from URL</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Paste a listing URL from Zillow, Realtor.com, or other platforms
                </p>
              </button>
              
              <button
                onClick={() => setInputMethod('manual')}
                className={`p-4 sm:p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Manual Entry</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Enter property details manually with photos
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* URL Input Form */}
        {inputMethod === 'url' && (
          <div className="card bg-white shadow-sm">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Import Property from URL</h2>
              <form onSubmit={handleUrlSubmit}>
                <div className="form-control mb-4 sm:mb-6">
                  <label className="label">
                    <span className="label-text font-medium text-sm sm:text-base">Property Listing URL</span>
                  </label>
                  <input
                    type="url"
                    value={propertyUrl}
                    onChange={(e) => setPropertyUrl(e.target.value)}
                    placeholder="https://www.zillow.com/homedetails/..."
                    className="input input-bordered w-full text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500 text-xs sm:text-sm">
                      Supported: Zillow, Realtor.com, Redfin, and more
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !propertyUrl.trim()}
                  className="btn btn-primary w-full text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden xs:inline">Importing Property...</span>
                      <span className="xs:hidden">Importing...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xs:inline">Import Property</span>
                      <span className="xs:hidden">Import</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        {inputMethod === 'manual' && (
          <div className="card bg-white shadow-sm">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enter Property Details</h2>
              <form onSubmit={handleManualSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="form-control sm:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Property Address *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State 12345"
                      className="input input-bordered w-full text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Price</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || undefined }))}
                      placeholder="500000"
                      className="input input-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Property Type</span>
                    </label>
                    <select
                      value={formData.property_type || 'house'}
                      onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value as any }))}
                      className="select select-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    >
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="apartment">Apartment</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Bedrooms</span>
                    </label>
                    <input
                      type="number"
                      value={formData.bedrooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || undefined }))}
                      placeholder="3"
                      className="input input-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Bathrooms</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.bathrooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) || undefined }))}
                      placeholder="2.5"
                      className="input input-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Square Feet</span>
                    </label>
                    <input
                      type="number"
                      value={formData.square_feet || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, square_feet: parseInt(e.target.value) || undefined }))}
                      placeholder="2000"
                      className="input input-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control sm:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Description</span>
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beautiful home with modern amenities..."
                      className="textarea textarea-bordered h-20 sm:h-24 text-sm sm:text-base"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control sm:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Property Images</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input file-input-bordered w-full text-sm sm:text-base"
                      disabled={loading}
                    />
                    <label className="label">
                      <span className="label-text-alt text-gray-500 text-xs sm:text-sm">
                        Upload up to 10 images. First image will be the primary photo.
                      </span>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 btn btn-circle btn-xs btn-error"
                            >
                              ×
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 badge badge-primary badge-xs text-xs">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !formData.address?.trim()}
                  className="btn btn-primary w-full text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden xs:inline">Creating Property...</span>
                      <span className="xs:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xs:inline">Create Property</span>
                      <span className="xs:hidden">Create</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}