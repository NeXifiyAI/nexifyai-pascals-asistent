#!/bin/bash

# GitHub OAuth App Setup for Supermemory
# Using Vercel domain: https://nexifyai-pascals-asistent.vercel.app

echo "========================================"
echo "GitHub OAuth App Setup for Supermemory"
echo "========================================"
echo ""
echo "Opening GitHub OAuth App creation page..."
echo ""
echo "Please fill in these values:"
echo ""
echo "  Application name: NeXifyAI Supermemory Brain"
echo "  Homepage URL: https://nexifyai-pascals-asistent.vercel.app"
echo "  Authorization callback URL: https://api.supermemory.ai/v3/connections/auth/callback/github"
echo "  Application description: NeXifyAI Brain - AI Memory System powered by Supermemory"
echo ""
echo "Opening GitHub in browser..."

# Open GitHub OAuth Apps page
cmd.exe /c start https://github.com/settings/applications/new

echo ""
echo "After creating the app, you will see:"
echo "  1. Client ID (displayed immediately)"
echo "  2. Click 'Generate a new client secret' to get the secret"
echo ""
echo "Copy both values - we'll save them to .env automatically"
