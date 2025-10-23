"use client"

import { useState, useRef, useEffect, memo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Settings, BookOpen, LogOut, ChevronDown, MessageSquare, Trophy } from "lucide-react"
import { useUser } from "../hooks/useUser"

interface UserDropdownProps {
  user?: {
    id: string
    name: string
    email: string
    role: string
    imageUrl?: string
  }
}

function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { refreshUser } = useUser()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Don't render if user is not available
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      console.log("Starting logout process...")
      
      const res = await fetch(`/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      console.log("Logout response:", res.status)
      
      if (res.ok || res.status === 204) {
        console.log("Logout successful, clearing user state")
        // Refresh user state to clear it
        refreshUser()
        // Force a hard refresh to clear all state
        window.location.reload()
      } else {
        console.error("Sign out failed:", res.status, res.statusText)
        // Still redirect
        window.location.reload()
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Still redirect
      window.location.reload()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
      >
        <div className="flex items-center gap-2">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user?.name || ''}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {getInitials(user?.name || '')}
              </span>
            </div>
          )}
          <span className="hidden sm:inline text-sm font-medium">{user?.name || ''}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="py-2">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.name || ''}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {getInitials(user?.name || '')}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name || ''}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-1">
                    {user?.role || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                Edit Profile
              </Link>

              <Link
                href={user?.role === "ADMIN" ? "/admin/feed" : "/feed"}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-4 w-4" />
                {user?.role === "ADMIN" ? "Admin Feed" : "Feed"}
              </Link>

              <Link
                href={user?.role === "ADMIN" ? "/admin/leaderboard" : "/leaderboard"}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                {user?.role === "ADMIN" ? "Admin Leaderboard" : "Leaderboard"}
              </Link>

              {user?.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/my-courses"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  My Courses
                </Link>
              )}
            </div>

            {/* Sign Out */}
            <div className="border-t border-border py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(UserDropdown);
