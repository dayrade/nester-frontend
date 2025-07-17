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
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: 'website' | 'social' | 'referral' | 'advertisement' | 'walk-in' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  interestedProperty?: string
  budget: {
    min: number
    max: number
  }
  requirements: string[]
  notes: string
  assignedTo?: string
  createdAt: Date
  lastContact?: Date
  nextFollowUp?: Date
  score: number
  tags: string[]
}

interface Activity {
  id: string
  leadId: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'property-view' | 'proposal-sent'
  description: string
  timestamp: Date
  userId: string
  outcome?: 'positive' | 'neutral' | 'negative'
}

interface LeadManagementProps {
  leads: Lead[]
  activities: Activity[]
  onCreateLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'score'>) => void
  onUpdateLead: (id: string, updates: Partial<Lead>) => void
  onDeleteLead: (id: string) => void
  onAddActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
}

export function LeadManagement({
  leads,
  activities,
  onCreateLead,
  onUpdateLead,
  onDeleteLead,
  onAddActivity
}: LeadManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    status: 'new',
    priority: 'medium',
    budget: { min: 0, max: 0 },
    requirements: [],
    notes: '',
    tags: []
  })
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'note',
    description: '',
    outcome: 'neutral'
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed-won': return 'bg-green-100 text-green-800'
      case 'closed-lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'website': return <Globe className="h-4 w-4" />
      case 'social': return <MessageSquare className="h-4 w-4" />
      case 'referral': return <User className="h-4 w-4" />
      case 'advertisement': return <TrendingUp className="h-4 w-4" />
      case 'walk-in': return <MapPin className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const handleCreateLead = () => {
    if (newLead.name && newLead.email) {
      onCreateLead(newLead as Omit<Lead, 'id' | 'createdAt' | 'score'>)
      setNewLead({
        name: '',
        email: '',
        phone: '',
        source: 'website',
        status: 'new',
        priority: 'medium',
        budget: { min: 0, max: 0 },
        requirements: [],
        notes: '',
        tags: []
      })
      setShowCreateDialog(false)
    }
  }

  const handleAddActivity = () => {
    if (selectedLead && newActivity.description) {
      onAddActivity({
        ...newActivity,
        leadId: selectedLead.id,
        userId: 'current-user'
      } as Omit<Activity, 'id' | 'timestamp'>)
      setNewActivity({
        type: 'note',
        description: '',
        outcome: 'neutral'
      })
      setShowActivityDialog(false)
    }
  }

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    closedWon: leads.filter(l => l.status === 'closed-won').length,
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'closed-won').length / leads.length) * 100 : 0
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{leadStats.new}</p>
              </div>
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold">{leadStats.qualified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed Won</p>
                <p className="text-2xl font-bold">{leadStats.closedWon}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{leadStats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed-won">Closed Won</SelectItem>
                    <SelectItem value="closed-lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Lead</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newLead.name || ''}
                          onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newLead.email || ''}
                          onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newLead.phone || ''}
                          onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="source">Source</Label>
                        <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value as Lead['source'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="advertisement">Advertisement</SelectItem>
                            <SelectItem value="walk-in">Walk-in</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newLead.priority} onValueChange={(value) => setNewLead({ ...newLead, priority: value as Lead['priority'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget-min">Budget Min</Label>
                        <Input
                          id="budget-min"
                          type="number"
                          value={newLead.budget?.min || 0}
                          onChange={(e) => setNewLead({ 
                            ...newLead, 
                            budget: { ...newLead.budget!, min: parseInt(e.target.value) || 0 }
                          })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newLead.notes || ''}
                          onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateLead}>
                        Create Lead
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Leads List */}
          <div className="grid gap-4">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLead(lead)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge className={cn("text-xs", getStatusColor(lead.status))}>
                          {lead.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={cn("text-xs", getPriorityColor(lead.priority))}>
                          {lead.priority}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {getSourceIcon(lead.source)}
                          <span className="text-xs text-muted-foreground">{lead.source}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {formatDate(lead.createdAt)}</span>
                        {lead.lastContact && (
                          <span>Last Contact: {formatDate(lead.lastContact)}</span>
                        )}
                        {lead.nextFollowUp && (
                          <span className="text-orange-600">Follow Up: {formatDate(lead.nextFollowUp)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{lead.score}/100</span>
                        </div>
                        <Progress value={lead.score} className="w-20 h-2" />
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { status: 'new', label: 'New', count: leadStats.new },
                  { status: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
                  { status: 'qualified', label: 'Qualified', count: leadStats.qualified },
                  { status: 'proposal', label: 'Proposal', count: leads.filter(l => l.status === 'proposal').length },
                  { status: 'negotiation', label: 'Negotiation', count: leads.filter(l => l.status === 'negotiation').length },
                  { status: 'closed-won', label: 'Closed Won', count: leadStats.closedWon },
                  { status: 'closed-lost', label: 'Closed Lost', count: leads.filter(l => l.status === 'closed-lost').length }
                ].map(stage => (
                  <div key={stage.status} className="space-y-2">
                    <div className="text-center">
                      <h4 className="font-medium">{stage.label}</h4>
                      <p className="text-2xl font-bold">{stage.count}</p>
                    </div>
                    <div className="space-y-2">
                      {leads.filter(l => l.status === stage.status).slice(0, 3).map(lead => (
                        <Card key={lead.id} className="p-2 cursor-pointer hover:shadow-sm"
                              onClick={() => setSelectedLead(lead)}>
                          <div className="text-sm">
                            <p className="font-medium truncate">{lead.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge className={cn("text-xs", getPriorityColor(lead.priority))}>
                                {lead.priority}
                              </Badge>
                              <span className="text-xs">{formatCurrency(lead.budget.max)}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={!selectedLead}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Activity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="activity-type">Type</Label>
                        <Select value={newActivity.type} onValueChange={(value) => setNewActivity({ ...newActivity, type: value as Activity['type'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="call">Call</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                            <SelectItem value="property-view">Property View</SelectItem>
                            <SelectItem value="proposal-sent">Proposal Sent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="activity-description">Description</Label>
                        <Textarea
                          id="activity-description"
                          value={newActivity.description || ''}
                          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="activity-outcome">Outcome</Label>
                        <Select value={newActivity.outcome} onValueChange={(value) => setNewActivity({ ...newActivity, outcome: value as Activity['outcome'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowActivityDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddActivity}>
                        Add Activity
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 10).map(activity => {
                  const lead = leads.find(l => l.id === activity.leadId)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'call' && <Phone className="h-4 w-4" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4" />}
                        {activity.type === 'meeting' && <Calendar className="h-4 w-4" />}
                        {activity.type === 'note' && <FileText className="h-4 w-4" />}
                        {activity.type === 'property-view' && <Eye className="h-4 w-4" />}
                        {activity.type === 'proposal-sent' && <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{lead?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace('-', ' ')}
                          </Badge>
                          {activity.outcome && (
                            <Badge className={cn(
                              "text-xs",
                              activity.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                              activity.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {activity.outcome}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLead.name}
                <Badge className={cn("text-xs", getStatusColor(selectedLead.status))}>
                  {selectedLead.status.replace('-', ' ')}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedLead.email}
                    </div>
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedLead.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Lead Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <div className="flex items-center gap-1">
                        {getSourceIcon(selectedLead.source)}
                        {selectedLead.source}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <Badge className={cn("text-xs", getPriorityColor(selectedLead.priority))}>
                        {selectedLead.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedLead.score} className="w-16 h-2" />
                        <span>{selectedLead.score}/100</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span>{formatCurrency(selectedLead.budget.min)} - {formatCurrency(selectedLead.budget.max)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedLead.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{formatDate(selectedLead.createdAt)}</span>
                    </div>
                    {selectedLead.lastContact && (
                      <div className="flex justify-between">
                        <span>Last Contact:</span>
                        <span>{formatDate(selectedLead.lastContact)}</span>
                      </div>
                    )}
                    {selectedLead.nextFollowUp && (
                      <div className="flex justify-between">
                        <span>Next Follow Up:</span>
                        <span className="text-orange-600">{formatDate(selectedLead.nextFollowUp)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent Activities</h4>
                  <div className="space-y-2">
                    {activities
                      .filter(a => a.leadId === selectedLead.id)
                      .slice(0, 5)
                      .map(activity => (
                        <div key={activity.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                          <div className="flex-shrink-0 mt-1">
                            {activity.type === 'call' && <Phone className="h-3 w-3" />}
                            {activity.type === 'email' && <Mail className="h-3 w-3" />}
                            {activity.type === 'meeting' && <Calendar className="h-3 w-3" />}
                            {activity.type === 'note' && <FileText className="h-3 w-3" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium">{activity.type.replace('-', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
              <Button onClick={() => setShowActivityDialog(true)}>
                Add Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}