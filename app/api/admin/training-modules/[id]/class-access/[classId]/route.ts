import { NextRequest, NextResponse } from "next/server"

/**
 * Update class access for a training module (lock/unlock)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; classId: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const classId = params.classId
    const cookie = request.headers.get("cookie") || ""
    
    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/class-access/${classId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to update class access:", error)
      return NextResponse.json(
        { error: "Failed to update class access" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating class access:", error)
    return NextResponse.json(
      { error: "Failed to update class access" },
      { status: 500 }
    )
  }
}

