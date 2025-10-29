import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id

    const response = await fetch(`${backendUrl}/api/training-modules/${moduleId}/access`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || ""
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to check module access:", error)
      return NextResponse.json(
        { error: "Failed to check module access" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error checking module access:", error)
    return NextResponse.json(
      { error: "Failed to check module access" },
      { status: 500 }
    )
  }
}



