'use client'

import { useState, useCallback, useEffect } from 'react'
import { Property, PropertyImage } from '@/types/supabase'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { AdvancedImageUpload } from './advanced-image-upload'
import { ProcessingResult, BatchProcessingProgress } from '@/lib/image-processing-pipeline'
import { ImageFile } from './enhanced-image-upload'

// Extended interface for processed images with additional metadata
interface ProcessedImageFile extends ImageFile {
  url?: string
  thumbnailUrl?: string
  metadata?: {
    size: number
    type: string
    compressionRatio?: number
    optimizedSize?: number
  }
}
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
  Save
} from 'lucide-react'
import { isValidUrl, formatFileSize } from '@/lib/utils'

interface EnhancedPropertyFormProps {
  property?: Property & { property_images?: PropertyImage[] }
  onSubmit: (data: PropertyFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
}

export interface PropertyFormData {
  title: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number | null
  property_type: 'house' | 'condo' | 'townhouse' | 'apartment' | 'land' | 'commercial'
  listing_status: 'for_sale' | 'for_rent' | 'sold' | 'rented' | 'off_market'
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  lot_size: number | null
  year_built: number | null
  listing_url?: string
  images: ProcessedImageFile[]
  existingImages?: PropertyImage[]
}

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' }
] as const

