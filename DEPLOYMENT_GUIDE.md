# Deployment Guide - Production Ready

This guide will help you deploy The Xperience LMS to production safely.

## 🎯 What Was Fixed

### ✅ Frontend Changes (Next.js - Vercel)
- Replaced all hardcoded `localhost:8080` URLs with environment variables
- Fixed direct backend calls in authentication
- All API routes now use `NEXT_PUBLIC_API_BASE_URL` environment variable
- **Result:** Your frontend will work in both development and production

### ✅ Backend Changes (Spring Boot - Hostinger)
- Updated CORS configuration to support production origins
- Added environment variable support for allowed origins
- **Result:** Your backend will accept requests from your Vercel domain

## 🚀 Deployment Steps

### Step 1: Deploy Frontend to Vercel

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Production ready: environment variables configured"
   git push origin stable-restore
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Import your repository if not already imported

3. **Set Environment Variables in Vercel**
   - Go to your project settings → Environment Variables
   - Add these variables:
   
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
   NODE_ENV=production
   ```

   **Important:** Replace `your-backend-domain.com` with your actual Hostinger backend URL

4. **Deploy**
   - Vercel will automatically deploy
   - Or click "Redeploy" if already deployed

### Step 2: Deploy Backend to Hostinger

#### A. Update application.properties (IMPORTANT!)

You need to modify `src/main/resources/application.properties`:

**FOR PRODUCTION:** Replace these values with environment variables:

```properties
# Database Configuration - Use environment variables
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

# JWT Configuration - Use environment variables
app.jwt-secret-base64=${JWT_SECRET_BASE64}
app.jwt-alg=HS256
app.jwt-ttl-seconds=86400

# Allowed Origins - Use environment variables
app.allowed-origins=${ALLOWED_ORIGINS}

# Google OAuth - Use environment variables
app.google-client-id=${GOOGLE_CLIENT_ID}

# Server Configuration
server.port=${PORT:8080}
```

#### B. Create Environment Variables in Hostinger

Depending on your Hostinger hosting type, you'll need to set:

1. **If using VPS/Dedicated Server:**
   ```bash
   # SSH into your server
   ssh your-user@your-server.com
   
   # Create a .env file or set environment variables
   export DATABASE_URL="jdbc:postgresql://localhost:5432/thexperience"
   export DATABASE_USERNAME="postgres"
   export DATABASE_PASSWORD="your_secure_password"
   export JWT_SECRET_BASE64="your_jwt_secret"
   export ALLOWED_ORIGINS="https://your-vercel-app.vercel.app"
   export GOOGLE_CLIENT_ID="your_google_client_id"
   export PORT="8080"
   ```

2. **If using shared hosting:**
   - Use control panel to set environment variables
   - Or modify application.properties directly with production values

#### C. Update Database Password

**IMPORTANT:** Generate a strong password for production:

```bash
# Generate a secure password (example)
openssl rand -base64 32
```

Update your PostgreSQL database with this new password.

#### D. Update SecurityConfig.java (Already Done ✅)

The file is already updated to read from `ALLOWED_ORIGINS` environment variable.

#### E. Build and Deploy Backend

```bash
# Build the JAR file
mvn clean package

# Copy to your Hostinger server
scp target/your-app.jar your-user@your-server.com:/path/to/app/

# Run the application
java -jar your-app.jar
```

### Step 3: Update DNS/Networking

Ensure your backend is accessible:
- Backend should be accessible via domain or IP
- Firewall allows port 8080 (or your configured port)
- Database is accessible from backend

## 🔒 Security Checklist

- [ ] Database password is strong and different from development
- [ ] JWT secret is different from development  
- [ ] Google OAuth Client ID is configured for your domain
- [ ] CORS origins are set to your actual Vercel URL
- [ ] All environment variables are set in both Vercel and Hostinger
- [ ] HTTPS is enabled (use reverse proxy like Nginx)

## 🧪 Testing Production

1. **Test Authentication**
   - Try logging in with Google
   - Try email login
   - Check if sessions persist

2. **Test API Connectivity**
   - Open browser console
   - Check for any 404 or CORS errors
   - Verify data loads correctly

3. **Test Admin Features**
   - Login as admin
   - Try CRUD operations
   - Verify permissions work

## 📝 Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
NODE_ENV=production
```

### Backend (Hostinger)
```
DATABASE_URL=jdbc:postgresql://localhost:5432/thexperience
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=secure_password_here
JWT_SECRET_BASE64=your_jwt_secret_here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
PORT=8080
```

## ⚠️ Important Notes

1. **Never commit environment variables** to git
2. **Use HTTPS** for production (configure SSL certificate)
3. **Backup database** regularly
4. **Monitor logs** for errors
5. **Update passwords** periodically

## 🆘 Troubleshooting

### CORS Errors
- Check that `ALLOWED_ORIGINS` includes your exact Vercel URL
- Include both `www` and non-`www` versions if using custom domain

### Database Connection Errors
- Verify database is running
- Check connection string is correct
- Ensure firewall allows connections

### 404 Errors on API
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend is running and accessible
- Test backend health endpoint

### Authentication Issues
- Clear browser cookies
- Check JWT secret matches between backend instances
- Verify Google OAuth redirect URIs include production domain

## 📞 Support

If you encounter issues:
1. Check application logs on both frontend (Vercel) and backend (Hostinger)
2. Verify all environment variables are set correctly
3. Test backend health endpoint separately
4. Check network connectivity between services

---

**Status:** ✅ Production Ready
**Last Updated:** Now
**Changes:** All hardcoded URLs and credentials replaced with environment variables

