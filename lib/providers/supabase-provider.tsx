'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import type { Database, User } from '@/types/supabase'
import type { Session } from '@supabase/supabase-js'
import { preloadSession } from '@/lib/api-client'

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient<Database>>
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user as User || null)
        
        // Cache session in localStorage if available
        if (session) {
          try {
            localStorage.setItem('nester_session_cache', JSON.stringify({
              session,
              timestamp: Date.now(),
              expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
            }))
          } catch (err) {
            console.warn('Failed to cache session:', err)
          }
        }
        
        // Preload session for API client to avoid delays on first API call
        preloadSession()
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user as User || null)
        setLoading(false)

        // Handle sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, creating/updating user record...')
          
          try {
            // Cache session in localStorage
            localStorage.setItem('nester_session_cache', JSON.stringify({
              session,
              timestamp: Date.now(),
              expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
            }))
            
            // Preload session for API client
            preloadSession()
            
            // Upsert user record
            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email!,
                updated_at: new Date().toISOString()
              })

            if (upsertError) {
              console.error('Error upserting user:', upsertError)
            } else {
              console.log('User record updated successfully')
            }

            // Notify Express server about the sign-in
            try {
              const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  user: session.user,
                  session: session
                })
              })

              if (!response.ok) {
                console.warn('Failed to notify Express server about sign-in')
              }
            } catch (err) {
              console.warn('Error notifying Express server:', err)
            }
          } catch (err) {
            console.error('Error in sign-in handler:', err)
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          try {
            localStorage.removeItem('nester_session_cache')
          } catch (err) {
            console.warn('Failed to clear session cache:', err)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      // First authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) return { error }
      
      // Cache the session immediately for faster subsequent requests
      if (data.session) {
        try {
          const cached = {
            session: data.session,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
          }
          localStorage.setItem('nester_session_cache', JSON.stringify(cached))
          console.log('✅ Session cached on login')
        } catch (storageError) {
          console.warn('Failed to cache session on login:', storageError)
        }
      }
      
      // Then notify our Express server
      if (data.session) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email
            })
          })
        } catch (serverError) {
          console.warn('Express server notification failed:', serverError)
          // Don't fail the auth flow for server communication issues
        }
      }
      
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      // First register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) return { error }
      
      // Then notify our Express server
      if (data.user) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email
            })
          })
        } catch (serverError) {
          console.warn('Express server notification failed:', serverError)
          // Don't fail the auth flow for server communication issues
        }
      }
      
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      // Clear session cache from localStorage
      try {
        localStorage.removeItem('nester_session_cache')
      } catch (storageError) {
        console.warn('Failed to clear session cache:', storageError)
      }
      
      // First sign out from Supabase
      await supabase.auth.signOut()
      
      // Then notify our Express server
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Include cookies
        })
      } catch (serverError) {
        console.warn('Express server logout notification failed:', serverError)
        // Don't fail the auth flow for server communication issues
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const value = {
    supabase,
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}