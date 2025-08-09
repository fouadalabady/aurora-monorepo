# Aurora Monorepo

> Open-source service-focused business website platform built with Next.js 15, TypeScript, Prisma, and modern web technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 15+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fouadalabady/aurora-monorepo.git
   cd aurora-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start Docker services**
   ```bash
   pnpm docker:up
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   pnpm db:generate
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

## 📁 Project Structure

```
aurora/
├── apps/
│   ├── web/          # Main website (Next.js 15)
│   ├── cms/          # Admin dashboard (Next.js 15)
│   └── api/          # Backend API (Node.js)
├── packages/
│   ├── ui/           # Shared UI components (shadcn/ui)
│   ├── database/     # Prisma schema & utilities
│   ├── auth/         # NextAuth.js configuration
│   ├── search/       # MeiliSearch integration
│   ├── analytics/    # Analytics utilities
│   ├── config/       # Shared configuration
│   └── core/         # Core utilities
├── docs/             # Documentation
├── docker/           # Docker configurations
└── scripts/          # Build & deployment scripts
```

## 🛠 Technology Stack

- **Frontend**: Next.js 15, TypeScript 5, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, PostgreSQL 15, Prisma ORM
- **Authentication**: NextAuth.js
- **Search**: MeiliSearch
- **Caching**: Redis
- **Build System**: Turborepo, pnpm
- **Deployment**: Vercel, Docker

## 📦 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across all packages
- `pnpm test` - Run tests
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm docker:up` - Start Docker services
- `pnpm docker:down` - Stop Docker services

## 🔧 Import Alias Policy

**Allowed:**
- `@workspace/*` - Shared packages
- `@web/*` - Website app-local imports
- `@cms/*` - CMS app-local imports
- `@api/*` - API app-local imports

**Forbidden:**
- `@/*` - Not allowed in any app
- Cross-app imports (e.g., `@web/*` in CMS)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `MEILISEARCH_HOST`
   - `MEILISEARCH_API_KEY`
   - `REDIS_URL`

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Docker

```bash
docker-compose up --build
```

## 📋 Development Status

- ✅ **Phase 1**: Foundation & Core Packages
- 🚧 **Phase 2**: Application Development
  - ✅ Web App (Partial)
  - 🚧 CMS App (In Progress)
  - ⏳ API App (Planned)
- ⏳ **Phase 3**: Integration & Testing
- ⏳ **Phase 4**: Production Deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](./docs/)
- [GitHub Repository](https://github.com/fouadalabady/aurora-monorepo)
- [Live Demo](https://aurora-monorepo.vercel.app) (Coming Soon)

---

**Aurora** - Building the future of service-focused business websites. 🌟