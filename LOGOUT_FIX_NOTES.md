# Logout Issue Fix - Production

## Problem
Users (both students and admins) cannot logout in production. JWT tokens are still being found by the JWT Filter after logout attempts.

### Production Cookie Configuration
```
SESSION cookie:
- Domain: .the-xperience.com (with leading dot)
- Path: /
- HttpOnly: ✓
- Secure: ✓
- SameSite: None
- Contains JWT token
```

**Critical Issue**: The SESSION cookie is **HttpOnly**, which means client-side JavaScript CANNOT delete it. The backend MUST clear it with the EXACT same domain (`.the-xperience.com`).

---

## 🚨 IMMEDIATE FIX REQUIRED (Backend)

**The logout is failing because your backend is NOT clearing the SESSION cookie properly!**

Your backend `/api/auth/logout` endpoint **MUST** do this:

```java
Cookie sessionCookie = new Cookie("SESSION", null);
sessionCookie.setPath("/");
sessionCookie.setHttpOnly(true);
sessionCookie.setMaxAge(0);
sessionCookie.setSecure(true);
sessionCookie.setDomain(".the-xperience.com"); // ⚠️ THIS IS CRITICAL!
response.addCookie(sessionCookie);
```

Without the correct domain (`.the-xperience.com` with leading dot), the cookie will NOT be deleted!

---

## Frontend Changes Made ✅

### 1. Updated `/app/api/auth/logout/route.ts`
- Added aggressive cookie clearing with multiple configurations (different sameSite, httpOnly, secure combinations)
- Clears SESSION, JSESSIONID, Authorization, auth-token, and access_token cookies
- Added logging for debugging

### 2. Updated `/app/components/UserDropdown.tsx`
- Enhanced client-side cleanup to clear all cookies, localStorage, and sessionStorage
- Tries multiple cookie clearing strategies with different domain/path combinations
- Forces navigation to signin page after logout
- Ensures cleanup even if backend call fails

## Backend Changes Needed ⚠️

Based on the JWT Filter logs showing tokens still being found, you need to check your backend:

### 1. Logout Endpoint (`/api/auth/logout`) - CRITICAL FIX NEEDED

The backend logout endpoint **MUST** clear the SESSION cookie with **EXACT** same configuration:

```java
@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
    try {
        logger.info("🔓 Logout endpoint called");
        
        // 1. Invalidate the HTTP session
        HttpSession session = request.getSession(false);
        if (session != null) {
            logger.info("Invalidating session: {}", session.getId());
            session.invalidate();
        }
        
        // 2. Clear the SESSION cookie with EXACT production configuration
        Cookie sessionCookie = new Cookie("SESSION", null);
        sessionCookie.setPath("/");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setMaxAge(0);
        sessionCookie.setSecure(true); // MUST be true for HTTPS
        sessionCookie.setDomain(".the-xperience.com"); // ⚠️ CRITICAL: Must match exactly!
        response.addCookie(sessionCookie);
        
        // Also try without domain in case of subdomain variations
        Cookie sessionCookie2 = new Cookie("SESSION", null);
        sessionCookie2.setPath("/");
        sessionCookie2.setHttpOnly(true);
        sessionCookie2.setMaxAge(0);
        sessionCookie2.setSecure(true);
        response.addCookie(sessionCookie2);
        
        // 3. Clear g_state cookie (from Google auth)
        Cookie gStateCookie = new Cookie("g_state", null);
        gStateCookie.setPath("/");
        gStateCookie.setMaxAge(0);
        gStateCookie.setSecure(true);
        gStateCookie.setDomain(".the-xperience.com");
        response.addCookie(gStateCookie);
        
        // 4. Clear JSESSIONID if exists
        Cookie jsessionCookie = new Cookie("JSESSIONID", null);
        jsessionCookie.setPath("/");
        jsessionCookie.setMaxAge(0);
        jsessionCookie.setSecure(true);
        jsessionCookie.setDomain(".the-xperience.com");
        response.addCookie(jsessionCookie);
        
        // 5. Clear the Authorization header
        response.setHeader("Authorization", "");
        
        // 6. Extract and blacklist the JWT token
        String token = extractTokenFromRequest(request);
        if (token != null) {
            logger.info("Blacklisting token: {}", token.substring(0, 20) + "...");
            // Add to your JWT blacklist/revocation mechanism
            jwtTokenBlacklist.add(token);
        }
        
        // 7. Clear Spring Security context
        SecurityContextHolder.clearContext();
        
        logger.info("✅ Logout completed successfully");
        return ResponseEntity.ok().build();
        
    } catch (Exception e) {
        logger.error("❌ Error during logout", e);
        return ResponseEntity.status(500).build();
    }
}

// Helper method to extract JWT token from request
private String extractTokenFromRequest(HttpServletRequest request) {
    // Check Bearer token in Authorization header
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
        return bearerToken.substring(7);
    }
    
    // Check SESSION cookie
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if ("SESSION".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
    }
    
    return null;
}
```

