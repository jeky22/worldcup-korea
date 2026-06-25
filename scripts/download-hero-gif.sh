#!/usr/bin/env bash
# 축구 경기장 응원 분위기 GIF (U.S. Soccer / GIPHY)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/hero/bg.gif"
mkdir -p "$(dirname "$OUT")"
curl -L --fail --max-time 90 -A "Mozilla/5.0" \
  -o "$OUT" \
  "https://i.giphy.com/qb9Aa18ELQJyt50FVI.gif"
echo "Saved $(ls -lh "$OUT" | awk '{print $5}') -> public/hero/bg.gif"
