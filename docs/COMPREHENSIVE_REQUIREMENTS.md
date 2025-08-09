# Aurora - Project Requirements Document

> **Status**: Phase 2 - Application Development
> **Last Updated**: January 2025
> **Current Phase**: Building CMS, Web, and API applications

---

## 1. Project Overview

Aurora is a service-focused business website platform built entirely with open-source technologies. The system provides service businesses with powerful tools for showcasing services, managing customer inquiries, generating leads, and converting visitors into customers while maintaining minimal operational costs.

**Mission**: Build a modern, conversion-optimized service business website using only open-source technologies with minimal hosting costs, designed for lead generation and customer acquisition.

**Key Differentiators:**
- 100% open-source technology stack
- Lead generation and conversion optimization
- Service business focused features
- Cost-effective self-hosting (~$35-45/month)
- No vendor lock-in
- Monorepo architecture for scalability

---

## 2. Current Development Status

### ✅ Phase 1 Complete: Foundation (Weeks 1-4)
- [x] Monorepo structure with Turborepo
- [x] TypeScript configuration with strict mode
- [x] ESLint and Prettier setup with import alias enforcement
- [x] Core packages: ui, core, config, analytics, search, database
- [x] Import alias policy: `@workspace/*` for shared, `@web/*`, `@cms/*`, `@api/*` for apps
- [x] Build system working for all packages
- [x] Database schema design with Prisma
- [x] Search integration structure with MeiliSearch

### 🔄 Phase 2 In Progress: Application Development (Weeks 5-8)
- [ ] CMS application with NextAuth.js authentication
- [ ] Public website with ISR and responsive design
- [ ] API application with GraphQL and REST endpoints
- [ ] Database integration (replace mock implementations)
- [ ] Search functionality (replace mock implementations)

---

## 3. Technical Architecture

### 3.1 Monorepo Structure
```
aurora/
├── apps/
│   ├── web/                    # Public website (Next.js 15 SSG/ISR)
│   ├── cms/                    # Admin interface (Next.js 15 App Router)
│   └── api/                    # BFF API (GraphQL + REST)
├── packages/
│   ├── ui/                     # shadcn/ui component library ✅
│   ├── core/                   # Business logic, types, schemas ✅
│   ├── database/               # Prisma schema + client ✅
│   ├── auth/                   # NextAuth.js + RBAC helpers
│   ├── search/                 # MeiliSearch client ✅
│   ├── analytics/              # Plausible Analytics wrappers ✅
│   └── config/                 # Shared configs ✅
└── docs/                       # Technical documentation
```

### 3.2 Technology Stack

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

## 4. Feature Requirements

### 4.1 User Roles & Permissions

| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Admin | Direct database setup | Full system access, user management, content approval |
| Editor | Admin invitation | Content creation, editing, publishing |
| Author | Admin invitation | Content creation, draft management |
| Viewer | Public registration | Read-only access to published content |

### 4.2 Core Features

#### CMS Application (apps/cms)
- **Authentication**: NextAuth.js with email/password and OAuth
- **Dashboard**: Overview of leads, content, and analytics
- **Content Management**: CRUD operations for services, posts, projects
- **Lead Management**: View, update, and track customer inquiries
- **User Management**: Admin can invite and manage users
- **Media Management**: Upload and organize images and documents

#### Public Website (apps/web)
- **Homepage**: Hero section, service highlights, testimonials
- **Services**: Detailed service pages with pricing and booking
- **Portfolio**: Project gallery and case studies
- **Blog**: SEO-optimized content for lead generation
- **Contact**: Multi-step forms with reCAPTCHA
- **Search**: Site-wide search functionality

#### API Application (apps/api)
- **GraphQL**: Type-safe API for complex queries
- **REST**: Simple endpoints for forms and public data
- **Authentication**: JWT tokens and session management
- **Rate Limiting**: Protect against abuse
- **Validation**: Zod schemas for all inputs

### 4.3 Lead Generation Features

#### Contact Forms
- Multi-step forms with progress indicators
- Service-specific inquiry forms
- Emergency service request forms
- Quote request with file uploads
- reCAPTCHA v3 integration

#### Lead Management
- Lead scoring and qualification
- Source attribution (website, phone, referral)
- Status tracking (new, contacted, qualified, won, lost)
- Activity logging (calls, emails, meetings)
- Follow-up reminders and automation

#### Conversion Optimization
- A/B testing for forms and CTAs
- Conversion funnel analytics
- Lead source performance tracking
- ROI reporting and metrics

