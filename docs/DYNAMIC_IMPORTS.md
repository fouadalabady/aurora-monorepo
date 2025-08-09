# Dynamic Imports with Scope Awareness

## Overview

This document outlines the dynamic import system implemented in the Aurora monorepo to prevent conflicts and ensure proper package boundaries while maintaining scope awareness.

## Problem Statement

Static imports like `import { Button } from './ui/button'` or `import { Button } from '@/components/ui/button'` can lead to:

- **Package boundary violations**: Components accessing files outside their intended scope
- **Import conflicts**: Multiple packages defining similar components
- **Maintenance issues**: Difficulty tracking dependencies across packages
- **Build inconsistencies**: Different resolution paths in different environments

## Solution: Workspace-Scoped Imports

### Package Structure

Our monorepo uses workspace-scoped packages:

```
packages/
├── ui/                    # @workspace/ui
├── core/                  # @workspace/core
├── auth/                  # @workspace/auth
├── database/              # @workspace/database
└── ...
```

### Proper Import Patterns

#### ✅ Correct: Workspace-scoped imports

```typescript
// Import from workspace packages
import { Button, Card, Badge } from '@workspace/ui';
import { useAuth } from '@workspace/auth';
import { db } from '@workspace/database';
```

#### ❌ Incorrect: Static relative imports

```typescript
// Avoid these patterns
import { Button } from './ui/button';
import { Button } from '@/components/ui/button';
import { Card } from '../../../packages/ui/src/components/card';
```

### Benefits

1. **Clear Package Boundaries**: Each import explicitly declares which workspace package it depends on
2. **Conflict Prevention**: No ambiguity about which component is being imported
3. **Better Tree Shaking**: Bundlers can optimize imports more effectively
4. **Type Safety**: TypeScript can better track dependencies and provide accurate intellisense
5. **Maintainability**: Easy to track and refactor dependencies across the monorepo

## Implementation Guidelines

### For UI Components

```typescript
// apps/web/src/components/language-switcher.tsx
import { Button } from '@workspace/ui';

// apps/web/src/app/[locale]/page.tsx
import { Button, Card, CardContent, Badge } from '@workspace/ui';
```

### For Business Logic

```typescript
// Import authentication utilities
import { useAuth, signIn, signOut } from '@workspace/auth';

// Import database utilities
import { db, schema } from '@workspace/database';

// Import core utilities
import { formatDate, validateEmail } from '@workspace/core';
```

### Package Configuration

Each workspace package must properly export its public API:

```json
// packages/ui/package.json
{
  "name": "@workspace/ui",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

```typescript
// packages/ui/src/index.ts
export * from './components/button';
export * from './components/card';
export * from './components/badge';
// ... other exports
```

## Migration Strategy

### Step 1: Identify Static Imports

Search for problematic import patterns:

```bash
# Find relative UI imports
grep -r "from '\./.*ui/" apps/
grep -r "from '@/components/ui/" apps/

# Find other static imports
grep -r "from '\.\.\./" apps/
```

### Step 2: Update Package Dependencies

Ensure consuming apps have workspace dependencies:

```json
// apps/web/package.json
{
  "dependencies": {
    "@workspace/ui": "workspace:*",
    "@workspace/core": "workspace:*"
  }
}
```

### Step 3: Replace Imports

Systematically replace static imports with workspace-scoped imports:

```typescript
// Before
import { Button } from '@/components/ui/button';
import { Card } from './ui/card';

// After
import { Button, Card } from '@workspace/ui';
```

### Step 4: Validate Build

Ensure the build process works correctly:

```bash
pnpm build
pnpm type-check
```

## Best Practices

### 1. Explicit Dependencies

Always declare workspace dependencies in package.json:

```json
{
  "dependencies": {
    "@workspace/ui": "workspace:*"
  }
}
```

### 2. Barrel Exports

Use index files to create clean public APIs:

```typescript
// packages/ui/src/index.ts
export { Button } from './components/button';
export { Card, CardContent, CardHeader } from './components/card';
```

### 3. Type-Only Imports

Use type-only imports when appropriate:

```typescript
import type { ButtonProps } from '@workspace/ui';
import { Button } from '@workspace/ui';
```

### 4. Avoid Deep Imports

Don't import directly from internal package paths:

```typescript
// ❌ Avoid
import { Button } from '@workspace/ui/src/components/button';

// ✅ Prefer
import { Button } from '@workspace/ui';
```

## Troubleshooting

### Module Not Found Errors

1. Verify workspace dependency is declared in package.json
2. Check that the component is exported from the package's index.ts
3. Ensure pnpm install has been run
4. Verify the package builds successfully

### Type Errors

1. Check TypeScript configuration includes workspace packages
2. Verify type exports in package.json
3. Ensure shared dependencies have compatible versions

### Build Failures

1. Verify all workspace packages build independently
2. Check for circular dependencies between packages
3. Ensure build order is correct in turbo.json

## Conclusion

By implementing workspace-scoped imports, we achieve:

- **Better separation of concerns** between packages
- **Reduced coupling** and improved maintainability
- **Clearer dependency graphs** for better optimization
- **Consistent import patterns** across the entire monorepo

This approach scales well as the monorepo grows and ensures that each package maintains clear boundaries while enabling efficient code sharing.