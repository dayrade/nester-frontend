import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import DashboardPage from '@/app/dashboard/page'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  formatCurrency: jest.fn((amount: number) => {
    console.log('formatCurrency called with:', amount)
    if (amount === 400000) return '$400,000'
    if (amount === 500000) return '$500,000'
    if (amount === 300000) return '$300,000'
    return `$${amount.toLocaleString()}`
  }),
  formatNumber: jest.fn((num: number) => num.toString()),
  formatRelativeTime: jest.fn((date: string) => '2 hours ago')
}))

// Mock navbar component
jest.mock('@/components/navigation/navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>
  }
})

// Mock dependencies
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn((table: string) => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis()
    }
    
    // Configure different responses based on table
    if (table === 'properties') {
      mockQuery.limit.mockResolvedValue({
        data: mockProperties,
        error: null
      })
    } else if (table === 'social_posts') {
      mockQuery.limit.mockResolvedValue({
        data: mockSocialPosts,
        error: null
      })
    } else if (table === 'social_stats') {
      mockQuery.eq.mockResolvedValue({
        data: [{ impressions: 1000, engagements: 50, clicks: 25, shares: 10 }],
        error: null
      })
    } else if (table === 'chat_sessions') {
      mockQuery.eq.mockResolvedValue({
        data: [{ id: 'session-1', lead_qualification_score: 75, property_id: 'prop-1', properties: mockProperties[0] }],
        error: null
      })
    }
    
    return mockQuery
  })
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

const mockCreateClientComponentClient = createClientComponentClient as jest.MockedFunction<typeof createClientComponentClient>

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

const mockProperties = [
  {
    id: 'prop-1',
    title: 'Beautiful Home',
    price: 500000,
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    listing_status: 'active',
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2023-12-01T10:00:00Z',
    agent_id: 'user-123',
    content_generation_status: 'microsite_completed',
    property_images: [
      { id: 'img-1', image_url: '/property1.jpg', is_primary: true }
    ]
  },
  {
    id: 'prop-2',
    title: 'Cozy Apartment',
    price: 300000,
    address: '456 Oak Ave',
    city: 'Somewhere',
    state: 'NY',
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 900,
    listing_status: 'pending',
    created_at: '2023-12-02T14:30:00Z',
    updated_at: '2023-12-02T14:30:00Z',
    agent_id: 'user-123',
    content_generation_status: 'images_completed',
    property_images: []
  }
]

const mockSocialPosts = [
  {
    id: 'post-1',
    property_id: 'prop-1',
    platform: 'instagram',
    copy_text: 'Check out this amazing property!',
    post_status: 'published',
    created_at: '2023-12-01T12:00:00Z',
    properties: {
      id: 'prop-1',
      address: '123 Main St',
      agent_id: 'user-123'
    }
  }
]

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful authentication
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
  })

  it('should render loading state initially', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should redirect to login if user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should display dashboard content when user is authenticated', async () => {
    // Mock properties query
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockProperties,
      error: null
    })

    // Mock properties count
    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 2,
      error: null
    })

    // Mock social posts query
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockSocialPosts,
      error: null
    })

    // Mock social posts count
    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 1,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Check if user greeting is displayed
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    
    // Check if statistics are displayed
    expect(screen.getByText('Total Properties')).toBeInTheDocument()
    expect(screen.getByText('Social Posts')).toBeInTheDocument()
    expect(screen.getByText('Views')).toBeInTheDocument()
    expect(screen.getByText('Engagement')).toBeInTheDocument()
  })

  it('should display property statistics correctly', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockProperties,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 2,
      error: null
    })

    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockSocialPosts,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 1,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total properties
      expect(screen.getByText('1')).toBeInTheDocument() // Active listings
      expect(screen.getByText('1')).toBeInTheDocument() // Social posts
    })
  })

  it('should display recent properties', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockProperties,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 2,
      error: null
    })

    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockSocialPosts,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 1,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Beautiful Home')).toBeInTheDocument()
      expect(screen.getByText('Cozy Apartment')).toBeInTheDocument()
      // Check for formatted prices
      expect(screen.getByText('$500,000')).toBeInTheDocument()
      expect(screen.getByText('$300,000')).toBeInTheDocument()
    })
  })

  it('should display recent activity', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockProperties,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 2,
      error: null
    })

    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockSocialPosts,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 1,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getAllByText('New Property Added')).toHaveLength(2)
      expect(screen.getByText('Social Post Published')).toBeInTheDocument()
      expect(screen.getByText('Microsite Launched')).toBeInTheDocument()
      expect(screen.getByText('AI Images Generated')).toBeInTheDocument()
    })
  })

  it('should display quick action cards', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: [],
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 0,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Add Property')).toBeInTheDocument()
      expect(screen.getByText('Social Posts')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    })
  })

  it('should handle empty state gracefully', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: [],
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 0,
      error: null
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No properties yet')).toBeInTheDocument()
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockRejectedValue(
      new Error('Database error')
    )

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    // Should still render the dashboard structure even with errors
    expect(screen.getByText('Total Properties')).toBeInTheDocument()
  })

  it('should calculate and display average property price', async () => {
    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: mockProperties,
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 2,
      error: null
    })

    mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
      data: [],
      error: null
    })

    mockSupabaseClient.from().select().eq().count.mockResolvedValue({
      count: 0,
      error: null
    })

    console.log('Starting test...')
    render(<DashboardPage />)

    // Wait for Content Generated to appear first
    await waitFor(() => {
      expect(screen.getByText('Content Generated')).toBeInTheDocument()
    }, { timeout: 5000 })

    console.log('Content Generated found, checking for Portfolio Value...')
    
    // Debug what's actually rendered
    screen.debug()

    // Try to find Portfolio Value with a longer timeout
    try {
      await waitFor(() => {
        expect(screen.getByText('Portfolio Value')).toBeInTheDocument()
      }, { timeout: 10000 })
    } catch (error) {
      console.log('Portfolio Value not found, current DOM:')
      screen.debug()
      throw error
    }

    await waitFor(() => {
      // Check Portfolio Value card title and description
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument()
      expect(screen.getByText('Average property price')).toBeInTheDocument()
      
      // Average of $500,000 and $300,000 = $400,000
      expect(screen.getByText('$400,000')).toBeInTheDocument()
      
      // Check content generated count (both properties have content_generation_status)
      expect(screen.getByText('Content Generated')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Content Generated count
      
      // Check microsites live count (only prop-1 has 'microsite_completed')
      expect(screen.getByText('1 microsites live')).toBeInTheDocument()
    })
  })
})