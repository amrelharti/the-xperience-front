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
    console.log('📊 Backend URL:', `${BACKEND_URL}/api/landing-page/track-view`)
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/landing-page/track-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      // Log the actual error for debugging
      const errorText = await response.text().catch(() => 'Could not read error response')
      console.error('❌ Backend error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${BACKEND_URL}/api/landing-page/track-view`
      })
      
      // Return the actual error so we can debug
      return NextResponse.json({ 
        success: false, 
        message: 'View tracking failed',
        error: errorText,
        status: response.status
      }, { status: response.status })
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

