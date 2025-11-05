import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/classes/${params.id}/codes`, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    const data = await response.json()
    console.log("🔍 GET class codes response:", JSON.stringify(data, null, 2))
    
    // Transform response to ensure consistent format
    if (data && typeof data === 'object') {
      // If there's a codes array, extract the active code
      if (data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
        const activeCodeStr = data.codes[0]
        return NextResponse.json({
          hasCode: true,
          code: activeCodeStr,
          ...data
        }, { status: response.status })
      }
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching class codes:', error)
    return NextResponse.json({ error: 'Failed to fetch class codes' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Read the request body from the frontend
    const body = await request.json()
    console.log("🔍 POST Generate Class Code - Request body:", body)
    
    const response = await fetch(`${BACKEND_URL}/api/admin/classes/${params.id}/codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body)
    })
    
    console.log("🔍 Response status:", response.status)
    
    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Failed to generate class code:", error)
      return NextResponse.json({ error: 'Failed to generate class code' }, { status: response.status })
    }
    
    const data = await response.json()
    console.log("🔍 Raw backend response from POST:", JSON.stringify(data, null, 2))
    
    // Backend returns { codes: ["CODE1", "CODE2"] }
    // Extract the first code from the array
    let code = null
    if (data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
      code = data.codes[0]
    } else if (data.code) {
      code = data.code
    } else if (typeof data === 'string') {
      code = data
    }
    
    const responseData = { code }
    console.log("🔍 Transformed response:", JSON.stringify(responseData, null, 2))
    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Error generating class code:', error)
    return NextResponse.json({ error: 'Failed to generate class code' }, { status: 500 })
  }
}


