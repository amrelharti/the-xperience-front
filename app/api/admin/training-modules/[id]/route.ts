import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// GET: Get specific training module
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/training-modules/${params.id}`,
      {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
        },
      }
    )
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json({ error: errorText }, { status: backendResponse.status })
    }
    
    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching training module:', error)
    return NextResponse.json({ error: 'Failed to fetch training module' }, { status: 500 })
  }
}

// PUT: Update training module
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/training-modules/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(body),
      }
    )
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json({ error: errorText }, { status: backendResponse.status })
    }
    
    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating training module:', error)
    return NextResponse.json({ error: 'Failed to update training module' }, { status: 500 })
  }
}

// DELETE: Delete training module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/training-modules/${params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Cookie': cookieHeader,
        },
      }
    )
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json({ error: errorText }, { status: backendResponse.status })
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting training module:', error)
    return NextResponse.json({ error: 'Failed to delete training module' }, { status: 500 })
  }
}



