'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { EnhancedImageUpload, type ImageFile } from '../property/enhanced-image-upload'
import { 
  Upload, 
  X, 
  MapPin, 
  DollarSign, 
  Home, 
  Bed, 
  Bath, 
  Square,
  Calendar,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Save,
  Plus,
  Building,
  Hash
} from 'lucide-react'
import { isValidUrl, formatFileSize } from '@/lib/utils'

export interface PerfectPropertyFormData {
  // Basic Information
  address: string
  price: number | null
  property_type: 'house' | 'condo' | 'townhouse' | 'apartment' | 'land' | 'commercial'
  listing_status: 'active' | 'pending' | 'sold' | 'off_market'
  
  // Property Details
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  description: string
  features: string[]
  
  // Optional fields
  source_url?: string
  input_method: 'manual' | 'url'
}

interface PerfectPropertyFormProps {
  onSubmit?: (data: PerfectPropertyFormData, images: ImageFile[]) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<PerfectPropertyFormData>
  isLoading?: boolean
  submitLabel?: string
  className?: string
}

const PROPERTY_TYPES = [
  { value: 'house', label: 'Single Family Home', icon: Home },
  { value: 'condo', label: 'Condominium', icon: Building },
  { value: 'townhouse', label: 'Townhouse', icon: Home },
  { value: 'apartment', label: 'Apartment', icon: Building },
  { value: 'land', label: 'Land/Lot', icon: Square },
  { value: 'commercial', label: 'Commercial', icon: Building }
] as const

const LISTING_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'sold', label: 'Sold', color: 'info' },
  { value: 'off_market', label: 'Off Market', color: 'neutral' }
] as const

