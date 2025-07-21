"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share, 
  DollarSign, 
  BarChart3, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  Image,
  Video,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Campaign {
  id: string
  name: string
  description: string
  type: 'social' | 'email' | 'ppc' | 'content' | 'seo' | 'display'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  platforms: Platform[]
  budget: {
    total: number
    spent: number
    currency: string
  }
  schedule: {
    startDate: Date
    endDate: Date
    timezone: string
  }
  targeting: {
    demographics: {
      ageRange: [number, number]
      gender: 'all' | 'male' | 'female'
      locations: string[]
    }
    interests: string[]
    behaviors: string[]
  }
  content: {
    headline: string
    description: string
    callToAction: string
    images: string[]
    videos: string[]
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    cost: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
  }
  createdAt: Date
  updatedAt: Date
}

interface Platform {
  name: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'google' | 'email'
  enabled: boolean
  settings: Record<string, any>
}

interface CampaignManagerProps {
  campaigns: Campaign[]
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => void
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void
  onDeleteCampaign: (id: string) => void
  onDuplicateCampaign: (id: string) => void
}

export function CampaignManager({
  campaigns,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onDuplicateCampaign
}: CampaignManagerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'social',
    status: 'draft',
    platforms: [],
    budget: { total: 0, spent: 0, currency: 'USD' },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timezone: 'UTC'
    },
    targeting: {
      demographics: {
        ageRange: [18, 65],
        gender: 'all',
        locations: []
      },
      interests: [],
      behaviors: []
    },
    content: {
      headline: '',
      description: '',
      callToAction: '',
      images: [],
      videos: []
    }
  })

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    const matchesType = filterType === 'all' || campaign.type === filterType
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'social': return <Users className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'ppc': return <Target className="h-4 w-4" />
      case 'content': return <FileText className="h-4 w-4" />
      case 'seo': return <Globe className="h-4 w-4" />
      case 'display': return <Monitor className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-4 w-4" />
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      case 'linkedin': return <Linkedin className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.description) {
      onCreateCampaign(newCampaign as Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>)
      setNewCampaign({
        name: '',
        description: '',
        type: 'social',
        status: 'draft',
        platforms: [],
        budget: { total: 0, spent: 0, currency: 'USD' },
        schedule: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          timezone: 'UTC'
        },
        targeting: {
          demographics: {
            ageRange: [18, 65],
            gender: 'all',
            locations: []
          },
          interests: [],
          behaviors: []
        },
        content: {
          headline: '',
          description: '',
          callToAction: '',
          images: [],
          videos: []
        }
      })
      setShowCreateDialog(false)
    }
  }

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    totalSpent: campaigns.reduce((sum, c) => sum + c.budget.spent, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
    avgCTR: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length : 0
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaignStats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaignStats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(campaignStats.totalSpent)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold">{campaignStats.avgCTR.toFixed(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="ppc">PPC</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="seo">SEO</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Campaign</DialogTitle>
                    </DialogHeader>
                    
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="targeting">Targeting</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="budget">Budget</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="campaign-name">Campaign Name *</Label>
                            <Input
                              id="campaign-name"
                              value={newCampaign.name || ''}
                              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="campaign-type">Type *</Label>
                            <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value as Campaign['type'] })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="social">Social Media</SelectItem>
                                <SelectItem value="email">Email Marketing</SelectItem>
                                <SelectItem value="ppc">Pay-Per-Click</SelectItem>
                                <SelectItem value="content">Content Marketing</SelectItem>
                                <SelectItem value="seo">SEO</SelectItem>
                                <SelectItem value="display">Display Advertising</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="campaign-description">Description</Label>
                          <Textarea
                            id="campaign-description"
                            value={newCampaign.description || ''}
                            onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label>Platforms</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {[
                              { name: 'facebook', label: 'Facebook', icon: Facebook },
                              { name: 'instagram', label: 'Instagram', icon: Instagram },
                              { name: 'twitter', label: 'Twitter', icon: Twitter },
                              { name: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                              { name: 'youtube', label: 'YouTube', icon: Youtube },
                              { name: 'email', label: 'Email', icon: Mail }
                            ].map(platform => {
                              const Icon = platform.icon
                              const isSelected = newCampaign.platforms?.some(p => p.name === platform.name)
                              return (
                                <Button
                                  key={platform.name}
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => {
                                    const platforms = newCampaign.platforms || []
                                    if (isSelected) {
                                      setNewCampaign({
                                        ...newCampaign,
                                        platforms: platforms.filter(p => p.name !== platform.name)
                                      })
                                    } else {
                                      setNewCampaign({
                                        ...newCampaign,
                                        platforms: [...platforms, { name: platform.name as any, enabled: true, settings: {} }]
                                      })
                                    }
                                  }}
                                  className="justify-start"
                                >
                                  <Icon className="h-4 w-4 mr-2" />
                                  {platform.label}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="targeting" className="space-y-4">
                        <div>
                          <Label>Demographics</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label htmlFor="age-min">Age Range</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="age-min"
                                  type="number"
                                  placeholder="Min"
                                  value={newCampaign.targeting?.demographics.ageRange[0] || 18}
                                  onChange={(e) => {
                                    const targeting = newCampaign.targeting!
                                    setNewCampaign({
                                      ...newCampaign,
                                      targeting: {
                                        ...targeting,
                                        demographics: {
                                          ...targeting.demographics,
                                          ageRange: [parseInt(e.target.value) || 18, targeting.demographics.ageRange[1]]
                                        }
                                      }
                                    })
                                  }}
                                />
                                <Input
                                  type="number"
                                  placeholder="Max"
                                  value={newCampaign.targeting?.demographics.ageRange[1] || 65}
                                  onChange={(e) => {
                                    const targeting = newCampaign.targeting!
                                    setNewCampaign({
                                      ...newCampaign,
                                      targeting: {
                                        ...targeting,
                                        demographics: {
                                          ...targeting.demographics,
                                          ageRange: [targeting.demographics.ageRange[0], parseInt(e.target.value) || 65]
                                        }
                                      }
                                    })
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="gender">Gender</Label>
                              <Select 
                                value={newCampaign.targeting?.demographics.gender || 'all'} 
                                onValueChange={(value) => {
                                  const targeting = newCampaign.targeting!
                                  setNewCampaign({
                                    ...newCampaign,
                                    targeting: {
                                      ...targeting,
                                      demographics: {
                                        ...targeting.demographics,
                                        gender: value as any
                                      }
                                    }
                                  })
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All</SelectItem>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="interests">Interests (comma-separated)</Label>
                          <Input
                            id="interests"
                            placeholder="Real estate, property investment, home buying..."
                            value={newCampaign.targeting?.interests.join(', ') || ''}
                            onChange={(e) => {
                              const targeting = newCampaign.targeting!
                              setNewCampaign({
                                ...newCampaign,
                                targeting: {
                                  ...targeting,
                                  interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                }
                              })
                            }}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="content" className="space-y-4">
                        <div>
                          <Label htmlFor="headline">Headline</Label>
                          <Input
                            id="headline"
                            value={newCampaign.content?.headline || ''}
                            onChange={(e) => {
                              const content = newCampaign.content!
                              setNewCampaign({
                                ...newCampaign,
                                content: { ...content, headline: e.target.value }
                              })
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="content-description">Description</Label>
                          <Textarea
                            id="content-description"
                            value={newCampaign.content?.description || ''}
                            onChange={(e) => {
                              const content = newCampaign.content!
                              setNewCampaign({
                                ...newCampaign,
                                content: { ...content, description: e.target.value }
                              })
                            }}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cta">Call to Action</Label>
                          <Input
                            id="cta"
                            placeholder="Learn More, Book Now, Contact Us..."
                            value={newCampaign.content?.callToAction || ''}
                            onChange={(e) => {
                              const content = newCampaign.content!
                              setNewCampaign({
                                ...newCampaign,
                                content: { ...content, callToAction: e.target.value }
                              })
                            }}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="budget" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="total-budget">Total Budget</Label>
                            <Input
                              id="total-budget"
                              type="number"
                              value={newCampaign.budget?.total || 0}
                              onChange={(e) => {
                                const budget = newCampaign.budget!
                                setNewCampaign({
                                  ...newCampaign,
                                  budget: { ...budget, total: parseInt(e.target.value) || 0 }
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select 
                              value={newCampaign.budget?.currency || 'USD'} 
                              onValueChange={(value) => {
                                const budget = newCampaign.budget!
                                setNewCampaign({
                                  ...newCampaign,
                                  budget: { ...budget, currency: value }
                                })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="CAD">CAD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={newCampaign.schedule?.startDate.toISOString().split('T')[0] || ''}
                              onChange={(e) => {
                                const schedule = newCampaign.schedule!
                                setNewCampaign({
                                  ...newCampaign,
                                  schedule: { ...schedule, startDate: new Date(e.target.value) }
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={newCampaign.schedule?.endDate.toISOString().split('T')[0] || ''}
                              onChange={(e) => {
                                const schedule = newCampaign.schedule!
                                setNewCampaign({
                                  ...newCampaign,
                                  schedule: { ...schedule, endDate: new Date(e.target.value) }
                                })
                              }}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCampaign}>
                        Create Campaign
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {filteredCampaigns.map(campaign => (
              <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCampaign(campaign)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(campaign.type)}
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge className={cn("text-xs", getStatusColor(campaign.status))}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {campaign.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{formatNumber(campaign.metrics.impressions)} impressions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{formatNumber(campaign.metrics.clicks)} clicks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{campaign.metrics.ctr.toFixed(2)}% CTR</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">Platforms:</span>
                        {campaign.platforms.filter(p => p.enabled).map(platform => (
                          <div key={platform.name} className="flex items-center gap-1">
                            {getPlatformIcon(platform.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(campaign.schedule.startDate)} - {formatDate(campaign.schedule.endDate)}</p>
                        <Progress 
                          value={(campaign.budget.spent / campaign.budget.total) * 100} 
                          className="w-24 h-2 mt-1" 
                        />
                      </div>
                      
                      <div className="flex gap-1">
                        {campaign.status === 'active' ? (
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCampaign(campaign.id, { status: 'paused' })
                          }}>
                            <Pause className="h-3 w-3" />
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation()
                            onUpdateCampaign(campaign.id, { status: 'active' })
                          }}>
                            <Play className="h-3 w-3" />
                          </Button>
                        ) : null}
                        
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          onDuplicateCampaign(campaign.id)
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          onDeleteCampaign(campaign.id)
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns
                    .sort((a, b) => b.metrics.roas - a.metrics.roas)
                    .slice(0, 5)
                    .map(campaign => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{campaign.metrics.roas.toFixed(2)}x ROAS</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(campaign.budget.spent)} spent</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { platform: 'facebook', name: 'Facebook', icon: Facebook },
                    { platform: 'instagram', name: 'Instagram', icon: Instagram },
                    { platform: 'twitter', name: 'Twitter', icon: Twitter },
                    { platform: 'linkedin', name: 'LinkedIn', icon: Linkedin }
                  ].map(platform => {
                    const Icon = platform.icon
                    const platformCampaigns = campaigns.filter(c => 
                      c.platforms.some(p => p.name === platform.platform && p.enabled)
                    )
                    const totalSpent = platformCampaigns.reduce((sum, c) => sum + c.budget.spent, 0)
                    const totalImpressions = platformCampaigns.reduce((sum, c) => sum + c.metrics.impressions, 0)
                    const avgCTR = platformCampaigns.length > 0 ? 
                      platformCampaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / platformCampaigns.length : 0
                    
                    return (
                      <div key={platform.platform} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-sm text-muted-foreground">{platformCampaigns.length} campaigns</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatNumber(totalImpressions)} impressions</p>
                          <p className="text-sm text-muted-foreground">{avgCTR.toFixed(2)}% CTR</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Performance chart would be displayed here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Impressions</span>
                    <span className="font-medium">{formatNumber(campaignStats.totalImpressions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Clicks</span>
                    <span className="font-medium">{formatNumber(campaignStats.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average CTR</span>
                    <span className="font-medium">{campaignStats.avgCTR.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Spent</span>
                    <span className="font-medium">{formatCurrency(campaignStats.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg CPC</span>
                    <span className="font-medium">
                      {formatCurrency(
                        campaigns.length > 0 ? 
                        campaigns.reduce((sum, c) => sum + c.metrics.cpc, 0) / campaigns.length : 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg ROAS</span>
                    <span className="font-medium">
                      {campaigns.length > 0 ? 
                        (campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length).toFixed(2) : '0.00'
                      }x
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedCampaign.type)}
                {selectedCampaign.name}
                <Badge className={cn("text-xs", getStatusColor(selectedCampaign.status))}>
                  {selectedCampaign.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Impressions</p>
                          <p className="text-xl font-bold">{formatNumber(selectedCampaign.metrics.impressions)}</p>
                        </div>
                        <Eye className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Clicks</p>
                          <p className="text-xl font-bold">{formatNumber(selectedCampaign.metrics.clicks)}</p>
                        </div>
                        <Target className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="text-xl font-bold">{selectedCampaign.metrics.ctr.toFixed(2)}%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">ROAS</p>
                          <p className="text-xl font-bold">{selectedCampaign.metrics.roas.toFixed(2)}x</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Type:</span>
                        <Badge variant="outline">{selectedCampaign.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Duration:</span>
                        <span className="text-sm">
                          {formatDate(selectedCampaign.schedule.startDate)} - {formatDate(selectedCampaign.schedule.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Budget:</span>
                        <span className="text-sm">
                          {formatCurrency(selectedCampaign.budget.spent)} / {formatCurrency(selectedCampaign.budget.total)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm">Budget Usage:</span>
                        <Progress 
                          value={(selectedCampaign.budget.spent / selectedCampaign.budget.total) * 100} 
                          className="mt-1" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Platforms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCampaign.platforms.map(platform => (
                          <div key={platform.name} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(platform.name)}
                              <span className="capitalize">{platform.name}</span>
                            </div>
                            <Badge variant={platform.enabled ? 'default' : 'secondary'}>
                              {platform.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="performance">
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Detailed performance analytics would be displayed here</p>
                    <p className="text-sm">Integration with analytics service needed</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Campaign Actions</h4>
                    <div className="flex gap-2">
                      {selectedCampaign.status === 'active' ? (
                        <Button variant="outline" onClick={() => onUpdateCampaign(selectedCampaign.id, { status: 'paused' })}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Campaign
                        </Button>
                      ) : selectedCampaign.status === 'paused' ? (
                        <Button onClick={() => onUpdateCampaign(selectedCampaign.id, { status: 'active' })}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Campaign
                        </Button>
                      ) : null}
                      
                      <Button variant="outline" onClick={() => onDuplicateCampaign(selectedCampaign.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      
                      <Button variant="destructive" onClick={() => {
                        onDeleteCampaign(selectedCampaign.id)
                        setSelectedCampaign(null)
                      }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}