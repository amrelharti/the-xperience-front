import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API: Fetching public courses from backend...')
    const response = await fetch(`${BACKEND_URL}/api/public/courses?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    console.log('Frontend API: Backend response status:', response.status)
    const data = await response.json()
    console.log('Frontend API: Backend returned data:', data)
    console.log('Frontend API: Data count:', data.value?.length || data.length || 'unknown')
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching public courses:', error)
    return NextResponse.json({ error: 'Failed to fetch public courses' }, { status: 500 })
  }
}
