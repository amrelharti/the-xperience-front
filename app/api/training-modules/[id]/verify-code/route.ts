import { NextRequest, NextResponse } from "next/server"

/**
 * Verify access code for a training module
 * This is the new class-specific multi-use code system
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""
    
    const body = await request.json()
    console.log("🔍 Verify Code - Training Module ID:", moduleId)
    console.log("🔍 Request body:", body)

    // Call the new verification endpoint
    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/codes/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(body)
    })
    
    console.log("🔍 Verify response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Verification failed:", error)
      return NextResponse.json(
        error,
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Module unlocked:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json(
      { error: "Failed to verify access code" },
      { status: 500 }
    )
  }
}

