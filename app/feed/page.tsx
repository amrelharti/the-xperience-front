"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Filter, 
  Search, 
  Plus,
  Pin,
  BookOpen,
  HelpCircle,
  FileText,
  Megaphone
} from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import { useDebounce } from "@/app/hooks/useDebounce"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"
import { measureApiCall } from "@/lib/performance"

interface Post {
  id: string
  type: 'POST' | 'ASSIGNMENT' | 'QUESTION' | 'ANNOUNCEMENT'
  title?: string
  content: string
  attachments?: string
  isAssignment: boolean
  isPinned: boolean
  avgScore?: number
  scoreCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    imageUrl?: string
  }
  module?: {
    id: string
    title: string
  }
  class?: {
    id: string
    name: string
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterTraining, setFilterTraining] = useState("all")
  const [filterModule, setFilterModule] = useState("all")
  const [filterClass, setFilterClass] = useState("all")
  const [trainings, setTrainings] = useState<Array<{id: string, title: string}>>([])
  const [trainingModules, setTrainingModules] = useState<Array<{id: string, title: string, trainingId: string}>>([])
  const [classes, setClasses] = useState<Array<{id: string, name: string}>>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  
  // Handle URL parameters for training and class filtering
  useEffect(() => {
    const trainingParam = searchParams.get('training')
    const classParam = searchParams.get('class')
    
    if (trainingParam) {
      // If training parameter is provided, filter by that training
      setFilterTraining(trainingParam)
    }
    
    if (classParam) {
      // If class parameter is provided, filter by that class
      setFilterClass(classParam)
    }
    
    // Mark URL parameters as processed
    setUrlParamsProcessed(true)
  }, [searchParams])

  useEffect(() => {
    // Only load posts after URL parameters have been processed
    if (urlParamsProcessed) {
      loadPosts()
    }
  }, [currentPage, debouncedSearchQuery, filterType, filterTraining, filterModule, filterClass, urlParamsProcessed])
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load all data in parallel for better performance
        await Promise.all([
          loadTrainings(),
          loadClasses(),
          loadAllTrainingModules()
        ])
    } catch (error) {
      logger.error("Failed to load initial data", {}, error as Error)
    }
    }
    
    loadInitialData()
  }, [])

  // Load training modules for the specific training from URL parameter
  useEffect(() => {
    const trainingParam = searchParams.get('training')
    if (trainingParam) {
      loadTrainingModulesForTraining(trainingParam)
    }
  }, [searchParams])

  const loadPosts = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: "10"
      })

      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim())
      }
      if (filterType !== "all") {
        params.append("type", filterType)
      }
      if (filterModule !== "all") {
        params.append("moduleId", filterModule)
      }
      if (filterClass !== "all") {
        params.append("classId", filterClass)
      }

      const finalUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed?${params}`
      
      const res = await measureApiCall('loadPosts', async () => {
        return fetch(finalUrl, {
          credentials: "include"
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        setTotalPages(data.totalPages || 0)
      }
    } catch (error) {
      logger.error("Failed to load posts", { 
        page: currentPage, 
        filters: { filterType, filterTraining, filterModule, filterClass } 
      }, error as Error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTrainings = async () => {
    try {
      // Load all trainings
      const trainingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses`, {
        credentials: "include"
      })
      
        if (trainingsRes.ok) {
          const trainingsData = await trainingsRes.json()
          setTrainings(trainingsData)
        }
    } catch (error) {
      logger.error("Failed to load trainings", {}, error as Error)
    }
  }

  const loadAllTrainingModules = async () => {
    try {
      // Load all trainings first
      const trainingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses`, {
        credentials: "include"
      })
      
      if (trainingsRes.ok) {
        const trainings = await trainingsRes.json()
        console.log("📚 Loaded trainings:", trainings.length)
        
        // Then load modules for each training
        const allModules = []
        for (const training of trainings) {
          try {
            const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${training.id}`, {
              credentials: "include"
            })
            if (modulesRes.ok) {
              const trainingData = await modulesRes.json()
              if (trainingData.modules) {
                // Add training context to each module
                const modulesWithTraining = trainingData.modules.map((module: any) => ({
                  ...module,
                  trainingTitle: training.title,
                  trainingId: training.id
                }))
                allModules.push(...modulesWithTraining)
              }
            }
          } catch (error) {
            console.error(`Error loading modules for training ${training.id}:`, error)
          }
        }
        
        console.log("📚 Total training modules loaded:", allModules.length)
        setTrainingModules(allModules)
      }
    } catch (error) {
      console.error("Error loading all training modules:", error)
    }
  }

  const loadTrainingModulesForTraining = async (trainingId: string) => {
    try {
      const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${trainingId}`, {
        credentials: "include"
      })
      
      if (modulesRes.ok) {
        const trainingData = await modulesRes.json()
        if (trainingData.modules) {
          setTrainingModules(trainingData.modules)
        }
      }
    } catch (error) {
      logger.error("Failed to load training modules for specific training", { trainingId }, error as Error)
    }
  }


  const loadClasses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/my-classes`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      logger.error("Failed to load classes", {}, error as Error)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${postId}/like`, {
        method: "POST",
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likeCount: data.likeCount }
            : post
        ))
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const getPostIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'QUESTION': return <HelpCircle className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }, [])

  const getPostTypeColor = useMemo(() => (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return "bg-blue-100 text-blue-800"
      case 'QUESTION': return "bg-yellow-100 text-yellow-800"
      case 'ANNOUNCEMENT': return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }, [])

  const formatTimeAgo = useMemo(() => (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }, [])

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
          {/* Page Header */}
              <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Feed</h1>
            <p className="text-muted-foreground text-lg">Share your thoughts, ask questions, and connect with the community</p>
            
          </div>

          {/* Create Post Button */}
          <div className="mb-6">
            <Button asChild className="w-full">
              <Link href="/feed/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Link>
            </Button>
              </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                      placeholder="Search posts..."
                  value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="POST">Posts</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignments</SelectItem>
                    <SelectItem value="QUESTION">Questions</SelectItem>
                    <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Training Module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {trainingModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                  <Button asChild>
                    <Link href="/feed/new">Create First Post</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/feed/posts/${post.id}`}>
                  <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {post.author.imageUrl ? (
                              <img
                              src={post.author.imageUrl} 
                              alt={post.author.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                            <span className="text-sm font-medium">
                              {post.author.name.charAt(0).toUpperCase()}
                            </span>
                            )}
                          </div>
                          <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.author.name}</h3>
                            <Badge className={getPostTypeColor(post.type)}>
                              {getPostIcon(post.type)}
                              <span className="ml-1">{post.type}</span>
                            </Badge>
                            {post.isPinned && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                            {post.module && (
                              <span className="ml-2">
                                in <span className="font-medium">{post.module.title}</span>
                              </span>
                            )}
                            {post.class && (
                              <span className="ml-2">
                                • <span className="font-medium text-blue-600">{post.class.name}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                    {post.title && (
                      <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                    )}
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.attachments && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{post.attachments}</p>
                        </div>
                    )}


                    <div className="flex items-center gap-6 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Heart className="h-4 w-4" />
                        {post.likeCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/feed/posts/${post.id}`}>
                          <MessageSquare className="h-4 w-4" />
                          {post.commentCount}
                        </Link>
                      </Button>
                            <Button
                        variant="ghost"
                              size="sm"
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                            >
                        <Share2 className="h-4 w-4" />
                        Share
                            </Button>
                      
                      {/* Show rating for assignment posts */}
                      {post.type === 'ASSIGNMENT' && post.avgScore !== undefined && (
                        <div 
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-medium">Rating:</span>
                          <span className="text-yellow-600 font-semibold">
                            {post.avgScore.toFixed(1)}/10
                          </span>
                          <span>({post.scoreCount} ratings)</span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
                  </Button>
              <span className="flex items-center px-4">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Next
                  </Button>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
