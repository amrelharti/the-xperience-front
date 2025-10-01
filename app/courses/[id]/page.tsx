"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, CheckCircle, Lock, ChevronLeft, BookOpen, Clock, Award, LogOut } from "lucide-react"

// Mock data - will be replaced with API calls to Spring Boot backend
const mockCourseDetails = {
  1: {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Master HTML, CSS, and JavaScript from scratch with hands-on projects and real-world examples",
    thumbnail: "/web-development-code.png",
    totalModules: 12,
    completedModules: 5,
    duration: "8 hours",
    level: "Beginner",
    instructor: "John Smith",
    modules: [
      { id: 1, title: "Introduction to Web Development", duration: "30 min", isUnlocked: true, isCompleted: true },
      { id: 2, title: "HTML Basics", duration: "45 min", isUnlocked: true, isCompleted: true },
      { id: 3, title: "CSS Fundamentals", duration: "50 min", isUnlocked: true, isCompleted: true },
      { id: 4, title: "CSS Layouts with Flexbox", duration: "40 min", isUnlocked: true, isCompleted: true },
      { id: 5, title: "CSS Grid System", duration: "45 min", isUnlocked: true, isCompleted: true },
      { id: 6, title: "JavaScript Basics", duration: "60 min", isUnlocked: false, isCompleted: false },
      { id: 7, title: "DOM Manipulation", duration: "50 min", isUnlocked: false, isCompleted: false },
      { id: 8, title: "Events and Event Handling", duration: "45 min", isUnlocked: false, isCompleted: false },
      { id: 9, title: "Async JavaScript", duration: "55 min", isUnlocked: false, isCompleted: false },
      { id: 10, title: "Working with APIs", duration: "50 min", isUnlocked: false, isCompleted: false },
      { id: 11, title: "Project: Build a Todo App", duration: "90 min", isUnlocked: false, isCompleted: false },
      { id: 12, title: "Final Project & Certification", duration: "120 min", isUnlocked: false, isCompleted: false },
    ],
  },
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = Number.parseInt(params.id as string)
  const course = mockCourseDetails[courseId as keyof typeof mockCourseDetails]

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const progress = (course.completedModules / course.totalModules) * 100
  const nextModule = course.modules.find((m) => !m.isCompleted)

  const handleSignOut = () => {
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
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/courses">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </Button>

        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {course.totalModules} modules
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {course.duration}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4 font-[family-name:var(--font-space-grotesk)]">{course.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
            </div>

            <img
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="w-full aspect-video object-cover rounded-lg"
            />

            <Card>
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Instructor</div>
                    <div className="text-sm text-muted-foreground">{course.instructor}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Progress</span>
                    <span className="font-medium">
                      {course.completedModules}/{course.totalModules} modules completed
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Next Module */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextModule ? (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Next Module</div>
                      <div className="font-medium">{nextModule.title}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{nextModule.duration}</span>
                      </div>
                    </div>
                    {nextModule.isUnlocked ? (
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/courses/${course.id}/modules/${nextModule.id}`}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Module
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/courses/${course.id}/modules/${nextModule.id}/unlock`}>
                          <Lock className="h-4 w-4 mr-2" />
                          Unlock Module
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-secondary mx-auto mb-2" />
                    <div className="font-medium mb-1">Course Completed!</div>
                    <div className="text-sm text-muted-foreground">Congratulations on finishing this course</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modules List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)]">Course Modules</h2>
          <div className="space-y-3">
            {course.modules.map((module, index) => (
              <Card
                key={module.id}
                className={`transition-all ${module.isUnlocked ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}
              >
                <Link
                  href={
                    module.isUnlocked
                      ? `/courses/${course.id}/modules/${module.id}`
                      : `/courses/${course.id}/modules/${module.id}/unlock`
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          module.isCompleted
                            ? "bg-secondary text-secondary-foreground"
                            : module.isUnlocked
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {module.isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : module.isUnlocked ? (
                          <PlayCircle className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Module {index + 1}</span>
                          {module.isCompleted && <Badge variant="secondary">Completed</Badge>}
                          {!module.isUnlocked && <Badge variant="outline">Locked</Badge>}
                        </div>
                        <div className="font-medium">{module.title}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
