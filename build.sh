#!/bin/bash
set -e

echo "Starting build process..."
cd frontend

echo "Cleaning previous builds..."
rm -rf node_modules package-lock.json dist

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Verifying @vitejs/plugin-react installation..."
npm list @vitejs/plugin-react

echo "Running build..."
npm run build

echo "Build completed successfully!"
