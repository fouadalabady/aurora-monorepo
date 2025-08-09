# Import & Scoping Standards

## Standards
1. Shared code **only** from `@workspace/*` (never re‑export into apps).
2. App code imports via app‑local alias (`@web/`, `@cms/`, `@api/`).
3. **Forbidden:** `@/*` in any app.

## TypeScript (example website)
```json
{
  "paths": {
    "@web/*": ["./src/*"],
    "@workspace/ui": ["../../packages/ui/src/index.ts"],
    "@workspace/ui/*": ["../../packages/ui/src/*"]
  }
}
```

## ESLint (no‑restricted‑imports)
- Block `@/*`, and cross‑app aliases.

## Codemod
See `scripts/codemod-fix-aliases.ts` – replace `@/` with the proper app alias per project.

## CI Guard
See `.github/workflows/alias-guard.yml` to fail PRs with forbidden imports.
