#!/usr/bin/env bash
set -e

echo "📦 Installing backend deps..."
npm install

echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📂 Moving frontend dist into backend public..."
mkdir -p public
cp -r frontend/dist/* public/

echo "✅ Build complete"
