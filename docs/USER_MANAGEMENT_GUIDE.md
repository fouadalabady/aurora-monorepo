# User Management Guide

> Comprehensive guide for user creation, role management, and administrative workflows in the Aurora project.

## Overview

This guide covers the complete user management system built on NextAuth.js with role-based access control (RBAC). It details how to create, manage, and maintain users across the Aurora platform.

## User Roles & Permissions

| Role | Access Level | Permissions | Use Case |
|------|-------------|-------------|----------|
| **Admin** | Full System | All operations, user management, system settings | System administrators |
| **Editor** | Content Management | Create/edit/delete content, manage leads | Content managers |
| **Agent** | Lead Management | View/update leads, limited content access | Sales agents |
| **Viewer** | Read-Only | View content and leads only | Stakeholders, clients |

## User Creation Workflows

### 1. Admin-Created Users

**Process:**
1. Admin logs into CMS
2. Navigates to User Management
3. Fills user creation form
4. System generates secure password
5. User receives email with credentials

**Implementation:**
```typescript
// apps/cms/app/admin/users/create/page.tsx
export const revalidate = 0

import { createUser } from '@workspace/core/user'
import { sendWelcomeEmail } from '@workspace/core/email'

const createUserAction = async (formData: FormData) => {
  'use server'
  
  const userData = {
    email: formData.get('email') as string,
    name: formData.get('name') as string,
    role: formData.get('role') as UserRole,
  }
  
  // Generate secure password
  const tempPassword = generateSecurePassword()
  
  // Create user with hashed password
  const user = await createUser({
    ...userData,
    password: await bcrypt.hash(tempPassword, 12)
  })
  
  // Send welcome email
  await sendWelcomeEmail(user.email, tempPassword)
  
  revalidateTag('content:users')
  return { success: true, userId: user.id }
}
```

### 2. Self-Registration (if enabled)

**Process:**
1. User visits registration page
2. Fills registration form
3. Email verification required
4. Admin approval workflow
5. Account activation

**Configuration:**
```typescript
// packages/auth/src/config.ts
export const authConfig = {
  selfRegistration: {
    enabled: process.env.ALLOW_SELF_REGISTRATION === 'true',
    requireEmailVerification: true,
    requireAdminApproval: true,
    defaultRole: 'VIEWER'
  }
}
```

## User Management Operations

### Password Management

**Password Reset Flow:**
```typescript
// apps/api/app/api/auth/reset-password/route.ts
export const runtime = 'node'
export const dynamic = 'force-dynamic'

import { generateResetToken } from '@workspace/core/auth'
import { sendPasswordResetEmail } from '@workspace/core/email'

export async function POST(req: Request) {
  const { email } = await req.json()
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return new Response(
      JSON.stringify({ code: 'user_not_found', message: 'User not found' }),
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  
  const resetToken = await generateResetToken(user.id)
  await sendPasswordResetEmail(user.email, resetToken)
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
```

**Password Change:**
```typescript
// apps/api/app/api/auth/change-password/route.ts
export const runtime = 'node'
export const dynamic = 'force-dynamic'

import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ code: 'unauthorized', message: 'Not authenticated' }),
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  
  const { currentPassword, newPassword } = await req.json()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return new Response(
      JSON.stringify({ code: 'invalid_password', message: 'Current password is incorrect' }),
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword }
  })
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
```

### Role Management

**Update User Role:**
```typescript
// apps/api/app/api/admin/users/[id]/role/route.ts
export const runtime = 'node'
export const dynamic = 'force-dynamic'

import { requireRole } from '@workspace/core/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole('ADMIN')
  
  const { role } = await req.json()
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true }
  })
  
  revalidateTag('content:users')
  
  return new Response(
    JSON.stringify(user),
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
```

### User Deactivation

**Soft Delete Implementation:**
```typescript
// Add to Prisma schema
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole @default(VIEWER)
  password  String
  isActive  Boolean  @default(true)
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Deactivation endpoint
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await requireRole('ADMIN')
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      isActive: false,
      deletedAt: new Date()
    }
  })
  
  revalidateTag('content:users')
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
```

## CMS User Interface

### User List Page

```typescript
// apps/cms/app/admin/users/page.tsx
export const revalidate = 0

import { unstable_noStore as noStore } from 'next/cache'
import { UserTable } from '@workspace/ui/user-table'

export default async function UsersPage() {
  noStore()
  
  const users = await fetch(`${process.env.API_URL}/api/admin/users`, {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${await getServerToken()}`
    }
  }).then(res => res.json())
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button asChild>
          <Link href="/admin/users/create">Create User</Link>
        </Button>
      </div>
      
      <UserTable users={users} />
    </div>
  )
}
```

### User Creation Form

```typescript
// apps/cms/app/admin/users/create/page.tsx
export const revalidate = 0

