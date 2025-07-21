'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBrand } from '@/lib/providers/brand-provider'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { brandAssets } = useBrand()
  const { supabase } = useSupabase()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [loading, setLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')

  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'signup'

  // Verify email on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. Please check your email for the correct link.')
        setLoading(false)
        return
      }

      try {
        // Simulate verification process with the token
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // In a real implementation, you would verify the token with your backend
        const response = await fetch('http://localhost:3002/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, email, type })
        })

        if (response.ok) {
          setStatus('success')
          setMessage('Your email has been successfully verified!')
          
          // Auto-redirect after successful verification
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          const errorData = await response.json()
          setStatus('error')
          setMessage(errorData.message || 'Verification failed. Please try again.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Network error. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token, email, type, router])

  // Resend verification email
  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return
    
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(`Failed to resend email: ${error.message}`)
      } else {
        setMessage('Verification email sent! Please check your inbox.')
        // Start cooldown
        setResendCooldown(60)
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again later.')
    } finally {
      setResendLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
        return <AlertCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'from-blue-50 to-indigo-100'
      case 'success':
        return 'from-green-50 to-emerald-100'
      case 'error':
      case 'expired':
        return 'from-red-50 to-orange-100'
      default:
        return 'from-gray-50 to-slate-100'
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...'
      case 'success':
        return 'Email Verified Successfully!'
      case 'error':
        return 'Verification Failed'
      case 'expired':
        return 'Verification Link Expired'
      default:
        return 'Email Verification'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getStatusColor()} flex items-center justify-center p-4`}>
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
            {getStatusIcon()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getStatusTitle()}
          </h1>
          <p className="text-gray-600">
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'You can now sign in to your account'}
            {status === 'error' && 'There was a problem verifying your email'}
            {status === 'expired' && 'Your verification link has expired'}
          </p>
        </div>

        {/* Status Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            {/* Status Message */}
            <div className={`alert ${
              status === 'success' ? 'alert-success' :
              status === 'error' || status === 'expired' ? 'alert-error' :
              'alert-info'
            } mb-6`}>
              <div className="flex items-center">
                {status === 'verifying' && <RefreshCw className="h-5 w-5 animate-spin mr-2" />}
                {status === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                {(status === 'error' || status === 'expired') && <AlertCircle className="h-5 w-5 mr-2" />}
                <div>
                  <h3 className="font-bold">
                    {status === 'verifying' && 'Verification in Progress'}
                    {status === 'success' && 'Verification Complete'}
                    {status === 'error' && 'Verification Failed'}
                    {status === 'expired' && 'Link Expired'}
                  </h3>
                  <div className="text-sm">
                    {message || (
                      status === 'verifying' ? 'Processing your verification request...' :
                      status === 'success' ? 'Your email has been successfully verified!' :
                      'Please try again or contact support if the issue persists.'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Display */}
            {email && (
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <div className="text-xs text-gray-600 mb-1">Email Address:</div>
                <div className="font-mono text-sm text-gray-800">{email}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === 'success' && (
                <Link href="/auth/login?verified=true" className="btn btn-primary w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to Sign In
                </Link>
              )}
              
              {(status === 'error' || status === 'expired') && email && (
                <button 
                  onClick={handleResendEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="btn btn-primary w-full"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              )}
              
              <Link href="/auth/login" className="btn btn-ghost w-full">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="card-body py-4">
              <h4 className="font-semibold text-blue-900 mb-2">Need help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If you're having trouble with email verification, our support team is here to help.
              </p>
              <div className="space-y-2">
                <Link href="/contact" className="btn btn-outline btn-sm btn-primary">
                  Contact Support
                </Link>
                <div className="text-xs text-blue-600">
                  Include your email address when contacting support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Having trouble? Visit our{' '}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="loading loading-spinner loading-lg"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}