"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  type?: 'text' | 'property_suggestion' | 'market_analysis'
  metadata?: any
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void
  messages: Message[]
  isLoading?: boolean
  suggestions?: string[]
}

export function ChatInterface({ onSendMessage, messages, isLoading, suggestions = [] }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const defaultSuggestions = [
    "Help me write a property description",
    "Generate social media content for my listing",
    "What's the market trend in my area?",
    "Create a marketing strategy for my property"
  ]

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          AI Real Estate Assistant
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Welcome to your AI Assistant!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I can help you with property descriptions, market analysis, social media content, and more.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {activeSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left justify-start"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {message.type === "property_suggestion" && message.metadata && (
                      <div className="mt-2 p-2 bg-background/50 rounded border">
                        <div className="text-xs font-medium mb-1">Property Suggestion</div>
                        <div className="text-xs">
                          <div>Price: ${message.metadata.price?.toLocaleString()}</div>
                          <div>Location: {message.metadata.location}</div>
                          <div>Type: {message.metadata.type}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {message.role === "assistant" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.role === "user" && (
                    <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="p-2 bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about real estate..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </div>
  )
}