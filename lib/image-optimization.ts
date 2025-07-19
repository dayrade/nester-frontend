/**
 * Advanced image optimization service
 * Handles compression, format conversion, resizing, and quality optimization
 */

interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1 for JPEG/WebP
  format?: 'jpeg' | 'png' | 'webp' | 'auto'
  maintainAspectRatio?: boolean
  stripExif?: boolean
  progressive?: boolean // For JPEG
  lossless?: boolean // For WebP
  targetFileSize?: number // Target size in bytes
  enableSharpening?: boolean
  enableNoiseReduction?: boolean
}

interface OptimizationResult {
  optimizedFile: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
  processingTime: number
  optimizations: string[]
}

interface ResizeOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  background?: string
}

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'auto',
  maintainAspectRatio: true,
  stripExif: true,
  progressive: true,
  lossless: false,
  targetFileSize: 0, // 0 means no target
  enableSharpening: false,
  enableNoiseReduction: false
}

class ImageOptimizationService {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private offscreenCanvas?: OffscreenCanvas
  private worker?: Worker

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d', { alpha: true })!
    
    // Configure canvas for high quality rendering
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    // Initialize OffscreenCanvas if supported
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(1, 1)
    }
  }

  /**
   * Optimize a single image
   */
  async optimizeImage(file: File, options: Partial<OptimizationOptions> = {}): Promise<OptimizationResult> {
    const startTime = performance.now()
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const optimizations: string[] = []

    try {
      // Load the image
      const img = await this.loadImage(file)
      const originalDimensions = { width: img.width, height: img.height }
      
      // Determine optimal format
      const targetFormat = this.determineOptimalFormat(file, opts)
      if (targetFormat !== this.getFileFormat(file)) {
        optimizations.push(`Format conversion: ${this.getFileFormat(file)} → ${targetFormat}`)
      }

      // Calculate optimal dimensions
      const targetDimensions = this.calculateOptimalDimensions(originalDimensions, opts)
      if (targetDimensions.width !== originalDimensions.width || targetDimensions.height !== originalDimensions.height) {
        optimizations.push(`Resize: ${originalDimensions.width}x${originalDimensions.height} → ${targetDimensions.width}x${targetDimensions.height}`)
      }

      // Resize if needed
      let processedImage = img
      if (targetDimensions.width !== originalDimensions.width || targetDimensions.height !== originalDimensions.height) {
        processedImage = await this.resizeImage(img, targetDimensions, opts)
      }

      // Apply image enhancements
      if (opts.enableSharpening || opts.enableNoiseReduction) {
        processedImage = await this.enhanceImage(processedImage, opts)
        if (opts.enableSharpening) optimizations.push('Sharpening applied')
        if (opts.enableNoiseReduction) optimizations.push('Noise reduction applied')
      }

      // Optimize quality and compression
      let optimizedFile = await this.compressImage(processedImage, targetFormat, opts)
      
      // If target file size is specified, iteratively optimize
      if (opts.targetFileSize > 0 && optimizedFile.size > opts.targetFileSize) {
        optimizedFile = await this.optimizeToTargetSize(processedImage, targetFormat, opts)
        optimizations.push(`Optimized to target size: ${this.formatFileSize(opts.targetFileSize)}`)
      }

      // Strip EXIF data if requested
      if (opts.stripExif && this.hasExifData(file)) {
        optimizations.push('EXIF data removed')
      }

      const processingTime = performance.now() - startTime
      const compressionRatio = (file.size - optimizedFile.size) / file.size

      return {
        optimizedFile,
        originalSize: file.size,
        optimizedSize: optimizedFile.size,
        compressionRatio,
        format: targetFormat,
        dimensions: targetDimensions,
        processingTime,
        optimizations
      }

    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Optimize multiple images with progress tracking
   */
  async optimizeImages(
    files: File[], 
    options: Partial<OptimizationOptions> = {},
    onProgress?: (progress: number, currentFile: string) => void
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      onProgress?.(i / files.length, file.name)
      
      try {
        const result = await this.optimizeImage(file, options)
        results.push(result)
      } catch (error) {
        // Create a fallback result for failed optimizations
        results.push({
          optimizedFile: file,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 0,
          format: this.getFileFormat(file),
          dimensions: { width: 0, height: 0 },
          processingTime: 0,
          optimizations: [`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        })
      }
    }
    
    onProgress?.(1, 'Complete')
    return results
  }

  /**
   * Resize image with advanced options
   */
  async resizeImage(img: HTMLImageElement, targetDimensions: { width: number; height: number }, options: Partial<OptimizationOptions> = {}): Promise<HTMLImageElement> {
    const { width: targetWidth, height: targetHeight } = targetDimensions
    
    // Use OffscreenCanvas for better performance if available
    const canvas = this.offscreenCanvas ? 
      new OffscreenCanvas(targetWidth, targetHeight) : 
      document.createElement('canvas')
    
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Apply advanced resampling for better quality
    if (targetWidth < img.width || targetHeight < img.height) {
      // Downscaling - use step-down approach for better quality
      return await this.stepDownResize(img, targetWidth, targetHeight)
    } else {
      // Upscaling - use bicubic interpolation simulation
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    }

    // Convert canvas back to image
    return await this.canvasToImage(canvas)
  }

  /**
   * Step-down resizing for better quality when downscaling
   */
  private async stepDownResize(img: HTMLImageElement, targetWidth: number, targetHeight: number): Promise<HTMLImageElement> {
    let currentImg = img
    let currentWidth = img.width
    let currentHeight = img.height

    // Resize in steps, never more than 50% reduction per step
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
      const stepWidth = Math.max(targetWidth, Math.floor(currentWidth * 0.5))
      const stepHeight = Math.max(targetHeight, Math.floor(currentHeight * 0.5))
      
      const canvas = document.createElement('canvas')
      canvas.width = stepWidth
      canvas.height = stepHeight
      
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(currentImg, 0, 0, stepWidth, stepHeight)
      
      currentImg = await this.canvasToImage(canvas)
      currentWidth = stepWidth
      currentHeight = stepHeight
    }

    // Final resize to exact target dimensions
    if (currentWidth !== targetWidth || currentHeight !== targetHeight) {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(currentImg, 0, 0, targetWidth, targetHeight)
      
      currentImg = await this.canvasToImage(canvas)
    }

    return currentImg
  }

  /**
   * Apply image enhancements
   */
  private async enhanceImage(img: HTMLImageElement, options: Partial<OptimizationOptions>): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Apply sharpening filter
    if (options.enableSharpening) {
      this.applySharpeningFilter(data, canvas.width, canvas.height)
    }

    // Apply noise reduction
    if (options.enableNoiseReduction) {
      this.applyNoiseReduction(data, canvas.width, canvas.height)
    }

    ctx.putImageData(imageData, 0, 0)
    return await this.canvasToImage(canvas)
  }

  /**
   * Apply sharpening filter
   */
  private applySharpeningFilter(data: Uint8ClampedArray, width: number, height: number): void {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]
    
    this.applyConvolutionFilter(data, width, height, kernel, 1)
  }

  /**
   * Apply noise reduction (simple blur)
   */
  private applyNoiseReduction(data: Uint8ClampedArray, width: number, height: number): void {
    const kernel = [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ]
    
    this.applyConvolutionFilter(data, width, height, kernel, 16)
  }

  /**
   * Apply convolution filter
   */
  private applyConvolutionFilter(data: Uint8ClampedArray, width: number, height: number, kernel: number[], divisor: number): void {
    const output = new Uint8ClampedArray(data)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              const kernelIdx = (ky + 1) * 3 + (kx + 1)
              sum += data[idx] * kernel[kernelIdx]
            }
          }
          const outputIdx = (y * width + x) * 4 + c
          output[outputIdx] = Math.max(0, Math.min(255, sum / divisor))
        }
      }
    }
    
    data.set(output)
  }

  /**
   * Compress image with specified format and quality
   */
  private async compressImage(img: HTMLImageElement, format: string, options: Partial<OptimizationOptions>): Promise<File> {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const mimeType = this.formatToMimeType(format)
    const quality = options.quality || 0.85

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `optimized.${format}`, { type: mimeType })
          resolve(file)
        }
      }, mimeType, quality)
    })
  }

  /**
   * Optimize to target file size
   */
  private async optimizeToTargetSize(img: HTMLImageElement, format: string, options: Required<OptimizationOptions>): Promise<File> {
    let quality = options.quality
    let currentFile: File
    let attempts = 0
    const maxAttempts = 10

    do {
      currentFile = await this.compressImage(img, format, { ...options, quality })
      
      if (currentFile.size <= options.targetFileSize) {
        break
      }
      
      // Reduce quality for next attempt
      quality *= 0.9
      attempts++
      
    } while (attempts < maxAttempts && quality > 0.1)

    // If still too large, try reducing dimensions
    if (currentFile.size > options.targetFileSize && attempts >= maxAttempts) {
      const scaleFactor = Math.sqrt(options.targetFileSize / currentFile.size)
      const newWidth = Math.floor(img.width * scaleFactor)
      const newHeight = Math.floor(img.height * scaleFactor)
      
      const resizedImg = await this.resizeImage(img, { width: newWidth, height: newHeight }, options)
      currentFile = await this.compressImage(resizedImg, format, { ...options, quality: 0.85 })
    }

    return currentFile
  }

  /**
   * Determine optimal format based on image characteristics
   */
  private determineOptimalFormat(file: File, options: Partial<OptimizationOptions>): string {
    if (options.format && options.format !== 'auto') {
      return options.format
    }

    const currentFormat = this.getFileFormat(file)
    
    // Keep PNG for images that likely need transparency
    if (currentFormat === 'png' && file.size < 500 * 1024) { // Small PNGs might need transparency
      return 'png'
    }

    // Use WebP for modern browsers (assume supported)
    if (this.isWebPSupported()) {
      return 'webp'
    }

    // Default to JPEG for photos
    return 'jpeg'
  }

  /**
   * Calculate optimal dimensions
   */
  private calculateOptimalDimensions(
    original: { width: number; height: number }, 
    options: Partial<OptimizationOptions>
  ): { width: number; height: number } {
    const maxWidth = options.maxWidth || DEFAULT_OPTIONS.maxWidth
    const maxHeight = options.maxHeight || DEFAULT_OPTIONS.maxHeight
    
    if (original.width <= maxWidth && original.height <= maxHeight) {
      return original
    }

    const aspectRatio = original.width / original.height
    
    let targetWidth = Math.min(original.width, maxWidth)
    let targetHeight = Math.min(original.height, maxHeight)
    
    // Maintain aspect ratio
    if (options.maintainAspectRatio !== false) {
      if (targetWidth / aspectRatio > targetHeight) {
        targetWidth = targetHeight * aspectRatio
      } else {
        targetHeight = targetWidth / aspectRatio
      }
    }
    
    return {
      width: Math.round(targetWidth),
      height: Math.round(targetHeight)
    }
  }

  /**
   * Load image from file
   */
  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Convert canvas to image
   */
  private async canvasToImage(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (canvas instanceof OffscreenCanvas) {
        canvas.convertToBlob().then(blob => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('Failed to convert canvas to image'))
          img.src = URL.createObjectURL(blob)
        })
      } else {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to convert canvas to image'))
        img.src = canvas.toDataURL()
      }
    })
  }

  /**
   * Get file format from file
   */
  private getFileFormat(file: File): string {
    const mimeToFormat: Record<string, string> = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic'
    }
    return mimeToFormat[file.type] || 'jpeg'
  }

  /**
   * Convert format to MIME type
   */
  private formatToMimeType(format: string): string {
    const formatToMime: Record<string, string> = {
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    }
    return formatToMime[format] || 'image/jpeg'
  }

  /**
   * Check if WebP is supported
   */
  private isWebPSupported(): boolean {
    const canvas = document.createElement('canvas')
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  /**
   * Check if file has EXIF data
   */
  private hasExifData(file: File): boolean {
    return file.type === 'image/jpeg' // Simplified check
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate()
    }
  }
}

// Export singleton instance
export const imageOptimizationService = new ImageOptimizationService()
export type { OptimizationOptions, OptimizationResult, ResizeOptions }
export default ImageOptimizationService