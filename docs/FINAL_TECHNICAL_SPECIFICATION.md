# Aurora - Final Technical Specification & Development Plan

> **Status**: Active Development - Foundation Phase Complete
> **Last Updated**: January 2025
> **Mission**: Build a modern, conversion-optimized service business website using open-source technologies with minimal hosting costs

---

## 1. Executive Summary

Aurora is a service-focused business website platform built entirely with open-source technologies. The system provides service businesses with powerful tools for showcasing services, managing customer inquiries, generating leads, and converting visitors into customers while maintaining minimal operational costs.

**Key Differentiators:**
- 100% open-source technology stack
- Lead generation and conversion optimization
- Service business focused features
- Cost-effective self-hosting (~$35-45/month)
- No vendor lock-in
- Monorepo architecture for scalability

**Target Market**: Service-based businesses (HVAC, construction, consulting, maintenance, etc.) seeking a cost-effective, conversion-optimized website solution.

---

## 2. Architecture Overview

### 2.1 Monorepo Structure
```
aurora/
├── apps/
│   ├── web/                    # Public website (Next.js 15 SSG/ISR)
│   ├── cms/                    # Admin interface (Next.js 15 App Router)
│   └── api/                    # BFF API (GraphQL + REST)
├── packages/
│   ├── ui/                     # shadcn/ui component library
│   ├── core/                   # Business logic, types, schemas
│   ├── database/               # Prisma schema + client
│   ├── auth/                   # NextAuth.js + RBAC helpers
│   ├── search/                 # MeiliSearch client
│   ├── analytics/              # Plausible Analytics wrappers
│   └── config/                 # Shared configs (ESLint, TS, Tailwind)
├── docs/                       # Technical documentation
├── docker/                     # Development services
│   ├── meilisearch/            # Search engine
│   ├── plausible/              # Analytics
│   └── postgresql/             # Database
└── scripts/                    # Build scripts and utilities
```

### 2.2 Import & Scoping Policy (CRITICAL)
**Shared packages**: `@workspace/*` only
**App-local aliases**:
- Website: `@web/*` → `apps/web/src/*`
- CMS: `@cms/*` → `apps/cms/src/*`
- API: `@api/*` → `apps/api/src/*`

**FORBIDDEN**: `@/*` anywhere in the codebase

**Enforcement**: ESLint rules + CI alias guard + codemod for migration

### 2.3 Technology Stack

#### Core Framework
- **Next.js 15**: App Router, Server Components, ISR
- **TypeScript 5**: Strict mode for type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Open-source accessible components

#### Backend & Data
- **PostgreSQL 15**: Self-hosted open-source database
- **Prisma ORM**: Type-safe database client
- **NextAuth.js**: Open-source authentication
- **MeiliSearch**: Self-hosted search engine
- **Redis**: Caching and session storage

#### Development Tools
- **Turborepo**: Monorepo build system
- **pnpm**: Package manager
- **ESLint + Prettier**: Code quality
- **Husky**: Git hooks

---

## 3. Core Features

### 3.1 User Roles

| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Admin | Direct database setup | Full system access, user management, content approval |
| Editor | Admin invitation | Content creation, editing, publishing |
| Author | Admin invitation | Content creation, draft management |
| Viewer | Public registration | Read-only access to published content |

### 3.2 Feature Modules

#### Homepage
- Hero section with compelling value proposition
- Service highlights with conversion-focused CTAs
- Customer testimonials carousel
- Trust indicators and social proof

#### Services Portfolio
- Service categories and detailed pages
- Pricing tables and comparison
- Service booking forms
- Quote request system

#### Lead Generation
- Multi-step contact forms with reCAPTCHA
- Lead qualification and scoring
- Appointment scheduling
- Emergency service requests

#### Customer Showcase
- Testimonials with photos and ratings
- Case studies with before/after photos
- Project gallery with filtering
- Success metrics display

#### Content Management
- Rich text editor for service descriptions
- Blog system for SEO content
- Media management
- SEO optimization tools

