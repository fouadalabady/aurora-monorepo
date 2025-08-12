import { vi, beforeEach, afterEach } from 'vitest'
import type { MockedFunction } from 'vitest'

// Mock Prisma Client
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  service: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  lead: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  leadActivity: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  testimonial: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  project: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  post: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  page: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  teamMember: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  setting: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $transaction: vi.fn(),
  $extends: vi.fn().mockReturnThis(),
}

// Mock the generated Prisma client
vi.mock('../generated', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}))

// Mock Prisma Accelerate extension
vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn(() => ({})),
}))

// Mock the db client
vi.mock('../client', () => ({
  db: mockPrismaClient,
}))

// Set up environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
console.log = vi.fn()
console.error = vi.fn()
console.warn = vi.fn()
console.info = vi.fn()

// Global test utilities
;(globalThis as any).createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  emailVerified: new Date(),
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockService = (overrides = {}) => ({
  id: 'service-123',
  title: 'Test Service',
  slug: 'test-service',
  description: 'Test service description',
  content: 'Test service content',
  excerpt: 'Test excerpt',
  category: 'Test Category',
  price: 1000,
  priceType: 'STARTING_FROM',
  features: ['Feature 1', 'Feature 2'],
  tags: ['tag1', 'tag2'],
  status: 'PUBLISHED',
  published: true,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockLead = (overrides = {}) => ({
  id: 'lead-123',
  name: 'Test Lead',
  email: 'lead@example.com',
  phone: '+1234567890',
  company: 'Test Company',
  message: 'Test message',
  source: 'WEBSITE',
  status: 'NEW',
  priority: 'MEDIUM',
  estimatedValue: 5000,
  serviceId: null,
  assignedToId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockTestimonial = (overrides = {}) => ({
  id: 'testimonial-123',
  name: 'Test Customer',
  company: 'Test Company',
  position: 'Test Position',
  content: 'Great service!',
  rating: 5,
  featured: false,
  approved: true,
  serviceId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockProject = (overrides = {}) => ({
  id: 'project-123',
  title: 'Test Project',
  slug: 'test-project',
  description: 'Test project description',
  content: 'Test project content',
  clientName: 'Test Client',
  location: 'Test Location',
  duration: '2 weeks',
  value: 10000,
  status: 'PUBLISHED',
  featured: false,
  published: true,
  publishedAt: new Date(),
  completedAt: new Date(),
  serviceId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockPost = (overrides = {}) => ({
  id: 'post-123',
  title: 'Test Post',
  slug: 'test-post',
  content: 'Test post content',
  excerpt: 'Test excerpt',
  category: 'Test Category',
  tags: ['tag1', 'tag2'],
  status: 'PUBLISHED',
  published: true,
  publishedAt: new Date(),
  authorId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockTeamMember = (overrides = {}) => ({
  id: 'team-123',
  name: 'Test Member',
  position: 'Test Position',
  bio: 'Test bio',
  specialties: ['Specialty 1', 'Specialty 2'],
  featured: false,
  active: true,
  order: 1,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

;(globalThis as any).createMockSetting = (overrides = {}) => ({
  id: 'setting-123',
  key: 'test_key',
  value: 'test_value',
  type: 'string',
  category: 'general',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Export the mock client for use in tests
export { mockPrismaClient }

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})