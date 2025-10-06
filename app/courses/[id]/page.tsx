"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, CheckCircle, Lock, ChevronLeft, BookOpen, Clock, Award } from "lucide-react"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"

type ModuleDto = { id: string; title: string; durationSeconds: number; orderIndex: number; status: string }
type CourseDetail = { id: string; title: string; description: string; thumbnailUrl?: string; modules: ModuleDto[] }

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [completed, setCompleted] = useState(0)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
        const c = data.modules.filter((m: ModuleDto) => m.status === "COMPLETED").length
        setCompleted(c)
        // Check if user is enrolled (if they can access the course details, they're enrolled)
        setIsEnrolled(true)
      } else if (res.status === 403) {
        // User is not enrolled
        setIsEnrolled(false)
        // Load course details from public API
        const publicRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/courses/${courseId}`)
        if (publicRes.ok) {
          const data = await publicRes.json()
          setCourse(data)
        }
      }
    }
    load()
  }, [courseId])

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include"
      })
      if (res.ok) {
        setIsEnrolled(true)
        // Reload the course data to get modules
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}`, { credentials: "include" })
        if (courseRes.ok) {
          const data = await courseRes.json()
          setCourse(data)
        }
      }
    } catch (error) {
      console.error("Enrollment failed:", error)
    } finally {
      setIsEnrolling(false)
    }
  }

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

  const totalModules = course.modules.length
  const progress = totalModules === 0 ? 0 : (completed / totalModules) * 100
  const nextModule = course.modules.find((m) => m.status !== "COMPLETED")


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
            {user && <UserDropdown user={user} />}
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
              
              {/* Enrollment Button */}
              {!isEnrolled && (
                <div className="mt-6">
                  <Button 
                    onClick={handleEnroll} 
                    disabled={isEnrolling}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll in Course"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start your learning journey with this course
                  </p>
                </div>
              )}
            </div>

            <img
              src={course.thumbnailUrl || "/placeholder.svg"}
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
                          {completed}/{totalModules} modules completed
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
                    {nextModule.status === "IN_PROGRESS" || nextModule.status === "COMPLETED" ? (
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
                className={`transition-all ${module.status !== "LOCKED" ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}
              >
                <Link
                  href={module.status !== "LOCKED" ? `/courses/${course.id}/modules/${module.id}` : `/courses/${course.id}/modules/${module.id}/unlock`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          module.status === "COMPLETED"
                            ? "bg-secondary text-secondary-foreground"
                            : module.status !== "LOCKED"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {module.status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : module.status !== "LOCKED" ? (
                          <PlayCircle className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Module {index + 1}</span>
                          {module.status === "COMPLETED" && <Badge variant="secondary">Completed</Badge>}
                          {module.status === "LOCKED" && <Badge variant="outline">Locked</Badge>}
                        </div>
                        <div className="font-medium">{module.title}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{Math.round(module.durationSeconds / 60)} min</span>
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
