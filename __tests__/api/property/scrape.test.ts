import { NextRequest } from 'next/server'
import { POST } from '@/app/api/property/scrape/route'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/headers')

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }))
}

const mockCreateRouteHandlerClient = createRouteHandlerClient as jest.MockedFunction<typeof createRouteHandlerClient>
const mockCookies = cookies as jest.MockedFunction<typeof cookies>

describe('/api/property/scrape', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any)
    mockCookies.mockReturnValue({} as any)
  })

  it('should return 400 if URL is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'agent-123' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('URL and agent_id are required')
  })

  it('should return 400 if agent_id is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('URL and agent_id are required')
  })

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://zillow.com/property/123',
        agent_id: 'agent-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for unsupported platform', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://unsupported-platform.com/property/123',
        agent_id: 'agent-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Unsupported platform. Supported platforms: zillow, realtor, redfin, homes, trulia')
  })

  it('should successfully scrape Zillow property', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })

    mockSupabaseClient.from().insert().mockResolvedValue({
      data: [{
        id: 'property-123',
        url: 'https://zillow.com/property/123',
        platform: 'zillow',
        agent_id: 'agent-123',
        title: 'Beautiful Home',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1500,
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip_code: '12345',
        description: 'A beautiful home in a great location',
        listing_status: 'active',
        created_at: new Date().toISOString()
      }],
      error: null
    })

    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://zillow.com/property/123',
        agent_id: 'agent-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.property).toBeDefined()
    expect(data.property.platform).toBe('zillow')
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('properties')
  })

  it('should handle scraping errors gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })

    mockSupabaseClient.from().insert().mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://zillow.com/property/123',
        agent_id: 'agent-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to scrape property')
  })

  it('should detect platform correctly for different URLs', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    })

    const testCases = [
      { url: 'https://www.zillow.com/homedetails/123', expectedPlatform: 'zillow' },
      { url: 'https://www.realtor.com/realestateandhomes-detail/456', expectedPlatform: 'realtor' },
      { url: 'https://www.redfin.com/CA/San-Francisco/789', expectedPlatform: 'redfin' },
      { url: 'https://www.homes.com/property/101112', expectedPlatform: 'homes' },
      { url: 'https://www.trulia.com/p/ca/san-francisco/131415', expectedPlatform: 'trulia' }
    ]

    for (const testCase of testCases) {
      mockSupabaseClient.from().insert().mockResolvedValue({
        data: [{ id: 'property-123', platform: testCase.expectedPlatform }],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/property/scrape', {
        method: 'POST',
        body: JSON.stringify({
          url: testCase.url,
          agent_id: 'agent-123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.property.platform).toBe(testCase.expectedPlatform)
    }
  })

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to scrape property')
  })

  it('should handle Supabase authentication errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    })

    const request = new NextRequest('http://localhost:3000/api/property/scrape', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://zillow.com/property/123',
        agent_id: 'agent-123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })
})