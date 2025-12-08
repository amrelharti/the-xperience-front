import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobDescription = formData.get('jobDescription') as string | null
    const targetRole = formData.get('targetRole') as string | null
    const feedbackLanguage = formData.get('feedbackLanguage') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'PDF file is required' },
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

    // Create FormData for backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)
    if (jobDescription) {
      backendFormData.append('jobDescription', jobDescription)
    }
    if (targetRole) {
      backendFormData.append('targetRole', targetRole)
    }
    if (feedbackLanguage) {
      backendFormData.append('feedbackLanguage', feedbackLanguage)
    }

    const headers: Record<string, string> = {}
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(`${BACKEND_URL}/api/score-cv`, {
      method: 'POST',
      headers,
      body: backendFormData,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to score CV' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error scoring CV:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

