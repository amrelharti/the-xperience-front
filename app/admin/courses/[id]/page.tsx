"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, ChevronLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
const mockCourse = {
  id: 1,
  title: "Web Development Fundamentals",
  description: "Master HTML, CSS, and JavaScript from scratch with hands-on projects",
  level: "Beginner",
  duration: "8 hours",
  instructor: "John Smith",
  thumbnail: "/web-development-code.png",
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: mockCourse.title,
    description: mockCourse.description,
    level: mockCourse.level,
    duration: mockCourse.duration,
    instructor: mockCourse.instructor,
    thumbnail: mockCourse.thumbnail,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Call Spring Boot backend: PUT /api/admin/courses/{id}
    // Body: formData
    console.log("[v0] Updating course:", courseId, formData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Course Updated",
        description: "Your changes have been saved successfully",
      })
      router.push("/admin")
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Edit Course</h1>
            <p className="text-muted-foreground text-lg">Update course information and settings</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Modify the course information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Web Development Fundamentals"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Select value={formData.level} onValueChange={(value) => handleChange("level", value)} required>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 8 hours"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor Name *</Label>
                  <Input
                    id="instructor"
                    placeholder="e.g., John Smith"
                    value={formData.instructor}
                    onChange={(e) => handleChange("instructor", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnail}
                    onChange={(e) => handleChange("thumbnail", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Optional: Provide a URL for the course thumbnail</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/courses/${courseId}/modules`}>Manage Modules</Link>
              </Button>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
