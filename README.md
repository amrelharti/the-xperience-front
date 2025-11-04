# The Xperience - Learning Management System

A modern, full-stack Learning Management System (LMS) built with Next.js 14 and Spring Boot.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [🚀 VPS Deployment](#-vps-deployment-hostinger)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🌟 Features

- **Course Management**: Create, organize, and manage courses with modules and lessons
- **User Authentication**: Sign in with credentials or Google OAuth
- **Admin Dashboard**: Comprehensive admin panel for managing content
- **Live Sessions**: Schedule and manage live training sessions
- **Progress Tracking**: Track student progress and completion
- **Leaderboards**: Gamification with module and class leaderboards
- **Feed System**: Social feed for posts, comments, and interactions
- **Homework System**: Create and manage assignments
- **Video Integration**: Vimeo integration for video content
- **Responsive Design**: Beautiful UI with Tailwind CSS and Radix UI

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks
- **Animations**: Framer Motion

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL
- **Authentication**: JWT + Google OAuth
- **API**: RESTful API
- **Video**: Vimeo API Integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Java 17+
- PostgreSQL 14+

### Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd the-xperience-front
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local for frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

4. **Start the backend** (in separate terminal)
```bash
# Make sure PostgreSQL is running
# Navigate to your backend directory and run:
java -jar backend.jar
```

5. **Start the frontend**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 🚀 VPS Deployment (Hostinger)

### 📦 Deployment Files Included

I've created comprehensive deployment resources for you:

| File | Purpose |
|------|---------|
| **[HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)** | ⭐ **START HERE** - Simple guide to get deployed fast |
| **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** | 📚 Complete manual deployment guide |
| **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** | ⚡ Commands cheat sheet & quick reference |
| **[DEPLOYMENT_FILES_SUMMARY.md](./DEPLOYMENT_FILES_SUMMARY.md)** | 📊 Overview of all deployment files |
| **[deploy-backend.sh](./deploy-backend.sh)** | 🤖 Automated backend deployment script |
| **[deploy-frontend.sh](./deploy-frontend.sh)** | 🤖 Automated frontend deployment script |
| **[setup-nginx.sh](./setup-nginx.sh)** | 🤖 Automated Nginx & SSL setup script |

### 🎯 Quick Deploy (3 Commands!)

```bash
# 1. Deploy Backend (Java + PostgreSQL)
./deploy-backend.sh

# 2. Deploy Frontend (Next.js + PM2)
./deploy-frontend.sh

# 3. Setup Nginx + SSL
./setup-nginx.sh
```

**That's it!** Your app will be live with HTTPS! 🎉

### 📖 Detailed Deployment Instructions

For first-time deployment, start here:
👉 **[HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)**

This guide will walk you through:
1. Uploading files to your VPS
2. Running the automated scripts
3. Configuring DNS
4. Testing your deployment

**Estimated time**: 30-45 minutes

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production Build
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

### Environment Variables

#### Frontend (.env.local for development, .env.production for production)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

#### Backend (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/xperience2_db
spring.datasource.username=xperience_user
spring.datasource.password=your_password

app.jwt-secret-base64=your_jwt_secret
app.allowed-origins=http://localhost:3000

vimeo.access-token=your_vimeo_token
```

---

## 📁 Project Structure

```
the-xperience-front/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin pages
│   │   ├── classes/             # Class management
│   │   ├── courses/             # Course management
│   │   ├── feed/                # Feed management
│   │   └── ...
│   ├── api/                     # API routes (Next.js API)
│   ├── auth/                    # Authentication pages
│   ├── courses/                 # Student course pages
│   ├── feed/                    # Social feed
│   ├── profile/                 # User profile
│   └── ...
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── landing/                 # Landing page components
│   └── ...
├── lib/                         # Utility functions
├── public/                      # Static assets
├── src/main/                    # Backend (Spring Boot)
│   ├── java/                    # Java source code
│   └── resources/               # Backend resources
├── deploy-backend.sh            # Backend deployment script
├── deploy-frontend.sh           # Frontend deployment script
├── setup-nginx.sh               # Nginx setup script
└── ...
```

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Student and admin accounts
- **Courses**: Course information and metadata
- **Modules**: Course modules with lessons
- **Classes**: Student enrollment groups
- **Posts**: Social feed posts
- **Progress**: Student progress tracking
- **Live Sessions**: Scheduled training sessions

---

## 🔐 Authentication

The app supports two authentication methods:

1. **Credential-based**: Email and password
2. **Google OAuth**: Sign in with Google

Authentication is handled via JWT tokens with a 7-day expiration.

---

## 📊 Key Features Details

### Admin Features
- Create and manage courses
- Organize modules and lessons
- Upload video content (Vimeo)
- Manage student enrollments
- Track student progress
- Schedule live sessions
- Manage social feed

### Student Features
- Browse and enroll in courses
- Watch video lessons
- Track progress
- Participate in social feed
- Complete homework assignments
- View leaderboards
- Join live sessions

---

## 🚨 Troubleshooting

### Common Issues

**Frontend won't start**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

**Backend connection issues**
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Check PostgreSQL
psql -d xperience2_db -U xperience_user
```

**Build errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

For deployment issues, see **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** → Troubleshooting section.

---

## 📝 API Documentation

The backend exposes RESTful APIs at `/api/`:

- `/api/auth/*` - Authentication endpoints
- `/api/courses/*` - Course management
- `/api/admin/*` - Admin operations
- `/api/students/*` - Student operations
- `/actuator/health` - Health check

Full API documentation: See backend `@RestController` classes.

---

## 🔄 Updates and Maintenance

### Updating the Application

**Frontend**
```bash
cd /srv/xperience-front
git pull  # or upload new files
npm install
npm run build
pm2 restart xperience-frontend
```

**Backend**
```bash
systemctl stop xperience-backend
# Upload new JAR file
systemctl start xperience-backend
```

See **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** for detailed update procedures.

---

## 🐛 Known Issues

- TypeScript and ESLint errors are currently ignored during builds (configured in next.config.mjs)
- Some build warnings related to type definitions

---

## 📄 License

[Add your license here]

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For deployment help, start with:
- **[HOW_TO_DEPLOY.md](./HOW_TO_DEPLOY.md)** - Deployment guide
- **[DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)** - Quick reference

For development questions, check the code documentation and comments.

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [PostgreSQL](https://www.postgresql.org/)

---

**Made with ❤️ for education**
