import { NextRequest, NextResponse } from "next/server"

/**
 * Get all classes for a specific training (module)
 * Note: In the backend, 'module' refers to what the frontend calls 'training/course'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id // This is the training/course ID
    const cookie = request.headers.get("cookie") || ""

    console.log("🔍 Fetching classes for module:", moduleId)

    // The backend endpoint is /api/classes/module/{moduleId}
    const response = await fetch(`${backendUrl}/api/classes/module/${moduleId}`, {
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
      console.error("❌ Failed to fetch classes:", error)
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Classes loaded:", data.length, "classes")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

