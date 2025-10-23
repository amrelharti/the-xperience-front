import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

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
