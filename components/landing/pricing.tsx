'use client'

import { Check, Star, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

interface PricingProps {
  className?: string
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

export function Pricing({ className = '' }: PricingProps) {
  return (
    <section className={`py-24 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent
            <span className="text-primary"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your real estate business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div 
                key={index}
                className={`relative rounded-2xl border-2 p-8 bg-white transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-primary/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/auth/login'}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
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