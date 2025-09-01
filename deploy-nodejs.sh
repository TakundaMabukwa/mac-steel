#!/bin/bash

# MacSteel App Deployment Script for Digital Ocean (Node.js)
# This script deploys the app using Node.js directly (no Docker)

set -e  # Exit on any error

echo "🚀 Starting MacSteel App Deployment (Node.js)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended version is 18 or higher."
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

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

# Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Build the application
print_status "Building the application..."
npm run build -- --no-lint

# Check if build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed. .next directory not found."
    exit 1
fi

# Stop any existing PM2 process
print_status "Stopping existing processes..."
pm2 stop macsteel-app 2>/dev/null || true
pm2 delete macsteel-app 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start npm --name "macsteel-app" -- start:prod

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

print_status "✅ MacSteel app is running successfully!"
print_status "Application status:"
pm2 status

# Test the application
print_status "Testing application health..."
sleep 5

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_status "✅ Application is responding on port 3001"
else
    print_warning "⚠️  Application may not be fully ready yet. Check logs with: pm2 logs macsteel-app"
fi

print_status "📋 Deployment Summary:"
print_status "  - App URL: http://your-domain.com/macsteel/"
print_status "  - Direct URL: http://your-domain.com:3001/"
print_status "  - PM2 Process: macsteel-app"
print_status "  - Port: 3001"

print_status "📝 Next Steps:"
print_status "  1. Configure nginx to route /macsteel to port 3001"
print_status "  2. Set up SSL certificate with certbot"
print_status "  3. Configure firewall rules"

print_status "🔧 Useful PM2 Commands:"
print_status "  - View logs: pm2 logs macsteel-app"
print_status "  - Restart app: pm2 restart macsteel-app"
print_status "  - Stop app: pm2 stop macsteel-app"
print_status "  - Monitor: pm2 monit"

print_status "🎉 Deployment completed successfully!"
