// lib/api-client.ts - COMPLETE REPLACEMENT
import { supabase } from './supabase'

// Get the API base URL from environment variables
const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  console.log('🌍 API Base URL:', url)
  return url
}

// Session cache for faster authentication
interface CachedSession {
  session: any
  timestamp: number
  expiresAt: number
}

let sessionCache: CachedSession | null = null
const SESSION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const SESSION_STORAGE_KEY = 'nester_session_cache'

/**
 * Load session from browser storage
 */
function loadSessionFromStorage(): CachedSession | null {
  try {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null
    
    const cached: CachedSession = JSON.parse(stored)
    
    // Check if session is still valid
    if (Date.now() > cached.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    
    return cached
  } catch (error) {
    console.warn('Failed to load session from storage:', error)
    return null
  }
}

/**
 * Save session to browser storage
 */
function saveSessionToStorage(session: any) {
  try {
    if (typeof window === 'undefined' || !session) return
    
    const cached: CachedSession = {
      session,
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_CACHE_DURATION
    }
    
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cached))
    sessionCache = cached
  } catch (error) {
    console.warn('Failed to save session to storage:', error)
  }
}

/**
 * Clear session from browser storage
 */
function clearSessionFromStorage() {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_STORAGE_KEY)
    sessionCache = null
  } catch (error) {
    console.warn('Failed to clear session from storage:', error)
  }
}

/**
 * Enhanced session retrieval with browser caching for faster authentication
 */
async function getValidSession() {
  console.log('🔐 Getting valid session...')
  
  try {
    // First check: memory cache
    if (sessionCache && Date.now() < sessionCache.expiresAt) {
      console.log('✅ Using cached session from memory')
      return { session: sessionCache.session, error: null }
    }
    
    // Second check: browser storage cache
    const storedSession = loadSessionFromStorage()
    if (storedSession) {
      console.log('✅ Using cached session from storage')
      sessionCache = storedSession
      return { session: storedSession.session, error: null }
    }
    
    console.log('🔄 Fetching fresh session from Supabase...')
    
    // Third attempt: get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('Session check result:', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      error: error?.message,
      userId: session?.user?.id
    })
    
    if (session?.access_token && !error) {
      console.log('✅ Valid session found, caching...')
      saveSessionToStorage(session)
      return { session, error: null }
    }
    
    console.log('⚠️ No valid session, attempting refresh...')
    
    // Fourth attempt: refresh session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshData?.session?.access_token && !refreshError) {
      console.log('✅ Session refreshed successfully, caching...')
      saveSessionToStorage(refreshData.session)
      return { session: refreshData.session, error: null }
    }
    
    console.log('❌ Session refresh failed:', refreshError?.message)
    clearSessionFromStorage()
    return { session: null, error: refreshError || new Error('No valid session available') }
    
  } catch (err) {
    console.error('❌ Session retrieval failed:', err)
    clearSessionFromStorage()
    return { session: null, error: err }
  }
}

/**
 * Make an authenticated API request with comprehensive error handling and logging
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  console.log('🔄 authenticatedFetch called with:', { url, method: options.method || 'GET' })
  
  try {
    // Get the current session with enhanced retry logic
    const { session, error: sessionError } = await getValidSession()
    
    // Check for development test mode
    const isTestMode = process.env.NODE_ENV === 'development' && 
      options.body && 
      typeof options.body === 'string' && 
      JSON.parse(options.body).test_mode === true
    
    console.log('🧪 Test mode:', isTestMode)
    
    // Handle authentication
    if (!isTestMode && (sessionError || !session?.access_token)) {
      console.error('❌ Authentication failed:', { sessionError: sessionError?.message, hasSession: !!session, hasToken: !!session?.access_token })
      throw new Error(`Authentication required: ${sessionError?.message || 'No valid session'}`)
    }

    // Prepare the full URL
    const baseUrl = getApiBaseUrl()
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
    
    console.log('🎯 Full URL:', fullUrl)

    // Prepare headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    // Add auth header if we have a valid session (and not test mode)
    if (session?.access_token && !isTestMode) {
      headers.Authorization = `Bearer ${session.access_token}`
      console.log('🔑 Authorization header added')
    }
    
    console.log('📋 Request headers:', Object.keys(headers))
    console.log('📦 Request body:', options.body ? 'Present' : 'None')

    // Make the actual fetch request
    console.log('📡 Making fetch request...')
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    })
    
    console.log('📨 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    return response
    
  } catch (error) {
    console.error('❌ authenticatedFetch error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw error // Re-throw to ensure it bubbles up
  }
}

/**
 * Make an authenticated API request and parse JSON response with comprehensive error handling
 */
