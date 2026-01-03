"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "../hooks/useUser"
import { Upload, FileText, Loader2, CheckCircle2, XCircle, TrendingUp, FileCheck, Languages, Briefcase, FileSearch, ArrowRight, X } from "lucide-react"
import Navbar from "@/app/components/Navbar"
import CVScorerChat from "@/components/CVScorerChat"

interface CvScoreResponse {
  region: string
  target_role: string
  scores: {
    structure_readability: {
      layout_clarity: number
      section_completeness: number
      visual_hierarchy: number
      length_appropriateness: number
      total: number
    }
    content_quality: {
      summary_headline: number
      summary_paragraph: number
      experience_structure: number
      experience_action_verbs: number
      experience_impact: number
      education: number
      skills_relevance_depth: number
      skills_organization_realism: number
      extra_sections: {
        score: number
        projects_present: boolean
        certifications_present: boolean
        languages_present: boolean
        activites_para_universitaires_present: boolean
        interests_present: boolean
      }
      total: number
    }
    relevance_targeting: {
      role_alignment: number
      keyword_match: number
      trajectory_coherence: number
      total: number
    }
    professionalism_language: {
      grammar_spelling: number
      tone_formality: number
      cultural_personal_info: number
      total: number
    }
    technical_ats: {
      parsing_friendliness: number
      standard_conventions: number
      file_format_naming: number
      total: number
    }
  }
  final_score: number
  feedback: {
    summary: string
    strengths: string[]
    improvements: string[]
    dimensions?: {
      structure_readability?: {
        strengths: string[]
        improvements: string[]
      }
      content_quality?: {
        strengths: string[]
        improvements: string[]
      }
      relevance_targeting?: {
        strengths: string[]
        improvements: string[]
      }
      professionalism_language?: {
        strengths: string[]
        improvements: string[]
      }
      technical_ats?: {
        strengths: string[]
        improvements: string[]
      }
    }
  }
}

