// Aurora Authentication Package
// Built with Auth.js v5 and Prisma

import NextAuth, { type NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db as prisma } from "@workspace/database"
import { loginSchema } from "./utils"
import type { NextAuthResult } from "next-auth"
import { z } from "zod"

// Main auth configuration
const authConfig = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { email, password } = loginSchema.parse(credentials)

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Auto-approve Google sign-ins
        return true
      }
      return true
    },
  },
  events: {
    async signIn({ user, account, isNewUser }: any) {
      if (isNewUser) {
        // Log new user registration
        console.log(`New user registered: ${user.email}`)
      }
    },
    async signOut({ session, token }: any) {
      // Log user sign out
      console.log(`User signed out: ${session?.user?.email || token?.email}`)
    },
  },
  debug: process.env.NODE_ENV === "development",
})

// Export auth configuration with explicit types
const { handlers, auth, signIn, signOut }: any = authConfig

export { handlers, auth, signIn, signOut }

// Export middleware-compatible auth handler
export { middlewareAuthHandler } from './middleware'

// Export with explicit types for better TypeScript support
export type { NextAuthConfig } from "next-auth"
export type { Session, User } from "next-auth"

// Utility functions
export {
  // Validation schemas
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
  
  // Password utilities
  hashPassword,
  verifyPassword,
  
  // JWT utilities
  generateToken,
  verifyToken,
  
  // User management
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  
  // Email utilities
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  
  // Token utilities
  createVerificationToken,
  createPasswordResetToken,
  verifyEmailToken,
  verifyPasswordResetToken,
} from './utils'

// Type definitions
export interface AuthUser {
  id: string
  name: string | null
  email: string
  role: string
  image?: string | null
  emailVerified?: Date | null
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

export interface AuthError {
  message: string
  code?: string
}

// Constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  EMAIL_SEND_FAILED: 'Failed to send email',
} as const

export const AUTH_ROUTES = {
  SIGNIN: '/auth/signin',
  SIGNUP: '/auth/signup',
  SIGNOUT: '/auth/signout',
  VERIFY_EMAIL: '/auth/verify-email',
  RESET_PASSWORD: '/auth/reset-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  ERROR: '/auth/error',
} as const

// Helper functions for Next.js apps
export function getAuthUrl(route: keyof typeof AUTH_ROUTES): string {
  return AUTH_ROUTES[route]
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error.message === 'string'
}

export function createAuthError(message: string, code?: string): AuthError {
  return { message, code }
}