# FLUX_RULES.md — Operating Rules & Instructions (Snow.sa)

> These rules are the **source of truth** for Solo/Flux when planning and executing features across the monorepo. They align with the approved pack (Prisma/Postgres, no analytics, REST + GraphQL, anti‑stale caching, shadcn/ui via CLI).

---

## 1) Operating principles

- **Conversion first**: prioritize RFQ/Contact flows and page speed.
- **Fresh by default in admin**: CMS & API reads must never show stale data.
- **Separation of concerns**: apps (`web`, `cms`, `api`) talk only through **REST/GraphQL** and the **database** (Prisma).
- **Open‑source only**: no paid/VPS dependencies. Deploy on **Vercel**.
- **Feature‑based execution**: tasks are steps with verifiable outcomes—no dates.

---

## 2) Global guardrails (hard rules)

1) **Monorepo boundaries**
   - Only import via aliases: `@workspace/*` (packages), `@web/*`, `@cms/*`, `@api/*` (apps).
   - **Never** import directly from another app’s `src/*`. Extract shared code to `packages/`.

2) **shadcn/ui discipline**
   - **Never** hand‑code shadcn components.
   - Add via CLI and centralize in `packages/ui`:
     ```bash
     pnpm dlx shadcn-ui@latest add button input textarea table card dialog sheet dropdown-menu form
     ```

3) **API runtime & safety**
   - Prisma requires **Node runtime** for all API routes:
     ```ts
     export const runtime = 'node'
     ```
   - Default to **no cache** on API responses:
     ```ts
     export const dynamic = 'force-dynamic' // Route Handlers
     return new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'no-store' } })
     ```

4) **Freshness & caching**
   - CMS (server components): `export const revalidate = 0` or call `unstable_noStore()`.
   - Client fetches in CMS: `fetch(url, { cache: 'no-store' })`.
   - Public web pages: use **ISR + tag revalidation**; after any content mutation, call:
     ```ts
     import { revalidateTag } from 'next/cache'
     revalidateTag('content:<model>')
     ```

5) **Security & validation**
   - Public forms: server‑side **reCAPTCHA** verification + **Zod** input validation.
   - Auth: **NextAuth** (JWT/session) on CMS; enforce role checks in **API** (REST & GraphQL).
   - Never expose secrets to the client. All secrets come from env.

6) **Error contract (uniform)**
   ```ts
   interface APIError { code: string; message: string; details?: Record<string, unknown>; }
   ```

---

## 3) Feature execution loop (the only loop Flux should follow)

**Plan → Implement → Test → Deploy → Verify.**

### A) PLAN (create/update a brief)
- Write a `docs/feature-<slug>.md` using this template:
  ```md
  # <Feature Name>
  - Problem:
  - Outcome:
  - Surfaces: <web pages, cms screens, api endpoints>
  - Data: <db tables/fields, migrations>
  - API: <REST paths, GraphQL ops>
  - Freshness: <tags to revalidate, no-store areas>
  - Acceptance: <bullet test cases>
  ```

### B) IMPLEMENT (apply diffs in this order)
1. **Database (Prisma)**
   - Edit `packages/database/schema.prisma`.
   - Run:
     ```bash
     pnpm prisma migrate dev
     pnpm prisma generate
     ```
   - Add/adjust seeds if needed: `pnpm prisma db seed`.

2. **API (REST + GraphQL)**
   - REST Route Handlers under `apps/api/app/api/...`.
   - GraphQL at `apps/api/app/api/graphql/route.ts` (Yoga/Helix).
   - All API endpoints:
     - `export const runtime = 'node'`
     - `export const dynamic = 'force-dynamic'`
     - Add `Cache-Control: no-store`.
   - After content mutations, trigger revalidation:
     ```ts
     revalidateTag('content:<model>')
     ```

3. **CMS**
   - Server components must be fresh:
     ```ts
     export const revalidate = 0
     import { unstable_noStore as noStore } from 'next/cache'
     noStore()
     ```
   - Fetch via REST/GraphQL with `{ cache: 'no-store' }`.
   - Use only shadcn components **added via CLI** and re‑exported by `@workspace/ui`.

4. **Web (public site)**
   - Use ISR + tags for content pages.
   - Dynamic/real‑time UI → server components with `revalidate = 0` and/or client fetch with `cache: 'no-store'`.

### C) TEST (must pass locally & in CI)
- **Unit** (Vitest): domain logic & API handlers (mock Prisma).
- **E2E** (Playwright):  
  - Contact/RFQ form → lead exists in DB (+ email mocked).  
  - CMS content update → relevant web page revalidated via tag.
