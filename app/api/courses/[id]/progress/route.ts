import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params
    const body = await request.json()
    const { classId, watchTimeSeconds, completionPercentage } = body

    console.log(`📊 [API Route] Received progress update:`, {
      courseId,
      classId,
      watchTimeSeconds,
      completionPercentage,
      timestamp: new Date().toISOString()
    })

    if (!classId) {
      console.error("❌ [API Route] Missing classId")
      return NextResponse.json(
        { error: "classId is required" },
        { status: 400 }
      )
    }

    // Forward to Spring Boot backend
    // Backend expects: PUT /api/courses/{courseId}/progress?classId={classId}
    // Body: { watchTimeSeconds, completionPercentage }
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/progress?classId=${classId}`
    
    console.log(`🔄 [API Route] Forwarding to backend:`, backendUrl)
    
    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
      body: JSON.stringify({
        watchTimeSeconds: watchTimeSeconds || 0,
        completionPercentage: completionPercentage || 0.0,
      }),
    })

    console.log(`📥 [API Route] Backend response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [API Route] Backend error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return NextResponse.json(
        { error: "Failed to update progress", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ [API Route] Progress updated successfully:", data)
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("❌ [API Route] Exception:", {
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: courseId } = params
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

