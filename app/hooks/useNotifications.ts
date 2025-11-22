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
  id?: string // Class ID might be here
  classId?: string // Or here
  moduleId: string // This is actually the training ID
  isActive: boolean
  isArchived: boolean
}

const NOTIFICATION_STORAGE_KEY = "notifications"
const LAST_SEEN_POSTS_KEY = "lastSeenPostIds"
const NOTIFICATION_INIT_KEY = "notificationsInitialized"
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
        console.log("🔔 Raw enrollments from API:", enrollments)
        
        // Filter active enrollments and normalize the structure
        const normalized = enrollments
          .filter((e: any) => e.isActive && !e.isArchived)
          .map((e: any) => ({
            ...e,
            // The class ID might be in 'id' field, normalize it to classId
            classId: e.classId || e.id,
            moduleId: e.moduleId // This is the training ID
          }))
        
        console.log("🔔 Normalized enrollments:", normalized)
        return normalized
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

  // Check if notifications have been initialized for this user
  const isNotificationsInitialized = useCallback((): boolean => {
    if (!user?.id) return false
    try {
      const initialized = localStorage.getItem(`${NOTIFICATION_INIT_KEY}_${user.id}`)
      return initialized === "true"
    } catch {
      return false
    }
  }, [user?.id])

  // Mark notifications as initialized
  const markNotificationsInitialized = useCallback(() => {
    if (!user?.id) return
    try {
      localStorage.setItem(`${NOTIFICATION_INIT_KEY}_${user.id}`, "true")
    } catch (error) {
      console.error("Error marking notifications as initialized:", error)
    }
  }, [user?.id])

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("🔔 Browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }, [])

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (typeof window === "undefined") return

    requestNotificationPermission().then((hasPermission) => {
      if (hasPermission) {
        const title = `${notification.authorName} posted a ${notification.postType}`
        const body = notification.postTitle || "New post in your class"
        
        const browserNotification = new window.Notification(title, {
          body: body,
          icon: "/logos/favicon.png",
          badge: "/logos/favicon.png",
          tag: notification.postId, // Prevent duplicate notifications
          requireInteraction: false,
        })

        // Click handler to open the post
        browserNotification.onclick = () => {
          window.focus()
          window.location.href = notification.link
          browserNotification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      }
    })
  }, [requestNotificationPermission])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("🔔 Could not play notification sound:", error)
    }
  }, [])

  // Check for new posts and create notifications
  const checkForNewPosts = useCallback(async () => {
    if (!user?.id || isLoading) {
      console.log("🔔 Notification check skipped:", { userId: user?.id, isLoading })
      return
    }

    console.log("🔔 Starting notification check for user:", user.id)
    setIsLoading(true)
    try {
      // Get user's enrollments
      const enrollments = await getUserEnrollments()
      console.log("🔔 User enrollments:", enrollments)
      if (enrollments.length === 0) {
        console.log("🔔 No enrollments found, skipping notification check")
        setIsLoading(false)
        return
      }

      // Get current notifications (fresh from storage)
      const currentNotifications = [...notifications]
      
      // Get last seen post IDs
      const lastSeenIds = getLastSeenPostIds()
      const isFirstRun = !isNotificationsInitialized()
      
      if (isFirstRun) {
        console.log("🔔 First run - marking all existing posts as seen")
      }
      
      const newPostIds = new Set<string>()
      const newNotifications: Notification[] = []

      // Check posts for each enrollment (training + class combination)
      for (const enrollment of enrollments) {
        try {
          // Get the class ID - it might be in classId or id field
          const classId = enrollment.classId || enrollment.id
          
          if (!classId) {
            console.log("🔔 Enrollment missing classId:", enrollment)
            continue
          }

          // First, get all posts for this class
          const params = new URLSearchParams({
            classId: classId,
            size: "50" // Check last 50 posts to be safe
          })

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feed?${params}`,
            { credentials: "include" }
          )

          if (res.ok) {
            const data = await res.json()
            const posts = data.posts || []
            console.log(`🔔 Found ${posts.length} posts for class ${classId}`)

            // Filter posts that match BOTH the training AND class
            const relevantPosts = posts.filter((post: any) => {
              console.log(`🔔 Checking post ${post.id}:`, {
                postClassId: post.class?.id,
                enrollmentClassId: classId,
                postModuleId: post.moduleId,
                enrollmentModuleId: enrollment.moduleId,
                postAuthorId: post.author?.id,
                currentUserId: user.id
              })

              // Post must have the same class
              const postClassId = post.class?.id
              if (!postClassId || postClassId !== classId) {
                console.log(`🔔 Post ${post.id} filtered out: class mismatch (post: ${postClassId}, enrollment: ${classId})`)
                return false
              }

              // Post must be from the same training
              // The enrollment.moduleId is actually the training ID
              // Posts should have moduleId (training ID) when created
              const postTrainingId = post.moduleId
              
              // If post has a training ID, it must match
              if (postTrainingId) {
                if (postTrainingId !== enrollment.moduleId) {
                  console.log(`🔔 Post ${post.id} filtered out: training mismatch (${postTrainingId} vs ${enrollment.moduleId})`)
                  return false
                }
              } else {
                // If post doesn't have moduleId, we'll still include it if class matches
                // This handles edge cases, but log a warning
                console.log(`🔔 Post ${post.id} has no moduleId, but class matches - including it`)
              }
              
              return true
            })
            
            console.log(`🔔 Found ${relevantPosts.length} relevant posts after filtering`)

            // Process posts
            relevantPosts.forEach((post: any) => {
              // Skip if post is from current user
              if (post.author?.id === user.id) {
                console.log(`🔔 Post ${post.id} skipped: created by current user`)
                // Still mark as seen even if it's from current user
                if (isFirstRun) {
                  newPostIds.add(post.id)
                }
                return
              }

              // Skip if we've already seen this post
              if (lastSeenIds.has(post.id)) {
                console.log(`🔔 Post ${post.id} skipped: already seen`)
                return
              }

              // Skip if we already have a notification for this post
              if (currentNotifications.some(n => n.postId === post.id)) {
                console.log(`🔔 Post ${post.id} skipped: notification already exists`)
                return
              }

              // On first run, mark all existing posts as seen without creating notifications
              if (isFirstRun) {
                console.log(`🔔 First run - marking post ${post.id} as seen (no notification)`)
                newPostIds.add(post.id)
                return
              }

              // Create notification for new posts (only after first run)
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

              console.log(`🔔 Creating notification for post ${post.id}:`, notification)
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
        console.log(`🔔 Adding ${newNotifications.length} new notifications`)
        const updatedNotifications = [...newNotifications, ...currentNotifications]
        // Keep only last 100 notifications
        const limitedNotifications = updatedNotifications.slice(0, 100)
        saveNotifications(limitedNotifications)
        
        // Show browser notification and play sound
        showBrowserNotification(newNotifications[0])
        playNotificationSound()
      } else {
        console.log("🔔 No new notifications to add")
      }

      // Update last seen post IDs
      if (newPostIds.size > 0) {
        const updatedLastSeen = new Set([...lastSeenIds, ...newPostIds])
        saveLastSeenPostIds(updatedLastSeen)
      }

      // Mark as initialized after first successful run
      if (isFirstRun) {
        markNotificationsInitialized()
        console.log("🔔 Notifications initialized - future posts will trigger notifications")
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

