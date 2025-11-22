"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Bell, X, Check, Trash2, FileText, BookOpen, MessageSquare, Megaphone, FolderOpen, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotifications, Notification } from "../hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import NotificationTestButton from "./NotificationTestButton"

const getPostTypeIcon = (type: string) => {
  switch (type) {
    case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
    case 'WEEKLY_SUMMARY': return <BookOpen className="h-4 w-4" />
    case 'FEEDBACK': return <MessageSquare className="h-4 w-4" />
    case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
    case 'RESOURCES': return <FolderOpen className="h-4 w-4" />
    default: return <MessageSquare className="h-4 w-4" />
  }
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case 'ASSIGNMENT': return "bg-blue-100 text-blue-800"
    case 'WEEKLY_SUMMARY': return "bg-purple-100 text-purple-800"
    case 'FEEDBACK': return "bg-green-100 text-green-800"
    case 'ANNOUNCEMENT': return "bg-red-100 text-red-800"
    case 'RESOURCES': return "bg-teal-100 text-teal-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setOpen(false)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] p-0"
        align="end"
        sideOffset={5}
      >
        <div className="flex flex-col h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <NotificationTestButton />
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={markAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll be notified when someone posts in your classes
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => handleNotificationClick(notification)}
                    className="block hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-4 ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${getPostTypeColor(notification.postType)}`}>
                          {getPostTypeIcon(notification.postType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.authorName}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPostTypeColor(notification.postType)} border-0`}
                            >
                              {notification.postType}
                            </Badge>
                          </div>
                          {notification.postTitle && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                              {notification.postTitle}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

