import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
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
    console.log("🔍 GET response data:", JSON.stringify(data, null, 2))
    
    // Backend returns array of code objects: [{ id, code: "••••••••", isUsed, ... }]
    // Codes are masked for security, so we can't show the actual code from GET
    if (Array.isArray(data) && data.length > 0) {
      // Find the most recent unused code
      const unusedCodes = data.filter((c: any) => !c.isUsed)
      const hasActiveCode = unusedCodes.length > 0
      
      return NextResponse.json({
        hasCode: hasActiveCode,
        code: null, // Code is masked by backend for security
        codesCount: data.length,
        unusedCount: unusedCodes.length,
        codes: data
      })
    }
    
    return NextResponse.json({
      hasCode: false,
      code: null,
      codesCount: 0,
      unusedCount: 0
    })
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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const moduleId = params.id
    const cookie = request.headers.get("cookie") || ""
    
    console.log("🔍 POST Generate Code - Training Module ID:", moduleId)
    console.log("🔍 Cookie present:", !!cookie)

    // Read the request body from the frontend
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
    
    // Backend returns { codes: ["CODE1", "CODE2"] }
    // Extract the first code from the array
    let code = null
    if (data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
      code = data.codes[0]
    } else if (data.code) {
      code = data.code
    } else if (typeof data === 'string') {
      code = data
    }
    
    const responseData = { code }
    console.log("🔍 Transformed response:", JSON.stringify(responseData, null, 2))
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error generating module access code:", error)
    return NextResponse.json(
      { error: "Failed to generate access code" },
      { status: 500 }
    )
  }
}

