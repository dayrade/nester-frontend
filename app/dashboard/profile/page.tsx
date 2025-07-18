'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import Navbar from '@/components/navigation/navbar'
import Image from 'next/image'
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
  FileText,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Home,
  Users,
  DollarSign,
  Activity,
  Edit3,
  Upload
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
  avatar_url?: string
  location?: string
  years_experience?: number
  specialties?: string[]
}

interface ProfileStats {
  total_properties: number
  active_listings: number
  total_value: number
  social_posts: number
  profile_views: number
  leads_generated: number
}

interface RecentActivity {
  id: string
  type: 'property_added' | 'content_generated' | 'lead_received' | 'profile_updated'
  description: string
  timestamp: string
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
    brokerage: '',
    avatar_url: '',
    location: '',
    years_experience: 0,
    specialties: []
  })
  
  const [stats, setStats] = useState<ProfileStats>({
    total_properties: 0,
    active_listings: 0,
    total_value: 0,
    social_posts: 0,
    profile_views: 0,
    leads_generated: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
          brokerage: userData.brokerage || '',
          avatar_url: userData.avatar_url || '',
          location: userData.location || '',
          years_experience: userData.years_experience || 0,
          specialties: userData.specialties || []
        })
      } else {
        // Set default email from auth user
        setProfileData(prev => ({
          ...prev,
          email: user.email || ''
        }))
      }
      
      // Fetch profile statistics
      await fetchProfileStats()
      
      // Fetch recent activity
      await fetchRecentActivity()
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      setMessage({ type: 'error', text: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchProfileStats = async () => {
    if (!user?.id) return
    
    try {
      // Fetch properties count and total value
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('price, listing_status')
        .eq('user_id', user.id)
      
      if (propError) throw propError
      
      const totalProperties = properties?.length || 0
      const activeListings = properties?.filter(p => p.listing_status === 'active').length || 0
      const totalValue = properties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
      
      // Fetch social posts count
      const { data: posts, error: postsError } = await supabase
        .from('social_posts')
        .select('id')
        .eq('user_id', user.id)
      
      if (postsError) throw postsError
      
      setStats({
        total_properties: totalProperties,
        active_listings: activeListings,
        total_value: totalValue,
        social_posts: posts?.length || 0,
        profile_views: Math.floor(Math.random() * 500) + 100, // Mock data
        leads_generated: Math.floor(Math.random() * 50) + 10 // Mock data
      })
    } catch (error) {
      console.error('Error fetching profile stats:', error)
    }
  }
  
  const fetchRecentActivity = async () => {
    if (!user?.id) return
    
    try {
      // Mock recent activity data
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'property_added',
          description: 'Added new property listing',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'content_generated',
          description: 'Generated social media content',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'lead_received',
          description: 'Received new lead inquiry',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
    
    try {
      setUploadingAvatar(true)
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)
      
      // Update profile with new avatar URL
      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }))
      setIsEditingAvatar(false)
      
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setUploadingAvatar(false)
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property_added': return <Home className="h-4 w-4" />
      case 'content_generated': return <Edit3 className="h-4 w-4" />
      case 'lead_received': return <Users className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
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
          avatar_url: profileData.avatar_url,
          location: profileData.location,
          years_experience: profileData.years_experience,
          specialties: profileData.specialties,
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

  const addSpecialty = (specialty: string) => {
    if (specialty && !profileData.specialties?.includes(specialty)) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty]
      }))
    }
  }

  const removeSpecialty = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty) || []
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and track your performance</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profileData.avatar_url ? (
                        <Image
                          src={profileData.avatar_url}
                          alt="Profile avatar"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditingAvatar(true)}
                      className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData.full_name || 'Your Name'}
                    </h2>
                    <p className="text-gray-600">{profileData.email}</p>
                    {profileData.brokerage && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {profileData.brokerage}
                      </p>
                    )}
                    {profileData.location && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profileData.location}
                      </p>
                    )}
                    {profileData.years_experience && profileData.years_experience > 0 && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {profileData.years_experience} years experience
                      </p>
                    )}
                  </div>
                </div>
                
                {profileData.bio && (
                  <div className="mt-6">
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                )}
                
                {profileData.specialties && profileData.specialties.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {profileData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Home className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_properties}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_listings}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_value)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
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
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="City, State"
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
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profileData.years_experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="0"
                      min="0"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Performance
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Social Posts</span>
                  <span className="font-semibold">{stats.social_posts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold">{stats.profile_views}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Leads Generated</span>
                  <span className="font-semibold">{stats.leads_generated}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Upload Modal */}
        {isEditingAvatar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile Picture</h3>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profileData.avatar_url ? (
                      <Image
                        src={profileData.avatar_url}
                        alt="Profile avatar"
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose new picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="btn btn-outline"
                  disabled={uploadingAvatar}
                >
                  Cancel
                </button>
                {uploadingAvatar && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}