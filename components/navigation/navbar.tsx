'use client'

import { useState } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { 
  Home, 
  Plus, 
  BarChart3, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Building,
  Share2,
  MessageSquare,
  Target,
  Users
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  className?: string
}

export default function Navbar({ className = '' }: NavbarProps) {
  const { user, signOut } = useSupabase()
  const { brandAssets } = useBrand()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard'
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: Building,
      current: pathname.startsWith('/dashboard/properties')
    },
    {
      name: 'Leads',
      href: '/dashboard/leads',
      icon: Users,
      current: pathname.startsWith('/dashboard/leads')
    },
    {
      name: 'Campaigns',
      href: '/dashboard/campaigns',
      icon: Target,
      current: pathname.startsWith('/dashboard/campaigns')
    },
    {
      name: 'Social Posts',
      href: '/dashboard/social',
      icon: Share2,
      current: pathname.startsWith('/dashboard/social')
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/dashboard/analytics')
    },
    {
      name: 'AI Assistant',
      href: '/dashboard/assistant',
      icon: MessageSquare,
      current: pathname.startsWith('/dashboard/assistant')
    }
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  if (!user) {
    return null
  }

  return (
    <nav className={`bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              {brandAssets?.logo && (
                <Image
                  src={brandAssets.logo}
                  alt={brandAssets.companyName || 'Logo'}
                  width={32}
                  height={32}
                  className="h-7 w-auto sm:h-8"
                />
              )}
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {brandAssets?.companyName || 'Nester'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/property/add"
              className="btn btn-primary btn-sm text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Property</span>
              <span className="sm:hidden">Add</span>
            </Link>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-44 sm:w-52">
                <li className="menu-title">
                  <span className="text-xs sm:text-sm">{user.email}</span>
                </li>
                <li>
                  <Link href="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="flex items-center space-x-2">
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Settings</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-sm p-1.5 sm:p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-1 sm:space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-medium text-sm sm:text-base">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile User Actions */}
            <div className="pt-3 sm:pt-4 border-t border-gray-200 space-y-1 sm:space-y-2">
              <Link
                href="/property/add"
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">Add Property</span>
              </Link>
              
              <Link
                href="/dashboard/profile"
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">Profile</span>
              </Link>
              
              <Link
                href="/dashboard/settings"
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">Settings</span>
              </Link>
              
              <button
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}