"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, BookOpen, Calendar, Users } from "lucide-react"
import NextImage from "next/image"
import Navbar from "../../components/Navbar"
import RequireAdmin from "../../components/RequireAdmin"

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
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Training Programs</h1>
            <p className="text-muted-foreground">
              Manage your training programs. Each training contains multiple weeks with courses.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trainings.filter(t => t.isPublished).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trainings.filter(t => !t.isPublished).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button asChild>
              <Link href="/admin/trainings/new">
                <Plus className="h-4 w-4 mr-2" />
                New Training
              </Link>
            </Button>
          </div>

          {/* Training Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <Card 
                key={training.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/trainings/${training.id}`)}
              >
                <div className="relative h-48 w-full">
                  {training.thumbnailUrl ? (
                    <NextImage
                      src={training.thumbnailUrl}
                      alt={training.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg">
                      <BookOpen className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  <Badge 
                    variant={training.isPublished ? "default" : "secondary"}
                    className="absolute right-2 top-2"
                  >
                    {training.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">{training.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {training.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{training.weeksCount || 0} modules</span>
                      </div>
                      <div className="text-xs">
                        {new Date(training.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Click card to view details */}
                    <p className="text-xs text-center text-muted-foreground">
                      Click to view details
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrainings.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trainings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first training program"}
              </p>
              <Button asChild>
                <Link href="/admin/trainings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Training
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </RequireAdmin>
  )
}
