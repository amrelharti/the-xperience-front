"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function RedirectToWeeks() {
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    // Redirect old /admin/courses/[id]/modules to new /admin/trainings/[id]/weeks
    const trainingId = params.id as string
    router.replace(`/admin/trainings/${trainingId}/weeks`)
  }, [router, params])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p>Redirecting to Week Management...</p>
      </div>
    </div>
  )
}


