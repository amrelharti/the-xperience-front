import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""
    
    console.log("🔍 GET Access Codes - Training Module ID:", moduleId)
    console.log("🔍 Cookie present:", !!cookie)
    console.log("🔍 Backend URL:", `${backendUrl}/api/admin/training-modules/${moduleId}/codes`)

    const response = await fetch(`${backendUrl}/api/admin/training-modules/${moduleId}/codes`, {
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
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching module access codes:", error)
    return NextResponse.json(
      { error: "Failed to fetch access codes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
    const moduleId = params.id
    const body = await request.json()
    const cookie = request.headers.get("cookie") || ""
    
    console.log("🔍 POST Generate Codes - Training Module ID:", moduleId)
    console.log("🔍 Cookie present:", !!cookie)
    console.log("🔍 Request body:", body)

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
      console.error("❌ Failed to generate access codes:", error)
      return NextResponse.json(
        { error: "Failed to generate access codes" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating module access codes:", error)
    return NextResponse.json(
      { error: "Failed to generate access codes" },
      { status: 500 }
    )
  }
}

