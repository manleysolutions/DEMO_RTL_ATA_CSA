#!/usr/bin/env bash
set -euo pipefail

echo "📦 Installing backend deps..."
npm ci --omit=dev || npm install

echo "🖼️ Using static assets from /public (no frontend build step)."
# If you later move back to Vite, replace the line above with your build/copy steps.
