import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const body = await request.json()
    const { classId, watchTimeSeconds, status } = body

    console.log(`📊 Updating progress for course ${courseId}:`, { classId, watchTimeSeconds, status })

    // Forward to Spring Boot backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/progress`
    
    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
      body: JSON.stringify({
        courseId: courseId,
        classId: classId,
        watchTimeSeconds: watchTimeSeconds,
        status: status,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error updating progress:", errorText)
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Progress updated successfully:", data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error updating course progress:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      )
    }

    console.log(`📊 Getting progress for course ${courseId} in class ${classId}`)

    // Forward to Spring Boot backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/progress/course/${courseId}?classId=${classId}`
    
    const response = await fetch(backendUrl, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error getting progress:", errorText)
      return NextResponse.json(
        { error: "Failed to get progress" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error getting course progress:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

