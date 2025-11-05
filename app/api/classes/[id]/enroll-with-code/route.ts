import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log("🔍 Enroll with code - Class ID:", params.id)
    console.log("🔍 Request body:", body)
    
    const response = await fetch(`${BACKEND_URL}/api/classes/${params.id}/enroll-with-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    })
    
    console.log("🔍 Response status:", response.status)
    
    const data = await response.json()
    console.log("🔍 Response data:", data)
    
    if (!response.ok) {
      console.error("❌ Enrollment failed:", data)
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error enrolling with code:', error)
    return NextResponse.json({ error: 'Failed to enroll with code' }, { status: 500 })
  }
}


