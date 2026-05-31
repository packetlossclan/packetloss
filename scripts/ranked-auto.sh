#!/usr/bin/env bash
set -euo pipefail

RESPONSE=$(curl -sf \
  -X POST \
  -H "Authorization: Bearer ${INTERNAL_API_TOKEN}" \
  -H "Content-Type: application/json" \
  http://127.0.0.1:3050/api/internal/ranked/auto-create)

echo "[ranked-auto] $RESPONSE"
