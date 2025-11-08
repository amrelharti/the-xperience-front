"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, MessageSquare, FileText, HelpCircle, Megaphone, BookOpen, Sparkles, Upload, Image as ImageIcon } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { useUser } from "@/app/hooks/useUser"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import Navbar from "@/app/components/Navbar"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  title: string
  description: string
  trainingId: string
  trainingTitle: string
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/training-modules`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (error) {
      console.error("Error loading training modules:", error)
      toast({
        title: "Error",
        description: "Failed to load training modules",
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
      case 'WEEKLY_SUMMARY': return <BookOpen className="h-4 w-4" />
      case 'FEEDBACK': return <MessageSquare className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  if (modulesLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#0476D7] mx-auto mb-4"></div>
              <MessageSquare className="h-6 w-6 text-[#0476D7] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-600 font-medium">Loading modules...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        {/* Header */}
        <Navbar />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#0476D7] via-[#0068A7] to-[#005A8F] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFBC00]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button 
                variant="ghost" 
                asChild 
                className="mb-6 text-white hover:bg-white/10 border border-white/20"
              >
                <Link href={feedUrl}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Feed
                </Link>
              </Button>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-[#FFBC00]" />
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-1">Create New Post</h1>
                  <p className="text-blue-100 text-lg">Share your thoughts, ask questions, or submit assignments</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0476D7] to-[#0068A7] flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Post Details</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Choose the type of post you want to create and fill in the details below.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Post Type */}
                <div className="space-y-3">
                  <Label htmlFor="postType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-[#0476D7] to-[#0068A7] flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-white" />
                    </div>
                    Post Type *
                  </Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl">
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          Regular Post
                        </div>
                      </SelectItem>
                      <SelectItem value="ASSIGNMENT">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          Assignment Submission
                        </div>
                      </SelectItem>
                      <SelectItem value="WEEKLY_SUMMARY">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-500" />
                          Weekly Summary
                        </div>
                      </SelectItem>
                      <SelectItem value="FEEDBACK">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-purple-500" />
                          Feedback
                        </div>
                      </SelectItem>
                      {user?.role === 'ADMIN' && (
                        <SelectItem value="ANNOUNCEMENT">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-orange-500" />
                            Announcement
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Training Module Selection */}
                <div className="space-y-3">
                  <Label htmlFor="module" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-white" />
                    </div>
                    Training Module <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl">
                      <SelectValue placeholder="Select a training module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          No specific module
                        </div>
                      </SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#0476D7]"></div>
                            {module.title} <span className="text-gray-500">({module.trainingTitle})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-[#FFBC00] to-orange-500 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                    Title <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your post"
                    maxLength={255}
                    className="h-12 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                  />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <Label htmlFor="content" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-white" />
                    </div>
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind? Share your thoughts, ask questions, or describe your assignment..."
                    rows={8}
                    className="resize-none border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Upload className="h-3 w-3 text-white" />
                    </div>
                    Attachments <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#0476D7] transition-colors bg-gradient-to-br from-gray-50 to-blue-50/20">
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
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or paste URLs below</span>
                      </div>
                    </div>
                    <Textarea
                      id="attachments"
                      value={attachments}
                      onChange={(e) => setAttachments(e.target.value)}
                      placeholder="Links to files, images, or other resources"
                      rows={2}
                      className="resize-none border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                    />
                  </div>
                </div>

                {/* Assignment posts are automatically marked as assignments for leaderboard */}
                {postType === "ASSIGNMENT" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-700 font-semibold">Assignment Submission</p>
                        <p className="text-blue-600 text-sm">Automatically counts for leaderboard points</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 h-12 bg-gradient-to-r from-[#0476D7] to-[#0068A7] hover:from-[#0068A7] hover:to-[#005A8F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Creating Post...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Create Post
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    asChild
                    className="h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200"
                  >
                    <Link href={feedUrl}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>
    </RequireAuth>
  )
}