#### Analytics Dashboard
- Lead tracking and conversion metrics
- Customer journey analytics
- Performance monitoring
- ROI reporting

---

## 4. Database Schema

### Core Models

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        Role     @default(EDITOR)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  services    Service[]
  leads       Lead[]
  posts       Post[]
  projects    Project[]
}

model Service {
  id          String      @id @default(cuid())
  title       String
  slug        String      @unique
  description String
  content     String?
  category    String
  priceType   PriceType
  price       Float?
  featured    Boolean     @default(false)
  status      Status      @default(DRAFT)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  leads       Lead[]
}

model Lead {
  id              String     @id @default(cuid())
  name            String
  email           String
  phone           String
  serviceType     String
  message         String?
  source          LeadSource @default(WEBSITE)
  status          LeadStatus @default(NEW)
  priority        Priority   @default(MEDIUM)
  estimatedValue  Float?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  // Relations
  serviceId       String?
  service         Service?   @relation(fields: [serviceId], references: [id])
  activities      LeadActivity[]
}

model LeadActivity {
  id          String           @id @default(cuid())
  type        ActivityType
  description String
  notes       String?
  metadata    Json?
  createdAt   DateTime         @default(now())
  
  // Relations
  leadId      String
  lead        Lead             @relation(fields: [leadId], references: [id])
}

