"use client"

import { lazy, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Lazy load admin components
const AdminCourses = lazy(() => import("./AdminCourses"))
const AdminUsers = lazy(() => import("./AdminUsers"))
const AdminStats = lazy(() => import("./AdminStats"))

// Loading component
function AdminLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Lazy wrapper components
export function LazyAdminStats(props: any) {
  return (
    <Suspense fallback={<AdminLoadingSkeleton />}>
      <AdminStats {...props} />
    </Suspense>
  )
}

export function LazyAdminCourses(props: any) {
  return (
    <Suspense fallback={<AdminLoadingSkeleton />}>
      <AdminCourses {...props} />
    </Suspense>
  )
}

export function LazyAdminUsers(props: any) {
  return (
    <Suspense fallback={<AdminLoadingSkeleton />}>
      <AdminUsers {...props} />
    </Suspense>
  )
}

// Simple loading spinner
export function AdminLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>
  )
}


