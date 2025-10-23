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
  EyeOff
} from "lucide-react"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import RequireAuth from "../../components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  type: 'POST' | 'ASSIGNMENT' | 'QUESTION' | 'ANNOUNCEMENT'
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

  const loadPosts = async (classId: string, type: string = "all") => {
    try {
      setLoadingPosts(true)
      const params = new URLSearchParams()
      if (type !== "all") {
        params.append("type", type)
      }
      params.append("classId", classId)
      params.append("size", "50")

      // Use admin-specific endpoint
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/admin?${params.toString()}`,
        { credentials: "include" }
      )

      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        console.log("📝 Loaded", data.posts?.length || 0, "posts for class:", selectedClass?.name)
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
      loadPosts(classId, filterType)
    }
  }

  const handleTypeChange = (type: string) => {
    setFilterType(type)
    if (selectedClass) {
      loadPosts(selectedClass.id, type)
    }
  }

  const handlePostClick = (postId: string) => {
    // Navigate to the post detail page with admin parameter
    router.push(`/feed/posts/${postId}?from=admin`)
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'QUESTION': return <HelpCircle className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return "bg-blue-100 text-blue-800"
      case 'QUESTION': return "bg-yellow-100 text-yellow-800"
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Class Feeds</h1>
            <p className="text-muted-foreground text-lg">
              Monitor and manage posts across all classes
            </p>
          </div>

          {/* Class Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Class to Monitor
              </CardTitle>
              <CardDescription>
                Choose a class to view its feed and manage posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger className="w-80">
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
                  <div className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium">{selectedClass.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          {selectedClass && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filter Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={filterType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Post Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="POST">Posts</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignments</SelectItem>
                      <SelectItem value="QUESTION">Questions</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Class Info */}
          {selectedClass && (
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedClass.name} Feed</h3>
                    <p className="text-muted-foreground">
                      {selectedClass.studentCount} students • {posts.length} posts
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
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      No posts found in this class
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className={`${post.isHidden ? "opacity-50" : ""} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => handlePostClick(post.id)}
                  >
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
                              {post.isHidden && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Hidden
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
                        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                      )}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg">{post.content}</p>
                      
                      {post.attachments && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">{post.attachments}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          {post.likeCount} likes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {post.commentCount} comments
                        </div>
                        {post.isAssignment && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
        </div>
      </div>
    </RequireAuth>
  )
}
