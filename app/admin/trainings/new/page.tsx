"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import Navbar from "@/app/components/Navbar"
import ImageUpload from "@/components/ui/image-upload"

export default function NewTrainingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    isPublished: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: "Training Created",
          description: "Training created successfully! Now add modules and courses.",
        })
        // Redirect to module management for the new training
        router.push(`/admin/trainings/${data.id}/modules`)
      } else {
        const error = await res.text()
        console.error("Failed to create training:", error)
        toast({
          title: "Error",
          description: "Failed to create training",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating training:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/admin/trainings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
            </Button>

            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create New Training</h1>
                <p className="text-muted-foreground">
                  Create a new training program, then add weeks and courses
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Training Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Training Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Full Stack Web Development Bootcamp"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a clear, descriptive name for your training program
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what students will learn in this training program..."
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a detailed overview of the training content and objectives
                  </p>
                </div>

                {/* Thumbnail */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Training Thumbnail</Label>
                  <ImageUpload
                    onImageSelect={(dataUrl) => setFormData({ ...formData, thumbnailUrl: dataUrl })}
                    currentImage={formData.thumbnailUrl}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a cover image for this training (recommended: 1200x630px)
                  </p>
                </div>

                {/* Publish Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                    Publish immediately (students can see this training)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Info */}
            <Card className="mt-6 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  What happens next?
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Create this training program</li>
                  <li>2. You'll be redirected to <strong>Module Management</strong></li>
                  <li>3. Add modules (Module 1, Module 2, Module 3...)</li>
                  <li>4. Add multiple courses to each module</li>
                  <li>5. Schedule live sessions for each module</li>
                  <li>6. Generate access codes per module</li>
                  <li>7. Create classes for students to enroll!</li>
                </ol>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/trainings")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.description}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Training & Add Modules
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RequireAdmin>
  )
}
