"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  DollarSign,
  Home,
  Users,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  totalProperties: number
  totalViews: number
  totalEngagement: number
  averagePrice: number
  conversionRate: number
  socialPosts: number
  socialEngagement: number
  leadGeneration: number
  propertyViews: Array<{
    date: string
    views: number
  }>
  platformBreakdown: Array<{
    platform: string
    posts: number
    engagement: number
    reach: number
  }>
  propertyPerformance: Array<{
    id: string
    title: string
    views: number
    inquiries: number
    price: number
    status: string
  }>
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  timeRange: string
  onTimeRangeChange: (range: string) => void
}

export function AnalyticsDashboard({ data, timeRange, onTimeRangeChange }: AnalyticsDashboardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown
    }
  }

  // Mock previous period data for comparison
  const previousData = {
    totalViews: data.totalViews * 0.85,
    totalEngagement: data.totalEngagement * 0.92,
    leadGeneration: data.leadGeneration * 0.78,
    conversionRate: data.conversionRate * 0.88
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your property and social media performance</p>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalViews)}</div>
            {(() => {
              const change = getChangeIndicator(data.totalViews, previousData.totalViews)
              return (
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  change.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <change.icon className="h-3 w-3" />
                  {change.value}% from last period
                </p>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalEngagement)}</div>
            {(() => {
              const change = getChangeIndicator(data.totalEngagement, previousData.totalEngagement)
              return (
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  change.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <change.icon className="h-3 w-3" />
                  {change.value}% from last period
                </p>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Generation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leadGeneration}</div>
            {(() => {
              const change = getChangeIndicator(data.leadGeneration, previousData.leadGeneration)
              return (
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  change.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <change.icon className="h-3 w-3" />
                  {change.value}% from last period
                </p>
              )
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</div>
            {(() => {
              const change = getChangeIndicator(data.conversionRate, previousData.conversionRate)
              return (
                <p className={cn(
                  "text-xs flex items-center gap-1",
                  change.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <change.icon className="h-3 w-3" />
                  {change.value}% from last period
                </p>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Property Performance</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.propertyPerformance.slice(0, 5).map((property, index) => (
                    <div key={property.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{property.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(property.price)} • {property.views} views
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={property.status === 'sold' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {property.inquiries} inquiries
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Views Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.propertyViews.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(day.views / Math.max(...data.propertyViews.map(d => d.views))) * 100} className="w-20" />
                        <span className="text-sm font-medium w-12 text-right">{day.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.platformBreakdown.map((platform) => (
                    <div key={platform.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{platform.platform}</span>
                        <span className="text-sm text-muted-foreground">
                          {platform.posts} posts
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Engagement</span>
                          <span>{formatNumber(platform.engagement)}</span>
                        </div>
                        <Progress value={(platform.engagement / 10000) * 100} />
                        <div className="flex justify-between text-xs">
                          <span>Reach</span>
                          <span>{formatNumber(platform.reach)}</span>
                        </div>
                        <Progress value={(platform.reach / 50000) * 100} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Posts</span>
                    </div>
                    <span className="font-medium">{data.socialPosts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Total Engagement</span>
                    </div>
                    <span className="font-medium">{formatNumber(data.socialEngagement)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Avg. Engagement Rate</span>
                    </div>
                    <span className="font-medium">
                      {((data.socialEngagement / data.socialPosts) / 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Best performing platform</div>
                    <div className="font-medium">
                      {data.platformBreakdown.reduce((best, current) => 
                        current.engagement > best.engagement ? current : best
                      ).platform}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{formatCurrency(data.averagePrice)}</div>
                  <div className="text-sm text-muted-foreground">Average Property Price</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Home className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{data.totalProperties}</div>
                  <div className="text-sm text-muted-foreground">Active Listings</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Avg. Days on Market</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}