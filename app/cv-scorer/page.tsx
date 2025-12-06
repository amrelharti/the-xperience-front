"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2, CheckCircle2, XCircle, TrendingUp } from "lucide-react"
import RequireAuth from "@/app/components/RequireAuth"
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
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CvScoreResponse | null>(null)
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

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (targetRole.trim()) {
        formData.append("targetRole", targetRole.trim())
      }
      if (jobDescription.trim()) {
        formData.append("jobDescription", jobDescription.trim())
      }

      const response = await fetch("/api/cv-scorer", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to score CV")
      }

      const data = await response.json()
      setResult(data)
      
      toast({
        title: "CV scored successfully",
        description: `Your CV scored ${data.final_score}/100`,
      })
    } catch (error) {
      console.error("Error scoring CV:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to score CV",
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
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#0476D7] to-[#0068A7] bg-clip-text text-transparent">
              CV Scorer
            </h1>
            <p className="text-muted-foreground text-lg">
              Get professional feedback on your Moroccan/Europass-style CV
            </p>
          </div>

          {/* Upload Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Your CV</CardTitle>
              <CardDescription>
                Upload a PDF of your CV to receive detailed scoring and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">CV File (PDF)</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50">
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
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {file ? (
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="h-8 w-8" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PDF only
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Target Role */}
                <div className="space-y-2">
                  <label htmlFor="target-role" className="text-sm font-medium">
                    Target Role (Optional)
                  </label>
                  <Input
                    id="target-role"
                    type="text"
                    placeholder="e.g., Junior Full-Stack Developer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <label htmlFor="job-description" className="text-sm font-medium">
                    Job Description (Optional)
                  </label>
                  <textarea
                    id="job-description"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Paste the job description here for better targeting..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scoring your CV...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Score My CV
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Final Score */}
              <Card className="bg-gradient-to-br from-[#0476D7]/10 to-[#0068A7]/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#0476D7] to-[#0068A7] mb-4">
                      <span className="text-4xl font-bold text-white">
                        {result.final_score}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
                    <p className="text-muted-foreground">out of 100</p>
                    <Progress value={result.final_score} className="mt-4 h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Dimension Scores */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Structure & Readability</CardTitle>
                    <CardDescription>
                      {result.scores.structure_readability.total}/20
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.structure_readability.total / 20) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Quality</CardTitle>
                    <CardDescription>
                      {result.scores.content_quality.total}/35
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.content_quality.total / 35) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relevance & Targeting</CardTitle>
                    <CardDescription>
                      {result.scores.relevance_targeting.total}/20
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.relevance_targeting.total / 20) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Professionalism & Language</CardTitle>
                    <CardDescription>
                      {result.scores.professionalism_language.total}/15
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.professionalism_language.total / 15) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technical / ATS</CardTitle>
                    <CardDescription>
                      {result.scores.technical_ats.total}/10
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(result.scores.technical_ats.total / 10) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground">{result.feedback.summary}</p>
                  </div>

                  {/* Strengths */}
                  {result.feedback.strengths && result.feedback.strengths.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Strengths
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {result.feedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.feedback.improvements && result.feedback.improvements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-yellow-600" />
                        Areas for Improvement
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {result.feedback.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
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
    </RequireAuth>
  )
}

