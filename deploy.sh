#!/bin/bash

# Deployment script for MacSteel Next.js app
# Run this on your Digital Ocean droplet

set -e

echo "🚀 Starting MacSteel deployment..."

# Navigate to project directory
cd /path/to/macsteel  # Update this path

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build the application
echo "🔨 Building application..."
npm run build

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker-compose down || true

# Build and start new container
echo "🐳 Building and starting Docker container..."
docker-compose up -d --build

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful! App is running on port 3001"
    echo "🌐 Access your app at: http://your-domain.com/macsteel"
else
    echo "❌ Deployment failed! Check logs with: docker-compose logs"
    exit 1
fi

echo "🎉 Deployment complete!"
