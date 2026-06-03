# Deployment Guide

This guide covers deploying PresentationAI to various hosting platforms.

## Deployment Options

### 1. Vercel (Recommended for Frontend)

**Deploy Next.js frontend to Vercel:**

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project" and import your GitHub repository
4. Select the `client` directory as the root
5. Add environment variables
6. Click "Deploy"

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2. Heroku/Railway (Backend)

**Deploy Express server to Heroku:**

1. Install Heroku CLI
2. Create a Heroku app:
```bash
heroku create your-app-name
```

3. Add environment variables:
```bash
heroku config:set DATABASE_URL=your_database_url
heroku config:set SUPABASE_KEY=your_supabase_key
```

4. Deploy:
```bash
git push heroku main
```

**For Railway:**

1. Connect your GitHub repository
2. Select the server directory
3. Add environment variables in Railway dashboard
4. Railway will automatically deploy on push

### 3. Docker Deployment

**Create Dockerfile for backend:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**Create docker-compose.yml:**

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}

  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000
```

## Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `SUPABASE_KEY` - Supabase API key
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Server port (default: 5000)

### Frontend (.env.local)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_APP_URL` - Frontend app URL

## Pre-deployment Checklist

- [ ] Run tests: `npm test`
- [ ] Run linting: `npm run lint`
- [ ] Build production bundle: `npm run build`
- [ ] Test production build locally
- [ ] Review environment variables
- [ ] Update database migrations (if applicable)
- [ ] Backup production database
- [ ] Set up monitoring/logging

## Database Setup (Supabase)

1. Create Supabase project
2. Create necessary tables in SQL editor
3. Set up Row Level Security policies
4. Copy connection string to environment variables

## Monitoring & Logging

### Frontend (Vercel)
- Automatic error tracking
- Performance monitoring in Vercel Dashboard

### Backend
- Use Winston or Bunyan for logging
- Monitor with services like:
  - Sentry (error tracking)
  - DataDog (performance monitoring)
  - LogRocket (session replay)

## Performance Optimization

1. **Frontend:**
   - Enable static generation with ISR
   - Use next/image for optimization
   - Enable compression in next.config.ts

2. **Backend:**
   - Use connection pooling
   - Cache frequently accessed data
   - Implement rate limiting
   - Use CDN for static assets

## Security Best Practices

1. **General:**
   - Never commit `.env` files
   - Use HTTPS everywhere
   - Keep dependencies updated
   - Use strong, unique passwords

2. **Backend:**
   - Validate all inputs with Zod
   - Implement CORS properly
   - Use environment variables for secrets
   - Add rate limiting and throttling

3. **Frontend:**
   - Sanitize user input
   - Use Content Security Policy headers
   - Keep React/Next.js updated
   - Use secure HTTPS URLs only

## Rollback Procedure

### Vercel
1. Go to Deployments in Vercel Dashboard
2. Click on previous stable deployment
3. Click "Redeploy"

### Heroku/Railway
1. Check deployment history
2. Redeploy previous version or rollback

```bash
# For Heroku
heroku releases
heroku releases:rollback v99
```

## Scaling

### Horizontal Scaling
- Use load balancer (AWS ELB, Cloudflare)
- Deploy multiple backend instances
- Use CDN for static assets

### Vertical Scaling
- Upgrade server resources
- Upgrade database plan
- Increase memory/CPU allocation

## Troubleshooting Deployments

### 502 Bad Gateway
- Check backend server is running
- Verify environment variables
- Check database connection

### Build Failures
- Check Node version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

### Database Connection Issues
- Verify connection string format
- Check database credentials
- Ensure database is accessible from server
- Check firewall rules

## Continuous Integration/Deployment (CI/CD)

Use GitHub Actions for automated deployment:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        run: |
          # Your deployment script here
```
