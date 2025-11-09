import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Allow access to maintenance page and static assets
  const isMaintenancePage = pathname === '/maintenance';
  const isStaticAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/static') ||
                        pathname.startsWith('/favicon.ico') ||
                        pathname.startsWith('/images');
  
  // If maintenance mode is ON
  if (isMaintenanceMode) {
    // Check for bypass token (optional - for admins/developers)
    const bypassToken = request.cookies.get('maintenance-bypass')?.value;
    const validBypassToken = process.env.MAINTENANCE_BYPASS_TOKEN;
    
    // Allow bypass if valid token exists
    if (validBypassToken && bypassToken === validBypassToken) {
      return NextResponse.next();
    }
    
    // Optional: Whitelist certain IP addresses
    const whitelistedIPs = process.env.MAINTENANCE_WHITELIST_IPS?.split(',') || [];
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    
    if (clientIP && whitelistedIPs.includes(clientIP)) {
      return NextResponse.next();
    }
    
    // Redirect to maintenance page (unless already there or accessing static assets)
    if (!isMaintenancePage && !isStaticAsset) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }
  
  // If maintenance mode is OFF and user is on maintenance page, redirect to home
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

