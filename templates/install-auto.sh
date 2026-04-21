#!/bin/bash
# Auto-install centralized memory - AUTO-DETECT which AI agent
# Run this and it will figure out which agent you're using!

set -e

detect_agent() {
    if [ -n "$CLAUDE" ] || [ -n "$CLAUDE_API_KEY" ]; then
        echo "claudecode"
    elif [ -n "$OPC" ] || [ -f "$HOME/.opencode/package.json" ]; then
        echo "opencode"
    elif [ -n "$OPENCLAW_HOME" ] || [ -f "$HOME/.openclaw/CLAUDE.md" ] || [ -d "$HOME/.openclaw/workspace" ]; then
        echo "openclaw"
    elif [ -d "$HOME/.openfang" ] || [ -f "$HOME/.openfang/config.json" ]; then
        echo "openfang"
    elif [ -d "$HOME/.hermes" ] || [ -f "$HOME/.hermes/config.json" ]; then
        echo "hermes"
    elif command -v oga &> /dev/null; then
        echo "hermes-agent"
    elif [ -f "$HOME/.anthropic/config.json" ]; then
        echo "anthropic"
    elif [ -f "$HOME/.cursor/config.json" ]; then
        echo "cursor"
    elif [ -n "$OPENAI_API_KEY" ]; then
        echo "openai"
    else
        echo "unknown"
    fi
}

install_claudecode() {
    echo "🤖 Installing for Claude Code..."
    npm install -g centralized-memory-client
    echo "✅ Claude Code configured!"
}

install_opencode() {
    echo "📦 Installing for OpenCode..."
    npm install -g centralized-memory-client
    mkdir -p ~/.opencode/skills/core/hub-memory
    # Skill already in place if dotfiles linked
    echo "✅ OpenCode configured!"
}

install_openclaw() {
    echo "🐙 Installing for OpenClaw..."
    # Add cron sync
    CRON_JOB='*/15 * * * * /home/openclaw/projects/berkahkarya-hub/scripts/sync_all_memories.sh >> /var/log/memory-sync.log 2>&1'
    if ! crontab -l 2>/dev/null | grep -q "berkahkarya-hub"; then
        echo "$CRON_JOB" | crontab -
    fi
    mkdir -p ~/.openclaw/workspace/tools
    echo "✅ OpenClaw configured!"
}

install_openfang() {
    echo "🐺 Installing for OpenFang..."
    npm install -g centralized-memory-client
    mkdir -p ~/.openfang/plugins
    echo "✅ OpenFang configured!"
}

install_hermes() {
    echo "🦊 Installing for Hermes Agent..."
    npm install -g centralized-memory-client
    mkdir -p ~/.hermes/plugins
    echo "✅ Hermes Agent configured!"
}

# Main
AGENT=$(detect_agent)
echo "🔍 Detected AI agent: $AGENT"

case "$AGENT" in
    claudecode)
        install_claudecode
        ;;
    opencode)
        install_opencode
        ;;
    openclaw)
        install_openclaw
        ;;
    openfang)
        install_openfang
        ;;
    hermes|hermes-agent)
        install_hermes
        ;;
    *)
        echo "⚠️ Unknown agent. Installing generically..."
        npm install -g centralized-memory-client
        ;;
esac

echo ""
echo "🎉 Done! Use: queryHub(), injectContext() from memory client"