import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie")
    const searchParams = request.nextUrl.searchParams
    const days = searchParams.get("days") || "30"
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/admin/analytics/trends?days=${days}`
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Cookie": cookies || "",
        "Content-Type": "application/json",
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error fetching trend analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch trend analytics" },
      { status: 500 }
    )
  }
}

