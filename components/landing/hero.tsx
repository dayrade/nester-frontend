'use client'

import { useState } from 'react'
import { Search, MapPin, Home, Users, TrendingUp, ArrowRight, Play } from 'lucide-react'

// Add CSS animations
const styles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

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
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 ${className}`}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh] py-12 sm:py-16">
          
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-4 lg:space-y-6">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Market Leader in Real Estate</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Find Your</span>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block animate-pulse">Dream Home</span>
                <span className="text-gray-900">Today</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Discover the perfect property with our <span className="font-semibold text-blue-600">AI-powered search</span> and expert guidance. 
                From cozy apartments to luxury estates, we make home buying effortless.
              </p>
            </div>

            {/* Enhanced Search Form */}
            <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">
                    What are you looking for?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="House, Apartment, Condo..."
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                    />
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State, ZIP"
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-sm sm:text-base"
                    />
                    <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Search Properties</span>
                    <span className="sm:hidden">Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Enhanced Quick Actions */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4">
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="hidden sm:inline">Buy a Home</span>
                <span className="sm:hidden">Buy</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="hidden sm:inline">Sell Property</span>
                <span className="sm:hidden">Sell</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="hidden sm:inline">Rent Property</span>
                <span className="sm:hidden">Rent</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-100">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:transform hover:-translate-y-1">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                      index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className={`text-lg sm:text-2xl font-bold bg-clip-text text-transparent ${
                    index === 0 ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                    index === 1 ? 'bg-gradient-to-r from-green-600 to-green-700' :
                    'bg-gradient-to-r from-purple-600 to-purple-700'
                  }`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{stat.label}</div>
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