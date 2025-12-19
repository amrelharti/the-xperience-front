import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/landing-page/remaining-spots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      // Return default value if error
      return NextResponse.json({ remainingSpots: 12 }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching remaining spots:', error)
    // Return default value on error
    return NextResponse.json({ remainingSpots: 12 }, { status: 200 })
  }
}

