import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

// POST: Create a module (CourseEntity) within a training (ModuleEntity)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const body = await request.json()
    
    console.log(`🔥 Creating module (CourseEntity) for training (ModuleEntity) ${params.id}:`, body)
    
    // CRITICAL UNDERSTANDING:
    // - ModuleEntity (table: modules) = TRAINING (top-level)
    // - CourseEntity (table: courses) = MODULE/WEEK (with module_id FK)
    // So to create a "module" within a "training", we create a CourseEntity!
    
    const courseData = {
      moduleId: params.id, // This links the CourseEntity to the ModuleEntity (training)
      title: body.title,
      description: body.description || "",
      videoUrl: body.videoUrl || "", // Default empty
      durationSeconds: body.durationSeconds || 0, // Default
      orderIndex: body.orderIndex || 0
    }
    
    console.log('📦 Sending CourseEntity data to backend:', courseData)
    
    // Create a CourseEntity (which represents a module/week in a training)
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/admin/courses/${params.id}/modules`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(courseData),
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
    console.log('✅ CourseEntity (module) created successfully:', data)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
