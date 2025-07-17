"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { 
  Search, 
  Filter, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  X,
  SlidersHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFilters {
  query: string
  location: string
  propertyType: string
  priceRange: [number, number]
  bedrooms: string
  bathrooms: string
  areaRange: [number, number]
  features: string[]
  sortBy: string
  listingType: string // 'sale' | 'rent' | 'all'
}

interface PropertySearchProps {
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
  isLoading?: boolean
  resultCount?: number
  className?: string
}

const PROPERTY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' }
]

const BEDROOM_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' }
]

const BATHROOM_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'area-large', label: 'Largest Area' },
  { value: 'area-small', label: 'Smallest Area' },
  { value: 'most-viewed', label: 'Most Viewed' }
]

const COMMON_FEATURES = [
  'Parking', 'Garden', 'Balcony', 'Swimming Pool', 'Gym', 'Security',
  'Elevator', 'Air Conditioning', 'Furnished', 'Pet Friendly',
  'Fireplace', 'Walk-in Closet', 'Laundry Room', 'Storage'
]

export function PropertySearch({ onSearch, onReset, isLoading, resultCount, className }: PropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    propertyType: 'all',
    priceRange: [0, 2000000],
    bedrooms: 'any',
    bathrooms: 'any',
    areaRange: [0, 5000],
    features: [],
    sortBy: 'newest',
    listingType: 'all'
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleSearch = () => {
    setIsSearching(true)
    onSearch(filters)
    setTimeout(() => setIsSearching(false), 1000) // Reset loading state
  }

  const handleReset = () => {
    setFilters({
      query: '',
      location: '',
      propertyType: 'all',
      priceRange: [0, 2000000],
      bedrooms: 'any',
      bathrooms: 'any',
      areaRange: [0, 5000],
      features: [],
      sortBy: 'newest',
      listingType: 'all'
    })
    onReset()
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
    return `$${price}`
  }

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq ft`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties, neighborhoods, or keywords..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Location */}
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Listing Type */}
            <Select value={filters.listingType} onValueChange={(value) => updateFilter('listingType', value)}>
              <SelectTrigger className="min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button onClick={handleSearch} disabled={isSearching || isLoading} className="min-w-[100px]">
              {isSearching || isLoading ? 'Searching...' : 'Search'}
            </Button>

            {/* Advanced Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="min-w-[120px]"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide Filters' : 'More Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </span>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Type & Bedrooms/Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Property Type</Label>
                <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Bedrooms</Label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BEDROOM_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Bathrooms</Label>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BATHROOM_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4" />
                Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={2000000}
                min={0}
                step={50000}
                className="w-full"
              />
            </div>

            {/* Area Range */}
            <div>
              <Label className="flex items-center gap-2 mb-4">
                <Square className="h-4 w-4" />
                Area: {formatArea(filters.areaRange[0])} - {formatArea(filters.areaRange[1])}
              </Label>
              <Slider
                value={filters.areaRange}
                onValueChange={(value) => updateFilter('areaRange', value as [number, number])}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Features */}
            <div>
              <Label className="mb-4 block">Features & Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FEATURES.map(feature => (
                  <Badge
                    key={feature}
                    variant={filters.features.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                    {filters.features.includes(feature) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <Label>Sort Results By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters & Results Count */}
      {(filters.features.length > 0 || resultCount !== undefined) && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.features.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.features.map(feature => (
                  <Badge key={feature} variant="secondary" className="cursor-pointer" onClick={() => toggleFeature(feature)}>
                    {feature} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </>
            )}
          </div>
          
          {resultCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {resultCount} {resultCount === 1 ? 'property' : 'properties'} found
            </div>
          )}
        </div>
      )}
    </div>
  )
}