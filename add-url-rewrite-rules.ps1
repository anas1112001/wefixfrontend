# Script to add URL Rewrite rules after URL Rewrite Module is installed
# Run this AFTER installing URL Rewrite Module

$webConfigPath = "D:\Projects\WeFix\Jehad\Cursor\Frontend\build\web.config"

if (-not (Test-Path $webConfigPath)) {
    Write-Host "ERROR: web.config not found at $webConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "Adding URL Rewrite rules to web.config..." -ForegroundColor Cyan

# Read current web.config
[xml]$config = Get-Content $webConfigPath

# Check if rewrite section already exists
$rewriteNode = $config.configuration.'system.webServer'.rewrite

if ($rewriteNode -eq $null) {
    # Create rewrite section
    $rewriteNode = $config.CreateElement("rewrite")
    $config.configuration.'system.webServer'.AppendChild($rewriteNode) | Out-Null
}

# Check if rules already exist
if ($rewriteNode.rules -eq $null) {
    $rulesNode = $config.CreateElement("rules")
    $rewriteNode.AppendChild($rulesNode) | Out-Null
} else {
    $rulesNode = $rewriteNode.rules
}

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
$config.Save($webConfigPath)

Write-Host "URL Rewrite rules added successfully!" -ForegroundColor Green
Write-Host "Restarting application pool..." -ForegroundColor Cyan

Import-Module WebAdministration
Restart-WebAppPool -Name "WeFixAppPool"

Write-Host "Done! Your SPA routing should now work." -ForegroundColor Green

