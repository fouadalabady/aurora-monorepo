# DevOps Guide - Aurora Monorepo

Comprehensive guide for deployment, CI/CD, monitoring, and operational procedures for the Aurora HVAC Services monorepo.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Management](#environment-management)
3. [Deployment Pipeline](#deployment-pipeline)
4. [CI/CD Configuration](#cicd-configuration)
5. [Monitoring & Observability](#monitoring--observability)
6. [Security & Secrets Management](#security--secrets-management)
7. [Troubleshooting](#troubleshooting)
8. [Operational Procedures](#operational-procedures)

---

## Architecture Overview

### Monorepo Structure

```
aurora/
├── apps/
│   ├── web/           # Public website (Next.js 15)
│   ├── cms/           # Admin interface (Next.js 15)
│   └── api/           # Backend API (GraphQL + REST)
├── packages/
│   ├── ui/            # Shared UI components (shadcn/ui)
│   ├── database/      # Prisma schema & client
│   ├── auth/          # Authentication logic
│   ├── config/        # Shared configuration
│   ├── core/          # Core utilities
│   ├── search/        # MeiliSearch integration
│   └── analytics/     # Analytics integration
├── docker/            # Docker configurations
├── docs/              # Documentation
└── Scripts/           # Utility scripts
```

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Build System**: Turborepo with pnpm workspaces
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Search**: MeiliSearch
- **Analytics**: Plausible Analytics
- **Deployment**: Vercel
- **Containerization**: Docker & Docker Compose

---

## Environment Management

### Environment Variables Structure

#### Core Configuration

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"  # For migrations

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-make-it-long-and-random"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Search & Analytics

```bash
# MeiliSearch Configuration
MEILISEARCH_HOST="https://your-meilisearch-instance.com"
MEILISEARCH_API_KEY="your-meilisearch-api-key"

# Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="your-domain.com"
NEXT_PUBLIC_PLAUSIBLE_HOST="https://plausible.io"
```

#### Email & Communication

```bash
# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@aurora-hvac.com"
```

### Environment Validation

The monorepo includes comprehensive environment validation in `packages/config/src/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('Invalid database URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  // ... additional validations
})

export const env = envSchema.parse(process.env)
```

### Environment Files

- **`.env.example`**: Template with all required variables
- **`.env.local`**: Local development (gitignored)
- **`.env.production`**: Production overrides (gitignored)
- **`.env.test`**: Testing environment (gitignored)

---

## Deployment Pipeline

### Vercel Configuration

#### Web Application (`apps/web/vercel.json`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "name": "web",
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm exec turbo run build --filter=web",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next"
}
```

#### Key Configuration Details

1. **Build Command**: Uses Turborepo to build only the web app and its dependencies
2. **Install Command**: Runs from monorepo root to install all dependencies
3. **Output Directory**: Points to Next.js build output

### Build Process Flow

```mermaid
graph TD
    A[Git Push] --> B[Vercel Webhook]
    B --> C[Install Dependencies]
    C --> D[Run Turborepo Build]
    D --> E[Build Packages]
    E --> F[Build Web App]
    F --> G[Deploy to Vercel]
    G --> H[Update DNS]
```

### Turborepo Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Next.js Configuration (`apps/web/next.config.js`)

```javascript
const nextConfig = {
  experimental: {
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack']
      }
    }
  },
  
  // Transpile workspace packages
  transpilePackages: [
    '@workspace/ui',
    '@workspace/core',
    '@workspace/database',
    '@workspace/auth',
    '@workspace/search',
    '@workspace/analytics',
    '@workspace/config'
  ],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@web': require('path').resolve(__dirname, 'src')
    }
    return config
  }
}

module.exports = nextConfig
```

---

## CI/CD Configuration

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linting
        run: pnpm run lint
        
      - name: Run type checking
        run: pnpm run type-check
        
      - name: Run tests
        run: pnpm run test
        
      - name: Build packages
        run: pnpm run build
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Package Scripts (`package.json`)

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "clean": "turbo clean",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "check": "pnpm run lint && pnpm run type-check && pnpm run test"
  }
}
```

---

## Monitoring & Observability

### Application Monitoring

#### Plausible Analytics Integration

```typescript
// packages/analytics/src/client.ts
import { PlausibleProvider } from 'next-plausible'

const analyticsConfig = {
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'localhost',
  apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST,
  trackLocalhost: process.env.NODE_ENV === 'development'
}

export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props })
  }
}
```

#### Error Monitoring with Sentry (Optional)

```typescript
// packages/config/src/monitoring.ts
import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  })
}
```

### Performance Monitoring

#### Web Vitals Tracking

```typescript
// apps/web/src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('Web Vitals', {
      props: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating
      }
    })
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

### Database Monitoring

#### Prisma Logging Configuration

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## Security & Secrets Management

### Environment Variables Security

1. **Never commit secrets**: All `.env*` files are gitignored
2. **Use strong secrets**: Minimum 32 characters for auth secrets
3. **Rotate regularly**: Update secrets periodically
4. **Principle of least privilege**: Only grant necessary permissions

### Vercel Environment Variables

Set these in your Vercel dashboard:

```bash
# Production Environment Variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
MEILISEARCH_HOST=https://your-meilisearch.com
MEILISEARCH_API_KEY=your-api-key
```

### Security Headers

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  )
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: `pnpm build --filter=web` fails with "unknown option"

**Solution**: Use Turborepo command instead:
```bash
pnpm exec turbo run build --filter=web
```

**Root Cause**: `--filter` is a pnpm/Turborepo option, not a Next.js option.

#### 2. Module Resolution Issues

**Problem**: Cannot resolve `@workspace/*` packages

**Solution**: Ensure `transpilePackages` is configured in `next.config.js`:
```javascript
transpilePackages: [
  '@workspace/ui',
  '@workspace/core',
  // ... other packages
]
```

#### 3. Environment Variable Issues

**Problem**: Environment variables not loading

**Solution**: Check loading order:
1. `.env.local` (highest priority)
2. `.env.production` / `.env.development`
3. `.env`

#### 4. Database Connection Issues

**Problem**: Prisma cannot connect to database

**Solution**: Verify connection string format:
```bash
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### Debug Commands

```bash
# Check environment variables
pnpm exec turbo run env:check

# Verbose build output
pnpm exec turbo run build --filter=web --verbose

# Check package dependencies
pnpm list --depth=0

# Verify workspace structure
pnpm list --recursive

# Database connection test
pnpm --filter=@workspace/database run db:test
```

### Log Analysis

#### Vercel Build Logs

1. Access Vercel dashboard
2. Navigate to project → Deployments
3. Click on failed deployment
4. Review build logs for errors

#### Local Development Logs

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Prisma query logging
DEBUG=prisma:query pnpm dev

# Next.js build analysis
ANALYZE=true pnpm build
```

---

## Operational Procedures

### Deployment Checklist

#### Pre-Deployment

- [ ] Run full test suite: `pnpm run check`
- [ ] Verify environment variables are set
- [ ] Check database migrations are applied
- [ ] Review security headers and CSP
- [ ] Test build locally: `pnpm run build`

#### Deployment

- [ ] Merge to main branch
- [ ] Monitor Vercel deployment
- [ ] Verify deployment success
- [ ] Test critical user flows
- [ ] Check analytics and monitoring

#### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all services are healthy
- [ ] Update documentation if needed

### Database Operations

#### Migrations

```bash
# Generate migration
pnpm --filter=@workspace/database run db:migrate

# Apply migrations
pnpm --filter=@workspace/database run db:push

# Reset database (development only)
pnpm --filter=@workspace/database run db:reset
```

#### Backup Procedures

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Monitoring Procedures

#### Daily Checks

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Verify backup completion
- [ ] Monitor resource usage

#### Weekly Reviews

- [ ] Analyze user analytics
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Performance optimization review

### Incident Response

#### Severity Levels

1. **Critical**: Site down, data loss
2. **High**: Major feature broken
3. **Medium**: Minor feature issues
4. **Low**: Cosmetic issues

#### Response Procedures

1. **Assess impact and severity**
2. **Communicate with stakeholders**
3. **Implement immediate fix or rollback**
4. **Monitor for resolution**
5. **Conduct post-incident review**

### Rollback Procedures

#### Vercel Rollback

1. Access Vercel dashboard
2. Navigate to Deployments
3. Find last known good deployment
4. Click "Promote to Production"

#### Database Rollback

```bash
# Rollback last migration
pnpm --filter=@workspace/database run db:migrate:rollback

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

---

## Performance Optimization

### Build Optimization

#### Turborepo Caching

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "cache": true
    }
  }
}
```

#### Next.js Optimization

```javascript
// next.config.js
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@workspace/ui']
  }
}
```

### Runtime Optimization

#### Database Query Optimization

```typescript
// Use connection pooling
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
    }
  }
})

// Optimize queries with includes
const posts = await db.post.findMany({
  include: {
    author: {
      select: { name: true, email: true }
    }
  },
  take: 10
})
```

#### Caching Strategy

```typescript
// Next.js caching
export const revalidate = 3600 // 1 hour

// API route caching
export async function GET() {
  const data = await fetchData()
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

---

## Conclusion

This DevOps guide provides comprehensive coverage of the Aurora monorepo's operational aspects. Regular review and updates of these procedures ensure smooth operations and rapid incident resolution.

For additional support:
- Review the [Getting Started Guide](./GETTING_STARTED.md)
- Check the [Technical Specification](./FINAL_TECHNICAL_SPECIFICATION.md)
- Consult the [Troubleshooting Section](#troubleshooting)

**Last Updated**: $(date +%Y-%m-%d)
**Version**: 1.0.0
**Maintainer**: Aurora Development Team