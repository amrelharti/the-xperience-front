"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Users, BookOpen, CheckCircle, Calendar } from "lucide-react";
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
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-base sm:text-lg">Loading trainings...</div>
              </div>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 font-[family-name:var(--font-montserrat)] tracking-tight bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent">
            Available Trainings
          </h1>
          <p className="text-sm sm:text-base text-[#6b7280] mb-3 sm:mb-4 max-w-2xl">
            Choose a training and select a class to start your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {modules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No trainings available</h3>
              <p className="text-muted-foreground">
                Check back later for new trainings.
            </p>
          </div>
          ) : (
            modules.map((module) => (
              <Card 
                key={module.id} 
                className={`transition-all duration-300 group relative overflow-hidden animate-fade-in ${
                  !module.isPublished 
                    ? 'opacity-90 bg-gradient-to-br from-[#FFBC00]/10 to-[#FFBC00]/5 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={(e) => {
                  if (!module.isPublished) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <div className="aspect-video bg-gradient-to-br from-[#0476D7]/10 to-[#0068A7]/5 rounded-t-2xl overflow-hidden relative border-b">
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
                        ? 'bg-gradient-to-br from-[#0476D7]/20 to-[#0068A7]/20' 
                        : 'bg-gradient-to-br from-[#FFBC00]/20 to-[#FFBC00]/10'
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
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl mb-1.5 sm:mb-2 leading-tight">{module.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {module.description}
                      </CardDescription>
                    </div>
                    {module.isEnrolled && (
                      <div className="flex-shrink-0">
                        <div className="relative inline-flex items-center justify-center">
                          <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20"></div>
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 relative" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                    {module.isPublished ? (
                      <Badge className="bg-[#0476D7] text-white hover:bg-[#0476D7]/90 text-xs">
                        Published
                      </Badge>
                    ) : (
                      <Badge className="bg-[#FFBC00] text-[#333] hover:bg-[#FFBC00]/90 text-xs">
                        Coming Soon
                      </Badge>
                    )}
                    {module.isEnrolled && (
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 text-xs">
                        Enrolled
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  <div className="space-y-3 sm:space-y-4">
                    {module.courses && module.courses.length > 0 && (
                      <div className="flex items-center gap-3 sm:gap-6 p-2.5 sm:p-3 bg-muted/30 rounded-lg sm:rounded-xl flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <div className="p-1 sm:p-1.5 bg-[#0476D7]/10 rounded-md sm:rounded-lg">
                            <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0476D7]" />
                          </div>
                          <span className="font-medium text-foreground">{module.courses?.length || 0} lessons</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <div className="p-1 sm:p-1.5 bg-[#0476D7]/10 rounded-md sm:rounded-lg">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0476D7]" />
                          </div>
                          <span className="font-medium text-foreground">{formatDuration(getTotalDuration(module.courses || []))}</span>
                        </div>
                      </div>
                    )}
                    
                    {module.isEnrolled && module.enrolledClass && (
                      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-200/20 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
                        <div className="relative">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-900 mb-1.5 sm:mb-2">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Enrolled Class
                          </div>
                          <div className="text-sm sm:text-base text-green-950 mb-1">{module.enrolledClass.name}</div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-green-700">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span>{new Date(module.enrolledClass.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(module.enrolledClass.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-0.5 sm:pt-1">
                      {module.isPublished ? (
                        <Button asChild className="w-full h-10 sm:h-12 text-sm sm:text-base shadow-md hover:shadow-lg group">
                          <Link href={`/courses/${module.id}`} className="flex items-center justify-center gap-2">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">{module.isEnrolled ? "Continue Learning" : "Start Learning"}</span>
                            <span className="sm:hidden">{module.isEnrolled ? "Continue" : "Start"}</span>
                            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">→</span>
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          disabled 
                          className="w-full h-10 sm:h-12 bg-gradient-to-r from-[#FFBC00]/10 to-[#FFBC00]/5 text-[#FFBC00] border-2 border-[#FFBC00]/20 cursor-not-allowed text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FFBC00] rounded-full animate-pulse"></div>
                            <span>Coming Soon</span>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FFBC00] rounded-full animate-pulse"></div>
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
