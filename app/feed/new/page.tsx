"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, MessageSquare, FileText, HelpCircle, Megaphone } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { useUser } from "@/app/hooks/useUser"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  title: string
  description: string
}

export default function NewPostPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState("none")
  const [postType, setPostType] = useState("POST")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [modulesLoading, setModulesLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { toast } = useToast()

  // Build feed URL with query parameters
  const training = searchParams.get('training')
  const classParam = searchParams.get('class')
  
  const feedUrl = useMemo(() => {
    console.log('🔍 Feed URL params - training:', training, 'class:', classParam)
    
    if (training && classParam) {
      const url = `/feed?training=${training}&class=${classParam}`
      console.log('✅ Returning filtered feed URL:', url)
      return url
    }
    console.log('❌ No params, returning default feed URL')
    return '/feed'
  }, [training, classParam])

  useEffect(() => {
    loadModules()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    // Get classId from URL parameters if available
    const classParam = searchParams.get('class')
    console.log('🔍 Creating post with classId:', classParam, 'from URL params')
    
    try {
      // Handle file upload if a file is selected
      if (selectedFile) {
        const reader = new FileReader()
        reader.onload = async () => {
          const dataUrl = reader.result as string
          
          try {
            const postData = {
              moduleId: selectedModuleId && selectedModuleId !== "none" ? selectedModuleId : null,
              classId: classParam || null,
              postType: postType,
              title: title.trim() || null,
              content: content.trim(),
              attachments: dataUrl, // Use data URL instead of text
              isAssignment: postType === "ASSIGNMENT"
            }
            console.log('📤 Sending post data:', postData)
            
            const res = await fetch(`/api/feed/posts`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(postData)
            })

            if (res.ok) {
              toast({
                title: "Success",
                description: "Post created successfully!",
              })
              router.push(feedUrl)
            } else {
              const error = await res.json()
              toast({
                title: "Error",
                description: error.error || "Failed to create post",
                variant: "destructive",
              })
            }
          } catch (fetchError) {
            console.error("Error creating post:", fetchError)
            toast({
              title: "Error",
              description: "Failed to create post",
              variant: "destructive",
            })
          } finally {
            setLoading(false)
          }
        }
        reader.onerror = () => {
          toast({
            title: "Error",
            description: "Error reading file. Please try again.",
            variant: "destructive",
          })
          setLoading(false)
        }
        reader.readAsDataURL(selectedFile)
        return
      }
      
      // If no file selected, proceed with original logic
      const postData = {
        moduleId: selectedModuleId && selectedModuleId !== "none" ? selectedModuleId : null,
        classId: classParam || null,
        postType: postType,
        title: title.trim() || null,
        content: content.trim(),
        attachments: attachments.trim() || null,
        isAssignment: postType === "ASSIGNMENT" // Automatically true for assignment posts
      }
      console.log('📤 Sending post data (no file):', postData)
      
      const res = await fetch(`/api/feed/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(postData)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Post created successfully!",
        })
        router.push(feedUrl)
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create post",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'QUESTION': return <HelpCircle className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
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
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
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
            <Link href={feedUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Create New Post</h1>
            <p className="text-muted-foreground text-lg">Share your thoughts, ask questions, or submit assignments</p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Post Details
              </CardTitle>
              <CardDescription>
                Choose the type of post you want to create and fill in the details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Post Type */}
                <div className="space-y-2">
                  <Label htmlFor="postType">Post Type *</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Regular Post
                        </div>
                      </SelectItem>
                      <SelectItem value="ASSIGNMENT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Assignment Submission
                        </div>
                      </SelectItem>
                      <SelectItem value="QUESTION">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Question
                        </div>
                      </SelectItem>
                      <SelectItem value="ANNOUNCEMENT">
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-4 w-4" />
                          Announcement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Module Selection */}
                <div className="space-y-2">
                  <Label htmlFor="module">Module (Optional)</Label>
                  <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific module</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your post"
                    maxLength={255}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Share your thoughts, ask questions, or describe your assignment..."
                    rows={8}
                    className="resize-none"
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="space-y-4">
                    <FileUpload
                      onFileSelect={setSelectedFile}
                      accept={{
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                        'application/pdf': ['.pdf'],
                        'text/*': ['.txt', '.md'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                      }}
                      placeholder="Drag and drop files here, or click to select"
                      currentFile={selectedFile}
                    />
                    <div className="text-sm text-muted-foreground">
                      Or paste URLs below:
                    </div>
                    <Textarea
                      id="attachments"
                      value={attachments}
                      onChange={(e) => setAttachments(e.target.value)}
                      placeholder="Links to files, images, or other resources"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Assignment posts are automatically marked as assignments for leaderboard */}
                {postType === "ASSIGNMENT" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <Label className="text-blue-700 font-medium">Assignment submissions automatically count for leaderboard</Label>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Post
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={feedUrl}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}
