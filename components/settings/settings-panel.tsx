"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  User, 
  UserX,
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Moon, 
  Sun, 
  Monitor, 
  Camera,
  Edit
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  company?: string
  role: string
  bio?: string
  location?: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    desktop: boolean
    marketing: boolean
    updates: boolean
    security: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowMessages: boolean
    allowCalls: boolean
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    sessionTimeout: number
    passwordLastChanged: Date
  }
  preferences: {
    autoSave: boolean
    defaultView: 'grid' | 'list' | 'cards'
    itemsPerPage: number
    showTutorials: boolean
    compactMode: boolean
    animations: boolean
    sounds: boolean
  }
}

interface SettingsPanelProps {
  user: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
  onExportData: () => void
  onDeleteAccount: () => void
  onSignOut: () => void
}

export function SettingsPanel({
  user,
  onUpdateProfile,
  onChangePassword,
  onExportData,
  onDeleteAccount,
  onSignOut
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState(user)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await onUpdateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match')
      return
    }

    try {
      await onChangePassword(passwordData.current, passwordData.new)
      setShowPasswordDialog(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      alert('Password changed successfully')
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  const handleNotificationChange = (key: keyof UserProfile['notifications'], value: boolean) => {
    const updatedNotifications = { ...formData.notifications, [key]: value }
    setFormData({ ...formData, notifications: updatedNotifications })
    onUpdateProfile({ notifications: updatedNotifications })
  }

  const handlePrivacyChange = (key: keyof UserProfile['privacy'], value: any) => {
    const updatedPrivacy = { ...formData.privacy, [key]: value }
    setFormData({ ...formData, privacy: updatedPrivacy })
    onUpdateProfile({ privacy: updatedPrivacy })
  }

  const handleSecurityChange = (key: keyof UserProfile['security'], value: any) => {
    const updatedSecurity = { ...formData.security, [key]: value }
    setFormData({ ...formData, security: updatedSecurity })
    onUpdateProfile({ security: updatedSecurity })
  }

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: any) => {
    const updatedPreferences = { ...formData.preferences, [key]: value }
    setFormData({ ...formData, preferences: updatedPreferences })
    onUpdateProfile({ preferences: updatedPreferences })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : isEditing ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0">
                      <Camera className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                  <Badge variant="outline" className="mt-1">{formData.role}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={formData.notifications.email}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={formData.notifications.push}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                  </div>
                  <Switch
                    checked={formData.notifications.desktop}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('desktop', checked)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Marketing</Label>
                      <p className="text-sm text-muted-foreground">Product updates and marketing content</p>
                    </div>
                    <Switch
                      checked={formData.notifications.marketing}
                      onCheckedChange={(checked: boolean) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Updates</Label>
                      <p className="text-sm text-muted-foreground">System updates and new features</p>
                    </div>
                    <Switch
                      checked={formData.notifications.updates}
                      onCheckedChange={(checked: boolean) => handleNotificationChange('updates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Security</Label>
                      <p className="text-sm text-muted-foreground">Security alerts and login notifications</p>
                    </div>
                    <Switch
                      checked={formData.notifications.security}
                      onCheckedChange={(checked: boolean) => handleNotificationChange('security', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground mb-3">Control who can see your profile</p>
                <Select
                  value={formData.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display email address on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showEmail}
                    onCheckedChange={(checked: boolean) => handlePrivacyChange('showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Phone</Label>
                    <p className="text-sm text-muted-foreground">Display phone number on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showPhone}
                    onCheckedChange={(checked: boolean) => handlePrivacyChange('showPhone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display location on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showLocation}
                    onCheckedChange={(checked: boolean) => handlePrivacyChange('showLocation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
                  </div>
                  <Switch
                    checked={formData.privacy.allowMessages}
                    onCheckedChange={(checked: boolean) => handlePrivacyChange('allowMessages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Calls</Label>
                    <p className="text-sm text-muted-foreground">Allow others to call you</p>
                  </div>
                  <Switch
                    checked={formData.privacy.allowCalls}
                    onCheckedChange={(checked: boolean) => handlePrivacyChange('allowCalls', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={formData.security.twoFactorEnabled}
                    onCheckedChange={(checked: boolean) => handleSecurityChange('twoFactorEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                  </div>
                  <Switch
                    checked={formData.security.loginAlerts}
                    onCheckedChange={(checked: boolean) => handleSecurityChange('loginAlerts', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground mb-3">Automatically log out after inactivity</p>
                <Select
                  value={formData.security.sessionTimeout.toString()}
                  onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Last changed: {formData.security.passwordLastChanged.toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => setShowPasswordDialog(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred language</p>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Currency</Label>
                  <p className="text-sm text-muted-foreground mb-3">Default currency for pricing</p>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Date Format</Label>
                  <p className="text-sm text-muted-foreground mb-3">How dates are displayed</p>
                  <Select
                    value={formData.dateFormat}
                    onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Time Format</Label>
                  <p className="text-sm text-muted-foreground mb-3">12-hour or 24-hour format</p>
                  <Select
                    value={formData.timeFormat}
                    onValueChange={(value) => setFormData({ ...formData, timeFormat: value as '12h' | '24h' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => setFormData({ ...formData, theme: value as 'light' | 'dark' | 'system' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Default View</Label>
                  <p className="text-sm text-muted-foreground mb-3">Default layout for property listings</p>
                  <Select
                    value={formData.preferences.defaultView}
                    onValueChange={(value) => handlePreferenceChange('defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Interface Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Save</Label>
                      <p className="text-sm text-muted-foreground">Automatically save changes</p>
                    </div>
                    <Switch
                      checked={formData.preferences.autoSave}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Show Tutorials</Label>
                      <p className="text-sm text-muted-foreground">Display helpful tutorials and tips</p>
                    </div>
                    <Switch
                      checked={formData.preferences.showTutorials}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('showTutorials', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use a more compact interface</p>
                    </div>
                    <Switch
                      checked={formData.preferences.compactMode}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('compactMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable interface animations</p>
                    </div>
                    <Switch
                      checked={formData.preferences.animations}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('animations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">Play sound effects for actions</p>
                    </div>
                    <Switch
                      checked={formData.preferences.sounds}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('sounds', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Data Export</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Download a copy of all your data including properties, leads, and analytics.
                      </p>
                      <Button variant="outline" className="mt-3" onClick={onExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-3"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">This will permanently delete:</span>
            </div>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>• All your properties and listings</li>
              <li>• Lead and contact information</li>
              <li>• Analytics and performance data</li>
              <li>• Social media content and campaigns</li>
              <li>• Account settings and preferences</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}