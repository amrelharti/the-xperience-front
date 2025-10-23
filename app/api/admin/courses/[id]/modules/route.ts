import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

// GET: Get all modules (weeks) for a course (training)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Try to get modules for this specific training
    // First try the specific endpoint
    let backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/courses/${params.id}/modules`,
      {
        headers: {
          'Cookie': cookieHeader,
        },
      }
    )
    
    // If that fails, get all modules and filter by courseId
    if (!backendResponse.ok) {
      console.log('Specific endpoint failed, trying all modules endpoint')
      backendResponse = await fetch(
        `${BACKEND_URL}/api/admin/modules`,
        {
          headers: {
            'Cookie': cookieHeader,
          },
        }
      )
      
      if (backendResponse.ok) {
        const allModules = await backendResponse.json()
        // Filter modules by courseId to ensure only modules for this specific training
        const filteredModules = allModules.filter((module: any) => {
          console.log(`Checking module ${module.id}: courseId=${module.courseId}, trainingId=${params.id}`)
          return module.courseId === params.id
        })
        console.log(`Found ${filteredModules.length} modules for training ${params.id} out of ${allModules.length} total modules`)
        return NextResponse.json(filteredModules)
      }
    }
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: errorText },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('Fetched modules:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new module within a training
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    console.log(`Creating module for training ${params.id}:`, body)
    
    // Ensure courseId is properly set for module-training association
    const moduleData = {
      ...body,
      courseId: params.id  // CRITICAL: This links the module to the specific training
    }
    
    console.log("Module data being sent to backend:", moduleData)
    console.log("Training ID from URL:", params.id)
    
    // The issue: /api/admin/modules creates TRAININGS, not modules!
    // We need to find the correct endpoint for creating modules within a training
    
    // Try to create a module using a different approach
    // Let's try using the courses endpoint with a different structure
    let backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/courses/${params.id}/modules`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify({
          ...body,
          // Ensure we're creating a module, not a training
          type: 'module',
          parentId: params.id
        }),
      }
    )
    
    // If that fails, we need to find the correct endpoint
    if (!backendResponse.ok) {
      console.log('Specific endpoint failed, checking what endpoints exist...')
      // Let's try a different approach - maybe the backend expects a different structure
      backendResponse = await fetch(
        `${BACKEND_URL}/api/admin/modules`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
          },
          body: JSON.stringify({
            ...body,
            // Make it clear this is a module, not a training
            entityType: 'MODULE',
            courseId: params.id,
            isModule: true
          }),
        }
      )
    }
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend error:', errorText)
      return NextResponse.json(
        { error: errorText },
        { status: backendResponse.status }
      )
    }
    
    const data = await backendResponse.json()
    console.log('Module created successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
