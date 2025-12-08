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

    // No authentication required - public endpoint
    const headers: Record<string, string> = {}

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

