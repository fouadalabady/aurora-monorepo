import { describe, it, expect } from 'vitest'
import {
  SEARCH_CONSTANTS,
  isValidSearchQuery,
  sanitizeSearchQuery,
  buildSearchFilter,
  buildSortArray,
  extractHighlights,
  removeHighlightTags,
  getSearchResultSnippet,
  SearchError,
  isSearchError,
  createSearchError,
  trackSearch,
  isServiceHit,
  isPostHit,
  isProjectHit,
  isTestimonialHit,
  isPageHit,
} from '../index'

describe('Search Index Exports', () => {
  describe('SEARCH_CONSTANTS', () => {
    it('should define all required constants', () => {
      expect(SEARCH_CONSTANTS.MAX_QUERY_LENGTH).toBe(500)
      expect(SEARCH_CONSTANTS.MAX_RESULTS_PER_PAGE).toBe(100)
      expect(SEARCH_CONSTANTS.DEFAULT_RESULTS_PER_PAGE).toBe(20)
      expect(SEARCH_CONSTANTS.MAX_CROP_LENGTH).toBe(200)
      expect(SEARCH_CONSTANTS.DEFAULT_CROP_LENGTH).toBe(50)
      expect(SEARCH_CONSTANTS.SEARCH_TIMEOUT).toBe(5000)
    })
  })

  describe('isValidSearchQuery', () => {
    it('should return true for valid queries', () => {
      expect(isValidSearchQuery('test')).toBe(true)
      expect(isValidSearchQuery('hvac installation')).toBe(true)
      expect(isValidSearchQuery('a'.repeat(500))).toBe(true)
    })

    it('should return false for invalid queries', () => {
      expect(isValidSearchQuery('')).toBe(false)
      expect(isValidSearchQuery('   ')).toBe(false)
      expect(isValidSearchQuery('a'.repeat(501))).toBe(false)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should remove harmful characters', () => {
      expect(sanitizeSearchQuery('test<script>')).toBe('testscript')
      expect(sanitizeSearchQuery('query"with"quotes')).toBe('querywithquotes')
      expect(sanitizeSearchQuery("query'with'quotes")).toBe('querywithquotes')
      expect(sanitizeSearchQuery('query&with&ampersand')).toBe('querywithampersand')
    })

    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  test query  ')).toBe('test query')
    })

    it('should limit length', () => {
      const longQuery = 'a'.repeat(600)
      const result = sanitizeSearchQuery(longQuery)
      expect(result.length).toBe(500)
    })

    it('should handle empty strings', () => {
      expect(sanitizeSearchQuery('')).toBe('')
      expect(sanitizeSearchQuery('   ')).toBe('')
    })
  })

  describe('buildSearchFilter', () => {
    it('should build string filters', () => {
      const filters = { category: 'hvac', status: 'published' }
      const result = buildSearchFilter(filters)
      expect(result).toBe('category = "hvac" AND status = "published"')
    })

    it('should build number filters', () => {
      const filters = { price: 100, rating: 5 }
      const result = buildSearchFilter(filters)
      expect(result).toBe('price = 100 AND rating = 5')
    })

    it('should build boolean filters', () => {
      const filters = { featured: true, active: false }
      const result = buildSearchFilter(filters)
      expect(result).toBe('featured = true AND active = false')
    })

    it('should build array filters', () => {
      const filters = { tags: ['hvac', 'installation'] }
      const result = buildSearchFilter(filters)
      expect(result).toBe('tags IN ["hvac", "installation"]')
    })

    it('should build range filters', () => {
      const filters = { price: { from: 100, to: 500 } }
      const result = buildSearchFilter(filters)
      expect(result).toBe('price 100 TO 500')
    })

    it('should skip null and undefined values', () => {
      const filters = { category: 'hvac', status: null, rating: undefined }
      const result = buildSearchFilter(filters)
      expect(result).toBe('category = "hvac"')
    })

    it('should skip empty arrays', () => {
      const filters = { category: 'hvac', tags: [] }
      const result = buildSearchFilter(filters)
      expect(result).toBe('category = "hvac"')
    })

    it('should return empty string for empty filters', () => {
      expect(buildSearchFilter({})).toBe('')
      expect(buildSearchFilter({ value: null })).toBe('')
    })
  })

  describe('buildSortArray', () => {
    it('should build sort array from object', () => {
      const sort = { createdAt: 'desc' as const, title: 'asc' as const }
      const result = buildSortArray(sort)
      expect(result).toEqual(['createdAt:desc', 'title:asc'])
    })

    it('should handle empty sort object', () => {
      const result = buildSortArray({})
      expect(result).toEqual([])
    })
  })

  describe('extractHighlights', () => {
    it('should extract highlighted text', () => {
      const hit = {
        _formatted: {
          title: 'This is a <mark>test</mark> with <mark>highlights</mark>',
        },
      }
      const result = extractHighlights(hit, 'title')
      expect(result).toEqual(['test', 'highlights'])
    })

    it('should return empty array when no highlights', () => {
      const hit = {
        _formatted: {
          title: 'This is a test without highlights',
        },
      }
      const result = extractHighlights(hit, 'title')
      expect(result).toEqual([])
    })

    it('should return empty array when no formatted data', () => {
      const hit = { title: 'Test' }
      const result = extractHighlights(hit, 'title')
      expect(result).toEqual([])
    })
  })

  describe('removeHighlightTags', () => {
    it('should remove highlight tags', () => {
      const text = 'This is a <mark>test</mark> with <mark>highlights</mark>'
      const result = removeHighlightTags(text)
      expect(result).toBe('This is a test with highlights')
    })

    it('should handle text without tags', () => {
      const text = 'This is plain text'
      const result = removeHighlightTags(text)
      expect(result).toBe('This is plain text')
    })

    it('should handle empty string', () => {
      expect(removeHighlightTags('')).toBe('')
    })
  })

  describe('getSearchResultSnippet', () => {
    it('should return full text when under limit', () => {
      const hit = {
        _formatted: {
          content: 'Short content',
        },
      }
      const result = getSearchResultSnippet(hit, 'content', 150)
      expect(result).toBe('Short content')
    })

    it('should truncate long text', () => {
      const longText = 'a'.repeat(200)
      const hit = {
        _formatted: {
          content: longText,
        },
      }
      const result = getSearchResultSnippet(hit, 'content', 100)
      expect(result).toBe('a'.repeat(100) + '...')
    })

    it('should remove highlight tags before truncating', () => {
      const hit = {
        _formatted: {
          content: 'This is a <mark>test</mark> content that is quite long and should be truncated',
        },
      }
      const result = getSearchResultSnippet(hit, 'content', 50)
      expect(result).toBe('This is a test content that is quite long and ...')
    })

    it('should fallback to original attribute when no formatted data', () => {
      const hit = {
        content: 'Original content',
      }
      const result = getSearchResultSnippet(hit, 'content', 150)
      expect(result).toBe('Original content')
    })

    it('should handle missing attribute', () => {
      const hit = {}
      const result = getSearchResultSnippet(hit, 'content', 150)
      expect(result).toBe('')
    })
  })

  describe('SearchError', () => {
    it('should create SearchError with message', () => {
      const error = new SearchError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('SearchError')
      expect(error.code).toBeUndefined()
      expect(error.index).toBeUndefined()
    })

    it('should create SearchError with code and index', () => {
      const error = new SearchError('Test error', 'SEARCH_FAILED', 'services')
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('SEARCH_FAILED')
      expect(error.index).toBe('services')
    })
  })

  describe('isSearchError', () => {
    it('should return true for SearchError instances', () => {
      const error = new SearchError('Test')
      expect(isSearchError(error)).toBe(true)
    })

    it('should return false for regular errors', () => {
      const error = new Error('Test')
      expect(isSearchError(error)).toBe(false)
    })

    it('should return false for non-error objects', () => {
      expect(isSearchError({})).toBe(false)
      expect(isSearchError('string')).toBe(false)
      expect(isSearchError(null)).toBe(false)
    })
  })

  describe('createSearchError', () => {
    it('should create SearchError with all parameters', () => {
      const error = createSearchError('Test error', 'SEARCH_FAILED', 'services')
      expect(error).toBeInstanceOf(SearchError)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('SEARCH_FAILED')
      expect(error.index).toBe('services')
    })

    it('should create SearchError with minimal parameters', () => {
      const error = createSearchError('Test error')
      expect(error).toBeInstanceOf(SearchError)
      expect(error.message).toBe('Test error')
    })
  })

  describe('trackSearch', () => {
    it('should track search analytics', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const analytics = {
        query: 'test query',
        index: 'services',
        resultsCount: 10,
        processingTime: 50,
        timestamp: new Date(),
        userId: 'user-123',
      }
      
      trackSearch(analytics)
      
      expect(consoleSpy).toHaveBeenCalledWith('Search tracked:', analytics)
      
      consoleSpy.mockRestore()
    })
  })

  describe('type guards', () => {
    describe('isServiceHit', () => {
      it('should return true for valid service hits', () => {
        const hit = {
          title: 'HVAC Installation',
          description: 'Professional service',
        }
        expect(isServiceHit(hit)).toBe(true)
      })

      it('should return false for invalid service hits', () => {
        expect(isServiceHit({})).toBe(false)
        expect(isServiceHit({ title: 'Test' })).toBe(false)
        expect(isServiceHit({ description: 'Test' })).toBe(false)
        expect(isServiceHit(null)).toBe(false)
      })
    })

    describe('isPostHit', () => {
      it('should return true for valid post hits', () => {
        const hit = {
          title: 'Blog Post',
          excerpt: 'Post excerpt',
        }
        expect(isPostHit(hit)).toBe(true)
      })

      it('should return false for invalid post hits', () => {
        expect(isPostHit({})).toBe(false)
        expect(isPostHit({ title: 'Test' })).toBe(false)
        expect(isPostHit({ excerpt: 'Test' })).toBe(false)
      })
    })

    describe('isProjectHit', () => {
      it('should return true for valid project hits', () => {
        const hit = {
          title: 'Project Title',
          completedAt: 1234567890,
        }
        expect(isProjectHit(hit)).toBe(true)
      })

      it('should return false for invalid project hits', () => {
        expect(isProjectHit({})).toBe(false)
        expect(isProjectHit({ title: 'Test' })).toBe(false)
        expect(isProjectHit({ completedAt: 123 })).toBe(false)
      })
    })

    describe('isTestimonialHit', () => {
      it('should return true for valid testimonial hits', () => {
        const hit = {
          content: 'Great service!',
          clientName: 'John Doe',
        }
        expect(isTestimonialHit(hit)).toBe(true)
      })

      it('should return false for invalid testimonial hits', () => {
        expect(isTestimonialHit({})).toBe(false)
        expect(isTestimonialHit({ content: 'Test' })).toBe(false)
        expect(isTestimonialHit({ clientName: 'Test' })).toBe(false)
      })
    })

    describe('isPageHit', () => {
      it('should return true for valid page hits', () => {
        const hit = {
          title: 'Page Title',
          template: 'default',
        }
        expect(isPageHit(hit)).toBe(true)
      })

      it('should return false for invalid page hits', () => {
        expect(isPageHit({})).toBe(false)
        expect(isPageHit({ title: 'Test' })).toBe(false)
        expect(isPageHit({ template: 'default' })).toBe(false)
      })
    })
  })
})