const LISTING_STATUSES = [
  { value: 'for_sale', label: 'For Sale' },
  { value: 'for_rent', label: 'For Rent' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
  { value: 'off_market', label: 'Off Market' }
] as const

export default function EnhancedPropertyForm({ 
  property, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitLabel = 'Save Property'
}: EnhancedPropertyFormProps) {
  const { user, supabase } = useSupabase()
  
  // Function to upload images to a property after it's created
  const uploadImagesToProperty = async (propertyId: string, images: ProcessedImageFile[]) => {
    if (!user || !images.length) return
    
    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileExt = image.file.name.split('.').pop()
        const fileName = `${propertyId}/${Date.now()}-${i}.${fileExt}`
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, image.file)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue
        }

        // Create image record in database
        const { error: imageError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            storage_path: fileName,
            display_order: i,
            is_primary: i === 0
          })

        if (imageError) {
          console.error('Error creating image record:', imageError)
        }
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      throw new Error('Failed to upload images')
    }
  }
  
  const [formData, setFormData] = useState<PropertyFormData>(() => ({
    title: property?.title || '',
    description: property?.description || '',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zip_code: property?.zip_code || '',
    price: property?.price || null,
    property_type: property?.property_type || 'house',
    listing_status: property?.listing_status || 'for_sale',
    bedrooms: property?.bedrooms || null,
    bathrooms: property?.bathrooms || null,
    square_feet: property?.square_feet || null,
    lot_size: property?.lot_size || null,
    year_built: property?.year_built || null,
    listing_url: property?.listing_url || '',
    images: [],
    existingImages: property?.property_images || []
  }))
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<BatchProcessingProgress | null>(null)
  const [uploadedImages, setUploadedImages] = useState<ProcessingResult[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'uploading' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string>('')

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = `property-draft-${property?.id || 'new'}`
    const timer = setTimeout(() => {
      if (formData.title || formData.address) {
        localStorage.setItem(draftKey, JSON.stringify({
          ...formData,
          images: [], // Don't save images in draft
          timestamp: Date.now()
        }))
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData, property?.id])

  // Load draft on mount
  useEffect(() => {
    if (!property) {
      const draftKey = 'property-draft-new'
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          const age = Date.now() - (draft.timestamp || 0)
          // Only load drafts less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            setFormData(prev => ({ ...prev, ...draft, images: prev.images }))
          }
        } catch {
          // Ignore invalid drafts
        }
      }
    }
  }, [property])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }
    
    if (formData.listing_url && !isValidUrl(formData.listing_url)) {
      newErrors.listing_url = 'Please enter a valid URL'
    }
    
    if (formData.price && formData.price < 0) {
      newErrors.price = 'Price must be positive'
    }
    
    if (formData.bedrooms && formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms must be positive'
    }
    
    if (formData.bathrooms && formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms must be positive'
    }
    
    if (formData.square_feet && formData.square_feet < 0) {
      newErrors.square_feet = 'Square feet must be positive'
    }
    
    if (formData.year_built && (formData.year_built < 1800 || formData.year_built > new Date().getFullYear())) {
      newErrors.year_built = 'Please enter a valid year'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback((field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handleImagesChange = useCallback((images: ImageFile[]) => {
    // Convert ImageFile[] to ProcessedImageFile[] for compatibility
    const processedImages: ProcessedImageFile[] = images.map(img => ({
      ...img,
      url: img.preview, // Use preview as fallback URL
      metadata: {
        size: img.file.size,
        type: img.file.type
      }
    }))
    setFormData(prev => ({ ...prev, images: processedImages }))
  }, [])

  const handleImageUploadComplete = useCallback((results: ProcessingResult[]) => {
    setUploadedImages(prev => [...prev, ...results])
    setSaveStatus('idle')
    
    // Update formData with processed images
    const processedImages: ProcessedImageFile[] = results
      .filter(result => result.status === 'success')
      .map(result => ({
        file: result.originalFile,
        preview: result.optimizedUrl || result.originalUrl,
        id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'success' as const,
        progress: 100,
        url: result.optimizedUrl || result.originalUrl,
        thumbnailUrl: result.thumbnailUrl,
        metadata: {
          size: result.originalFile.size,
          type: result.originalFile.type,
          compressionRatio: result.compressionRatio,
          optimizedSize: result.optimizedSize
        }
      }))
    
    // Add processed images to formData
    setFormData(prev => ({
      ...prev,
      images: [...prev.images.filter(img => img.status === 'pending'), ...processedImages]
    }))
    
    // Check for any errors
    const errors = results
      .filter(result => result.status === 'error')
      .flatMap(result => result.errors)
    
    if (errors.length > 0) {
      setUploadErrors(errors)
    }
  }, [])
  
  const handleImageUploadProgress = useCallback((progress: BatchProcessingProgress) => {
    setUploadProgress(progress)
    setSaveStatus(progress.progress < 1 ? 'uploading' : 'idle')
  }, [])
  
  const handleImageUploadError = useCallback((error: string) => {
    setUploadErrors(prev => [...prev, error])
    setSaveStatus('error')
  }, [])

  const [uploadStatus, setUploadStatus] = useState<{
    uploading: boolean
    completed: number
    total: number
    errors: string[]
  }>({ uploading: false, completed: 0, total: 0, errors: [] })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaveStatus('saving')
    setSaveError('')
    
    try {
      // First, submit the property data without images
       const propertyData = {
         title: formData.title,
         description: formData.description,
         address: formData.address,
         city: formData.city,
         state: formData.state,
         zip_code: formData.zip_code,
         price: formData.price,
         property_type: formData.property_type,
         listing_status: formData.listing_status,
         bedrooms: formData.bedrooms,
         bathrooms: formData.bathrooms,
         square_feet: formData.square_feet,
         lot_size: formData.lot_size,
         year_built: formData.year_built,
         features: formData.features
       }
      
      // Submit the property data (this should return the created property with ID)
      const result = await onSubmit(propertyData)
      
      // Extract property ID from result
      let propertyId = null
      if (result && typeof result === 'object') {
        propertyId = result.data?.id || result.property?.id || result.id
      }
      
      // If we have images and a property ID, upload them separately
      if (propertyId && (uploadedImages.length > 0 || formData.images.length > 0)) {
        setSaveStatus('uploading')
        
        // Combine processed images and pending images
        const allImages = [
          ...uploadedImages.map(result => ({
            file: result.originalFile,
            preview: result.optimizedUrl || result.originalUrl,
            id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'success' as const,
            progress: 100
          })),
          ...formData.images.filter(img => img.status === 'pending')
        ]
        
        // Upload images to Supabase storage and create database records
        await uploadImagesToProperty(propertyId, allImages)
      }
      
      setSaveStatus('success')
      
      // Clear draft
      const draftKey = `property-draft-${property?.id || 'new'}`
      localStorage.removeItem(draftKey)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        if (saveStatus === 'success') {
          setSaveStatus('idle')
        }
      }, 3000)
      
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : 'An error occurred while saving')
    }
  }, [formData, onSubmit, property?.id, saveStatus, validateForm, uploadedImages])

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return { type: 'info', message: 'Saving property...' }
      case 'uploading':
        return { 
          type: 'info', 
          message: `Uploading images... ${uploadStatus.completed}/${uploadStatus.total} completed` 
        }
      case 'success':
        return { type: 'success', message: 'Property saved successfully!' }
      case 'error':
        return { type: 'error', message: saveError }
      default:
        return null
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {statusMessage && (
        <div className={`alert ${
          statusMessage.type === 'success' ? 'alert-success' :
          statusMessage.type === 'error' ? 'alert-error' : 'alert-info'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {statusMessage.type === 'error' && <AlertTriangle className="h-4 w-4" />}
          {statusMessage.type === 'info' && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* Upload Errors */}
      {uploadStatus.errors.length > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Upload Issues:</h4>
            <ul className="text-sm mt-1 space-y-1">
              {uploadStatus.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Home className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Property Title *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Beautiful 3BR Home in Downtown"
                />
                {errors.title && <span className="text-error text-sm">{errors.title}</span>}
              </div>
              
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the property features, amenities, and highlights..."
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Property Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Listing Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.listing_status}
                  onChange={(e) => handleInputChange('listing_status', e.target.value)}
                >
                  {LISTING_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <MapPin className="h-5 w-5" />
              Location
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 lg:col-span-4">
                <label className="label">
                  <span className="label-text font-medium">Street Address *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
                {errors.address && <span className="text-error text-sm">{errors.address}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">City *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.city ? 'input-error' : ''}`}
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="San Francisco"
                />
                {errors.city && <span className="text-error text-sm">{errors.city}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">State *</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.state ? 'input-error' : ''}`}
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="CA"
                />
                {errors.state && <span className="text-error text-sm">{errors.state}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">ZIP Code</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="94102"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <FileText className="h-5 w-5" />
              Property Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Price</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className={`input input-bordered w-full pl-10 ${errors.price ? 'input-error' : ''}`}
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : null)}
                    placeholder="750000"
                    min="0"
                  />
                </div>
                {errors.price && <span className="text-error text-sm">{errors.price}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Bedrooms</span>
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className={`input input-bordered w-full pl-10 ${errors.bedrooms ? 'input-error' : ''}`}
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : null)}
                    placeholder="3"
                    min="0"
                  />
                </div>
                {errors.bedrooms && <span className="text-error text-sm">{errors.bedrooms}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Bathrooms</span>
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.5"
                    className={`input input-bordered w-full pl-10 ${errors.bathrooms ? 'input-error' : ''}`}
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : null)}
                    placeholder="2.5"
                    min="0"
                  />
                </div>
                {errors.bathrooms && <span className="text-error text-sm">{errors.bathrooms}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Square Feet</span>
                </label>
                <div className="relative">
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className={`input input-bordered w-full pl-10 ${errors.square_feet ? 'input-error' : ''}`}
                    value={formData.square_feet || ''}
                    onChange={(e) => handleInputChange('square_feet', e.target.value ? Number(e.target.value) : null)}
                    placeholder="2500"
                    min="0"
                  />
                </div>
                {errors.square_feet && <span className="text-error text-sm">{errors.square_feet}</span>}
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Lot Size (sq ft)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.lot_size || ''}
                  onChange={(e) => handleInputChange('lot_size', e.target.value ? Number(e.target.value) : null)}
                  placeholder="5000"
                  min="0"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text font-medium">Year Built</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className={`input input-bordered w-full pl-10 ${errors.year_built ? 'input-error' : ''}`}
                    value={formData.year_built || ''}
                    onChange={(e) => handleInputChange('year_built', e.target.value ? Number(e.target.value) : null)}
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                {errors.year_built && <span className="text-error text-sm">{errors.year_built}</span>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="label">
                <span className="label-text font-medium">Original Listing URL</span>
              </label>
              <input
                type="url"
                className={`input input-bordered w-full ${errors.listing_url ? 'input-error' : ''}`}
                value={formData.listing_url}
                onChange={(e) => handleInputChange('listing_url', e.target.value)}
                placeholder="https://www.zillow.com/homedetails/..."
              />
              {errors.listing_url && <span className="text-error text-sm">{errors.listing_url}</span>}
            </div>
          </div>
        </div>

        {/* Enhanced Images Section */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <ImageIcon className="h-5 w-5" />
              Property Images
            </h3>
            
            <AdvancedImageUpload
              propertyId={property?.id}
              onUploadComplete={handleImageUploadComplete}
              onUploadProgress={handleImageUploadProgress}
              onError={handleImageUploadError}
              maxFiles={20}
              disabled={isLoading || saveStatus === 'saving' || saveStatus === 'uploading'}
              processingOptions={{
                optimization: {
                  maxWidth: 1920,
                  maxHeight: 1080,
                  quality: 0.85,
                  format: 'auto',
                  stripExif: true
                },
                upload: {
                  bucket: 'property-images',
                  generateThumbnails: true,
                  makePublic: true
                },
                processing: {
                  enableParallelProcessing: true,
                  maxConcurrentUploads: 3,
                  enableProgressTracking: true,
                  enableErrorRecovery: true
                }
              }}
            />
            
            {/* Upload Progress */}
            {saveStatus === 'uploading' && uploadProgress && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h4 className="font-medium mb-2">Processing Images</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {uploadProgress.completed} / {uploadProgress.total}</span>
                    <span>{Math.round(uploadProgress.progress * 100)}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={uploadProgress.progress * 100} 
                    max="100"
                  ></progress>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Current File:</span>
                      <p className="font-medium truncate">{uploadProgress.currentFile}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stage:</span>
                      <p className="font-medium capitalize">{uploadProgress.currentStage}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Throughput:</span>
                      <p className="font-medium">{uploadProgress.throughput.toFixed(1)} files/s</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ETA:</span>
                      <p className="font-medium">
                        {uploadProgress.estimatedTimeRemaining > 0 
                          ? `${Math.ceil(uploadProgress.estimatedTimeRemaining / 1000)}s`
                          : 'Complete'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing Results Summary */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Processed Images ({uploadedImages.length})
                  <div className="flex gap-1">
                    {uploadedImages.filter(img => img.status === 'success').length > 0 && (
                      <span className="badge badge-success badge-sm">
                        {uploadedImages.filter(img => img.status === 'success').length} success
                      </span>
                    )}
                    {uploadedImages.filter(img => img.status === 'warning').length > 0 && (
                      <span className="badge badge-warning badge-sm">
                        {uploadedImages.filter(img => img.status === 'warning').length} warnings
                      </span>
                    )}
                    {uploadedImages.filter(img => img.status === 'error').length > 0 && (
                      <span className="badge badge-error badge-sm">
                        {uploadedImages.filter(img => img.status === 'error').length} errors
                      </span>
                    )}
                  </div>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((result, index) => (
                    <div key={`${result.originalFile.name}-${index}`} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
                        {result.upload?.url ? (
                          <img
                            src={result.upload.url}
                            alt={result.originalFile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Status indicator */}
                      <div className="absolute top-2 left-2">
                        {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {result.status === 'error' && <X className="h-4 w-4 text-red-500" />}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => {
                          setUploadedImages(prev => prev.filter((_, i) => i !== index))
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      <div className="mt-1 space-y-1">
                        <p className="text-xs truncate" title={result.originalFile.name}>
                          {result.originalFile.name}
                        </p>
                        
                        {/* Compression info */}
                        {result.optimization && (
                          <div className="flex items-center gap-1">
                            <span className="badge badge-outline badge-xs">
                              {(result.compressionRatio * 100).toFixed(0)}% saved
                            </span>
                          </div>
                        )}
                        
                        {/* File size info */}
                        <p className="text-xs text-gray-500">
                          {(result.metadata.fileSize.original / 1024 / 1024).toFixed(1)}MB → {(result.metadata.fileSize.optimized / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={isLoading || saveStatus === 'saving' || saveStatus === 'uploading'}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || saveStatus === 'saving' || saveStatus === 'uploading'}
          >
            {(isLoading || saveStatus === 'saving' || saveStatus === 'uploading') && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <Save className="h-4 w-4" />
            {saveStatus === 'uploading' ? 'Uploading...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export type { PropertyFormData }