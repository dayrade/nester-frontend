'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { Property, PropertyImage } from '@/types/supabase'
import PropertyCard from '@/components/property/property-card'
import Navbar from '@/components/navigation/navbar'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Building,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type SortOption = 'created_at' | 'price' | 'address' | 'updated_at'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

interface PropertiesWithImages extends Property {
  property_images: PropertyImage[]
}

export default function PropertiesPage() {
  const { user } = useSupabase()
  const [properties, setProperties] = useState<PropertiesWithImages[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertiesWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  useEffect(() => {
    filterAndSortProperties()
  }, [properties, searchQuery, statusFilter, typeFilter, sortBy, sortDirection])

  const fetchProperties = async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProperties = () => {
    let filtered = [...properties]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(property => 
        property.address?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.listing_status === statusFilter)
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => property.property_type === typeFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortBy === 'price') {
        aValue = aValue || 0
        bValue = bValue || 0
      } else {
        aValue = (aValue || '').toString().toLowerCase()
        bValue = (bValue || '').toString().toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredProperties(filtered)
  }

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortDirection('desc')
    }
  }

  const handleDeleteProperty = async (property: Property) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    
    if (!user?.id) {
      throw new Error('User ID is required')
    }
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)
        .eq('agent_id', user.id)
      
      if (error) throw error
      
      // Remove from local state
      setProperties(prev => prev.filter(p => p.id !== property.id))
    } catch (err) {
      console.error('Error deleting property:', err)
      alert('Failed to delete property. Please try again.')
    }
  }

  const handleShareProperty = async (property: Property) => {
    const url = `${window.location.origin}/property/${property.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Property Listing',
          text: property.description || 'Check out this property listing',
          url: url
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url)
      alert('Property link copied to clipboard!')
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
              <Building className="h-8 w-8 mr-3 text-primary" />
              Properties
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your property listings and generate marketing content
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link href="/property/add" className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                className="select select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="for_sale">For Sale</option>
                <option value="for_rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="off_market">Off Market</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <select
                className="select select-bordered w-full"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            {/* Sort */}
            <div>
              <div className="dropdown dropdown-end w-full">
                <div tabIndex={0} role="button" className="btn btn-outline w-full justify-between">
                  <span className="flex items-center">
                    {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                    Sort
                  </span>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={() => handleSort('created_at')} className={sortBy === 'created_at' ? 'active' : ''}>
                      Date Added
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleSort('updated_at')} className={sortBy === 'updated_at' ? 'active' : ''}>
                      Last Updated
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleSort('price')} className={sortBy === 'price' ? 'active' : ''}>
                      Price
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleSort('address')} className={sortBy === 'address' ? 'active' : ''}>
                      Address
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {filteredProperties.length} of {properties.length} properties
            </div>
            
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Properties</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={fetchProperties} className="btn btn-outline btn-error">
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            {properties.length === 0 ? (
              <div>
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">
                  Get started by adding your first property listing
                </p>
                <Link href="/property/add" className="btn btn-primary">
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </Link>
              </div>
            ) : (
              <div>
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDeleteProperty}
                onShare={handleShareProperty}
                className={viewMode === 'list' ? 'md:flex md:items-center' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}