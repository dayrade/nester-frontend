'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBrand } from '@/lib/providers/brand-provider'
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { brandAssets } = useBrand()

  const error = searchParams.get('error')
  const description = searchParams.get('description')
  const [isRetrying, setIsRetrying] = useState(false)

  // Error message mapping
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'access_denied':
        return {
          title: 'Access Denied',
          message: 'You denied access to your account. Please try again if this was a mistake.',
          suggestion: 'Try signing in again and allow access when prompted.'
        }
      case 'server_error':
        return {
          title: 'Server Error',
          message: 'We encountered a server error while processing your request.',
          suggestion: 'Please try again in a few moments. If the problem persists, contact support.'
        }
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          message: 'The authentication request was invalid or malformed.',
          suggestion: 'Please start the sign-in process again.'
        }
      case 'exchange_failed':
        return {
          title: 'Authentication Failed',
          message: 'Failed to complete the authentication process.',
          suggestion: 'Please try signing in again. Check your email for any confirmation links.'
        }
      case 'unexpected_error':
        return {
          title: 'Unexpected Error',
          message: 'An unexpected error occurred during authentication.',
          suggestion: 'Please try again or contact support if the issue persists.'
        }
      default:
        return {
          title: 'Authentication Error',
          message: description || 'An error occurred during the authentication process.',
          suggestion: 'Please try signing in again.'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      router.push('/auth/login')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          {brandAssets?.logo && (
            <Image
              src={brandAssets.logo}
              alt={brandAssets.companyName || 'Logo'}
              width={80}
              height={80}
              className="h-20 w-auto mx-auto mb-4"
            />
          )}
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600">
            Something went wrong during authentication
          </p>
        </div>

        {/* Error Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            {/* Error Message */}
            <div className="alert alert-error mb-6">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h3 className="font-bold">Error Details</h3>
                <div className="text-sm">
                  {errorInfo.message}
                </div>
              </div>
            </div>

            {/* Error Code */}
            {error && (
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <div className="text-xs text-gray-600 mb-1">Error Code:</div>
                <div className="font-mono text-sm text-gray-800">{error}</div>
              </div>
            )}

            {/* Suggestion */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">What you can do:</h4>
              <p className="text-sm text-blue-700">
                {errorInfo.suggestion}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="btn btn-primary w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </button>
              
              <Link href="/" className="btn btn-ghost w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <div className="card bg-gray-50 border border-gray-200">
            <div className="card-body py-4">
              <h4 className="font-semibold text-gray-900 mb-2">Still having trouble?</h4>
              <p className="text-sm text-gray-700 mb-3">
                If you continue to experience issues, please contact our support team.
              </p>
              <div className="space-y-2">
                <Link href="/contact" className="btn btn-outline btn-sm">
                  Contact Support
                </Link>
                <div className="text-xs text-gray-600">
                  Include the error code above when contacting support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Need help? Visit our{' '}
            <Link href="/help" className="link link-primary">
              Help Center
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="link link-primary">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}