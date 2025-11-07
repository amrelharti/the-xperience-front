import { NextRequest, NextResponse } from "next/server"

/**
 * Get class access settings for a training module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""

    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/class-access`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include"
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to fetch class access:", error)
      return NextResponse.json(
        { error: "Failed to fetch class access" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching class access:", error)
    return NextResponse.json(
      { error: "Failed to fetch class access" },
      { status: 500 }
    )
  }
}

