import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Extract JWT token from SESSION cookie
    let jwtToken = null
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'SESSION' && value) {
          jwtToken = value
          break
        }
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }
    
    // Get the request body
    const body = await request.json()
    console.log('🔍 API Route: Received post data:', body)
    
    // IMPORTANT: Send classId both in body AND as query parameter for maximum compatibility
    let backendUrl = `${BACKEND_URL}/api/feed/posts`
    if (body.classId) {
      backendUrl += `?classId=${body.classId}`
      console.log('🔧 Added classId as query parameter:', backendUrl)
    }
    
    // Also log the full body being sent
    console.log('📤 Sending to backend with body:', JSON.stringify(body))
    
    // Forward the request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('✅ Backend response:', data)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('❌ Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

