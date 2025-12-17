import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, finalScore } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/cv-scorer/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        finalScore: finalScore || null,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to submit contact information' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error submitting contact information:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

