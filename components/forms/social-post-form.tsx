"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Image, Hash, Clock } from "lucide-react"

interface SocialPostFormData {
  content: string
  platform: string
  hashtags: string[]
  scheduledTime?: string
  images: File[]
  propertyId?: string
  isScheduled: boolean
}

interface SocialPostFormProps {
  onSubmit: (data: SocialPostFormData) => void
  properties?: Array<{ id: string; title: string }>
  isLoading?: boolean
}

export function SocialPostForm({ onSubmit, properties = [], isLoading }: SocialPostFormProps) {
  const [formData, setFormData] = useState<SocialPostFormData>({
    content: "",
    platform: "",
    hashtags: [],
    images: [],
    isScheduled: false
  })

  const [newHashtag, setNewHashtag] = useState("")

  const handleInputChange = (field: keyof SocialPostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const addHashtag = () => {
    if (newHashtag.trim() && !formData.hashtags.includes(newHashtag.trim())) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, newHashtag.trim()]
      }))
      setNewHashtag("")
    }
  }

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const generateAIContent = () => {
    // Placeholder for AI content generation
    const aiContent = "🏡 Discover your dream home! This stunning property features modern amenities and prime location. Perfect for families looking for comfort and style. #RealEstate #DreamHome #PropertyForSale"
    handleInputChange("content", aiContent)
    handleInputChange("hashtags", ["RealEstate", "DreamHome", "PropertyForSale"])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Social Media Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="all">All Platforms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {properties.length > 0 && (
            <div>
              <Label htmlFor="property">Link to Property (Optional)</Label>
              <Select value={formData.propertyId} onValueChange={(value) => handleInputChange("propertyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Post Content</Label>
              <Button type="button" variant="outline" size="sm" onClick={generateAIContent}>
                Generate AI Content
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Write your post content..."
              rows={6}
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.content.length}/280 characters
            </div>
          </div>

          <div>
            <Label>Hashtags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="Add hashtag (without #)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
              />
              <Button type="button" onClick={addHashtag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.hashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeHashtag(index)}>
                  #{hashtag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="images">Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Image className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="images" className="cursor-pointer">
                  <span className="text-sm text-gray-600">Click to upload images</span>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="schedule"
              checked={formData.isScheduled}
              onCheckedChange={(checked) => handleInputChange("isScheduled", checked)}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>

          {formData.isScheduled && (
            <div>
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Publishing..." : formData.isScheduled ? "Schedule Post" : "Publish Now"}
        </Button>
      </div>
    </form>
  )
}