### 2. JWT Filter
Your JWT Filter should:
- Check if the token is blacklisted before allowing requests
- Handle session invalidation properly
- Not create new sessions if one is already invalidated

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null) {
            // Check if token is blacklisted
            if (jwtTokenBlacklist.isBlacklisted(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            
            // Validate token
            if (jwtTokenProvider.validateToken(token)) {
                // Set authentication
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 3. Security Configuration
Ensure your logout configuration in SecurityFilterChain is correct:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .logout(logout -> logout
            .logoutUrl("/api/auth/logout")
            .logoutSuccessHandler((request, response, authentication) -> {
                response.setStatus(HttpServletResponse.SC_OK);
            })
            .invalidateHttpSession(true)
            .deleteCookies("SESSION", "JSESSIONID")
            .clearAuthentication(true)
        );
    
    return http.build();
}
```

### 4. CORS Configuration
If your frontend and backend are on different domains, ensure CORS is properly configured:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowCredentials(true);
    configuration.setAllowedOrigins(Arrays.asList("https://your-frontend-domain.com"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Production Environment Checklist

1. ✅ Frontend changes deployed
2. ⚠️ Backend logout endpoint invalidates sessions
3. ⚠️ Backend clears cookies with correct attributes (secure=true, sameSite, domain)
4. ⚠️ JWT tokens are blacklisted/revoked on logout
5. ⚠️ CORS configured to allow credentials and Set-Cookie headers
6. ⚠️ Cookie domain matches between frontend and backend (or use subdomain wildcards)
7. ⚠️ All cookies use `Secure` flag in production (HTTPS only)

## Testing in Production

1. Open browser DevTools → Application → Cookies
2. Login and verify cookies are set
3. Click logout
4. Check console logs for:
   - "🔓 Logout route called"
   - "Backend logout response: 200"
   - "🧹 Cleared all cookies"
   - "Cleared all client-side data"
5. Verify all cookies are removed in DevTools
6. Try accessing a protected route - should redirect to signin
7. Check backend logs - JWT Filter should NOT find any tokens after logout

## Common Production Issues

1. **Cookie Domain Mismatch**: If frontend is `app.example.com` and backend is `api.example.com`, use `.example.com` as domain
2. **Secure Flag**: Cookies with `Secure` flag won't work on HTTP (only HTTPS)
3. **SameSite**: In production with HTTPS, use `SameSite=None; Secure` for cross-site cookies
4. **Path**: Ensure cookie path matches where it was set (usually `/`)
5. **HttpOnly**: Client-side JavaScript cannot delete HttpOnly cookies - backend must do it

## Environment Variables to Check

Ensure these are set correctly in production:

- `NEXT_PUBLIC_API_BASE_URL` - should point to your production backend
- `NODE_ENV` - should be "production"
- Backend JWT secret should be secure and match between instances
- Session timeout settings
- Cookie domain configuration

## If Issue Persists

1. Check backend logs for any errors during logout
2. Verify the logout endpoint is actually being called
3. Check if there are multiple backend instances with different session stores
4. Verify JWT tokens are being properly invalidated
5. Check if any middleware is recreating sessions after logout
6. Use browser DevTools Network tab to see actual cookie headers being sent

---

**Next Steps:**
1. Deploy the frontend changes
2. Update backend logout endpoint as specified above
3. Test thoroughly in production environment
4. Monitor backend logs during logout attempts

