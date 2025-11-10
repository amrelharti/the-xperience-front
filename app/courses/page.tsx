/*
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, Search, BookOpen, Clock, CheckCircle } from "lucide-react"
import RequireAuth from "@/app/components/RequireAuth"
import { useEffect } from "react"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import NextImage from "next/image"

type CourseItem = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished?: boolean
  level?: string
  progress?: { completedModules: number; totalModules: number; percent: number }
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isLoading: userLoading } = useUser()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesLevel = !selectedLevel // level not from API yet
        return matchesSearch && matchesLevel
      })
      .sort((a, b) => {
        // Priority 1: Published courses first
        const aPublished = a.isPublished ? 1 : 0
        const bPublished = b.isPublished ? 1 : 0
        if (aPublished !== bPublished) return bPublished - aPublished
        
        // Priority 2: Enrolled courses (with progress) first
        const aEnrolled = (a.progress?.totalModules || 0) > 0 ? 1 : 0
        const bEnrolled = (b.progress?.totalModules || 0) > 0 ? 1 : 0
        if (aEnrolled !== bEnrolled) return bEnrolled - aEnrolled
        
        // Priority 3: Keep original order for courses with same status
        return 0
      })
  }, [courses, searchQuery, selectedLevel])


  return (
    <RequireAuth>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
          </Link>
          <div className="flex items-center gap-4">
            {user && <UserDropdown user={user} />}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">My Courses</h1>
          <p className="text-muted-foreground text-lg">Continue your learning journey</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedLevel === null ? "default" : "outline"}
              onClick={() => setSelectedLevel(null)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedLevel === "Beginner" ? "default" : "outline"}
              onClick={() => setSelectedLevel("Beginner")}
              size="sm"
            >
              Beginner
            </Button>
            <Button
              variant={selectedLevel === "Intermediate" ? "default" : "outline"}
              onClick={() => setSelectedLevel("Intermediate")}
              size="sm"
            >
              Intermediate
            </Button>
            <Button
              variant={selectedLevel === "Advanced" ? "default" : "outline"}
              onClick={() => setSelectedLevel("Advanced")}
              size="sm"
            >
              Advanced
            </Button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const completed = course.progress?.completedModules || 0
            const total = course.progress?.totalModules || 0
            const progress = course.progress?.percent || 0
            const isCompleted = total > 0 && completed === total
            const isStarted = completed > 0

            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative">
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                      {course.thumbnailUrl ? (
                        <NextImage
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-primary/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No thumbnail</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      {course.level}
                    </Badge>
                    {isCompleted && (
                      <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-full p-1.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-[family-name:var(--font-space-grotesk)] line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      {total > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{total} modules</span>
                        </div>
                      )}
                    </div>
                    {isStarted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {completed}/{total}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading courses...</p>
          </div>
        )}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
    </RequireAuth>
  )
}
*/