import { UserCreateForm } from '@workspace/ui/user-create-form'

export default function CreateUserPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New User</h1>
      <UserCreateForm />
    </div>
  )
}
```

## Security Best Practices

### 1. Password Security
- Minimum 8 characters with complexity requirements
- bcrypt hashing with salt rounds ≥ 12
- Password history to prevent reuse
- Secure password generation for admin-created accounts

### 2. Session Management
- JWT tokens with 24-hour expiration
- Secure session cookies (httpOnly, secure, sameSite)
- Session invalidation on role changes
- Concurrent session limits

### 3. Access Control
- Role-based middleware protection
- API endpoint authorization
- Fresh data validation (no-store)
- Audit logging for user operations

### 4. Data Protection
- Email validation and sanitization
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS protection in forms

## Monitoring & Auditing

### User Activity Logging

```typescript
// packages/core/src/audit.ts
export async function logUserActivity({
  userId,
  action,
  resource,
  metadata
}: {
  userId: string
  action: string
  resource: string
  metadata?: Record<string, any>
}) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      metadata,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    }
  })
}
```

### User Metrics Dashboard

```typescript
// apps/cms/app/admin/analytics/users/page.tsx
export const revalidate = 0

export default async function UserAnalyticsPage() {
  noStore()
  
  const metrics = await fetch(`${process.env.API_URL}/api/admin/analytics/users`, {
    cache: 'no-store'
  }).then(res => res.json())
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Users" value={metrics.totalUsers} />
        <MetricCard title="Active Users" value={metrics.activeUsers} />
        <MetricCard title="New This Month" value={metrics.newThisMonth} />
        <MetricCard title="Login Rate" value={`${metrics.loginRate}%`} />
      </div>
      
      <UserActivityChart data={metrics.activityData} />
    </div>
  )
}
```

## Testing User Management

### Unit Tests

```typescript
// packages/core/src/__tests__/user.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createUser, updateUserRole } from '../user'
import { prismaMock } from '../__mocks__/prisma'

describe('User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should create user with hashed password', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'EDITOR' as const,
      password: 'password123'
    }
    
    prismaMock.user.create.mockResolvedValue({
      id: '1',
      ...userData,
      password: 'hashed_password',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    const user = await createUser(userData)
    
    expect(user.password).not.toBe('password123')
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: expect.any(String)
      })
    })
  })
})
```

### E2E Tests

```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test('admin can create new user', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'admin@aurora.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Navigate to user creation
    await page.goto('/admin/users/create')
    
    // Fill user form
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="name"]', 'New User')
    await page.selectOption('[name="role"]', 'EDITOR')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible()
    
    // Verify user appears in list
    await page.goto('/admin/users')
    await expect(page.locator('text=newuser@example.com')).toBeVisible()
  })
})
```

## Troubleshooting

### Common Issues

1. **Password Reset Not Working**
   - Check email service configuration
   - Verify reset token generation
   - Ensure proper URL construction

2. **Role Changes Not Reflecting**
   - Clear user session after role change
   - Verify middleware role checks
   - Check cache invalidation

3. **User Creation Failing**
   - Validate email uniqueness
   - Check password hashing
   - Verify database constraints

### Debug Commands

```bash
# Check user in database
pnpm prisma studio

# Reset user password manually
pnpm prisma db seed -- --reset-user admin@aurora.com

# View audit logs
pnpm prisma db seed -- --show-audit-logs
```

## Migration Guide

### Adding New User Fields

```prisma
// Add to schema.prisma
model User {
  // ... existing fields
  department String?
  lastLoginAt DateTime?
  preferences Json?
}
```

```bash
# Generate and apply migration
pnpm prisma migrate dev --name add_user_fields
pnpm prisma generate
```

### Role System Updates

```typescript
// Update role enum
enum UserRole {
  ADMIN
  EDITOR
  AGENT
  VIEWER
  MANAGER  // New role
}

// Update middleware
const roleHierarchy = {
  ADMIN: ['ADMIN', 'MANAGER', 'EDITOR', 'AGENT', 'VIEWER'],
  MANAGER: ['MANAGER', 'EDITOR', 'AGENT', 'VIEWER'],
  EDITOR: ['EDITOR', 'AGENT', 'VIEWER'],
  AGENT: ['AGENT', 'VIEWER'],
  VIEWER: ['VIEWER']
}
```

This comprehensive guide ensures proper user management implementation following FLUX rules with fresh-by-default data, proper security, and maintainable code structure.