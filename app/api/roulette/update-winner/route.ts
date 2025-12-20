import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationCode, winnerName } = body

    if (!verificationCode || !winnerName) {
      return NextResponse.json({ error: 'Missing verification code or winner name' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_URL}/api/roulette/update-winner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verificationCode, winnerName }),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update winner' }))
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error updating winner:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update winner' },
      { status: 500 }
    )
  }
}

