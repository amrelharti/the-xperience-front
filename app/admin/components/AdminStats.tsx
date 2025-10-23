"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, TrendingUp } from "lucide-react"

interface AdminStatsProps {
  coursesCount: number
  usersCount: number
  publishedCourses: number
}

const AdminStats = React.memo(function AdminStats({ 
  coursesCount, 
  usersCount, 
  publishedCourses 
}: AdminStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coursesCount}</div>
          <p className="text-xs text-muted-foreground">
            Live trainings: {publishedCourses}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usersCount}</div>
          <p className="text-xs text-muted-foreground">
            Active users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {coursesCount > 0 ? Math.round((publishedCourses / coursesCount) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Training completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
})

export default AdminStats
