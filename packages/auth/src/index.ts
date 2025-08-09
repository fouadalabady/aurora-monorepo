// Aurora Authentication Package
// Built with NextAuth.js and Prisma

// Main configuration
export { authOptions } from './config'

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