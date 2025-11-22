"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "./useUser"

export interface Notification {
  id: string
  postId: string
  authorName: string
  postTitle: string | null
  postType: string
  createdAt: string
  read: boolean
  link: string
}

interface UserEnrollment {
  moduleId: string // This is actually the training ID
  classId: string
  isActive: boolean
  isArchived: boolean
}

const NOTIFICATION_STORAGE_KEY = "notifications"
const LAST_SEEN_POSTS_KEY = "lastSeenPostIds"
const POLL_INTERVAL = 5000 // 5 seconds for near real-time

// Global event to trigger notification refresh
const NOTIFICATION_REFRESH_EVENT = "notification-refresh"

export function triggerNotificationRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_REFRESH_EVENT))
  }
}

export function useNotifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      const stored = localStorage.getItem(`${NOTIFICATION_STORAGE_KEY}_${user.id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[]
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.read).length)
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user?.id])

  // Save notifications to localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    if (!user?.id) return

    try {
      localStorage.setItem(`${NOTIFICATION_STORAGE_KEY}_${user.id}`, JSON.stringify(newNotifications))
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }, [user?.id])

  // Get user's enrolled classes
  const getUserEnrollments = useCallback(async (): Promise<UserEnrollment[]> => {
    if (!user?.id) return []

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/my-classes`, {
        credentials: "include"
      })
      if (res.ok) {
        const enrollments = await res.json()
        return enrollments.filter((e: UserEnrollment) => e.isActive && !e.isArchived)
      }
    } catch (error) {
      console.error("Error fetching user enrollments:", error)
    }
    return []
  }, [user?.id])

  // Get last seen post IDs
  const getLastSeenPostIds = useCallback((): Set<string> => {
    if (!user?.id) return new Set()

    try {
      const stored = localStorage.getItem(`${LAST_SEEN_POSTS_KEY}_${user.id}`)
      if (stored) {
        return new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading last seen post IDs:", error)
    }
    return new Set()
  }, [user?.id])

  // Save last seen post IDs
  const saveLastSeenPostIds = useCallback((postIds: Set<string>) => {
    if (!user?.id) return

    try {
      localStorage.setItem(`${LAST_SEEN_POSTS_KEY}_${user.id}`, JSON.stringify(Array.from(postIds)))
    } catch (error) {
      console.error("Error saving last seen post IDs:", error)
    }
  }, [user?.id])

  // Check for new posts and create notifications
  const checkForNewPosts = useCallback(async () => {
    if (!user?.id || isLoading) return

    setIsLoading(true)
    try {
      // Get user's enrollments
      const enrollments = await getUserEnrollments()
      if (enrollments.length === 0) {
        setIsLoading(false)
        return
      }

      // Get current notifications (fresh from storage)
      const currentNotifications = [...notifications]
      
      // Get last seen post IDs
      const lastSeenIds = getLastSeenPostIds()
      const newPostIds = new Set<string>()
      const newNotifications: Notification[] = []

      // Check posts for each enrollment (training + class combination)
      for (const enrollment of enrollments) {
        try {
          // First, get all posts for this class
          const params = new URLSearchParams({
            classId: enrollment.classId,
            size: "50" // Check last 50 posts to be safe
          })

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed?${params}`,
            { credentials: "include" }
          )

          if (res.ok) {
            const data = await res.json()
            const posts = data.posts || []

            // Filter posts that match BOTH the training AND class
            const relevantPosts = posts.filter((post: any) => {
              // Post must have the same class
              const postClassId = post.class?.id
              if (!postClassId || postClassId !== enrollment.classId) return false

              // Post must be from the same training
              // The enrollment.moduleId is actually the training ID
              // Posts might have moduleId (training ID) or module.trainingId
              // We need to check if the post belongs to this training
              const postTrainingId = post.moduleId || post.module?.trainingId
              
              // If post has a training ID, it must match
              if (postTrainingId && postTrainingId !== enrollment.moduleId) return false
              
              // If post doesn't have training ID info, we'll include it if it has the matching class
              // This handles edge cases where the backend might not return training info
              return true
            })

            // Create notifications for new posts (not created by current user)
            relevantPosts.forEach((post: any) => {
              // Skip if post is from current user
              if (post.author?.id === user.id) return

              // Skip if we've already seen this post
              if (lastSeenIds.has(post.id)) return

              // Skip if we already have a notification for this post
              if (currentNotifications.some(n => n.postId === post.id)) return

              // Create notification
              const notification: Notification = {
                id: `notif_${post.id}_${Date.now()}`,
                postId: post.id,
                authorName: post.author?.name || "Unknown",
                postTitle: post.title || null,
                postType: post.type || "POST",
                createdAt: post.createdAt,
                read: false,
                link: `/feed/posts/${post.id}`
              }

              newNotifications.push(notification)
              newPostIds.add(post.id)
            })
          }
        } catch (error) {
          console.error(`Error checking posts for enrollment ${enrollment.classId}:`, error)
        }
      }

      // Add new notifications to the beginning
      if (newNotifications.length > 0) {
        const updatedNotifications = [...newNotifications, ...currentNotifications]
        // Keep only last 100 notifications
        const limitedNotifications = updatedNotifications.slice(0, 100)
        saveNotifications(limitedNotifications)
      }

      // Update last seen post IDs
      if (newPostIds.size > 0) {
        const updatedLastSeen = new Set([...lastSeenIds, ...newPostIds])
        saveLastSeenPostIds(updatedLastSeen)
      }
    } catch (error) {
      console.error("Error checking for new posts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, notifications, getUserEnrollments, getLastSeenPostIds, saveLastSeenPostIds, saveNotifications, isLoading])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    saveNotifications(updated)
  }, [notifications, saveNotifications])

  // Clear all notifications
  const clearAll = useCallback(() => {
    saveNotifications([])
  }, [saveNotifications])

  // Load notifications on mount and when user changes
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Poll for new posts
  useEffect(() => {
    if (!user?.id) return

    // Initial check
    checkForNewPosts()

    // Set up polling interval
    const interval = setInterval(() => {
      checkForNewPosts()
    }, POLL_INTERVAL)

    // Check when tab becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForNewPosts()
      }
    }

    // Check when window regains focus
    const handleFocus = () => {
      checkForNewPosts()
    }

    // Listen for manual refresh triggers
    const handleRefreshEvent = () => {
      checkForNewPosts()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRefreshEvent)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleRefreshEvent)
    }
  }, [user?.id, checkForNewPosts])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: checkForNewPosts
  }
}

