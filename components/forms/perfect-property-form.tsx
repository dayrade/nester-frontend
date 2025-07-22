'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { EnhancedImageUpload, type ImageFile } from '../property/enhanced-image-upload'
import { apiClient, sessionCacheManager } from '@/lib/api-client'
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
  Save,
  Plus,
  Building,
  Hash
} from 'lucide-react'
import { isValidUrl, formatFileSize } from '@/lib/utils'

export interface PerfectPropertyFormData {
  // Basic Information
  address: string
  price: number | null
  property_type: 'house' | 'condo' | 'townhouse' | 'apartment' | 'land' | 'commercial'
  listing_status: 'active' | 'pending' | 'sold' | 'off_market'
  
  // Property Details
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  description: string
  features: string[]
  
  // Optional fields
  source_url?: string
  input_method: 'manual' | 'url'
}

interface PerfectPropertyFormProps {
  onSubmit?: (data: PerfectPropertyFormData, images: ImageFile[]) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<PerfectPropertyFormData>
  isLoading?: boolean
  submitLabel?: string
  className?: string
}

const PROPERTY_TYPES = [
  { value: 'house', label: 'Single Family Home', icon: Home },
  { value: 'condo', label: 'Condominium', icon: Building },
  { value: 'townhouse', label: 'Townhouse', icon: Home },
  { value: 'apartment', label: 'Apartment', icon: Building },
  { value: 'land', label: 'Land/Lot', icon: Square },
  { value: 'commercial', label: 'Commercial', icon: Building }
] as const

const LISTING_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'sold', label: 'Sold', color: 'info' },
  { value: 'off_market', label: 'Off Market', color: 'neutral' }
] as const

