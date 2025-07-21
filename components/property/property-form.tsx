'use client'

import { useState, useRef } from 'react'
import { Property, PropertyImage } from '@/types/supabase'
import { useSupabase } from '@/lib/providers/supabase-provider'
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
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { isValidUrl, formatFileSize } from '@/lib/utils'
import { EnhancedImageUpload, ImageFile } from './enhanced-image-upload'

interface PropertyFormProps {
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
  images: ImageFile[]
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

export default function PropertyForm({ 
  property, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitLabel = 'Save Property'
}: PropertyFormProps) {
  const { user } = useSupabase()
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: property?.address || '',
    description: property?.description || '',
    address: property?.address || '',
    city: '',
    state: '',
    zip_code: '',
    price: property?.price || null,
    property_type: (property?.property_type as 'house' | 'condo' | 'townhouse' | 'apartment' | 'land' | 'commercial') || 'house',
    listing_status: (property?.listing_status as 'for_sale' | 'for_rent' | 'sold' | 'rented' | 'off_market') || 'for_sale',
    bedrooms: property?.bedrooms || null,
    bathrooms: property?.bathrooms || null,
    square_feet: property?.square_feet || null,
    lot_size: property?.lot_size || null,
    year_built: property?.year_built || null,
    listing_url: property?.listing_url || '',
    images: [],
    existingImages: property?.property_images || []
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
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
    
    // Validate that all images have room types selected
    const imagesWithoutRoomType = formData.images.filter(img => !img.roomType)
    if (imagesWithoutRoomType.length > 0) {
      newErrors.images = 'Please select a room type for all uploaded images'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImagesChange = (newImages: ImageFile[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
    
    // Clear images error when user updates images
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }



  const removeExistingImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages?.filter(img => img.id !== imageId)
    }))
  }

  return (
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

      {/* Images */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            <ImageIcon className="h-5 w-5" />
            Property Images
          </h3>
          
          {/* Existing Images */}
          {formData.existingImages && formData.existingImages.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <Image
                      src={image.storage_path}
                      alt="Property"
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="absolute top-2 right-2 btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {image.is_hero && (
                      <div className="absolute bottom-2 left-2 badge badge-primary badge-sm">
                        Hero
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <EnhancedImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
          />
          
          {errors.images && (
            <div className="text-error text-sm mt-2">{errors.images}</div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}