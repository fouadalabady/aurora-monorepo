# Vercel & Secrets

## Projects
- **web** → `apps/web`
- **cms** → `apps/cms`
- **api** → `apps/api`

## Build Commands
```text
web: cd ../.. && pnpm build --filter=web
cms: cd ../.. && pnpm build --filter=cms
api: cd ../.. && pnpm build --filter=api
```

## Secrets
- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- `SMTP_*`

## Runtime Notes
- API/GraphQL must run on **Node** runtime.
- Set `WEB_REVALIDATE_URL` for server‑to‑server revalidation calls if used.
