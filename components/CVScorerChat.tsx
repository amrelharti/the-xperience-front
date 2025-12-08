"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2, Bot, User } from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function CVScorerChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const { toast } = useToast()

  // Load conversation history on mount
  useEffect(() => {
    if (user && isOpen) {
      loadConversationHistory()
    }
  }, [user, isOpen])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadConversationHistory = async () => {
    try {
      const response = await fetch("/api/chat/cv-scorer/history", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id || crypto.randomUUID(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp || Date.now()),
          }))
          setMessages(formattedMessages)
        } else {
          // Add welcome message if no history
          setMessages([
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Hello! I'm your CV scoring assistant. I can help you understand the scoring system, explain the rubric, and guide you on how to improve your CV. What would you like to know?",
              timestamp: new Date(),
            },
          ])
        }
      } else {
        // Add welcome message on error
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Hello! I'm your CV scoring assistant. I can help you understand the scoring system, explain the rubric, and guide you on how to improve your CV. What would you like to know?",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error loading conversation history:", error)
      // Add welcome message on error
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Hello! I'm your CV scoring assistant. I can help you understand the scoring system, explain the rubric, and guide you on how to improve your CV. What would you like to know?",
          timestamp: new Date(),
        },
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/cv-scorer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to get response" }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })

      // Remove user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) {
    return null // Don't show chat for unauthenticated users
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110 hover:shadow-3xl"
          size="icon"
        >
          <MessageSquare className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
            isMinimized ? "h-16 w-[400px]" : "h-[650px] w-[420px]"
          )}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2 border-border/50 bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">CV Scoring Assistant</CardTitle>
                  <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted/80"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
                  <div 
                    className="h-full overflow-y-auto px-4 py-6 space-y-6 scroll-smooth" 
                    ref={scrollAreaRef}
                  >
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Ask me anything about CV scoring, best practices, or how to improve your resume!
                        </p>
                      </div>
                    )}
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-[75%]">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 shadow-sm",
                              message.role === "user"
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                                : "bg-card border border-border/50 text-card-foreground rounded-tl-sm"
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <p className={cn(
                            "text-xs text-muted-foreground px-1",
                            message.role === "user" ? "text-right" : "text-left"
                          )}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start animate-in fade-in">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Input */}
                <div className="border-t bg-background/95 backdrop-blur-sm p-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about CV scoring..."
                      disabled={isLoading}
                      className="flex-1 border-2 focus:border-primary/50 rounded-full px-4 py-6 bg-background transition-all"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

