"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2, CheckCircle2, XCircle, TrendingUp, FileCheck, Languages, Briefcase, FileSearch } from "lucide-react"
import Navbar from "@/app/components/Navbar"

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
  }
}

export default function CvScorerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [feedbackLanguage, setFeedbackLanguage] = useState<"FRENCH" | "ENGLISH" | "AUTO">("AUTO")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CvScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setResult(data)
      
      toast({
        title: "CV scored successfully",
        description: `Your CV scored ${data.final_score}/100`,
      })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-blue-500/10 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0476D7] via-[#0068A7] to-[#005A8F]" />
              <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] opacity-50" />
              <div className="relative p-8 md:p-12 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileSearch className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                      CV scorer
                    </h1>
                    <p className="text-white/90 text-lg">
                      Get professional feedback on your Moroccan/Europass-style CV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main Form Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Upload your CV</CardTitle>
                    <CardDescription>
                      Upload a PDF file to get started
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
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
                        className={`block cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
                          file
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="p-8 text-center">
                          {file ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileCheck className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-primary">{file.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
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
                                className="mt-2"
                              >
                                Change file
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium mb-1">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-muted-foreground">
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
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    {/* Target Role */}
                    <div className="space-y-2">
                      <label htmlFor="target-role" className="text-sm font-semibold flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
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
                        className="h-11"
                      />
                    </div>

                    {/* Feedback Language */}
                    <div className="space-y-2">
                      <label htmlFor="feedback-language" className="text-sm font-semibold flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Feedback language
                      </label>
                      <select
                        id="feedback-language"
                        className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <div className="space-y-2 pt-2">
                    <label htmlFor="job-description" className="text-sm font-semibold">
                      Job description
                      <span className="text-xs font-normal text-muted-foreground ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="job-description"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Paste the job description here for better targeting and relevance scoring..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Providing a job description helps us score relevance and keyword matching more accurately.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={!file || loading}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing your CV...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Score my CV
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Sidebar */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSearch className="h-5 w-5" />
                    How it works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <p>Upload your CV in PDF format</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <p>AI analyzes 5 key dimensions</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <p>Receive detailed feedback & scores</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scoring dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Structure</span>
                    <span className="font-semibold">20 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Content quality</span>
                    <span className="font-semibold">35 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Relevance</span>
                    <span className="font-semibold">20 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Professionalism</span>
                    <span className="font-semibold">15 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Technical / ATS</span>
                    <span className="font-semibold">10 pts</span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-primary">100 pts</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-1">Error</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Final Score */}
              <Card className="bg-gradient-to-br from-[#0476D7]/10 via-[#0068A7]/5 to-[#005A8F]/10 border-primary/20 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0476D7] to-[#0068A7] rounded-full blur-xl opacity-50"></div>
                      <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-[#0476D7] to-[#0068A7] shadow-lg">
                        <span className="text-5xl font-bold text-white">
                          {result.final_score}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent">
                      Overall score
                    </h2>
                    <p className="text-muted-foreground mb-6">out of 100</p>
                    <div className="max-w-md mx-auto">
                      <Progress value={result.final_score} className="h-4" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dimension Scores */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Structure & readability</CardTitle>
                      <span className="text-lg font-bold text-primary">
                        {result.scores.structure_readability.total}/20
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.structure_readability.total / 20) * 100}
                      className="h-2.5"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Content quality</CardTitle>
                      <span className="text-lg font-bold text-primary">
                        {result.scores.content_quality.total}/35
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.content_quality.total / 35) * 100}
                      className="h-2.5"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Relevance & targeting</CardTitle>
                      <span className="text-lg font-bold text-primary">
                        {result.scores.relevance_targeting.total}/20
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.relevance_targeting.total / 20) * 100}
                      className="h-2.5"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Professionalism & language</CardTitle>
                      <span className="text-lg font-bold text-primary">
                        {result.scores.professionalism_language.total}/15
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.professionalism_language.total / 15) * 100}
                      className="h-2.5"
                    />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Technical / ATS</CardTitle>
                      <span className="text-lg font-bold text-primary">
                        {result.scores.technical_ats.total}/10
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.technical_ats.total / 10) * 100}
                      className="h-2.5"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Feedback */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5" />
                    Detailed feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{result.feedback.summary}</p>
                  </div>

                  {/* Strengths */}
                  {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {result.feedback.strengths.map((strength, index) => (
                          <li key={index} className="flex gap-2 text-sm">
                            <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                            <span className="text-muted-foreground flex-1">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.feedback.improvements && result.feedback.improvements.length > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        <XCircle className="h-5 w-5" />
                        Areas for improvement
                      </h3>
                      <ul className="space-y-2">
                        {result.feedback.improvements.map((improvement, index) => (
                          <li key={index} className="flex gap-2 text-sm">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                            <span className="text-muted-foreground flex-1">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
      </div>
    </div>
  )
}

