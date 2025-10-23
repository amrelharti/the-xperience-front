import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    const moduleId = params.id
    const courseId = params.courseId

    console.log(`🗑️ Deleting course ${courseId} from module ${moduleId}`)

    const response = await fetch(`${API_BASE_URL}/api/admin/training-modules/${moduleId}/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to delete course' },
        { status: response.status }
      )
    }

    console.log(`✅ Course ${courseId} deleted successfully`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/training-modules/[id]/courses/[courseId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; courseId: string } }
) {
  try {
    const moduleId = params.id
    const courseId = params.courseId
    const body = await request.json()

    console.log(`✏️ Updating course ${courseId} in module ${moduleId}`)

    const response = await fetch(`${API_BASE_URL}/api/admin/training-modules/${moduleId}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Course ${courseId} updated successfully`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/admin/training-modules/[id]/courses/[courseId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


