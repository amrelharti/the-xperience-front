"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectToTrainings() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect old /admin/modules to new /admin/trainings
    router.replace("/admin/trainings")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p>Redirecting to Trainings...</p>
      </div>
    </div>
  )
}