export default function PerfectPropertyForm({ 
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  submitLabel = 'Create Property',
  className = ''
}: PerfectPropertyFormProps) {
  const router = useRouter()
  const { user, supabase, session } = useSupabase()
  
  // Authentication state
  const [authInitialized, setAuthInitialized] = useState(false)
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    message: string
    lastChecked: number
  }>({ isAuthenticated: false, message: 'Checking...', lastChecked: 0 })
  
  // Form state
  const [formData, setFormData] = useState<PerfectPropertyFormData>({
    address: initialData?.address || '',
    price: initialData?.price || null,
    property_type: initialData?.property_type || 'house',
    listing_status: initialData?.listing_status || 'active',
    bedrooms: initialData?.bedrooms || null,
    bathrooms: initialData?.bathrooms || null,
    square_feet: initialData?.square_feet || null,
    description: initialData?.description || '',
    features: initialData?.features || [],
    source_url: initialData?.source_url || '',
    input_method: initialData?.input_method || 'manual'
  })
  
  const [images, setImages] = useState<ImageFile[]>([])
  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isRefreshingSession, setIsRefreshingSession] = useState(false)
  
  // Debug component initialization
  useEffect(() => {
    console.log('=== COMPONENT INITIALIZATION ===')
    console.log('API Client:', apiClient)
    console.log('API Client methods:', Object.keys(apiClient || {}))
    console.log('createProperty method exists:', typeof apiClient?.createProperty === 'function')
    console.log('User:', user)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Initial form data:', formData)
  }, [])
  
  // Initialize authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 Initializing authentication on component mount...')
      
      try {
        // Check if we already have a valid session from Supabase provider
        if (session?.access_token) {
          console.log('✅ Valid session found from provider')
          setAuthStatus({
            isAuthenticated: true,
            message: 'Authentication successful',
            lastChecked: Date.now()
          })
          setAuthInitialized(true)
          return
        }
        
        // If no session from provider, check cached session
        const authResult = await apiClient.testAuth()
        
        if (authResult.success && authResult.hasSession) {
          console.log('✅ Valid cached session found')
          setAuthStatus({
            isAuthenticated: true,
            message: 'Authentication successful (cached)',
            lastChecked: Date.now()
          })
        } else {
          console.log('⚠️ No valid session found')
          setAuthStatus({
            isAuthenticated: false,
            message: authResult.error || 'No valid session',
            lastChecked: Date.now()
          })
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
        setAuthStatus({
          isAuthenticated: false,
          message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastChecked: Date.now()
        })
      } finally {
        setAuthInitialized(true)
      }
    }
    
    // Only initialize if not already done
    if (!authInitialized) {
      initializeAuth()
    }
  }, [session, authInitialized])

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = 'perfect-property-draft'
    const timer = setTimeout(() => {
      if (formData.address || formData.description) {
        console.log('Saving draft to localStorage...')
        localStorage.setItem(draftKey, JSON.stringify({
          ...formData,
          timestamp: Date.now()
        }))
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  // Load draft on mount
  useEffect(() => {
    if (!initialData) {
      const draftKey = 'perfect-property-draft'
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          const age = Date.now() - (draft.timestamp || 0)
          // Only load drafts less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            console.log('Loading draft from localStorage:', draft)
            setFormData(prev => ({ ...prev, ...draft }))
          } else {
            console.log('Draft too old, skipping')
          }
        } catch (error) {
          console.log('Failed to parse draft:', error)
        }
      }
    }
  }, [initialData])

  // Validation function
  const validateForm = useCallback((): boolean => {
    console.log('=== RUNNING FORM VALIDATION ===')
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required'
    }
    
    // Price validation
    if (formData.price !== null && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    // Bedrooms validation
    if (formData.bedrooms !== null && formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative'
    }
    
    // Bathrooms validation
    if (formData.bathrooms !== null && formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative'
    }
    
    // Square feet validation
    if (formData.square_feet !== null && formData.square_feet <= 0) {
      newErrors.square_feet = 'Square feet must be greater than 0'
    }
    
    // URL validation if provided
    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = 'Please enter a valid URL'
    }
    
    // Image validation - check if images have required metadata (only if images are uploaded)
    const invalidImages = images.filter(img => !img.roomType || !img.file)
    if (images.length > 0 && invalidImages.length > 0) {
      newErrors.images = 'Please select a room type for all uploaded images and ensure all files are valid'
    }
    
    console.log('Validation results:')
    console.log('- Address:', formData.address, 'Valid:', !!formData.address.trim())
    console.log('- Price:', formData.price, 'Valid:', formData.price === null || formData.price > 0)
    console.log('- New errors:', newErrors)
    console.log('- Invalid images:', invalidImages)
    console.log('- Images array:', images)
    console.log('- Validation passed:', Object.keys(newErrors).length === 0)
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, images])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof PerfectPropertyFormData, value: any) => {
    console.log(`Input changed: ${field} = ${value}`)
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Handle session refresh
  const handleSessionRefresh = useCallback(async () => {
    console.log('=== REFRESHING SESSION ===')
    setIsRefreshingSession(true)
    setSubmitError('')
    
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        throw error
      }
      
      if (data?.session) {
        console.log('Session refreshed successfully:', data.session)
        setSubmitError('')
      } else {
        throw new Error('Failed to refresh session')
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      setSubmitError('Session refresh failed. Please log in again.')
    } finally {
      setIsRefreshingSession(false)
    }
  }, [supabase])

  // Handle feature management
  const addFeature = useCallback(() => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      console.log('Adding feature:', newFeature.trim())
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }, [newFeature, formData.features])

  const removeFeature = useCallback((index: number) => {
    console.log('Removing feature at index:', index)
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }, [])

  // Handle image changes
  const handleImagesChange = useCallback((newImages: ImageFile[]) => {
    console.log('Images changed:', newImages.length, 'images')
    setImages(newImages)
    // Clear image errors when images change
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }
  }, [errors.images])

  // 🔥 ENHANCED DEBUG VERSION - Test API directly
 

  // 🔥 ENHANCED VERSION - Using createPropertyWithImages endpoint
