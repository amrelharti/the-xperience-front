"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RequireAuth from "@/app/components/RequireAuth"

export default function LeaderboardDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [recalculating, setRecalculating] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/debug/leaderboard/diagnose`,
        { credentials: "include" }
      )
      if (res.ok) {
        const data = await res.json()
        setDiagnostics(data)
      } else {
        console.error("Failed to run diagnostics:", res.status)
      }
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fixAssignmentFlags = async () => {
    setFixing(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/debug/leaderboard/fix-assignment-flags`,
        { 
          method: "POST",
          credentials: "include" 
        }
      )
      if (res.ok) {
        const data = await res.json()
        alert(`Fixed ${data.fixedCount} posts!`)
        runDiagnostics() // Refresh diagnostics
      } else {
        alert("Failed to fix assignment flags")
      }
    } catch (error) {
      console.error("Error fixing flags:", error)
      alert("Error fixing assignment flags")
    } finally {
      setFixing(false)
    }
  }

  const recalculateScores = async () => {
    setRecalculating(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/debug/leaderboard/recalculate-scores`,
        { 
          method: "POST",
          credentials: "include" 
        }
      )
      if (res.ok) {
        const data = await res.json()
        alert(`Recalculated ${data.updatedCount} assignments!`)
        runDiagnostics() // Refresh diagnostics
      } else {
        alert("Failed to recalculate scores")
      }
    } catch (error) {
      console.error("Error recalculating scores:", error)
      alert("Error recalculating scores")
    } finally {
      setRecalculating(false)
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={runDiagnostics} disabled={loading}>
                  {loading ? "Running..." : "Run Diagnostics"}
                </Button>
                <Button onClick={fixAssignmentFlags} disabled={fixing} variant="outline">
                  {fixing ? "Fixing..." : "Fix Assignment Flags"}
                </Button>
                <Button onClick={recalculateScores} disabled={recalculating} variant="outline">
                  {recalculating ? "Recalculating..." : "Recalculate Scores"}
                </Button>
              </div>

              {diagnostics && (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Total Posts</div>
                          <div className="text-2xl font-bold">{diagnostics.totalPosts}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Assignments (by type)</div>
                          <div className="text-2xl font-bold">{diagnostics.assignmentsByPostType}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Assignments (by flag)</div>
                          <div className="text-2xl font-bold">{diagnostics.assignmentsByIsAssignmentFlag}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Rated Assignments</div>
                          <div className="text-2xl font-bold text-green-600">
                            {diagnostics.ratedAssignmentsCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mismatches</div>
                          <div className="text-2xl font-bold text-red-600">
                            {diagnostics.mismatchCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Without Class</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {diagnostics.assignmentsWithoutClass}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Classes</div>
                          <div className="text-2xl font-bold">{diagnostics.totalClasses}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Enrollments</div>
                          <div className="text-2xl font-bold">{diagnostics.totalEnrollments}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mismatches */}
                  {diagnostics.postTypeFlagMismatches.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-red-600">
                          Post Type / Flag Mismatches ({diagnostics.postTypeFlagMismatches.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {diagnostics.postTypeFlagMismatches.map((mismatch: any) => (
                            <div key={mismatch.id} className="p-3 bg-red-50 border border-red-200 rounded">
                              <div className="font-medium">{mismatch.title || "Untitled"}</div>
                              <div className="text-sm text-gray-600">
                                Author: {mismatch.author} | Type: {mismatch.postType} | Flag: {String(mismatch.isAssignment)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Class: {mismatch.className || "None"} | ID: {mismatch.id}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Unrated Assignments */}
                  {diagnostics.unratedAssignments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Unrated Assignments ({diagnostics.unratedAssignments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {diagnostics.unratedAssignments.map((assignment: any) => (
                            <div key={assignment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="font-medium">{assignment.title || "Untitled"}</div>
                              <div className="text-sm text-gray-600">
                                Author: {assignment.author} | Avg Score: {assignment.avgScore || "null"} | 
                                Score Count: {assignment.scoreCount || 0} | Actual Ratings: {assignment.actualRatingsCount}
                              </div>
                              <div className="text-sm text-gray-500">
                                Class: {assignment.className || "None"} | ID: {assignment.id}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Class Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Class Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {diagnostics.classStats.map((classItem: any) => (
                          <div key={classItem.id} className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <div className="font-medium">{classItem.name}</div>
                            <div className="text-sm text-gray-600">
                              Students: {classItem.enrollmentCount} | Posts: {classItem.totalPosts} | 
                              Assignments: {classItem.assignmentCount} | Rated: {classItem.ratedAssignmentCount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Stats */}
                  {diagnostics.studentsWithAssignments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Students with Assignments ({diagnostics.studentsWithAssignments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {diagnostics.studentsWithAssignments.map((student: any, idx: number) => (
                            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-600">
                                Total: {student.totalAssignments} | Rated: {student.ratedAssignments} | 
                                Points: {student.totalPoints.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Raw Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Raw Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(diagnostics, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}

