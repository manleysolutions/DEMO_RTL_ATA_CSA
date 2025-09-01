#!/bin/bash
set -e

echo "📦 Installing backend deps..."
npm install --prefix backend || true

echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📂 Moving frontend dist into /public..."
rm -rf public/*
cp -r frontend/dist/* public/

echo "✅ Build complete"
