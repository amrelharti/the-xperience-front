import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    // Backend expects: /api/admin/courses/{moduleId}/modules/{courseId}
    const response = await fetch(`${BACKEND_URL}/api/admin/courses/${params.id}/modules/${params.courseId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    return NextResponse.json(null, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    const body = await request.json()
    // Backend expects: /api/admin/courses/{moduleId}/modules/{courseId}
    const response = await fetch(`${BACKEND_URL}/api/admin/courses/${params.id}/modules/${params.courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}
