# Authentication & User Management Guide

> Comprehensive guide for implementing secure authentication and user management in the Aurora project using NextAuth.js, JWT sessions, and role-based access control.

---

## 1. Overview

The Aurora project implements a robust authentication system using **NextAuth.js** with JWT strategy, providing secure access control across the web, CMS, and API applications. The system supports role-based permissions and follows FLUX rules for fresh-by-default admin interfaces.

### Key Components
- **NextAuth.js**: Primary authentication provider with JWT sessions
- **Role-Based Access Control (RBAC)**: Four-tier permission system
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: JWT tokens with 30-day expiration
- **Middleware Protection**: Route-level access control

---

## 2. User Roles & Permissions

| Role | Access Level | Permissions | Use Case |
|------|-------------|-------------|----------|
| **Admin** | Full System | All CRUD operations, user management, system settings | Business owner, IT administrator |
| **Editor** | Content & Leads | Content CRUD, lead management, media upload | Marketing manager, content creator |
| **Agent** | Lead Management | Lead viewing/updating, basic content access | Sales representative, customer service |
| **Viewer** | Read-Only | View published content, basic dashboard access | Stakeholder, external consultant |

### Permission Matrix

| Feature | Admin | Editor | Agent | Viewer |
|---------|-------|--------|-------|--------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Content Publishing | ✅ | ✅ | ❌ | ❌ |
| Lead Assignment | ✅ | ✅ | ✅ | ❌ |
| Lead Viewing | ✅ | ✅ | ✅ | ✅ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Analytics Access | ✅ | ✅ | ❌ | ❌ |

---

## 3. NextAuth.js Configuration

### 3.1 Core Configuration

```typescript
// packages/auth/src/config.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@workspace/database"
import { verifyPassword } from "./utils"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !await verifyPassword(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
```

### 3.2 Environment Variables

```bash
# Required for NextAuth.js
NEXTAUTH_URL=http://localhost:3000  # Production: https://cms.snow.sa
NEXTAUTH_SECRET=your-secret-key-here

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/aurora
DIRECT_URL=postgresql://user:password@localhost:5432/aurora
```

---

## 4. Database Schema

### 4.1 User Model

```prisma
// packages/database/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(VIEWER)
  password  String   // bcrypt hashed
  leads     Lead[]   // Assigned leads
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum UserRole {
  ADMIN
  EDITOR
  AGENT
  VIEWER
}
```

### 4.2 Session Management

NextAuth.js with JWT strategy doesn't require database session storage, but user data is stored in the database for persistence and role management.

---

## 5. Password Security

### 5.1 Password Hashing

```typescript
// packages/auth/src/utils.ts
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

### 5.2 Password Requirements

```typescript
// packages/auth/src/validation.ts
import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
```

---

## 6. User Management Operations

### 6.1 User Creation

```typescript
// packages/auth/src/user-management.ts
import { prisma } from "@workspace/database"
import { hashPassword } from "./utils"
import { UserRole } from "@prisma/client"

