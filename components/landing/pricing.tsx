'use client'

import { useState } from 'react'
import { Check, Star, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

interface PricingProps {
  className?: string
  onPlanSelect?: (plan: string) => void
}

const plans = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for new agents getting started',
    icon: Star,
    features: [
      'Up to 5 properties',
      'Basic AI content generation',
      '10 social media posts/month',
      'Standard property brochures',
      'Email support',
      'Basic analytics'
    ],
    popular: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'For established agents and small teams',
    icon: Zap,
    features: [
      'Up to 25 properties',
      'Advanced AI content generation',
      'Unlimited social media posts',
      'Premium brochure templates',
      'Live microsites for all properties',
      'AI image enhancement',
      'Priority support',
      'Advanced analytics & reporting',
      'Lead capture & management',
      'Custom branding'
    ],
    popular: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For large teams and brokerages',
    icon: Crown,
    features: [
      'Unlimited properties',
      'White-label solution',
      'Custom AI training',
      'Multi-user collaboration',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reporting',
      'Advanced lead scoring',
      'Team performance analytics',
      'Priority phone support',
      'Custom onboarding'
    ],
    popular: false,
    cta: 'Contact Sales'
  }
]

export function Pricing({ className = '', onPlanSelect }: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    onPlanSelect?.(planName)
  }

  const getPrice = (basePrice: number) => {
    return billingPeriod === 'yearly' ? Math.round(basePrice * 0.8) : basePrice
  }

  return (
    <section className={`py-16 sm:py-20 lg:py-24 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent
            <span className="text-primary"> Pricing</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Choose the perfect plan for your real estate business. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  20% off
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div 
                key={index}
                className={`relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 lg:p-8 bg-white transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  selectedPlan === plan.name
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : plan.popular 
                    ? 'border-primary shadow-lg md:scale-105' 
                    : 'border-gray-200 hover:border-primary/20'
                }`}
                onClick={() => handlePlanSelect(plan.name)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ${
                    plan.popular ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">${getPrice(plan.price)}</span>
                    <span className="text-sm sm:text-base text-gray-600 ml-1">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-center mt-2">
                      <span className="text-xs sm:text-sm text-gray-500 line-through">${plan.price}/month</span>
                      <span className="text-xs sm:text-sm text-green-600 ml-2 font-medium">Save 20%</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 sm:space-y-3">
                  {selectedPlan === plan.name && (
                    <div className="text-center text-xs sm:text-sm text-green-600 font-medium">
                      ✓ Plan Selected
                    </div>
                  )}
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/auth/login'}
                    className={`w-full block text-center py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      selectedPlan === plan.name
                        ? 'bg-primary text-white hover:bg-primary/90 ring-2 ring-primary/20'
                        : plan.popular
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlanSelect(plan.name)
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ No setup fees</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  )
}