export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          agent_id: string
          address: string
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          property_type: string
          description: string | null
          features: string[] | null
          neighborhood_info: string | null
          year_built: number | null
          lot_size: number | null
          garage_spaces: number | null
          heating_type: string | null
          cooling_type: string | null
          flooring_types: string[] | null
          listing_url: string | null
          listing_platform: string | null
          listing_status: string
          listing_agent_name: string | null
          listing_agent_phone: string | null
          listing_agent_email: string | null
          scraping_job_id: string | null
          scraping_completed_at: string | null
          scraping_error: string | null
          content_generation_job_id: string | null
          content_generation_status: string | null
          content_generation_started_at: string | null
          content_generation_completed_at: string | null
          source_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          address: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          property_type?: string
          description?: string | null
          features?: string[] | null
          neighborhood_info?: string | null
          year_built?: number | null
          lot_size?: number | null
          garage_spaces?: number | null
          heating_type?: string | null
          cooling_type?: string | null
          flooring_types?: string[] | null
          listing_url?: string | null
          listing_platform?: string | null
          listing_status?: string
          listing_agent_name?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          scraping_job_id?: string | null
          scraping_completed_at?: string | null
          scraping_error?: string | null
          content_generation_job_id?: string | null
          content_generation_status?: string | null
          content_generation_started_at?: string | null
          content_generation_completed_at?: string | null
          source_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          address?: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          property_type?: string
          description?: string | null
          features?: string[] | null
          neighborhood_info?: string | null
          year_built?: number | null
          lot_size?: number | null
          garage_spaces?: number | null
          heating_type?: string | null
          cooling_type?: string | null
          flooring_types?: string[] | null
          listing_url?: string | null
          listing_platform?: string | null
          listing_status?: string
          listing_agent_name?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          scraping_job_id?: string | null
          scraping_completed_at?: string | null
          scraping_error?: string | null
          content_generation_job_id?: string | null
          content_generation_status?: string | null
          content_generation_started_at?: string | null
          content_generation_completed_at?: string | null
          source_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_brands: {
        Row: {
          agent_id: string
          has_custom_branding: boolean
          brand_tier: string
          company_name: string | null
          logo_storage_path: string | null
          primary_color: string | null
          secondary_color: string | null
          font_family: string | null
          persona_tone: string
          persona_style: string
          persona_key_phrases: string[] | null
          persona_phrases_to_avoid: string[] | null
          nester_logo_path: string
          nester_primary_color: string
          nester_secondary_color: string
          nester_font_family: string
          created_at: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          has_custom_branding?: boolean
          brand_tier?: string
          company_name?: string | null
          logo_storage_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          font_family?: string | null
          persona_tone?: string
          persona_style?: string
          persona_key_phrases?: string[] | null
          persona_phrases_to_avoid?: string[] | null
          nester_logo_path?: string
          nester_primary_color?: string
          nester_secondary_color?: string
          nester_font_family?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          has_custom_branding?: boolean
          brand_tier?: string
          company_name?: string | null
          logo_storage_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          font_family?: string | null
          persona_tone?: string
          persona_style?: string
          persona_key_phrases?: string[] | null
          persona_phrases_to_avoid?: string[] | null
          nester_logo_path?: string
          nester_primary_color?: string
          nester_secondary_color?: string
          nester_font_family?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_brands_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          room_type: string | null
          style: string | null
          aspect_ratio: string | null
          storage_path: string
          is_hero: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          room_type?: string | null
          style?: string | null
          aspect_ratio?: string | null
          storage_path: string
          is_hero?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          room_type?: string | null
          style?: string | null
          aspect_ratio?: string | null
          storage_path?: string
          is_hero?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      social_posts: {
        Row: {
          id: string
          property_id: string
          week_theme: string | null
          archetype: string | null
          copy_text: string | null
          image_path: string | null
          platform: string | null
          scheduled_time: string | null
          posted_time: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          week_theme?: string | null
          archetype?: string | null
          copy_text?: string | null
          image_path?: string | null
          platform?: string | null
          scheduled_time?: string | null
          posted_time?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          week_theme?: string | null
          archetype?: string | null
          copy_text?: string | null
          image_path?: string | null
          platform?: string | null
          scheduled_time?: string | null
          posted_time?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      social_stats: {
        Row: {
          post_id: string
          property_id: string
          platform: string | null
          post_date: string | null
          impressions: number
          engagements: number
          clicks: number
          shares: number
        }
        Insert: {
          post_id: string
          property_id: string
          platform?: string | null
          post_date?: string | null
          impressions?: number
          engagements?: number
          clicks?: number
          shares?: number
        }
        Update: {
          post_id?: string
          property_id?: string
          platform?: string | null
          post_date?: string | null
          impressions?: number
          engagements?: number
          clicks?: number
          shares?: number
        }
        Relationships: [
          {
            foreignKeyName: "social_stats_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_sessions: {
        Row: {
          session_id: string
          property_id: string
          user_email: string | null
          questions_asked: string[] | null
          interests_detected: string[] | null
          session_duration: number | null
          created_at: string
          retention_expires_at: string | null
        }
        Insert: {
          session_id?: string
          property_id: string
          user_email?: string | null
          questions_asked?: string[] | null
          interests_detected?: string[] | null
          session_duration?: number | null
          created_at?: string
          retention_expires_at?: string | null
        }
        Update: {
          session_id?: string
          property_id?: string
          user_email?: string | null
          questions_asked?: string[] | null
          interests_detected?: string[] | null
          session_duration?: number | null
          created_at?: string
          retention_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional type definitions for the application
export type User = Database['public']['Tables']['users']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type AgentBrand = Database['public']['Tables']['agent_brands']['Row']
export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type SocialPost = Database['public']['Tables']['social_posts']['Row']
export type SocialStats = Database['public']['Tables']['social_stats']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']

// Brand resolution types
export interface BrandAssets {
  mode: 'white_label' | 'nester_default'
  logo: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  companyName: string
  persona: {
    tone: string
    style: string
    keyPhrases: string[]
    avoidPhrases: string[]
  }
}

// Property processing types
export interface PropertyData {
  address: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  description?: string
  images?: File[]
  sourceUrl?: string
}

// Social media types
export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter' | 'bluesky' | 'threads'
export type PostArchetype = 'feature_spotlight' | 'before_after' | 'local_gem' | 'data_insight' | 'poll_question' | 'lifestyle_story' | 'meet_expert'
export type ImageStyle = 'contemporary' | 'bohemian' | 'traditional' | 'scandinavian'
export type AspectRatio = '1:1' | '9:16' | '16:9'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// N8N workflow types
export interface N8NWorkflowTrigger {
  propertyId: string
  agentId: string
  workflowType: 'property_ingestion' | 'content_generation' | 'social_campaign' | 'analytics_collection'
  data: any
}

// Enum types
export type UserRole = 'agent' | 'admin' | 'viewer'
export type PropertyType = 'house' | 'condo' | 'townhouse' | 'apartment' | 'land' | 'commercial'
export type ListingStatus = 'active' | 'pending' | 'sold' | 'off_market' | 'coming_soon'
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
export type BrandTier = 'basic' | 'professional' | 'enterprise'

// Extended types with relationships
export interface PropertyWithImages extends Property {
  property_images: PropertyImage[]
}

export interface PropertyWithImagesAndPosts extends PropertyWithImages {
  social_posts: SocialPost[]
}

export interface SocialPostWithStats extends SocialPost {
  social_stats: SocialStats[]
}

export interface SocialPostWithProperty extends SocialPost {
  properties: Property
}

// Chat message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    property_id?: string
    action?: string
    [key: string]: any
  }
}

// Property scraping types
export interface ScrapingResult {
  title: string
  description?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  address?: string
  city?: string
  state?: string
  zip_code?: string
  images?: string[]
  features?: string[]
  mls_number?: string
  [key: string]: any
}

// Content generation types
export interface ContentGenerationResult {
  ai_description: string
  ai_features: string[]
  ai_marketing_points: string[]
  seo_keywords: string[]
  social_posts: {
    platform: SocialPlatform
    content: string
    hashtags: string[]
  }[]
}

// Analytics types
export interface AnalyticsData {
  totalProperties: number
  totalPosts: number
  totalViews: number
  totalEngagement: number
  averagePrice: number
  propertiesByStatus: Record<ListingStatus, number>
  propertiesByType: Record<PropertyType, number>
  postsByPlatform: Record<SocialPlatform, number>
  topPerformingPosts: SocialPostWithStats[]
  recentActivity: any[]
}

// Form types
export interface PropertyFormData {
  title: string
  description: string
  property_type: PropertyType
  listing_status: ListingStatus
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  lot_size: number
  year_built: number
  listing_url: string
  images?: File[]
  existingImages?: PropertyImage[]
  newImages?: File[]
  deletedImageIds?: string[]
}

// Notification types
export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  property_alerts: boolean
  social_media_alerts: boolean
  content_generation_alerts: boolean
}

// User profile types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  bio?: string
  website?: string
  license_number?: string
  brokerage?: string
  role: UserRole
  created_at: string
  updated_at: string
}