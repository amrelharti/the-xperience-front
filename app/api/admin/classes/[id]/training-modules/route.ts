import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// GET: Get all modules for a specific class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    console.log(`📦 Fetching training modules for class ${params.id}`)
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/classes/${params.id}/modules`,
      {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
        },
      }
    )
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ Backend error:', errorText)
      return NextResponse.json(
        { error: errorText },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log(`✅ Fetched ${data.length} modules for class ${params.id}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error fetching training modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new module within a class
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    console.log(`🔥 Creating training module for class ${params.id}:`, body)
    
    // Prepare the training module data
    const moduleData = {
      classId: params.id,
      title: body.title,
      description: body.description || "",
      orderIndex: body.orderIndex || 0,
      accessCode: body.accessCode || null
    }
    
    console.log('📦 Sending training module data to backend:', moduleData)
    
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/classes/${params.id}/modules`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(moduleData),
      }
    )
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('❌ Backend error:', errorText)
      return NextResponse.json(
        { error: errorText },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('✅ Training module created successfully:', data)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Error creating training module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



