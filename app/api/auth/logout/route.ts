import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    // Create response based on backend status
    const nextResponse = response.ok 
      ? NextResponse.json({ success: true }, { status: 200 })
      : NextResponse.json({ error: 'Logout failed' }, { status: response.status })
    
    // Clear the SESSION cookie (matches backend)
    nextResponse.cookies.set('SESSION', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return nextResponse
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
