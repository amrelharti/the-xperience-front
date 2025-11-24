"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "./useUser"

export interface Notification {
  id: string
  postId: string
  authorName: string
  postTitle: string | null
  postType: string
  notificationType: string // POST_CREATED, COMMENT, LIKE, RATING
  createdAt: string
  read: boolean
  link: string
}


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

  // Load notifications from backend API
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?page=0&size=100`, {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        const notificationsList = (data.notifications || []).map((n: any) => ({
          id: n.id,
          postId: n.postId,
          authorName: n.authorName,
          postTitle: n.postTitle,
          postType: n.postType,
          notificationType: n.notificationType || 'POST_CREATED', // Default for backward compatibility
          createdAt: n.createdAt,
          read: n.read,
          link: n.link
        }))
        setNotifications(notificationsList)
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error("Failed to load notifications:", res.status)
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user?.id])


  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {

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

    console.log("🔔 Attempting to show browser notification:", notification)
    
    requestNotificationPermission().then((hasPermission) => {
      console.log("🔔 Notification permission:", hasPermission)
      if (hasPermission) {
        // Different messages based on notification type
        let title = ""
        let body = ""
        
        switch (notification.notificationType) {
          case 'COMMENT':
            title = "New comment on your post"
            body = notification.postTitle 
              ? `${notification.authorName} commented on "${notification.postTitle}"`
              : `${notification.authorName} commented on your ${notification.postType}`
            break
          case 'LIKE':
            title = "Someone liked your post"
            body = notification.postTitle 
              ? `${notification.authorName} liked "${notification.postTitle}"`
              : `${notification.authorName} liked your ${notification.postType}`
            break
          case 'RATING':
            title = "New rating on your post"
            body = notification.postTitle 
              ? `${notification.authorName} rated "${notification.postTitle}"`
              : `${notification.authorName} rated your ${notification.postType}`
            break
          case 'POST_CREATED':
          default:
            title = `New ${notification.postType} in your class`
            body = notification.postTitle 
              ? `${notification.authorName}: ${notification.postTitle}`
              : `${notification.authorName} posted a new ${notification.postType}`
            break
        }
        
        try {
          const browserNotification = new window.Notification(title, {
            body: body,
            icon: "/logos/favicon.png",
            badge: "/logos/favicon.png",
            tag: notification.postId, // Prevent duplicate notifications
            requireInteraction: false,
          })

          console.log("🔔 Browser notification shown:", title)

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
        } catch (error) {
          console.error("Error creating browser notification:", error)
        }
      } else {
        console.warn("🔔 Notification permission not granted")
      }
    })
  }, [requestNotificationPermission])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      console.log("🔊 Attempting to play notification sound...")
      
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        console.log("🔊 Audio context suspended, resuming...")
        audioContext.resume().then(() => {
          console.log("🔊 Audio context resumed")
          playSoundWithContext(audioContext)
        }).catch(err => {
          console.warn("Failed to resume audio context:", err)
          // Try to play anyway
          playSoundWithContext(audioContext)
        })
      } else {
        playSoundWithContext(audioContext)
      }
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
    
    function playSoundWithContext(audioContext: AudioContext) {
      try {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Pleasant notification sound (two-tone beep) - louder
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        // Increase volume
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        
        console.log("🔊 Sound played successfully")
      } catch (error) {
        console.error("Error in playSoundWithContext:", error)
      }
    }
  }, [])

  // Check for new notifications from backend
  const checkForNewPosts = useCallback(async () => {
    if (!user?.id || isLoading) {
      return
    }

    setIsLoading(true)
    try {
      // Get previous unread count to detect new notifications
      const previousUnreadCount = unreadCount
      const previousNotificationIds = new Set(notifications.map(n => n.id))
      
      // Reload notifications from backend (they're automatically created for posts, comments, likes, and ratings)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications?page=0&size=100`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        const notificationsList = (data.notifications || []).map((n: any) => ({
          id: n.id,
          postId: n.postId,
          authorName: n.authorName,
          postTitle: n.postTitle,
          postType: n.postType,
          notificationType: n.notificationType || 'POST_CREATED', // Default for backward compatibility
          createdAt: n.createdAt,
          read: n.read,
          link: n.link
        }))
        // Sort by createdAt descending (newest first)
        notificationsList.sort((a: Notification, b: Notification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setNotifications(notificationsList)
        const newUnreadCount = data.unreadCount || 0
        setUnreadCount(newUnreadCount)
        
        // Check if we have new unread notifications (either by count or by new IDs)
        const hasNewUnreadCount = newUnreadCount > previousUnreadCount
        const newUnreadNotifications = notificationsList.filter((n: Notification) => !n.read && !previousNotificationIds.has(n.id))
        
        if (hasNewUnreadCount || newUnreadNotifications.length > 0) {
          // Find the newest unread notification that we haven't seen before
          const newest = newUnreadNotifications.length > 0 
            ? newUnreadNotifications[0] 
            : notificationsList.find((n: Notification) => !n.read)
          
          if (newest) {
            console.log("🔔 New notification detected:", newest.notificationType, newest)
            showBrowserNotification(newest)
            playNotificationSound()
          }
        }
      }
    } catch (error) {
      console.error("Error checking for new notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, isLoading, unreadCount, notifications, showBrowserNotification, playNotificationSound])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include"
      })
      if (res.ok) {
        // Reload notifications to get updated state
        await loadNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [loadNotifications])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/mark-all-read`, {
        method: "PUT",
        credentials: "include"
      })
      if (res.ok) {
        // Reload notifications to get updated state
        await loadNotifications()
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }, [loadNotifications])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        // Reload notifications to get updated state
        await loadNotifications()
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }, [loadNotifications])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        // Reload notifications to get updated state
        await loadNotifications()
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error)
    }
  }, [loadNotifications])

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user?.id, loadNotifications])

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

