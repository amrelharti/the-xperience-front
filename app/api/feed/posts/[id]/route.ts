import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    // Extract JWT token from SESSION cookie
    // Handle cookies that may contain '=' in the value (JWT tokens)
    let jwtToken = null
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      for (const cookie of cookies) {
        const trimmed = cookie.trim()
        const equalIndex = trimmed.indexOf('=')
        if (equalIndex > 0) {
          const name = trimmed.substring(0, equalIndex)
          const value = trimmed.substring(equalIndex + 1)
          if (name === 'SESSION' && value) {
            // Decode the cookie value in case it's URL-encoded
            try {
              jwtToken = decodeURIComponent(value)
            } catch {
              // If decoding fails, use the original value
              jwtToken = value
            }
            break
          }
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Forward both Authorization header and Cookie header for maximum compatibility
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    }
    // Always forward the cookie header as well
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/feed/posts/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData = {}
      try {
        errorData = errorText ? JSON.parse(errorText) : {}
      } catch {
        errorData = { error: errorText || 'Failed to update post' }
      }
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to update post' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Extract JWT token from SESSION cookie
    // Handle cookies that may contain '=' in the value (JWT tokens)
    let jwtToken = null
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      for (const cookie of cookies) {
        const trimmed = cookie.trim()
        const equalIndex = trimmed.indexOf('=')
        if (equalIndex > 0) {
          const name = trimmed.substring(0, equalIndex)
          const value = trimmed.substring(equalIndex + 1)
          if (name === 'SESSION' && value) {
            // Decode the cookie value in case it's URL-encoded
            try {
              jwtToken = decodeURIComponent(value)
            } catch {
              // If decoding fails, use the original value
              jwtToken = value
            }
            break
          }
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Forward both Authorization header and Cookie header for maximum compatibility
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    }
    // Always forward the cookie header as well
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    console.log(`🗑️ Deleting post ${id}, has token: ${!!jwtToken}, has cookie: ${!!cookieHeader}`)

    const response = await fetch(`${BACKEND_URL}/api/feed/posts/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData = {}
      try {
        errorData = errorText ? JSON.parse(errorText) : {}
      } catch {
        errorData = { error: errorText || 'Failed to delete post' }
      }
      
      console.error(`❌ Failed to delete post ${id}:`, response.status, errorData)
      
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to delete post' },
        { status: response.status }
      )
    }

    console.log(`✅ Successfully deleted post ${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

