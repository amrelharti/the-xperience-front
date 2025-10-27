import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get classId from query parameters
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const classIdParam = classId ? `?classId=${classId}` : ''
    
    console.log("🔍 Fetching course with classId:", classId)
    
    const response = await fetch(`${BACKEND_URL}/api/courses/${params.id}${classIdParam}`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}


