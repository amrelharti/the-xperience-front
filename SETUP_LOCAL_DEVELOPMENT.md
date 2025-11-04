# 🔧 Local Development Setup Guide

## Why This Won't Affect Your Server

**Your local setup is 100% separate from your production server:**
- Local runs on `localhost:3000` (frontend) and `localhost:8080` (backend)
- Server runs on `the-xperience.com` and `api.the-xperience.com`
- They use DIFFERENT databases
- They use DIFFERENT code (until you deploy changes)

---

## Quick Setup Options

### **Option 1: PostgreSQL (Full Setup)**

#### Step 1: Install PostgreSQL on Windows

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 for Windows
   - Run the installer

2. **During Installation:**
   - Password: `Islam1997@ali` (or any password you want)
   - Port: `5432` (default)
   - Install pgAdmin (recommended for GUI management)

3. **Create Database:**
   
   After installation, open PowerShell **as Administrator** and run:
   
   ```powershell
   # Set PostgreSQL bin to PATH (adjust version if needed)
   $env:Path += ";C:\Program Files\PostgreSQL\15\bin"
   
   # Connect to PostgreSQL
   psql -U postgres
   
   # In psql, run these commands:
   CREATE DATABASE xperience2_db;
   CREATE USER xperience_user WITH PASSWORD 'Islam1997@ali';
   GRANT ALL PRIVILEGES ON DATABASE xperience2_db TO xperience_user;
   \c xperience2_db
   GRANT ALL ON SCHEMA public TO xperience_user;
   \q
   ```

#### Step 2: Start Your Local Backend

```powershell
cd "D:\Ali projet\the-xperience-back"
.\mvnw spring-boot:run
```

Wait for: "Started TheXperienceBackApplication"

#### Step 3: Start Your Local Frontend

Open a **NEW** terminal:

```powershell
cd "D:\Ali projet\the-xperience-front"
npm run dev
```

#### Step 4: Access Your Local App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

---

### **Option 2: Use H2 Database (No PostgreSQL Install Needed)**

This is a temporary in-memory database for quick testing without installing PostgreSQL.

#### Step 1: Update Backend Configuration

Create a NEW file: `D:\Ali projet\the-xperience-back\src\main\resources\application-dev.properties`

```properties
# H2 In-Memory Database (for local dev only)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console (access at http://localhost:8080/h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop

# Other settings
server.port=8080
app.jwt-secret-base64=FyK1Gp2vVkp+0cA08Ttbi6pCtvMb9BBkqS9+3i6CvP1dyhWm2Eeo8RStRjVTTa3lW+nI0Q9iOxXhvl7mXhind0902==
app.jwt-alg=HS256
app.jwt-ttl-seconds=604800
GOOGLE_CLIENT_ID=128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com
app.google-client-id=${GOOGLE_CLIENT_ID}
app.allowed-origins=http://localhost:3000,http://localhost:3001
app.domain=localhost:3000
vimeo.client-id=a6413cb5698fc09077a8d380734e83df303db194
vimeo.client-secret=raDexf5ljIkFDZUUsN0QOE7UzYCdHBDQuRGTm/Eog04QJbnym54sNHBr1P3bFJziE0aRG2AL3mJ7dDH7HTge+QOb7aI4Y4YxHfHibQRPalDS1XAl5DFZH5YzCqbE4uYH
vimeo.access-token=84904dd11670b2b6f433767e723527c7
vimeo.access.token=${vimeo.access-token}
vimeo.api.base.url=https://api.vimeo.com
spring.flyway.enabled=false
logging.level.root=INFO
logging.level.org.springframework.security=INFO
```

#### Step 2: Add H2 Dependency to pom.xml

Open `D:\Ali projet\the-xperience-back\pom.xml` and add:

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

#### Step 3: Run with Dev Profile

```powershell
cd "D:\Ali projet\the-xperience-back"
.\mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Note:** H2 is in-memory, so data resets when you stop the server. Good for quick tests!

---

### **Option 3: Docker PostgreSQL (Modern Approach)**

If you have Docker installed:

```powershell
docker run --name xperience-postgres `
  -e POSTGRES_DB=xperience2_db `
  -e POSTGRES_USER=xperience_user `
  -e POSTGRES_PASSWORD=Islam1997@ali `
  -p 5432:5432 `
  -d postgres:15
```

Then start backend normally:
```powershell
cd "D:\Ali projet\the-xperience-back"
.\mvnw spring-boot:run
```

---

## 🎯 Recommended Workflow

### For Daily Development:

1. **Start Backend:**
   ```powershell
   cd "D:\Ali projet\the-xperience-back"
   .\mvnw spring-boot:run
   ```

2. **Start Frontend (in new terminal):**
   ```powershell
   cd "D:\Ali projet\the-xperience-front"
   npm run dev
   ```

3. **Test your changes at:** http://localhost:3000

4. **When ready to deploy to server:**
   - Push your code to Git
   - SSH to your server
   - Pull the changes
   - Restart services on server

---

## 🔒 Safety Checklist

✅ **Local changes don't affect production** because:
- Different databases (local vs server)
- Different ports (localhost vs domain)
- Different servers (your PC vs VPS)
- Code only goes to production when you deploy

✅ **You can:**
- Break things locally without worry
- Test new features
- Debug issues
- Make mistakes

❌ **Production won't be affected unless you:**
- Manually deploy changes to server
- Push to production database (which is separate)

---

## 🚀 Quick Start Commands

```powershell
# Terminal 1: Backend
cd "D:\Ali projet\the-xperience-back"
.\mvnw spring-boot:run

# Terminal 2: Frontend
cd "D:\Ali projet\the-xperience-front"
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Which Option Should You Choose?

| Option | Best For | Pros | Cons |
|--------|----------|------|------|
| **PostgreSQL** | Production-like testing | Matches server, persistent data | Requires installation |
| **H2 Database** | Quick feature testing | No install, fast | Data resets, not production-like |
| **Docker** | Modern development | Isolated, easy cleanup | Requires Docker |

**Recommendation:** Start with **H2** for quick testing, then move to **PostgreSQL** for serious development.

---

## Need Help?

Run into issues? Check:
1. Is PostgreSQL/H2 configured?
2. Are both terminals running?
3. Is port 8080 or 3000 already in use?
4. Check backend logs for errors

