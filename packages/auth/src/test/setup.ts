import { vi, beforeEach, afterEach } from 'vitest'

// Mock NextAuth
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

// Mock NextAuth providers
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ id: 'google', name: 'Google' })),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(() => ({ id: 'credentials', name: 'Credentials' })),
}))

// Mock Prisma adapter
vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({ name: 'prisma-adapter' })),
}))

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
}))

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_jwt_token'),
    verify: vi.fn().mockReturnValue({ id: 'user123', email: 'test@example.com' }),
  },
  sign: vi.fn().mockReturnValue('mock_jwt_token'),
  verify: vi.fn().mockReturnValue({ id: 'user123', email: 'test@example.com' }),
}))

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransporter: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'mock_message_id' }),
    })),
  },
  createTransporter: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'mock_message_id' }),
  })),
}))

// Mock Prisma database
vi.mock('@workspace/database', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test_secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id'
process.env.GOOGLE_CLIENT_SECRET = 'test_google_client_secret'
process.env.SMTP_HOST = 'smtp.test.com'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@example.com'
process.env.SMTP_PASSWORD = 'test_password'
process.env.SMTP_FROM = 'noreply@example.com'

// Mock console methods
const originalConsole = { ...console }
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

// Global test utilities
global.createMockUser = (overrides = {}) => ({
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  emailVerified: new Date(),
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

global.createMockSession = (overrides = {}) => ({
  user: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

global.createMockToken = (overrides = {}) => ({
  id: 'token123',
  token: 'mock_verification_token',
  identifier: 'test@example.com',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  ...overrides,
})