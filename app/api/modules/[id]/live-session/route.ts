import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// GET: Get live session details for a specific module (student access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Student Live Session API: Received GET request')
    console.log('📝 Module ID:', params.id)
    
    const cookieHeader = request.headers.get('cookie') || ''
    console.log('🍪 Cookie header length:', cookieHeader.length)
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/modules/${params.id}/sessions`,
      {
        headers: {
          'Cookie': cookieHeader,
        },
      }
    )
    
    console.log('📥 Backend response status:', backendResponse.status)
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      console.log('❌ Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch live session' },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('✅ Backend response data:', data)
    
    // Backend returns {sessions: [...]}, we need the first session
    if (data.sessions && data.sessions.length > 0) {
      const sessionData = data.sessions[0] // Get the first (and likely only) session
      console.log('✅ Live session data:', sessionData)
      return NextResponse.json(sessionData, { status: 200 })
    } else {
      console.log('ℹ️ No live sessions found for this module')
      return NextResponse.json(
        { error: 'No live session found for this module' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('💥 Exception in student live session API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}