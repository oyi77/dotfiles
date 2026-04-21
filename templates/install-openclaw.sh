#!/bin/bash
# Auto-install for OpenClaw
set -e

echo "📦 Installing for OpenClaw..."

# Add cron job for memory sync (runs every 15 min)
CRON_JOB='*/15 * * * * /home/openclaw/projects/berkahkarya-hub/scripts/sync_all_memories.sh >> /var/log/memory-sync.log 2>&1'

# Check if already exists
if crontab -l 2>/dev/null | grep -q "berkahkarya-hub"; then
    echo "✅ Cron job already exists"
else
    echo "$CRON_JOB" | crontab -
    echo "✅ Added cron job for memory sync"
fi

# Create client wrapper for OpenClaw's Python
mkdir -p ~/.openclaw/workspace/tools
cp -r "$(dirname "$0")/../hub-memory/client.py" ~/.openclaw/workspace/tools/centralized_memory_client.py 2>/dev/null || true

echo "✅ OpenClaw configured!"
echo ""
echo "Usage in OpenClaw:"
echo "  from workspace.tools.centralized_memory_client import query_hub, inject_context"