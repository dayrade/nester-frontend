'use client'

import { useState, useEffect, useRef } from 'react'
import { useSupabase } from '@/lib/providers/supabase-provider'
import { useBrand } from '@/lib/providers/brand-provider'
import { ChatSession } from '@/types/supabase'
import Navbar from '@/components/navigation/navbar'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plus, 
  Trash2, 
  Home, 
  Share2, 
  BarChart3, 
  Settings,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatSessionWithMessages extends ChatSession {
  messages: Message[]
}

const QUICK_ACTIONS = [
  {
    icon: Home,
    label: 'Property Analysis',
    prompt: 'Can you analyze my property portfolio and provide insights on performance?'
  },
  {
    icon: Share2,
    label: 'Content Ideas',
    prompt: 'Generate some creative social media content ideas for my latest property listing.'
  },
  {
    icon: BarChart3,
    label: 'Market Trends',
    prompt: 'What are the current real estate market trends I should be aware of?'
  },
  {
    icon: Settings,
    label: 'Optimization Tips',
    prompt: 'How can I optimize my property listings to attract more potential buyers?'
  }
]

export default function AssistantPage() {
  const { user } = useSupabase()
  const { brandAssets } = useBrand()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSessionWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (user) {
      fetchChatSessions()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatSessions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSessions(data || [])
      
      // Load the most recent session if exists
      if (data && data.length > 0) {
        loadChatSession(data[0].session_id)
      }
    } catch (err) {
      console.error('Error fetching chat sessions:', err)
      setError('Failed to load chat sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.session_id === sessionId)
      if (!session) return
      
      // Parse messages from session data
      const sessionMessages = session.questions_asked?.map((q, i) => ({
        id: `${i}`,
        role: 'user' as const,
        content: q,
        timestamp: new Date().toISOString()
      })) || []
      
      setCurrentSession({
        ...session,
        messages: sessionMessages
      })
      setMessages(sessionMessages)
    } catch (err) {
      console.error('Error loading chat session:', err)
      setError('Failed to load chat session')
    }
  }

  const createNewSession = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          property_id: 'temp-property-id', // This needs to be updated based on actual property
          user_email: user.email,
          questions_asked: []
        })
        .select()
        .single()
      
      if (error) throw error
      
      const newSession: ChatSessionWithMessages = {
        ...data,
        messages: []
      }
      
      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)
      setMessages([])
    } catch (err) {
      console.error('Error creating new session:', err)
      setError('Failed to create new chat session')
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) return
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_email', user.email)
      
      if (error) throw error
      
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      
      if (currentSession?.session_id === sessionId) {
        setCurrentSession(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Failed to delete chat session')
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentSession || isSending) return
    
    try {
      setIsSending(true)
      setError(null)
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      }
      
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInputMessage('')
      
      // Simulate AI response (in real implementation, this would call your AI service)
      setTimeout(async () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(content),
          timestamp: new Date().toISOString()
        }
        
        const finalMessages = [...updatedMessages, aiResponse]
        setMessages(finalMessages)
        
        // Update session in database
        await updateSessionMessages(currentSession.session_id, finalMessages)
        setIsSending(false)
      }, 1500)
      
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
      setIsSending(false)
    }
  }

  const updateSessionMessages = async (sessionId: string, messages: Message[]) => {
    try {
      const userQuestions = messages.filter(m => m.role === 'user').map(m => m.content)
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          questions_asked: userQuestions,
          session_duration: messages.length * 30 // Rough estimate
        })
        .eq('session_id', sessionId)
      
      if (error) throw error
      
      // Update local sessions
      setSessions(prev => prev.map(s => 
        s.session_id === sessionId 
          ? { ...s, questions_asked: userQuestions }
          : s
      ))
    } catch (err) {
      console.error('Error updating session:', err)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // Simulate AI responses based on keywords
    const message = userMessage.toLowerCase()
    
    if (message.includes('property') && message.includes('analysis')) {
      return `Based on your property portfolio, I can see you have several active listings. Here are some key insights:\n\n• Your average listing price is performing well compared to market trends\n• Properties with professional photos get 40% more engagement\n• Consider highlighting unique features in your descriptions\n\nWould you like me to analyze a specific property in more detail?`
    }
    
    if (message.includes('content') && message.includes('social')) {
      return `Here are some creative social media content ideas for your properties:\n\n🏠 **Virtual Tour Teasers**: Short video clips highlighting key rooms\n📸 **Before & After**: Show staging transformations\n🌟 **Feature Spotlights**: Highlight unique property features\n📍 **Neighborhood Guides**: Showcase local amenities\n💡 **Home Tips**: Share maintenance and buying tips\n\nWhich type of content would you like me to help you create?`
    }
    
    if (message.includes('market') && message.includes('trend')) {
      return `Current real estate market trends to watch:\n\n📈 **Rising Interest**: Sustainable and energy-efficient homes\n🏘️ **Location Shift**: Suburban areas seeing increased demand\n💻 **Virtual Tools**: Online tours and digital closings are standard\n🎯 **Buyer Preferences**: Home offices and outdoor spaces prioritized\n📱 **Social Selling**: Instagram and TikTok driving younger buyers\n\nHow can I help you adapt your strategy to these trends?`
    }
    
    if (message.includes('optimize') || message.includes('improve')) {
      return `Here are proven strategies to optimize your property listings:\n\n📸 **Professional Photography**: High-quality images increase views by 60%\n📝 **Compelling Descriptions**: Use emotional language and highlight benefits\n💰 **Competitive Pricing**: Research comparable properties in your area\n⏰ **Optimal Timing**: List on Thursday-Sunday for maximum visibility\n🔄 **Regular Updates**: Refresh listings every 2-3 weeks\n📱 **Multi-Platform**: Share across all social media channels\n\nWhich area would you like to focus on first?`
    }
    
    return `I'm here to help you with all aspects of your real estate business! I can assist with:\n\n• Property analysis and market insights\n• Social media content creation\n• Listing optimization strategies\n• Market trend analysis\n• Lead generation tips\n• Brand development advice\n\nWhat specific area would you like to explore today?`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt)
    textareaRef.current?.focus()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar - Chat Sessions */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-sm h-full">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Chat History</h2>
                  <button 
                    onClick={createNewSession}
                    className="btn btn-sm btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-2 overflow-y-auto flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No chat sessions yet</p>
                      <button 
                        onClick={createNewSession}
                        className="btn btn-sm btn-outline mt-2"
                      >
                        Start Chatting
                      </button>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.session_id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                          currentSession?.session_id === session.session_id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => loadChatSession(session.session_id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Chat Session
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(session.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.session_id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-sm h-full flex flex-col">
              {currentSession ? (
                <>
                  {/* Chat Header */}
                  <div className="card-body p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {brandAssets?.companyName || 'Nester'} AI Assistant
                        </h3>
                        <p className="text-sm text-gray-600">
                          Your personal real estate AI assistant
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Welcome to your AI Assistant!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          I'm here to help you with property analysis, content creation, and market insights.
                        </p>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                          {QUICK_ACTIONS.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickAction(action.prompt)}
                              className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <action.icon className="h-5 w-5 text-primary" />
                                <span className="font-medium text-gray-900">
                                  {action.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-full ${
                            message.role === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          
                          <div className={`flex-1 max-w-3xl ${
                            message.role === 'user' ? 'text-right' : ''
                          }`}>
                            <div className={`inline-block p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(message.timestamp, { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {isSending && (
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="inline-block p-3 bg-gray-100 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-gray-600">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {error && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    )}
                    
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <textarea
                          ref={textareaRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your properties, market trends, or content ideas..."
                          className="textarea textarea-bordered w-full resize-none"
                          rows={3}
                          disabled={isSending}
                        />
                      </div>
                      <button
                        onClick={() => sendMessage(inputMessage)}
                        disabled={!inputMessage.trim() || isSending}
                        className="btn btn-primary"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a chat or start a new conversation
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose from your chat history or create a new session to get started.
                    </p>
                    <button onClick={createNewSession} className="btn btn-primary">
                      <Plus className="h-4 w-4" />
                      New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}