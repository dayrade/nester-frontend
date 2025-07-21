"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { MapPin, School, ShoppingCart, Coffee, Car, Train, Plane, Heart, Star, TrendingUp, Users, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface NeighborhoodData {
  id: string
  name: string
  city: string
  state: string
  description: string
  walkScore: number
  transitScore: number
  bikeScore: number
  crimeRating: number
  schoolRating: number
  medianHomePrice: number
  medianRent: number
  population: number
  demographics: {
    ageGroups: { range: string; percentage: number }[]
    income: { range: string; percentage: number }[]
  }
  amenities: {
    schools: { name: string; rating: number; distance: string; type: string }[]
    restaurants: { name: string; rating: number; distance: string; cuisine: string }[]
    shopping: { name: string; rating: number; distance: string; type: string }[]
    transportation: { name: string; type: string; distance: string }[]
    healthcare: { name: string; rating: number; distance: string; type: string }[]
  }
  marketTrends: {
    priceChange: number
    rentChange: number
    daysOnMarket: number
    inventoryLevel: string
  }
}

// Mock data - in a real app, this would come from an API
const mockNeighborhoodData: NeighborhoodData = {
  id: "downtown-seattle",
  name: "Downtown Seattle",
  city: "Seattle",
  state: "WA",
  description: "Vibrant urban neighborhood with excellent walkability, diverse dining options, and proximity to major tech companies. Perfect for professionals seeking city living.",
  walkScore: 98,
  transitScore: 85,
  bikeScore: 75,
  crimeRating: 7,
  schoolRating: 8,
  medianHomePrice: 850000,
  medianRent: 3200,
  population: 15420,
  demographics: {
    ageGroups: [
      { range: "25-34", percentage: 35 },
      { range: "35-44", percentage: 28 },
      { range: "45-54", percentage: 20 },
      { range: "55+", percentage: 17 }
    ],
    income: [
      { range: "$100k+", percentage: 45 },
      { range: "$75k-$100k", percentage: 25 },
      { range: "$50k-$75k", percentage: 20 },
      { range: "<$50k", percentage: 10 }
    ]
  },
  amenities: {
    schools: [
      { name: "Seattle Central College", rating: 8, distance: "0.3 mi", type: "Community College" },
      { name: "Lowell Elementary", rating: 9, distance: "0.8 mi", type: "Elementary" },
      { name: "Washington Middle School", rating: 7, distance: "1.2 mi", type: "Middle School" }
    ],
    restaurants: [
      { name: "The Pink Door", rating: 9, distance: "0.2 mi", cuisine: "Italian" },
      { name: "Serious Pie", rating: 8, distance: "0.4 mi", cuisine: "Pizza" },
      { name: "Canlis", rating: 10, distance: "0.6 mi", cuisine: "Fine Dining" },
      { name: "Pike Place Chowder", rating: 9, distance: "0.3 mi", cuisine: "Seafood" }
    ],
    shopping: [
      { name: "Pike Place Market", rating: 10, distance: "0.2 mi", type: "Market" },
      { name: "Westlake Center", rating: 8, distance: "0.1 mi", type: "Mall" },
      { name: "Pacific Place", rating: 8, distance: "0.3 mi", type: "Shopping Center" }
    ],
    transportation: [
      { name: "Westlake Station", type: "Light Rail", distance: "0.1 mi" },
      { name: "University Street Station", type: "Light Rail", distance: "0.2 mi" },
      { name: "Seattle Streetcar", type: "Streetcar", distance: "0.1 mi" }
    ],
    healthcare: [
      { name: "Harborview Medical Center", rating: 9, distance: "0.8 mi", type: "Hospital" },
      { name: "Swedish Medical Center", rating: 8, distance: "1.2 mi", type: "Hospital" },
      { name: "Downtown Medical Clinic", rating: 8, distance: "0.3 mi", type: "Clinic" }
    ]
  },
  marketTrends: {
    priceChange: 5.2,
    rentChange: 3.8,
    daysOnMarket: 18,
    inventoryLevel: "Low"
  }
}

export default function NeighborhoodPage() {
  const params = useParams()
  const [neighborhoodData, setNeighborhoodData] = useState<NeighborhoodData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNeighborhoodData(mockNeighborhoodData)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!neighborhoodData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Neighborhood Not Found</h1>
          <p className="text-gray-600">The neighborhood you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{neighborhoodData.city}, {neighborhoodData.state}</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{neighborhoodData.name}</h1>
        <p className="text-lg text-gray-600 max-w-3xl">{neighborhoodData.description}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Walk Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(neighborhoodData.walkScore)}`}>
                  {neighborhoodData.walkScore}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getScoreBg(neighborhoodData.walkScore)}`}>
                <Car className={`h-6 w-6 ${getScoreColor(neighborhoodData.walkScore)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transit Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(neighborhoodData.transitScore)}`}>
                  {neighborhoodData.transitScore}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getScoreBg(neighborhoodData.transitScore)}`}>
                <Train className={`h-6 w-6 ${getScoreColor(neighborhoodData.transitScore)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Median Home Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(neighborhoodData.medianHomePrice)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Population</p>
                <p className="text-2xl font-bold text-gray-900">
                  {neighborhoodData.population.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="amenities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="amenities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coffee className="h-5 w-5 mr-2" />
                  Restaurants & Dining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {neighborhoodData.amenities.restaurants.map((restaurant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.distance}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shopping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shopping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {neighborhoodData.amenities.shopping.map((shop, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-gray-600">{shop.type} • {shop.distance}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{shop.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="h-5 w-5 mr-2" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {neighborhoodData.amenities.transportation.map((transport, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{transport.name}</p>
                        <p className="text-sm text-gray-600">{transport.distance}</p>
                      </div>
                      <Badge variant="outline">{transport.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Healthcare */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Healthcare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {neighborhoodData.amenities.healthcare.map((health, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{health.name}</p>
                        <p className="text-sm text-gray-600">{health.type} • {health.distance}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{health.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="h-5 w-5 mr-2" />
                Schools & Education
              </CardTitle>
              <CardDescription>
                School rating: {neighborhoodData.schoolRating}/10
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {neighborhoodData.amenities.schools.map((school, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-gray-600">{school.type} • {school.distance}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{school.rating}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price Change (YoY)</span>
                  <span className={`font-medium ${
                    neighborhoodData.marketTrends.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {neighborhoodData.marketTrends.priceChange > 0 ? '+' : ''}
                    {neighborhoodData.marketTrends.priceChange}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rent Change (YoY)</span>
                  <span className={`font-medium ${
                    neighborhoodData.marketTrends.rentChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {neighborhoodData.marketTrends.rentChange > 0 ? '+' : ''}
                    {neighborhoodData.marketTrends.rentChange}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days on Market</span>
                  <span className="font-medium">{neighborhoodData.marketTrends.daysOnMarket} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Inventory Level</span>
                  <Badge variant={neighborhoodData.marketTrends.inventoryLevel === 'Low' ? 'destructive' : 'default'}>
                    {neighborhoodData.marketTrends.inventoryLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Median Home Price</span>
                    <span className="font-medium">{formatCurrency(neighborhoodData.medianHomePrice)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Median Rent</span>
                    <span className="font-medium">{formatCurrency(neighborhoodData.medianRent)}/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {neighborhoodData.demographics.ageGroups.map((group, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{group.range}</span>
                      <span className="text-sm font-medium">{group.percentage}%</span>
                    </div>
                    <Progress value={group.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {neighborhoodData.demographics.income.map((income, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{income.range}</span>
                      <span className="text-sm font-medium">{income.percentage}%</span>
                    </div>
                    <Progress value={income.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}