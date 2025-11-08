import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie")
    const searchParams = request.nextUrl.searchParams
    const classId = searchParams.get("classId")
    const trainingId = searchParams.get("trainingId")
    const moduleId = searchParams.get("moduleId")
    
    let backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/admin/analytics/progress-overview`
    const params = new URLSearchParams()
    if (classId) params.append("classId", classId)
    if (trainingId) params.append("trainingId", trainingId)
    if (moduleId) params.append("moduleId", moduleId)
    
    if (params.toString()) {
      backendUrl += `?${params.toString()}`
    }
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Cookie": cookies || "",
        "Content-Type": "application/json",
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error fetching progress overview:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress overview" },
      { status: 500 }
    )
  }
}

