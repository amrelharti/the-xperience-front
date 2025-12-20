import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/roulette/spin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to spin roulette' }))
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error spinning roulette:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to spin roulette' },
      { status: 500 }
    )
  }
}

