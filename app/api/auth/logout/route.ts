import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    console.log('🔓 Logout route called')
    console.log('Request cookies:', request.headers.get('cookie'))
    
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    })
    
    console.log('Backend logout response:', response.status)
    
    // Create response based on backend status
    const nextResponse = response.ok 
      ? NextResponse.json({ success: true }, { status: 200 })
      : NextResponse.json({ error: 'Logout failed' }, { status: response.status })
    
    // Extract domain from request
    const host = request.headers.get('host') || 'the-xperience.com'
    const domain = host.includes('the-xperience.com') ? '.the-xperience.com' : undefined
    
    console.log('Clearing cookies for domain:', domain)
    
    // Production configuration matching your actual cookies
    // SESSION cookie: HttpOnly, Secure, SameSite=None, Domain=.the-xperience.com
    const productionConfig = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 0,
      path: '/',
      domain: domain,
    }
    
    // Clear SESSION cookie with production config
    nextResponse.cookies.set('SESSION', '', productionConfig)
    
    // Also try without domain for local cookies
    nextResponse.cookies.set('SESSION', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      maxAge: 0,
      path: '/',
    })
    
    // Try with different sameSite options
    const cookieConfigs = [
      { ...productionConfig, sameSite: 'lax' as const },
      { ...productionConfig, sameSite: 'strict' as const },
      { ...productionConfig, httpOnly: false },
    ]
    
    for (const config of cookieConfigs) {
      nextResponse.cookies.set('SESSION', '', config)
    }
    
    // Also use delete method
    nextResponse.cookies.delete('SESSION')
    nextResponse.cookies.delete({
      name: 'SESSION',
      path: '/',
      domain: domain,
    })
    
    // Clear other auth cookies (g_state, JSESSIONID, etc.)
    const authCookies = ['g_state', 'JSESSIONID', 'Authorization', 'auth-token', 'access_token']
    for (const cookieName of authCookies) {
      nextResponse.cookies.set(cookieName, '', productionConfig)
      nextResponse.cookies.delete(cookieName)
      if (domain) {
        nextResponse.cookies.delete({
          name: cookieName,
          path: '/',
          domain: domain,
        })
      }
    }
    
    console.log('🧹 Cleared all cookies with domain:', domain)
    
    return nextResponse
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
