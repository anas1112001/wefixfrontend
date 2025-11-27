# Script to add URL Rewrite rules AFTER URL Rewrite Module is installed
# Run this script AFTER installing URL Rewrite Module from:
# https://www.iis.net/downloads/microsoft/url-rewrite

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Adding URL Rewrite Rules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Check if URL Rewrite Module is installed
$urlRewritePath = "C:\Program Files\IIS\URL Rewrite\Rewrite.dll"
if (-not (Test-Path $urlRewritePath)) {
    Write-Host "ERROR: URL Rewrite Module is not installed!" -ForegroundColor Red
    Write-Host "Please download and install from: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "URL Rewrite Module found!" -ForegroundColor Green

# Update frontend web.config
$frontendWebConfig = "D:\Projects\WeFix\Jehad\Cursor\Frontend\build\web.config"
if (-not (Test-Path $frontendWebConfig)) {
    Write-Host "ERROR: Frontend web.config not found at: $frontendWebConfig" -ForegroundColor Red
    exit 1
}

Write-Host "Updating frontend web.config..." -ForegroundColor Cyan

[xml]$config = Get-Content $frontendWebConfig

# Ensure rewrite section exists
if ($config.configuration.'system.webServer'.rewrite -eq $null) {
    $rewriteNode = $config.CreateElement("rewrite")
    $config.configuration.'system.webServer'.AppendChild($rewriteNode) | Out-Null
} else {
    $rewriteNode = $config.configuration.'system.webServer'.rewrite
}

if ($rewriteNode.rules -eq $null) {
    $rulesNode = $config.CreateElement("rules")
    $rewriteNode.AppendChild($rulesNode) | Out-Null
} else {
    $rulesNode = $rewriteNode.rules
}

# Remove existing rules
$existingRules = @($rulesNode.rule)
foreach ($rule in $existingRules) {
    $rulesNode.RemoveChild($rule) | Out-Null
}

# Add API proxy rule
$apiRule = $config.CreateElement("rule")
$apiRule.SetAttribute("name", "Proxy GraphQL API")
$apiRule.SetAttribute("stopProcessing", "true")

$match = $config.CreateElement("match")
$match.SetAttribute("url", "^api/(.*)")
$apiRule.AppendChild($match) | Out-Null

$action = $config.CreateElement("action")
$action.SetAttribute("type", "Rewrite")
$action.SetAttribute("url", "http://localhost:4000/{R:1}")
$apiRule.AppendChild($action) | Out-Null

$serverVars = $config.CreateElement("serverVariables")
$setVar = $config.CreateElement("set")
$setVar.SetAttribute("name", "HTTP_ACCEPT_ENCODING")
$setVar.SetAttribute("value", "")
$serverVars.AppendChild($setVar) | Out-Null
$apiRule.AppendChild($serverVars) | Out-Null

$rulesNode.AppendChild($apiRule) | Out-Null

# Add SPA routing rule
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

# Save the updated config
$config.Save($frontendWebConfig)
Write-Host "Frontend web.config updated successfully!" -ForegroundColor Green

# Restart application pool
Import-Module WebAdministration
Restart-WebAppPool -Name "WeFixAppPool"
Write-Host "Application pool restarted" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "URL Rewrite Rules Added!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost" -ForegroundColor White
Write-Host "  API Proxy: http://localhost/api/graphql -> http://localhost:4000/graphql" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure your backend is running on port 4000" -ForegroundColor White
Write-Host "  2. Test the API at: http://localhost/api/graphql" -ForegroundColor White
Write-Host "  3. Test the frontend at: http://localhost" -ForegroundColor White
Write-Host ""

