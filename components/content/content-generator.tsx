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
  Wand2, 
  FileText, 
  Image, 
  Video, 
  Mail, 
  MessageSquare, 
  Globe, 
  Download, 
  Copy, 
  RefreshCw, 
  Save, 
  Share, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Sparkles, 
  Target, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentTemplate {
  id: string
  name: string
  description: string
  type: 'social-post' | 'email' | 'blog-post' | 'property-description' | 'listing' | 'brochure' | 'ad-copy'
  category: 'marketing' | 'sales' | 'social' | 'email' | 'content'
  template: string
  variables: string[]
  tone: 'professional' | 'casual' | 'friendly' | 'persuasive' | 'informative'
  length: 'short' | 'medium' | 'long'
  platforms?: string[]
}

interface GeneratedContent {
  id: string
  templateId: string
  content: string
  type: ContentTemplate['type']
  variables: Record<string, string>
  generatedAt: Date
  status: 'draft' | 'approved' | 'published' | 'archived'
  platforms?: string[]
  metrics?: {
    views: number
    engagement: number
    clicks: number
    conversions: number
  }
}

interface ContentGeneratorProps {
  templates: ContentTemplate[]
  generatedContent: GeneratedContent[]
  onGenerateContent: (templateId: string, variables: Record<string, string>, options: any) => Promise<string>
  onSaveContent: (content: Omit<GeneratedContent, 'id' | 'generatedAt'>) => void
  onUpdateContent: (id: string, updates: Partial<GeneratedContent>) => void
  onDeleteContent: (id: string) => void
  onPublishContent: (id: string, platforms: string[]) => void
}

