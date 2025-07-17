'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Bug, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Users,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data - in a real app, this would come from your error reporting service
const mockErrorData = {
  summary: {
    totalErrors: 1247,
    criticalErrors: 23,
    errorRate: 2.3,
    affectedUsers: 156,
    uptimePercentage: 99.7
  },
  trends: [
    { date: '2024-01-01', errors: 45, users: 120 },
    { date: '2024-01-02', errors: 52, users: 134 },
    { date: '2024-01-03', errors: 38, users: 98 },
    { date: '2024-01-04', errors: 61, users: 145 },
    { date: '2024-01-05', errors: 43, users: 112 },
    { date: '2024-01-06', errors: 55, users: 128 },
    { date: '2024-01-07', errors: 49, users: 119 }
  ],
  errorsByCategory: [
    { name: 'API', value: 35, color: '#ef4444' },
    { name: 'UI', value: 28, color: '#f97316' },
    { name: 'Database', value: 20, color: '#eab308' },
    { name: 'Network', value: 12, color: '#22c55e' },
    { name: 'Authentication', value: 5, color: '#3b82f6' }
  ],
  recentErrors: [
    {
      id: '1',
      message: 'Failed to load user profile',
      severity: 'high',
      category: 'API',
      timestamp: '2024-01-07T10:30:00Z',
      userId: 'user_123',
      userAgent: 'Chrome 120.0.0.0',
      url: '/dashboard/profile',
      count: 5
    },
    {
      id: '2', 
      message: 'Database connection timeout',
      severity: 'critical',
      category: 'Database',
      timestamp: '2024-01-07T09:15:00Z',
      userId: null,
      userAgent: 'Server',
      url: '/api/properties',
      count: 12
    },
    {
      id: '3',
      message: 'Component render error in PropertyCard',
      severity: 'medium',
      category: 'UI',
      timestamp: '2024-01-07T08:45:00Z',
      userId: 'user_456',
      userAgent: 'Safari 17.0',
      url: '/properties/search',
      count: 3
    }
  ],
  deviceStats: [
    { device: 'Desktop', errors: 45, percentage: 60 },
    { device: 'Mobile', errors: 25, percentage: 33 },
    { device: 'Tablet', errors: 5, percentage: 7 }
  ]
}

interface ErrorMonitoringDashboardProps {
  className?: string
}

export function ErrorMonitoringDashboard({ className }: ErrorMonitoringDashboardProps) {
  const [data, setData] = useState(mockErrorData)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const exportData = () => {
    const csvContent = data.recentErrors.map(error => 
      `${error.timestamp},${error.severity},${error.category},"${error.message}",${error.count}`
    ).join('\n')
    
    const blob = new Blob([`Timestamp,Severity,Category,Message,Count\n${csvContent}`], 
      { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700'
      case 'high': return 'text-orange-700'
      case 'medium': return 'text-yellow-700'
      case 'low': return 'text-blue-700'
      default: return 'text-gray-700'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Monitoring</h1>
          <p className="text-gray-600">Monitor application errors and system health</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{data.summary.totalErrors.toLocaleString()}</p>
              </div>
              <Bug className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Errors</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.criticalErrors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{data.summary.errorRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Affected Users</p>
                <p className="text-2xl font-bold">{data.summary.affectedUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{data.summary.uptimePercentage}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Error Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="errors" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Errors by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Errors by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.errorsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {data.errorsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Device Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Errors by Device Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.deviceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentErrors.map((error) => (
              <div key={error.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        className={`${getSeverityColor(error.severity)} text-white`}
                      >
                        {error.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{error.category}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{error.message}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>URL: {error.url}</p>
                      <p>User Agent: {error.userAgent}</p>
                      {error.userId && <p>User ID: {error.userId}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{error.count} occurrences</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}