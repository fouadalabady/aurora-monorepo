# Project Overview

## Mission
Ship a **high‑conversion marketing site** with an in‑repo **CMS** and a shared **API** using **Prisma + PostgreSQL**. All on **Vercel**, **open‑source only**, CAPTCHA on public forms.

## Monorepo Layout
```text
snow/
├─ apps/
│  ├─ web/          # Public site (Next.js App Router)
│  ├─ cms/          # Admin CMS (Next.js App Router)
│  └─ api/          # API/BFF (REST + GraphQL on Route Handlers)
├─ packages/
│  ├─ ui/           # shadcn/ui library + tokens + RTL helpers
│  ├─ core/         # domain logic (services, leads), zod schemas
│  ├─ database/     # Prisma schema, client, seed, migrations
│  └─ config/       # eslint/tsconfig/tailwind/postcss/env utils
└─ docs/            # documentation pack
```

## Key Decisions
- **API modes**: REST for simple endpoints, **GraphQL** for rich CMS querying.
- **Caching stance**: Admin & API reads are **fresh (no‑store)**; public web pages use **ISR + tag revalidation** triggered by CMS mutations.
- **Security**: NextAuth in CMS, server‑side CAPTCHA verification, zod validation everywhere.

## Success Criteria
- Lead capture success (>99% pass), low spam via CAPTCHA.
- CMS changes visible on web within **≤ 30 seconds** via revalidation hooks.
- Core Web Vitals ≥ 90 (lab + field) without any paid analytics.
