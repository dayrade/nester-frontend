'use client'

import { useState } from 'react'
import { Search, MapPin, Home, Users, TrendingUp, ArrowRight, Play } from 'lucide-react'

interface HeroProps {
  onSearch?: (query: string, location: string) => void
  className?: string
}

function Hero({ onSearch, className = "" }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery, location)
  }

  const stats = [
    { icon: Home, label: 'Properties Listed', value: '10,000+' },
    { icon: Users, label: 'Happy Clients', value: '5,000+' },
    { icon: TrendingUp, label: 'Avg. Sale Price', value: '$450K' },
  ]

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-16">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Market Leader in Real Estate</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Your
                <span className="text-primary block">Dream Home</span>
                Today
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Discover the perfect property with our AI-powered search and expert guidance. 
                From cozy apartments to luxury estates, we make home buying effortless.
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">What are you looking for?</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="House, Apartment, Condo..."
                      className="input input-bordered w-full pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Location</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State, ZIP"
                      className="input input-bordered w-full pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="form-control flex justify-end">
                  <label className="label">
                    <span className="label-text opacity-0">Search</span>
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-outline btn-sm">
                Buy a Home
                <ArrowRight className="h-3 w-3" />
              </button>
              <button className="btn btn-outline btn-sm">
                Sell Property
                <ArrowRight className="h-3 w-3" />
              </button>
              <button className="btn btn-outline btn-sm">
                Rent Property
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 h-[600px] flex items-center justify-center">
                <div className="text-center space-y-6">
                  {/* Property Cards Stack */}
                  <div className="relative">
                    {/* Card 1 */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl mb-4" />
                      <h3 className="font-semibold text-gray-900">Modern Villa</h3>
                      <p className="text-gray-600 text-sm">$750,000</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>4 bed • 3 bath</span>
                        <span>2,500 sq ft</span>
                      </div>
                    </div>
                    
                    {/* Card 2 */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300 w-64">
                      <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-4" />
                      <h3 className="font-semibold text-gray-900">Downtown Condo</h3>
                      <p className="text-gray-600 text-sm">$425,000</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>2 bed • 2 bath</span>
                        <span>1,200 sq ft</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Play Button */}
                  <div className="mt-12">
                    <button className="btn btn-circle btn-lg bg-white/90 hover:bg-white border-0 shadow-xl">
                      <Play className="h-6 w-6 text-primary ml-1" />
                    </button>
                    <p className="text-sm text-gray-600 mt-3">Watch our virtual tours</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-primary text-white p-3 rounded-xl shadow-lg animate-bounce">
                <div className="text-sm font-semibold">New</div>
                <div className="text-xs opacity-90">Listing</div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-secondary text-white p-3 rounded-xl shadow-lg">
                <div className="text-sm font-semibold">$450K</div>
                <div className="text-xs opacity-90">Avg Price</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48C0 16.48 138.72 0 300 0s300 16.48 300 16.48S738.72 0 900 0s300 16.48 300 16.48V120z" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default Hero
export { Hero }