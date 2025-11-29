import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// POST: Create or update live session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Live Session API: Received POST request')
    console.log('📝 Module ID:', params.id)
    
    const body = await request.json()
    console.log('📤 Request body:', body)
    
    const cookieHeader = request.headers.get('cookie') || ''
    console.log('🍪 Cookie header length:', cookieHeader.length)
    
    // Extract classId from body and add as query parameter
    const classId = body.classId
    const url = classId 
      ? `${BACKEND_URL}/api/admin/modules/${params.id}/live-session?classId=${classId}`
      : `${BACKEND_URL}/api/admin/modules/${params.id}/live-session`
    
    const backendResponse = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(body),
      }
    )
    
    console.log('📥 Backend response status:', backendResponse.status)
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to save live session' },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error saving live session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Get live session details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract classId from query parameters
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    
    const url = classId
      ? `${BACKEND_URL}/api/admin/modules/${params.id}/live-session?classId=${classId}`
      : `${BACKEND_URL}/api/admin/modules/${params.id}/live-session`
    
    const backendResponse = await fetch(
      url,
      {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      }
    )
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch live session' },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching live session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
