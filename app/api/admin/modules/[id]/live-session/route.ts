import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

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
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/modules/${params.id}/live-session`,
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
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/modules/${params.id}/live-session`,
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
