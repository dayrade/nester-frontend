/**
 * Comprehensive image processing pipeline
 * Combines validation, optimization, and upload with advanced features
 */

import { imageValidationService, ValidationResult, ValidationOptions } from './image-validation'
import { imageOptimizationService, OptimizationResult, OptimizationOptions } from './image-optimization'
import { UploadService } from './upload-service'
import { createClient } from '@supabase/supabase-js'

interface ProcessingOptions {
  validation?: Partial<ValidationOptions>
  optimization?: Partial<OptimizationOptions>
  upload?: {
    bucket?: string
    folder?: string
    makePublic?: boolean
    generateThumbnails?: boolean
    thumbnailSizes?: Array<{ width: number; height: number; suffix: string }>
  }
  processing?: {
    enableParallelProcessing?: boolean
    maxConcurrentUploads?: number
    enableProgressTracking?: boolean
    enableErrorRecovery?: boolean
    retryAttempts?: number
    enableCaching?: boolean
  }
}

interface ProcessingResult {
  file: File
  originalFile: File
  validation: ValidationResult
  optimization?: OptimizationResult
  upload?: {
    url: string
    path: string
    thumbnails?: Array<{ size: string; url: string; path: string }>
  }
  metadata: {
    processingTime: number
    fileSize: { original: number; optimized: number }
    dimensions: { original: { width: number; height: number }; optimized: { width: number; height: number } }
    format: { original: string; optimized: string }
  }
  status: 'success' | 'warning' | 'error'
  errors: string[]
  warnings: string[]
}

interface BatchProcessingProgress {
  total: number
  completed: number
  failed: number
  currentFile: string
  currentStage: 'validation' | 'optimization' | 'upload' | 'complete'
  progress: number // 0-1
  estimatedTimeRemaining: number // milliseconds
  throughput: number // files per second
}

interface ProcessingCache {
  validationResults: Map<string, ValidationResult>
  optimizationResults: Map<string, OptimizationResult>
  uploadResults: Map<string, any>
}

const DEFAULT_PROCESSING_OPTIONS: Required<ProcessingOptions> = {
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDimensions: { width: 4096, height: 4096 },
    minDimensions: { width: 100, height: 100 },
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    allowedAspectRatios: { min: 0.2, max: 5.0 },
    requireMinQuality: true,
    checkForMalware: true,
    stripExif: false
  },
  optimization: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'auto',
    maintainAspectRatio: true,
    stripExif: true,
    progressive: true,
    lossless: false,
    targetFileSize: 0,
    enableSharpening: false,
    enableNoiseReduction: false
  },
  upload: {
    bucket: 'property-images',
    folder: '',
    makePublic: true,
    generateThumbnails: true,
    thumbnailSizes: [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 400, height: 300, suffix: 'small' },
      { width: 800, height: 600, suffix: 'medium' }
    ]
  },
  processing: {
    enableParallelProcessing: true,
    maxConcurrentUploads: 3,
    enableProgressTracking: true,
    enableErrorRecovery: true,
    retryAttempts: 3,
    enableCaching: true
  }
}

class ImageProcessingPipeline {
  private uploadService: UploadService
  private cache: ProcessingCache
  private abortController?: AbortController
  private progressCallbacks: Set<(progress: BatchProcessingProgress) => void>

  constructor() {
    this.uploadService = new UploadService()
    this.cache = {
      validationResults: new Map(),
      optimizationResults: new Map(),
      uploadResults: new Map()
    }
    this.progressCallbacks = new Set()
  }

