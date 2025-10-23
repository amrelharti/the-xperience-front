import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    // Create response with the user data
    const nextResponse = NextResponse.json(data, { status: response.status })
    
    // Extract the Set-Cookie header from the backend response
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('Google auth: Set-Cookie header from backend:', setCookieHeader)
    
    if (setCookieHeader) {
      // Parse the cookie and set it in the Next.js response
      const cookieParts = setCookieHeader.split(';')
      const cookieNameValue = cookieParts[0].split('=')
      const cookieName = cookieNameValue[0]
      const cookieValue = cookieNameValue[1]
      
      console.log('Google auth: Parsed cookie name:', cookieName, 'value:', cookieValue.substring(0, 50) + '...')
      
      // Extract other cookie attributes
      let httpOnly = false
      let secure = false
      let sameSite = 'lax'
      let path = '/'
      let maxAge = 86400 // 1 day in seconds
      
      for (const part of cookieParts) {
        const trimmed = part.trim()
        if (trimmed.toLowerCase() === 'httponly') {
          httpOnly = true
        } else if (trimmed.toLowerCase().startsWith('secure')) {
          secure = true
        } else if (trimmed.toLowerCase().startsWith('samesite=')) {
          sameSite = trimmed.split('=')[1].toLowerCase()
        } else if (trimmed.toLowerCase().startsWith('path=')) {
          path = trimmed.split('=')[1]
        } else if (trimmed.toLowerCase().startsWith('max-age=')) {
          maxAge = parseInt(trimmed.split('=')[1])
        }
      }
      
      console.log('Google auth: Setting cookie with attributes:', { httpOnly, secure, sameSite, path, maxAge })
      
      // Set the cookie in the Next.js response
      nextResponse.cookies.set(cookieName, cookieValue, {
        httpOnly,
        secure: process.env.NODE_ENV === 'production' ? secure : false,
        sameSite: sameSite as 'lax' | 'strict' | 'none',
        path,
        maxAge
      })
    }
    
    return nextResponse
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
