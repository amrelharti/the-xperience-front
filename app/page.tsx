"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Users, BookOpen, CheckCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import { useUser } from "./hooks/useUser";
import NextImage from "next/image";

interface Module {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
  isEnrolled?: boolean;
  enrolledClass?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  durationSeconds: number;
  orderIndex: number;
}

export default function TrainingsPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: userLoading } = useUser();

  const loadModules = useCallback(async () => {
    try {
      // If still loading user, don't proceed yet
      if (userLoading) {
        return;
      }
      
      // If no user, go directly to public endpoint
      if (!user) {
        const publicResponse = await fetch(`/api/public/courses?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setModules(data);
        }
        setLoading(false);
        return;
      }

      // PERFORMANCE FIX: Make API calls in PARALLEL instead of sequential
      const [coursesResponse, enrolledClassesResponse] = await Promise.all([
        fetch(`/api/courses`, { credentials: "include" }),
        user.id && user.authenticated 
          ? fetch(`/api/classes/my-classes`, { credentials: "include" })
          : Promise.resolve(null)
      ]);

      if (coursesResponse.ok) {
        const responseData = await coursesResponse.json();
        // Backend returns array directly, not wrapped in {courses: [...]}
        const coursesData = Array.isArray(responseData) ? responseData : (responseData.courses || []);

        // If we got enrolled classes data, merge it
        if (enrolledClassesResponse && enrolledClassesResponse.ok) {
          const enrolledClasses = await enrolledClassesResponse.json();
          
          // Mark modules as enrolled if user has a class for that module
          const modulesWithEnrollment = coursesData.map((module: Module) => {
            const enrolledClass = enrolledClasses.find((cls: any) => cls.moduleId === module.id);
            return {
              ...module,
              isEnrolled: !!enrolledClass,
              enrolledClass: enrolledClass ? {
                id: enrolledClass.id,
                name: enrolledClass.name,
                startDate: enrolledClass.startDate,
                endDate: enrolledClass.endDate
              } : undefined
            };
          });
          setModules(modulesWithEnrollment);
        } else {
          // No enrolled classes or error - just show modules
          setModules(coursesData);
        }
      } else {
        // Courses endpoint failed, trying public endpoint
        // Fallback to public endpoint
        const publicResponse = await fetch(`/api/public/courses`);
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setModules(data);
        }
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.authenticated, userLoading]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // Debug: Log when modules state changes
  useEffect(() => {



  }, [modules]);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getTotalDuration = useCallback((courses: Course[]) => {
    if (!courses || !Array.isArray(courses)) return 0;
    return courses.reduce((total, course) => total + (course.durationSeconds || 0), 0);
  }, []);

  if (loading) {
  return (
    <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading trainings...</div>
              </div>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Available Trainings</h1>
          <p className="text-muted-foreground">
            Choose a training and select a class to start your learning journey.
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Showing {modules.length} trainings ({modules.filter(m => m.isPublished).length} published, {modules.filter(m => !m.isPublished).length} coming soon)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trainings available</h3>
              <p className="text-muted-foreground">
                Check back later for new trainings.
            </p>
          </div>
          ) : (
            modules.map((module) => (
              <Card 
                key={module.id} 
                className={`transition-all duration-300 group relative ${
                  !module.isPublished 
                    ? 'opacity-75 bg-gradient-to-br from-orange-50 to-yellow-50 cursor-not-allowed' 
                    : 'hover:shadow-lg'
                }`}
                onClick={(e) => {
                  if (!module.isPublished) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
                  {module.thumbnailUrl && module.thumbnailUrl.trim() !== '' ? (
                    <NextImage
                      src={module.thumbnailUrl}
                      alt={module.title}
                      fill
                      className={`object-cover transition-transform duration-200 ${
                        module.isPublished ? 'group-hover:scale-105' : 'grayscale'
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      module.isPublished 
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
                        : 'bg-gradient-to-br from-orange-50 to-yellow-100'
                    }`}>
                      <BookOpen className={`h-12 w-12 ${module.isPublished ? 'text-blue-500' : 'text-orange-500'}`} />
                    </div>
                  )}
                  
                  {/* Coming Soon Overlay for Draft Modules */}
                  {!module.isPublished && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-orange-300">
                          <div className="flex items-center gap-2 text-orange-600 font-bold">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-sm">Coming Soon</span>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                      {/* Invisible overlay to prevent all interactions */}
                      <div className="absolute inset-0 z-10 cursor-not-allowed" 
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                           }}
                           title="This module is not yet available">
                      </div>
                    </>
                  )}
                </div>
              <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {module.description}
                </CardDescription>
                </div>
               <div className="flex flex-col gap-1">
                 {module.isPublished && (
                   <Badge variant="default">
                     Published
                   </Badge>
                 )}
                 {module.isEnrolled && (
                   <Badge className="bg-green-600">
                     <CheckCircle className="h-3 w-3 mr-1" />
                     Enrolled
                   </Badge>
                 )}
               </div>
        </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {module.courses && module.courses.length > 0 && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          <span>{module.courses?.length || 0} courses</span>
                  </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(getTotalDuration(module.courses || []))}</span>
          </div>
        </div>
                    )}
                    
                    {module.isEnrolled && module.enrolledClass && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          Enrolled in: {module.enrolledClass.name}
          </div>
                        <div className="text-xs text-green-600">
                          📅 {new Date(module.enrolledClass.startDate).toLocaleDateString()} - {new Date(module.enrolledClass.endDate).toLocaleDateString()}
          </div>
        </div>
                    )}
                    
                    <div className="pt-2">
                      {module.isPublished ? (
                        <Button asChild className="w-full">
                          <Link href={`/courses/${module.id}`}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            {module.isEnrolled ? "Continue Learning" : "View Module"}
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          disabled 
                          className="w-full bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 border-orange-200 hover:from-orange-200 hover:to-yellow-200 cursor-not-allowed"
                          title="This module is not yet available"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span>Coming Soon</span>
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          </div>
                        </Button>
                      )}
                    </div>
                  </div>
            </CardContent>
          </Card>
            ))
          )}
            </div>
          </div>
          </div>
  );
}
