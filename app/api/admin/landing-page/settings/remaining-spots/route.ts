import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

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
    
    const response = await fetch(`${BACKEND_URL}/api/admin/landing-page/settings/remaining-spots`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch remaining spots' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching remaining spots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
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
    
    const response = await fetch(`${BACKEND_URL}/api/admin/landing-page/settings/remaining-spots`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update remaining spots' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating remaining spots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

