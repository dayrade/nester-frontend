/**
 * Comprehensive image validation service
 * Handles client-side validation, EXIF data extraction, and security checks
 */

interface ImageMetadata {
  width: number
  height: number
  aspectRatio: number
  fileSize: number
  mimeType: string
  hasExif: boolean
  orientation?: number
  colorSpace?: string
  quality?: number
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata?: ImageMetadata
  suggestedOptimizations?: string[]
}

interface ValidationOptions {
  maxFileSize?: number // bytes
  maxDimensions?: { width: number; height: number }
  minDimensions?: { width: number; height: number }
  allowedMimeTypes?: string[]
  allowedAspectRatios?: { min: number; max: number }
  requireMinQuality?: boolean
  checkForMalware?: boolean
  stripExif?: boolean
}

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxDimensions: { width: 4096, height: 4096 },
  minDimensions: { width: 100, height: 100 },
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  allowedAspectRatios: { min: 0.2, max: 5.0 },
  requireMinQuality: true,
  checkForMalware: true,
  stripExif: false
}

class ImageValidationService {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
  }

  /**
   * Validate a single image file
   */
  async validateImage(file: File, options: Partial<ValidationOptions> = {}): Promise<ValidationResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const errors: string[] = []
    const warnings: string[] = []
    const suggestedOptimizations: string[] = []

    try {
      // Basic file validation
      const basicValidation = this.validateBasicProperties(file, opts)
      errors.push(...basicValidation.errors)
      warnings.push(...basicValidation.warnings)

      if (errors.length > 0) {
        return { isValid: false, errors, warnings }
      }

      // Load image and extract metadata
      const metadata = await this.extractImageMetadata(file)
      
      // Validate dimensions
      const dimensionValidation = this.validateDimensions(metadata, opts)
      errors.push(...dimensionValidation.errors)
      warnings.push(...dimensionValidation.warnings)

      // Validate aspect ratio
      const aspectRatioValidation = this.validateAspectRatio(metadata, opts)
      errors.push(...aspectRatioValidation.errors)
      warnings.push(...aspectRatioValidation.warnings)

      // Check for potential security issues
      if (opts.checkForMalware) {
        const securityValidation = await this.validateSecurity(file)
        errors.push(...securityValidation.errors)
        warnings.push(...securityValidation.warnings)
      }

      // Generate optimization suggestions
      const optimizations = this.generateOptimizationSuggestions(metadata, opts)
      suggestedOptimizations.push(...optimizations)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata,
        suggestedOptimizations
      }

    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings
      }
    }
  }

  /**
   * Validate multiple images
   */
  async validateImages(files: File[], options: Partial<ValidationOptions> = {}): Promise<ValidationResult[]> {
    const results = await Promise.all(
      files.map(file => this.validateImage(file, options))
    )
    return results
  }

  /**
   * Basic file property validation
   */
  private validateBasicProperties(file: File, options: Required<ValidationOptions>): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // File size check
    if (file.size > options.maxFileSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(options.maxFileSize)})`)
    }

    // MIME type check
    if (!options.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed. Supported types: ${options.allowedMimeTypes.join(', ')}`)
    }

    // File extension vs MIME type consistency
    const extension = file.name.split('.').pop()?.toLowerCase()
    const expectedMimeTypes: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'webp': ['image/webp'],
      'heic': ['image/heic']
    }

    if (extension && expectedMimeTypes[extension] && !expectedMimeTypes[extension].includes(file.type)) {
      warnings.push(`File extension '${extension}' doesn't match MIME type '${file.type}'`)
    }

    return { errors, warnings }
  }

  /**
   * Extract comprehensive image metadata
   */
  private async extractImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        const metadata: ImageMetadata = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          fileSize: file.size,
          mimeType: file.type,
          hasExif: false // Will be determined by EXIF check
        }

        // Check for EXIF data
        this.checkExifData(file).then(exifData => {
          metadata.hasExif = exifData.hasExif
          metadata.orientation = exifData.orientation
          resolve(metadata)
        }).catch(() => {
          resolve(metadata)
        })
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for metadata extraction'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Validate image dimensions
   */
  private validateDimensions(metadata: ImageMetadata, options: Required<ValidationOptions>): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Maximum dimensions
    if (metadata.width > options.maxDimensions.width || metadata.height > options.maxDimensions.height) {
      errors.push(`Image dimensions (${metadata.width}x${metadata.height}) exceed maximum allowed (${options.maxDimensions.width}x${options.maxDimensions.height})`)
    }

    // Minimum dimensions
    if (metadata.width < options.minDimensions.width || metadata.height < options.minDimensions.height) {
      errors.push(`Image dimensions (${metadata.width}x${metadata.height}) are below minimum required (${options.minDimensions.width}x${options.minDimensions.height})`)
    }

    // Optimal dimensions warning
    const optimalWidth = 1920
    const optimalHeight = 1080
    if (metadata.width > optimalWidth * 2 || metadata.height > optimalHeight * 2) {
      warnings.push(`Image is very large (${metadata.width}x${metadata.height}). Consider resizing for better performance.`)
    }

    return { errors, warnings }
  }

  /**
   * Validate aspect ratio
   */
  private validateAspectRatio(metadata: ImageMetadata, options: Required<ValidationOptions>): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (metadata.aspectRatio < options.allowedAspectRatios.min || metadata.aspectRatio > options.allowedAspectRatios.max) {
      errors.push(`Image aspect ratio (${metadata.aspectRatio.toFixed(2)}) is outside allowed range (${options.allowedAspectRatios.min}-${options.allowedAspectRatios.max})`)
    }

    // Common aspect ratio suggestions
    const commonRatios = [
      { ratio: 16/9, name: '16:9 (widescreen)' },
      { ratio: 4/3, name: '4:3 (standard)' },
      { ratio: 3/2, name: '3:2 (photography)' },
      { ratio: 1, name: '1:1 (square)' }
    ]

    const isCommonRatio = commonRatios.some(cr => Math.abs(metadata.aspectRatio - cr.ratio) < 0.1)
    if (!isCommonRatio) {
      warnings.push(`Unusual aspect ratio (${metadata.aspectRatio.toFixed(2)}). Consider using standard ratios for better display.`)
    }

    return { errors, warnings }
  }

  /**
   * Basic security validation
   */
  private async validateSecurity(file: File): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check file header for common image signatures
      const header = await this.readFileHeader(file, 16)
      const isValidImageHeader = this.validateImageHeader(header, file.type)
      
      if (!isValidImageHeader) {
        errors.push('File header does not match expected image format. Possible security risk.')
      }

      // Check for suspicious file size patterns
      if (file.size < 100) {
        warnings.push('File is unusually small for an image')
      }

      // Check for embedded scripts (basic check)
      const sample = await this.readFileSample(file, 1024)
      if (this.containsSuspiciousContent(sample)) {
        warnings.push('File may contain embedded content. Please verify source.')
      }

    } catch (error) {
      warnings.push('Could not perform complete security validation')
    }

    return { errors, warnings }
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(metadata: ImageMetadata, options: Required<ValidationOptions>): string[] {
    const suggestions: string[] = []

    // File size optimization
    if (metadata.fileSize > 2 * 1024 * 1024) { // 2MB
      suggestions.push('Consider compressing the image to reduce file size')
    }

    // Format optimization
    if (metadata.mimeType === 'image/png' && metadata.fileSize > 1024 * 1024) {
      suggestions.push('Consider converting PNG to JPEG or WebP for better compression')
    }

    // Dimension optimization
    if (metadata.width > 1920 || metadata.height > 1080) {
      suggestions.push('Consider resizing to web-optimal dimensions (max 1920x1080)')
    }

    // EXIF optimization
    if (metadata.hasExif) {
      suggestions.push('Consider removing EXIF data to reduce file size and protect privacy')
    }

    // Format recommendations
    if (metadata.mimeType === 'image/jpeg' && metadata.width > 1000) {
      suggestions.push('Consider using WebP format for better compression and quality')
    }

    return suggestions
  }

  /**
   * Check for EXIF data
   */
  private async checkExifData(file: File): Promise<{ hasExif: boolean; orientation?: number }> {
    try {
      const header = await this.readFileHeader(file, 65536) // Read first 64KB
      const hasExif = this.containsExifData(header)
      const orientation = hasExif ? this.extractOrientation(header) : undefined
      
      return { hasExif, orientation }
    } catch {
      return { hasExif: false }
    }
  }

  /**
   * Read file header
   */
  private async readFileHeader(file: File, bytes: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer
        resolve(new Uint8Array(arrayBuffer))
      }
      reader.onerror = () => reject(new Error('Failed to read file header'))
      reader.readAsArrayBuffer(file.slice(0, bytes))
    })
  }

  /**
   * Read file sample for content analysis
   */
  private async readFileSample(file: File, bytes: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file sample'))
      reader.readAsText(file.slice(0, bytes))
    })
  }

  /**
   * Validate image file header
   */
  private validateImageHeader(header: Uint8Array, mimeType: string): boolean {
    const signatures: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]], // RIFF...WEBP
      'image/heic': [[0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]] // ftyp heic
    }

    const expectedSignatures = signatures[mimeType]
    if (!expectedSignatures) return true // Unknown type, assume valid

    return expectedSignatures.some(signature => 
      signature.every((byte, index) => header[index] === byte)
    )
  }

  /**
   * Check if file contains EXIF data
   */
  private containsExifData(header: Uint8Array): boolean {
    // Look for EXIF marker in JPEG files
    for (let i = 0; i < header.length - 4; i++) {
      if (header[i] === 0xFF && header[i + 1] === 0xE1) {
        // Check for "Exif" string
        if (header[i + 4] === 0x45 && header[i + 5] === 0x78 && 
            header[i + 6] === 0x69 && header[i + 7] === 0x66) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Extract orientation from EXIF data
   */
  private extractOrientation(header: Uint8Array): number | undefined {
    // Simplified EXIF orientation extraction
    // This is a basic implementation - a full EXIF parser would be more robust
    for (let i = 0; i < header.length - 12; i++) {
      if (header[i] === 0x01 && header[i + 1] === 0x12) { // Orientation tag
        return header[i + 8] || 1
      }
    }
    return 1 // Default orientation
  }

  /**
   * Check for suspicious content
   */
  private containsSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(content))
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
}

// Export singleton instance
export const imageValidationService = new ImageValidationService()
export type { ImageMetadata, ValidationResult, ValidationOptions }
export default ImageValidationService