import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

// GET: Get specific class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${BACKEND_URL}/api/admin/classes/${params.id}`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Fetched class:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 })
  }
}

// PUT: Update specific class by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    console.log(`Updating class ${params.id}:`, body)
    
    const response = await fetch(`${BACKEND_URL}/api/admin/classes/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Class updated successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }
}

// DELETE: Delete specific class by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    console.log(`Deleting class ${params.id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/admin/classes/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookieHeader,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    console.log('Class deleted successfully')
    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}


