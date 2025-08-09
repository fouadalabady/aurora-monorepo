# Aurora Monorepo - Getting Started Guide

> **Ready to build?** This guide will get you from zero to a working Aurora monorepo with all packages building successfully.

---

## Prerequisites Check

```bash
# Check Node.js version (need 20+)
node --version

# Check pnpm (need 9+)
pnpm --version

# Check Docker (for development services)
docker --version

# If missing, install:
# Node.js: https://nodejs.org/
# pnpm: npm install -g pnpm
# Docker: https://docker.com/get-started
```

## Development Setup

1. **Clone the Repository** or use the existing structure
2. **Install Dependencies**: `pnpm install`
3. **Start Development Services**: `docker-compose up -d` (PostgreSQL, MeiliSearch, Redis)
4. **Run Database Migrations**: `pnpm db:migrate`

---

## Current Project Status

### ✅ Completed Setup
The Aurora monorepo is already initialized with:
- Turborepo monorepo structure
- All core packages built and working
- TypeScript configuration with strict mode
- ESLint with import alias enforcement
- Package structure following best practices

### 🔄 Current Phase: Application Development
We're currently in Phase 2, building the actual applications:
- `apps/cms` - Admin interface (Next.js 15)
- `apps/web` - Public website (Next.js 15 SSG/ISR)
- `apps/api` - Backend API (GraphQL + REST)

### Package Structure

The monorepo is organized as follows:

```
aurora/
├── apps/                       # Applications (currently empty, being built)
│   ├── web/                    # Public website
│   ├── cms/                    # Admin interface  
│   └── api/                    # Backend API
├── packages/                   # Shared packages ✅
│   ├── ui/                     # shadcn/ui components
│   ├── core/                   # Types and utilities
│   ├── database/               # Prisma schema
│   ├── search/                 # MeiliSearch client
│   ├── analytics/              # Analytics wrappers
│   └── config/                 # Shared configurations
└── docs/                       # Documentation
```

### Import Alias Policy ⚠️ CRITICAL

The project enforces strict import alias rules:

**✅ Allowed:**
- `@workspace/*` - For shared packages
- `@web/*` - For web app local imports
- `@cms/*` - For CMS app local imports  
- `@api/*` - For API app local imports

**❌ Forbidden:**
- `@/*` - Blocked by ESLint rules
- Cross-app imports (e.g., `@web/*` in CMS app)

**Example:**
```typescript
// ✅ Good - workspace-scoped imports
import { Button } from '@workspace/ui'
import { UserService } from '@cms/services/user'

// ❌ Bad - static imports (will fail ESLint)
import { Button } from '@/components/ui/button'
import { WebComponent } from '@web/components/something'
```

> 📖 **Important**: For detailed information about our dynamic import system with scope awareness, see [DYNAMIC_IMPORTS.md](./DYNAMIC_IMPORTS.md)

### Step 4: Create Core Packages (10 min)

#### packages/config
```bash
cd packages/config
pnpm init
```

