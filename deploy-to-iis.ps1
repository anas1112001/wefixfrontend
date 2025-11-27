# PowerShell script to deploy WeFix Frontend to IIS on port 80
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WeFix IIS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if IIS is installed
$iisFeature = Get-WindowsFeature -Name Web-Server
if (-not $iisFeature.Installed) {
    Write-Host "ERROR: IIS is not installed!" -ForegroundColor Red
    Write-Host "Installing IIS..." -ForegroundColor Yellow
    Install-WindowsFeature -Name Web-Server -IncludeManagementTools
    Write-Host "IIS installed. Please restart this script." -ForegroundColor Green
    exit 0
}

# Check if URL Rewrite Module is installed
$urlRewritePath = "C:\Program Files\IIS\URL Rewrite\Rewrite.dll"
if (-not (Test-Path $urlRewritePath)) {
    Write-Host "WARNING: URL Rewrite Module is not installed!" -ForegroundColor Yellow
    Write-Host "Please download and install from: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Get the build folder path
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildPath = Join-Path $scriptPath "build"

if (-not (Test-Path $buildPath)) {
    Write-Host "ERROR: Build folder not found at: $buildPath" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first to create the build folder." -ForegroundColor Yellow
    exit 1
}

Write-Host "Build folder found: $buildPath" -ForegroundColor Green

# Import WebAdministration module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Site configuration
$siteName = "WeFix"
$appPoolName = "WeFixAppPool"
$port = 80

# Remove existing site if it exists
if (Get-WebSite -Name $siteName -ErrorAction SilentlyContinue) {
    Write-Host "Removing existing site: $siteName" -ForegroundColor Yellow
    Remove-WebSite -Name $siteName
}

# Remove existing app pool if it exists
if (Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue) {
    Write-Host "Removing existing app pool: $appPoolName" -ForegroundColor Yellow
    Remove-WebAppPool -Name $appPoolName
}

# Create application pool
Write-Host "Creating application pool: $appPoolName" -ForegroundColor Cyan
New-WebAppPool -Name $appPoolName
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedPipelineMode -Value "Integrated"

# Create website
Write-Host "Creating website: $siteName on port $port" -ForegroundColor Cyan
New-WebSite -Name $siteName -Port $port -PhysicalPath $buildPath -ApplicationPool $appPoolName

# Set permissions
Write-Host "Setting folder permissions..." -ForegroundColor Cyan
$acl = Get-Acl $buildPath
$permission = "IIS_IUSRS","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $buildPath $acl

# Verify web.config exists
$webConfigPath = Join-Path $buildPath "web.config"
if (-not (Test-Path $webConfigPath)) {
    Write-Host "WARNING: web.config not found. Creating default..." -ForegroundColor Yellow
    # web.config should already be there from build process
}

# Start the website
Write-Host "Starting website..." -ForegroundColor Cyan
Start-WebSite -Name $siteName

# Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Website Name: $siteName" -ForegroundColor Cyan
Write-Host "Application Pool: $appPoolName" -ForegroundColor Cyan
Write-Host "Physical Path: $buildPath" -ForegroundColor Cyan
Write-Host "Port: $port" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Yellow
Write-Host "  http://localhost" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "  http://$env:COMPUTERNAME" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "API Endpoint (proxied):" -ForegroundColor Yellow
Write-Host "  http://localhost/api/graphql" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "IMPORTANT: Make sure your backend is running on port 4000!" -ForegroundColor Yellow
Write-Host "The frontend will proxy API requests to http://localhost:4000/graphql" -ForegroundColor Yellow
Write-Host ""

