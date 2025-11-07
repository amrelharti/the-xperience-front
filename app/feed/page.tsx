"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, useInView } from "framer-motion"
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
  Megaphone,
  ArrowLeft,
  Users,
  Sparkles,
  TrendingUp,
  Instagram,
  Linkedin
} from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import { useDebounce } from "@/app/hooks/useDebounce"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import Navbar from "@/app/components/Navbar"
import { useToast } from "@/hooks/use-toast"
import { logger } from "@/lib/logger"
import { measureApiCall } from "@/lib/performance"

interface Post {
  id: string
  type: 'POST' | 'ASSIGNMENT' | 'WEEKLY_SUMMARY' | 'FEEDBACK' | 'ANNOUNCEMENT'
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
    title?: string
    instagram?: string
    linkedin?: string
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
  
  // Get the URL for "Create New Post" with query parameters
  const training = searchParams.get('training')
  const classParam = searchParams.get('class')
  
  const newPostUrl = useMemo(() => {
    console.log('🔗 Creating New Post URL - training:', training, 'class:', classParam)
    
    if (training && classParam) {
      const url = `/feed/new?training=${training}&class=${classParam}`
      console.log('✅ Returning filtered new post URL:', url)
      return url
    }
    console.log('❌ No params, returning default new post URL')
    return '/feed/new'
  }, [training, classParam])

  // Build post detail URL with query parameters
  const getPostDetailUrl = (postId: string) => {
    if (training && classParam) {
      return `/feed/posts/${postId}?training=${training}&class=${classParam}`
    }
    return `/feed/posts/${postId}`
  }
  
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

