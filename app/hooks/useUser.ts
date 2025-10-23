"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  imageUrl?: string
  authenticated?: boolean
}

// Cache user data to avoid excessive API calls
let userCache: { user: User | null; timestamp: number } | null = null
const CACHE_DURATION = 300000 // 5 minutes cache (increased for better performance)

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    // Check cache first
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUser(userCache.user)
      setIsLoading(false)
      return
    }
    

    try {
      // First try the frontend API route
      const res = await fetch(`/api/me`, {
        credentials: "include",
      })
      
      if (res.ok) {
        const userData = await res.json()
        console.log("User data received:", userData)
        if (userData.authenticated && userData.id) {
          setUser(userData)
          // Update cache
          userCache = { user: userData, timestamp: Date.now() }
        } else {
          console.log("User not authenticated, clearing user state")
          setUser(null)
          userCache = { user: null, timestamp: Date.now() }
        }
      } else {
        console.log("Failed to fetch user from frontend API, trying direct backend call")
        
        // Fallback: try direct backend call with Bearer token
        const cookies = document.cookie.split(';');
        let jwtToken = null;
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'SESSION' && value) {
            jwtToken = value;
            break;
          }
        }
        
        if (jwtToken) {
          const backendRes = await fetch(`http://localhost:8080/api/me`, {
            headers: {
              'Authorization': `Bearer ${jwtToken}`
            }
          })
          
          if (backendRes.ok) {
            const userData = await backendRes.json()
            console.log("User data received from backend:", userData)
            if (userData.authenticated && userData.id) {
              setUser(userData)
            } else {
              setUser(null)
            }
          } else {
            console.log("Failed to fetch user from backend, clearing user state")
            setUser(null)
          }
        } else {
          console.log("No JWT token found, clearing user state")
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Add refresh function for manual refresh
  const refreshUser = () => {
    // Clear cache on manual refresh
    userCache = null
    setIsLoading(true)
    fetchUser()
  }

  return { user, isLoading, refreshUser }
}
