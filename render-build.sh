#!/usr/bin/env bash
set -euo pipefail

# Build frontend
echo "📂 Building USPS Dashboard frontend..."
pushd "$(dirname "$0")/frontend" >/dev/null

echo "📦 Installing frontend deps..."
npm ci || npm install

echo "⚡ Running Vite build..."
npm run build

popd >/dev/null

# Copy to public
echo "📂 Moving dist to /public..."
rm -rf public
mkdir -p public
cp -r frontend/dist/* public/

# Install server dependencies (only once, no recursion)
echo "📦 Installing server deps..."
npm ci || npm install

echo "✅ Build complete!"
