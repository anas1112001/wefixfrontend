# PowerShell script to deploy WeFix Backend to IIS under /api path
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WeFix Backend IIS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
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

# Import WebAdministration module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# Configuration
$siteName = "WeFix"
$backendPath = "D:\Projects\WeFix\Jehad\Cursor\Backend"
$apiPath = "/api"

# Check if main site exists
if (-not (Get-WebSite -Name $siteName -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Main site '$siteName' does not exist!" -ForegroundColor Red
    Write-Host "Please deploy the frontend first using deploy-to-iis.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if backend path exists
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend path not found: $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Backend path found: $backendPath" -ForegroundColor Green

# Check if backend is built
if (-not (Test-Path "$backendPath\dist\server.js")) {
    Write-Host "Building backend..." -ForegroundColor Yellow
    Push-Location $backendPath
    npm run start 2>&1 | Out-Null
    Pop-Location
    if (-not (Test-Path "$backendPath\dist\server.js")) {
        Write-Host "ERROR: Failed to build backend!" -ForegroundColor Red
        exit 1
    }
}

# Remove existing application if it exists
$existingApp = Get-WebApplication -Site $siteName -Name $apiPath -ErrorAction SilentlyContinue
if ($existingApp) {
    Write-Host "Removing existing application: $apiPath" -ForegroundColor Yellow
    Remove-WebApplication -Site $siteName -Name $apiPath
}

# Create application pool for backend (optional, can use same pool)
$backendAppPool = "WeFixBackendAppPool"
if (Get-IISAppPool -Name $backendAppPool -ErrorAction SilentlyContinue) {
    Write-Host "App pool $backendAppPool already exists" -ForegroundColor Yellow
} else {
    Write-Host "Creating application pool: $backendAppPool" -ForegroundColor Cyan
    New-WebAppPool -Name $backendAppPool
    Set-ItemProperty "IIS:\AppPools\$backendAppPool" -Name managedRuntimeVersion -Value ""
}

# Create application under main site
Write-Host "Creating application: $apiPath" -ForegroundColor Cyan
New-WebApplication -Site $siteName -Name $apiPath -PhysicalPath $backendPath -ApplicationPool $backendAppPool

# Set permissions
Write-Host "Setting folder permissions..." -ForegroundColor Cyan
$acl = Get-Acl $backendPath
$permission = "IIS_IUSRS","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $backendPath $acl

# Verify web.config exists
$webConfigPath = Join-Path $backendPath "web.config"
if (-not (Test-Path $webConfigPath)) {
    Write-Host "WARNING: web.config not found in backend. Creating..." -ForegroundColor Yellow
    # web.config should be created by the script
}

# Update frontend web.config to use local API
Write-Host "Updating frontend web.config for API routing..." -ForegroundColor Cyan
$frontendWebConfig = "D:\Projects\WeFix\Jehad\Cursor\Frontend\build\web.config"
if (Test-Path $frontendWebConfig) {
    [xml]$config = Get-Content $frontendWebConfig
    
    # Check if rewrite section exists
    if ($config.configuration.'system.webServer'.rewrite -eq $null) {
        $rewriteNode = $config.CreateElement("rewrite")
        $config.configuration.'system.webServer'.AppendChild($rewriteNode) | Out-Null
    }
    
    $rewriteNode = $config.configuration.'system.webServer'.rewrite
    if ($rewriteNode.rules -eq $null) {
        $rulesNode = $config.CreateElement("rules")
        $rewriteNode.AppendChild($rulesNode) | Out-Null
    } else {
        $rulesNode = $rewriteNode.rules
    }
    
    # Remove existing API proxy rule if any
    $existingRules = $rulesNode.rule | Where-Object { $_.name -eq "Proxy GraphQL API" }
    foreach ($rule in $existingRules) {
        $rulesNode.RemoveChild($rule) | Out-Null
    }
    
    # Add SPA routing rule (if not exists)
    $spaRuleExists = $rulesNode.rule | Where-Object { $_.name -eq "React Routes" }
    if (-not $spaRuleExists) {
        $spaRule = $config.CreateElement("rule")
        $spaRule.SetAttribute("name", "React Routes")
        $spaRule.SetAttribute("stopProcessing", "true")
        
        $match = $config.CreateElement("match")
        $match.SetAttribute("url", ".*")
        $spaRule.AppendChild($match) | Out-Null
        
        $conditions = $config.CreateElement("conditions")
        $conditions.SetAttribute("logicalGrouping", "MatchAll")
        
        $condition1 = $config.CreateElement("add")
        $condition1.SetAttribute("input", "{REQUEST_FILENAME}")
        $condition1.SetAttribute("matchType", "IsFile")
        $condition1.SetAttribute("negate", "true")
        $conditions.AppendChild($condition1) | Out-Null
        
        $condition2 = $config.CreateElement("add")
        $condition2.SetAttribute("input", "{REQUEST_FILENAME}")
        $condition2.SetAttribute("matchType", "IsDirectory")
        $condition2.SetAttribute("negate", "true")
        $conditions.AppendChild($condition2) | Out-Null
        
        $condition3 = $config.CreateElement("add")
        $condition3.SetAttribute("input", "{REQUEST_URI}")
        $condition3.SetAttribute("pattern", "^/(api)")
        $condition3.SetAttribute("negate", "true")
        $conditions.AppendChild($condition3) | Out-Null
        
        $spaRule.AppendChild($conditions) | Out-Null
        
        $action = $config.CreateElement("action")
        $action.SetAttribute("type", "Rewrite")
        $action.SetAttribute("url", "/")
        $spaRule.AppendChild($action) | Out-Null
        
        $rulesNode.AppendChild($spaRule) | Out-Null
    }
    
    $config.Save($frontendWebConfig)
    Write-Host "Frontend web.config updated" -ForegroundColor Green
}

# Restart application pools
Write-Host "Restarting application pools..." -ForegroundColor Cyan
Restart-WebAppPool -Name "WeFixAppPool"
Restart-WebAppPool -Name $backendAppPool

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Application:" -ForegroundColor Cyan
Write-Host "  Path: $apiPath" -ForegroundColor White
Write-Host "  Physical Path: $backendPath" -ForegroundColor White
Write-Host "  Application Pool: $backendAppPool" -ForegroundColor White
Write-Host ""
Write-Host "API Endpoint:" -ForegroundColor Yellow
Write-Host "  http://localhost/api/graphql" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "IMPORTANT: For iisnode to work, you need to:" -ForegroundColor Yellow
Write-Host "  1. Install iisnode from: https://github.com/azure/iisnode" -ForegroundColor Yellow
Write-Host "  2. Or use Application Request Routing (ARR) as reverse proxy" -ForegroundColor Yellow
Write-Host ""
Write-Host "Alternative: Keep backend running on port 4000 and use URL Rewrite proxy" -ForegroundColor Cyan
Write-Host ""

