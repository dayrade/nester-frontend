'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { Property, PropertyImage } from '@/types/supabase'
import Navbar from '@/components/navigation/navbar'
import PropertyForm from '@/components/property/property-form'
import { 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface PropertyWithImages extends Property {
  property_images: PropertyImage[]
}

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSupabase()
  const [property, setProperty] = useState<PropertyWithImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id && user) {
      fetchProperty()
    }
  }, [params.id, user])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*)
        `)
        .eq('id', params.id)
        .eq('agent_id', user?.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          setError('Property not found or you do not have access to it.')
        } else {
          throw error
        }
        return
      }
      
      setProperty(data)
    } catch (err) {
      console.error('Error fetching property:', err)
      setError('Failed to load property. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any) => {
    if (!property) return
    
    try {
      setSaving(true)
      setError(null)
      
      // Update property data
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          listing_status: formData.listing_status,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          price: formData.price,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          square_feet: formData.square_feet,
          lot_size: formData.lot_size,
          year_built: formData.year_built,
          listing_url: formData.listing_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id)
        .eq('agent_id', user?.id)
      
      if (updateError) throw updateError
      
      // Handle image uploads if any
      if (formData.newImages && formData.newImages.length > 0) {
        for (const imageFile of formData.newImages) {
          // Upload image to Supabase storage
          const fileName = `${property.id}/${Date.now()}-${imageFile.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, imageFile)
          
          if (uploadError) {
            console.error('Error uploading image:', uploadError)
            continue
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName)
          
          // Save image record
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              image_url: publicUrl,
              alt_text: formData.title,
              display_order: 0
            })
          
          if (imageError) {
            console.error('Error saving image record:', imageError)
          }
        }
      }
      
      // Handle image deletions
      if (formData.deletedImageIds && formData.deletedImageIds.length > 0) {
        // Get image URLs to delete from storage
        const { data: imagesToDelete } = await supabase
          .from('property_images')
          .select('image_url')
          .in('id', formData.deletedImageIds)
        
        // Delete from storage
        if (imagesToDelete) {
          for (const image of imagesToDelete) {
            const fileName = image.image_url.split('/').pop()
            if (fileName) {
              await supabase.storage
                .from('property-images')
                .remove([`${property.id}/${fileName}`])
            }
          }
        }
        
        // Delete image records
        const { error: deleteError } = await supabase
          .from('property_images')
          .delete()
          .in('id', formData.deletedImageIds)
        
        if (deleteError) {
          console.error('Error deleting image records:', deleteError)
        }
      }
      
      // Redirect back to property detail page
      router.push(`/property/${property.id}`)
      
    } catch (err) {
      console.error('Error saving property:', err)
      setError('Failed to save property. Please try again.')
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading property...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Property</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link href="/dashboard/properties" className="btn btn-outline btn-error">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/property/${property.id}`} 
              className="btn btn-ghost btn-circle"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
              <p className="text-gray-600">{property.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link 
              href={`/property/${property.id}`}
              className="btn btn-ghost"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Property Form */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <PropertyForm
              initialData={{
                title: property.title || '',
                description: property.description || '',
                property_type: property.property_type,
                listing_status: property.listing_status,
                address: property.address || '',
                city: property.city || '',
                state: property.state || '',
                zip_code: property.zip_code || '',
                price: property.price || 0,
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                square_feet: property.square_feet || 0,
                lot_size: property.lot_size || 0,
                year_built: property.year_built || 0,
                listing_url: property.listing_url || '',
                existingImages: property.property_images || []
              }}
              onSubmit={handleSave}
              isLoading={saving}
              submitButtonText={
                <>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}