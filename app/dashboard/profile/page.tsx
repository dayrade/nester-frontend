'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import Navbar from '@/components/navigation/navbar'
import { 
  User,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  Mail,
  Phone,
  Globe,
  Building,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  full_name: string
  email: string
  phone: string
  bio: string
  website: string
  license_number: string
  brokerage: string
}

export default function ProfilePage() {
  const { user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    license_number: '',
    brokerage: ''
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }
      
      if (userData) {
        setProfileData({
          full_name: userData.full_name || '',
          email: userData.email || user.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          website: userData.website || '',
          license_number: userData.license_number || '',
          brokerage: userData.brokerage || ''
        })
      } else {
        // Set default email from auth user
        setProfileData(prev => ({
          ...prev,
          email: user.email || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user?.id) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: profileData.email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          website: profileData.website,
          license_number: profileData.license_number,
          brokerage: profileData.brokerage,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  License Number
                </label>
                <input
                  type="text"
                  value={profileData.license_number}
                  onChange={(e) => setProfileData(prev => ({ ...prev, license_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your license number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Brokerage
                </label>
                <input
                  type="text"
                  value={profileData.brokerage}
                  onChange={(e) => setProfileData(prev => ({ ...prev, brokerage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your brokerage name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}