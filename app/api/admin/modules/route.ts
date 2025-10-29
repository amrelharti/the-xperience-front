import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// GET: List all modules across all trainings
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    const response = await fetch(`${BACKEND_URL}/api/admin/modules`, {
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
    console.log('Fetched all modules:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

// POST: Create a new module (standalone, not tied to specific training)
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    console.log('Creating standalone module:', body)
    
    const response = await fetch(`${BACKEND_URL}/api/admin/modules`, {
      method: 'POST',
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
    console.log('Module created successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
