import { render, screen, waitFor } from '@testing-library/react'
import { useSupabase, SupabaseProvider } from '@/lib/providers/supabase-provider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(() => Promise.resolve({
      data: { session: null },
      error: null
    })),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  }))
}

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => mockSupabaseClient)
}))

// Test component that uses the hook
function TestComponent() {
  const { user, loading, supabase, signIn, signUp, signOut, resetPassword } = useSupabase()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? `User: ${user.email}` : 'No User'}</div>
      <div data-testid="supabase">{supabase ? 'Supabase Client Available' : 'No Supabase Client'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
    </div>
  )
}

describe('SupabaseProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide supabase client and auth functions', () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    expect(screen.getByTestId('supabase')).toHaveTextContent('Supabase Client Available')
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('should show no user initially', () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })

  it('should call signInWithPassword when signIn is called', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null
    })

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should call signUp when signUp is called', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null
    })

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    signUpButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback')
        }
      })
    })
  })

  it('should call signOut when signOut is called', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should call resetPasswordForEmail when resetPassword is called', async () => {
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    const resetPasswordButton = screen.getByText('Reset Password')
    resetPasswordButton.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: expect.stringContaining('/auth/reset-password') }
      )
    })
  })

  it('should throw error when useSupabase is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSupabase must be used inside SupabaseProvider')
    
    consoleSpy.mockRestore()
  })

  it('should set up auth state change listener', () => {
    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    )

    expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
  })
})