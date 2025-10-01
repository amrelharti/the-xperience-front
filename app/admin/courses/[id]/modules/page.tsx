"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, ChevronLeft, Plus, Edit, Trash2, GripVertical, Key, Copy, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Mock data
const mockModules = [
  { id: 1, title: "Introduction to Web Development", duration: "30 min", order: 1 },
  { id: 2, title: "HTML Basics", duration: "45 min", order: 2 },
  { id: 3, title: "CSS Fundamentals", duration: "50 min", order: 3 },
  { id: 4, title: "CSS Layouts with Flexbox", duration: "40 min", order: 4 },
  { id: 5, title: "CSS Grid System", duration: "45 min", order: 5 },
]

const mockAccessCodes = [
  { id: 1, code: "ABC123XYZ", moduleId: 1, used: false, usedBy: null, createdAt: "2025-01-10" },
  { id: 2, code: "DEF456UVW", moduleId: 1, used: true, usedBy: "john@example.com", createdAt: "2025-01-09" },
  { id: 3, code: "GHI789RST", moduleId: 2, used: false, usedBy: null, createdAt: "2025-01-08" },
]

export default function ManageModulesPage() {
  const params = useParams()
  const { toast } = useToast()
  const courseId = params.id as string

  const [modules, setModules] = useState(mockModules)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCodesDialogOpen, setIsCodesDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<(typeof mockModules)[0] | null>(null)
  const [accessCodes, setAccessCodes] = useState(mockAccessCodes)
  const [numberOfCodes, setNumberOfCodes] = useState(1)

  const [newModule, setNewModule] = useState({
    title: "",
    duration: "",
    videoUrl: "",
  })

  const handleAddModule = () => {
    // TODO: Call Spring Boot backend: POST /api/admin/courses/{courseId}/modules
    console.log("[v0] Adding module:", newModule)

    toast({
      title: "Module Added",
      description: "The module has been successfully added",
    })

    setIsAddDialogOpen(false)
    setNewModule({ title: "", duration: "", videoUrl: "" })
  }

  const handleEditModule = () => {
    // TODO: Call Spring Boot backend: PUT /api/admin/modules/{moduleId}
    console.log("[v0] Editing module:", selectedModule)

    toast({
      title: "Module Updated",
      description: "The module has been successfully updated",
    })

    setIsEditDialogOpen(false)
    setSelectedModule(null)
  }

  const handleDeleteModule = () => {
    // TODO: Call Spring Boot backend: DELETE /api/admin/modules/{moduleId}
    console.log("[v0] Deleting module:", selectedModule?.id)

    toast({
      title: "Module Deleted",
      description: "The module has been successfully deleted",
    })

    setIsDeleteDialogOpen(false)
    setSelectedModule(null)
  }

  const handleGenerateCodes = () => {
    // TODO: Call Spring Boot backend: POST /api/admin/modules/{moduleId}/access-codes
    // Body: { count: numberOfCodes }
    // Backend should generate unique codes and return them
    console.log("[v0] Generating", numberOfCodes, "access codes for module:", selectedModule?.id)

    toast({
      title: "Access Codes Generated",
      description: `${numberOfCodes} new access code(s) have been created`,
    })

    setNumberOfCodes(1)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Access code copied to clipboard",
    })
  }

  const handleDeleteCode = (codeId: number) => {
    // TODO: Call Spring Boot backend: DELETE /api/admin/access-codes/{codeId}
    console.log("[v0] Deleting access code:", codeId)

    toast({
      title: "Code Deleted",
      description: "Access code has been removed",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Manage Modules</h1>
            <p className="text-muted-foreground text-lg">Add, edit, and manage access codes for course modules</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>Drag to reorder, click to edit or manage access codes</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Module {index + 1}</Badge>
                        <span className="font-medium">{module.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{module.duration}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedModule(module)
                          setIsCodesDialogOpen(true)
                        }}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Codes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedModule(module)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedModule(module)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Module Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>Create a new module for this course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                placeholder="e.g., Introduction to JavaScript"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-duration">Duration</Label>
              <Input
                id="module-duration"
                placeholder="e.g., 45 min"
                value={newModule.duration}
                onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-video">Video URL</Label>
              <Input
                id="module-video"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={newModule.videoUrl}
                onChange={(e) => setNewModule({ ...newModule, videoUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Module Title</Label>
              <Input
                id="edit-title"
                value={selectedModule?.title || ""}
                onChange={(e) =>
                  setSelectedModule(selectedModule ? { ...selectedModule, title: e.target.value } : null)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                value={selectedModule?.duration || ""}
                onChange={(e) =>
                  setSelectedModule(selectedModule ? { ...selectedModule, duration: e.target.value } : null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditModule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModule?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCodesDialogOpen} onOpenChange={setIsCodesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Access Codes</DialogTitle>
            <DialogDescription>Generate and manage access codes for "{selectedModule?.title}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Generate New Codes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate New Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="code-count">Number of Codes</Label>
                    <Input
                      id="code-count"
                      type="number"
                      min="1"
                      max="50"
                      value={numberOfCodes}
                      onChange={(e) => setNumberOfCodes(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleGenerateCodes}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Codes List */}
            <div>
              <h3 className="font-semibold mb-3">Existing Access Codes</h3>
              <div className="space-y-2">
                {accessCodes
                  .filter((code) => code.moduleId === selectedModule?.id)
                  .map((code) => (
                    <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <code className="font-mono font-semibold text-lg">{code.code}</code>
                          {code.used ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Used
                            </Badge>
                          ) : (
                            <Badge variant="default">Available</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Created: {code.createdAt}
                          {code.used && code.usedBy && ` • Used by: ${code.usedBy}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleCopyCode(code.code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!code.used && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCode(code.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCodesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
