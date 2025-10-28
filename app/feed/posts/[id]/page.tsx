"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Send
} from "lucide-react"
import { useUser } from "@/app/hooks/useUser"
import UserDropdown from "@/app/components/UserDropdown"
import RequireAuth from "@/app/components/RequireAuth"
import Navbar from "@/app/components/Navbar"
import { useToast } from "@/hooks/use-toast"

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
  comments?: Comment[]
}

interface Comment {
  id: string
  content: string
  likeCount: number
  createdAt: string
  author: {
    id: string
    name: string
    imageUrl?: string
  }
  replies: Comment[]
  parentCommentId?: string
}

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContents, setReplyContents] = useState<Record<string, string>>({})
  const [submittingReply, setSubmittingReply] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContents, setEditContents] = useState<Record<string, string>>({})
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [editPostTitle, setEditPostTitle] = useState("")
  const [editPostContent, setEditPostContent] = useState("")
  const [submittingPostEdit, setSubmittingPostEdit] = useState(false)
  const [cameFromAdmin, setCameFromAdmin] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { toast } = useToast()

  // Get training and class query parameters for preserving context
  const training = searchParams.get('training')
  const classParam = searchParams.get('class')

  // Build feed URL with query parameters
  const feedUrl = useMemo(() => {
    if (training && classParam) {
      return `/feed?training=${training}&class=${classParam}`
    }
    return '/feed'
  }, [training, classParam])

  useEffect(() => {
    if (params.id) {
      loadPost()
    }
    
    // Check if user came from admin feed via query parameter
    const fromParam = searchParams.get('from')
    setCameFromAdmin(fromParam === 'admin')
  }, [params.id, searchParams])

  // Initialize edit form when post loads
  useEffect(() => {
    if (post && editingPost) {
      setEditPostTitle(post.title || "")
      setEditPostContent(post.content)
    }
  }, [post, editingPost])

  const loadPost = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${params.id}`, {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        setPost(data)
        
        // Load user's rating if it's an assignment
        if (data.type === 'ASSIGNMENT') {
          loadMyRating()
        }
      } else {
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading post:", error)
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMyRating = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${params.id}/my-rating`, {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        setRating(data.score)
        setHasRated(data.hasRated)
      }
    } catch (error) {
      console.error("Error loading rating:", error)
    }
  }

  const handleRate = async (score: number) => {
    if (!post || post.type !== 'ASSIGNMENT') return

    // Show confirmation dialog before rating
    const confirmed = confirm(`Are you sure you want to rate this assignment ${score}/10? This rating cannot be changed once submitted.`)
    if (!confirmed) return

    setSubmittingRating(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}/rate?score=${score}`, {
        method: "POST",
        credentials: "include"
      })

      if (res.ok) {
        try {
          const data = await res.json()
          setRating(score)
          setHasRated(true)
          
          // Update post with new average score
          setPost(prev => prev ? {
            ...prev,
            avgScore: data.avgScore,
            scoreCount: data.scoreCount
          } : null)

          toast({
            title: "Success",
            description: "Assignment rated successfully",
          })
        } catch (jsonError) {
          console.error("Error parsing rating response:", jsonError)
          console.error("Response status:", res.status)
          console.error("Response text:", await res.text())
          toast({
            title: "Error",
            description: "Failed to parse rating response",
            variant: "destructive"
          })
        }
      } else {
        try {
          const error = await res.json()
          toast({
            title: "Error",
            description: error.error || "Failed to rate assignment",
            variant: "destructive"
          })
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError)
          console.error("Response status:", res.status)
          console.error("Response text:", await res.text())
          toast({
            title: "Error",
            description: `Failed to rate assignment (Status: ${res.status})`,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error rating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to rate assignment",
        variant: "destructive"
      })
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!user) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        // Reload the post to get updated comment like counts
        await loadPost();
        toast({
          title: "Comment liked",
          description: "Your like has been recorded",
        });
      } else {
        const errorData = await res.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to like comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (parentCommentId: string) => {
    const replyContent = replyContents[parentCommentId] || "";
    if (!replyContent.trim() || !post) return;

    setSubmittingReply(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: replyContent.trim(),
          parentCommentId: parentCommentId
        })
      });

      if (res.ok) {
        try {
          const newReply = await res.json();
          setReplyContents(prev => {
            const newContents = { ...prev };
            delete newContents[parentCommentId];
            return newContents;
          });
          setReplyingTo(null);
          
          // Update the post state with the new reply
          setPost(prev => {
            if (!prev) return null;
            
            const updateComments = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: [...comment.replies, newReply]
                  };
                }
                return comment;
              });
            };
            
            return {
              ...prev,
              comments: updateComments(prev.comments || []),
              commentCount: (prev.commentCount || 0) + 1
            };
          });
          
          toast({
            title: "Success",
            description: "Reply posted successfully!",
          });
        } catch (jsonError) {
          console.error("Error parsing reply response:", jsonError);
          await loadPost();
          toast({
            title: "Success",
            description: "Reply posted successfully!",
          });
        }
      } else {
        try {
          const error = await res.json();
          toast({
            title: "Error",
            description: error.error || "Failed to post reply",
            variant: "destructive",
          });
        } catch (jsonError) {
          toast({
            title: "Error",
            description: "Failed to post reply",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    const editContent = editContents[commentId] || "";
    if (!editContent.trim()) return;

    setSubmittingEdit(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: editContent.trim()
        })
      });

      if (res.ok) {
        const updatedComment = await res.json();
        
        // Update the comment in the post state
        setPost(prev => {
          if (!prev) return null;
          
          const updateComments = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return updatedComment;
              }
              // Check replies
              if (comment.replies) {
                const updatedReplies = comment.replies.map(reply => 
                  reply.id === commentId ? updatedComment : reply
                );
                return { ...comment, replies: updatedReplies };
              }
              return comment;
            });
          };
          
          return {
            ...prev,
            comments: updateComments(prev.comments || [])
          };
        });
        
        setEditingComment(null);
        setEditContents(prev => {
          const newContents = { ...prev };
          delete newContents[commentId];
          return newContents;
        });
        
        toast({
          title: "Success",
          description: "Comment updated successfully!",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        // Remove the comment from the post state
        setPost(prev => {
          if (!prev) return null;
          
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) {
                return false;
              }
              // Check replies
              if (comment.replies) {
                comment.replies = comment.replies.filter(reply => reply.id !== commentId);
              }
              return true;
            });
          };
          
          const updatedComments = removeComment(prev.comments || []);
          const commentCount = updatedComments.reduce((count, comment) => {
            return count + 1 + (comment.replies?.length || 0);
          }, 0);
          
          return {
            ...prev,
            comments: updatedComments,
            commentCount
          };
        });
        
        toast({
          title: "Success",
          description: "Comment deleted successfully!",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = async () => {
    if (!post || !editPostTitle.trim() || !editPostContent.trim()) return;

    setSubmittingPostEdit(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editPostTitle.trim(),
          content: editPostContent.trim()
        })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setEditingPost(false);
        
        toast({
          title: "Success",
          description: "Post updated successfully!",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setSubmittingPostEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone and will delete all comments and replies.")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Post deleted successfully!",
        });
        // Check if user came from admin feed and redirect appropriately
        if (cameFromAdmin) {
          window.location.href = "/admin/feed";
        } else {
          window.location.href = "/feed";
        }
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!post) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        setPost({ ...post, likeCount: data.likeCount })
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentContent.trim() || !post) return

    setSubmittingComment(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: commentContent.trim()
        })
      })

      if (res.ok) {
        try {
          const newComment = await res.json()
          setCommentContent("")
          
          // Update the post state with the new comment
          setPost(prev => prev ? {
            ...prev,
            comments: [...(prev.comments || []), newComment],
            commentCount: (prev.commentCount || 0) + 1
          } : null)
          
          toast({
            title: "Success",
            description: "Comment posted successfully!",
          })
        } catch (jsonError) {
          console.error("Error parsing comment response:", jsonError)
          // Even if JSON parsing fails, the comment might have been created
          // Reload the post to get updated comments
          loadPost()
          toast({
            title: "Success",
            description: "Comment posted successfully!",
          })
        }
      } else {
        try {
          const error = await res.json()
          toast({
            title: "Error",
            description: error.error || "Failed to post comment",
            variant: "destructive",
          })
        } catch (jsonError) {
          console.error("Error parsing error response:", jsonError)
          toast({
            title: "Error",
            description: `Failed to post comment (Status: ${res.status})`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading post...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (!post) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Button asChild>
              <Link href="/feed">Back to Feed</Link>
            </Button>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href={cameFromAdmin ? "/admin/feed" : feedUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {cameFromAdmin ? "Admin Feed" : "Feed"}
            </Link>
          </Button>

          {/* Post */}
          <Card className="mb-6">
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
                    </p>
                  </div>
                </div>
                {/* Post Edit/Delete buttons - only show for post owner (edit) or admin (delete) */}
                {!editingPost && (
                  <div className="flex items-center space-x-1">
                    {/* Edit button - only for post owner */}
                    {user?.id === post.author.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:bg-yellow-50 hover:text-yellow-700"
                        onClick={() => {
                          setEditingPost(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {/* Delete button - for post owner or admin */}
                    {(user?.id === post.author.id || user?.role === 'ADMIN') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                        onClick={handleDeletePost}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingPost ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      placeholder="Enter post title..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea
                      id="edit-content"
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingPost(false);
                        setEditPostTitle("");
                        setEditPostContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={submittingPostEdit || !editPostTitle.trim() || !editPostContent.trim()}
                      onClick={handleEditPost}
                    >
                      {submittingPostEdit ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Post"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {post.title && (
                    <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                  )}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg">{post.content}</p>
                </>
              )}
              
              {post.attachments && (
                <div className="mb-4">
                  {post.attachments.startsWith('data:image') || post.attachments.startsWith('http://') || post.attachments.startsWith('https://') ? (
                    <div className="relative w-full max-h-96 overflow-hidden rounded-lg border border-gray-200">
                      <img 
                        src={post.attachments} 
                        alt="Post attachment" 
                        className="w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{post.attachments}</p>
                    </div>
                  )}
                </div>
              )}


              <div className="flex items-center gap-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  {post.likeCount}
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {post.commentCount} comments
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Rating section for assignment posts */}
              {post.type === 'ASSIGNMENT' && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Rate this Assignment</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Average: {post.avgScore || 0}/10</span>
                      <span>({post.scoreCount || 0} ratings)</span>
                    </div>
                  </div>
                  
                  {!hasRated && user && user.id !== post.author.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <Button
                            key={score}
                            variant={rating === score ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleRate(score)}
                            disabled={submittingRating}
                            className="w-8 h-8 p-0"
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : hasRated ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Your rating: {rating}/10</span>
                    </div>
                  ) : user && user.id === post.author.id ? (
                    <p className="text-sm text-muted-foreground">You cannot rate your own assignment</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Please sign in to rate this assignment</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({post.commentCount})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submittingComment || !commentContent.trim()}>
                    {submittingComment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {(!post.comments || post.comments.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {comment.author.imageUrl ? (
                          <img 
                            src={comment.author.imageUrl} 
                            alt={comment.author.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {editingComment === comment.id ? (
                          <div className="mt-2">
                            <Textarea
                              value={editContents[comment.id] || comment.content}
                              onChange={(e) => setEditContents(prev => ({
                                ...prev,
                                [comment.id]: e.target.value
                              }))}
                              className="mb-2 min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditContents(prev => {
                                    const newContents = { ...prev };
                                    delete newContents[comment.id];
                                    return newContents;
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                disabled={submittingEdit || !(editContents[comment.id] || comment.content).trim()}
                                onClick={() => handleEditComment(comment.id)}
                              >
                                {submittingEdit ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                  </>
                                ) : (
                                  "Update"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {comment.likeCount || 0}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 px-2 text-xs hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setReplyingTo(replyingTo === comment.id ? null : comment.id);
                              if (replyingTo !== comment.id) {
                                setReplyContents(prev => ({
                                  ...prev,
                                  [comment.id]: ""
                                }));
                              }
                            }}
                          >
                            {replyingTo === comment.id ? "Cancel" : "Reply"}
                          </Button>
                          {/* Edit button - only show for comment owner */}
                          {user?.id === comment.author.id && editingComment !== comment.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs hover:bg-yellow-50 hover:text-yellow-700"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingComment(comment.id);
                                setEditContents(prev => ({
                                  ...prev,
                                  [comment.id]: comment.content
                                }));
                              }}
                            >
                              Edit
                            </Button>
                          )}
                          {/* Delete button - show for comment owner or admin */}
                          {(user?.id === comment.author.id || user?.role === 'ADMIN') && editingComment !== comment.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteComment(comment.id);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-200">
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleReply(comment.id);
                            }}>
                              <Textarea
                                value={replyContents[comment.id] || ""}
                                onChange={(e) => setReplyContents(prev => ({
                                  ...prev,
                                  [comment.id]: e.target.value
                                }))}
                                placeholder={`Reply to ${comment.author.name}...`}
                                className="mb-2 min-h-[80px]"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContents(prev => {
                                      const newContents = { ...prev };
                                      delete newContents[comment.id];
                                      return newContents;
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={submittingReply || !(replyContents[comment.id] || "").trim()}
                                >
                                  {submittingReply ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Posting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-2" />
                                      Post Reply
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-gray-100">
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  {reply.author.imageUrl ? (
                                    <img 
                                      src={reply.author.imageUrl} 
                                      alt={reply.author.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-medium">
                                      {reply.author.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{reply.author.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  {editingComment === reply.id ? (
                                    <div className="mt-2">
                                      <Textarea
                                        value={editContents[reply.id] || reply.content}
                                        onChange={(e) => setEditContents(prev => ({
                                          ...prev,
                                          [reply.id]: e.target.value
                                        }))}
                                        className="mb-2 min-h-[60px]"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingComment(null);
                                            setEditContents(prev => {
                                              const newContents = { ...prev };
                                              delete newContents[reply.id];
                                              return newContents;
                                            });
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          disabled={submittingEdit || !(editContents[reply.id] || reply.content).trim()}
                                          onClick={() => handleEditComment(reply.id)}
                                        >
                                          {submittingEdit ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                              Updating...
                                            </>
                                          ) : (
                                            "Update"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-5 px-2 text-xs"
                                      onClick={() => handleCommentLike(reply.id)}
                                    >
                                      <Heart className="h-3 w-3 mr-1" />
                                      {reply.likeCount || 0}
                                    </Button>
                                    {/* Edit button for replies - only show for reply owner */}
                                    {user?.id === reply.author.id && editingComment !== reply.id && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-5 px-2 text-xs hover:bg-yellow-50 hover:text-yellow-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setEditingComment(reply.id);
                                          setEditContents(prev => ({
                                            ...prev,
                                            [reply.id]: reply.content
                                          }));
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                    {/* Delete button for replies - show for reply owner or admin */}
                                    {(user?.id === reply.author.id || user?.role === 'ADMIN') && editingComment !== reply.id && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-5 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteComment(reply.id);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}
