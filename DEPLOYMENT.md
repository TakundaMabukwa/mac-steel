# MacSteel Next.js App - Digital Ocean Deployment Guide

This guide explains how to deploy the MacSteel Next.js application on a Digital Ocean droplet alongside another Next.js project.

## 🏗️ Architecture Overview

- **Existing Next.js App**: Runs on port 3000 (root domain)
- **MacSteel App**: Runs on port 3001 (accessible at `/macsteel` subpath)
- **Nginx**: Reverse proxy routing traffic between apps
- **Docker**: Containerized deployment for easy management

## 📋 Prerequisites

- Digital Ocean droplet with Ubuntu/Debian
- Docker and Docker Compose installed
- Nginx installed
- Git access to your repository
- Domain name pointing to your droplet

## 🚀 Deployment Steps

### 1. Clone and Setup Project

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone the repository
git clone https://github.com/your-username/macsteel.git
cd macsteel

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (set to `https://your-domain.com/macsteel`)

### 3. Build and Deploy with Docker

```bash
# Build and start the container
docker-compose up -d --build

# Check if it's running
docker-compose ps
```

### 4. Configure Nginx

```bash
# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/macsteel

# Create a symbolic link
sudo ln -s /etc/nginx/sites-available/macsteel /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Update Your Main Nginx Configuration

If you already have an existing Next.js app running, you'll need to modify your current nginx configuration to include the routing for the MacSteel app.

Add this location block to your existing server configuration:

```nginx
# Route to MacSteel app
location /macsteel {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Rewrite URLs to remove /macsteel prefix
    rewrite ^/macsteel/(.*) /$1 break;
}
```

## 🔄 Automated Deployment

Use the provided deployment script for future updates:

```bash
# Make it executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🌐 Access Your App

- **Main App**: `http://your-domain.com/` (existing Next.js app)
- **MacSteel App**: `http://your-domain.com/macsteel`

## 📊 Monitoring and Logs

```bash
# View container logs
docker-compose logs -f

# Check container status
docker-compose ps

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are not used by other services
2. **Permission issues**: Check Docker and file permissions
3. **Nginx errors**: Verify configuration syntax with `sudo nginx -t`

### Health Checks

```bash
# Check if app is responding
curl http://localhost:3001/health

# Check nginx routing
curl -H "Host: your-domain.com" http://localhost/macsteel
```

## 🔒 Security Considerations

- Use HTTPS with Let's Encrypt certificates
- Configure firewall rules appropriately
- Keep Docker images updated
- Monitor logs for suspicious activity

## 📈 Scaling Considerations

- Use Docker volumes for persistent data
- Consider using Docker Swarm or Kubernetes for multiple instances
- Implement load balancing if needed
- Monitor resource usage with `docker stats`

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify nginx configuration: `sudo nginx -t`
3. Ensure all environment variables are set correctly
4. Check if ports are available: `netstat -tlnp`
