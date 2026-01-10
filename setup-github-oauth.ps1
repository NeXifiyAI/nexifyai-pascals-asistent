# GitHub OAuth App Setup Script for Supermemory
# This script opens the GitHub OAuth App creation page with pre-filled parameters

$appName = "NeXifyAI Supermemory Brain"
$homepage = "https://nexifyai.com"
$callback = "https://api.supermemory.ai/v3/connections/auth/callback/github"
$description = "NeXifyAI Brain - AI Memory System powered by Supermemory"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub OAuth App Setup for Supermemory" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening GitHub OAuth App creation page..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please fill in these values:" -ForegroundColor Green
Write-Host "  Application name: $appName" -ForegroundColor White
Write-Host "  Homepage URL: $homepage" -ForegroundColor White
Write-Host "  Authorization callback URL: $callback" -ForegroundColor White
Write-Host "  Application description: $description" -ForegroundColor White
Write-Host ""
Write-Host "After creating the app, you will receive:" -ForegroundColor Yellow
Write-Host "  1. Client ID (displayed immediately)" -ForegroundColor White
Write-Host "  2. Client Secret (click 'Generate a new client secret')" -ForegroundColor White
Write-Host ""
Write-Host "Opening GitHub in browser..." -ForegroundColor Cyan

# Open GitHub OAuth Apps page
Start-Process "https://github.com/settings/applications/new"

Write-Host ""
Write-Host "Waiting for you to create the OAuth App..." -ForegroundColor Yellow
Write-Host "Press any key once you have the Client ID and Client Secret..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Please paste your GitHub Client ID:" -ForegroundColor Cyan
$clientId = Read-Host

Write-Host ""
Write-Host "Please paste your GitHub Client Secret:" -ForegroundColor Cyan
$clientSecret = Read-Host -AsSecureString
$clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret))

Write-Host ""
Write-Host "Saving credentials to .env file..." -ForegroundColor Yellow

# Update .env file
$envPath = "C:\Users\pcour\OneDrive\pascals-assistent\pascals-aktiver-assistent-nichts-loeschen\.env"
$envContent = @"

# GitHub OAuth for Supermemory Integration
GITHUB_OAUTH_CLIENT_ID=$clientId
GITHUB_OAUTH_CLIENT_SECRET=$clientSecretPlain

# Supermemory Configuration
SUPERMEMORY_API_KEY=your-supermemory-api-key-here
SUPERMEMORY_API_URL=https://api.supermemory.ai/v3
"@

Add-Content -Path $envPath -Value $envContent

Write-Host ""
Write-Host "✅ GitHub OAuth credentials saved to .env!" -ForegroundColor Green
Write-Host ""
Write-Host "Client ID: $clientId" -ForegroundColor White
Write-Host "Client Secret: [REDACTED]" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Get your Supermemory API key from https://console.supermemory.ai" -ForegroundColor White
Write-Host "  2. Update SUPERMEMORY_API_KEY in .env file" -ForegroundColor White
Write-Host "  3. Configure Supermemory to use your custom GitHub OAuth app" -ForegroundColor White
Write-Host ""
Write-Host "Script completed!" -ForegroundColor Green
