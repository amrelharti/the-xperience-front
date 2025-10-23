"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlayCircle, Edit, MoreVertical, Search } from "lucide-react"
import NextImage from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface AdminCoursesProps {
  courses: Course[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onEditCourse: (courseId: string) => void
  onDeleteCourse: (courseId: string) => void
}

const AdminCourses = React.memo(function AdminCourses({
  courses,
  searchQuery,
  onSearchChange,
  onEditCourse,
  onDeleteCourse
}: AdminCoursesProps) {
  const filteredCourses = useMemo(() => 
    courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [courses, searchQuery]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training Management</h2>
        <Button asChild>
          <Link href="/admin/modules/new">New Training</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trainings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              {course.thumbnailUrl ? (
                <NextImage
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Badge 
                variant={course.isPublished ? "default" : "secondary"}
                className="absolute right-2 top-2"
              >
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/modules/${course.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditCourse(course.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteCourse(course.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery ? "No trainings found matching your search." : "No trainings created yet."}
          </p>
        </div>
      )}
    </div>
  )
})

export default AdminCourses
