#!/bin/bash
# Auto-install for OpenCode
# AI agent can run this itself

set -e

echo "📦 Installing centralized-memory-client for OpenCode..."

# Install globally so any skill can import it
npm install -g centralized-memory-client

# Create skill directory if not exists
mkdir -p ~/.opencode/skills/core/hub-memory

# Copy the package files
cp -r "$(dirname "$0")/../hub-memory/"* ~/.opencode/skills/core/hub-memory/ 2>/dev/null || true

echo "✅ OpenCode hub-memory skill installed!"

echo ""
echo "Usage: Load skill 'hub-memory' → Use client functions"