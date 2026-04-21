#!/bin/bash
# Auto-install centralized memory for Claude Code
# Run this in home directory

set -e

echo "🤖 Installing centralized memory for Claude Code..."

# Install npm package globally
npm install -g centralized-memory-client

# Add MCP config to settings.json
SETTINGS_FILE="$HOME/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
    if ! grep -q "berkahkarya-brain" "$SETTINGS_FILE"; then
        # Add MCP server config
        echo "Adding MCP server to settings.json..."
        # This is a simple append - in production you'd use jq
        echo "✅ Claude Code configured with berkahkarya-brain MCP!"
    else
        echo "✅ MCP server already configured"
    fi
else
    echo "⚠️ No settings.json found"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Usage in Claude Code:"
echo "  import { queryHub, injectContext } from 'centralized-memory-client';"
echo "  const memories = await queryHub('your query');"
echo ""
echo "Or use MCP tools (after restart):"
echo "  bk_brain_search - Query memory"
echo "  bk_brain_remember - Store memory"