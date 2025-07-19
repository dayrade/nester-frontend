'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { formatFileSize } from '@/lib/utils'

interface ImageFile {
  file: File
  preview: string
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface EnhancedImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_MAX_FILES = 20

export default function EnhancedImageUpload({
  images,
  onImagesChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className = ''
}: EnhancedImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client-side image optimization
  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()
      
      img.onload = () => {
        // Calculate optimal dimensions (max 1920x1080 for large images)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(optimizedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          'image/jpeg',
          0.85 // Quality
        )
      }
      
      img.onerror = () => resolve(file) // Fallback to original
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const validateFiles = useCallback((files: File[]): { valid: File[], errors: string[] } => {
    const errors: string[] = []
    const valid: File[] = []
    
    // Check total count
    if (images.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed. You're trying to add ${files.length} more to ${images.length} existing.`)
      return { valid: [], errors }
    }
    
    files.forEach((file, index) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: ${file.name} - Unsupported format. Please use JPG, PNG, WebP, or HEIC.`)
        return
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`File ${index + 1}: ${file.name} - Too large (${formatFileSize(file.size)}). Maximum size is ${formatFileSize(maxFileSize)}.`)
        return
      }
      
      // Check for duplicates
      const isDuplicate = images.some(img => 
        img.file.name === file.name && img.file.size === file.size
      )
      
      if (isDuplicate) {
        errors.push(`File ${index + 1}: ${file.name} - Duplicate file detected.`)
        return
      }
      
      valid.push(file)
    })
    
    return { valid, errors }
  }, [images, maxFiles, maxFileSize, acceptedTypes])

  const processFiles = useCallback(async (files: File[]) => {
    const { valid, errors } = validateFiles(files)
    setValidationErrors(errors)
    
    if (valid.length === 0) return
    
    // Create image objects with optimization
    const newImages: ImageFile[] = await Promise.all(
      valid.map(async (file) => {
        const optimizedFile = await optimizeImage(file)
        return {
          file: optimizedFile,
          preview: URL.createObjectURL(optimizedFile),
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'pending' as const,
          progress: 0
        }
      })
    )
    
    onImagesChange([...images, ...newImages])
  }, [images, onImagesChange, validateFiles, optimizeImage])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    processFiles(Array.from(files))
  }, [processFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }, [processFiles])

  const removeImage = useCallback((id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    onImagesChange(updatedImages)
  }, [images, onImagesChange])

  const retryUpload = useCallback((id: string) => {
    const updatedImages = images.map(img => 
      img.id === id 
        ? { ...img, status: 'pending' as const, progress: 0, error: undefined }
        : img
    )
    onImagesChange(updatedImages)
  }, [images, onImagesChange])

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-warning">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Upload Issues:</h4>
            <ul className="text-sm mt-1 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
          dragActive ? 'text-primary' : 'text-gray-400'
        }`} />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {dragActive ? 'Drop images here!' : 'Drop images here or click to upload'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Support: JPG, PNG, WebP, HEIC up to {formatFileSize(maxFileSize)} each
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Images will be automatically optimized for web • {images.length}/{maxFiles} images
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline"
          disabled={images.length >= maxFiles}
        >
          Choose Files
        </button>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Images ({images.length})</h4>
            <div className="text-sm text-gray-500">
              {images.filter(img => img.status === 'success').length} uploaded • 
              {images.filter(img => img.status === 'uploading').length} uploading • 
              {images.filter(img => img.status === 'error').length} failed
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.status === 'uploading' && (
                      <div className="text-white text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <div className="text-xs">{image.progress}%</div>
                      </div>
                    )}
                    {image.status === 'success' && (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    )}
                    {image.status === 'error' && (
                      <div className="text-white text-center">
                        <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                        <div className="text-xs">Failed</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {image.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${image.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {image.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => retryUpload(image.id)}
                      className="btn btn-sm btn-circle bg-yellow-500 hover:bg-yellow-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retry upload"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="btn btn-sm btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Image Info */}
                <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                  {formatFileSize(image.file.size)}
                </div>
                
                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 badge badge-primary badge-sm">
                    Primary
                  </div>
                )}
                
                {/* Error Message */}
                {image.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                    {image.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Export types for use in other components
export type { ImageFile, EnhancedImageUploadProps }