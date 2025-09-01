#!/bin/bash

# Digital Ocean Server Setup Script for MacSteel App
# Run this script on your Digital Ocean droplet to set up the environment

set -e

echo "🔧 Setting up Digital Ocean server for MacSteel app..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Update system packages
print_header "Updating system packages..."
apt update && apt upgrade -y

# Install Docker
print_header "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    print_status "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_header "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose is already installed"
fi

# Install Nginx
print_header "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    print_status "Nginx installed and started"
else
    print_status "Nginx is already installed"
fi

# Install Certbot for SSL
print_header "Installing Certbot for SSL..."
apt install certbot python3-certbot-nginx -y
print_status "Certbot installed successfully"

# Configure firewall
print_header "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000  # For your existing app
ufw allow 3001  # For MacSteel app
print_status "Firewall configured"

# Create apps directory
print_header "Creating application directory..."
mkdir -p /opt/apps
cd /opt/apps
print_status "Application directory created at /opt/apps"

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_header "Installing Git..."
    apt install git -y
    print_status "Git installed"
fi

# Create a systemd service for auto-start (optional)
print_header "Creating systemd service for auto-start..."
cat > /etc/systemd/system/macsteel.service << EOF
[Unit]
Description=MacSteel Next.js App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/apps/macsteel
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable macsteel.service
print_status "Systemd service created and enabled"

# Create log rotation for Docker containers
print_header "Setting up log rotation..."
cat > /etc/logrotate.d/docker-containers << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
print_status "Log rotation configured"

# Create monitoring script
print_header "Creating monitoring script..."
cat > /opt/apps/monitor-apps.sh << 'EOF'
#!/bin/bash

# Simple monitoring script for both apps
echo "=== App Status Check $(date) ==="

# Check if port 3000 is responding (your existing app)
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Existing app (port 3000): Running"
else
    echo "❌ Existing app (port 3000): Not responding"
fi

# Check if port 3001 is responding (MacSteel app)
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ MacSteel app (port 3001): Running"
else
    echo "❌ MacSteel app (port 3001): Not responding"
fi

# Check Docker containers
echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check disk space
echo "=== Disk Usage ==="
df -h /opt/apps

echo "=== Memory Usage ==="
free -h
EOF

chmod +x /opt/apps/monitor-apps.sh
print_status "Monitoring script created at /opt/apps/monitor-apps.sh"

# Create backup script
print_header "Creating backup script..."
cat > /opt/apps/backup-apps.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Creating backup for $DATE..."

# Backup environment files
if [ -d "/opt/apps/macsteel" ]; then
    cp /opt/apps/macsteel/.env.local $BACKUP_DIR/macsteel_env_$DATE 2>/dev/null || true
fi

# Backup nginx configuration
cp /etc/nginx/sites-available/* $BACKUP_DIR/ 2>/dev/null || true

# Backup docker-compose files
find /opt/apps -name "docker-compose.yml" -exec cp {} $BACKUP_DIR/ \;

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/apps/backup-apps.sh
print_status "Backup script created at /opt/apps/backup-apps.sh"

# Set up cron jobs
print_header "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/apps/backup-apps.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/apps/monitor-apps.sh >> /var/log/app-monitor.log") | crontab -
print_status "Cron jobs configured"

print_status "🎉 Server setup completed successfully!"
print_status ""
print_status "📋 Next Steps:"
print_status "1. Clone your MacSteel repository:"
print_status "   cd /opt/apps && git clone https://github.com/your-username/macsteel.git"
print_status ""
print_status "2. Configure environment variables:"
print_status "   cd /opt/apps/macsteel && cp env.production.example .env.local"
print_status "   nano .env.local  # Edit with your actual values"
print_status ""
print_status "3. Deploy the application:"
print_status "   cd /opt/apps/macsteel && ./deploy.sh"
print_status ""
print_status "4. Configure nginx routing:"
print_status "   cp nginx.conf /etc/nginx/sites-available/macsteel"
print_status "   ln -s /etc/nginx/sites-available/macsteel /etc/nginx/sites-enabled/"
print_status "   nginx -t && systemctl restart nginx"
print_status ""
print_status "5. Set up SSL (optional but recommended):"
print_status "   certbot --nginx -d your-domain.com"
print_status ""
print_status "📊 Useful Commands:"
print_status "  - Monitor apps: /opt/apps/monitor-apps.sh"
print_status "  - Backup apps: /opt/apps/backup-apps.sh"
print_status "  - View logs: docker-compose logs -f"
print_status "  - Restart MacSteel: systemctl restart macsteel"
print_status ""
print_warning "⚠️  Please reboot the server to ensure all changes take effect:"
print_warning "   sudo reboot"
