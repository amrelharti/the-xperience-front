import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
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
    
    // First, get the live session for this module
    const sessionsResponse = await fetch(`${BACKEND_URL}/api/modules/${params.id}/sessions`, {
      method: 'GET',
      headers: jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : { 'Cookie': cookieHeader },
    })
    
    if (!sessionsResponse.ok) {
      return NextResponse.json({ error: 'Failed to find live session' }, { status: 404 })
    }
    
    const sessionsData = await sessionsResponse.json()
    const sessions = sessionsData.sessions || []
    
    if (sessions.length === 0) {
      return NextResponse.json({ error: 'No live session found for this module' }, { status: 404 })
    }
    
    const sessionId = sessions[0].id
    
    // Mark attendance
    const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/attend`, {
      method: 'POST',
      headers,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error marking live session attendance:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const headers: Record<string, string> = {}
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }
    
    // Get the live session for this module
    const sessionsResponse = await fetch(`${BACKEND_URL}/api/modules/${params.id}/sessions`, {
      method: 'GET',
      headers,
    })
    
    if (!sessionsResponse.ok) {
      return NextResponse.json({ attended: false }, { status: 200 })
    }
    
    const sessionsData = await sessionsResponse.json()
    const sessions = sessionsData.sessions || []
    
    if (sessions.length === 0) {
      return NextResponse.json({ attended: false }, { status: 200 })
    }
    
    const sessionId = sessions[0].id
    
    // Check attendance
    const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/my-attendance`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      return NextResponse.json({ attended: false }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error checking live session attendance:', error)
    return NextResponse.json({ attended: false }, { status: 200 })
  }
}



