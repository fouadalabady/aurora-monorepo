// Set required environment variables immediately for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret-key-that-is-32-chars-long'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

import { beforeEach, afterEach, vi } from 'vitest'

// Mock environment variables for testing
const mockEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  NEXTAUTH_SECRET: 'test-secret-key-that-is-32-chars-long',
  NEXTAUTH_URL: 'http://localhost:3000',
  BUSINESS_NAME: 'Test HVAC Services',
  BUSINESS_PHONE: '+15551234567',
  BUSINESS_EMAIL: 'test@example.com',
  BUSINESS_ADDRESS: '123 Test St, Test City, TS 12345',
  FEATURE_BLOG: 'true',
  FEATURE_TESTIMONIALS: 'true',
  FEATURE_PROJECTS: 'true',
  FEATURE_SEARCH: 'true',
  FEATURE_ANALYTICS: 'true',
  UPLOAD_MAX_SIZE: '10485760',
  UPLOAD_ALLOWED_TYPES: 'image/jpeg,image/png,image/webp,application/pdf',
  RATE_LIMIT_MAX: '100',
  RATE_LIMIT_WINDOW: '900000',
  CACHE_TTL: '3600',
  LOG_LEVEL: 'info',
}

// Store original process.env
let originalEnv: NodeJS.ProcessEnv

beforeEach(() => {
  // Store original environment
  originalEnv = { ...process.env }
  
  // Set mock environment variables
  Object.assign(process.env, mockEnv)
  
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  
  // Mock Date.now for consistent testing
  vi.spyOn(Date, 'now').mockReturnValue(1640995200000) // 2022-01-01 00:00:00 UTC
})

afterEach(() => {
  // Restore original environment
  process.env = originalEnv
  
  // Restore all mocks
  vi.restoreAllMocks()
})

// Global test utilities
global.createMockDate = (dateString: string) => {
  return new Date(dateString)
}

global.createMockBusinessHours = () => ({
  monday: { open: '8:00', close: '18:00', closed: false },
  tuesday: { open: '8:00', close: '18:00', closed: false },
  wednesday: { open: '8:00', close: '18:00', closed: false },
  thursday: { open: '8:00', close: '18:00', closed: false },
  friday: { open: '8:00', close: '18:00', closed: false },
  saturday: { open: '9:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '14:00', closed: false },
})

// Extend global types for test utilities
declare global {
  function createMockDate(dateString: string): Date
  function createMockBusinessHours(): Record<string, { open: string; close: string; closed: boolean }>
}