import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`
    } else {
      headers['Cookie'] = cookieHeader
    }
    
    const response = await fetch(`${BACKEND_URL}/api/admin/roulette/winners/${params.id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete winner' }))
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error deleting roulette winner:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete winner' },
      { status: 500 }
    )
  }
}

