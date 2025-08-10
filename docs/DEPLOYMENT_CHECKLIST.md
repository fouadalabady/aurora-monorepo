# Deployment Checklist - Aurora Monorepo

Comprehensive checklist for safe and reliable deployments of the Aurora HVAC Services platform.

## 📋 Pre-Deployment Checklist

### Code Quality & Testing

- [ ] **All tests pass locally**
  ```bash
  pnpm run test
  pnpm run test:e2e
  ```

- [ ] **Linting and type checking pass**
  ```bash
  pnpm run lint
  pnpm run type-check
  ```

- [ ] **Build succeeds for all applications**
  ```bash
  pnpm exec turbo run build
  ```

- [ ] **Import patterns are valid**
  ```bash
  # Check for forbidden @/* imports
  grep -r "from '@/" apps/ packages/ --include="*.ts" --include="*.tsx" || echo "✅ No forbidden imports found"
  ```

### Environment & Configuration

- [ ] **Environment variables are set in Vercel dashboard**
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `MEILISEARCH_HOST`
  - `MEILISEARCH_API_KEY`
  - Additional app-specific variables

- [ ] **Database migrations are ready**
  ```bash
  pnpm --filter=@workspace/database run db:migrate:status
  ```

- [ ] **Configuration files are updated**
  - `vercel.json` in each app
  - `next.config.js` transpilePackages
  - Environment validation schemas

### Security Review

- [ ] **No secrets in code**
  ```bash
  git log --oneline -10 | xargs git show | grep -i "password\|secret\|key" || echo "✅ No secrets found in recent commits"
  ```

- [ ] **Security headers configured**
  - CSP policies updated
  - CORS settings reviewed
  - Authentication flows tested

- [ ] **Dependencies audited**
  ```bash
  pnpm audit --audit-level moderate
  ```

### Performance & Monitoring

- [ ] **Bundle size analyzed**
  ```bash
  ANALYZE=true pnpm --filter=web run build
  ```

- [ ] **Performance metrics baseline established**
  - Core Web Vitals targets defined
  - Database query performance reviewed
  - API response times measured

- [ ] **Monitoring configured**
  - Error tracking enabled
  - Analytics implementation verified
  - Uptime monitoring active

## 🚀 Deployment Process

### Staging Deployment

- [ ] **Create feature branch**
  ```bash
  git checkout -b release/v1.x.x
  ```

- [ ] **Merge to develop branch**
  ```bash
  git checkout develop
  git merge release/v1.x.x
  git push origin develop
  ```

- [ ] **Verify staging deployment**
  - [ ] CI/CD pipeline completes successfully
  - [ ] Staging environment accessible
  - [ ] Critical user flows tested
  - [ ] Database migrations applied

- [ ] **Staging smoke tests**
  - [ ] Homepage loads correctly
  - [ ] Authentication works
  - [ ] Contact forms submit
  - [ ] Admin panel accessible
  - [ ] Search functionality works

### Production Deployment

- [ ] **Final pre-production checks**
  - [ ] Staging tests completed
  - [ ] Stakeholder approval received
  - [ ] Deployment window scheduled
  - [ ] Rollback plan prepared

- [ ] **Merge to main branch**
  ```bash
  git checkout main
  git merge develop
  git push origin main
  ```

- [ ] **Monitor deployment progress**
  - [ ] Vercel build logs reviewed
  - [ ] Deployment completes successfully
  - [ ] DNS propagation verified
  - [ ] SSL certificates valid

## ✅ Post-Deployment Verification

### Immediate Checks (0-5 minutes)

- [ ] **Application accessibility**
  - [ ] Homepage loads (< 3 seconds)
  - [ ] All main pages accessible
  - [ ] Mobile responsiveness verified
  - [ ] Cross-browser compatibility checked

- [ ] **Core functionality**
  - [ ] User authentication works
  - [ ] Contact forms submit successfully
  - [ ] Search returns results
  - [ ] Navigation functions properly

- [ ] **API endpoints**
  - [ ] Health check endpoint responds
  - [ ] Authentication endpoints work
  - [ ] Data retrieval endpoints function
  - [ ] Error handling works correctly

### Extended Monitoring (5-30 minutes)

- [ ] **Performance metrics**
  - [ ] Core Web Vitals within targets
    - LCP < 2.5s
    - FID < 100ms
    - CLS < 0.1
  - [ ] API response times normal
  - [ ] Database query performance acceptable

- [ ] **Error monitoring**
  - [ ] No critical errors in logs
  - [ ] Error rates within normal range
  - [ ] No 5xx server errors
  - [ ] Client-side errors minimal

- [ ] **User experience**
  - [ ] Forms submit without errors
  - [ ] Images load correctly
  - [ ] Animations and interactions smooth
  - [ ] Accessibility features working

