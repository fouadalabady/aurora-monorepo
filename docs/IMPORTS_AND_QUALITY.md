# Imports & Quality Rules

## Path Aliases (tsconfig.base.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@workspace/*": ["packages/*/src"],
      "@web/*": ["apps/web/src/*"],
      "@cms/*": ["apps/cms/src/*"],
      "@api/*": ["apps/api/src/*"]
    }
  }
}
```

## ESLint Guard (no cross‑app imports)
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      { "patterns": [
        { "group": ["@/*"], "message": "Use scoped aliases (@web|@cms|@api|@workspace)." },
        { "group": ["apps/*"], "message": "Do not import across apps. Extract to packages/." }
      ]}
    ]
  }
}
```

## shadcn/ui Rules
- **Never** hand‑write a component. Use:
```bash
pnpm dlx shadcn-ui@latest add button input textarea table card dialog sheet dropdown-menu form
```
- Place wrappers/variants in `packages/ui` only.
- Tokens (spacing, colors, radii) live in Tailwind config at `packages/ui`.

## CI Checks
- `typecheck`, `lint`, `build` for each app
- Unit tests (Vitest) + Playwright smoke tests on PR previews
- Bundle‑size guard; route size warnings
