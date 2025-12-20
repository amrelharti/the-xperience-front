import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/roulette/winners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch winners' }))
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching roulette winners:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch winners' },
      { status: 500 }
    )
  }
}

