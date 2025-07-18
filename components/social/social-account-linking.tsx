"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube,
  Link,
  Unlink,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

interface SocialAccount {
  platform: string
  name: string
  icon: React.ComponentType<any>
  connected: boolean
  username?: string
  followers?: number
  enabled: boolean
  lastSync?: string
  authUrl?: string
}

interface SocialAccountLinkingProps {
  className?: string
}

export function SocialAccountLinking({ className = "" }: SocialAccountLinkingProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      platform: "facebook",
      name: "Facebook",
      icon: Facebook,
      connected: false,
      enabled: true,
      authUrl: "/api/auth/facebook"
    },
    {
      platform: "instagram",
      name: "Instagram",
      icon: Instagram,
      connected: true,
      username: "@realestate_pro",
      followers: 12500,
      enabled: true,
      lastSync: "2024-01-15T10:30:00Z"
    },
    {
      platform: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      connected: true,
      username: "Real Estate Professional",
      followers: 3200,
      enabled: false,
      lastSync: "2024-01-14T15:45:00Z"
    },
    {
      platform: "twitter",
      name: "Twitter/X",
      icon: Twitter,
      connected: false,
      enabled: true,
      authUrl: "/api/auth/twitter"
    },
    {
      platform: "tiktok",
      name: "TikTok",
      icon: Youtube, // Using Youtube icon as placeholder
      connected: false,
      enabled: true,
      authUrl: "/api/auth/tiktok"
    },
    {
      platform: "threads",
      name: "Threads",
      icon: Instagram, // Using Instagram icon as placeholder
      connected: false,
      enabled: true,
      authUrl: "/api/auth/threads"
    }
  ])
  
  const [loading, setLoading] = useState<string | null>(null)

  const handleConnect = async (platform: string) => {
    setLoading(platform)
    
    try {
      // Simulate API call to initiate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, this would redirect to the OAuth provider
      const account = accounts.find(acc => acc.platform === platform)
      if (account?.authUrl) {
        // window.location.href = account.authUrl
        // For demo purposes, we'll simulate a successful connection
        setAccounts(prev => prev.map(acc => 
          acc.platform === platform 
            ? { 
                ...acc, 
                connected: true, 
                username: `@${platform}_user`,
                followers: Math.floor(Math.random() * 10000) + 1000,
                lastSync: new Date().toISOString()
              }
            : acc
        ))
        toast.success(`Successfully connected to ${account.name}!`)
      }
    } catch (error) {
      toast.error(`Failed to connect to ${platform}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const handleDisconnect = async (platform: string) => {
    setLoading(platform)
    
    try {
      // Simulate API call to disconnect account
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAccounts(prev => prev.map(acc => 
        acc.platform === platform 
          ? { 
              ...acc, 
              connected: false, 
              username: undefined,
              followers: undefined,
              lastSync: undefined
            }
          : acc
      ))
      
      const account = accounts.find(acc => acc.platform === platform)
      toast.success(`Disconnected from ${account?.name}`)
    } catch (error) {
      toast.error(`Failed to disconnect from ${platform}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleEnabled = async (platform: string, enabled: boolean) => {
    try {
      // Simulate API call to update account settings
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setAccounts(prev => prev.map(acc => 
        acc.platform === platform 
          ? { ...acc, enabled }
          : acc
      ))
      
      const account = accounts.find(acc => acc.platform === platform)
      toast.success(`${account?.name} posting ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update settings. Please try again.')
    }
  }

  const handleSyncAccount = async (platform: string) => {
    setLoading(platform)
    
    try {
      // Simulate API call to sync account data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setAccounts(prev => prev.map(acc => 
        acc.platform === platform 
          ? { 
              ...acc, 
              lastSync: new Date().toISOString(),
              followers: acc.followers ? acc.followers + Math.floor(Math.random() * 100) : undefined
            }
          : acc
      ))
      
      const account = accounts.find(acc => acc.platform === platform)
      toast.success(`${account?.name} account synced successfully`)
    } catch (error) {
      toast.error(`Failed to sync ${platform} account. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  const connectedCount = accounts.filter(acc => acc.connected).length
  const enabledCount = accounts.filter(acc => acc.connected && acc.enabled).length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Social Account Management
          </CardTitle>
          <CardDescription>
            Connect and manage your social media accounts for automated posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {connectedCount} of {accounts.length} accounts connected
              </p>
              <p className="text-sm text-gray-600">
                {enabledCount} accounts enabled for posting
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline">
                {connectedCount} Connected
              </Badge>
              <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
                {enabledCount} Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account List */}
      <div className="space-y-4">
        {accounts.map((account) => {
          const IconComponent = account.icon
          const isLoading = loading === account.platform
          
          return (
            <Card key={account.platform}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{account.name}</h3>
                        {account.connected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {account.connected ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            {account.username}
                            {account.followers && (
                              <span className="ml-2">
                                • {formatFollowers(account.followers)} followers
                              </span>
                            )}
                          </p>
                          {account.lastSync && (
                            <p className="text-xs text-gray-500">
                              Last synced: {formatLastSync(account.lastSync)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {account.connected && (
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`${account.platform}-enabled`} className="text-sm text-gray-600">
                          Auto-post
                        </label>
                        <Switch
                          id={`${account.platform}-enabled`}
                          checked={account.enabled}
                          onCheckedChange={(enabled) => handleToggleEnabled(account.platform, enabled)}
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {account.connected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncAccount(account.platform)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            ) : (
                              <Settings className="h-4 w-4" />
                            )}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(account.platform)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            ) : (
                              <Unlink className="h-4 w-4" />
                            )}
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleConnect(account.platform)}
                          disabled={isLoading}
                          size="sm"
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Link className="h-4 w-4 mr-2" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Connected accounts will be used for automated posting when you create social campaigns. 
          You can enable or disable posting for each platform individually. 
          <a href="#" className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800">
            Learn more about social integrations
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default SocialAccountLinking