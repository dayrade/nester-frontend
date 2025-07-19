'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase-provider'

interface UseAuthGuardOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo = '/auth/login', requireAuth = true } = options
  const { user, loading, session } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Don't do anything while loading

    if (requireAuth && !user) {
      // User is not authenticated but auth is required
      // Include current path as redirect parameter
      const currentPath = window.location.pathname
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
    } else if (!requireAuth && user) {
      // User is authenticated but shouldn't be (e.g., on login page)
      router.push('/dashboard')
    }
  }, [user, loading, requireAuth, redirectTo, router])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isLoading: loading
  }
}

// Convenience hooks for common use cases
export function useRequireAuth(redirectTo?: string) {
  return useAuthGuard({ requireAuth: true, redirectTo })
}

export function useRequireGuest(redirectTo?: string) {
  return useAuthGuard({ requireAuth: false, redirectTo })
}