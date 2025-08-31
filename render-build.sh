#!/bin/bash
set -e

echo "📦 Building USPS Dashboard..."

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend
npm install

echo "✅ Build complete"
