# Digital Ocean Deployment Guide for MacSteel App

This guide will help you deploy the MacSteel Next.js application on Digital Ocean alongside your existing Next.js app running on port 3000.

## Prerequisites

- Digital Ocean Droplet with Docker and Docker Compose installed
- Existing Next.js app running on port 3000
- Domain name configured (optional but recommended)
- GitHub repository access

## Step 1: Clone the Repository

```bash
# SSH into your Digital Ocean droplet
ssh root@your-droplet-ip

# Navigate to your apps directory
cd /opt/apps

# Clone the MacSteel repository
git clone https://github.com/your-username/macsteel.git
cd macsteel
```

## Step 2: Environment Configuration

Create your environment file:

```bash
# Copy the example environment file
cp env.production.example .env.local

# Edit the environment file
nano .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapbox Configuration (if needed in future)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# App Configuration
NODE_ENV=production
PORT=3001
```

## Step 3: Build and Deploy with Docker

```bash
# Build and start the application
docker-compose up -d --build

# Check if the container is running
docker ps

# View logs
docker-compose logs -f macsteel-app
```

## Step 4: Configure Nginx (if not already done)

If you don't have nginx configured yet, install it:

```bash
# Install nginx
apt update
apt install nginx

# Create nginx configuration
nano /etc/nginx/sites-available/macsteel
```

Use the provided `nginx.conf` file content, but update the domain name:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    # Route to your existing Next.js app (port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Route to MacSteel app (port 3001)
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

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable the site:

```bash
# Enable the site
ln -s /etc/nginx/sites-available/macsteel /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

## Step 5: SSL Configuration (Recommended)

Install Certbot for SSL:

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Firewall Configuration

```bash
# Allow HTTP and HTTPS
ufw allow 'Nginx Full'

# Allow SSH
ufw allow ssh

# Enable firewall
ufw enable
```

## Step 7: Monitoring and Maintenance

### Health Checks

```bash
# Check if both apps are running
curl http://localhost:3000/health  # Your existing app
curl http://localhost:3001/health  # MacSteel app

# Check nginx status
systemctl status nginx

# Check Docker containers
docker ps
```

### Logs

```bash
# View MacSteel app logs
docker-compose logs -f macsteel-app

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Updates

```bash
# Update the application
cd /opt/apps/macsteel
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Access URLs

- **Your existing app**: `http://your-domain.com/` (port 3000)
- **MacSteel app**: `http://your-domain.com/macsteel/` (port 3001)
- **Direct MacSteel access**: `http://your-domain.com:3001/` (if you want direct access)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure no other service is using port 3001
2. **Docker issues**: Check `docker ps` and `docker-compose logs`
3. **Nginx issues**: Check `nginx -t` and `/var/log/nginx/error.log`
4. **Environment variables**: Verify all required env vars are set

### Useful Commands

```bash
# Restart MacSteel app
docker-compose restart macsteel-app

# Rebuild MacSteel app
docker-compose up -d --build macsteel-app

# Check container resources
docker stats macsteel-nextjs

# Access container shell
docker exec -it macsteel-nextjs sh
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to git
2. **Firewall**: Only open necessary ports
3. **SSL**: Always use HTTPS in production
4. **Updates**: Keep Docker and system packages updated
5. **Backups**: Regular backups of your data and configuration

## Performance Optimization

1. **Docker Resources**: Monitor and adjust container resources
2. **Nginx Caching**: Consider adding caching headers
3. **CDN**: Use a CDN for static assets
4. **Database**: Optimize Supabase queries and indexes

## Support

If you encounter issues:
1. Check the logs first
2. Verify environment variables
3. Test individual components (Docker, Nginx, etc.)
4. Check network connectivity and firewall rules