const handleDefaultSubmit = async () => {
  console.log('🔥 === DEFAULT SUBMIT HANDLER START (WITH IMAGES) ===')
  
  try {
    // Step 1: Check user
    console.log('🔍 STEP 1: Checking user...', { 
      user: !!user, 
      userId: user?.id,
      environment: process.env.NODE_ENV 
    })
    
    // Step 2: Check API client
    console.log('🔍 STEP 2: Checking API client...')
    
    if (!apiClient) {
      throw new Error('❌ apiClient is null/undefined')
    }
    
    if (typeof apiClient.createPropertyWithImages !== 'function') {
      throw new Error('❌ apiClient.createPropertyWithImages is not a function')
    }
    
    console.log('✅ API client validation passed')
    
    // Step 3: Test connection first
    console.log('🔍 STEP 3: Testing backend connection...')
    const connectionTest = await apiClient.testConnection()
    console.log('Connection test result:', connectionTest)
    
    if (!connectionTest.success) {
      throw new Error(`Backend connection failed: ${connectionTest.message}`)
    }
    
    console.log('✅ Backend connection verified')
    
    // Step 4: Test authentication
    console.log('🔍 STEP 4: Testing authentication...')
    const authTest = await apiClient.testAuth()
    console.log('Auth test result:', authTest)
    
    // In development with test_mode, we can continue without auth
    if (!authTest.success && process.env.NODE_ENV !== 'development') {
      throw new Error(`Authentication failed: ${authTest.message}`)
    }
    
    console.log('✅ Authentication verified (or test mode)')
    
    // Step 5: Prepare FormData for createPropertyWithImages
    console.log('🔍 STEP 5: Preparing FormData for property with images...')
    const formDataToSend = new FormData()
    
    // Add property data
    formDataToSend.append('agent_id', user?.id || '2db617a1-e6b1-4d58-b6eb-37ec7476af37')
    formDataToSend.append('address', formData.address)
    if (formData.price) formDataToSend.append('price', formData.price.toString())
    formDataToSend.append('property_type', formData.property_type)
    formDataToSend.append('listing_status', formData.listing_status)
    if (formData.bedrooms) formDataToSend.append('bedrooms', formData.bedrooms.toString())
    if (formData.bathrooms) formDataToSend.append('bathrooms', formData.bathrooms.toString())
    if (formData.square_feet) formDataToSend.append('square_feet', formData.square_feet.toString())
    if (formData.description) formDataToSend.append('description', formData.description)
    if (formData.features.length > 0) formDataToSend.append('features', JSON.stringify(formData.features))
    if (formData.source_url) formDataToSend.append('source_url', formData.source_url)
    formDataToSend.append('input_method', formData.input_method)
    formDataToSend.append('test_mode', 'true')
    
    // Add images
    if (images.length > 0) {
      console.log(`Adding ${images.length} images to FormData...`)
      images.forEach((imageFile, index) => {
        if (imageFile.file) {
          formDataToSend.append('images', imageFile.file)
          formDataToSend.append(`image_${index}_roomType`, imageFile.roomType || '')
          formDataToSend.append(`image_${index}_isPrimary`, (index === 0).toString())
          formDataToSend.append(`image_${index}_displayOrder`, index.toString())
          formDataToSend.append(`image_${index}_altText`, `Property image ${index + 1}`)
        }
      })
    }
    
    console.log('✅ FormData prepared with property data and images')
    
    // Step 6: Create property with images in single transaction
    console.log('🔍 STEP 6: Creating property with images...')
    const result = await apiClient.createPropertyWithImages(formDataToSend)
    console.log('Create property with images result:', result)
    
    if (!result.success) {
      throw new Error(`Property creation with images failed: ${result.error}`)
    }
    
    if (!result.data || !result.success) {
      throw new Error('Invalid API response - missing property data or ID')
    }
    
    const property = result.data.property
    console.log('✅ Property created successfully with ID:', property.id)
    console.log('✅ Images uploaded:', result.data.property.property_images?.length || 0)

    // Step 8: Trigger content generation
    try {
      console.log('🔍 STEP 8: Generating property content...')
      const contentResult = await apiClient.generatePropertyContent(property.id)
      console.log('Content generation result:', contentResult)
      
      if (contentResult.success) {
        console.log('✅ Content generation started successfully')
      } else {
        console.warn('⚠️ Content generation failed (non-critical):', contentResult.error)
      }
    } catch (error) {
      console.warn('⚠️ Content generation error (non-critical):', error)
      // Don't fail the whole process if content generation fails
    }
    
    console.log('🎉 Property creation process completed successfully!')
    return property
    
  } catch (error) {
    console.error('🔥 DEFAULT SUBMIT HANDLER ERROR:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? (error as any).cause : undefined
    })
    throw error
  }
}

