'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Database, User } from '@/types/supabase'
import type { Session } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: ReturnType<typeof createClientComponentClient<Database>>
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
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user as User || null)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user as User || null)
        setLoading(false)
        
        if (event === 'SIGNED_IN') {
          // Create user record if it doesn't exist
          if (session?.user) {
            const { error } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email!,
                role: 'agent'
              })
            
            if (error) {
              console.error('Error creating user record:', error)
            }
          }
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          router.push('/')
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      // First authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) return { error }
      
      // Then notify our Express server
      if (data.session) {
        try {
          await fetch('http://localhost:3002/api/auth/signin', {
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
          await fetch('http://localhost:3002/api/auth/signup', {
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
      // First sign out from Supabase
      await supabase.auth.signOut()
      
      // Then notify our Express server
      try {
        await fetch('http://localhost:3002/api/auth/logout', {
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