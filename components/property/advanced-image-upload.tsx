'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Download,
  RotateCcw,
  Settings,
  Zap,
  FileImage,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  imageProcessingPipeline, 
  ProcessingResult, 
  ProcessingOptions, 
  BatchProcessingProgress 
} from '@/lib/image-processing-pipeline'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

interface AdvancedImageUploadProps {
  propertyId?: string
  onUploadComplete?: (results: ProcessingResult[]) => void
  onUploadProgress?: (progress: BatchProcessingProgress) => void
  onError?: (error: string) => void
  maxFiles?: number
  disabled?: boolean
  className?: string
  processingOptions?: Partial<ProcessingOptions>
}

interface ImagePreview {
  id: string
  file: File
  preview: string
  status: 'pending' | 'processing' | 'success' | 'warning' | 'error'
  result?: ProcessingResult
  progress?: number
}

interface AdvancedSettings {
  optimization: {
    quality: number
    maxWidth: number
    maxHeight: number
    format: 'auto' | 'jpeg' | 'png' | 'webp'
    enableSharpening: boolean
    enableNoiseReduction: boolean
    stripExif: boolean
  }
  upload: {
    generateThumbnails: boolean
    makePublic: boolean
    enableParallelProcessing: boolean
    maxConcurrentUploads: number
  }
  validation: {
    maxFileSize: number
    checkForMalware: boolean
  }
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  optimization: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'auto',
    enableSharpening: false,
    enableNoiseReduction: false,
    stripExif: true
  },
  upload: {
    generateThumbnails: true,
    makePublic: true,
    enableParallelProcessing: true,
    maxConcurrentUploads: 3
  },
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    checkForMalware: true
  }
}