// Updated test function for createPropertyWithImages:
const testApiDirectly = async () => {
  console.log('🧪 === COMPREHENSIVE API TEST (WITH IMAGES) ===')
  
  try {
    // Test 1: Connection
    console.log('\n🔍 TEST 1: Backend Connection')
    const connectionTest = await apiClient.testConnection()
    console.log('Connection result:', connectionTest)
    
    if (!connectionTest.success) {
      alert(`❌ Backend connection failed: ${connectionTest.message}`)
      return
    }
    
    alert('✅ Backend connection successful!')
    
    // Test 2: Authentication (use cached status)
    console.log('\n🔍 TEST 2: Authentication (cached)')
    console.log('Cached auth status:', authStatus)
    
    // Only refresh auth if cache is older than 5 minutes
    const cacheAge = Date.now() - authStatus.lastChecked
    const shouldRefreshAuth = cacheAge > 5 * 60 * 1000 // 5 minutes
    
    if (shouldRefreshAuth) {
      console.log('🔄 Auth cache expired, refreshing...')
      const authTest = await apiClient.testAuth()
      console.log('Fresh auth result:', authTest)
      setAuthStatus({
        isAuthenticated: authTest.success,
        message: authTest.message,
        lastChecked: Date.now()
      })
      alert(`Auth status (refreshed): ${authTest.message}`)
    } else {
      console.log('✅ Using cached auth status')
      alert(`Auth status (cached): ${authStatus.message}`)
    }
    
    // Test 3: Properties endpoint
    console.log('\n🔍 TEST 3: Properties Endpoint')
    const propertiesTest = await apiClient.testPropertiesEndpoint()
    console.log('Properties endpoint result:', propertiesTest)
    alert(`Properties endpoint: ${propertiesTest.message}`)
    
    // Test 4: Create property with images
    console.log('\n🔍 TEST 4: Create Property With Images')
    const testFormData = new FormData()
    testFormData.append('address', 'Test Property 123 Main St')
    testFormData.append('property_type', 'house')
    testFormData.append('listing_status', 'active')
    testFormData.append('input_method', 'manual')
    testFormData.append('test_mode', 'true')
    testFormData.append('agent_id', user?.id || '2db617a1-e6b1-4d58-b6eb-37ec7476af37')
    
    const createResult = await apiClient.createPropertyWithImages(testFormData)
    console.log('Create property with images result:', createResult)
    
    if (createResult.success) {
      alert('✅ All tests passed! Property creation with images working.')
    } else {
      alert(`❌ Property creation with images failed: ${createResult.error}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    alert(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMISSION STARTED ===')
    console.log('Event prevented, processing form...')
    
    // Debug current state
    console.log('Current form state:', {
      formData: formData,
      address: formData.address,
      addressLength: formData.address.trim().length,
      isFormValid: formData.address.trim().length > 0,
      user: !!user,
      userId: user?.id,
      environment: process.env.NODE_ENV,
      isSubmitting: isSubmitting,
      isLoading: isLoading,
      submitError: submitError,
      currentErrors: errors,
      images: images.length,
      onSubmit: typeof onSubmit
    })
    
    // Early validation checks
    console.log('Checking early validation conditions...')
    
    // Allow test_mode in development even without user session
    if (!user && process.env.NODE_ENV !== 'development') {
      console.log('❌ STOPPED: User not logged in (production mode)')
      setSubmitError('You must be logged in to create a property')
      return
    }
    
    console.log('✅ Authentication check passed')
    
    // Run form validation
    console.log('Running form validation...')
    const validationPassed = validateForm()
    console.log('Validation result:', validationPassed)
    
    if (!validationPassed) {
      console.log('❌ STOPPED: Form validation failed')
      console.log('Validation errors:', errors)
      setSubmitError('Please fix the errors above before submitting')
      return
    }
    
    console.log('✅ Form validation passed')
    console.log('✅ All pre-checks completed, proceeding with submission...')
    
    console.log('Setting isSubmitting to true')
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess(false)
    
    try {
      console.log('Entering try block for property creation...')
      
      if (onSubmit) {
        console.log('Using custom onSubmit function')
        console.log('Custom onSubmit type:', typeof onSubmit)
        await onSubmit(formData, images)
        console.log('✅ Custom onSubmit completed')
      } else {
        console.log('Using default submission handler')
        await handleDefaultSubmit()
        console.log('✅ Default submission completed')
      }
      
      console.log('✅ Property creation successful!')
      console.log('Setting submitSuccess to true')
      setSubmitSuccess(true)
      
      // Clear draft after successful submission
      console.log('Clearing localStorage draft')
      localStorage.removeItem('perfect-property-draft')
      
      console.log('Resetting form state')
      // Reset form state
      setFormData({
        address: '',
        price: null,
        property_type: 'house',
        listing_status: 'active',
        bedrooms: null,
        bathrooms: null,
        square_feet: null,
        description: '',
        features: [],
        source_url: '',
        input_method: 'manual'
      })
      setImages([])
      
      console.log('Scheduling redirect to dashboard in 2 seconds...')
      // Redirect after a short delay
      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard now...')
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('❌ SUBMISSION FAILED:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? (error as any).cause : undefined
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create property'
      console.log('Setting error message:', errorMessage)
      setSubmitError(errorMessage)
      setSubmitSuccess(false)
    } finally {
      console.log('Resetting isSubmitting to false')
      setIsSubmitting(false)
      console.log('=== FORM SUBMISSION COMPLETED ===')
    }
  }

  // Simplified validation for testing - only require address
  const isFormValid = formData.address.trim().length > 0
  
  // Debug logging for form state on every render
  console.log('=== RENDER STATE ===', {
    isFormValid,
    isSubmitting,
    isLoading,
    submitSuccess,
    submitError: !!submitError,
    user: !!user,
    addressLength: formData.address.trim().length,
    buttonDisabled: !isFormValid || isSubmitting || isLoading
  })

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Debug Information Panel - Remove this in production */}
        <div className="card bg-info text-info-content">
          <div className="card-body">
            <h4 className="card-title">🐛 Debug Info (Remove in Production)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm space-y-1">
                <div><strong>Form Status:</strong></div>
                <div>Form Valid: {isFormValid ? '✅' : '❌'}</div>
                <div>User Logged In: {user ? '✅' : '❌'}</div>
                <div>Auth Status: {authInitialized ? (authStatus.isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated') : '🔄 Checking...'}</div>
                <div>Auth Message: {authStatus.message}</div>
                <div>Is Submitting: {isSubmitting ? '✅' : '❌'}</div>
                <div>Address Length: {formData.address.trim().length}</div>
                <div>Environment: {process.env.NODE_ENV}</div>
                <div>API Client: {apiClient ? '✅' : '❌'}</div>
                <div>createProperty Method: {typeof apiClient?.createProperty === 'function' ? '✅' : '❌'}</div>
                <div>Button Disabled: {(!isFormValid || isSubmitting || isLoading) ? '✅' : '❌'}</div>
              </div>
              <div className="text-sm space-y-1">
                <div><strong>🔐 Session Cache Status:</strong></div>
                <div>Cache Available: {sessionCacheManager.isCached() ? '✅' : '❌'}</div>
                <div>Auth Cache Age: {authInitialized ? `${Math.round((Date.now() - authStatus.lastChecked) / 1000)}s` : 'N/A'}</div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const status = sessionCacheManager.getStatus()
                      console.log('Session cache status:', status)
                      alert(`Session Cache Status:\n\nMemory Cache: ${status.hasMemoryCache ? 'Yes' : 'No'}\nStorage Cache: ${status.hasStorageCache ? 'Yes' : 'No'}\n\nMemory Expiry: ${status.memoryExpiry ? new Date(status.memoryExpiry).toLocaleString() : 'N/A'}\nStorage Expiry: ${status.storageExpiry ? new Date(status.storageExpiry).toLocaleString() : 'N/A'}\n\nCurrent Time: ${new Date(status.currentTime).toLocaleString()}`)
                    }}
                    className="btn btn-xs btn-outline mr-2"
                  >
                    Check Cache
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionCacheManager.clear()
                      alert('Session cache cleared! Next API call will fetch fresh session.')
                    }}
                    className="btn btn-xs btn-outline btn-warning"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="alert alert-success">
            <CheckCircle className="h-5 w-5" />
            <span>Property created successfully! Redirecting to dashboard...</span>
          </div>
        )}
        
        {/* Error Message */}
        {submitError && (
          <div className="alert alert-error">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex-1">
              <span>{submitError}</span>
              {(submitError.toLowerCase().includes('session') || 
                submitError.toLowerCase().includes('authentication') ||
                submitError.toLowerCase().includes('log in')) && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleSessionRefresh}
                    disabled={isRefreshingSession}
                    className="btn btn-sm btn-outline btn-warning"
                  >
                    {isRefreshingSession ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Session'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Home className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Property Address *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                    className={`input input-bordered w-full pl-10 ${
                      errors.address ? 'input-error' : ''
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.address}</span>
                  </label>
                )}
              </div>

              {/* Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Price</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="450000"
                    className={`input input-bordered w-full pl-10 ${
                      errors.price ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.price && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.price}</span>
                  </label>
                )}
              </div>

              {/* Property Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Property Type</span>
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="select select-bordered"
                  disabled={isSubmitting}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Listing Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Listing Status</span>
                </label>
                <select
                  value={formData.listing_status}
                  onChange={(e) => handleInputChange('listing_status', e.target.value)}
                  className="select select-bordered"
                  disabled={isSubmitting}
                >
                  {LISTING_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bedrooms</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="3"
                    className={`input input-bordered w-full pl-10 ${
                      errors.bedrooms ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.bedrooms && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.bedrooms}</span>
                  </label>
                )}
              </div>

              {/* Bathrooms */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bathrooms</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="2.5"
                    className={`input input-bordered w-full pl-10 ${
                      errors.bathrooms ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.bathrooms && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.bathrooms}</span>
                  </label>
                )}
              </div>

              {/* Square Feet */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Square Feet</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.square_feet || ''}
                    onChange={(e) => handleInputChange('square_feet', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="2000"
                    className={`input input-bordered w-full pl-10 ${
                      errors.square_feet ? 'input-error' : ''
                    }`}
                    min="0"
                    disabled={isSubmitting}
                  />
                  <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.square_feet && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.square_feet}</span>
                  </label>
                )}
              </div>

              {/* Source URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Source URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.source_url || ''}
                  onChange={(e) => handleInputChange('source_url', e.target.value)}
                  placeholder="https://www.zillow.com/..."
                  className={`input input-bordered ${
                    errors.source_url ? 'input-error' : ''
                  }`}
                  disabled={isSubmitting}
                />
                {errors.source_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.source_url}</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <FileText className="h-5 w-5" />
              Description
            </h3>
            <div className="form-control">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the property, its unique features, neighborhood highlights, and what makes it special..."
                className="textarea textarea-bordered h-32"
                rows={6}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Hash className="h-5 w-5" />
              Features & Amenities
            </h3>
            
            <div className="form-control mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Hardwood Floors, Swimming Pool)"
                  className="input input-bordered flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-outline"
                  disabled={isSubmitting || !newFeature.trim()}
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
                      disabled={isSubmitting}
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
              Property Images
            </h3>
            <EnhancedImageUpload
              images={images}
              onImagesChange={handleImagesChange}
              maxFiles={20}
              className="w-full"
            />
            {errors.images && (
              <div className="text-error text-sm mt-2">{errors.images}</div>
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          {/* Enhanced Test Button with Direct API Testing */}
          <button
            type="button"
            onClick={testApiDirectly}
            className="btn btn-secondary"
          >
            🧪 Test API Directly
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || isLoading}
            className="btn btn-primary"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Property...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export { PerfectPropertyForm }