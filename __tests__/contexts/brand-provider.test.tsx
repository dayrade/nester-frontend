import { render, screen, waitFor } from '@testing-library/react'
import { useBrand, BrandProvider } from '@/lib/providers/brand-provider'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { BrandAssets } from '@/types/supabase'

// Mock the useSupabase hook
const mockSupabaseClient = {
  from: jest.fn()
}

const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

jest.mock('@/lib/providers/supabase-provider', () => ({
  useSupabase: jest.fn()
}))

const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>

// Test component that uses the brand hook
function TestComponent() {
  const { brandAssets, loading, refreshBrand, updateBrand } = useBrand()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="brand-mode">{brandAssets?.mode || 'No Brand'}</div>
      <div data-testid="company-name">{brandAssets?.companyName || 'No Company'}</div>
      <div data-testid="primary-color">{brandAssets?.primaryColor || 'No Color'}</div>
      <button onClick={refreshBrand}>Refresh Brand</button>
      <button onClick={() => updateBrand({ company_name: 'Updated Company' })}>Update Brand</button>
    </div>
  )
}

describe('BrandProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset the mock implementation
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows returned' } })
    })
    
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      supabase: mockSupabaseClient,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn()
    })
  })

  it('should provide default Nester brand assets when no user', () => {
    mockUseSupabase.mockReturnValue({
      user: null,
      supabase: mockSupabaseClient,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn()
    })

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    expect(screen.getByTestId('brand-mode')).toHaveTextContent('nester_default')
    expect(screen.getByTestId('company-name')).toHaveTextContent('Nester')
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#2563eb')
  })

  it('should show loading state initially when user exists', () => {
    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('should load custom brand assets for authenticated user', async () => {
    const mockBrandData = {
      id: 'brand-123',
      agent_id: 'user-123',
      company_name: 'Custom Realty',
      logo_storage_path: '/custom-logo.png',
      primary_color: '#ff0000',
      secondary_color: '#00ff00',
      font_family: 'Arial',
      persona_tone: 'Professional',
      persona_style: 'Friendly',
      persona_key_phrases: ['Welcome home'],
      persona_phrases_to_avoid: ['expensive'],
      nester_logo_path: '/assets/nester-logo.svg',
      nester_primary_color: '#2563eb',
      nester_secondary_color: '#64748b',
      nester_font_family: 'Inter',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockBrandData,
      error: null
    })

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('brand-mode')).toHaveTextContent('white_label')
    expect(screen.getByTestId('company-name')).toHaveTextContent('Custom Realty')
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#ff0000')
  })

  it('should fall back to default brand when no custom brand found', async () => {
    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'No rows returned' }
    })

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('brand-mode')).toHaveTextContent('nester_default')
    expect(screen.getByTestId('company-name')).toHaveTextContent('Nester')
  })

  it('should refresh brand assets when refreshBrand is called', async () => {
    const mockBrandData = {
      id: 'brand-123',
      agent_id: 'user-123',
      company_name: 'Refreshed Realty',
      logo_storage_path: '/refreshed-logo.png',
      primary_color: '#0000ff',
      secondary_color: '#ffff00',
      font_family: 'Times',
      persona_tone: 'Professional',
      persona_style: 'Refreshed',
      persona_key_phrases: ['Your new home awaits'],
      persona_phrases_to_avoid: ['costly'],
      nester_logo_path: '/assets/nester-logo.svg',
      nester_primary_color: '#2563eb',
      nester_secondary_color: '#64748b',
      nester_font_family: 'Inter',
      created_at: '2023-01-01',
      updated_at: '2023-01-02'
    }

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockBrandData,
      error: null
    })

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    const refreshButton = screen.getByText('Refresh Brand')
    refreshButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Refreshed Realty')
    })
  })

  it('should update brand assets when updateBrand is called', async () => {
    const initialBrandData = {
      id: 'brand-123',
      agent_id: 'user-123',
      company_name: 'Original Realty',
      logo_storage_path: '/original-logo.png',
      primary_color: '#ff0000',
      secondary_color: '#00ff00',
      font_family: 'Arial',
      persona_tone: 'Professional',
      persona_style: 'Friendly',
      persona_key_phrases: ['Welcome home'],
      persona_phrases_to_avoid: ['expensive'],
      nester_logo_path: '/assets/nester-logo.svg',
      nester_primary_color: '#2563eb',
      nester_secondary_color: '#64748b',
      nester_font_family: 'Inter',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }

    const updatedBrandData = {
      ...initialBrandData,
      company_name: 'Updated Company',
      updated_at: '2023-01-02'
    }

    const mockSingle = jest.fn()
      .mockResolvedValueOnce({ data: initialBrandData, error: null })
      .mockResolvedValueOnce({ data: updatedBrandData, error: null })

    const mockUpsert = jest.fn().mockResolvedValue({
      data: updatedBrandData,
      error: null
    })
    
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockSingle,
      upsert: mockUpsert
    })

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    expect(screen.getByTestId('company-name')).toHaveTextContent('Original Realty')

    const updateButton = screen.getByText('Update Brand')
    updateButton.click()

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          agent_id: 'user-123',
          company_name: 'Updated Company'
        })
      )
    })
  })

  it('should throw error when useBrand is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useBrand must be used inside BrandProvider')
    
    consoleSpy.mockRestore()
  })

  it('should handle errors gracefully when loading brand assets', async () => {
    mockSupabaseClient.from().select().eq().single.mockRejectedValue(
      new Error('Database error')
    )

    render(
      <BrandProvider>
        <TestComponent />
      </BrandProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Should fall back to default brand
    expect(screen.getByTestId('brand-mode')).toHaveTextContent('nester_default')
  })
})