#!/usr/bin/env bash
# --- render-build.sh ---
# Build pipeline for Render.com deployment

set -o errexit

echo "📦 Installing backend deps..."
npm install

echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📂 Moving frontend dist into backend public..."
rm -rf ./public
mkdir -p ./public
cp -r ./frontend/dist/* ./public/

echo "✅ Build complete"
