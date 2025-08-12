# Technical Details

## Stack
- **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind**, **shadcn/ui**
- **Prisma + PostgreSQL**, **NextAuth**, **Zod**, **React Hook Form**
- **GraphQL** via **GraphQL Yoga** or **Helix** at `/api/graphql` (Node runtime)

## Environment Variables
| Name | App | Description |
|---|---|---|
| `DATABASE_URL` | api,cms | Postgres connection string |
| `DIRECT_URL` | api,cms | Optional for migrations |
| `NEXTAUTH_URL` | cms | Auth callback URL |
| `NEXTAUTH_SECRET` | cms | NextAuth secret |
| `RECAPTCHA_SITE_KEY` | web | Client key |
| `RECAPTCHA_SECRET_KEY` | api | Server verify key |
| `SMTP_HOST` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | api | Outbound mail |

## Import & Scoping Rules
- Use aliases: `@workspace/*` for packages; `@web/*`, `@cms/*`, `@api/*` inside apps.
- **Never import** from another app’s `src` directly. Only public package entrypoints.
- Only `packages/ui` may import **shadcn/ui primitives**.

## Deployment
- 3 Vercel projects (`web`, `cms`, `api`).
- API routes run on **Node** runtime (not Edge) for Prisma.
- DB via managed Postgres free tier; migrations from `packages/database`.

## Data Flow
```mermaid
graph TD
  CMS(CMS Admin) -->|mutation (REST/GraphQL)| API
  API -->|Prisma| DB[(PostgreSQL)]
  API -->|revalidateTag('content:*')| WEB(Web)
  U[Visitor] -->|GET pages (ISR)| WEB
  WEB -->|fetch fresh data when needed| API
```

## Caching Policy
- **API (REST/GraphQL)**: set `Cache-Control: no-store` on all **mutations** and CMS reads. For public GETs, default to `no-store` unless explicitly safe.
- **Next.js**: use `export const dynamic = 'force-dynamic'` for dashboards & admin, or `export const revalidate = 0`. In server components that must be fresh, call `unstable_noStore()`.
- **Web pages**: default to ISR with tags; CMS mutations call `revalidateTag('content:<model>')` to refresh relevant pages quickly.
