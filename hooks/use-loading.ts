'use client'

import { useLoading as useLoadingContext } from '@/contexts/loading-provider'

/**
 * Custom hook for managing loading states
 * 
 * Usage examples:
 * 
 * // Basic usage
 * const { showLoader, hideLoader, isLoading } = useLoading()
 * 
 * // Show loader with custom text
 * showLoader('Loading properties...')
 * 
 * // Hide loader
 * hideLoader()
 * 
 * // Check loading state
 * if (isLoading) {
 *   // Handle loading state
 * }
 * 
 * // Auto-hide loader after async operation
 * const handleAsyncOperation = async () => {
 *   showLoader('Processing...')
 *   try {
 *     await someAsyncOperation()
 *   } finally {
 *     hideLoader()
 *   }
 * }
 */
export const useLoading = () => {
  const context = useLoadingContext()
  
  return {
    ...context,
    /**
     * Wrapper function for async operations with automatic loader management
     * @param asyncFn - The async function to execute
     * @param loadingText - Optional text to display while loading
     */
    withLoading: async <T>(
      asyncFn: () => Promise<T>,
      loadingText?: string
    ): Promise<T> => {
      context.showLoader(loadingText)
      try {
        return await asyncFn()
      } finally {
        context.hideLoader()
      }
    }
  }
}

export default useLoading