"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, BookOpen, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../hooks/useUser";
import Navbar from "../components/Navbar";

interface Module {
  id: string;
  title: string;
  description: string;
}

interface Class {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  moduleName: string;
  startDate: string;
  endDate: string;
  maxStudents: number | null;
  currentEnrollments: number;
  createdAt: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useUser();
  const [classes, setClasses] = useState<Class[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Helper functions - MUST be defined before conditional returns
  const isEnrolledInClass = useCallback((classId: string) => {
    return myClasses.some(myClass => myClass.id === classId);
  }, [myClasses]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Check authentication
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, userLoading, router]);

  // Load data when user is available - PARALLEL for performance
  useEffect(() => {
    if (user) {
      Promise.all([loadModules(), loadMyClasses()]);
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedModuleId !== "all") {
      loadClassesByModule(selectedModuleId);
    } else if (user) {
      loadAllClasses();
    }
  }, [selectedModuleId, user]);

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const loadModules = async () => {
    try {
      const response = await fetch("/api/courses", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Flatten modules from all courses
        const allModules = data.flatMap((course: any) => 
          course.modules?.map((module: any) => ({
            id: module.id,
            title: module.title,
            description: module.description
          })) || []
        );
        setModules(allModules);
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  };

  const loadAllClasses = async () => {
    try {
      const response = await fetch("/api/classes", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassesByModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/classes/module/${moduleId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyClasses = async () => {
    try {
      const response = await fetch("/api/classes/my-classes", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMyClasses(data);
      }
    } catch (error) {
      console.error("Error loading my classes:", error);
    }
  };

  const handleEnroll = async (classId: string) => {
    setEnrolling(classId);
    try {
      const response = await fetch(`/api/classes/${classId}/enroll`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully enrolled in class!",
        });
        loadMyClasses();
        // Reload classes to update enrollment counts
        if (selectedModuleId !== "all") {
          loadClassesByModule(selectedModuleId);
        } else {
          loadAllClasses();
        }
      } else {
        const error = await response.text();
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error enrolling in class:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in class",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading classes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Choose Your Class</h1>
        <p className="text-muted-foreground">
          Select a training and enroll in a class to start your learning journey.
        </p>
      </div>

      {/* My Classes Section */}
      {myClasses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            My Classes
          </h2>
          <div className="grid gap-4">
            {myClasses.map((classItem) => (
              <Card key={classItem.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {classItem.name}
                    <Badge variant="secondary">{classItem.moduleName}</Badge>
                    <Badge className="bg-green-600">Enrolled</Badge>
                  </CardTitle>
                  <CardDescription>{classItem.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Start Date</div>
                      <div>{formatDate(classItem.startDate)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">End Date</div>
                      <div>{classItem.endDate ? formatDate(classItem.endDate) : "No end date"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Classmates</div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {classItem.currentEnrollments}
                        {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Training Selection */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Available Classes</h2>
        <div className="flex items-center gap-4">
          <BookOpen className="w-5 h-5" />
          <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a training" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trainings</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Classes */}
      <div className="grid gap-4">
        {classes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No classes available</h3>
                <p className="text-muted-foreground">
                  {selectedModuleId === "all" 
                    ? "No classes have been created yet." 
                    : "No classes available for this training."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          classes.map((classItem) => {
            const isEnrolled = isEnrolledInClass(classItem.id);
            const isFull = classItem.maxStudents && classItem.currentEnrollments >= classItem.maxStudents;
            
            return (
              <Card key={classItem.id} className={isEnrolled ? "border-green-200 bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {classItem.name}
                        <Badge variant="secondary">{classItem.moduleName}</Badge>
                        {isEnrolled && <Badge className="bg-green-600">Enrolled</Badge>}
                        {isFull && !isEnrolled && <Badge variant="destructive">Full</Badge>}
                      </CardTitle>
                      <CardDescription>{classItem.description}</CardDescription>
                    </div>
                    {!isEnrolled && !isFull && (
                      <Button
                        onClick={() => handleEnroll(classItem.id)}
                        disabled={enrolling === classItem.id}
                      >
                        {enrolling === classItem.id ? "Enrolling..." : "Enroll"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">Start Date</div>
                      <div>{formatDate(classItem.startDate)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">End Date</div>
                      <div>{classItem.endDate ? formatDate(classItem.endDate) : "No end date"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Enrollments</div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {classItem.currentEnrollments}
                        {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Created</div>
                      <div>{formatDate(classItem.createdAt)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}


