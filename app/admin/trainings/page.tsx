"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, BookOpen, Calendar, Users, Menu, X } from "lucide-react"
import NextImage from "next/image"
import Navbar from "../../components/Navbar"
import RequireAdmin from "../../components/RequireAdmin"
import UserDropdown from "../../components/UserDropdown"
import { useUser } from "../../hooks/useUser"

interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  weeksCount?: number // Count of weeks in this training
  modulesCount?: number // Count of modules in this training (for clarity)
}

export default function TrainingsManagementPage() {
  const router = useRouter()
  const { user } = useUser()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadTrainings()
  }, [])

  const loadTrainings = async () => {
    try {
      setLoading(true)
      // Load trainings from the correct endpoint
      const res = await fetch("/api/admin/courses", {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        console.log("Loaded trainings:", data)
        
        // Load module counts for each training
        const trainingsWithCounts = await Promise.all(
          data.map(async (training: any) => {
            try {
              // Get modules for this specific training
              const modulesRes = await fetch(`/api/admin/courses/${training.id}/modules`, {
                credentials: "include"
              })
              if (modulesRes.ok) {
                const modules = await modulesRes.json()
                return {
                  ...training,
                  weeksCount: modules.length,
                  modulesCount: modules.length // Add this for clarity
                }
              }
              return {
                ...training,
                weeksCount: 0,
                modulesCount: 0
              }
            } catch (error) {
              console.error(`Error loading modules for training ${training.id}:`, error)
              return {
                ...training,
                weeksCount: 0,
                modulesCount: 0
              }
            }
          })
        )
        
        console.log("Trainings with module counts:", trainingsWithCounts)
        setTrainings(trainingsWithCounts)
      }
    } catch (error) {
      console.error("Error loading trainings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainings = trainings.filter(training =>
    training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading trainings...</p>
          </div>
        </div>
      </RequireAdmin>
    )
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

        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Training Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              Training Programs
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Manage your training programs. Each training contains multiple weeks with courses and live sessions.
            </p>
          </div>

          {/* Enhanced Stats */}
          <div className="grid gap-6 md:grid-cols-3 animate-slide-up">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Total Trainings</CardTitle>
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#005eb8] mb-1">{trainings.length}</div>
                <p className="text-sm text-slate-500">Training programs</p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#005eb8] to-[#0476D7] rounded-full w-3/4"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Published</CardTitle>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {trainings.filter(t => t.isPublished).length}
                </div>
                <p className="text-sm text-slate-500">Published programs</p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-2/3"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Draft</CardTitle>
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Edit className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {trainings.filter(t => !t.isPublished).length}
                </div>
                <p className="text-sm text-slate-500">Draft programs</p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                    placeholder="Search trainings by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
              />
            </div>
                <Button asChild className="h-12 px-8 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <Link href="/admin/trainings/new">
                    <Plus className="h-5 w-5 mr-2" />
                New Training
              </Link>
            </Button>
          </div>
            </CardContent>
          </Card>

          {/* Training Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training, index) => (
              <Card 
                key={training.id} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => router.push(`/admin/trainings/${training.id}`)}
              >
                <div className="relative h-56 w-full overflow-hidden rounded-t-xl">
                  {training.thumbnailUrl ? (
                    <NextImage
                      src={training.thumbnailUrl}
                      alt={training.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#005eb8]/20 to-[#0476D7]/10 group-hover:from-[#005eb8]/30 group-hover:to-[#0476D7]/20 transition-all duration-300">
                      <BookOpen className="h-20 w-20 text-[#005eb8]/50 group-hover:text-[#005eb8]/70 transition-colors duration-300" />
                    </div>
                  )}
                  <Badge 
                    variant={training.isPublished ? "default" : "secondary"}
                    className={`absolute right-3 top-3 px-3 py-1 text-xs font-semibold ${
                      training.isPublished 
                        ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {training.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-lg font-bold text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200">
                    {training.title}
                  </CardTitle>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {training.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{training.weeksCount || 0} modules</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(training.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Click indicator */}
                    <div className="flex items-center justify-center py-2 px-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg group-hover:from-[#005eb8]/5 group-hover:to-[#0476D7]/5 transition-all duration-200">
                      <p className="text-xs text-slate-500 group-hover:text-[#005eb8] font-medium">
                        Click to view details →
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrainings.length === 0 && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-16">
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">No trainings found</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first training program"}
              </p>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <Link href="/admin/trainings/new">
                      <Plus className="h-5 w-5 mr-2" />
                  Create Training
                </Link>
              </Button>
            </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RequireAdmin>
  )
}
