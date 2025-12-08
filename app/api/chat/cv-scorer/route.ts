import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get JWT token from cookies
    const cookieHeader = request.headers.get('cookie') || ''
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

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/chat/cv-scorer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get chat response' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

