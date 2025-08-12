# Feature Execution Plan (Agent-Oriented)

> Each feature has deterministic steps & verifiable outcomes — no dates.

## F1 — Monorepo Bootstrap
1. Create `apps/web`, `apps/cms`, `apps/api`, `packages/ui|core|database|config`.
2. Configure TS paths, strict ESLint, commit hooks.
3. Install Tailwind, shadcn/ui, next‑intl; initialize theme in `packages/ui`.
4. Add Prisma schema & client; generate types.
**Done when:** `pnpm -w build` succeeds; CI green.

## F2 — Auth & RBAC (CMS)
1. Add NextAuth (credentials/email provider), Prisma adapter if needed.
2. Seed admin via `pnpm ts-node packages/database/seed.ts`.
3. Middleware role guards on CMS routes.
**Done when:** Login works and role‑protected pages render.

## F3 — Leads Capture (API + Web)
1. REST `POST /api/leads/capture` with Zod + CAPTCHA verify.
2. GraphQL `createLead` mutation equivalent.
3. SMTP email on success.
**Done when:** Lead appears in DB; email delivered.

## F4 — CMS Leads Module
1. DataTable list view (filters, pagination).
2. Details with timeline/notes; assignment & status transitions.
3. `no-store` on all fetches; server components set `revalidate = 0`.
**Done when:** Admin triages leads end‑to‑end.

## F5 — Content Management
1. Prisma models for Services/Posts.
2. REST/GraphQL CRUD endpoints.
3. Web ISR pages subscribe to tags per model.
**Done when:** Publishing triggers revalidation; content appears quickly.

## F6 — i18n & RTL
1. Locale middleware; ar/en resources.
2. RTL helpers in `packages/ui`.
**Done when:** Layout mirrors correctly in Arabic.

## F7 — Performance & SEO (no analytics)
1. Metadata API + JSON‑LD.
2. Optimize fonts & images.
3. Route cache headers consistent: public pages ISR; admin no‑store.
**Done when:** Lighthouse mobile ≥ 90.

## F8 — QA & Hardening
1. Vitest unit tests for core logic.
2. Playwright smoke tests (forms, nav, auth).
3. API contract tests (REST + GraphQL) with mocked DB.
4. Error boundaries, 404/500 pages.
**Done when:** CI passes all jobs.
