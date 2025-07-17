'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { PropertyData } from '@/types/supabase'
import { ArrowLeft, Link as LinkIcon, FileText, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type InputMethod = 'url' | 'manual'

export default function AddPropertyPage() {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const { brandAssets } = useBrand()
  const [inputMethod, setInputMethod] = useState<InputMethod>('url')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // URL input state
  const [propertyUrl, setPropertyUrl] = useState('')
  
  // Manual input state
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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !propertyUrl.trim()) return

    setLoading(true)
    setError('')

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.address?.trim()) return

    setLoading(true)
    setError('')

    try {
      // Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
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
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      // Upload images if any
      if (images.length > 0) {
        const uploadPromises = images.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${property.id}/${Date.now()}-${index}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          // Create image record
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              storage_path: fileName,
              display_order: index,
              is_primary: index === 0
            })

          if (imageError) throw imageError
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              {brandAssets?.logo && (
                <Image
                  src={brandAssets.logo}
                  alt={brandAssets.companyName || 'Logo'}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Method Selection */}
        <div className="card bg-white shadow-sm mb-8">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">How would you like to add your property?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setInputMethod('url')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'url'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Import from URL</h3>
                <p className="text-sm text-gray-600">
                  Paste a listing URL from Zillow, Realtor.com, or other platforms
                </p>
              </button>
              
              <button
                onClick={() => setInputMethod('manual')}
                className={`p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Manual Entry</h3>
                <p className="text-sm text-gray-600">
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
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Import Property from URL</h2>
              <form onSubmit={handleUrlSubmit}>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-medium">Property Listing URL</span>
                  </label>
                  <input
                    type="url"
                    value={propertyUrl}
                    onChange={(e) => setPropertyUrl(e.target.value)}
                    placeholder="https://www.zillow.com/homedetails/..."
                    className="input input-bordered w-full"
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Supported: Zillow, Realtor.com, Redfin, and more
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !propertyUrl.trim()}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing Property...
                    </>
                  ) : (
                    'Import Property'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        {inputMethod === 'manual' && (
          <div className="card bg-white shadow-sm">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">Enter Property Details</h2>
              <form onSubmit={handleManualSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium">Property Address *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State 12345"
                      className="input input-bordered w-full"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Price</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || undefined }))}
                      placeholder="500000"
                      className="input input-bordered w-full"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Property Type</span>
                    </label>
                    <select
                      value={formData.property_type || 'house'}
                      onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value as any }))}
                      className="select select-bordered w-full"
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
                      <span className="label-text font-medium">Bedrooms</span>
                    </label>
                    <input
                      type="number"
                      value={formData.bedrooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || undefined }))}
                      placeholder="3"
                      className="input input-bordered w-full"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Bathrooms</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.bathrooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) || undefined }))}
                      placeholder="2.5"
                      className="input input-bordered w-full"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Square Feet</span>
                    </label>
                    <input
                      type="number"
                      value={formData.square_feet || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, square_feet: parseInt(e.target.value) || undefined }))}
                      placeholder="2000"
                      className="input input-bordered w-full"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beautiful home with modern amenities..."
                      className="textarea textarea-bordered h-24"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium">Property Images</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input file-input-bordered w-full"
                      disabled={loading}
                    />
                    <label className="label">
                      <span className="label-text-alt text-gray-500">
                        Upload up to 10 images. First image will be the primary photo.
                      </span>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                            >
                              ×
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 badge badge-primary badge-xs">
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
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Property...
                    </>
                  ) : (
                    'Create Property'
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