import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { ImageFile } from '@/components/property/enhanced-image-upload'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UploadResult {
  success: boolean
  imageId?: string
  url?: string
  error?: string
}

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
  maxRetries?: number
  retryDelay?: number
}

class UploadService {
  private supabase = createClientComponentClient<Database>()
  private activeUploads = new Map<string, AbortController>()

  /**
   * Upload a single image with retry logic and progress tracking
   */
  async uploadPropertyImage(
    propertyId: string,
    agentId: string,
    imageFile: ImageFile,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      onProgress,
      onSuccess,
      onError,
      maxRetries = 3,
      retryDelay = 1000
    } = options

    let attempt = 0
    let lastError: string = ''

    while (attempt < maxRetries) {
      try {
        const result = await this.attemptUpload(
          propertyId,
          agentId,
          imageFile,
          onProgress
        )
        
        if (result.success) {
          onSuccess?.(result)
          return result
        }
        
        lastError = result.error || 'Upload failed'
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }
      
      attempt++
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1)
        await this.delay(delay)
      }
    }
    
    const finalError = `Upload failed after ${maxRetries} attempts: ${lastError}`
    onError?.(finalError)
    return { success: false, error: finalError }
  }

  /**
   * Upload multiple images with concurrent processing
   */
  async uploadPropertyImages(
    propertyId: string,
    agentId: string,
    images: ImageFile[],
    onImageProgress?: (imageId: string, progress: UploadProgress) => void,
    onImageComplete?: (imageId: string, result: UploadResult) => void,
    maxConcurrent: number = 3
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    const semaphore = new Semaphore(maxConcurrent)
    
    const uploadPromises = images.map(async (image, index) => {
      await semaphore.acquire()
      
      try {
        const result = await this.uploadPropertyImage(
          propertyId,
          agentId,
          image,
          {
            onProgress: (progress) => onImageProgress?.(image.id, progress),
            onSuccess: (result) => onImageComplete?.(image.id, result),
            onError: (error) => onImageComplete?.(image.id, { success: false, error })
          }
        )
        
        results[index] = result
        return result
        
      } finally {
        semaphore.release()
      }
    })
    
    await Promise.all(uploadPromises)
    return results
  }

  /**
   * Cancel an ongoing upload
   */
  cancelUpload(imageId: string): void {
    const controller = this.activeUploads.get(imageId)
    if (controller) {
      controller.abort()
      this.activeUploads.delete(imageId)
    }
  }

  /**
   * Cancel all ongoing uploads
   */
  cancelAllUploads(): void {
    this.activeUploads.forEach(controller => controller.abort())
    this.activeUploads.clear()
  }

  /**
   * Fetch property images from backend API
   */
  async getPropertyImages(propertyId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch images' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch images')
      }

      return result.data || []

    } catch (error) {
      console.error('Error fetching property images:', error)
      throw error
    }
  }

  /**
   * Delete a property image via backend API
   */
  async deletePropertyImage(propertyId: string, imageId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete image' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.success || false

    } catch (error) {
      console.error('Error deleting property image:', error)
      throw error
    }
  }

  /**
   * Attempt a single upload
   */
  private async attemptUpload(
    propertyId: string,
    agentId: string,
    imageFile: ImageFile,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const controller = new AbortController()
    this.activeUploads.set(imageFile.id, controller)

    try {
      // Generate unique file path
      const timestamp = Date.now()
      const fileExt = imageFile.file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${propertyId}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

      // Upload to Supabase Storage with progress tracking
      const { data: uploadData, error: uploadError } = await this.uploadWithProgress(
        'property-images',
        fileName,
        imageFile.file,
        controller.signal,
        onProgress
      )

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('property-images')
        .getPublicUrl(fileName)

      // Create database record
      const { data: imageRecord, error: dbError } = await this.supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          agent_id: agentId,
          image_url: urlData.publicUrl,
          storage_path: fileName,
          original_filename: imageFile.file.name,
          file_size: imageFile.size,
          mime_type: imageFile.file.type,
          is_primary: false, // Will be set separately
          display_order: 0 // Will be updated based on position
        })
        .select('*')
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage
          .from('property-images')
          .remove([fileName])
        
        throw new Error(`Database insert failed: ${dbError.message}`)
      }

      return {
        success: true,
        imageId: imageRecord.id,
        url: urlData.publicUrl
      }

    } catch (error) {
      if (controller.signal.aborted) {
        return { success: false, error: 'Upload cancelled' }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
      
    } finally {
      this.activeUploads.delete(imageFile.id)
    }
  }

  /**
   * Upload file with progress tracking
   */
  private async uploadWithProgress(
    bucket: string,
    path: string,
    file: File,
    signal: AbortSignal,
    onProgress?: (progress: UploadProgress) => void
  ) {
    // For now, use Supabase's built-in upload
    // In the future, this could be enhanced with XMLHttpRequest for better progress tracking
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    // Simulate progress for now (Supabase doesn't provide upload progress)
    if (onProgress && !error) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 })
    }

    return { data, error }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    imageId: string,
    updates: {
      is_primary?: boolean
      display_order?: number
      alt_text?: string
    }
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('property_images')
        .update(updates)
        .eq('id', imageId)

      return !error
    } catch {
      return false
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      // Get image record first
      const { data: image, error: fetchError } = await this.supabase
        .from('property_images')
        .select('storage_path')
        .eq('id', imageId)
        .single()

      if (fetchError || !image) {
        return false
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('property-images')
        .remove([image.storage_path])

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('property_images')
        .delete()
        .eq('id', imageId)

      return !storageError && !dbError
    } catch {
      return false
    }
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Simple semaphore implementation for controlling concurrency
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
      return
    }

    return new Promise(resolve => {
      this.waiting.push(resolve)
    })
  }

  release(): void {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!
      resolve()
    } else {
      this.permits++
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService()
export type { UploadProgress, UploadResult, UploadOptions }
export default UploadService