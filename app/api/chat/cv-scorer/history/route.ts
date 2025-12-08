import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies - try Next.js cookies() API first
    const cookieStore = cookies()
    let jwtToken = cookieStore.get('SESSION')?.value || null
    
    // Fallback: try parsing cookie header manually
    if (!jwtToken) {
      const cookieHeader = request.headers.get('cookie') || ''
      if (cookieHeader) {
        const cookies = cookieHeader.split(';')
        for (const cookie of cookies) {
          const trimmed = cookie.trim()
          const equalIndex = trimmed.indexOf('=')
          if (equalIndex > 0) {
            const name = trimmed.substring(0, equalIndex).trim()
            const value = trimmed.substring(equalIndex + 1).trim()
            
            if (name === 'SESSION' && value) {
              // Handle URL-encoded values
              jwtToken = decodeURIComponent(value)
              break
            }
          }
        }
      }
    }

    // Build headers - use Bearer token if available, otherwise fallback to Cookie header
    const headers: Record<string, string> = {}
    const cookieHeader = request.headers.get('cookie') || ''
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else if (cookieHeader) {
      // Fallback: send cookie header directly
      headers['Cookie'] = cookieHeader
    } else {
      // No authentication found - log for debugging
      console.error('[Chat History API] No authentication found. Cookie header:', cookieHeader ? 'present' : 'missing')
      return NextResponse.json(
        { error: 'Authentication required. Please sign in again.' },
        { status: 401 }
      )
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/chat/cv-scorer/history`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || 'Failed to load conversation history' }
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading conversation history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

