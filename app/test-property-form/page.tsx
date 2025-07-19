'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import EnhancedPropertyForm, { PropertyFormData } from '@/components/property/enhanced-property-form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

// PropertyFormData is now imported from enhanced-property-form

export default function TestPropertyFormPage() {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (formData: PropertyFormData) => {
    if (!user) {
      setError('You must be logged in to create a property')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // The EnhancedPropertyForm now handles the entire submission process
      // including property creation and image uploads
      setSuccess(`Property "${formData.title}" created successfully with images!`)
      
      // Optionally redirect after a delay
      setTimeout(() => {
        // router.push('/dashboard/properties')
      }, 2000)
      
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Image upload is now handled by EnhancedPropertyForm

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="btn btn-ghost btn-circle">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Property Form</h1>
              <p className="text-gray-600">Testing PropertyForm component with API integration</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success mb-6">
            <span>{success}</span>
          </div>
        )}

        {/* Authentication Check */}
        {!user ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Please log in to test the property form</p>
              <Link href="/auth/login" className="btn btn-primary mt-4">
                Login
              </Link>
            </div>
          </div>
        ) : (
          /* Property Form */
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <EnhancedPropertyForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                submitLabel="Create Property with Images"
              />
            </div>
          </div>
        )}

        {/* Enhanced Form Information */}
        <div className="mt-8 card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">Enhanced Property Form Features</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Property Creation:</strong> POST /api/properties</p>
              <p><strong>Image Processing:</strong> Advanced compression and optimization</p>
              <p><strong>Image Upload:</strong> Automatic upload to Supabase Storage</p>
              <p><strong>Database Records:</strong> Automatic property_images table entries</p>
              <p><strong>Error Handling:</strong> Comprehensive error handling and rollback</p>
              <p><strong>Network Tab:</strong> Check browser dev tools to see API calls</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}