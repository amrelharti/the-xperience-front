"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Menu, X, FileCheck, ArrowLeft, Mail, Phone, User, Calendar, TrendingUp } from "lucide-react"

interface CvScorerSubmission {
  id: string
  name: string
  email: string
  phone: string
  finalScore: number | null
  createdAt: string
}

export default function CvScoreUsersPage() {
  const [submissions, setSubmissions] = useState<CvScorerSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/cv-score-users`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        // Sort by created date, newest first
        const sorted = data.sort((a: CvScorerSubmission, b: CvScorerSubmission) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setSubmissions(sorted)
        console.log("📊 Loaded", sorted.length, "CV scorer submissions")
      } else {
        throw new Error("Failed to load submissions")
      }
    } catch (error) {
      console.error("Error loading submissions:", error)
      toast({
        title: "Error",
        description: "Failed to load CV scorer submissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-slate-500"
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
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
                <Link href="/admin/trainings" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Trainings
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Users
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-slate-100 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                  CV Score Users
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  View all users who submitted their contact information through CV scorer
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-[#005eb8]">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions List */}
          {isLoading ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600">Loading submissions...</p>
              </CardContent>
            </Card>
          ) : submissions.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6 text-center">
                <FileCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Name</p>
                          <p className="font-semibold text-slate-900">{submission.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Email</p>
                          <p className="font-semibold text-slate-900 break-all">{submission.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Phone</p>
                          <p className="font-semibold text-slate-900">{submission.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Score</p>
                          <p className={`font-bold text-lg ${getScoreColor(submission.finalScore)}`}>
                            {submission.finalScore !== null ? `${submission.finalScore}/100` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {formatDate(submission.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAdmin>
  )
}

