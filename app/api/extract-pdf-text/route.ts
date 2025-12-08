import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Get JWT token from cookies
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
              jwtToken = decodeURIComponent(value)
              break
            }
          }
        }
      }
    }

    // Create FormData for backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    // Build headers
    const headers: Record<string, string> = {}
    const cookieHeader = request.headers.get('cookie') || ''
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/score-cv/extract-text`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to extract text from PDF' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

