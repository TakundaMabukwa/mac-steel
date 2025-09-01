# Digital Ocean Deployment Guide for MacSteel App (Node.js)

This guide will help you deploy the MacSteel Next.js application on Digital Ocean using Node.js directly (no Docker) alongside your existing Next.js app running on port 3000.

## Prerequisites

- Digital Ocean Droplet with Node.js and npm already installed
- Existing Next.js app running on port 3000
- Domain name configured (optional but recommended)
- GitHub repository access

## Step 1: Server Setup

Run the simplified server setup script:

```bash
# SSH into your Digital Ocean droplet
ssh root@your-droplet-ip

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-username/macsteel/main/server-setup-nodejs.sh | bash
```

This will install:
- PM2 (Process Manager for Node.js)
- Nginx
- Certbot for SSL
- Firewall configuration
- Monitoring and backup scripts

## Step 2: Clone the Repository

```bash
# Navigate to your apps directory
cd /opt/apps

# Clone the MacSteel repository
git clone https://github.com/your-username/macsteel.git
cd macsteel
```

## Step 3: Environment Configuration

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

# App Configuration
NODE_ENV=production
PORT=3001
```

## Step 4: Deploy the Application

```bash
# Run the deployment script
./deploy-nodejs.sh
```

This will:
- Install dependencies
- Build the application
- Start the app with PM2
- Configure auto-start on boot

## Step 5: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx-nodejs.conf /etc/nginx/sites-available/macsteel

# Enable the site
sudo ln -s /etc/nginx/sites-available/macsteel /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 6: SSL Configuration (Recommended)

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Access URLs

- **Your existing app**: `http://your-domain.com/` (port 3000)
- **MacSteel app**: `http://your-domain.com/macsteel/` (port 3001)
- **Direct MacSteel access**: `http://your-domain.com:3001/` (if you want direct access)

## PM2 Management Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs macsteel-app

# Restart the app
pm2 restart macsteel-app

# Stop the app
pm2 stop macsteel-app

# Start the app
pm2 start macsteel-app

# Monitor resources
pm2 monit

# Save current process list
pm2 save

# Reload all processes
pm2 reload all
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check if both apps are running
curl http://localhost:3000/health  # Your existing app
curl http://localhost:3001/health  # MacSteel app

# Use the monitoring script
/opt/apps/monitor-apps.sh
```

### Logs

```bash
# View MacSteel app logs
pm2 logs macsteel-app

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Updates

```bash
# Update the application
cd /opt/apps/macsteel
git pull origin main
./deploy-nodejs.sh
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure no other service is using port 3001
2. **PM2 issues**: Check `pm2 status` and `pm2 logs macsteel-app`
3. **Nginx issues**: Check `sudo nginx -t` and `/var/log/nginx/error.log`
4. **Environment variables**: Verify all required env vars are set

### Useful Commands

```bash
# Check PM2 processes
pm2 status

# Check system resources
pm2 monit

# Check Node.js processes
ps aux | grep node

# Check port usage
netstat -tlnp | grep :3001

# Restart MacSteel app
pm2 restart macsteel-app

# View real-time logs
pm2 logs macsteel-app --lines 100
```

## Advantages of Node.js Deployment

1. **Faster startup**: No Docker overhead
2. **Easier debugging**: Direct access to Node.js processes
3. **Lower resource usage**: No container overhead
4. **Simpler updates**: Just git pull and restart
5. **Better integration**: Works seamlessly with existing Node.js setup

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to git
2. **Firewall**: Only open necessary ports
3. **SSL**: Always use HTTPS in production
4. **Updates**: Keep Node.js and system packages updated
5. **PM2**: Use PM2's built-in security features

## Performance Optimization

1. **PM2 Clustering**: Use `pm2 start -i max` for multiple instances
2. **Nginx Caching**: Consider adding caching headers
3. **CDN**: Use a CDN for static assets
4. **Database**: Optimize Supabase queries and indexes

## Support

If you encounter issues:
1. Check PM2 logs first: `pm2 logs macsteel-app`
2. Verify environment variables
3. Test individual components (PM2, Nginx, etc.)
4. Check network connectivity and firewall rules
