"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  ArrowLeft,
  Pin,
  BookOpen,
  HelpCircle,
  FileText,
  Megaphone,
  Users,
  EyeOff,
  Menu,
  X
} from "lucide-react"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import RequireAuth from "../../components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  type: 'POST' | 'ASSIGNMENT' | 'WEEKLY_SUMMARY' | 'FEEDBACK' | 'ANNOUNCEMENT'
  title?: string
  content: string
  attachments?: string
  isAssignment: boolean
  isPinned: boolean
  isHidden: boolean
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

interface Class {
  id: string
  name: string
  description?: string
  studentCount: number
}

export default function AdminFeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 10
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/classes`, {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        setClasses(data)
        console.log("📚 Loaded", data.length, "classes for admin")
      } else {
        throw new Error("Failed to load classes")
      }
    } catch (error) {
      console.error("Error loading classes:", error)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async (classId: string, type: string = "all", page: number = 1) => {
    try {
      setLoadingPosts(true)
      const params = new URLSearchParams()
      if (type !== "all") {
        params.append("type", type)
      }
      params.append("classId", classId)
      params.append("size", postsPerPage.toString())
      params.append("page", (page - 1).toString()) // API expects 0-based page

      // Use admin-specific endpoint
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/admin?${params.toString()}`,
        { credentials: "include" }
      )

      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        setTotalPosts(data.totalElements || 0)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(page)
        console.log("📝 Loaded", data.posts?.length || 0, "posts for class:", selectedClass?.name, "Page:", page)
      } else {
        throw new Error("Failed to load posts")
      }
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleClassChange = (classId: string) => {
    const selected = classes.find(c => c.id === classId)
    if (selected) {
      setSelectedClass(selected)
      setCurrentPage(1) // Reset to first page
      loadPosts(classId, filterType, 1)
    }
  }

  const handleTypeChange = (type: string) => {
    setFilterType(type)
    setCurrentPage(1) // Reset to first page
    if (selectedClass) {
      loadPosts(selectedClass.id, type, 1)
    }
  }

  const handlePostClick = (postId: string) => {
    // Navigate to the post detail page with admin parameter
    router.push(`/feed/posts/${postId}?from=admin`)
  }

  const handlePageChange = (page: number) => {
    if (selectedClass && page >= 1 && page <= totalPages) {
      loadPosts(selectedClass.id, filterType, page)
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'WEEKLY_SUMMARY': return <BookOpen className="h-4 w-4" />
      case 'FEEDBACK': return <MessageSquare className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return "bg-blue-100 text-blue-800"
      case 'WEEKLY_SUMMARY': return "bg-purple-100 text-purple-800"
      case 'FEEDBACK': return "bg-green-100 text-green-800"
      case 'ANNOUNCEMENT': return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading classes...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Modern Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-10 w-25"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/trainings" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Trainings
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/classes" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Classes
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Users
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/feed" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Feed
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/leaderboard" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-6 py-4 space-y-3">
                <Link 
                  href="/admin" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/trainings" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trainings
                </Link>
                <Link 
                  href="/admin/classes" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Classes
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  href="/admin/feed" 
                  className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link 
                  href="/admin/leaderboard" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          )}
        </header>

        <div className="container mx-auto px-8 py-12 space-y-10 max-w-7xl">
          {/* Back Button */}
          <Button variant="outline" asChild className="hover:bg-slate-100">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          {/* Page Header */}
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Feed Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              Class Feeds
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Monitor and manage posts across all classes
            </p>
            <div className="pt-4">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-[#FFBC00] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFBC00] text-slate-900 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold border-0"
              >
                <Link href="/feed/new">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Create New Post
                </Link>
              </Button>
            </div>
          </div>

          {/* Class Selection */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-up p-6">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Select Class to Monitor
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose a class to view its feed and manage posts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-6">
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger className="w-80 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} ({classItem.studentCount} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <div className="text-sm text-slate-600 bg-slate-50 px-6 py-3 rounded-lg">
                    Selected: <span className="font-semibold text-[#005eb8]">{selectedClass.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters & Actions */}
          {selectedClass && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg">Filter Posts & Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Select value={filterType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl">
                      <SelectValue placeholder="Post Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="POST">Posts</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignments</SelectItem>
                      <SelectItem value="WEEKLY_SUMMARY">Weekly Summary</SelectItem>
                      <SelectItem value="FEEDBACK">Feedback</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    asChild 
                    className="w-full sm:w-auto bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold border-0"
                  >
                    <Link href={`/feed/new?class=${selectedClass.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Create New Post
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Class Info */}
          {selectedClass && (
            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg animate-fade-in p-6">
              <CardContent className="pt-8">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#005eb8] to-[#0476D7] flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-800">{selectedClass.name} Feed</h3>
                    <p className="text-slate-600">
                      {selectedClass.studentCount} students • {totalPosts} posts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          {selectedClass && (
            <div className="space-y-6">
              {loadingPosts ? (
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg p-6">
                  <CardContent className="text-center py-20">
                    <div className="space-y-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005eb8] mx-auto"></div>
                      <p className="text-slate-600 text-lg">Loading posts...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg p-6">
                  <CardContent className="text-center py-20">
                    <div className="space-y-8">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-slate-400" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-slate-800">No posts yet</h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                          No posts found in this class
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className={`group ${post.isHidden ? "opacity-50" : ""} cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm animate-fade-in p-4 max-w-4xl mx-auto`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {post.author.imageUrl ? (
                              <img 
                                src={post.author.imageUrl} 
                                alt={post.author.name}
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-slate-600">
                                {post.author.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200">{post.author.name}</h3>
                              <Badge className={`px-3 py-1 text-xs font-semibold ${getPostTypeColor(post.type)}`}>
                                {getPostIcon(post.type)}
                                <span className="ml-1">{post.type}</span>
                              </Badge>
                              {post.isPinned && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600 bg-orange-50">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                              {post.isHidden && (
                                <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {formatTimeAgo(post.createdAt)}
                              {post.module && (
                                <span className="ml-2">
                                  in <span className="font-semibold text-[#005eb8]">{post.module.title}</span>
                                </span>
                              )}
                              {post.class && (
                                <span className="ml-2">
                                  • <span className="font-semibold text-blue-600">{post.class.name}</span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {post.title && (
                        <h1 className="text-xl font-semibold mb-3 text-slate-800">{post.title}</h1>
                      )}
                      <p className="text-slate-700 mb-6 whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
                      
                      {post.attachments && (
                        <div className="mb-6">
                          {post.attachments.startsWith('data:image') ? (
                            <div className="rounded-xl overflow-hidden border-2 border-slate-200">
                              <img
                                src={post.attachments} 
                                alt="Post attachment" 
                                className="w-full h-auto max-h-96 object-contain"
                              />
                            </div>
                          ) : post.attachments.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <div className="rounded-xl overflow-hidden border-2 border-slate-200">
                              <img 
                                src={post.attachments} 
                                alt="Post attachment" 
                                className="w-full h-auto max-h-96 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                              <p className="text-sm text-slate-600">{post.attachments}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Heart className="h-4 w-4" />
                          {post.likeCount} likes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MessageSquare className="h-4 w-4" />
                          {post.commentCount} comments
                        </div>
                        {post.isAssignment && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="h-4 w-4" />
                            {post.avgScore ? `${post.avgScore.toFixed(1)}/10` : "No ratings"} ({post.scoreCount} ratings)
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {selectedClass && totalPages > 1 && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg p-6">
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} posts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hover:bg-slate-100"
                  >
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 ${
                            currentPage === pageNum 
                              ? "bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white hover:from-[#0476D7] hover:to-[#005eb8]" 
                              : "hover:bg-slate-100"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="hover:bg-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
