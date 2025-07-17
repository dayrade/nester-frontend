"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Expand, Download, Share2, Heart, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyImage {
  id: string
  url: string
  alt: string
  caption?: string
  type?: 'exterior' | 'interior' | 'amenity' | 'floorplan'
}

interface PropertyGalleryProps {
  images: PropertyImage[]
  propertyTitle: string
  className?: string
}

export function PropertyGallery({ images, propertyTitle, className }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.type === filter)

  const currentImage = filteredImages[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const toggleFavorite = (imageId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId)
      } else {
        newFavorites.add(imageId)
      }
      return newFavorites
    })
  }

  const downloadImage = (imageUrl: string, imageName: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${propertyTitle}-${imageName}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareImage = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `Check out this property: ${propertyTitle}`,
          url: imageUrl
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(imageUrl)
    }
  }

  const imageTypes = [
    { key: 'all', label: 'All Photos', count: images.length },
    { key: 'exterior', label: 'Exterior', count: images.filter(img => img.type === 'exterior').length },
    { key: 'interior', label: 'Interior', count: images.filter(img => img.type === 'interior').length },
    { key: 'amenity', label: 'Amenities', count: images.filter(img => img.type === 'amenity').length },
    { key: 'floorplan', label: 'Floor Plans', count: images.filter(img => img.type === 'floorplan').length }
  ].filter(type => type.count > 0)

  if (!images.length) {
    return (
      <div className={cn("bg-muted rounded-lg flex items-center justify-center h-64", className)}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {imageTypes.map((type) => (
          <Button
            key={type.key}
            variant={filter === type.key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(type.key)
              setCurrentIndex(0)
            }}
          >
            {type.label}
            {type.count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {type.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
          <img
            src={currentImage?.url}
            alt={currentImage?.alt}
            className="w-full h-full object-cover"
          />
          
          {/* Image Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
            {/* Navigation Arrows */}
            {filteredImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => toggleFavorite(currentImage.id)}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  favorites.has(currentImage.id) ? "fill-red-500 text-red-500" : ""
                )} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => shareImage(currentImage.url)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => downloadImage(currentImage.url, currentImage.alt)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Expand className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0">
                  <div className="relative w-full h-full bg-black">
                    <img
                      src={currentImage?.url}
                      alt={currentImage?.alt}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Fullscreen Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsFullscreen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {filteredImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Info */}
                    {currentImage?.caption && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded">
                        <p>{currentImage.caption}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Image Counter */}
            {filteredImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Image Caption */}
        {currentImage?.caption && (
          <p className="text-sm text-muted-foreground mt-2">{currentImage.caption}</p>
        )}
      </div>

      {/* Thumbnail Strip */}
      {filteredImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filteredImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                index === currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground"
              )}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}