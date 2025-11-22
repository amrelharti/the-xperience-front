"use client"

import { Button } from "@/components/ui/button"
import { useNotifications } from "../hooks/useNotifications"
import { Bug } from "lucide-react"

export default function NotificationTestButton() {
  const { refresh, notifications, unreadCount } = useNotifications()

  const handleTest = () => {
    console.log("🧪 Manual notification test triggered")
    console.log("🧪 Current notifications:", notifications)
    console.log("🧪 Unread count:", unreadCount)
    refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTest}
      className="text-xs"
      title="Test notifications (check console)"
    >
      <Bug className="h-3 w-3 mr-1" />
      Test Notifications
    </Button>
  )
}

