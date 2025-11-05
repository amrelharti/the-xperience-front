import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const body = await request.json()
    
    console.log("🔓 Unlock module request:")
    console.log("  - Module ID:", moduleId)
    console.log("  - Access code:", body.code)
    console.log("  - Class ID:", body.classId)

    const response = await fetch(`${backendUrl}/api/training-modules/${moduleId}/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || ""
      },
      body: JSON.stringify(body)
    })
    
    console.log("🔓 Unlock response status:", response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to unlock module" }))
      console.error("❌ Failed to unlock module:")
      console.error("  - Status:", response.status)
      console.error("  - Error:", JSON.stringify(error, null, 2))
      return NextResponse.json(
        error,
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Module unlocked successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error unlocking module:", error)
    return NextResponse.json(
      { error: "Failed to unlock module" },
      { status: 500 }
    )
  }
}



