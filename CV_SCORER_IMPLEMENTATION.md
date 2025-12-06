# CV Scorer Implementation Summary

## Overview
A complete CV-scoring web application integrated into The Xperience platform, designed specifically for Moroccan/Europass-style CVs.

## Backend Implementation

### Files Created

1. **DTOs** (`src/main/java/com/thexperience/backend/cvscorer/dto/`)
   - `CvScoreResponse.java` - Complete response model matching the JSON schema

2. **Service** (`src/main/java/com/thexperience/backend/cvscorer/service/`)
   - `CvScoringService.java` - Handles PDF extraction and OpenAI API calls

3. **Controller** (`src/main/java/com/thexperience/backend/cvscorer/controller/`)
   - `CvScoringController.java` - REST endpoint at `/api/score-cv`

### Dependencies Added

- **Apache PDFBox 3.0.1** - For PDF text extraction
- Java's built-in `HttpClient` - For OpenAI API calls (no additional dependency needed)

### Configuration

1. **application.properties**
   - Added: `openai.apiKey=${OPENAI_API_KEY}`
   - Set the `OPENAI_API_KEY` environment variable

2. **SecurityConfig.java**
   - Added `/api/score-cv` to authenticated endpoints

### API Endpoint

**POST** `/api/score-cv`

**Request:**
- `multipart/form-data`
- `file` (required): PDF file
- `jobDescription` (optional): Text field
- `targetRole` (optional): Text field

**Response:**
- JSON object matching `CvScoreResponse` schema with scores and feedback

## Frontend Implementation

### Files Created

1. **Page** (`app/cv-scorer/page.tsx`)
   - Complete UI with PDF upload form
   - Results display with scores and feedback
   - Uses The Xperience design system

2. **API Route** (`app/api/cv-scorer/route.ts`)
   - Proxy route to backend
   - Handles file upload and authentication

### Features

- PDF file upload with validation
- Optional target role input
- Optional job description textarea
- Loading states with progress indicators
- Beautiful results display with:
  - Overall score (0-100)
  - Dimension scores with progress bars
  - Detailed feedback (summary, strengths, improvements)
- Toast notifications for errors and success
- Responsive design matching The Xperience style

## Setup Instructions

### Backend

1. **Set Environment Variable:**
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   ```
   Or add to your `application.properties`:
   ```properties
   openai.apiKey=your-api-key-here
   ```

2. **Build and Run:**
   ```bash
   cd D:\Ali projet\the-xperience-back
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend

1. **No additional setup needed** - The frontend is ready to use

2. **Access the page:**
   - Navigate to `/cv-scorer` in your Next.js app
   - Requires authentication (uses `RequireAuth` component)

## Usage

1. User navigates to `/cv-scorer`
2. Uploads a PDF CV
3. Optionally provides target role and/or job description
4. Clicks "Score My CV"
5. Receives detailed scoring and feedback

## Scoring Rubric

The system evaluates CVs on 5 dimensions:

1. **Structure & Readability** (20 pts)
   - Layout clarity
   - Section completeness
   - Visual hierarchy
   - Length appropriateness

2. **Content Quality** (35 pts)
   - Summary/headline
   - Experience structure
   - Action verbs
   - Impact/achievements
   - Education
   - Skills relevance and depth
   - Extra sections (projects, certifications, etc.)

3. **Relevance & Targeting** (20 pts)
   - Role alignment
   - Keyword match
   - Career trajectory coherence

4. **Professionalism & Language** (15 pts)
   - Grammar and spelling
   - Tone and formality
   - Cultural/personal info (Moroccan context-aware)

5. **Technical / ATS Compatibility** (10 pts)
   - Parsing friendliness
   - Standard conventions
   - File format and naming

## Technical Details

- **Region:** Always set to "morocco"
- **Model:** `gpt-4o-mini` (OpenAI)
- **Response Format:** JSON object
- **Authentication:** Required (JWT via cookies)
- **File Validation:** PDF only, validated on both frontend and backend

## Design System

The frontend uses:
- **Colors:** Primary blue (#0476D7, #0068A7), Accent yellow (#FFBC00)
- **Components:** Radix UI (Card, Button, Input, Progress)
- **Styling:** Tailwind CSS 4.x
- **Typography:** Montserrat (headings), Poppins (body)

## Notes

- The OpenAI API key is never exposed to the frontend
- All PDF processing happens on the backend
- The system is designed specifically for Moroccan/Europass CVs
- Cultural context is considered (e.g., photos are common and not penalized)

