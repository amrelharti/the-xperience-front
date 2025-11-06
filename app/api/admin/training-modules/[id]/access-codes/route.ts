import { NextRequest, NextResponse } from "next/server"

/**
 * Get access codes for a training module (optionally filtered by class)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""
    
    // Get optional classId query param
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const queryParam = classId ? `?classId=${classId}` : ''
    
    console.log("🔍 GET Access Codes - Training Module ID:", moduleId)
    console.log("🔍 Class ID:", classId || "all classes")

    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/codes${queryParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include"
    })
    
    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to fetch access codes:", error)
      return NextResponse.json(
        { error: "Failed to fetch access codes" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("🔍 GET response data:", JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching module access codes:", error)
    return NextResponse.json(
      { error: "Failed to fetch access codes" },
      { status: 500 }
    )
  }
}

/**
 * Generate a new access code for a training module and class
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""
    
    console.log("🔍 POST Generate Code - Training Module ID:", moduleId)
    console.log("🔍 Cookie present:", !!cookie)

    // Read the request body from the frontend (includes classId)
    const body = await request.json()
    console.log("🔍 Request body:", body)

    // Forward the body to the backend
    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(body)
    })
    
    console.log("🔍 Response status:", response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to generate access code:", error)
      return NextResponse.json(
        { error: "Failed to generate access code" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("🔍 Raw backend response from POST:", JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating module access code:", error)
    return NextResponse.json(
      { error: "Failed to generate access code" },
      { status: 500 }
    )
  }
}
