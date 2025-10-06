# Setup script for The Xperience Frontend Environment Variables
Write-Host "Setting up environment variables for The Xperience Frontend..." -ForegroundColor Green

# Create .env.local file
$envContent = @"
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "Created .env.local file with placeholder values." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Google Client ID from Google Cloud Console" -ForegroundColor White
Write-Host "2. Open .env.local and replace YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com with your real client ID" -ForegroundColor White
Write-Host "3. Restart the development server (npm run dev)" -ForegroundColor White
Write-Host ""
Write-Host "Current .env.local contents:" -ForegroundColor Cyan
Get-Content .env.local