export function AdvancedImageUpload({
  propertyId,
  onUploadComplete,
  onUploadProgress,
  onError,
  maxFiles = 20,
  disabled = false,
  className,
  processingOptions
}: AdvancedImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState<BatchProcessingProgress | null>(null)
  const [settings, setSettings] = useState<AdvancedSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('upload')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview)
        }
      })
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled || isProcessing) return

    const newImages: ImagePreview[] = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))

    setImages(prev => {
      const combined = [...prev, ...newImages]
      return combined.slice(0, maxFiles)
    })
  }, [disabled, isProcessing, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles,
    disabled: disabled || isProcessing,
    multiple: true
  })

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      const removed = prev.find(img => img.id === id)
      if (removed && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    images.forEach(img => {
      if (img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages([])
    setBatchProgress(null)
  }, [images])

  const retryFailed = useCallback(async () => {
    const failedImages = images.filter(img => img.status === 'error')
    if (failedImages.length === 0) return

    await processImages(failedImages.map(img => img.file))
  }, [images])

  const processImages = useCallback(async (filesToProcess?: File[]) => {
    const files = filesToProcess || images.map(img => img.file)
    if (files.length === 0) return

    setIsProcessing(true)
    abortControllerRef.current = new AbortController()

    try {
      // Update image statuses to processing
      setImages(prev => prev.map(img => 
        files.includes(img.file) 
          ? { ...img, status: 'processing' as const, progress: 0 }
          : img
      ))

      // Prepare processing options
      const options: Partial<ProcessingOptions> = {
        ...processingOptions,
        optimization: {
          quality: settings.optimization.quality / 100,
          maxWidth: settings.optimization.maxWidth,
          maxHeight: settings.optimization.maxHeight,
          format: settings.optimization.format,
          enableSharpening: settings.optimization.enableSharpening,
          enableNoiseReduction: settings.optimization.enableNoiseReduction,
          stripExif: settings.optimization.stripExif,
          ...processingOptions?.optimization
        },
        upload: {
          generateThumbnails: settings.upload.generateThumbnails,
          makePublic: settings.upload.makePublic,
          ...processingOptions?.upload
        },
        processing: {
          enableParallelProcessing: settings.upload.enableParallelProcessing,
          maxConcurrentUploads: settings.upload.maxConcurrentUploads,
          ...processingOptions?.processing
        },
        validation: {
          maxFileSize: settings.validation.maxFileSize,
          checkForMalware: settings.validation.checkForMalware,
          ...processingOptions?.validation
        }
      }

      // Process images
      const results = await imageProcessingPipeline.processImages(
        files,
        options,
        propertyId,
        (progress) => {
          setBatchProgress(progress)
          onUploadProgress?.(progress)

          // Update individual image progress
          setImages(prev => prev.map(img => {
            if (progress.currentFile === img.file.name) {
              return { ...img, progress: progress.progress * 100 }
            }
            return img
          }))
        }
      )

      // Update images with results
      setImages(prev => prev.map(img => {
        const result = results.find(r => r.originalFile.name === img.file.name)
        if (result) {
          return {
            ...img,
            status: result.status,
            result,
            progress: 100
          }
        }
        return img
      }))

      onUploadComplete?.(results)
      setSelectedTab('results')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onError?.(errorMessage)
      
      // Mark all processing images as failed
      setImages(prev => prev.map(img => 
        img.status === 'processing' 
          ? { ...img, status: 'error' as const }
          : img
      ))
    } finally {
      setIsProcessing(false)
      setBatchProgress(null)
      abortControllerRef.current = null
    }
  }, [images, settings, processingOptions, propertyId, onUploadComplete, onUploadProgress, onError])

  const abortProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      imageProcessingPipeline.abort()
    }
  }, [])

  const getStatusIcon = (status: ImagePreview['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ImagePreview['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  const pendingCount = images.filter(img => img.status === 'pending').length
  const processingCount = images.filter(img => img.status === 'processing').length
  const successCount = images.filter(img => img.status === 'success').length
  const warningCount = images.filter(img => img.status === 'warning').length
  const errorCount = images.filter(img => img.status === 'error').length

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Processing
              {processingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {processingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Results
              {(successCount + warningCount + errorCount) > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {successCount + warningCount + errorCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Area */}
            <Card>
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <ImageIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to select files (max {maxFiles} files)
                      </p>
                    </div>
                    <Button type="button" variant="outline" disabled={disabled}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {images.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      onClick={() => processImages()}
                      disabled={isProcessing || images.length === 0}
                      size="sm"
                    >
                      {isProcessing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? 'Processing...' : 'Process Images'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
              <ScrollArea className="h-96">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                  {images.map((image) => (
                    <Card key={image.id} className={cn('relative group', getStatusColor(image.status))}>
                      <CardContent className="p-2">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Status Overlay */}
                          <div className="absolute top-2 left-2">
                            {getStatusIcon(image.status)}
                          </div>
                          
                          {/* Progress Bar */}
                          {image.status === 'processing' && image.progress !== undefined && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                              <Progress value={image.progress} className="h-1" />
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setShowPreview(image.id)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeImage(image.id)}
                                    disabled={isProcessing}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium truncate" title={image.file.name}>
                            {image.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(image.file.size)}
                          </p>
                          {image.result && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {((1 - image.result.metadata.fileSize.optimized / image.result.metadata.fileSize.original) * 100).toFixed(0)}% saved
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {batchProgress ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Processing Images</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={abortProcessing}
                        disabled={!isProcessing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {batchProgress.completed} / {batchProgress.total}</span>
                        <span>{Math.round(batchProgress.progress * 100)}%</span>
                      </div>
                      <Progress value={batchProgress.progress * 100} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current File</p>
                        <p className="font-medium truncate">{batchProgress.currentFile}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stage</p>
                        <p className="font-medium capitalize">{batchProgress.currentStage}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ETA</p>
                        <p className="font-medium">{formatTime(batchProgress.estimatedTimeRemaining)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Throughput</p>
                        <p className="font-medium">{batchProgress.throughput.toFixed(1)} files/s</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No processing in progress</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-gray-500">Successful</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                  <div className="text-sm text-gray-500">Warnings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </CardContent>
              </Card>
            </div>

            {/* Retry Failed */}
            {errorCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailed}
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Failed ({errorCount})
                </Button>
              </div>
            )}

            {/* Results List */}
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {images.filter(img => img.result).map((image) => (
                  <Card key={image.id} className={getStatusColor(image.status)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(image.status)}
                            <h4 className="font-medium truncate">{image.file.name}</h4>
                          </div>
                          
                          {image.result && (
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Original Size</p>
                                <p>{formatFileSize(image.result.metadata.fileSize.original)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Optimized Size</p>
                                <p>{formatFileSize(image.result.metadata.fileSize.optimized)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Compression</p>
                                <p>{image.result.optimization ? (image.result.optimization.compressionRatio * 100).toFixed(1) : '0.0'}%</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Processing Time</p>
                                <p>{formatTime(image.result.metadata.processingTime)}</p>
                              </div>
                            </div>
                          )}
                          
                          {image.result?.errors && image.result.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-red-600 font-medium">Errors:</p>
                              <ul className="text-sm text-red-600 list-disc list-inside">
                                {image.result.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {image.result?.warnings && image.result.warnings.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-yellow-600 font-medium">Warnings:</p>
                              <ul className="text-sm text-yellow-600 list-disc list-inside">
                                {image.result.warnings.map((warning, index) => (
                                  <li key={index}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPreview(image.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {image.result?.upload?.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(image.result!.upload!.url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Settings</DialogTitle>
              <DialogDescription>
                Configure image processing, optimization, and upload settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Optimization Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Optimization</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quality ({settings.optimization.quality}%)</Label>
                    <Slider
                      value={[settings.optimization.quality]}
                      onValueChange={([value]) => 
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, quality: value }
                        }))
                      }
                      max={100}
                      min={10}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={settings.optimization.format}
                      onValueChange={(value: any) => 
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, format: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Width (px)</Label>
                    <Slider
                      value={[settings.optimization.maxWidth]}
                      onValueChange={([value]) => 
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, maxWidth: value }
                        }))
                      }
                      max={4096}
                      min={480}
                      step={120}
                    />
                    <p className="text-sm text-gray-500">{settings.optimization.maxWidth}px</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Height (px)</Label>
                    <Slider
                      value={[settings.optimization.maxHeight]}
                      onValueChange={([value]) => 
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, maxHeight: value }
                        }))
                      }
                      max={4096}
                      min={360}
                      step={90}
                    />
                    <p className="text-sm text-gray-500">{settings.optimization.maxHeight}px</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Enable Sharpening</Label>
                    <Switch
                      checked={settings.optimization.enableSharpening}
                      onCheckedChange={(checked: boolean) => 
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, enableSharpening: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Enable Noise Reduction</Label>
                    <Switch
                      checked={settings.optimization.enableNoiseReduction}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, enableNoiseReduction: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Strip EXIF Data</Label>
                    <Switch
                      checked={settings.optimization.stripExif}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({
                          ...prev,
                          optimization: { ...prev.optimization, stripExif: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Upload Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Upload</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Generate Thumbnails</Label>
                    <Switch
                      checked={settings.upload.generateThumbnails}
                      onCheckedChange={(checked: boolean) => 
                        setSettings(prev => ({
                          ...prev,
                          upload: { ...prev.upload, generateThumbnails: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Make Public</Label>
                    <Switch
                      checked={settings.upload.makePublic}
                      onCheckedChange={(checked: boolean) => 
                        setSettings(prev => ({
                          ...prev,
                          upload: { ...prev.upload, makePublic: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Parallel Processing</Label>
                    <Switch
                      checked={settings.upload.enableParallelProcessing}
                      onCheckedChange={(checked: boolean) => 
                        setSettings(prev => ({
                          ...prev,
                          upload: { ...prev.upload, enableParallelProcessing: checked }
                        }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Max Concurrent Uploads ({settings.upload.maxConcurrentUploads})</Label>
                  <Slider
                    value={[settings.upload.maxConcurrentUploads]}
                    onValueChange={([value]) => 
                      setSettings(prev => ({
                        ...prev,
                        upload: { ...prev.upload, maxConcurrentUploads: value }
                      }))
                    }
                    max={10}
                    min={1}
                    step={1}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Validation Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Validation</h3>
                
                <div className="space-y-2">
                  <Label>Max File Size</Label>
                  <Select
                    value={settings.validation.maxFileSize.toString()}
                    onValueChange={(value) => 
                      setSettings(prev => ({
                        ...prev,
                        validation: { ...prev.validation, maxFileSize: parseInt(value) }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={(5 * 1024 * 1024).toString()}>5 MB</SelectItem>
                      <SelectItem value={(10 * 1024 * 1024).toString()}>10 MB</SelectItem>
                      <SelectItem value={(20 * 1024 * 1024).toString()}>20 MB</SelectItem>
                      <SelectItem value={(50 * 1024 * 1024).toString()}>50 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Check for Malware</Label>
                  <Switch
                    checked={settings.validation.checkForMalware}
                    onCheckedChange={(checked: boolean) => 
                      setSettings(prev => ({
                        ...prev,
                        validation: { ...prev.validation, checkForMalware: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        {showPreview && (
          <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              {(() => {
                const image = images.find(img => img.id === showPreview)
                if (!image) return null
                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="max-w-full max-h-96 object-contain rounded"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">File Name</p>
                        <p className="text-gray-600">{image.file.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">File Size</p>
                        <p className="text-gray-600">{formatFileSize(image.file.size)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Type</p>
                        <p className="text-gray-600">{image.file.type}</p>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(image.status)}
                          <span className="capitalize">{image.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    {image.result && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Processing Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Compression Ratio</p>
                            <p className="text-gray-600">{image.result.optimization ? (image.result.optimization.compressionRatio * 100).toFixed(1) : '0.0'}%</p>
                          </div>
                          <div>
                            <p className="font-medium">Processing Time</p>
                            <p className="text-gray-600">{formatTime(image.result.metadata.processingTime)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Original Size</p>
                            <p className="text-gray-600">{formatFileSize(image.result.metadata.fileSize.original)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Optimized Size</p>
                            <p className="text-gray-600">{formatFileSize(image.result.metadata.fileSize.optimized)}</p>
                          </div>
                        </div>
                        
                        {image.result.optimization?.optimizations && image.result.optimization.optimizations.length > 0 && (
                          <div>
                            <p className="font-medium">Optimizations Applied</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {image.result.optimization.optimizations.map((opt, index) => (
                                <li key={index}>{opt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}