export default function PerfectPropertyForm({ 
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitLabel = 'Create Property',
  className = ''
}: PerfectPropertyFormProps) {
  const router = useRouter()
  const { user } = useSupabase()
  
  // Form state
  const [formData, setFormData] = useState<PerfectPropertyFormData>({
    address: initialData?.address || '',
    price: initialData?.price || null,
    property_type: initialData?.property_type || 'house',
    listing_status: initialData?.listing_status || 'active',
    bedrooms: initialData?.bedrooms || null,
    bathrooms: initialData?.bathrooms || null,
    square_feet: initialData?.square_feet || null,
    description: initialData?.description || '',
    features: initialData?.features || [],
    source_url: initialData?.source_url || '',
    input_method: initialData?.input_method || 'manual'
  })
  
  const [images, setImages] = useState<ImageFile[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = 'perfect-property-draft'
    const timer = setTimeout(() => {
      if (formData.address || formData.description) {
        localStorage.setItem(draftKey, JSON.stringify({
          ...formData,
          timestamp: Date.now()
        }))
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  // Load draft on mount
  useEffect(() => {
    if (!initialData) {
      const draftKey = 'perfect-property-draft'
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          const age = Date.now() - (draft.timestamp || 0)
          // Only load drafts less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            setFormData(prev => ({ ...prev, ...draft }))
          }
        } catch {
          // Ignore invalid drafts
        }
      }
    }
  }, [initialData])

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required'
    }
    
    // Price validation
    if (formData.price !== null && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    // Bedrooms validation
    if (formData.bedrooms !== null && formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative'
    }
    
    // Bathrooms validation
    if (formData.bathrooms !== null && formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative'
    }
    
    // Square feet validation
    if (formData.square_feet !== null && formData.square_feet <= 0) {
      newErrors.square_feet = 'Square feet must be greater than 0'
    }
    
    // URL validation if provided
    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = 'Please enter a valid URL'
    }
    
    // Image validation - check if images have required metadata
    const invalidImages = images.filter(img => !img.roomType || !img.file)
    if (invalidImages.length > 0) {
      newErrors.images = 'Please select a room type for all uploaded images and ensure all files are valid'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, images])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof PerfectPropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Handle feature management
  const addFeature = useCallback(() => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }, [newFeature, formData.features])

  const removeFeature = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }, [])

  // Handle image changes
  const handleImagesChange = useCallback((newImages: ImageFile[]) => {
    setImages(newImages)
    // Clear image errors when images change
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }, [errors.images])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setSubmitError('You must be logged in to create a property')
      return
    }
    
    if (!validateForm()) {
      setSubmitError('Please fix the errors above before submitting')
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)
    
    try {
      if (onSubmit) {
        await onSubmit(formData, images)
      } else {
        // Default submission logic
        await handleDefaultSubmit()
      }
      
      setSubmitSuccess(true)
      // Clear draft after successful submission
      localStorage.removeItem('perfect-property-draft')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting property:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create property')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Default submission handler
  const handleDefaultSubmit = async () => {
    // Prepare property data for API
    const propertyData = {
      agent_id: user!.id,
      address: formData.address,
      price: formData.price,
      property_type: formData.property_type,
      listing_status: formData.listing_status,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      square_feet: formData.square_feet,
      description: formData.description,
      features: formData.features,
      source_url: formData.source_url,
      input_method: formData.input_method
    }

    // Create property using original endpoint
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
      const uploadPromises = images.map(async (imageFile, index) => {
        const formData = new FormData()
        formData.append('image', imageFile.file)
        formData.append('displayOrder', index.toString())
        formData.append('isPrimary', (index === 0).toString())
        formData.append('roomType', imageFile.roomType || '')
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
    try {
      await fetch('/api/property/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id
        })
      })
    } catch (error) {
      console.warn('Content generation failed:', error)
      // Don't fail the whole process if content generation fails
    }
  }

  const isFormValid = formData.address.trim() && Object.keys(errors).length === 0

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {submitSuccess && (
          <div className="alert alert-success">
            <CheckCircle className="h-5 w-5" />
            <span>Property created successfully! Redirecting to dashboard...</span>
          </div>
        )}
        
        {/* Error Message */}
        {submitError && (
          <div className="alert alert-error">
            <AlertTriangle className="h-5 w-5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Home className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Property Address *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    className={`input input-bordered w-full pl-10 ${
                      errors.address ? 'input-error' : ''
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.address}</span>
                  </label>
                )}
              </div>

              {/* Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Price</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="450000"
                    className={`input input-bordered w-full pl-10 ${
                      errors.price ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.price && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.price}</span>
                  </label>
                )}
              </div>

              {/* Property Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Property Type</span>
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="select select-bordered"
                  disabled={isSubmitting}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Listing Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Listing Status</span>
                </label>
                <select
                  value={formData.listing_status}
                  onChange={(e) => handleInputChange('listing_status', e.target.value)}
                  className="select select-bordered"
                  disabled={isSubmitting}
                >
                  {LISTING_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bedrooms</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="3"
                    className={`input input-bordered w-full pl-10 ${
                      errors.bedrooms ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.bedrooms && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.bedrooms}</span>
                  </label>
                )}
              </div>

              {/* Bathrooms */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bathrooms</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="2.5"
                    className={`input input-bordered w-full pl-10 ${
                      errors.bathrooms ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.bathrooms && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.bathrooms}</span>
                  </label>
                )}
              </div>

              {/* Square Feet */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Square Feet</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.square_feet || ''}
                    onChange={(e) => handleInputChange('square_feet', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="2000"
                    className={`input input-bordered w-full pl-10 ${
                      errors.square_feet ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.square_feet && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.square_feet}</span>
                  </label>
                )}
              </div>

              {/* Source URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Source URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.source_url || ''}
                  onChange={(e) => handleInputChange('source_url', e.target.value)}
                  placeholder="https://www.zillow.com/..."
                  className={`input input-bordered ${
                    errors.source_url ? 'input-error' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {errors.source_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.source_url}</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <FileText className="h-5 w-5" />
              Description
            </h3>
            <div className="form-control">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the property, its unique features, neighborhood highlights, and what makes it special..."
                className="textarea textarea-bordered h-32"
                rows={6}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Hash className="h-5 w-5" />
              Features & Amenities
            </h3>
            
            <div className="form-control mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Hardwood Floors, Swimming Pool)"
                  className="input input-bordered flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-outline"
                  disabled={isSubmitting || !newFeature.trim()}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="badge badge-lg badge-outline gap-2">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-error hover:text-error/80"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <ImageIcon className="h-5 w-5" />
              Property Images
            </h3>
            <EnhancedImageUpload
              images={images}
              onImagesChange={handleImagesChange}
              maxFiles={20}
              className="w-full"
            />
            {errors.images && (
              <div className="text-error text-sm mt-2">{errors.images}</div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || isLoading}
            className="btn btn-primary"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Property...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export { PerfectPropertyForm }