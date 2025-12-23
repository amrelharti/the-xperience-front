import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie")
    
    // Extract JWT token from SESSION cookie
    let jwtToken = null
    if (cookies) {
      const cookieArray = cookies.split(';')
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'SESSION' && value) {
          jwtToken = value
          break
        }
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookies || ''
    }
    
    const backendUrl = `${BACKEND_URL}/api/admin/landing-page/views`
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      credentials: 'include',
    })
    
    if (!response.ok) {
      // If backend endpoint doesn't exist, return a default response
      if (response.status === 404) {
        console.warn('⚠️ Backend endpoint not found, returning default count')
        return NextResponse.json({ 
          totalViews: 0,
          message: 'Backend endpoint needs to be implemented. View tracking is active but count is not yet available from backend.'
        }, { status: 200 })
      }
      
      const error = await response.json().catch(() => ({ error: 'Failed to fetch view count' }))
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching landing page views:", error)
    // Return default on error so admin page doesn't break
    return NextResponse.json(
      { 
        totalViews: 0,
        error: 'Failed to fetch view count from backend',
        message: 'View tracking is active but backend endpoint may need implementation.'
      },
      { status: 200 }
    )
  }
}

