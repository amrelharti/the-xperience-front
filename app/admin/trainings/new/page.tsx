"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, BookOpen, Menu, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import ImageUpload from "@/components/ui/image-upload"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"

export default function NewTrainingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Modern Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-10 w-25"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/trainings" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Trainings
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/classes" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Classes
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Users
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/feed" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Feed
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/leaderboard" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-6 py-4 space-y-3">
                <Link 
                  href="/admin" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/trainings" 
                  className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trainings
                </Link>
                <Link 
                  href="/admin/classes" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Classes
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  href="/admin/feed" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link 
                  href="/admin/leaderboard" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          )}
        </header>

        <div className="container mx-auto px-6 py-8 max-w-3xl">
          {/* Back Button */}
          <Button variant="outline" asChild className="mb-6 hover:bg-slate-100">
            <Link href="/admin/trainings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trainings
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center space-y-4 mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              New Training
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              Create New Training
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Create a new training program, then add weeks and courses
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                  Training Information
                </CardTitle>
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
                    className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
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
                    className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
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
            <Card className="mt-6 border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-[#005eb8]" />
                  What happens next?
                </h3>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">1</span>
                    Create this training program
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">2</span>
                    You'll be redirected to <strong className="text-[#005eb8]">Module Management</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">3</span>
                    Add modules (Module 1, Module 2, Module 3...)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">4</span>
                    Add multiple courses to each module
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">5</span>
                    Schedule live sessions for each module
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">6</span>
                    Generate access codes per module
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#005eb8] text-white text-xs flex items-center justify-center font-semibold">7</span>
                    Create classes for students to enroll!
                  </li>
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
                className="hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.description}
                className="flex-1 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
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
