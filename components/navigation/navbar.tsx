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
    <nav className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              {brandAssets?.logo && (
                <Image
                  src={brandAssets.logo}
                  alt={brandAssets.companyName || 'Logo'}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              )}
              <span className="text-xl font-bold text-gray-900">
                {brandAssets?.companyName || 'Nester'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/property/add"
              className="btn btn-primary btn-sm"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </Link>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li className="menu-title">
                  <span>{user.email}</span>
                </li>
                <li>
                  <Link href="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-sm"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="border-t px-2 pt-4 pb-3">
            <div className="flex items-center px-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Link
                href="/property/add"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-5 w-5" />
                <span>Add Property</span>
              </Link>
              
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}