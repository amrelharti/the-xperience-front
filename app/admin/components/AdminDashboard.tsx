"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Trophy, MessageSquare, BarChart3 } from "lucide-react"
import { LazyAdminStats, LazyAdminCourses, LazyAdminUsers } from "./LazyAdminComponents"

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

interface AdminDashboardProps {
  courses: Course[]
  users: User[]
  isLoading: boolean
  onLoadCourses: () => void
  onLoadUsers: () => void
  onEditCourse: (courseId: string) => void
  onDeleteCourse: (courseId: string) => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
}

export default function AdminDashboard({
  courses,
  users,
  isLoading,
  onLoadCourses,
  onLoadUsers,
  onEditCourse,
  onDeleteCourse,
  onEditUser,
  onDeleteUser
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "users">("courses")
  const [searchQuery, setSearchQuery] = useState("")

  const publishedCourses = courses.filter(course => course.isPublished).length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, Admin
        </div>
      </div>

      {/* Statistics */}
      <LazyAdminStats 
        coursesCount={courses.length}
        usersCount={users.length}
        publishedCourses={publishedCourses}
      />

      {/* Monitoring Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monitoring Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20">
              <Link href="/admin/students">
                <Users className="h-6 w-6 text-purple-400" />
                <span>Student Analysis</span>
                <span className="text-xs text-muted-foreground">360° student view</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/analytics/dashboard">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics Dashboard</span>
                <span className="text-xs text-muted-foreground">View platform insights</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/leaderboard">
                <Trophy className="h-6 w-6" />
                <span>Class Leaderboards</span>
                <span className="text-xs text-muted-foreground">Monitor student rankings</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/feed">
                <MessageSquare className="h-6 w-6" />
                <span>Class Feeds</span>
                <span className="text-xs text-muted-foreground">Manage posts & comments</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/admin/users">
                <Users className="h-6 w-6" />
                <span>User Management</span>
                <span className="text-xs text-muted-foreground">Manage students & admins</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "courses" | "users")}>
        <TabsList>
          <TabsTrigger value="courses">Trainings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <LazyAdminCourses
            courses={courses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEditCourse={onEditCourse}
            onDeleteCourse={onDeleteCourse}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <LazyAdminUsers
            users={users}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
