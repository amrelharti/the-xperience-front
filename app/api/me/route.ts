import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    
    // Extract JWT token from SESSION cookie
    let jwtToken = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');

      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');

        if (name === 'SESSION' && value) {
          jwtToken = value;

          break;
        }
      }
    }
    
    const headers: Record<string, string> = {};
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;

    } else {
      headers['Cookie'] = cookieHeader;

    }
    

    
    const response = await fetch(`${BACKEND_URL}/api/me`, {
      method: 'GET',
      headers,
    })
    

    
    if (!response.ok) {
      const errorText = await response.text()

      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
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
    
    // Extract JWT token from SESSION cookie
    let jwtToken = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'SESSION' && value) {
          jwtToken = value;
          break;
        }
      }
    }

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
    })
    
    console.log('[API Route] PUT /api/me - Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('[API Route] PUT /api/me - Backend error:', errorText)
      return NextResponse.json(
        { error: errorText || 'Failed to update profile' },
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
