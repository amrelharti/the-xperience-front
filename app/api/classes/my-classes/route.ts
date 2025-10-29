import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API: Fetching my-classes from backend')
    const response = await fetch(`${BACKEND_URL}/api/classes/my-classes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    console.log('Frontend API: Backend response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('Frontend API: Backend error response:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Frontend API: Backend success response:', data)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Frontend API: Error fetching my classes:', error)
    return NextResponse.json({ error: 'Failed to fetch my classes: ' + error.message }, { status: 500 })
  }
}