`packages/config/package.json`:
```json
{
  "name": "@workspace/config",
  "version": "0.1.0",
  "private": true,
  "exports": {
    "./eslint": "./eslint.config.js",
    "./tailwind": "./tailwind.config.js",
    "./typescript": "./tsconfig.json"
  },
  "devDependencies": {
    "@types/eslint": "^8.56.2",
    "eslint": "^9.0.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

`packages/config/eslint.config.js`:
```javascript
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*'],
              message: 'Use @workspace/* for shared packages or @web/*/@cms/*/@api/* for app-local imports'
            }
          ]
        }
      ]
    }
  }
];
```

#### packages/core
```bash
cd packages/core
pnpm init
mkdir -p src/{types,utils,constants}
```

`packages/core/package.json`:
```json
{
  "name": "@workspace/core",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

`packages/core/src/index.ts`:
```typescript
export * from './types';
export * from './utils';
export * from './constants';
```

`packages/core/src/types/index.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  schema: Record<string, any>;
  orgId: string;
}

export interface Document {
  id: string;
  title: string;
  slug: string;
  content: Record<string, any>;
  status: 'draft' | 'review' | 'published' | 'archived';
  locale: string;
  contentTypeId: string;
  authorId: string;
  orgId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### packages/ui
```bash
cd packages/ui
pnpm init
mkdir -p src/components
```

`packages/ui/package.json`:
```json
{
  "name": "@workspace/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles.css"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.61",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

`packages/ui/src/index.ts`:
```typescript
export * from './components/button';
export * from './components/card';
export * from './components/input';
```

`packages/ui/src/components/button.tsx`:
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

`packages/ui/src/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Development Commands

**Build all packages:**
```bash
pnpm run build
```

**Check for errors:**
```bash
pnpm run check
```

**Start development:**
```bash
pnpm run dev
```

**Lint and format:**
```bash
pnpm run lint
pnpm run format
```

**Package-specific commands:**
```bash
# Build specific package
pnpm --filter @workspace/ui build

# Run dev for specific app
pnpm --filter @workspace/web dev
```

### Step 6: Create Basic Apps (5 min)

#### CMS App
```bash
cd apps/cms
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@cms/*"
```

Update `apps/cms/package.json`:
```json
{
  "name": "@aurora/cms",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@workspace/ui": "workspace:*",
    "@workspace/database": "workspace:*",
    "@workspace/auth": "workspace:*",
    "@clerk/nextjs": "^4.29.9",
    "next": "15.0.0",
    "react": "^18.2.0",
    "typescript": "^5.3.3"
  }
}
```

#### Website App
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@web/*"
```

Update `apps/web/package.json` name to `@aurora/website`.

---

## Verification (5 minutes)

### Test the Setup

```bash
# Install all dependencies
pnpm install

# Test build
pnpm build

# Test development
pnpm dev

# Deploy to Vercel
vercel --prod
```

### Check URLs
- CMS (local): http://localhost:3001
- Website (local): http://localhost:3000
- CMS (production): https://aurora-cms.vercel.app
- Website (production): https://your-domain.vercel.app

---

## Next Steps

**Phase 2: Application Development (Current)**
1. Create the three main applications:
   - `apps/web` - Public website (Next.js 15 SSG/ISR)
   - `apps/cms` - Admin interface (Next.js 15)
   - `apps/api` - Backend API (GraphQL + REST)

2. Set up database and authentication
3. Implement core features

**Development Workflow:**
1. Always run `pnpm run check` after changes
2. Follow import alias rules strictly
3. Build packages before apps
4. Test locally before committing

### Environment Variables

Create `.env.local` files in each app:

```bash
# Database (from Vercel Postgres)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (from Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Storage (from Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Search (from Algolia)
NEXT_PUBLIC_ALGOLIA_APP_ID="..."
ALGOLIA_ADMIN_API_KEY="..."
ALGOLIA_SEARCH_API_KEY="..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."

# Email (from Resend)
RESEND_API_KEY="re_..."

# Website
PREVIEW_SECRET="preview-secret-key"
WEBHOOK_SECRET="webhook-secret-key"
```

---

## Troubleshooting

**Common Issues:**
- **Import errors**: Use `@workspace/*` for packages, app-specific aliases for local imports
- **Build failures**: Run `pnpm install` and check TypeScript errors
- **Turbo errors**: Ensure `turbo.json` uses `pipeline` not `tasks`
- **Package errors**: Check all dependencies are installed

**Getting Help:**
- Check `/docs/COMPREHENSIVE_REQUIREMENTS.md` for full specs
- Review `/docs/FINAL_TECHNICAL_SPECIFICATION.md` for architecture
- Follow the 20-week development roadmap

---

## Success Checklist

- [ ] Monorepo structure created
- [ ] All packages have correct names and exports
- [ ] Docker services running
- [ ] Apps build successfully
- [ ] Development servers start
- [ ] Import aliases working
- [ ] No TypeScript errors
- [ ] ESLint passes

**🎉 Congratulations!** You now have a working Aurora monorepo foundation.

**Next:** Follow the [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) for detailed feature development.