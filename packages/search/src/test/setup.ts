import { vi, beforeEach, afterEach } from 'vitest'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.SEARCH_API_KEY = 'test-api-key'
process.env.SEARCH_APP_ID = 'test-app-id'
process.env.SEARCH_INDEX_NAME = 'test-index'

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
vi.stubGlobal('console', {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
})

// Mock fetch for API calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock search client (if using external search service like Algolia)
vi.mock('algoliasearch', () => ({
  default: vi.fn(() => ({
    initIndex: vi.fn(() => ({
      search: vi.fn(),
      addObjects: vi.fn(),
      saveObjects: vi.fn(),
      deleteObjects: vi.fn(),
      clearObjects: vi.fn(),
      setSettings: vi.fn(),
      getSettings: vi.fn(),
    })),
    listIndices: vi.fn(),
    copyIndex: vi.fn(),
    moveIndex: vi.fn(),
    deleteIndex: vi.fn(),
  })),
}))

// Global test utilities
global.createMockSearchResult = (overrides = {}) => ({
  objectID: 'result-123',
  title: 'Test Result',
  content: 'Test content for search result',
  type: 'service',
  url: '/services/test-service',
  image: '/images/test.jpg',
  category: 'Installation',
  tags: ['hvac', 'installation'],
  score: 0.95,
  ...overrides,
})

global.createMockSearchResponse = (overrides = {}) => ({
  hits: [
    createMockSearchResult(),
    createMockSearchResult({ objectID: 'result-456', title: 'Another Result' }),
  ],
  nbHits: 2,
  page: 0,
  nbPages: 1,
  hitsPerPage: 20,
  processingTimeMS: 1,
  query: 'test query',
  params: 'query=test%20query',
  ...overrides,
})

global.createMockSearchQuery = (overrides = {}) => ({
  query: 'test query',
  filters: '',
  facetFilters: [],
  numericFilters: [],
  page: 0,
  hitsPerPage: 20,
  attributesToRetrieve: ['*'],
  attributesToHighlight: ['title', 'content'],
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  ...overrides,
})

global.createMockIndexableContent = (overrides = {}) => ({
  objectID: 'content-123',
  title: 'Test Content',
  content: 'This is test content for indexing',
  type: 'service',
  url: '/services/test-content',
  image: '/images/test-content.jpg',
  category: 'Installation',
  tags: ['hvac', 'installation'],
  published: true,
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockClear()
})

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks()
})

// Export mock fetch for use in tests
export { mockFetch }