# Development Pipeline (Feature-First)

> A **feature‑first** pipeline for the Solo/Flux agent. Each step is executable, verifiable, and cache‑safe.

## 0) Feature Brief (template)
```md
# <Feature Name>
- Problem: <what user needs>
- Outcome: <measurable result>
- Surfaces: <web pages, cms screens, api endpoints>
- Data: <tables/fields>
- API: <REST paths, GraphQL ops>
- Freshness: <tags to revalidate, no-store areas>
- Acceptance: <bullet test cases>
```

## 1) Plan
1. Define schema changes (Prisma models/migrations).
2. List API endpoints (REST + GraphQL) and access rules.
3. UI components to add via shadcn (list the `pnpm dlx shadcn-ui add ...` commands).
4. Caching plan: ISR tags for public; `no-store` for admin/data.

## 2) Implement
1. **DB**: write migration + seed.
2. **API**: implement REST routes and GraphQL resolvers; set `Cache-Control: no-store` and `export const dynamic = 'force-dynamic'`.
3. **Web**: pages/sections; for dynamic bits use `unstable_noStore()`.
4. **CMS**: server components with `revalidate = 0`; queries with `{ cache: 'no-store' }`.
5. **UI**: add shadcn components via CLI; wrap in `packages/ui`.

## 3) Test
- **Unit** (Vitest): core/domain and API handlers with mocked Prisma.
- **E2E** (Playwright): forms submit → lead exists in DB; CMS edits → public page revalidates.
- **Contract**: REST OpenAPI assertions (zod) + GraphQL schema snapshot.

## 4) Deploy
1. Push PR → Vercel previews for `web`, `cms`, `api`.
2. Run CI: typecheck, lint, unit, Playwright smoke.
3. Merge → production; Prisma migration runs (if configured) or via manual `vercel-cli` script.
4. Post‑deploy verification script: hit health endpoints; trigger a sample revalidation.

## 5) Rollback
- Keep reversible migrations; tag releases; `vercel rollback` if needed.

## 6) Done Criteria (checklist)
- [ ] All acceptance tests pass.
- [ ] Freshness verified (no stale admin data; public revalidates fast).
- [ ] No cross‑app imports; shadcn added via CLI only.
