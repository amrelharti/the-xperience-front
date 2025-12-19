"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Settings, ArrowLeft, Save, Clock } from "lucide-react"

export default function LandingSettingsPage() {
  const [remainingSpots, setRemainingSpots] = useState(12)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/landing-page/settings/remaining-spots`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setRemainingSpots(data.remainingSpots || 12)
      } else {
        throw new Error("Failed to load settings")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load landing page settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch(`/api/admin/landing-page/settings/remaining-spots`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ remainingSpots }),
      })
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Remaining spots updated successfully",
        })
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to update remaining spots",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <UserDropdown user={user} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-[#0476D7] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b bg-white/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0476D7] hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-[#005eb8]" />
                  Landing Page Settings
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Manage landing page configuration
                </p>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#005eb8]" />
                Remaining Spots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#005eb8]"></div>
                  <p className="mt-4 text-slate-600">Loading settings...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="remainingSpots" className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Remaining Spots
                    </label>
                    <p className="text-xs text-slate-500 mb-4">
                      This number will be displayed on the landing page to create urgency. Update it as spots fill up.
                    </p>
                    <Input
                      id="remainingSpots"
                      type="number"
                      min="0"
                      value={remainingSpots}
                      onChange={(e) => setRemainingSpots(parseInt(e.target.value) || 0)}
                      className="max-w-xs text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Preview:</strong> The landing page will show: 
                      <span className="font-bold text-blue-900"> "{remainingSpots} spots left" </span>
                      or <span className="font-bold text-blue-900"> "{remainingSpots} places restantes" </span>
                      (depending on language)
                    </p>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#005eb8] hover:bg-[#0476D7] text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </RequireAdmin>
  )
}