---

## 5. Database Schema

### Core Models (Implemented in @workspace/database)

```prisma
// User management
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        Role     @default(EDITOR)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  services    Service[]
  leads       Lead[]
  posts       Post[]
  projects    Project[]
}

// Service portfolio
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
  
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  leads       Lead[]
}

// Lead management
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
  
  serviceId       String?
  service         Service?   @relation(fields: [serviceId], references: [id])
  activities      LeadActivity[]
}

// Customer showcase
model Testimonial {
  id            String   @id @default(cuid())
  content       String
  clientName    String
  clientCompany String?
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
  
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
}
```

---

## 6. Current Phase Requirements

### Phase 2: Application Development (Weeks 5-8)

#### Week 5: CMS Application ⏳ CURRENT
**Deliverables:**
- [ ] Create `apps/cms` with Next.js 15 App Router
- [ ] Implement NextAuth.js authentication
- [ ] Create admin dashboard layout
- [ ] Implement user management interface
- [ ] Connect to @workspace/database package

**Acceptance Criteria:**
- CMS app builds without errors
- Authentication flow works (login/logout)
- Dashboard displays basic metrics
- User can create/edit/delete content
- All imports follow alias policy (`@cms/*` for local, `@workspace/*` for shared)

#### Week 6: Web Application
**Deliverables:**
- [ ] Create `apps/web` with Next.js 15 SSG/ISR
- [ ] Implement homepage with hero section
- [ ] Create service showcase pages
- [ ] Implement responsive design
- [ ] Connect to API for content

**Acceptance Criteria:**
- Website builds and deploys successfully
- Homepage loads in <2 seconds
- Mobile responsive (95+ Lighthouse score)
- SEO optimized (90+ Lighthouse score)
- All imports follow alias policy (`@web/*` for local, `@workspace/*` for shared)

#### Week 7: API Development
**Deliverables:**
- [ ] Create `apps/api` with GraphQL and REST
- [ ] Implement authentication middleware
- [ ] Create CRUD endpoints for all models
- [ ] Add rate limiting and validation
- [ ] Connect to database and search

**Acceptance Criteria:**
- API responds to all defined endpoints
- Authentication works with JWT tokens
- Rate limiting prevents abuse
- All inputs validated with Zod schemas
- Database operations work (no more mocks)

#### Week 8: Integration & Testing
**Deliverables:**
- [ ] Connect CMS to API
- [ ] Connect website to API
- [ ] Replace all mock implementations
- [ ] End-to-end testing
- [ ] Performance optimization

**Acceptance Criteria:**
- All applications work together
- No mock implementations remain
- Search functionality works with MeiliSearch
- Database operations are real
- Build time <30 seconds for full monorepo

---

## 7. Critical Issues to Address

### 🚨 High Priority
1. **Empty Apps**: Create actual applications in apps/ directory
2. **Mock Implementations**: Replace mocked database and search calls
3. **Authentication**: Implement NextAuth.js across all apps
4. **Database Integration**: Connect Prisma to real PostgreSQL
5. **Search Integration**: Connect MeiliSearch to real instance

### ⚠️ Medium Priority
1. **Testing Suite**: Add comprehensive testing
2. **Documentation**: Update API documentation
3. **Performance**: Optimize build and runtime performance
4. **Security**: Implement rate limiting and validation
5. **Monitoring**: Add error tracking and analytics

---

## 8. Success Metrics

### Technical Metrics
- [ ] All packages build successfully (100%)
- [ ] All applications start without errors
- [ ] TypeScript strict mode compliance (100%)
- [ ] ESLint rule compliance (100%)
- [ ] Import alias policy compliance (100%)
- [ ] Build time <30 seconds
- [ ] Test coverage >80%

### Business Metrics
- [ ] Homepage loads in <2 seconds
- [ ] Mobile responsiveness score >95%
- [ ] SEO score >90%
- [ ] Lead conversion rate >15%
- [ ] Uptime >99.9%

---

## 9. Next Steps

### Immediate Actions (This Week)
1. Create CMS application structure
2. Implement basic authentication
3. Create admin dashboard layout
4. Connect to database package
5. Test build and deployment

### Short Term (Next 2 Weeks)
1. Create Web application
2. Create API application
3. Replace mock implementations
4. Implement core CRUD operations
5. Add basic testing

### Medium Term (Next Month)
1. Complete lead generation features
2. Add search functionality
3. Implement analytics
4. Performance optimization
5. Security hardening

This document serves as the current requirements and should be updated as development progresses.