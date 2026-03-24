#!/usr/bin/env bash
# 釋放本機 3000 埠（macOS / Linux）
set -e
PIDS=$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null || true)
if [ -z "$PIDS" ]; then
  echo "Port 3000 is already free."
  exit 0
fi
echo "Stopping PIDs on :3000: $PIDS"
kill -9 $PIDS 2>/dev/null || true
echo "Done. Verify: lsof -iTCP:3000 -sTCP:LISTEN"