export default function CvScorerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [feedbackLanguage, setFeedbackLanguage] = useState<"FRENCH" | "ENGLISH" | "AUTO">("AUTO")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CvScoreResponse | null>(null)
  const [pendingResult, setPendingResult] = useState<CvScoreResponse | null>(null) // Store result before showing form
  const [error, setError] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" })
  const [submittingForm, setSubmittingForm] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useUser()
  const router = useRouter()

  // Show popup 1 minute after result is displayed
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setShowPopup(true)
      }, 60000) // 1 minute

      return () => clearTimeout(timer)
    } else {
      setShowPopup(false)
    }
  }, [result])

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Use backend extraction - faster and more reliable
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-pdf-text", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to extract text" }))
        throw new Error(errorData.error || "Failed to extract text from PDF")
      }

      const data = await response.json()
      return data.text || ""
    } catch (error) {
      console.error("Error extracting PDF text:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to extract text from PDF")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setResult(null)
      setError(null)

      // Extract text and store in localStorage for chat sharing
      try {
        const extractedText = await extractTextFromPDF(selectedFile)
        const cvData = {
          text: extractedText,
          fileName: selectedFile.name,
          timestamp: Date.now(),
        }
        localStorage.setItem("cv-scorer-cv-context", JSON.stringify(cvData))
        
        // Dispatch custom event to notify chat component
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cv-uploaded", { detail: cvData }))
        }
      } catch (error) {
        console.error("Error extracting CV text for chat:", error)
        // Don't show error to user, just log it
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to score",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (targetRole.trim()) {
        formData.append("targetRole", targetRole.trim())
      }
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim())
      }
      if (feedbackLanguage !== "AUTO") {
        formData.append("feedbackLanguage", feedbackLanguage)
      }

      const response = await fetch("/api/cv-scorer", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || "Failed to score CV")
        toast({
          title: "Error",
          description: data.error || "Failed to score CV",
          variant: "destructive",
        })
        return
      }

      // For non-authenticated users, show form first, then results
      // For authenticated users, show results immediately
      if (!user && !userLoading) {
        // Store result temporarily and show form
        setPendingResult(data)
        setShowContactForm(true)
      } else {
        // Authenticated user - show results immediately
        setResult(data)
        toast({
          title: "CV scored successfully",
          description: `Your CV scored ${data.final_score}/100`,
        })
      }
    } catch (error) {
      console.error("Error scoring CV:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to score CV"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmittingForm(true)

    try {
      const response = await fetch("/api/cv-scorer/submit-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          finalScore: pendingResult?.final_score || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to submit contact information" }))
        throw new Error(error.error || "Failed to submit contact information")
      }

      toast({
        title: "Thank you!",
        description: "Your information has been submitted successfully.",
      })

      // Hide form and show results
      setShowContactForm(false)
      if (pendingResult) {
        setResult(pendingResult)
        setPendingResult(null)
        toast({
          title: "CV scored successfully",
          description: `Your CV scored ${pendingResult.final_score}/100`,
        })
      }
    } catch (error) {
      console.error("Error submitting contact form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit contact information",
        variant: "destructive",
      })
    } finally {
      setSubmittingForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-yellow-50/20">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 mb-6 border border-blue-200/50">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0476D7] via-[#0068A7] to-[#005A8F]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="relative p-6 sm:p-8 md:p-12 lg:p-16 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                    <FileSearch className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 font-heading tracking-tight">
                      CV Scorer
                    </h1>
                    <p className="text-white/95 text-base sm:text-lg md:text-xl leading-relaxed">
                      Get professional AI-powered feedback on your Moroccan/Europass-style CV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Main Form Card */}
            <Card className="lg:col-span-2 shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-heading">Upload your CV</CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1">
                      Upload a PDF file to get started with AI-powered analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-sm sm:text-base flex items-center gap-2 text-foreground">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      CV file (PDF)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cv-file"
                        disabled={loading}
                      />
                      <label
                        htmlFor="cv-file"
                        className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                          file
                            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md"
                            : "border-muted-foreground/30 hover:border-primary/60 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/2 hover:shadow-sm"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="p-6 sm:p-8 md:p-10 text-center">
                          {file ? (
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg border-2 border-primary/30">
                                <FileCheck className="h-9 w-9 sm:h-10 sm:w-10 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base sm:text-lg text-primary">{file.name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setFile(null)
                                  setResult(null)
                                  setError(null)
                                }}
                                className="mt-2 border-2 hover:bg-primary/5"
                              >
                                Change file
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                                <Upload className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base sm:text-lg mb-1">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  PDF files only (max 10MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Optional Fields Grid */}
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t">
                    {/* Target Role */}
                    <div className="space-y-2.5">
                      <label htmlFor="target-role" className="text-sm sm:text-base flex items-center gap-2 text-foreground">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Target role
                        <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                      </label>
                      <Input
                        id="target-role"
                        type="text"
                        placeholder="e.g., Junior Full-Stack Developer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        disabled={loading}
                        className="h-11 sm:h-12 border-2 focus:border-primary/50 rounded-xl transition-all"
                      />
                    </div>

                    {/* Feedback Language */}
                    <div className="space-y-2.5">
                      <label htmlFor="feedback-language" className="text-sm sm:text-base flex items-center gap-2 text-foreground">
                        <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Feedback language
                      </label>
                      <select
                        id="feedback-language"
                        className="flex h-11 sm:h-12 w-full rounded-xl border-2 border-input bg-transparent px-4 py-2.5 text-sm sm:text-base shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        value={feedbackLanguage}
                        onChange={(e) => setFeedbackLanguage(e.target.value as "FRENCH" | "ENGLISH" | "AUTO")}
                        disabled={loading}
                      >
                        <option value="AUTO">Auto-detect (based on CV)</option>
                        <option value="FRENCH">Français</option>
                        <option value="ENGLISH">English</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="space-y-2.5 pt-4">
                    <label htmlFor="job-description" className="text-sm sm:text-base text-foreground">
                      Job description
                      <span className="text-xs font-normal text-muted-foreground ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="job-description"
                      className="flex min-h-[120px] sm:min-h-[140px] w-full rounded-xl border-2 border-input bg-transparent px-4 py-3 text-sm sm:text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                      placeholder="Paste the job description here for better targeting and relevance scoring..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Providing a job description helps us score relevance and keyword matching more accurately.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!file || loading}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 animate-spin" />
                          Analyzing your CV...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                          Score my CV
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2.5 font-heading">
                    <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    How it works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm sm:text-base">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 shadow-md">
                      1
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-0.5">Upload your CV in PDF format</p>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 shadow-md">
                      2
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-0.5">AI analyzes 5 key dimensions</p>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 shadow-md">
                      3
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-0.5">Receive detailed feedback & scores</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-heading">Scoring dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">Structure</span>
                    <span className="text-primary">20 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">Content quality</span>
                    <span className="text-primary">35 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">Relevance</span>
                    <span className="text-primary">20 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">Professionalism</span>
                    <span className=" text-primary">15 pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">Technical / ATS</span>
                    <span className=" text-primary">10 pts</span>
                  </div>
                  <div className="pt-3 mt-3 border-t-2 border-primary/20 flex justify-between items-center font-black text-base sm:text-lg">
                    <span>Total</span>
                    <span className="text-primary">100 pts</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-2 border-destructive/50 bg-destructive/5 mb-8 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 border-2 border-destructive/20">
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="text-base sm:text-lg text-destructive mb-1.5">Error</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Final Score */}
              <Card className="bg-gradient-to-br from-[#0476D7]/10 via-[#0068A7]/5 to-[#005A8F]/10 border-2 border-primary/30 shadow-2xl mb-6">
                <CardContent className="pt-10 sm:pt-12 pb-10 sm:pb-12">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center mb-6 sm:mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0476D7] to-[#0068A7] rounded-full blur-2xl opacity-60 animate-pulse"></div>
                      <div className="relative inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#0476D7] via-[#0068A7] to-[#005A8F] shadow-2xl border-4 border-white/20">
                        <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
                          {result.final_score}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent font-heading">
                      Overall score
                    </h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg">out of 100</p>
                    <div className="max-w-md mx-auto">
                      <Progress value={result.final_score} className="h-3 sm:h-4 rounded-full" />
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-3">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dimension Scores */}
              
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Relevance & targeting</CardTitle>
                      <span className="text-lg sm:text-xl font-black text-primary flex-shrink-0">
                        {Math.min(result.scores.relevance_targeting.total, 20)}/20
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(Math.min(result.scores.relevance_targeting.total, 20) / 20) * 100}
                      className="h-3 rounded-full"
                    />
                  </CardContent>
                </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Structure & readability</CardTitle>
                      <span className="text-lg sm:text-xl font-black text-primary flex-shrink-0">
                        {Math.min(result.scores.structure_readability.total, 20)}/20
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(Math.min(result.scores.structure_readability.total, 20) / 20) * 100}
                      className="h-3 rounded-full"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Content quality</CardTitle>
                      <span className="text-lg sm:text-xl font-black text-primary flex-shrink-0">
                        {Math.min(result.scores.content_quality.total, 35)}/35
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(Math.min(result.scores.content_quality.total, 35) / 35) * 100}
                      className="h-3 rounded-full"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Professionalism & language</CardTitle>
                      <span className="text-lg sm:text-xl font-black text-primary flex-shrink-0">
                        {Math.min(result.scores.professionalism_language.total, 15)}/15
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(Math.min(result.scores.professionalism_language.total, 15) / 15) * 100}
                      className="h-3 rounded-full"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">Technical / ATS</CardTitle>
                      <span className="text-lg sm:text-xl font-black text-primary flex-shrink-0">
                        {Math.min(result.scores.technical_ats.total, 10)}/10
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(Math.min(result.scores.technical_ats.total, 10) / 10) * 100}
                      className="h-3 rounded-full"
                    />
                  </CardContent>
                </Card>
              </div>

             
              {/* Per-Dimension Feedback */}
              {result.feedback.dimensions && (
                <div className="space-y-4 sm:space-y-6 mt-6">
                  <h2 className="text-2xl sm:text-3xl mb-4 sm:mb-6 font-heading bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent">Feedback by dimension</h2>
                  
                     {/* Relevance & Targeting */}
                     {result.feedback.dimensions.relevance_targeting && (
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                      <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg sm:text-xl">Relevance & targeting</CardTitle>
                          <span className="text-base sm:text-lg font-black text-primary flex-shrink-0">
                            {Math.min(result.scores.relevance_targeting.total, 20)}/20
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
                        {result.feedback.dimensions.relevance_targeting.strengths && result.feedback.dimensions.relevance_targeting.strengths.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-green-700 dark:text-green-400 text-base sm:text-lg">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.relevance_targeting.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                  <span className="leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.feedback.dimensions.relevance_targeting.improvements && result.feedback.dimensions.relevance_targeting.improvements.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 text-base sm:text-lg">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              Areas for improvement
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.relevance_targeting.improvements.map((improvement, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}


                  {/* Structure & Readability */}
                  {result.feedback.dimensions.structure_readability && (
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                      <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg sm:text-xl">Structure & readability</CardTitle>
                          <span className="text-base sm:text-lg font-black text-primary flex-shrink-0">
                            {Math.min(result.scores.structure_readability.total, 20)}/20
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
                        {result.feedback.dimensions.structure_readability.strengths && result.feedback.dimensions.structure_readability.strengths.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-green-700 dark:text-green-400 text-base sm:text-lg">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.structure_readability.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                  <span className="leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.feedback.dimensions.structure_readability.improvements && result.feedback.dimensions.structure_readability.improvements.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 text-base sm:text-lg">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              Areas for improvement
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.structure_readability.improvements.map((improvement, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Content Quality */}
                  {result.feedback.dimensions.content_quality && (
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                      <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg sm:text-xl">Content quality</CardTitle>
                          <span className="text-base sm:text-lg font-black text-primary flex-shrink-0">
                            {Math.min(result.scores.content_quality.total, 35)}/35
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
                        {result.feedback.dimensions.content_quality.strengths && result.feedback.dimensions.content_quality.strengths.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-green-700 dark:text-green-400 text-base sm:text-lg">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.content_quality.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                  <span className="leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.feedback.dimensions.content_quality.improvements && result.feedback.dimensions.content_quality.improvements.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 text-base sm:text-lg">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              Areas for improvement
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.content_quality.improvements.map((improvement, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

               
                  {/* Professionalism & Language */}
                  {result.feedback.dimensions.professionalism_language && (
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                      <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg sm:text-xl">Professionalism & language</CardTitle>
                          <span className="text-base sm:text-lg font-black text-primary flex-shrink-0">
                            {Math.min(result.scores.professionalism_language.total, 15)}/15
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
                        {result.feedback.dimensions.professionalism_language.strengths && result.feedback.dimensions.professionalism_language.strengths.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-green-700 dark:text-green-400 text-base sm:text-lg">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.professionalism_language.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                  <span className="leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.feedback.dimensions.professionalism_language.improvements && result.feedback.dimensions.professionalism_language.improvements.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 text-base sm:text-lg">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              Areas for improvement
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.professionalism_language.improvements.map((improvement, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Technical / ATS */}
                  {result.feedback.dimensions.technical_ats && (
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2">
                      <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-lg sm:text-xl">Technical / ATS</CardTitle>
                          <span className="text-base sm:text-lg font-black text-primary flex-shrink-0">
                            {Math.min(result.scores.technical_ats.total, 10)}/10
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 sm:pt-8 space-y-5 sm:space-y-6">
                        {result.feedback.dimensions.technical_ats.strengths && result.feedback.dimensions.technical_ats.strengths.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-green-700 dark:text-green-400 text-base sm:text-lg">
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              Strengths
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.technical_ats.strengths.map((strength, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                  <span className="leading-relaxed">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.feedback.dimensions.technical_ats.improvements && result.feedback.dimensions.technical_ats.improvements.length > 0 && (
                          <div>
                            <h4 className="mb-3 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400 text-base sm:text-lg">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              Areas for improvement
                            </h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                              {result.feedback.dimensions.technical_ats.improvements.map((improvement, index) => (
                                <li key={index} className="flex gap-3 text-sm sm:text-base text-muted-foreground">
                                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                                  <span className="leading-relaxed">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
               {/* Feedback */}
               <Card className="shadow-lg border-2">
                <CardHeader className="border-b-2 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2.5 text-xl sm:text-2xl font-heading">
                    <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    General feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 sm:pt-8 space-y-6 sm:space-y-8">
                  {/* Summary */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 border border-border/50 shadow-sm">
                    <h3 className="text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2.5">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{result.feedback.summary}</p>
                  </div>

                  {/* Strengths */}
                  {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-50/50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900/30 shadow-sm">
                      <h3 className="text-base sm:text-lg mb-4 flex items-center gap-2.5 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        Strengths
                      </h3>
                      <ul className="space-y-2.5 sm:space-y-3">
                        {result.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex gap-3 text-sm sm:text-base">
                            <span className="text-green-600 dark:text-green-400 mt-1.5 text-lg">•</span>
                            <span className="text-muted-foreground flex-1 leading-relaxed">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.feedback.improvements && result.feedback.improvements.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-50/50 dark:bg-yellow-950/20 border-2 border-yellow-200 dark:border-yellow-900/30 shadow-sm">
                      <h3 className="text-base sm:text-lg mb-4 flex items-center gap-2.5 text-yellow-700 dark:text-yellow-400">
                        <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                        Areas for improvement
                      </h3>
                      <ul className="space-y-2.5 sm:space-y-3">
                        {result.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex gap-3 text-sm sm:text-base">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-1.5 text-lg">•</span>
                            <span className="text-muted-foreground flex-1 leading-relaxed">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Button for non-authenticated users */}
          {result && !userLoading && !user && (
            <Card className="mt-8 border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent">
                    Want to improve your CV score?
                  </h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    Get personalized coaching and learn how to create a winning CV that gets you interviews. Join Xperience Pro and transform your job search.
                  </p>
                  <Button
                    onClick={() => {
                      window.open("https://the-xperience.com/", "_blank")
                    }}
                    size="lg"
                    className="w-full sm:w-auto px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl bg-gradient-to-r from-[#0476D7] to-[#0068A7] hover:from-[#0068A7] hover:to-[#005A8F]"
                  >
                    Learn More About Xperience Pro
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
      <CVScorerChat />

      {/* Contact Form Modal for Non-Authenticated Users */}
      {showContactForm && pendingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-heading">Get Your CV Score</CardTitle>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <CardDescription className="mt-2">
                Please provide your contact information to view your CV score results
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleContactFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 border-2 focus:border-primary/50 rounded-xl"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 border-2 focus:border-primary/50 rounded-xl"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 border-2 focus:border-primary/50 rounded-xl"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submittingForm}
                    className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-r from-[#0476D7] to-[#0068A7] hover:from-[#0068A7] hover:to-[#005A8F]"
                    size="lg"
                  >
                    {submittingForm ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        View My CV Score
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popup after 1 minute */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-2xl rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden p-0 bg-gradient-to-br from-white via-primary/5 to-primary/10">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-[#0476D7] via-[#0068A7] to-[#005A8F] p-8 sm:p-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border-2 border-white/30">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-3xl sm:text-4xl font-bold text-center mb-3 leading-tight">
                Ignoré par les recruteurs ?
              </DialogTitle>
              <DialogDescription className="text-center text-lg sm:text-xl text-white/95 font-medium leading-relaxed">
                Mettez fin aux candidatures sans réponses
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Découvrez notre programme de formation complet conçu pour vous aider à créer un CV gagnant qui vous mène aux entretiens. Augmentez votre présence sur LinkedIn et transformez votre recherche d'emploi avec un accompagnement personnalisé et des stratégies éprouvées.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm sm:text-base">+6000 candidats accompagnés</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => {
                  window.open("https://the-xperience.com/", "_blank")
                  setShowPopup(false)
                }}
                size="lg"
                className="flex-1 px-8 py-7 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl bg-gradient-to-r from-[#0476D7] to-[#0068A7] hover:from-[#0068A7] hover:to-[#005A8F] text-white"
              >
                Découvrir le programme
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => setShowPopup(false)}
                variant="outline"
                size="lg"
                className="flex-1 px-8 py-7 text-base sm:text-lg font-medium border-2 rounded-xl hover:bg-muted/50 transition-all duration-300"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

