#!/bin/bash

# MacSteel App Deployment Script for Digital Ocean
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting MacSteel App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Creating from example..."
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.local
        print_warning "Please edit .env.local with your actual environment variables before continuing."
        print_warning "Required variables:"
        print_warning "  - NEXT_PUBLIC_SUPABASE_URL"
        print_warning "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        print_warning "  - SUPABASE_SERVICE_ROLE_KEY"
        exit 1
    else
        print_error "env.production.example file not found. Please create .env.local manually."
        exit 1
    fi
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Pull latest changes (if this is a git repository)
if [ -d ".git" ]; then
    print_status "Pulling latest changes from git..."
    git pull origin main || print_warning "Could not pull from git. Continuing with current code..."
fi

# Build and start the application
print_status "Building and starting the application..."
docker-compose up -d --build

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 10

# Check if the container is running
if docker ps | grep -q "macsteel-nextjs"; then
    print_status "✅ MacSteel app is running successfully!"
    print_status "Container status:"
    docker ps | grep "macsteel-nextjs"
    
    # Test the application
    print_status "Testing application health..."
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        print_status "✅ Application is responding on port 3001"
    else
        print_warning "⚠️  Application may not be fully ready yet. Check logs with: docker-compose logs -f"
    fi
    
    print_status "📋 Deployment Summary:"
    print_status "  - App URL: http://your-domain.com/macsteel/"
    print_status "  - Direct URL: http://your-domain.com:3001/"
    print_status "  - Container: macsteel-nextjs"
    print_status "  - Port: 3001"
    
    print_status "📝 Next Steps:"
    print_status "  1. Configure nginx to route /macsteel to port 3001"
    print_status "  2. Set up SSL certificate with certbot"
    print_status "  3. Configure firewall rules"
    
else
    print_error "❌ Failed to start the application. Check logs:"
    docker-compose logs
    exit 1
fi

print_status "🎉 Deployment completed successfully!"