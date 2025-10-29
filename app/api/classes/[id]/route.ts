import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      'Content-Type': 'application/json'
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/classes/${params.id}`, {
      method: 'GET',
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch class' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      'Content-Type': 'application/json'
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/classes/${params.id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to update class' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      'Content-Type': 'application/json'
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/classes/${params.id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete class' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}