  /**
   * Process a single image through the complete pipeline
   */
  async processImage(
    file: File, 
    options: Partial<ProcessingOptions> = {},
    propertyId?: string
  ): Promise<ProcessingResult> {
    const startTime = performance.now()
    const opts = this.mergeOptions(options)
    const errors: string[] = []
    const warnings: string[] = []
    
    let currentFile = file
    let validation: ValidationResult
    let optimization: OptimizationResult | undefined
    let upload: any

    try {
      // Stage 1: Validation
      validation = await this.validateImage(file, opts.validation)
      
      if (!validation.isValid) {
        return this.createErrorResult(file, validation, errors, warnings, startTime)
      }

      warnings.push(...validation.warnings)

      // Stage 2: Optimization (if validation passed)
      if (this.shouldOptimize(validation, opts)) {
        optimization = await this.optimizeImage(file, opts.optimization)
        currentFile = optimization.optimizedFile
        warnings.push(...optimization.optimizations)
      }

      // Stage 3: Upload
      upload = await this.uploadImage(currentFile, opts.upload, propertyId)

      // Generate thumbnails if requested
      if (opts.upload.generateThumbnails && opts.upload.thumbnailSizes) {
        upload.thumbnails = await this.generateThumbnails(
          currentFile, 
          opts.upload.thumbnailSizes, 
          opts.upload,
          propertyId
        )
      }

      const processingTime = performance.now() - startTime

      return {
        file: currentFile,
        originalFile: file,
        validation,
        optimization,
        upload,
        metadata: this.createMetadata(file, currentFile, optimization, processingTime),
        status: warnings.length > 0 ? 'warning' : 'success',
        errors,
        warnings
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown processing error')
      return this.createErrorResult(file, validation!, errors, warnings, startTime)
    }
  }

  /**
   * Process multiple images with advanced batch processing
   */
  async processImages(
    files: File[],
    options: Partial<ProcessingOptions> = {},
    propertyId?: string,
    onProgress?: (progress: BatchProcessingProgress) => void
  ): Promise<ProcessingResult[]> {
    const opts = this.mergeOptions(options)
    const results: ProcessingResult[] = []
    const startTime = performance.now()
    
    this.abortController = new AbortController()
    
    if (onProgress) {
      this.progressCallbacks.add(onProgress)
    }

    try {
      if (opts.processing.enableParallelProcessing) {
        return await this.processImagesParallel(files, opts, propertyId, startTime)
      } else {
        return await this.processImagesSequential(files, opts, propertyId, startTime)
      }
    } finally {
      if (onProgress) {
        this.progressCallbacks.delete(onProgress)
      }
      this.abortController = undefined
    }
  }

  /**
   * Process images in parallel with concurrency control
   */
  private async processImagesParallel(
    files: File[],
    options: Required<ProcessingOptions>,
    propertyId?: string,
    startTime: number = performance.now()
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = new Array(files.length)
    const semaphore = new Semaphore(options.processing.maxConcurrentUploads)
    let completed = 0
    let failed = 0

    const processFile = async (file: File, index: number): Promise<void> => {
      await semaphore.acquire()
      
      try {
        if (this.abortController?.signal.aborted) {
          throw new Error('Processing aborted')
        }

        this.updateProgress({
          total: files.length,
          completed,
          failed,
          currentFile: file.name,
          currentStage: 'validation',
          progress: completed / files.length,
          estimatedTimeRemaining: this.calculateETA(startTime, completed, files.length),
          throughput: this.calculateThroughput(startTime, completed)
        })

        const result = await this.processImage(file, options, propertyId)
        results[index] = result
        
        if (result.status === 'error') {
          failed++
        } else {
          completed++
        }

      } catch (error) {
        failed++
        results[index] = this.createErrorResult(
          file, 
          { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'], warnings: [] },
          [], 
          [], 
          performance.now()
        )
      } finally {
        semaphore.release()
      }
    }

    // Process all files
    await Promise.all(files.map(processFile))

    this.updateProgress({
      total: files.length,
      completed,
      failed,
      currentFile: 'Complete',
      currentStage: 'complete',
      progress: 1,
      estimatedTimeRemaining: 0,
      throughput: this.calculateThroughput(startTime, completed)
    })

    return results
  }

  /**
   * Process images sequentially
   */
  private async processImagesSequential(
    files: File[],
    options: Required<ProcessingOptions>,
    propertyId?: string,
    startTime: number = performance.now()
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = []
    let completed = 0
    let failed = 0

    for (const file of files) {
      if (this.abortController?.signal.aborted) {
        break
      }

      this.updateProgress({
        total: files.length,
        completed,
        failed,
        currentFile: file.name,
        currentStage: 'validation',
        progress: completed / files.length,
        estimatedTimeRemaining: this.calculateETA(startTime, completed, files.length),
        throughput: this.calculateThroughput(startTime, completed)
      })

      try {
        const result = await this.processImage(file, options, propertyId)
        results.push(result)
        
        if (result.status === 'error') {
          failed++
        } else {
          completed++
        }
      } catch (error) {
        failed++
        results.push(this.createErrorResult(
          file,
          { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'], warnings: [] },
          [],
          [],
          performance.now()
        ))
      }
    }

    this.updateProgress({
      total: files.length,
      completed,
      failed,
      currentFile: 'Complete',
      currentStage: 'complete',
      progress: 1,
      estimatedTimeRemaining: 0,
      throughput: this.calculateThroughput(startTime, completed)
    })

    return results
  }

  /**
   * Generate thumbnails for an image
   */
  private async generateThumbnails(
    file: File,
    sizes: Array<{ width: number; height: number; suffix: string }>,
    uploadOptions: Required<ProcessingOptions>['upload'],
    propertyId?: string
  ): Promise<Array<{ size: string; url: string; path: string }>> {
    const thumbnails: Array<{ size: string; url: string; path: string }> = []

    for (const size of sizes) {
      try {
        const optimizationOptions = {
          maxWidth: size.width,
          maxHeight: size.height,
          quality: 0.8,
          format: 'jpeg' as const,
          maintainAspectRatio: true
        }

        const optimized = await imageOptimizationService.optimizeImage(file, optimizationOptions)
        const thumbnailFile = new File(
          [optimized.optimizedFile],
          `${file.name.split('.')[0]}_${size.suffix}.jpg`,
          { type: 'image/jpeg' }
        )

        const uploadResult = await this.uploadService.uploadPropertyImage(
          thumbnailFile,
          propertyId || 'temp',
          {
            bucket: uploadOptions.bucket,
            folder: uploadOptions.folder ? `${uploadOptions.folder}/thumbnails` : 'thumbnails',
            makePublic: uploadOptions.makePublic
          }
        )

        thumbnails.push({
          size: `${size.width}x${size.height}`,
          url: uploadResult.url,
          path: uploadResult.path
        })
      } catch (error) {
        console.warn(`Failed to generate ${size.suffix} thumbnail:`, error)
      }
    }

    return thumbnails
  }

  /**
   * Validate image with caching
   */
  private async validateImage(file: File, options: Partial<ValidationOptions>): Promise<ValidationResult> {
    const cacheKey = this.generateCacheKey(file, 'validation', options)
    
    if (this.cache.validationResults.has(cacheKey)) {
      return this.cache.validationResults.get(cacheKey)!
    }

    const result = await imageValidationService.validateImage(file, options)
    this.cache.validationResults.set(cacheKey, result)
    
    return result
  }

  /**
   * Optimize image with caching
   */
  private async optimizeImage(file: File, options: Partial<OptimizationOptions>): Promise<OptimizationResult> {
    const cacheKey = this.generateCacheKey(file, 'optimization', options)
    
    if (this.cache.optimizationResults.has(cacheKey)) {
      return this.cache.optimizationResults.get(cacheKey)!
    }

    const result = await imageOptimizationService.optimizeImage(file, options)
    this.cache.optimizationResults.set(cacheKey, result)
    
    return result
  }

  /**
   * Upload image
   */
  private async uploadImage(
    file: File, 
    options: Required<ProcessingOptions>['upload'], 
    propertyId?: string
  ): Promise<any> {
    return await this.uploadService.uploadPropertyImage(
      file,
      propertyId || 'temp',
      {
        bucket: options.bucket,
        folder: options.folder,
        makePublic: options.makePublic
      }
    )
  }

  /**
   * Determine if optimization should be applied
   */
  private shouldOptimize(validation: ValidationResult, options: Required<ProcessingOptions>): boolean {
    if (!validation.metadata) return false
    
    const { metadata } = validation
    const { optimization } = options
    
    // Optimize if file is too large
    if (metadata.fileSize > 2 * 1024 * 1024) return true // 2MB
    
    // Optimize if dimensions are too large
    if (metadata.width > optimization.maxWidth || metadata.height > optimization.maxHeight) return true
    
    // Optimize if format conversion would be beneficial
    if (optimization.format === 'auto' || optimization.format !== this.getFormatFromMimeType(metadata.mimeType)) return true
    
    // Optimize if EXIF stripping is requested and EXIF data exists
    if (optimization.stripExif && metadata.hasExif) return true
    
    return false
  }

  /**
   * Create error result
   */
  private createErrorResult(
    file: File,
    validation: ValidationResult,
    errors: string[],
    warnings: string[],
    startTime: number
  ): ProcessingResult {
    const processingTime = performance.now() - startTime
    
    return {
      file,
      originalFile: file,
      validation,
      metadata: {
        processingTime,
        fileSize: { original: file.size, optimized: file.size },
        dimensions: { 
          original: { width: 0, height: 0 }, 
          optimized: { width: 0, height: 0 } 
        },
        format: { original: file.type, optimized: file.type }
      },
      status: 'error',
      errors: [...errors, ...validation.errors],
      warnings: [...warnings, ...validation.warnings]
    }
  }

  /**
   * Create metadata object
   */
  private createMetadata(
    originalFile: File,
    optimizedFile: File,
    optimization: OptimizationResult | undefined,
    processingTime: number
  ): ProcessingResult['metadata'] {
    return {
      processingTime,
      fileSize: {
        original: originalFile.size,
        optimized: optimizedFile.size
      },
      dimensions: {
        original: { width: 0, height: 0 }, // Would need to extract from validation
        optimized: optimization?.dimensions || { width: 0, height: 0 }
      },
      format: {
        original: originalFile.type,
        optimized: optimizedFile.type
      }
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(file: File, operation: string, options: any): string {
    const fileHash = `${file.name}-${file.size}-${file.lastModified}`
    const optionsHash = JSON.stringify(options)
    return `${operation}-${fileHash}-${btoa(optionsHash)}`
  }

  /**
   * Merge options with defaults
   */
  private mergeOptions(options: Partial<ProcessingOptions>): Required<ProcessingOptions> {
    return {
      validation: { ...DEFAULT_PROCESSING_OPTIONS.validation, ...options.validation },
      optimization: { ...DEFAULT_PROCESSING_OPTIONS.optimization, ...options.optimization },
      upload: { ...DEFAULT_PROCESSING_OPTIONS.upload, ...options.upload },
      processing: { ...DEFAULT_PROCESSING_OPTIONS.processing, ...options.processing }
    }
  }

  /**
   * Update progress for all callbacks
   */
  private updateProgress(progress: BatchProcessingProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress)
      } catch (error) {
        console.warn('Progress callback error:', error)
      }
    })
  }

  /**
   * Calculate estimated time of arrival
   */
  private calculateETA(startTime: number, completed: number, total: number): number {
    if (completed === 0) return 0
    
    const elapsed = performance.now() - startTime
    const avgTimePerItem = elapsed / completed
    const remaining = total - completed
    
    return remaining * avgTimePerItem
  }

  /**
   * Calculate processing throughput
   */
  private calculateThroughput(startTime: number, completed: number): number {
    const elapsed = (performance.now() - startTime) / 1000 // Convert to seconds
    return elapsed > 0 ? completed / elapsed : 0
  }

  /**
   * Get format from MIME type
   */
  private getFormatFromMimeType(mimeType: string): string {
    const mimeToFormat: Record<string, string> = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic'
    }
    return mimeToFormat[mimeType] || 'jpeg'
  }

  /**
   * Abort current processing
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.validationResults.clear()
    this.cache.optimizationResults.clear()
    this.cache.uploadResults.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { validation: number; optimization: number; upload: number } {
    return {
      validation: this.cache.validationResults.size,
      optimization: this.cache.optimizationResults.size,
      upload: this.cache.uploadResults.size
    }
  }
}

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this.waiting.push(resolve)
    })
  }

  release(): void {
    this.permits++
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      this.permits--
      resolve()
    }
  }
}

// Export singleton instance
export const imageProcessingPipeline = new ImageProcessingPipeline()
export type { ProcessingOptions, ProcessingResult, BatchProcessingProgress }
export default ImageProcessingPipeline