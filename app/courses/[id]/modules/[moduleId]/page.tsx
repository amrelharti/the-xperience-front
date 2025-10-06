"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  videoUrl?: string
  durationSeconds: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function ModuleVideoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)

  const courseId = params.id as string
  const moduleId = params.moduleId as string
  const [module, setModule] = useState<Module | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [watchProgress, setWatchProgress] = useState(0)
  const [hasCompletedThreshold, setHasCompletedThreshold] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Load module and course data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load module data
        const moduleRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/courses/${courseId}/modules/${moduleId}`, {
          credentials: "include",
        })
        if (moduleRes.ok) {
          const moduleData = await moduleRes.json()
          setModule(moduleData)
        }

        // Load course data
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/courses/${courseId}`, {
          credentials: "include",
        })
        if (courseRes.ok) {
          const courseData = await courseRes.json()
          setCourse(courseData)
        }

        // Check if module is completed
        const progressRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/progress`, {
          credentials: "include",
        })
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setIsCompleted(progressData.status === "COMPLETED")
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (courseId && moduleId) {
      loadData()
    }
  }, [courseId, moduleId])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const progress = (video.currentTime / video.duration) * 100
      setWatchProgress(progress)

      // Mark as completed when 90% watched
      if (progress >= 90 && !hasCompletedThreshold) {
        setHasCompletedThreshold(true)
        handleModuleComplete()
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (!hasCompletedThreshold) {
        handleModuleComplete()
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [hasCompletedThreshold])

  const handleModuleComplete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/complete`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setIsCompleted(true)
        toast({
          title: "Module Completed!",
          description: "Great job! Your progress has been saved.",
        })
      }
    } catch (error) {
      console.error("Error completing module:", error)
    }
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = (Number.parseFloat(e.target.value) / 100) * duration
    video.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Button asChild>
            <Link href={`/courses/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    )
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
          <Button variant="ghost" asChild>
            <Link href={`/courses/${courseId}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div
              className="relative bg-black rounded-lg overflow-hidden aspect-video group"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(isPlaying ? false : true)}
            >
              <video
                ref={videoRef}
                src={module.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                className="w-full h-full"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Video Controls Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${
                  showControls ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Play/Pause Button Center */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Play className="h-10 w-10 text-primary-foreground ml-1" />
                  </button>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(currentTime / duration) * 100 || 0}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>
                      <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-white hover:text-primary transition-colors">
                        <Settings className="h-5 w-5" />
                      </button>
                      <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{course?.title || "Course"}</Badge>
                {isCompleted && (
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">{module.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{module.description}</p>
              <div className="mt-2 text-sm text-muted-foreground">
                Duration: {Math.floor(module.durationSeconds / 60)} min
              </div>
            </div>

            {/* Watch Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Complete 90% of the video to mark this module as done</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Watch Progress</span>
                    <span className="font-medium">{Math.round(watchProgress)}%</span>
                  </div>
                  <Progress value={watchProgress} className="h-2" />
                </div>
                {watchProgress >= 90 && (
                  <div className="flex items-center gap-2 text-secondary">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Module completed!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar - Course Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>About this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{course?.title || "Course"}</h3>
                    <p className="text-sm text-muted-foreground">{course?.description || "Course description"}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href={`/courses/${courseId}`}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Course
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
