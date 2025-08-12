import { vi } from 'vitest'

// Mock plausible-tracker
vi.mock('plausible-tracker', () => ({
  default: vi.fn(() => ({
    trackPageview: vi.fn(),
    trackEvent: vi.fn(),
  })),
}))

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    pathname: '/test',
    asPath: '/test',
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  })),
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'test.com'
process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST = 'https://plausible.io'

// Mock console methods
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z')
vi.setSystemTime(mockDate)

// Global test utilities
global.createMockEvent = (overrides = {}) => ({
  props: { testProp: 'value' },
  ...overrides,
})

global.createMockLeadEvent = (overrides = {}) => ({
  leadSource: 'website',
  serviceType: 'consultation',
  leadValue: 1000,
  props: { testProp: 'value' },
  ...overrides,
})

global.createMockServiceEvent = (overrides = {}) => ({
  serviceId: 'service-1',
  serviceName: 'Test Service',
  serviceCategory: 'consulting',
  priceType: 'FIXED' as const,
  props: { testProp: 'value' },
  ...overrides,
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks()
})