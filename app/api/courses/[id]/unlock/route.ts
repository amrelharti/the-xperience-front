import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const body = await request.json();
    
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      headers['Cookie'] = cookieHeader;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/courses/${params.id}/unlock`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error unlocking course:', error)
    return NextResponse.json({ error: 'Failed to unlock course' }, { status: 500 })
  }
}
