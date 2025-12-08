"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Send, Loader2, Minimize2, Maximize2, Bot, User, Upload, FileText, XCircle } from "lucide-react"
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
  const [cvText, setCvText] = useState<string | null>(null)
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const { toast } = useToast()

  // Load conversation history on mount
  useEffect(() => {
    if (user && isOpen) {
      loadConversationHistory()
    }
  }, [user, isOpen])

  // Check for CV from cv-scorer page on mount and listen for new uploads
  useEffect(() => {
    // Check localStorage for recent CV
    const checkStoredCV = () => {
      try {
        const stored = localStorage.getItem("cv-scorer-cv-context")
        if (stored) {
          const cvData = JSON.parse(stored)
          // Only use if uploaded within last 24 hours
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
          if (cvData.timestamp > oneDayAgo && cvData.text) {
            setCvText(cvData.text)
            setCvFileName(cvData.fileName || "CV from CV Scorer")
          } else {
            // Remove old CV data
            localStorage.removeItem("cv-scorer-cv-context")
          }
        }
      } catch (error) {
        console.error("Error loading stored CV:", error)
      }
    }

    checkStoredCV()

    // Listen for new CV uploads from cv-scorer page
    const handleCVUploaded = (event: CustomEvent) => {
      const cvData = event.detail
      if (cvData.text) {
        setCvText(cvData.text)
        setCvFileName(cvData.fileName || "CV from CV Scorer")
        toast({
          title: "CV loaded",
          description: "Your CV from the CV scorer is now available in the chat.",
        })
      }
    }

    window.addEventListener("cv-uploaded" as any, handleCVUploaded as EventListener)

    return () => {
      window.removeEventListener("cv-uploaded" as any, handleCVUploaded as EventListener)
    }
  }, [])

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
          cvContext: cvText || undefined,
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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import pdfjs-dist only on client side
      const pdfjsLib = await import("pdfjs-dist")
      
      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
        fullText += pageText + "\n"
      }

      return fullText.trim()
    } catch (error) {
      console.error("Error extracting PDF text:", error)
      throw new Error("Failed to extract text from PDF. Please ensure it's a valid PDF file.")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    setIsExtractingPdf(true)
    try {
      const extractedText = await extractTextFromPDF(file)
      setCvText(extractedText)
      setCvFileName(file.name)
      toast({
        title: "CV uploaded successfully",
        description: `"${file.name}" is now available for the chat to reference.`,
      })
    } catch (error) {
      console.error("Error processing PDF:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process PDF file",
        variant: "destructive",
      })
    } finally {
      setIsExtractingPdf(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveCV = () => {
    setCvText(null)
    setCvFileName(null)
    toast({
      title: "CV removed",
      description: "The CV context has been cleared.",
    })
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl z-50 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110 hover:shadow-3xl"
          size="icon"
        >
          <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out",
            // Mobile: full screen or nearly full screen
            "inset-4 sm:inset-auto",
            // Desktop positioning
            "sm:bottom-6 sm:right-6",
            // Mobile: full height, desktop: fixed height
            isMinimized 
              ? "h-14 w-full sm:w-[320px]" 
              : "h-[calc(100vh-2rem)] sm:h-[650px] w-full sm:w-[420px]"
          )}
        >
          <Card className="h-full flex flex-col shadow-2xl border-2 border-border/50 bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between space-y-0 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent transition-all",
                isMinimized ? "py-2.5 px-3 sm:px-4" : "pb-3 px-4"
              )}
            >
              {isMinimized ? (
                <>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold truncate leading-tight">CV Scoring Assistant</CardTitle>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted/80 rounded-md"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold truncate">CV Scoring Assistant</CardTitle>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Online • Ready to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted/80"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      <Minimize2 className="h-4 w-4" />
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
                </>
              )}
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
                  <div 
                    className="h-full overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-6 scroll-smooth" 
                    ref={scrollAreaRef}
                  >
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-6 sm:py-8 px-4">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Start a conversation</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
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
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                          <div
                            className={cn(
                              "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm",
                              message.role === "user"
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                                : "bg-card border border-border/50 text-card-foreground rounded-tl-sm"
                            )}
                          >
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <p className={cn(
                            "text-[10px] sm:text-xs text-muted-foreground px-1",
                            message.role === "user" ? "text-right" : "text-left"
                          )}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start animate-in fade-in">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
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

                {/* CV Context Banner */}
                {cvText && (
                  <div className="border-t bg-primary/5 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">
                        CV: {cvFileName || "Uploaded CV"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                      onClick={handleRemoveCV}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Input */}
                <div className="border-t bg-background/95 backdrop-blur-sm p-3 sm:p-4">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isExtractingPdf}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0 border-2 hover:bg-muted"
                      title="Upload CV"
                    >
                      {isExtractingPdf ? (
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={cvText ? "Ask about your CV..." : "Ask about CV scoring..."}
                      disabled={isLoading}
                      className="flex-1 border-2 focus:border-primary/50 rounded-full px-3 py-4 sm:px-4 sm:py-6 bg-background transition-all text-sm sm:text-base"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
                    {cvText ? "Chat has access to your CV" : "Press Enter to send • Upload a CV to get personalized advice"}
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

