import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent for tracking
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || ''
    
    const body = {
      ip,
      userAgent,
      referer,
      timestamp: new Date().toISOString()
    }
    
    console.log('📊 Frontend API: Tracking landing page view:', body)
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/landing-page/track-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      // If backend endpoint doesn't exist yet, we'll still return success
      // so the frontend doesn't break. The backend can be implemented later.
      console.warn('⚠️ Backend endpoint may not exist yet, but tracking attempted')
      return NextResponse.json({ 
        success: true, 
        message: 'View tracked (backend endpoint may need implementation)' 
      }, { status: 200 })
    }
    
    const data = await response.json()
    console.log('✅ Landing page view tracked successfully:', data)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Error tracking landing page view:', error)
    // Return success even on error to not break user experience
    return NextResponse.json({ 
      success: true, 
      message: 'View tracking attempted' 
    }, { status: 200 })
  }
}

