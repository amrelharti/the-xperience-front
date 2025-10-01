"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, Search, BookOpen, Clock, CheckCircle, LogOut } from "lucide-react"

// Mock data - will be replaced with API calls to Spring Boot backend
const mockCourses = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Master HTML, CSS, and JavaScript from scratch with hands-on projects",
    thumbnail: "/web-development-code.png",
    totalModules: 12,
    completedModules: 5,
    duration: "8 hours",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Learn modern React patterns, hooks, and best practices for scalable applications",
    thumbnail: "/react-javascript-code.png",
    totalModules: 10,
    completedModules: 0,
    duration: "6 hours",
    level: "Advanced",
  },
  {
    id: 3,
    title: "Full-Stack Development",
    description: "Build complete applications with modern tech stack including Node.js and databases",
    thumbnail: "/fullstack-development.png",
    totalModules: 15,
    completedModules: 15,
    duration: "12 hours",
    level: "Intermediate",
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Create beautiful and intuitive user interfaces with modern design principles",
    thumbnail: "/ui-ux-design-concept.png",
    totalModules: 8,
    completedModules: 3,
    duration: "5 hours",
    level: "Beginner",
  },
  {
    id: 5,
    title: "Database Design & SQL",
    description: "Master database design, SQL queries, and optimization techniques",
    thumbnail: "/database-sql.jpg",
    totalModules: 10,
    completedModules: 0,
    duration: "7 hours",
    level: "Intermediate",
  },
  {
    id: 6,
    title: "API Development with REST",
    description: "Build robust RESTful APIs with authentication and best practices",
    thumbnail: "/api-rest-development.jpg",
    totalModules: 9,
    completedModules: 2,
    duration: "6 hours",
    level: "Intermediate",
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  const handleSignOut = () => {
    // TODO: Implement sign out - clear JWT cookie via backend
    console.log("[v0] Sign out - will call Spring Boot backend to clear session")
  }

  return (
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
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
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
            const progress = (course.completedModules / course.totalModules) * 100
            const isCompleted = course.completedModules === course.totalModules
            const isStarted = course.completedModules > 0

            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full aspect-video object-cover rounded-t-lg"
                    />
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
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalModules} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    {isStarted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {course.completedModules}/{course.totalModules}
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

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
