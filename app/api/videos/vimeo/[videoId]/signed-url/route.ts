import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId
    
    // Get cookies from the request
    const cookies = request.headers.get("cookie")
    
    // Forward the request to the backend
    const backendUrl = `http://localhost:8080/api/videos/vimeo/${videoId}/signed-url`
    
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
    console.error("Error fetching signed Vimeo URL:", error)
    return NextResponse.json(
      { error: "Failed to fetch signed URL" },
      { status: 500 }
    )
  }
}

