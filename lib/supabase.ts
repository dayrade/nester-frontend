import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Server-side client with service role key
// Only create admin client if service role key is available
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key_here'
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Property operations
  async createProperty(propertyData: Database['public']['Tables']['properties']['Insert']) {
    return await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()
  },

  async getPropertiesByAgent(agentId: string) {
    return await supabase
      .from('properties')
      .select(`
        *,
        social_posts(count)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
  },

  async getPropertyById(propertyId: string) {
    return await supabase
      .from('properties')
      .select(`
        *,
        social_posts(*),
        chat_sessions(*)
      `)
      .eq('id', propertyId)
      .single()
  },

  // Property images via backend API
  async getPropertyImages(propertyId: string) {
    try {
      const { apiClient } = await import('./api-client')
      const result = await apiClient.getPropertyImages(propertyId)
      return { data: result.data || [], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Brand operations
  async getAgentBrand(agentId: string) {
    return await supabase
      .from('agent_brands')
      .select('*')
      .eq('agent_id', agentId)
      .single()
  },

  async updateAgentBrand(agentId: string, brandData: Database['public']['Tables']['agent_brands']['Update']) {
    return await supabase
      .from('agent_brands')
      .upsert({ agent_id: agentId, ...brandData })
      .select()
      .single()
  },

  // Social media operations
  async getSocialPosts(propertyId: string) {
    return await supabase
      .from('social_posts')
      .select('*')
      .eq('property_id', propertyId)
      .order('scheduled_time', { ascending: true })
  },

  async updateSocialPostStatus(postId: string, status: string, postedTime?: string) {
    const updateData: any = { status }
    if (postedTime) updateData.posted_time = postedTime
    
    return await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', postId)
  },

  // Analytics operations
  async getSocialStats(propertyId: string) {
    return await supabase
      .from('social_stats')
      .select('*')
      .eq('property_id', propertyId)
      .order('post_date', { ascending: false })
  },

  async createSocialStat(statData: Database['public']['Tables']['social_stats']['Insert']) {
    return await supabase
      .from('social_stats')
      .insert(statData)
  },

  // Chat operations
  async getChatSessions(propertyId: string) {
    return await supabase
      .from('chat_sessions')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
  },

  async createChatSession(sessionData: Database['public']['Tables']['chat_sessions']['Insert']) {
    return await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single()
  },

  // File storage operations
  async uploadFile(bucket: string, path: string, file: File) {
    return await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
  },

  async getPublicUrl(bucket: string, path: string) {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path)
  },

  async deleteFile(bucket: string, path: string) {
    return await supabase.storage
      .from(bucket)
      .remove([path])
  },

  // Real-time subscriptions
  subscribeToPropertyUpdates(propertyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`property-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${propertyId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToSocialPosts(propertyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`social-posts-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts',
          filter: `property_id=eq.${propertyId}`
        },
        callback
      )
      .subscribe()
  }
}