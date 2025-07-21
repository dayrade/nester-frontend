'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Property, PropertyImage } from '@/types/supabase'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Calendar,
  Eye,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PropertyCardProps {
  property: Property & {
    property_images?: PropertyImage[]
  }
  onEdit?: (property: Property) => void
  onDelete?: (property: Property) => void
  onShare?: (property: Property) => void
  showActions?: boolean
  className?: string
}

export default function PropertyCard({ 
  property, 
  onEdit, 
  onDelete, 
  onShare,
  showActions = true,
  className = '' 
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const primaryImage = property.property_images?.find(img => img.is_hero) || property.property_images?.[0]
  const imageUrl = primaryImage?.storage_path || '/placeholder-property.jpg'

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/property/${property.id}`
    await navigator.clipboard.writeText(url)
    // You could add a toast notification here
    setDropdownOpen(false)
  }

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      'for_sale': 'badge-success',
      'for_rent': 'badge-info',
      'sold': 'badge-neutral',
      'rented': 'badge-neutral',
      'off_market': 'badge-warning'
    }

    const statusLabels: Record<string, string> = {
      'for_sale': 'For Sale',
      'for_rent': 'For Rent',
      'sold': 'Sold',
      'rented': 'Rented',
      'off_market': 'Off Market'
    }

    return (
      <span className={`badge badge-sm ${statusColors[property.listing_status] || 'badge-neutral'}`}>
        {statusLabels[property.listing_status] || property.listing_status}
      </span>
    )
  }

  const getContentGenerationStatus = () => {
    if (!property.content_generation_status) return null

    const statusColors: Record<string, string> = {
      'pending': 'badge-warning',
      'processing': 'badge-info',
      'completed': 'badge-success',
      'failed': 'badge-error'
    }

    const statusLabels: Record<string, string> = {
      'pending': 'Content Pending',
      'processing': 'Generating Content',
      'completed': 'Content Ready',
      'failed': 'Generation Failed'
    }

    return (
      <span className={`badge badge-xs ${statusColors[property.content_generation_status] || 'badge-neutral'}`}>
        {statusLabels[property.content_generation_status] || property.content_generation_status}
      </span>
    )
  }

  return (
    <div className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {/* Property Image */}
      <figure className="relative aspect-video">
        <Image
          src={imageError ? '/placeholder-property.jpg' : imageUrl}
          alt={property.address || 'Property'}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        
        {/* Actions Dropdown */}
        {showActions && (
          <div className="absolute top-3 right-3">
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-sm btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <MoreVertical className="h-4 w-4" />
              </div>
              {dropdownOpen && (
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link href={`/property/${property.id}`} className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                  </li>
                  {onEdit && (
                    <li>
                      <button 
                        onClick={() => {
                          onEdit(property)
                          setDropdownOpen(false)
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </li>
                  )}
                  {onShare && (
                    <li>
                      <button 
                        onClick={() => {
                          onShare(property)
                          setDropdownOpen(false)
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </button>
                  </li>
                  {property.listing_url && (
                    <li>
                      <a 
                        href={property.listing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Original</span>
                      </a>
                    </li>
                  )}
                  {onDelete && (
                    <>
                      <li><hr className="my-1" /></li>
                      <li>
                        <button 
                          onClick={() => {
                            onDelete(property)
                            setDropdownOpen(false)
                          }}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {/* Content Generation Status */}
        {getContentGenerationStatus() && (
          <div className="absolute bottom-3 right-3">
            {getContentGenerationStatus()}
          </div>
        )}
      </figure>

      {/* Property Details */}
      <div className="card-body p-4">
        {/* Price and Title */}
        <div className="flex items-start justify-between mb-2">
          <div>
            {property.price && (
              <div className="flex items-center text-2xl font-bold text-primary mb-1">
                <DollarSign className="h-5 w-5" />
                <span>{formatCurrency(property.price)}</span>
              </div>
            )}
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {property.address || 'Untitled Property'}
            </h3>
          </div>
        </div>

        {/* Address */}
        {property.address && (
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{property.address}</span>
          </div>
        )}

        {/* Property Features */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          {property.bedrooms && (
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.square_feet && (
            <div className="flex items-center space-x-1">
              <Square className="h-4 w-4" />
              <span>{property.square_feet.toLocaleString()} sq ft</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {property.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {property.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Added {formatDate(property.created_at)}</span>
          </div>
          

        </div>
      </div>
    </div>
  )
}