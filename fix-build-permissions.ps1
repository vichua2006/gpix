# PowerShell script to help fix electron-builder symlink permission issue
# Run this script as Administrator if Developer Mode is not enabled

Write-Host "Checking Windows Developer Mode status..." -ForegroundColor Cyan

# Check if Developer Mode is enabled
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"
$devMode = (Get-ItemProperty -Path $regPath -Name AllowDevelopmentWithoutDevLicense -ErrorAction SilentlyContinue).AllowDevelopmentWithoutDevLicense

if ($devMode -eq 1) {
    Write-Host "[OK] Developer Mode is already enabled!" -ForegroundColor Green
    Write-Host "You should be able to run 'npm run build' without issues." -ForegroundColor Green
    exit 0
}

Write-Host "[X] Developer Mode is not enabled." -ForegroundColor Yellow
Write-Host ""
Write-Host "To fix the electron-builder symlink error, you have two options:" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 1 (Recommended): Enable Developer Mode" -ForegroundColor Cyan
Write-Host "  1. Press Win+I to open Settings" -ForegroundColor Gray
Write-Host "  2. Go to Privacy and Security > For developers" -ForegroundColor Gray
Write-Host "  3. Turn ON 'Developer Mode'" -ForegroundColor Gray
Write-Host "  4. Restart your terminal and run 'npm run build'" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Run build as Administrator" -ForegroundColor Cyan
Write-Host "  1. Right-click your terminal and select 'Run as administrator'" -ForegroundColor Gray
Write-Host "  2. Navigate to project directory and run 'npm run build'" -ForegroundColor Gray
Write-Host ""
Write-Host "After enabling Developer Mode, run this script again to verify." -ForegroundColor White
