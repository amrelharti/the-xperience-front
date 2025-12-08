"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import { useToast } from "@/hooks/use-toast"

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
        throw new Error("Failed to get response")
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          } w-[400px]`}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">CV Scoring Assistant</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <div 
                    className="h-full overflow-y-auto p-4" 
                    ref={scrollAreaRef}
                  >
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Input */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about CV scoring..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

