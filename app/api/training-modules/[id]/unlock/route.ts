import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    const moduleId = params.id
    const body = await request.json()

    const response = await fetch(`${backendUrl}/api/training-modules/${moduleId}/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || ""
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to unlock module" }))
      console.error("❌ Failed to unlock module:", error)
      return NextResponse.json(
        error,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error unlocking module:", error)
    return NextResponse.json(
      { error: "Failed to unlock module" },
      { status: 500 }
    )
  }
}



