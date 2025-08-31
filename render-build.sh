#!/bin/bash
# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
npm install
