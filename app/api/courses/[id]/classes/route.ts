import { NextRequest, NextResponse } from "next/server"

/**
 * Get all classes for a specific training (course)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const trainingId = params.id
    const cookie = request.headers.get("cookie") || ""

    const response = await fetch(`${backendUrl}/api/courses/${trainingId}/classes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include"
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to fetch classes:", error)
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