export function ContentGenerator({
  templates,
  generatedContent,
  onGenerateContent,
  onSaveContent,
  onUpdateContent,
  onDeleteContent,
  onPublishContent
}: ContentGeneratorProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [generationOptions, setGenerationOptions] = useState({
    tone: 'professional' as const,
    length: 'medium' as const,
    includeHashtags: true,
    includeEmojis: false,
    targetAudience: 'general',
    callToAction: true
  })
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const filteredTemplates = templates.filter(template => {
    return filterType === 'all' || template.type === filterType
  })

  const filteredContent = generatedContent.filter(content => {
    const matchesType = filterType === 'all' || content.type === filterType
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus
    return matchesType && matchesStatus
  })

  const getTypeIcon = (type: ContentTemplate['type']) => {
    switch (type) {
      case 'social-post': return <MessageSquare className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'blog-post': return <FileText className="h-4 w-4" />
      case 'property-description': return <Globe className="h-4 w-4" />
      case 'listing': return <FileText className="h-4 w-4" />
      case 'brochure': return <FileText className="h-4 w-4" />
      case 'ad-copy': return <Target className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: GeneratedContent['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const handleGenerateContent = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const content = await onGenerateContent(selectedTemplate.id, variables, generationOptions)
      setPreviewContent(content)
      setShowPreview(true)
      setGenerationProgress(100)
    } catch (error) {
      console.error('Content generation failed:', error)
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerationProgress(0), 1000)
    }
  }

  const handleSaveContent = () => {
    if (!selectedTemplate || !previewContent) return

    onSaveContent({
      templateId: selectedTemplate.id,
      content: previewContent,
      type: selectedTemplate.type,
      variables,
      status: 'draft',
      platforms: selectedTemplate.platforms
    })

    setShowPreview(false)
    setPreviewContent('')
    setVariables({})
    setSelectedTemplate(null)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const contentStats = {
    total: generatedContent.length,
    draft: generatedContent.filter(c => c.status === 'draft').length,
    published: generatedContent.filter(c => c.status === 'published').length,
    totalViews: generatedContent.reduce((sum, c) => sum + (c.metrics?.views || 0), 0),
    totalEngagement: generatedContent.reduce((sum, c) => sum + (c.metrics?.engagement || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{contentStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{contentStats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{contentStats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{contentStats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">{contentStats.totalEngagement.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Select Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="social-post">Social Media Post</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="blog-post">Blog Post</SelectItem>
                        <SelectItem value="property-description">Property Description</SelectItem>
                        <SelectItem value="listing">Property Listing</SelectItem>
                        <SelectItem value="brochure">Brochure</SelectItem>
                        <SelectItem value="ad-copy">Advertisement Copy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredTemplates.map(template => (
                      <Card 
                        key={template.id} 
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedTemplate?.id === template.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(template.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                              <div className="flex gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">{template.tone}</Badge>
                                <Badge variant="outline" className="text-xs">{template.length}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    {/* Template Variables */}
                    {selectedTemplate.variables.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Template Variables</Label>
                        <div className="space-y-2 mt-2">
                          {selectedTemplate.variables.map(variable => (
                            <div key={variable}>
                              <Label htmlFor={variable} className="text-xs">
                                {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Label>
                              <Input
                                id={variable}
                                value={variables[variable] || ''}
                                onChange={(e) => setVariables({ ...variables, [variable]: e.target.value })}
                                placeholder={`Enter ${variable}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Generation Options */}
                    <div>
                      <Label className="text-sm font-medium">Generation Options</Label>
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="tone" className="text-xs">Tone</Label>
                            <Select 
                              value={generationOptions.tone} 
                              onValueChange={(value) => setGenerationOptions({ ...generationOptions, tone: value as any })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="persuasive">Persuasive</SelectItem>
                                <SelectItem value="informative">Informative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="length" className="text-xs">Length</Label>
                            <Select 
                              value={generationOptions.length} 
                              onValueChange={(value) => setGenerationOptions({ ...generationOptions, length: value as any })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short">Short</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="long">Long</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="audience" className="text-xs">Target Audience</Label>
                          <Input
                            id="audience"
                            value={generationOptions.targetAudience}
                            onChange={(e) => setGenerationOptions({ ...generationOptions, targetAudience: e.target.value })}
                            placeholder="e.g., first-time homebuyers, investors"
                            className="h-8"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="hashtags" className="text-xs">Include Hashtags</Label>
                            <Switch
                              id="hashtags"
                              checked={generationOptions.includeHashtags}
                              onCheckedChange={(checked: boolean) => setGenerationOptions({ ...generationOptions, includeHashtags: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="emojis" className="text-xs">Include Emojis</Label>
                            <Switch
                              id="emojis"
                              checked={generationOptions.includeEmojis}
                              onCheckedChange={(checked: boolean) => setGenerationOptions({ ...generationOptions, includeEmojis: checked })}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cta" className="text-xs">Include Call-to-Action</Label>
                            <Switch
                              id="cta"
                              checked={generationOptions.callToAction}
                              onCheckedChange={(checked: boolean) => setGenerationOptions({ ...generationOptions, callToAction: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Generate Button */}
                    <Button 
                      onClick={handleGenerateContent} 
                      disabled={isGenerating || selectedTemplate.variables.some(v => !variables[v])}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                    
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Generating content...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a template to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="social-post">Social Media Post</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="blog-post">Blog Post</SelectItem>
                    <SelectItem value="property-description">Property Description</SelectItem>
                    <SelectItem value="listing">Property Listing</SelectItem>
                    <SelectItem value="brochure">Brochure</SelectItem>
                    <SelectItem value="ad-copy">Advertisement Copy</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <div className="grid gap-4">
            {filteredContent.map(content => {
              const template = templates.find(t => t.id === content.templateId)
              return (
                <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedContent(content)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(content.type)}
                          <h3 className="font-medium">{template?.name || 'Unknown Template'}</h3>
                          <Badge className={cn("text-xs", getStatusColor(content.status))}>
                            {content.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {content.type.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {content.content.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Generated: {formatDate(content.generatedAt)}</span>
                          {content.metrics && (
                            <>
                              <span>{content.metrics.views} views</span>
                              <span>{content.metrics.engagement} engagement</span>
                            </>
                          )}
                        </div>
                        
                        {content.platforms && content.platforms.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Platforms:</span>
                            {content.platforms.map(platform => (
                              <div key={platform} className="flex items-center gap-1">
                                {getPlatformIcon(platform)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(content.content)
                        }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          onUpdateContent(content.id, { status: 'approved' })
                        }}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          onDeleteContent(content.id)
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(template.type)}
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        <Badge variant="outline" className="text-xs">{template.tone}</Badge>
                        <Badge variant="outline" className="text-xs">{template.length}</Badge>
                      </div>
                      
                      {template.variables.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map(variable => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedTemplate(template)
                          setActiveTab('generate')
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Content Preview</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <pre className="whitespace-pre-wrap text-sm">{previewContent}</pre>
            </div>
            
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(previewContent)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContent}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Detail Dialog */}
      {selectedContent && (
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedContent.type)}
                Content Details
                <Badge className={cn("text-xs", getStatusColor(selectedContent.status))}>
                  {selectedContent.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <pre className="whitespace-pre-wrap text-sm">{selectedContent.content}</pre>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Details</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{selectedContent.type.replace('-', ' ')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Generated:</span>
                      <span>{formatDate(selectedContent.generatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={cn("text-xs", getStatusColor(selectedContent.status))}>
                        {selectedContent.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedContent.metrics && (
                  <div>
                    <Label className="text-sm font-medium">Performance</Label>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Views:</span>
                        <span>{selectedContent.metrics.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Engagement:</span>
                        <span>{selectedContent.metrics.engagement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clicks:</span>
                        <span>{selectedContent.metrics.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversions:</span>
                        <span>{selectedContent.metrics.conversions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedContent.platforms && selectedContent.platforms.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Platforms</Label>
                  <div className="mt-2 flex gap-2">
                    {selectedContent.platforms.map(platform => (
                      <div key={platform} className="flex items-center gap-2 p-2 border rounded">
                        {getPlatformIcon(platform)}
                        <span className="text-sm capitalize">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(selectedContent.content)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => {
                  // Download as text file
                  const blob = new Blob([selectedContent.content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `content-${selectedContent.id}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedContent(null)}>
                  Close
                </Button>
                {selectedContent.status === 'approved' && selectedContent.platforms && (
                  <Button onClick={() => {
                    onPublishContent(selectedContent.id, selectedContent.platforms!)
                    setSelectedContent(null)
                  }}>
                    <Share className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}