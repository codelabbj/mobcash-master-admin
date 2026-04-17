# Multi-Remote Push Script (PowerShell)
# This script pushes the current branch to all configured remotes

# Get the current branch name
$CURRENT_BRANCH = git rev-parse --abbrev-ref HEAD

Write-Host "Current branch: $CURRENT_BRANCH" -ForegroundColor Cyan
Write-Host "Pushing to all remotes..." -ForegroundColor Cyan
Write-Host ""

# List of remotes to push to
$REMOTES = @("1xstore", "icash", "origin", "slater", "supercash", "zefast")

# Push to each remote
foreach ($REMOTE in $REMOTES) {
    Write-Host "Pushing to $REMOTE..." -ForegroundColor Yellow
    git push $REMOTE $CURRENT_BRANCH
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Pushed to $REMOTE" -ForegroundColor Green
    } else {
        Write-Host "[FAILED] Could not push to $REMOTE" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Push operation completed!" -ForegroundColor Cyan
