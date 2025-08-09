// Aurora Search Package
// Built with MeiliSearch for fast, typo-tolerant search

// Client and configuration
export {
  meiliClient,
  INDEXES,
  SEARCH_SETTINGS,
  initializeIndexes,
  checkHealth,
  getIndexStats,
  clearAllIndexes,
} from './client'

// Search utilities and functions
export {
  // Types and schemas
  searchQuerySchema,
  type SearchQuery,
  type SearchResult,
  
  // Service search
  searchServices,
  indexService,
  removeServiceFromIndex,
  
  // Post search
  searchPosts,
  indexPost,
  
  // Project search
  searchProjects,
  indexProject,
  
  // Testimonial search
  searchTestimonials,
  indexTestimonial,
  
  // Page search
  searchPages,
  indexPage,
  
  // Bulk indexing
  indexAllServices,
  indexAllPosts,
  indexAllProjects,
  indexAllTestimonials,
  indexAllPages,
  
  // Global search
  globalSearch,
  reindexAll,
} from './utils'

// Constants
export const SEARCH_CONSTANTS = {
  MAX_QUERY_LENGTH: 500,
  MAX_RESULTS_PER_PAGE: 100,
  DEFAULT_RESULTS_PER_PAGE: 20,
  MAX_CROP_LENGTH: 200,
  DEFAULT_CROP_LENGTH: 50,
  SEARCH_TIMEOUT: 5000, // 5 seconds
} as const

// Helper functions
export function isValidSearchQuery(query: string): boolean {
  return query.trim().length > 0 && query.length <= SEARCH_CONSTANTS.MAX_QUERY_LENGTH
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially harmful characters
    .substring(0, SEARCH_CONSTANTS.MAX_QUERY_LENGTH)
}

export function buildSearchFilter(filters: Record<string, any>): string {
  const filterParts: string[] = []
  
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        const values = value.map(v => `"${v}"`).join(', ')
        filterParts.push(`${key} IN [${values}]`)
      }
    } else if (typeof value === 'string') {
      filterParts.push(`${key} = "${value}"`)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      filterParts.push(`${key} = ${value}`)
    } else if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
      // Range filter
      filterParts.push(`${key} ${value.from} TO ${value.to}`)
    }
  }
  
  return filterParts.join(' AND ')
}

export function buildSortArray(sort: Record<string, 'asc' | 'desc'>): string[] {
  return Object.entries(sort).map(([field, direction]) => `${field}:${direction}`)
}

// Search result helpers
export function extractHighlights(hit: any, attribute: string): string[] {
  const formatted = hit._formatted?.[attribute]
  if (!formatted) return []
  
  const highlights: string[] = []
  const regex = /<mark>(.*?)<\/mark>/g
  let match
  
  while ((match = regex.exec(formatted)) !== null) {
    highlights.push(match[1])
  }
  
  return highlights
}

export function removeHighlightTags(text: string): string {
  return text.replace(/<mark>(.*?)<\/mark>/g, '$1')
}

export function getSearchResultSnippet(hit: any, attribute: string, maxLength: number = 150): string {
  const formatted = hit._formatted?.[attribute] || hit[attribute] || ''
  const withoutTags = removeHighlightTags(formatted)
  
  if (withoutTags.length <= maxLength) {
    return withoutTags
  }
  
  return withoutTags.substring(0, maxLength).trim() + '...'
}

// Error handling
export class SearchError extends Error {
  constructor(
    message: string,
    public code?: string,
    public index?: string
  ) {
    super(message)
    this.name = 'SearchError'
  }
}

export function isSearchError(error: any): error is SearchError {
  return error instanceof SearchError
}

export function createSearchError(message: string, code?: string, index?: string): SearchError {
  return new SearchError(message, code, index)
}

// Search analytics helpers
export interface SearchAnalytics {
  query: string
  index: string
  resultsCount: number
  processingTime: number
  timestamp: Date
  userId?: string
}

export function trackSearch(analytics: SearchAnalytics): void {
  // In a real implementation, you might send this to an analytics service
  console.log('Search tracked:', analytics)
}

// Type guards
export function isServiceHit(hit: any): boolean {
  return hit && typeof hit.title === 'string' && typeof hit.description === 'string'
}

export function isPostHit(hit: any): boolean {
  return hit && typeof hit.title === 'string' && typeof hit.excerpt === 'string'
}

export function isProjectHit(hit: any): boolean {
  return hit && typeof hit.title === 'string' && hit.completedAt !== undefined
}

export function isTestimonialHit(hit: any): boolean {
  return hit && typeof hit.content === 'string' && typeof hit.clientName === 'string'
}

export function isPageHit(hit: any): boolean {
  return hit && typeof hit.title === 'string' && hit.template !== undefined
}