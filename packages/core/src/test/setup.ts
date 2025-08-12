// Test setup for core package

// Mock external dependencies that might not be available during testing
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: process.env.NODE_ENV === 'test' ? () => {} : console.log,
}

// Mock Date.now for consistent testing
const mockDateNow = 1640995200000 // 2022-01-01T00:00:00.000Z
const originalDateNow = Date.now

beforeEach(() => {
  // Reset Date.now mock before each test
  Date.now = vi.fn(() => mockDateNow)
})

afterEach(() => {
  // Restore original Date.now after each test
  Date.now = originalDateNow
  vi.clearAllMocks()
})

// Global test utilities
export const mockDate = new Date(mockDateNow)
export const mockTimestamp = mockDateNow