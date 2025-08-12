import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  searchQuerySchema,
  searchServices,
  indexService,
  removeServiceFromIndex,
  searchPosts,
  indexPost,
  searchProjects,
  indexProject,
  searchTestimonials,
  indexTestimonial,
  searchPages,
  indexPage,
  indexAllServices,
  indexAllPosts,
  indexAllProjects,
  indexAllTestimonials,
  indexAllPages,
  globalSearch,
  reindexAll,
} from '../utils'
import { typesenseClient, COLLECTIONS } from '../client'

// Mock the client
vi.mock('../client', () => ({
  typesenseClient: {
    collections: vi.fn(),
    multiSearch: {
      perform: vi.fn(),
    },
  },
  COLLECTIONS: {
    SERVICES: 'services',
    POSTS: 'posts',
    PAGES: 'pages',
    PROJECTS: 'projects',
    TESTIMONIALS: 'testimonials',
  },
}))

describe('Search Utils', () => {
  const mockSearch = vi.fn()
  const mockUpsert = vi.fn()
  const mockDelete = vi.fn()
  const mockImport = vi.fn()
  const mockDocuments = vi.fn(() => ({
    search: mockSearch,
    upsert: mockUpsert,
    delete: mockDelete,
    import: mockImport,
  }))
  const mockCollections = vi.fn(() => ({
    documents: mockDocuments,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    ;(typesenseClient.collections as any) = mockCollections
    ;(typesenseClient.multiSearch.perform as any) = vi.fn()
  })

  describe('searchQuerySchema', () => {
    it('should validate valid search query', () => {
      const validQuery = {
        q: 'test query',
        per_page: 10,
        page: 1,
      }
      
      const result = searchQuerySchema.parse(validQuery)
      expect(result).toEqual(validQuery)
    })

    it('should apply defaults', () => {
      const result = searchQuerySchema.parse({})
      expect(result.per_page).toBe(20)
      expect(result.page).toBe(1)
    })

    it('should validate per_page limits', () => {
      expect(() => searchQuerySchema.parse({ per_page: 0 })).toThrow()
      expect(() => searchQuerySchema.parse({ per_page: 101 })).toThrow()
    })

    it('should validate page minimum', () => {
      expect(() => searchQuerySchema.parse({ page: 0 })).toThrow()
    })
  })

  describe('searchServices', () => {
    it('should search services with basic query', async () => {
      const mockResult = {
        hits: [{ id: '1', title: 'Test Service' }],
        found: 1,
        search_time_ms: 10,
      }
      mockSearch.mockResolvedValue(mockResult)

      const result = await searchServices({ q: 'test' })

      expect(mockCollections).toHaveBeenCalledWith('services')
      expect(mockSearch).toHaveBeenCalledWith({
        q: 'test',
        query_by: 'title,description,content,category,tags',
        per_page: 20,
        page: 1,
      })
      expect(result).toEqual(mockResult)
    })

    it('should search services with filters and sorting', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 5 }
      mockSearch.mockResolvedValue(mockResult)

      await searchServices({
        q: 'hvac',
        filter_by: 'category:hvac_installation',
        sort_by: 'createdAt:desc',
        per_page: 10,
        page: 2,
        highlight_fields: ['title', 'description'],
        facet_by: 'category',
      })

      expect(mockSearch).toHaveBeenCalledWith({
        q: 'hvac',
        query_by: 'title,description,content,category,tags',
        filter_by: 'category:hvac_installation',
        sort_by: 'createdAt:desc',
        per_page: 10,
        page: 2,
        highlight_fields: 'title,description',
        facet_by: 'category',
      })
    })

    it('should handle empty query', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 1 }
      mockSearch.mockResolvedValue(mockResult)

      await searchServices({})

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({ q: '*' })
      )
    })
  })

  describe('indexService', () => {
    it('should index a service successfully', async () => {
      mockUpsert.mockResolvedValue({ id: 'service-1' })

      const result = await indexService('service-1')

      expect(mockCollections).toHaveBeenCalledWith('services')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'service-1',
          title: 'HVAC Installation',
          category: 'hvac_installation',
        })
      )
      expect(result).toEqual({ success: true, serviceId: 'service-1' })
    })

    it('should handle indexing errors', async () => {
      mockUpsert.mockRejectedValue(new Error('Index failed'))

      await expect(indexService('service-1')).rejects.toThrow('Index failed')
    })
  })

  describe('removeServiceFromIndex', () => {
    it('should remove service from index', async () => {
      const mockDocumentDelete = vi.fn().mockResolvedValue({})
      mockDocuments.mockReturnValue({
        search: mockSearch,
        upsert: mockUpsert,
        delete: mockDelete,
        import: mockImport,
      })
      mockCollections.mockReturnValue({
        documents: vi.fn(() => mockDocumentDelete),
      })

      const result = await removeServiceFromIndex('service-1')

      expect(result).toEqual({ success: true, serviceId: 'service-1' })
    })

    it('should handle removal errors', async () => {
      const mockDocumentDelete = vi.fn().mockRejectedValue(new Error('Delete failed'))
      mockCollections.mockReturnValue({
        documents: vi.fn(() => mockDocumentDelete),
      })

      await expect(removeServiceFromIndex('service-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('searchPosts', () => {
    it('should search posts with correct query fields', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 5 }
      mockSearch.mockResolvedValue(mockResult)

      await searchPosts({ q: 'maintenance' })

      expect(mockCollections).toHaveBeenCalledWith('posts')
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_by: 'title,excerpt,content,tags,category',
        })
      )
    })
  })

  describe('indexPost', () => {
    it('should index a post successfully', async () => {
      mockUpsert.mockResolvedValue({ id: 'post-1' })

      const result = await indexPost('post-1')

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'post-1',
          title: 'How to Maintain Your HVAC System',
          category: 'maintenance',
        })
      )
      expect(result).toEqual({ success: true, postId: 'post-1' })
    })
  })

  describe('searchProjects', () => {
    it('should search projects with location field', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 5 }
      mockSearch.mockResolvedValue(mockResult)

      await searchProjects({ q: 'commercial' })

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_by: 'title,description,content,category,tags,location',
        })
      )
    })
  })

  describe('indexProject', () => {
    it('should index a project successfully', async () => {
      mockUpsert.mockResolvedValue({ id: 'project-1' })

      const result = await indexProject('project-1')

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'project-1',
          title: 'Commercial HVAC Installation',
          location: 'Downtown Office Complex',
        })
      )
      expect(result).toEqual({ success: true, projectId: 'project-1' })
    })
  })

  describe('searchTestimonials', () => {
    it('should search testimonials with client fields', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 5 }
      mockSearch.mockResolvedValue(mockResult)

      await searchTestimonials({ q: 'excellent' })

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_by: 'content,clientName,clientCompany,projectType',
        })
      )
    })
  })

  describe('indexTestimonial', () => {
    it('should index a testimonial successfully', async () => {
      mockUpsert.mockResolvedValue({ id: 'testimonial-1' })

      const result = await indexTestimonial('testimonial-1')

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'testimonial-1',
          content: 'Excellent service! The team was professional and efficient.',
          clientName: 'John Smith',
          rating: 5,
        })
      )
      expect(result).toEqual({ success: true, testimonialId: 'testimonial-1' })
    })
  })

  describe('searchPages', () => {
    it('should search pages with meta description', async () => {
      const mockResult = { hits: [], found: 0, search_time_ms: 5 }
      mockSearch.mockResolvedValue(mockResult)

      await searchPages({ q: 'about' })

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query_by: 'title,content,metaDescription',
        })
      )
    })
  })

  describe('indexPage', () => {
    it('should index a page successfully', async () => {
      mockUpsert.mockResolvedValue({ id: 'page-1' })

      const result = await indexPage('page-1')

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'page-1',
          title: 'About Us',
          template: 'default',
        })
      )
      expect(result).toEqual({ success: true, pageId: 'page-1' })
    })
  })

  describe('bulk indexing functions', () => {
    beforeEach(() => {
      mockImport.mockResolvedValue({})
    })

    describe('indexAllServices', () => {
      it('should index all services', async () => {
        const result = await indexAllServices()

        expect(mockCollections).toHaveBeenCalledWith('services')
        expect(mockImport).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'service-1', title: 'HVAC Installation' }),
            expect.objectContaining({ id: 'service-2', title: 'HVAC Repair' }),
          ])
        )
        expect(result).toEqual({ success: true, count: 2 })
      })

      it('should handle import errors', async () => {
        mockImport.mockRejectedValue(new Error('Import failed'))

        await expect(indexAllServices()).rejects.toThrow('Import failed')
      })
    })

    describe('indexAllPosts', () => {
      it('should index all posts', async () => {
        const result = await indexAllPosts()

        expect(mockCollections).toHaveBeenCalledWith('posts')
        expect(mockImport).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'post-1', title: 'How to Maintain Your HVAC System' }),
          ])
        )
        expect(result).toEqual({ success: true, count: 1 })
      })
    })

    describe('indexAllProjects', () => {
      it('should index all projects', async () => {
        const result = await indexAllProjects()

        expect(mockImport).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'project-1', title: 'Commercial HVAC Installation' }),
          ])
        )
        expect(result).toEqual({ success: true, count: 1 })
      })
    })

    describe('indexAllTestimonials', () => {
      it('should index all testimonials', async () => {
        const result = await indexAllTestimonials()

        expect(mockImport).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'testimonial-1', clientName: 'John Smith' }),
          ])
        )
        expect(result).toEqual({ success: true, count: 1 })
      })
    })

    describe('indexAllPages', () => {
      it('should index all pages', async () => {
        const result = await indexAllPages()

        expect(mockImport).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'page-1', title: 'About Us' }),
          ])
        )
        expect(result).toEqual({ success: true, count: 1 })
      })
    })
  })

  describe('globalSearch', () => {
    it('should perform multi-collection search', async () => {
      const mockMultiSearchResult = {
        results: [
          { found: 5, hits: [] },
          { found: 3, hits: [] },
          { found: 2, hits: [] },
        ],
      }
      ;(typesenseClient.multiSearch.perform as any).mockResolvedValue(mockMultiSearchResult)

      const result = await globalSearch('test query')

      expect(typesenseClient.multiSearch.perform).toHaveBeenCalledWith({
        searches: expect.arrayContaining([
          expect.objectContaining({
            collection: 'services',
            q: 'test query',
            query_by: 'title,description,content,category,tags',
          }),
          expect.objectContaining({
            collection: 'posts',
            q: 'test query',
            query_by: 'title,excerpt,content,tags,category',
          }),
        ]),
      })
      expect(result.total_found).toBe(10)
    })

    it('should handle empty query', async () => {
      const mockMultiSearchResult = { results: [] }
      ;(typesenseClient.multiSearch.perform as any).mockResolvedValue(mockMultiSearchResult)

      await globalSearch('')

      expect(typesenseClient.multiSearch.perform).toHaveBeenCalledWith({
        searches: expect.arrayContaining([
          expect.objectContaining({ q: '*' }),
        ]),
      })
    })

    it('should handle custom options', async () => {
      const mockMultiSearchResult = { results: [] }
      ;(typesenseClient.multiSearch.perform as any).mockResolvedValue(mockMultiSearchResult)

      await globalSearch('test', {
        collections: ['services', 'posts'],
        per_page: 10,
        highlight_fields: ['title'],
        facet_by: 'category',
      })

      expect(typesenseClient.multiSearch.perform).toHaveBeenCalledWith({
        searches: [
          expect.objectContaining({
            collection: 'services',
            per_page: 10,
            highlight_fields: 'title',
            facet_by: 'category',
          }),
          expect.objectContaining({
            collection: 'posts',
            per_page: 10,
            highlight_fields: 'title',
            facet_by: 'category',
          }),
        ],
      })
    })
  })

  describe('reindexAll', () => {
    it('should reindex all collections successfully', async () => {
      mockImport.mockResolvedValue({})

      const result = await reindexAll()

      expect(result.success).toBe(true)
      expect(result.successful).toBe(5)
      expect(result.failed).toBe(0)
    })

    it('should handle partial failures', async () => {
      mockImport
        .mockResolvedValueOnce({}) // services
        .mockRejectedValueOnce(new Error('Posts failed')) // posts
        .mockResolvedValueOnce({}) // projects
        .mockResolvedValueOnce({}) // testimonials
        .mockResolvedValueOnce({}) // pages

      const result = await reindexAll()

      expect(result.success).toBe(false)
      expect(result.successful).toBe(4)
      expect(result.failed).toBe(1)
      expect(result.errors).toBeDefined()
    })

    it('should handle complete failure', async () => {
      mockImport.mockRejectedValue(new Error('All failed'))

      const result = await reindexAll()

      expect(result.success).toBe(false)
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(5)
    })
  })
})