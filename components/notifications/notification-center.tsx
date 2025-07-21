"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Settings, 
  Mail, 
  MessageSquare, 
  Home, 
  TrendingUp,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'property' | 'social' | 'lead' | 'system' | 'marketing'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  propertyUpdates: boolean
  socialEngagement: boolean
  leadNotifications: boolean
  marketingUpdates: boolean
  systemAlerts: boolean
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
  onUpdateSettings: (settings: NotificationSettings) => void
  settings: NotificationSettings
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onUpdateSettings,
  settings
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications')
  const [filter, setFilter] = useState<'all' | 'unread' | 'property' | 'social' | 'lead' | 'system'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.category === filter
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'property':
        return <Home className="h-4 w-4" />
      case 'social':
        return <MessageSquare className="h-4 w-4" />
      case 'lead':
        return <TrendingUp className="h-4 w-4" />
      case 'marketing':
        return <Mail className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    onUpdateSettings({ ...settings, [key]: value })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            Notifications
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'notifications' ? (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'property', label: 'Property', count: notifications.filter(n => n.category === 'property').length },
                { key: 'social', label: 'Social', count: notifications.filter(n => n.category === 'social').length },
                { key: 'lead', label: 'Leads', count: notifications.filter(n => n.category === 'lead').length },
                { key: 'system', label: 'System', count: notifications.filter(n => n.category === 'system').length }
              ].map(tab => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(tab.key as any)}
                  className="text-xs"
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border rounded-lg transition-colors",
                      !notification.read ? "bg-muted/50 border-primary/20" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(notification.category)}
                              <h4 className={cn(
                                "text-sm font-medium",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {notification.actionUrl && notification.actionLabel && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  {notification.actionLabel}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => onDeleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('pushNotifications', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Notification Categories</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <div>
                      <Label htmlFor="property-updates">Property Updates</Label>
                      <p className="text-sm text-muted-foreground">New inquiries, views, and property status changes</p>
                    </div>
                  </div>
                  <Switch
                    id="property-updates"
                    checked={settings.propertyUpdates}
                    onCheckedChange={(checked: boolean) => updateSetting('propertyUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <Label htmlFor="social-engagement">Social Media Engagement</Label>
                      <p className="text-sm text-muted-foreground">Likes, comments, and shares on your posts</p>
                    </div>
                  </div>
                  <Switch
                    id="social-engagement"
                    checked={settings.socialEngagement}
                    onCheckedChange={(checked: boolean) => updateSetting('socialEngagement', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <div>
                      <Label htmlFor="lead-notifications">Lead Notifications</Label>
                      <p className="text-sm text-muted-foreground">New leads and lead status updates</p>
                    </div>
                  </div>
                  <Switch
                    id="lead-notifications"
                    checked={settings.leadNotifications}
                    onCheckedChange={(checked: boolean) => updateSetting('leadNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label htmlFor="marketing-updates">Marketing Updates</Label>
                      <p className="text-sm text-muted-foreground">Campaign performance and marketing insights</p>
                    </div>
                  </div>
                  <Switch
                    id="marketing-updates"
                    checked={settings.marketingUpdates}
                    onCheckedChange={(checked: boolean) => updateSetting('marketingUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <div>
                      <Label htmlFor="system-alerts">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Important system updates and maintenance notices</p>
                    </div>
                  </div>
                  <Switch
                    id="system-alerts"
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked: boolean) => updateSetting('systemAlerts', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}