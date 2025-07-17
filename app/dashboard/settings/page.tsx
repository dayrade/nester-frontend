'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import Navbar from '@/components/navigation/navbar'
import { 
  User,
  Palette,
  Bell,
  Shield,
  Upload,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Camera,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AgentBrand } from '@/types/supabase'

interface ProfileData {
  full_name: string
  email: string
  phone: string
  bio: string
  website: string
  license_number: string
  brokerage: string
}

interface BrandData {
  company_name: string
  logo_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  ai_persona: string
  brand_voice: string
  target_audience: string
  specialties: string[]
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  property_alerts: boolean
  social_media_alerts: boolean
  content_generation_alerts: boolean
}

export default function SettingsPage() {
  const { user } = useSupabase()
  const { brandAssets, refreshBrand } = useBrand()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    website: '',
    license_number: '',
    brokerage: ''
  })
  
  const [brandData, setBrandData] = useState<BrandData>({
    company_name: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    font_family: 'Inter',
    ai_persona: '',
    brand_voice: '',
    target_audience: '',
    specialties: []
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    property_alerts: true,
    social_media_alerts: true,
    content_generation_alerts: true
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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
          full_name: '',
          email: userData.email || user?.email || '',
          phone: '',
          bio: '',
          website: '',
          license_number: '',
          brokerage: ''
        })
      }
      
      // Fetch brand settings
      const { data: brandData, error: brandError } = await supabase
        .from('agent_brands')
        .select('*')
        .eq('agent_id', user.id)
        .single()
      
      if (brandError && brandError.code !== 'PGRST116') {
        throw brandError
      }
      
      if (brandData) {
        setBrandData({
          company_name: brandData.company_name || '',
          logo_url: brandData.logo_storage_path || '',
          primary_color: brandData.primary_color || '#3B82F6',
          secondary_color: brandData.secondary_color || '#1E40AF',
          accent_color: '#F59E0B',
          font_family: brandData.font_family || 'Inter',
          ai_persona: brandData.persona_tone || '',
          brand_voice: brandData.persona_style || '',
          target_audience: '',
          specialties: brandData.persona_key_phrases || []
        })
      }
      
    } catch (err) {
      console.error('Error fetching user data:', err)
      setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user?.id) return null
    
    try {
      const fileName = `${user.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, logoFile)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (err) {
      console.error('Error uploading logo:', err)
      throw err
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
          email: profileData.email
        })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      console.error('Error saving profile:', err)
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const saveBrand = async () => {
    if (!user?.id) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      let logoUrl = brandData.logo_url
      
      // Upload new logo if selected
      if (logoFile) {
        const uploadedUrl = await uploadLogo()
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        }
      }
      
      const { error } = await supabase
        .from('agent_brands')
        .upsert({
          agent_id: user.id,
          company_name: brandData.company_name,
          logo_storage_path: logoUrl,
          primary_color: brandData.primary_color,
          secondary_color: brandData.secondary_color,
          font_family: brandData.font_family,
          persona_tone: brandData.ai_persona,
          persona_style: brandData.brand_voice,
          persona_key_phrases: brandData.specialties,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      // Refresh brand context
      await refreshBrand()
      
      setMessage({ type: 'success', text: 'Brand settings updated successfully!' })
      setLogoFile(null)
      setLogoPreview(null)
    } catch (err) {
      console.error('Error saving brand:', err)
      setMessage({ type: 'error', text: 'Failed to save brand settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        setMessage({ type: 'error', text: 'New passwords do not match.' })
        return
      }
      
      if (passwordData.new_password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
        return
      }
      
      setSaving(true)
      setMessage(null)
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      console.error('Error changing password:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to change password. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const addSpecialty = (specialty: string) => {
    if (specialty && !brandData.specialties.includes(specialty)) {
      setBrandData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }

  const removeSpecialty = (specialty: string) => {
    setBrandData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, brand, and preferences</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-content'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('brand')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'brand'
                    ? 'bg-primary text-primary-content'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Palette className="h-5 w-5 mr-3" />
                Brand
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-primary-content'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-primary text-primary-content'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                Security
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Full Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          type="email"
                          className="input input-bordered"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Phone</span>
                        </label>
                        <input
                          type="tel"
                          className="input input-bordered"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Website</span>
                        </label>
                        <input
                          type="url"
                          className="input input-bordered"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">License Number</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.license_number}
                          onChange={(e) => setProfileData(prev => ({ ...prev, license_number: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Brokerage</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={profileData.brokerage}
                          onChange={(e) => setProfileData(prev => ({ ...prev, brokerage: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="form-control mt-6">
                      <label className="label">
                        <span className="label-text">Bio</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Brand Tab */}
                {activeTab === 'brand' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Brand Customization</h2>
                    
                    {/* Logo Upload */}
                    <div className="form-control mb-6">
                      <label className="label">
                        <span className="label-text">Company Logo</span>
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-lg">
                            <img 
                              src={logoPreview || brandData.logo_url || '/nester-logo.svg'} 
                              alt="Logo" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="file-input file-input-bordered file-input-sm"
                          />
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Company Name</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={brandData.company_name}
                          onChange={(e) => setBrandData(prev => ({ ...prev, company_name: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Font Family</span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={brandData.font_family}
                          onChange={(e) => setBrandData(prev => ({ ...prev, font_family: e.target.value }))}
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Primary Color</span>
                        </label>
                        <input
                          type="color"
                          className="input input-bordered h-12"
                          value={brandData.primary_color}
                          onChange={(e) => setBrandData(prev => ({ ...prev, primary_color: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Secondary Color</span>
                        </label>
                        <input
                          type="color"
                          className="input input-bordered h-12"
                          value={brandData.secondary_color}
                          onChange={(e) => setBrandData(prev => ({ ...prev, secondary_color: e.target.value }))}
                        />
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Accent Color</span>
                        </label>
                        <input
                          type="color"
                          className="input input-bordered h-12"
                          value={brandData.accent_color}
                          onChange={(e) => setBrandData(prev => ({ ...prev, accent_color: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="form-control mt-6">
                      <label className="label">
                        <span className="label-text">AI Persona</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24"
                        value={brandData.ai_persona}
                        onChange={(e) => setBrandData(prev => ({ ...prev, ai_persona: e.target.value }))}
                        placeholder="Describe how your AI assistant should behave and communicate..."
                      />
                    </div>
                    
                    <div className="form-control mt-6">
                      <label className="label">
                        <span className="label-text">Brand Voice</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24"
                        value={brandData.brand_voice}
                        onChange={(e) => setBrandData(prev => ({ ...prev, brand_voice: e.target.value }))}
                        placeholder="Describe your brand's tone and communication style..."
                      />
                    </div>
                    
                    <div className="form-control mt-6">
                      <label className="label">
                        <span className="label-text">Target Audience</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24"
                        value={brandData.target_audience}
                        onChange={(e) => setBrandData(prev => ({ ...prev, target_audience: e.target.value }))}
                        placeholder="Describe your ideal clients and target market..."
                      />
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={saveBrand}
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Brand Settings'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Email Notifications</div>
                              <div className="text-sm text-gray-500">Receive notifications via email</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.email_notifications}
                            onChange={(e) => setNotifications(prev => ({ ...prev, email_notifications: e.target.checked }))}
                          />
                        </label>
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Receive push notifications in browser</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.push_notifications}
                            onChange={(e) => setNotifications(prev => ({ ...prev, push_notifications: e.target.checked }))}
                          />
                        </label>
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Marketing Emails</div>
                              <div className="text-sm text-gray-500">Receive updates about new features and tips</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.marketing_emails}
                            onChange={(e) => setNotifications(prev => ({ ...prev, marketing_emails: e.target.checked }))}
                          />
                        </label>
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Property Alerts</div>
                              <div className="text-sm text-gray-500">Get notified about property updates</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.property_alerts}
                            onChange={(e) => setNotifications(prev => ({ ...prev, property_alerts: e.target.checked }))}
                          />
                        </label>
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Social Media Alerts</div>
                              <div className="text-sm text-gray-500">Get notified about social media activity</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.social_media_alerts}
                            onChange={(e) => setNotifications(prev => ({ ...prev, social_media_alerts: e.target.checked }))}
                          />
                        </label>
                      </div>
                      
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text">
                            <div>
                              <div className="font-medium">Content Generation Alerts</div>
                              <div className="text-sm text-gray-500">Get notified when AI content is ready</div>
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={notifications.content_generation_alerts}
                            onChange={(e) => setNotifications(prev => ({ ...prev, content_generation_alerts: e.target.checked }))}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={() => {
                          // Save notification preferences
                          setMessage({ type: 'success', text: 'Notification preferences saved!' })
                        }}
                        className="btn btn-primary"
                      >
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Current Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            className="input input-bordered pr-10"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">New Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            className="input input-bordered pr-10"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Confirm New Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            className="input input-bordered pr-10"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-8">
                      <button
                        onClick={changePassword}
                        disabled={saving || !passwordData.new_password || !passwordData.confirm_password}
                        className="btn btn-primary"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}