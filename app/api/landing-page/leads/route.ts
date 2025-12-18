import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Frontend API: Received lead submission:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/landing-page/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    console.log('📤 Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      return NextResponse.json({ error: errorText || 'Failed to create lead' }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('✅ Lead created successfully:', data)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Error creating landing page lead:', error)
    return NextResponse.json({ error: 'Failed to create lead: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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
      'Content-Type': 'application/json',
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(`${BACKEND_URL}/api/landing-page/leads`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch landing page leads' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching landing page leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

