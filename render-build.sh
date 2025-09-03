#!/usr/bin/env bash
set -euo pipefail

# Build frontend and place into /public for the Node server to serve
echo "📂 Building USPS Dashboard frontend..."
pushd "$(dirname "$0")/frontend" >/dev/null

echo "📦 Installing frontend deps..."
npm ci || npm install

echo "⚡ Running Vite build..."
npm run build

popd >/dev/null

echo "📂 Moving dist to /public..."
rm -rf public
mkdir -p public
cp -r frontend/dist/* public/

echo "📦 Installing server deps..."
npm install --omit=dev

echo "✅ Build complete!"
