'use client'

import { 
  Zap, 
  Brain, 
  Share2, 
  BarChart3, 
  Globe, 
  FileText,
  Image,
  MessageSquare,
  Users,
  Shield,
  Clock,
  Target
} from 'lucide-react'

interface FeatureProps {
  className?: string
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Content Generation',
    description: 'Generate compelling property descriptions, social media posts, and marketing materials with advanced AI technology.'
  },
  {
    icon: Share2,
    title: 'Automated Social Media',
    description: 'Schedule and publish property listings across multiple social media platforms automatically.'
  },
  {
    icon: Image,
    title: 'AI Image Enhancement',
    description: 'Enhance property photos with AI-powered editing and generate virtual staging images.'
  },
  {
    icon: FileText,
    title: 'Smart Brochures',
    description: 'Create professional property brochures and flyers with customizable templates.'
  },
  {
    icon: Globe,
    title: 'Live Microsites',
    description: 'Generate dedicated microsites for each property with interactive features and lead capture.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track performance metrics, lead generation, and ROI across all your marketing campaigns.'
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Get instant help with property questions, market insights, and marketing strategies.'
  },
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Capture, track, and nurture leads with intelligent CRM integration and automated follow-ups.'
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with full compliance to real estate industry standards.'
  }
]

export function Features({ className = '' }: FeatureProps) {
  return (
    <section className={`py-24 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-primary"> Dominate Real Estate</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful AI tools designed specifically for real estate professionals to automate marketing, 
            generate leads, and close more deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group p-6 rounded-xl border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Setup in minutes, not hours</span>
            <span className="mx-2">•</span>
            <Target className="h-4 w-4" />
            <span>Proven to increase leads by 300%</span>
          </div>
        </div>
      </div>
    </section>
  )
}