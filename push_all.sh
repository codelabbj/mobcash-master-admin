#!/bin/bash

# Multi-Remote Push Script
# This script pushes the current branch to all configured remotes

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "Pushing to all remotes..."
echo ""

# List of remotes to push to
REMOTES=("1xstore", "icash", "origin", "slater", "supercash", "master")

# Push to each remote
for REMOTE in "${REMOTES[@]}"; do
    echo "Pushing to $REMOTE..."
    git push "$REMOTE" "$CURRENT_BRANCH"
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully pushed to $REMOTE"
    else
        echo "✗ Failed to push to $REMOTE"
    fi
    echo ""
done

echo "Push operation completed!"