export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: UserRole
}) {
  const { name, email, password, role = "VIEWER" } = data
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    throw new Error("User with this email already exists")
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  })
  
  return user
}
```

### 6.2 User Role Updates

```typescript
export async function updateUserRole(
  userId: string, 
  newRole: UserRole,
  updatedBy: string
) {
  // Verify updater has admin permissions
  const updater = await prisma.user.findUnique({
    where: { id: updatedBy },
    select: { role: true }
  })
  
  if (updater?.role !== "ADMIN") {
    throw new Error("Only admins can update user roles")
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true
    }
  })
}
```

---

## 7. Middleware & Route Protection

### 7.1 NextAuth Middleware

```typescript
// apps/cms/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // Admin-only routes
    if (pathname.startsWith("/admin/users") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    
    // Editor+ routes
    if (pathname.startsWith("/admin/content") && 
        !["ADMIN", "EDITOR"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    
    // Agent+ routes
    if (pathname.startsWith("/admin/leads") && 
        !["ADMIN", "EDITOR", "AGENT"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/admin/:path*"]
}
```

### 7.2 API Route Protection

```typescript
// apps/api/app/api/admin/users/route.ts
export const runtime = 'node'
export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@workspace/auth"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return new Response(
      JSON.stringify({ 
        code: "unauthorized", 
        message: "Admin access required" 
      }),
      { 
        status: 401, 
        headers: { "Cache-Control": "no-store" } 
      }
    )
  }
  
  // Proceed with admin operation
  // ...
}
```

---

## 8. Authentication Flows

### 8.1 Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as CMS App
    participant N as NextAuth
    participant D as Database
    
    U->>C: Enter credentials
    C->>N: signIn(credentials)
    N->>D: Find user by email
    D->>N: Return user data
    N->>N: Verify password
    N->>N: Generate JWT token
    N->>C: Return session
    C->>U: Redirect to dashboard
```

### 8.2 User Creation Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant C as CMS App
    participant API as API App
    participant D as Database
    
    A->>C: Create user form
    C->>API: POST /api/admin/users
    API->>API: Validate admin role
    API->>API: Hash password
    API->>D: Create user record
    D->>API: Return user data
    API->>C: Success response
    C->>A: Show success message
```

---

## 9. Security Best Practices

### 9.1 Session Security
- JWT tokens expire after 30 days
- Secure HTTP-only cookies in production
- CSRF protection enabled by default
- Session rotation on role changes

### 9.2 Password Security
- bcrypt with 12 salt rounds
- Strong password requirements enforced
- No password storage in logs or client-side
- Password reset via secure email tokens

### 9.3 API Security
- All admin endpoints require authentication
- Role-based access control on all operations
- Input validation with Zod schemas
- Rate limiting on authentication endpoints

### 9.4 FLUX Compliance
- Fresh-by-default admin interfaces with `revalidate = 0`
- No stale user data in CMS views
- Proper import boundaries: `@workspace/auth` package
- Node runtime for all authentication API routes

---

## 10. Implementation Checklist

### Database Setup
- [ ] User model with role enum
- [ ] Password field with bcrypt hashing
- [ ] Unique email constraint
- [ ] Created/updated timestamps

### NextAuth Configuration
- [ ] Credentials provider setup
- [ ] JWT strategy configuration
- [ ] Session callbacks for role injection
- [ ] Custom sign-in pages

### Middleware Protection
- [ ] Route-based access control
- [ ] Role verification middleware
- [ ] Unauthorized redirect handling
- [ ] API endpoint protection

### User Management
- [ ] Admin user creation interface
- [ ] Role assignment functionality
- [ ] Password reset workflow
- [ ] User deactivation/deletion

### Security Measures
- [ ] Password strength validation
- [ ] Session timeout handling
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints

---

## 11. Troubleshooting

### Common Issues

**Issue**: "Invalid credentials" error
- Check password hashing implementation
- Verify database user exists
- Ensure bcrypt comparison is working

**Issue**: Session not persisting
- Verify NEXTAUTH_SECRET is set
- Check JWT configuration
- Ensure cookies are properly configured

**Issue**: Role-based access not working
- Verify JWT callback includes role
- Check middleware role verification
- Ensure session callback populates user role

**Issue**: Fresh data not loading in CMS
- Add `revalidate = 0` to server components
- Use `{ cache: 'no-store' }` in fetch calls
- Verify API routes have `Cache-Control: no-store`

---

## 12. Testing Authentication

### Unit Tests
```typescript
// packages/auth/src/__tests__/utils.test.ts
import { hashPassword, verifyPassword } from '../utils'

describe('Password utilities', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'TestPassword123!'
    const hashed = await hashPassword(password)
    
    expect(hashed).not.toBe(password)
    expect(await verifyPassword(password, hashed)).toBe(true)
    expect(await verifyPassword('wrong', hashed)).toBe(false)
  })
})
```

### E2E Tests
```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test('admin login and user management', async ({ page }) => {
  await page.goto('/auth/signin')
  
  await page.fill('[name="email"]', 'admin@snow.sa')
  await page.fill('[name="password"]', 'AdminPassword123!')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/admin/dashboard')
  
  // Test user creation
  await page.goto('/admin/users')
  await page.click('text=Create User')
  
  await page.fill('[name="name"]', 'Test User')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'TestPassword123!')
  await page.selectOption('[name="role"]', 'EDITOR')
  
  await page.click('button[type="submit"]')
  await expect(page.locator('text=User created successfully')).toBeVisible()
})
```

This comprehensive authentication guide ensures secure, role-based access control across the Aurora project while maintaining FLUX compliance and fresh-by-default admin interfaces.