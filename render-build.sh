#!/bin/bash
set -e

echo "📂 Building USPS Dashboard frontend..."

# Move into frontend
cd frontend

# Install deps
echo "📦 Installing frontend deps..."
npm install --legacy-peer-deps

# Build frontend
echo "⚡ Running Vite build..."
npm run build

# Copy build output into /public
echo "📂 Moving dist to /public..."
cd ..
rm -rf public/*
cp -r frontend/dist/* public/

echo "✅ Build complete!"
