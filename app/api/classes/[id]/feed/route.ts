import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const { searchParams } = new URL(request.url)
    
    // Extract JWT token from SESSION cookie
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
    
    const headers: Record<string, string> = {}
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }
    
    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.set('classId', params.id)
    
    // Forward other params (page, size, search, type)
    searchParams.forEach((value, key) => {
      if (key !== 'classId') {
        queryParams.set(key, value)
      }
    })
    
    const response = await fetch(`${BACKEND_URL}/api/feed?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching class feed:', error)
    return NextResponse.json({ error: 'Failed to fetch class feed' }, { status: 500 })
  }
}



