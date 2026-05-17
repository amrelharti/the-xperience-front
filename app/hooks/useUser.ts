"use client"

import { useState, useEffect, useCallback } from "react"

export interface User {
  id: string
  name: string
  email: string
  role: string
  imageUrl?: string
  title?: string
  instagram?: string
  linkedin?: string
  authenticated?: boolean
}

// Cache user data to avoid excessive API calls
let userCache: { user: User | null; timestamp: number } | null = null
const CACHE_DURATION = 300000 // 5 minutes

function getSessionTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null
  let token: string | null = null
  for (const cookie of document.cookie.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=")
    if (name === "SESSION" && valueParts.length > 0) {
      token = decodeURIComponent(valueParts.join("="))
    }
  }
  return token
}

export function normalizeUser(data: Record<string, unknown>): User | null {
  if (!data?.id) return null
  return {
    id: String(data.id),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: String(data.role ?? "STUDENT"),
    imageUrl: String(data.imageUrl ?? ""),
    title: String(data.title ?? ""),
    instagram: String(data.instagram ?? ""),
    linkedin: String(data.linkedin ?? ""),
    authenticated: data.authenticated !== false,
  }
}

function writeUserCache(user: User | null) {
  userCache = { user, timestamp: Date.now() }
}

export function useUser() {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyUser = useCallback((next: User | null) => {
    setUserState(next)
    writeUserCache(next)
  }, [])

  const fetchUser = useCallback(async (bypassCache = false) => {
    if (!bypassCache && userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUserState(userCache.user)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/me?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      })

      if (res.ok) {
        const userData = await res.json()
        const normalized = normalizeUser(userData)
        if (normalized?.authenticated) {
          applyUser(normalized)
        } else {
          applyUser(null)
        }
      } else {
        const jwtToken = getSessionTokenFromCookies()
        if (jwtToken) {
          const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/me`,
            {
              headers: { Authorization: `Bearer ${jwtToken}` },
              cache: "no-store",
            }
          )

          if (backendRes.ok) {
            const userData = await backendRes.json()
            const normalized = normalizeUser(userData)
            if (normalized?.authenticated) {
              applyUser(normalized)
            } else {
              applyUser(null)
            }
          } else {
            applyUser(null)
          }
        } else {
          applyUser(null)
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      applyUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [applyUser])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const refreshUser = (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    }
    fetchUser(true)
  }

  const setUser = useCallback(
    (next: User | null) => {
      applyUser(next)
    },
    [applyUser]
  )

  return { user, isLoading, refreshUser, setUser }
}