- **Contract**:  
  - REST zod validators (decode & assert).  
  - GraphQL schema snapshot (no breaking changes).

### D) DEPLOY (Vercel)
- Open PR → build previews for `web`, `cms`, `api`.
- CI must pass: typecheck, lint, unit, Playwright smoke.
- Merge → production. If needed, run migrations:
  ```bash
  pnpm prisma migrate deploy
  ```
- Post‑deploy verify:
  - Hit `/api/health`.
  - Run a sample content mutation → confirm **revalidateTag** effect on web.

### E) VERIFY (definition of done)
- All acceptance checks in the feature brief are green.
- No cross‑app imports; shadcn usage via CLI only.
- Admin/CMS views and API reads are demonstrably **fresh** (no stale data).
- Public pages revalidate **quickly** (≤ 30s) after CMS mutations.

---

## 4) REST & GraphQL usage rules

- Use **REST** for simple, task‑oriented endpoints (e.g., `/api/leads/capture`).
- Use **GraphQL** for complex read patterns in CMS (filtering, pagination across relations).
- GraphQL endpoint is **POST‑only** at `/api/graphql` with masked errors and `no-store`.
- Resolvers **delegate to `packages/core`** functions, which call Prisma (keeps API thin).

Example REST capture:
```ts
// apps/api/app/api/leads/capture/route.ts
export const runtime = 'node'
export const dynamic = 'force-dynamic'

import { z } from 'zod'
import { prisma } from '@workspace/database'
import { verifyCaptcha } from '@workspace/core/captcha'

const Body = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().max(2000).optional(),
  recaptchaToken: z.string()
})

export async function POST(req: Request) {
  const input = Body.parse(await req.json())
  if (!(await verifyCaptcha(input.recaptchaToken))) {
    return new Response(JSON.stringify({ code:'captcha_failed', message:'CAPTCHA failed' }), { status: 400, headers:{'Cache-Control':'no-store'} })
  }
  const lead = await prisma.lead.create({ data: { name: input.name, email: input.email ?? null, phone: input.phone ?? null, message: input.message ?? null, source: 'website', status: 'NEW' }})
  return new Response(JSON.stringify({ ok: true, id: lead.id }), { headers:{'Cache-Control':'no-store'} })
}
```

---

## 5) Freshness & caching playbook

- **CMS pages**: `revalidate = 0` (or `noStore()`), API fetch `{ cache:'no-store' }`.
- **API**: always `no-store`. Mutations call `revalidateTag('content:<model>')`.
- **Web**:  
  - Content pages → ISR with tags: `export const revalidate = 3600;` and `fetch(..., { next: { tags: ['content:services'] }})`.  
  - Dynamic blocks (counts, dashboards) → no ISR.

---

## 6) Prisma rules

- Migrations are mandatory for schema changes.
- Prefer **transactions** for multi‑write mutations.
- Avoid N+1 in GraphQL: batch with `findMany` + `where: { id: { in: [...] } }` or a dataloader pattern.
- Seed minimal data for CMS access and demo flows.

---

## 7) UI & accessibility rules

- All forms: **React Hook Form + Zod**, accessible labels, clear error states.
- Provide a **sticky CTA** on mobile. Primary CTA is “Request a Quote”.
- RTL: ensure `<html dir="rtl">` on Arabic routes; use logical CSS props via Tailwind RTL plugin.

---

## 8) CI quality gates (must pass)

- `typecheck`, `lint`, `build` for each app.
- **Unit** + **Playwright smoke** (navigate, submit form, login).
- **No restricted imports** rule enforced via ESLint.
- Bundle/route size warning (report only unless extreme).

---

## 9) Commands cheat sheet (Flux may run these)

```bash
# Install shadcn components (only via CLI)
pnpm dlx shadcn-ui@latest add button input textarea table card dialog sheet dropdown-menu form

# Prisma
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed
pnpm prisma migrate deploy   # in prod

# Build (workspace)
pnpm -w build

# App-specific builds (Vercel)
cd apps/web && pnpm build
cd apps/cms && pnpm build
cd apps/api && pnpm build
```

---

## 10) Failure handling

- If any step fails (lint, typecheck, tests, build), **stop**, print the error, and propose a minimal fix. Do **not** bypass checks.
- If a mutation doesn’t revalidate, log which `revalidateTag('content:<model>')` should be called and add it.
- If CMS shows stale data, add `revalidate = 0` or `noStore()` where missing, and switch fetch to `{ cache:'no-store' }`.

---

### End
This file should live at `.trae/documents/FLUX_RULES.md`.