### Long-term Monitoring (30+ minutes)

- [ ] **Analytics verification**
  - [ ] Page views tracking correctly
  - [ ] User interactions recorded
  - [ ] Conversion funnels functioning
  - [ ] Custom events firing

- [ ] **SEO and indexing**
  - [ ] Meta tags correct
  - [ ] Structured data valid
  - [ ] Sitemap accessible
  - [ ] Robots.txt correct

- [ ] **Integration testing**
  - [ ] Third-party services connected
  - [ ] Email notifications working
  - [ ] Payment processing functional
  - [ ] CRM integration active

## 🔄 Rollback Procedures

### When to Rollback

- Critical functionality broken
- Security vulnerability exposed
- Performance degradation > 50%
- Data integrity issues
- User-reported critical bugs

### Rollback Steps

1. **Immediate rollback via Vercel**
   ```bash
   # Via Vercel CLI
   vercel rollback [deployment-url]
   
   # Or via dashboard
   # 1. Go to Vercel dashboard
   # 2. Select project
   # 3. Go to Deployments
   # 4. Find last known good deployment
   # 5. Click "Promote to Production"
   ```

2. **Database rollback (if needed)**
   ```bash
   # Rollback migrations
   pnpm --filter=@workspace/database run db:migrate:rollback
   
   # Or restore from backup
   psql $DATABASE_URL < backup_file.sql
   ```

3. **Verify rollback success**
   - [ ] Application loads correctly
   - [ ] Core functionality works
   - [ ] No data loss occurred
   - [ ] Users can access the site

4. **Post-rollback actions**
   - [ ] Notify stakeholders
   - [ ] Document the issue
   - [ ] Plan fix implementation
   - [ ] Schedule next deployment

## 📊 Deployment Metrics

### Success Criteria

- **Deployment Time**: < 10 minutes
- **Zero Downtime**: No service interruption
- **Error Rate**: < 0.1% increase post-deployment
- **Performance**: No degradation > 10%
- **User Experience**: No critical user flows broken

### Key Performance Indicators

- **Mean Time to Deploy (MTTD)**: Target < 15 minutes
- **Deployment Frequency**: Target 2-3 times per week
- **Change Failure Rate**: Target < 5%
- **Mean Time to Recovery (MTTR)**: Target < 30 minutes

## 🔧 Troubleshooting Common Issues

### Build Failures

**Issue**: TypeScript compilation errors
```bash
# Solution: Check type definitions
pnpm run type-check
# Fix type errors and retry
```

**Issue**: Missing environment variables
```bash
# Solution: Verify environment configuration
echo $DATABASE_URL
# Set missing variables in Vercel dashboard
```

### Runtime Errors

**Issue**: Database connection failures
```bash
# Solution: Check database connectivity
pnpm --filter=@workspace/database run db:test
# Verify DATABASE_URL format and credentials
```

**Issue**: Authentication not working
```bash
# Solution: Verify NextAuth configuration
# Check NEXTAUTH_SECRET and NEXTAUTH_URL
# Ensure OAuth providers are configured
```

### Performance Issues

**Issue**: Slow page load times
```bash
# Solution: Analyze bundle size
ANALYZE=true pnpm --filter=web run build
# Optimize large dependencies
# Implement code splitting
```

**Issue**: High server response times
```bash
# Solution: Check database query performance
# Review API endpoint efficiency
# Consider caching strategies
```

## 📞 Emergency Contacts

### Escalation Matrix

1. **Level 1**: Development Team Lead
2. **Level 2**: DevOps Engineer
3. **Level 3**: Technical Director
4. **Level 4**: CTO/Technical Stakeholder

### Communication Channels

- **Slack**: #aurora-deployments
- **Email**: dev-team@aurora-hvac.com
- **Phone**: Emergency contact list

## 📝 Deployment Log Template

```markdown
# Deployment Log - [Date] - v[Version]

## Pre-Deployment
- [ ] All checklist items completed
- [ ] Stakeholder approval: [Name/Date]
- [ ] Deployment window: [Start Time - End Time]

## Deployment
- **Start Time**: [HH:MM UTC]
- **End Time**: [HH:MM UTC]
- **Duration**: [X minutes]
- **Deployed By**: [Name]
- **Git Commit**: [SHA]

## Verification
- [ ] Immediate checks completed
- [ ] Extended monitoring completed
- [ ] Performance metrics within targets
- [ ] No critical errors detected

## Issues
- [List any issues encountered and resolutions]

## Notes
- [Additional notes or observations]
```

---

**Last Updated**: $(date +%Y-%m-%d)  
**Version**: 1.0.0  
**Maintainer**: Aurora DevOps Team

[← Back to DevOps Guide](./DEVOPS_GUIDE.md) | [← Back to Documentation Index](./README.md)