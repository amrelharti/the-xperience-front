"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, ArrowLeft, Send, BookOpen } from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  title: string
  description: string
}

export default function NewHomeworkPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [modulesLoading, setModulesLoading] = useState(true)
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadModules()
    
    // Check if moduleId is provided in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const moduleId = urlParams.get('moduleId')
    if (moduleId) {
      setSelectedModuleId(moduleId)
    }
  }, [])

  const loadModules = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (error) {
      console.error("Error loading modules:", error)
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      })
    } finally {
      setModulesLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    
    // Generate file links for attachments field
    const fileLinks = selectedFiles.map(file => {
      // In a real app, you'd upload to a file service and get URLs
      // For now, we'll just show the file names
      return `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    }).join('\n')
    
    setAttachments(fileLinks)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    
    const fileLinks = newFiles.map(file => {
      return `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    }).join('\n')
    
    setAttachments(fileLinks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedModuleId || !title.trim() || !body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      console.log("Creating homework with data:", {
        moduleId: selectedModuleId,
        title: title.trim(),
        body: body.trim(),
        attachments: attachments.trim()
      })
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/homework`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          moduleId: selectedModuleId, // This should be a valid UUID string
          title: title.trim(),
          body: body.trim(),
          attachments: attachments.trim()
        })
      })
      
      console.log("Response status:", res.status)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error response:", errorText)
        try {
          const errorJson = JSON.parse(errorText)
          toast({
            title: "Error",
            description: errorJson.error || "Failed to post homework",
            variant: "destructive",
          })
        } catch {
          toast({
            title: "Error",
            description: `Failed to post homework: ${res.status} ${res.statusText}`,
            variant: "destructive",
          })
        }
        return
      }

      if (res.ok) {
        toast({
          title: "Success",
          description: "Homework posted successfully!",
        })
        router.push("/home")
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to post homework",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error posting homework:", error)
      toast({
        title: "Error",
        description: "Failed to post homework",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (modulesLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading modules...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
            </Link>
            <div className="flex items-center gap-4">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Post New Homework</h1>
            <p className="text-muted-foreground text-lg">Share your homework with the community and get feedback</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Homework Details
              </CardTitle>
              <CardDescription>
                Fill in the details below to post your homework. Other students will be able to score it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Module Selection */}
                <div className="space-y-2">
                  <Label htmlFor="module">Module *</Label>
                  <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the module this homework belongs to
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your homework"
                    maxLength={255}
                  />
                  <p className="text-sm text-muted-foreground">
                    {title.length}/255 characters
                  </p>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label htmlFor="body">Description *</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe your homework, what you learned, challenges you faced, etc."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide a detailed description of your homework. This helps others understand your work and provide better feedback.
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="files">Upload Files (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      type="file"
                      id="files"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Click to upload files</p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, images, etc. (max 10MB each)</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <div className="space-y-1">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachments (Manual Links) */}
                <div className="space-y-2">
                  <Label htmlFor="attachments">Additional Links (Optional)</Label>
                  <Textarea
                    id="attachments"
                    value={attachments}
                    onChange={(e) => setAttachments(e.target.value)}
                    placeholder="Links to external resources, GitHub repos, etc."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include links to external resources, GitHub repositories, or other online materials
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Homework
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/home">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Posting Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Be respectful and constructive in your descriptions</p>
              <p>• Include relevant details about your learning process</p>
              <p>• Use clear, descriptive titles that help others understand your work</p>
              <p>• Attach relevant files or links when possible</p>
              <p>• Remember that others will score your homework based on quality and effort</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}
