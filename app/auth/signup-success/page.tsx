'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBrand } from '@/lib/providers/brand-provider'
import { CheckCircle, Mail, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function SignupSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { brandAssets } = useBrand()
  const [countdown, setCountdown] = useState(10)

  const email = searchParams.get('email')

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/auth/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
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
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-gray-600">
            Welcome to Nester! Your account has been created.
          </p>
        </div>

        {/* Success Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body text-center">
            {/* Success Message */}
            <div className="alert alert-success mb-6">
              <Mail className="h-5 w-5" />
              <div>
                <h3 className="font-bold">Check your email!</h3>
                <div className="text-xs">
                  We've sent a confirmation link to {email || 'your email address'}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-6">
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Next steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                  <li>Return here to sign in to your account</li>
                  <li>Start creating amazing property content!</li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/auth/login" className="btn btn-primary w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Sign In
              </Link>
              
              <Link href="/" className="btn btn-ghost w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-xs text-gray-500 mt-4">
              Automatically redirecting to sign in page in {countdown} seconds...
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="card-body py-4">
              <h4 className="font-semibold text-blue-900 mb-2">Need help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Didn't receive the confirmation email?
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-outline btn-sm btn-primary"
                >
                  Resend confirmation email
                </button>
                <div className="text-xs text-blue-600">
                  Or contact our support team if you continue having issues
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            By using Nester, you agree to our{' '}
            <Link href="/terms" className="link link-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="link link-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center"><div className="loading loading-spinner loading-lg"></div></div>}>
      <SignupSuccessContent />
    </Suspense>
  )
}