model Testimonial {
  id            String   @id @default(cuid())
  content       String
  clientName    String
  clientCompany String?
  clientEmail   String
  rating        Int
  projectType   String?
  featured      Boolean  @default(false)
  status        Status   @default(PENDING)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Project {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String
  content     String?
  category    String
  location    String?
  completedAt DateTime?
  featured    Boolean   @default(false)
  status      Status    @default(DRAFT)
  images      String[]
  tags        String[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String?
  content     String
  featured    Boolean  @default(false)
  status      Status   @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
}

enum Role {
  ADMIN
  EDITOR
  AUTHOR
  VIEWER
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
  PENDING
}

enum PriceType {
  FIXED
  HOURLY
  QUOTE
}

enum LeadSource {
  WEBSITE
  PHONE
  EMAIL
  REFERRAL
  SOCIAL
  OTHER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  QUOTED
  WON
  LOST
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  QUOTE_SENT
}
```

---

## 5. Development Phases

### Phase 1: Foundation (Weeks 1-4) ✅ COMPLETE

#### Week 1: Project Setup ✅
- [x] Monorepo structure with Turborepo
- [x] TypeScript configuration
- [x] ESLint and Prettier setup
- [x] Package structure creation
- [x] Import alias policy enforcement

#### Week 2: Core Infrastructure ✅
- [x] Database schema design and setup
- [x] Core package development
- [x] Basic package structure
- [x] Search package with MeiliSearch integration

#### Week 3: Package Development ✅
- [x] UI package with shadcn/ui components
- [x] Core package with types and utilities
- [x] Config package with shared configurations
- [x] Analytics package structure

#### Week 4: Package Integration ✅
- [x] Database package with Prisma
- [x] Search package with mock implementations
- [x] Build system optimization
- [x] Error resolution and testing

### Phase 2: Application Development (Weeks 5-8) 🔄 IN PROGRESS

#### Week 5: CMS Application
- [ ] Create CMS app structure
- [ ] Authentication system with NextAuth.js
- [ ] Basic admin dashboard
- [ ] User management interface

#### Week 6: Web Application
- [ ] Create public website structure
- [ ] Homepage with hero section
- [ ] Service showcase pages
- [ ] Responsive design implementation

#### Week 7: API Development
- [ ] API app structure
- [ ] GraphQL and REST endpoints
- [ ] Lead management APIs
- [ ] Content management APIs

#### Week 8: Integration & Testing
- [ ] Connect CMS to database
- [ ] Connect website to API
- [ ] Search functionality integration
- [ ] End-to-end testing

### Phase 3: Content Management (Weeks 9-12)

#### Week 9: Rich Content Editor
- [ ] Tiptap editor integration
- [ ] Media upload and management
- [ ] Content versioning
- [ ] Draft/publish workflow

#### Week 10: Service Management
- [ ] Service portfolio creation
- [ ] Pricing management
- [ ] Category organization
- [ ] Service detail pages

#### Week 11: Lead Generation
- [ ] Contact form builder
- [ ] reCAPTCHA integration
- [ ] Lead capture system
- [ ] Email notifications

#### Week 12: Search & SEO
- [ ] MeiliSearch full integration
- [ ] SEO metadata management
- [ ] Sitemap generation
- [ ] Content optimization

### Phase 4: Customer Experience (Weeks 13-16)

#### Week 13: Public Website Enhancement
- [ ] Advanced homepage features
- [ ] Service showcase optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness

#### Week 14: Testimonials & Showcase
- [ ] Testimonial management system
- [ ] Project gallery
- [ ] Case study templates
- [ ] Rating and review system

#### Week 15: Lead Conversion
- [ ] Quote request forms
- [ ] Appointment booking
- [ ] Lead scoring system
- [ ] Follow-up automation

#### Week 16: Analytics Integration
- [ ] Plausible Analytics setup
- [ ] Conversion tracking
- [ ] Dashboard development
- [ ] Reporting features

### Phase 5: Optimization & Launch (Weeks 17-20)

#### Week 17: Performance Optimization
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle optimization
- [ ] Core Web Vitals optimization

#### Week 18: Security & Testing
- [ ] Security audit
- [ ] Rate limiting
- [ ] Input validation
- [ ] Comprehensive testing

#### Week 19: Documentation
- [ ] User documentation
- [ ] API documentation
- [ ] Deployment guides
- [ ] Maintenance procedures

#### Week 20: Production Deployment
- [ ] Production environment setup
- [ ] Monitoring and alerting
- [ ] Backup procedures
- [ ] Go-live checklist

---

## 6. Current Status & Next Steps

### ✅ Completed
- Monorepo structure with Turborepo
- Core packages (ui, core, config, analytics, search)
- Database package with Prisma schema
- Search package with MeiliSearch integration (mocked)
- Import alias policy and ESLint enforcement
- Build system working for all packages

### 🔄 In Progress
- Application development (web, cms, api)
- Database integration
- Authentication system

### 📋 Next Immediate Tasks
1. Create CMS application structure
2. Create Web application structure
3. Create API application structure
4. Implement authentication with NextAuth.js
5. Connect database to applications
6. Implement basic CRUD operations

### 🚨 Critical Issues to Address
1. Apps directories are currently empty - need to create actual applications
2. Database package needs real Prisma integration (currently mocked)
3. Search package needs real MeiliSearch integration (currently mocked)
4. Authentication system needs implementation
5. API endpoints need development

---

## 7. Technical Debt & Improvements

### Current Technical Debt
1. **Mock Implementations**: Search and database packages have mock implementations that need to be replaced with real functionality
2. **Missing Applications**: The apps directory structure exists but applications haven't been created
3. **Incomplete Integration**: Packages are built but not integrated with actual applications

### Planned Improvements
1. **Real Database Integration**: Replace mock Prisma calls with actual database operations
2. **MeiliSearch Integration**: Replace mock search with real MeiliSearch functionality
3. **Application Development**: Create functional CMS, Web, and API applications
4. **Authentication System**: Implement NextAuth.js across all applications
5. **Testing Suite**: Add comprehensive testing for all packages and applications

---

## 8. Success Metrics

### Technical Metrics
- Build time < 30 seconds for full monorepo
- Package build success rate: 100%
- TypeScript strict mode compliance: 100%
- ESLint rule compliance: 100%
- Test coverage > 80%

### Business Metrics
- Lead conversion rate > 15%
- Page load speed < 2 seconds
- Mobile responsiveness score > 95%
- SEO score > 90%
- Uptime > 99.9%

This specification serves as the single source of truth for the Aurora project development and should be updated as the project evolves.