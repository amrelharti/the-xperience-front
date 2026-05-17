import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

function getSessionToken(cookieHeader: string): string | null {
  let token: string | null = null
  for (const cookie of cookieHeader.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name === 'SESSION' && valueParts.length > 0) {
      token = decodeURIComponent(valueParts.join('='))
    }
  }
  return token
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const jwtToken = getSessionToken(cookieHeader);
    
    const headers: Record<string, string> = {};
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;

    } else {
      headers['Cookie'] = cookieHeader;

    }
    

    
    const response = await fetch(`${BACKEND_URL}/api/me`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()

      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[API Route] PUT /api/me - Request body:', body)
    
    const cookieHeader = request.headers.get('cookie') || '';
    const jwtToken = getSessionToken(cookieHeader);

    if (!jwtToken) {
      console.log('[API Route] PUT /api/me - No JWT token found')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log('[API Route] PUT /api/me - JWT token found, forwarding to backend')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    };
    
    const response = await fetch(`${BACKEND_URL}/api/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    
    console.log('[API Route] PUT /api/me - Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('[API Route] PUT /api/me - Backend error:', errorText)
      let errorMessage = errorText || 'Failed to update profile'
      try {
        const parsed = JSON.parse(errorText)
        if (parsed.error) errorMessage = parsed.error
      } catch {
        // use raw text
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('[API Route] PUT /api/me - Success, returning data')
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route] PUT /api/me - Error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
