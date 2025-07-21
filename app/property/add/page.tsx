'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { PropertyData } from '@/types/supabase'
import { ArrowLeft, Link as LinkIcon, FileText, Upload, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLoading } from '@/hooks/use-loading'

import { PerfectPropertyForm } from '@/components/forms/perfect-property-form'

type InputMethod = 'url' | 'manual'

export default function AddPropertyPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const { brandAssets } = useBrand()
  const { withLoading } = useLoading()
  
  // All state hooks must be declared at the top
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [inputMethod, setInputMethod] = useState<InputMethod>('url')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [propertyUrl, setPropertyUrl] = useState('')
  // State for URL import only

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading) {
        if (!user) {
          // Redirect to login with return URL
          router.push('/auth/login?redirect=/property/add')
          return
        }
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [user, authLoading, router])

  // Show loading while checking authentication
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="card bg-white shadow-lg max-w-md w-full mx-4">
          <div className="card-body text-center">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to add properties. Please sign in or create an account to continue.
            </p>
            <div className="space-y-3">
              <Link href="/auth/login?redirect=/property/add" className="btn btn-primary w-full">
                Sign In
              </Link>
              <Link href="/auth/login?mode=signup&redirect=/property/add" className="btn btn-outline w-full">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !propertyUrl.trim()) return

    setError('')

    try {
      await withLoading(async () => {
      // Call N8N workflow to scrape property data
      const response = await fetch('/api/property/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: propertyUrl,
          agent_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to scrape property data')
      }

        // Redirect to property page
        router.push(`/property/${result.property_id}`)
      }, 'Scraping property data...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }



  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-3">
            <Link href="/dashboard" className="btn btn-ghost btn-sm self-start">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline ml-1">Back to Dashboard</span>
              <span className="xs:hidden ml-1">Back</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {brandAssets?.logo && (
                <Image
                  src={brandAssets.logo}
                  alt={brandAssets.companyName || 'Logo'}
                  width={32}
                  height={32}
                  className="h-6 w-auto sm:h-8"
                />
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Property</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Input Method Selection */}
        <div className="card bg-white shadow-sm mb-6 sm:mb-8">
          <div className="card-body p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">How would you like to add your property?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setInputMethod('url')}
                className={`p-4 sm:p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'url'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Import from URL</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Paste a listing URL from Zillow, Realtor.com, or other platforms
                </p>
              </button>
              
              <button
                onClick={() => setInputMethod('manual')}
                className={`p-4 sm:p-6 border-2 rounded-lg transition-all ${
                  inputMethod === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2 sm:mb-3" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Manual Entry</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Enter property details manually with photos
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* URL Input Form */}
        {inputMethod === 'url' && (
          <div className="card bg-white shadow-sm">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Import Property from URL</h2>
              <form onSubmit={handleUrlSubmit}>
                <div className="form-control mb-4 sm:mb-6">
                  <label className="label">
                    <span className="label-text font-medium text-sm sm:text-base">Property Listing URL</span>
                  </label>
                  <input
                    type="url"
                    value={propertyUrl}
                    onChange={(e) => setPropertyUrl(e.target.value)}
                    placeholder="https://www.zillow.com/homedetails/..."
                    className="input input-bordered w-full text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500 text-xs sm:text-sm">
                      Supported: Zillow, Realtor.com, Redfin, and more
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !propertyUrl.trim()}
                  className="btn btn-primary w-full text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden xs:inline">Importing Property...</span>
                      <span className="xs:hidden">Importing...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xs:inline">Import Property</span>
                      <span className="xs:hidden">Import</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        {inputMethod === 'manual' && (
          <PerfectPropertyForm />
        )}
      </div>
    </div>
  )
}