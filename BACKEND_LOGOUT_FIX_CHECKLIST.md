# Backend Logout Fix Checklist

## ✅ What's Fixed (Frontend)
- ✅ Frontend logout route updated to handle domain `.the-xperience.com`
- ✅ Client-side cleanup enhanced
- ✅ Cookie clearing now matches production config

## ⚠️ What Needs Fixing (Backend)

### Priority 1: Fix Logout Endpoint Cookie Clearing

In your backend `/api/auth/logout` endpoint, add this code:

```java
// Clear SESSION cookie with correct domain
Cookie sessionCookie = new Cookie("SESSION", null);
sessionCookie.setPath("/");
sessionCookie.setHttpOnly(true);
sessionCookie.setMaxAge(0);
sessionCookie.setSecure(true);
sessionCookie.setDomain(".the-xperience.com"); // ⚠️ Must have leading dot!
response.addCookie(sessionCookie);

// Also clear without domain for local variations
Cookie sessionCookie2 = new Cookie("SESSION", null);
sessionCookie2.setPath("/");
sessionCookie2.setHttpOnly(true);
sessionCookie2.setMaxAge(0);
sessionCookie2.setSecure(true);
response.addCookie(sessionCookie2);
```

### Priority 2: Invalidate JWT Token

Your JWT Filter is still finding tokens after logout. You need to:

1. **Blacklist the token** when logout is called
2. **Check the blacklist** in your JWT Filter before processing requests

```java
// In logout endpoint
String token = extractTokenFromCookie(request);
if (token != null) {
    jwtTokenBlacklist.add(token);
}

// In JWT Filter
if (jwtTokenBlacklist.isBlacklisted(token)) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    return;
}
```

### Priority 3: Verify Logout Endpoint is Being Called

Add logging to your logout endpoint:

```java
@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
    logger.info("🔓 LOGOUT ENDPOINT CALLED");
    logger.info("Session ID: {}", request.getSession(false)?.getId());
    logger.info("Cookies received: {}", Arrays.toString(request.getCookies()));
    
    // ... rest of logout logic
    
    logger.info("✅ LOGOUT COMPLETED");
    return ResponseEntity.ok().build();
}
```

## Testing Steps

1. Deploy backend changes
2. Deploy frontend changes
3. Test logout:
   - Open browser DevTools → Application → Cookies
   - Login and verify SESSION cookie exists
   - Click logout
   - Check that SESSION cookie is removed
   - Try accessing protected route → should redirect to signin
4. Check logs:
   - Backend should show "🔓 LOGOUT ENDPOINT CALLED"
   - Backend should show "✅ LOGOUT COMPLETED"
   - JWT Filter should NOT find any tokens after logout

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Cookie not cleared | Domain mismatch | Use `.the-xperience.com` with leading dot |
| Still authenticated after logout | Token not blacklisted | Add token to blacklist in logout endpoint |
| JWT Filter still finds token | Not checking blacklist | Check blacklist before validating token |
| Cookie clearing but not working | Wrong Secure flag | Must use `Secure=true` for HTTPS |

## Quick Verification

Run this in browser console after logout:
```javascript
console.log('Cookies:', document.cookie);
console.log('LocalStorage:', localStorage);
console.log('SessionStorage:', sessionStorage);
```

All should be empty after logout.

## Need Help?

Check the detailed guide in `LOGOUT_FIX_NOTES.md` for complete code examples.