  const handleTogglePin = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${postId}/pin`, {
        method: "POST",
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isPinned: data.isPinned }
            : post
        ))
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to toggle pin",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling pin:", error)
      toast({
        title: "Error",
        description: "Failed to toggle pin status",
        variant: "destructive",
      })
    }
  }

  const getPostIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'WEEKLY_SUMMARY': return <BookOpen className="h-4 w-4" />
      case 'FEEDBACK': return <MessageSquare className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }, [])

  const getPostTypeColor = useMemo(() => (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return "bg-blue-100 text-blue-800"
      case 'WEEKLY_SUMMARY': return "bg-purple-100 text-purple-800"
      case 'FEEDBACK': return "bg-green-100 text-green-800"
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

  const headerRef = useRef(null)
  const postsRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })
  const postsInView = useInView(postsRef, { once: true })

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          {/* Page Header */}
          <motion.div 
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB]" />
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] opacity-50" />
              <div className="relative p-6 sm:p-8 md:p-10 lg:p-14">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white border-yellow-400 mb-3 sm:mb-4 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      <MessageSquare className="h-3 w-3 mr-1.5 sm:mr-2" />
                      Community Feed
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                      Feed
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-4 sm:mb-6 max-w-2xl">
                      Share your thoughts, ask questions, and connect with the community
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-blue-100">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Users className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Community</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Interactive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Back to Training Button - only show when viewing filtered feed */}
              {training && (
                <Button variant="outline" asChild size="sm" className="border-gray-200 hover:border-[#0476D7]/30 hover:bg-blue-50/50 text-sm sm:text-base">
                  <Link href={`/courses/${training}`}>
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Back to Training
                  </Link>
                </Button>
              )}

              {/* Create Post Button */}
              <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white rounded-lg sm:rounded-xl px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all font-semibold border-0 text-sm sm:text-base">
                <Link href={newPostUrl}>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  Create New Post
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-40 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="POST">Posts</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignments</SelectItem>
                        <SelectItem value="WEEKLY_SUMMARY">Weekly Summary</SelectItem>
                        <SelectItem value="FEEDBACK">Feedback</SelectItem>
                        <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterModule} onValueChange={setFilterModule}>
                      <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl">
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
                </div>
              </div>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <motion.div 
            ref={postsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0476D7] to-[#005eb8] rounded-2xl mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading posts...</h3>
                <p className="text-gray-500">Please wait while we fetch the latest content</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No posts yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Be the first to share something with the community and start the conversation!</p>
                  <Button asChild className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all font-semibold border-0">
                    <Link href={newPostUrl}>
                      <Plus className="h-5 w-5 mr-2" />
                      Create First Post
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-[#0476D7]/30 cursor-pointer"
                  onClick={() => window.location.href = getPostDetailUrl(post.id)}
                >
                  {/* Gradient accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0476D7] via-[#005eb8] to-[#FFBC00] group-hover:w-1.5 sm:group-hover:w-2 transition-all duration-300" />
                  
                  <div className="p-4 sm:p-5 md:p-6 pl-5 sm:pl-7 md:pl-8">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center shadow-md">
                            {post.author.imageUrl ? (
                              <img
                                src={post.author.imageUrl} 
                                alt={post.author.name}
                                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-lg sm:rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-base sm:text-lg font-bold text-white">
                                {post.author.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {post.isPinned && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-[#FFBC00] rounded-full flex items-center justify-center">
                              <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#0476D7] transition-colors truncate">{post.author.name}</h3>
                              {post.author.title && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{post.author.title}</p>
                              )}
                            </div>
                            <Badge className={`${getPostTypeColor(post.type)} rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold flex-shrink-0 w-fit`}>
                              {getPostIcon(post.type)}
                              <span className="ml-1">{post.type}</span>
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex-shrink-0">{formatTimeAgo(post.createdAt)}</span>
                            
                            {post.class && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span className="font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">{post.class.name}</span>
                              </>
                            )}
                          </div>
                          {/* Social Media Links */}
                          {(post.author.instagram || post.author.linkedin) && (
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                              {post.author.instagram && (
                                <a
                                  href={`https://instagram.com/${post.author.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-grey hover:from-pink-100 hover:to-rose-100 border border-pink-300 rounded-full transition-all text-xs font-medium text-pink-700"
                                >
                                  <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="hidden xs:inline truncate max-w-[100px]">{post.author.instagram}</span>
                                </a>
                              )}
                              {post.author.linkedin && (
                                <a
                                  href={post.author.linkedin.startsWith('http') ? post.author.linkedin : `https://${post.author.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-grey hover:from-blue-100 hover:to-blue-150 border border-blue-300 rounded-full transition-all text-xs font-medium text-blue-700"
                                >
                                  <Linkedin className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                  <span className="truncate">LinkedIn</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Pin Button - Admin Only */}
                      {user?.role === 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleTogglePin(post.id, e)}
                          className={`ml-1 sm:ml-2 h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0 ${post.isPinned ? 'text-[#FFBC00] hover:text-[#FFA500]' : 'text-gray-400 hover:text-[#FFBC00]'}`}
                          title={post.isPinned ? 'Unpin post' : 'Pin post'}
                        >
                          <Pin className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mb-4 sm:mb-5 md:mb-6">
                      {post.title && (
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#0476D7] transition-colors leading-tight">{post.title}</h2>
                      )}
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-3">{post.content}</p>
                      
                      {post.attachments && (
                        <div className="mt-3 sm:mt-4">
                          {post.attachments.startsWith('data:image') || post.attachments.startsWith('http://') || post.attachments.startsWith('https://') ? (
                            <div className="relative w-full max-h-64 sm:max-h-80 md:max-h-96 overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                              <img 
                                src={post.attachments} 
                                alt="Post attachment" 
                                className="w-full h-auto object-contain max-h-64 sm:max-h-80 md:max-h-96"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{post.attachments}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-auto"
                        >
                          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">{post.likeCount}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-[#0476D7] hover:bg-blue-50 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={getPostDetailUrl(post.id)}>
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">{post.commentCount}</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm hidden xs:inline">Share</span>
                        </Button>
                      </div>
                      
                      {/* Show rating for assignment posts */}
                      {post.type === 'ASSIGNMENT' && post.avgScore !== undefined && (
                        <div 
                          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-gradient-to-br from-yellow-50 to-amber-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-yellow-200 shadow-sm flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                          <span className="font-bold text-yellow-800">
                            {post.avgScore.toFixed(1)}/10
                          </span>
                          <span className="text-yellow-600 hidden xs:inline">({post.scoreCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center gap-3 mt-12"
            >
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="border-gray-200 hover:border-[#0476D7]/30 hover:bg-blue-50/50 rounded-xl px-6"
              >
                Previous
              </Button>
              <div className="flex items-center px-6 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="border-gray-200 hover:border-[#0476D7]/30 hover:bg-blue-50/50 rounded-xl px-6"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
