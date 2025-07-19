'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import PropertyDashboard from '@/components/property/property-dashboard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Home, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  property_type: string
  listing_status: string
  agent_id: string
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const propertyId = params.id as string

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Authentication required')
        return
      }

      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (propertyError) {
        if (propertyError.code === 'PGRST116') {
          setError('Property not found')
        } else {
          setError('Failed to load property details')
        }
        return
      }

      // Check if user has access to this property
      if (propertyData.agent_id !== user.id) {
        setError('You do not have access to this property')
        return
      }

      setProperty(propertyData)
      setHasAccess(true)
    } catch (err) {
      console.error('Error fetching property:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/dashboard/properties">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </Link>
          </div>

          {/* Error State */}
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Property</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={fetchProperty} variant="outline">
                Try Again
              </Button>
              <Link href="/dashboard/properties">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/properties">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>

        {/* Property Dashboard */}
        <PropertyDashboard propertyId={propertyId} />
      </div>
    </div>
  )
}