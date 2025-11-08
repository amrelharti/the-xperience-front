import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie")
    const searchParams = request.nextUrl.searchParams
    const studentIds = searchParams.getAll("studentIds")
    
    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: "At least one studentId is required" },
        { status: 400 }
      )
    }
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/admin/student-video-activity/compare?${studentIds.map(id => `studentIds=${id}`).join('&')}`
    
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
    console.error("Error comparing students:", error)
    return NextResponse.json(
      { error: "Failed to compare students" },
      { status: 500 }
    )
  }
}

