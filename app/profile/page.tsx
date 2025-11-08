"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, User, Mail, Calendar, Edit, Save, X, Upload, Instagram, Linkedin, Briefcase, Camera, Users } from "lucide-react"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import RequireAuth from "../components/RequireAuth"
import Navbar from "../components/Navbar"
import { useToast } from "@/hooks/use-toast"
import { ImageCropper } from "@/components/ui/image-cropper"

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    imageUrl: "",
    title: "",
    instagram: "",
    linkedin: ""
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl || "",
        title: (user as any).title || "",
        instagram: (user as any).instagram || "",
        linkedin: (user as any).linkedin || ""
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl || "",
        title: (user as any).title || "",
        instagram: (user as any).instagram || "",
        linkedin: (user as any).linkedin || ""
      })
    }
  }

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Open the cropper dialog
    setSelectedImageFile(file)
    setShowCropper(true)
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    setEditForm({ ...editForm, imageUrl: croppedImageUrl })
    setShowCropper(false)
    setSelectedImageFile(null)
    
    toast({
      title: "Success",
      description: "Profile picture ready! Click 'Save Changes' to update.",
    })
  }

  const handleSave = async () => {
    try {
      console.log("Updating profile with data:", editForm)
      
      const res = await fetch('/api/me', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm)
      })

      console.log("Profile update response status:", res.status)

      if (res.ok) {
        const updatedData = await res.json()
        console.log("Profile updated successfully:", updatedData)
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        setIsEditing(false)
        
        // Refresh user data by clearing cache and refetching
        refreshUser()
      } else {
        const errorData = await res.json()
        console.error("Profile update failed:", errorData)
        
        toast({
          title: "Error",
          description: errorData.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }



  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0476D7] to-[#005eb8] rounded-2xl mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading profile...</h3>
            <p className="text-gray-500">Please wait</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (!user) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Unable to load profile</h3>
            <Button asChild className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white rounded-xl px-8">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB]" />
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] opacity-50" />
              <div className="relative p-10 md:p-14">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white border-yellow-400 mb-4 rounded-full px-4 py-1">
                      <User className="h-3 w-3 mr-2" />
                      Your Account
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                      Profile
                    </h1>
                    <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                      Manage your account settings and preferences
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-blue-100">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Users className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Personal Info</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleEdit}
                        className="border-gray-200 hover:border-[#0476D7]/30 hover:bg-blue-50/50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                      <div className={`h-32 w-32 rounded-2xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center shadow-lg ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={handleProfilePictureClick}
                      >
                        {editForm.imageUrl || user.imageUrl ? (
                          <img
                            src={editForm.imageUrl || user.imageUrl}
                            alt={user.name}
                            className="h-32 w-32 rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {getInitials(user.name)}
                          </span>
                        )}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-center">
                              <Camera className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Change Photo</p>
                              <p className="text-xs mt-1 text-gray-300">Click to crop & edit</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Image Cropper Dialog */}
                    <ImageCropper
                      open={showCropper}
                      onClose={() => {
                        setShowCropper(false)
                        setSelectedImageFile(null)
                      }}
                      imageFile={selectedImageFile}
                      onCropComplete={handleCropComplete}
                      cropShape="round"
                      aspectRatio={1}
                    />
                    <div className="mt-4 text-center">
                      <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                      {(user as any).title && (
                        <p className="text-sm text-gray-600 mt-1">{(user as any).title}</p>
                      )}
                      <p className="text-gray-500 mt-1">{user.email}</p>
                      <Badge className="mt-3 bg-gradient-to-r from-[#FFBC00]/20 to-[#FFBC00]/10 text-yellow-700 border-yellow-300">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Enter your full name"
                            className="border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                          />
                        ) : (
                          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                            {user.name}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="Enter your email"
                            className="border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                          />
                        ) : (
                          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                            {user.email}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-[#0476D7]" />
                          Title / Role
                        </Label>
                        {isEditing ? (
                          <Input
                            id="title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="e.g. Full Stack Developer"
                            className="border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                          />
                        ) : (
                          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                            {(user as any).title || "Not set"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-500" />
                          Instagram
                        </Label>
                        {isEditing ? (
                          <Input
                            id="instagram"
                            value={editForm.instagram}
                            onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                            placeholder="@username"
                            className="border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                          />
                        ) : (
                          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                            {(user as any).instagram || "Not set"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </Label>
                        {isEditing ? (
                          <Input
                            id="linkedin"
                            value={editForm.linkedin}
                            onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                            placeholder="linkedin.com/in/username"
                            className="border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-xl"
                          />
                        ) : (
                          <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800">
                            {(user as any).linkedin || "Not set"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                      <Button 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all font-semibold border-0"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Account Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Account Summary</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Account Type</span>
                      <Badge className={user.role === "ADMIN" ? "bg-gradient-to-r from-[#0476D7] to-[#005eb8] text-white" : "bg-gradient-to-r from-[#FFBC00]/20 to-[#FFBC00]/10 text-yellow-700 border-yellow-300"}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Member Since</span>
                      <span className="text-sm font-semibold text-gray-800">Recently</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Status</span>
                      <Badge className="bg-green-50 text-green-700 border-green-300">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
