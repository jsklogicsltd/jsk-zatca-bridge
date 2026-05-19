# Deployment Guide

This guide covers deploying ZATCA Bridge to production environments.

---

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Production database is set up and accessible
- [ ] ZATCA API credentials are valid for production
- [ ] SSL certificate is configured
- [ ] Domain DNS is properly configured
- [ ] Error monitoring (Sentry) is set up
- [ ] Email service (SMTP) is configured
- [ ] Backup strategy is in place

---

## 🏗 Build Process

### 1. Run Production Build Locally

Test the production build on your local machine first:

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Build for production
npm run build
```

Check for any build warnings or errors. The build output will show:
- Bundle sizes for each route
- Total bundle size
- Performance recommendations

### 2. Verify Build Output

```bash
# Start production server locally
npm run start
```

Navigate to `http://localhost:3000` and test critical workflows:
- Authentication (sign in, sign out)
- Dashboard loading
- Invoice creation
- Navigation between pages
- Responsive design

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Click "Deploy"

#### Environment Variables on Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from `.env.local.example`
4. Set appropriate values for production
5. Redeploy for changes to take effect

---

### Option 2: Docker

Deploy using Docker containers.

#### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment variables
COPY .env.production .env.production

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build Docker image
docker build -t zatca-bridge .

# Run container
docker run -p 3000:3000 \
  --env-file .env.production \
  zatca-bridge
```

---

### Option 3: Traditional VPS (Ubuntu)

Deploy to a traditional VPS or dedicated server.

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt-get install -y nginx
```

#### Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/jsk-logics-zatca-bridge.git
cd jsk-logics-zatca-bridge

# Install dependencies
npm install

# Create production environment file
cp .env.local.example .env.production
nano .env.production  # Edit with your production values

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "zatca-bridge" -- start
pm2 save
pm2 startup  # Follow the instructions
```

#### Configure Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Environment Configuration

### Production Environment Variables

Create `.env.production` with the following:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Authentication
NEXTAUTH_SECRET=[generate-secure-secret]
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# ZATCA API (Production)
ZATCA_API_URL=https://api.zatca.gov.sa
ZATCA_API_KEY=[your-production-key]
ZATCA_CSID=[your-production-csid]

# Email
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=[secure-password]

# Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Security
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32
```

---

## 📊 Monitoring & Maintenance

### Error Monitoring with Sentry

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new Next.js project
3. Copy the DSN to `SENTRY_DSN` environment variable
4. Install Sentry SDK:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Application Monitoring

Monitor with PM2:

```bash
pm2 status               # Check status
pm2 logs zatca-bridge    # View logs
pm2 restart zatca-bridge # Restart app
pm2 monitoring             # Real-time monitoring
```

### Database Backups

Set up automated backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
pg_dump -U username database_name > /backups/zatca_$(date +%Y%m%d).sql
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🔄 Updates & Rollbacks

### Deploy Updates

```bash
# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart application
pm2 restart zatca-bridge
```

### Rollback

```bash
# Checkout previous version
git checkout [previous-commit-hash]

# Rebuild
npm install
npm run build

# Restart
pm2 restart zatca-bridge
```

---

## 🧪 Post-Deployment Testing

After deployment, verify:

### Critical Paths
- [ ] Homepage loads correctly
- [ ] Sign in/sign up works
- [ ] Dashboard displays data
- [ ] Invoice creation works
- [ ] ZATCA API integration functions
- [ ] Email notifications send
- [ ] Error pages display correctly (404, 500)

### Performance
- [ ] Run Lighthouse audit (target 90+ performance)
- [ ] Check page load times
- [ ] Verify image optimization
- [ ] Test on slow 3G connection

### Security
- [ ] SSL certificate is valid
- [ ] HTTPS redirects work
- [ ] Environment variables are not exposed
- [ ] API endpoints require authentication
- [ ] CORS is properly configured

---

## 🆘 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### Application Won't Start

**Check PM2 logs**:
```bash
pm2 logs zatca-bridge --lines 100
```

**Common issues**:
- Missing environment variables
- Database connection failure
- Port already in use

### Slow Performance

1. Enable production mode compression in `next.config.js`
2. Use a CDN for static assets
3. Enable database query caching
4. Optimize images (use WebP format)
5. Enable Gzip compression in Nginx

---

## 📞 Support

For deployment issues:
- Email: devops@zatcabridge.com
- Docs: https://docs.zatcabridge.com/deployment
- GitHub Issues: https://github.com/your-org/jsk-logics-zatca-bridge/issues

---

**Last Updated**: January 2026