export async function authenticatedFetchJson(url: string, options: RequestInit = {}) {
  console.log('🔄 authenticatedFetchJson called with:', { url, method: options.method || 'GET' })
  
  try {
    const response = await authenticatedFetch(url, options)
    
    if (!response.ok) {
      console.error('❌ HTTP error response:', response.status, response.statusText)
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorData = null
      
      try {
        const errorText = await response.text()
        console.error('❌ Error response body:', errorText)
        
        // Try to parse as JSON for better error messages
        try {
          errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If not JSON, use the text as the error message
          errorMessage = errorText || errorMessage
        }
      } catch (readError) {
        console.error('❌ Could not read error response:', readError)
      }
      
      throw new Error(errorMessage)
    }

    console.log('📄 Parsing JSON response...')
    const responseData = await response.json()
    console.log('✅ JSON response parsed successfully:', responseData)
    
    return responseData
    
  } catch (error) {
    console.error('❌ authenticatedFetchJson error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw error // Re-throw to ensure it bubbles up
  }
}

/**
 * Session cache management utilities
 */
export const sessionCacheManager = {
  /**
   * Manually clear the session cache (useful for debugging or forced logout)
   */
  clear: () => {
    clearSessionFromStorage()
    console.log('🗑️ Session cache manually cleared')
  },
  
  /**
   * Check if session is cached
   */
  isCached: () => {
    return !!(sessionCache || loadSessionFromStorage())
  },
  
  /**
   * Get cache status for debugging
   */
  getStatus: () => {
    const memoryCache = sessionCache
    const storageCache = loadSessionFromStorage()
    return {
      hasMemoryCache: !!memoryCache,
      hasStorageCache: !!storageCache,
      memoryExpiry: memoryCache?.expiresAt,
      storageExpiry: storageCache?.expiresAt,
      currentTime: Date.now()
    }
  }
}

/**
 * API client with comprehensive error handling and logging
 */
export const apiClient = {
  // Property operations
  async createProperty(propertyData: any) {
    console.log('🏠 apiClient.createProperty called with:', propertyData)
    
    try {
      const response = await authenticatedFetchJson('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      })
      
      console.log('✅ createProperty response:', response)
      
      // Return in the format expected by the form (with data property)
      return { 
        success: true,
        data: response.data || response,
        message: response.message || 'Property created successfully'
      }
      
    } catch (error) {
      console.error('❌ createProperty failed:', error)
      
      // Return error in expected format
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  async getProperties() {
    console.log('📋 apiClient.getProperties called')
    
    try {
      const response = await authenticatedFetchJson('/properties')
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ getProperties failed:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  async getProperty(id: string) {
    console.log('🏠 apiClient.getProperty called with id:', id)
    
    try {
      const response = await authenticatedFetchJson(`/properties/${id}`)
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ getProperty failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  async updateProperty(id: string, propertyData: any) {
    console.log('✏️ apiClient.updateProperty called with:', { id, propertyData })
    
    try {
      const response = await authenticatedFetchJson(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      })
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ updateProperty failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  async deleteProperty(id: string) {
    console.log('🗑️ apiClient.deleteProperty called with id:', id)
    
    try {
      const response = await authenticatedFetchJson(`/properties/${id}`, {
        method: 'DELETE',
      })
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ deleteProperty failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // Property image operations
  async uploadPropertyImage(propertyId: string, formData: FormData) {
    console.log('📸 apiClient.uploadPropertyImage called for property:', propertyId)
    
    try {
      const { session, error: sessionError } = await getValidSession()
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required for file upload')
      }

      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}/properties/${propertyId}/images`
      
      console.log('📤 Uploading to:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      })

      console.log('📨 Upload response:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Upload error:', errorText)
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }

      const responseData = await response.json()
      console.log('✅ Upload successful:', responseData)
      
      return { 
        success: true,
        data: responseData.data || responseData 
      }
      
    } catch (error) {
      console.error('❌ uploadPropertyImage failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  async getPropertyImages(propertyId: string) {
    console.log('🖼️ apiClient.getPropertyImages called for property:', propertyId)
    
    try {
      const response = await authenticatedFetchJson(`/properties/${propertyId}/images`)
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ getPropertyImages failed:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  async deletePropertyImage(propertyId: string, imageId: string) {
    console.log('🗑️ apiClient.deletePropertyImage called:', { propertyId, imageId })
    
    try {
      const response = await authenticatedFetchJson(`/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE',
      })
      return { 
        success: true,
        data: response.data || response 
      }
    } catch (error) {
      console.error('❌ deletePropertyImage failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // Content generation
  async generatePropertyContent(propertyId: string) {
    console.log('🤖 apiClient.generatePropertyContent called for property:', propertyId)
    
    try {
      const response = await authenticatedFetchJson(`/properties/${propertyId}/generate-content`, {
        method: 'POST',
        body: JSON.stringify({ contentTypes: ['description', 'images', 'social_posts'] }),
      })
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Content generation started'
      }
      
    } catch (error) {
      console.error('❌ generatePropertyContent failed:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },
  
  // Test methods for debugging
  async testConnection() {
    console.log('🔍 Testing API connection...')
    
    try {
      const baseUrl = getApiBaseUrl()
      const healthUrl = baseUrl.replace('/api', '/health')
      
      console.log('🏥 Testing health endpoint:', healthUrl)
      const response = await fetch(healthUrl)
      console.log('📊 Health check status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend is healthy:', data)
        return { 
          success: true, 
          data, 
          message: 'Backend connection successful' 
        }
      } else {
        console.warn('⚠️ Backend health check failed:', response.status)
        return { 
          success: false, 
          status: response.status, 
          message: `Health check failed: ${response.status}` 
        }
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      return { 
        success: false, 
        error: error.message, 
        message: 'Cannot connect to backend' 
      }
    }
  },

  async testAuth() {
    console.log('🔍 Testing authentication...')
    
    try {
      const { session, error } = await getValidSession()
      const result = {
        success: !!session?.access_token && !error,
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userId: session?.user?.id,
        error: error?.message || null,
        message: !!session?.access_token ? 'Authentication successful' : 'No valid session'
      }
      console.log('🔐 Auth test result:', result)
      return result
    } catch (error) {
      console.error('❌ Auth test failed:', error)
      return {
        success: false,
        hasSession: false,
        hasToken: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Authentication test failed'
      }
    }
  },

  async testPropertiesEndpoint() {
    console.log('🔍 Testing properties endpoint...')
    
    try {
      const response = await authenticatedFetch('/properties', {
        method: 'GET'
      })

      console.log('📨 Properties endpoint status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Properties endpoint working:', data)
        return { 
          success: true, 
          data, 
          message: 'Properties endpoint working' 
        }
      } else {
        const errorText = await response.text()
        console.warn('⚠️ Properties endpoint failed:', response.status, errorText)
        return { 
          success: false, 
          status: response.status, 
          error: errorText,
          message: `Properties endpoint failed: ${response.status}` 
        }
      }
    } catch (error) {
      console.error('❌ Properties endpoint test failed:', error)
      return { 
        success: false, 
        error: error.message,
        message: 'Properties endpoint test failed' 
      }
    }
  }
}