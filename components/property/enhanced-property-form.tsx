'use client'

import { useState } from 'react'
import { Plus, MapPin, DollarSign, Home, Calendar, ImageIcon, X } from 'lucide-react'

interface PropertyData {
  title: string
  address: string
  price: string
  bedrooms: string
  bathrooms: string
  squareFootage: string
  propertyType: string
  listingDate: string
  description: string
  features: string[]
  images: string[]
}

interface PropertyManualFormProps {
  onSubmit?: (data: PropertyData) => void
  onCancel?: () => void
  className?: string
}

const PROPERTY_TYPES = [
  'Single Family Home',
  'Townhouse',
  'Condo',
  'Apartment',
  'Multi-Family',
  'Commercial',
  'Land',
  'Other'
]

function PropertyManualForm({ 
  onSubmit, 
  onCancel,
  className = ""
}: PropertyManualFormProps) {
  const [formData, setFormData] = useState<PropertyData>({
    title: '',
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    propertyType: '',
    listingDate: '',
    description: '',
    features: [],
    images: []
  })

  const [newFeature, setNewFeature] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof PropertyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title && formData.address && formData.price

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Home className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Property Title *</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Beautiful 3BR Home in Downtown"
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Address *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    className="input input-bordered w-full pl-10"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Price *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="$450,000"
                    className="input input-bordered w-full pl-10"
                    required
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Property Type</span>
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="select select-bordered"
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bedrooms</span>
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  placeholder="3"
                  className="input input-bordered"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bathrooms</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  placeholder="2.5"
                  className="input input-bordered"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Square Footage</span>
                </label>
                <input
                  type="number"
                  value={formData.squareFootage}
                  onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                  placeholder="2,500"
                  className="input input-bordered"
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Listing Date</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.listingDate}
                    onChange={(e) => handleInputChange('listingDate', e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Description</h3>
            <div className="form-control">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the property, its unique features, neighborhood highlights, and what makes it special..."
                className="textarea textarea-bordered h-32"
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Features & Amenities</h3>
            
            <div className="form-control mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Hardwood Floors, Swimming Pool)"
                  className="input input-bordered flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-outline"
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
              Images
            </h3>
            
            <div className="form-control mb-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Add image URL"
                  className="input input-bordered flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="btn btn-outline"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/150/100'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
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
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Save Property'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PropertyManualForm
export { PropertyManualForm, type PropertyData }