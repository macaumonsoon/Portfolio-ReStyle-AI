#!/usr/bin/env bash
# 釋放本機指定 TCP 埠（macOS / Linux）。用法: bash scripts/free-port.sh 3010
set -e
PORT="${1:?用法: bash scripts/free-port.sh <埠號>}"
PIDS=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [ -z "$PIDS" ]; then
  echo "Port $PORT is already free."
  exit 0
fi
echo "Stopping PIDs on :$PORT: $PIDS"
kill -9 $PIDS 2>/dev/null || true
echo "Done."
