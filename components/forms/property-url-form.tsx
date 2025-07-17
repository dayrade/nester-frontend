'use client'

import { useState } from 'react'
import { Link, Search } from 'lucide-react'

interface PropertyUrlFormProps {
  onSubmit?: (url: string) => void
  placeholder?: string
  className?: string
}

function PropertyUrlForm({ 
  onSubmit, 
  placeholder = "Enter property listing URL...",
  className = ""
}: PropertyUrlFormProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      await onSubmit?.(url.trim())
    } finally {
      setIsLoading(false)
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Property URL</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              className={`input input-bordered w-full pl-10 ${
                url && !isValidUrl(url) ? 'input-error' : ''
              }`}
              required
            />
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {url && !isValidUrl(url) && (
            <label className="label">
              <span className="label-text-alt text-error">Please enter a valid URL</span>
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={!url.trim() || !isValidUrl(url) || isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze Property
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default PropertyUrlForm
export { PropertyUrlForm }