import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  typesenseClient,
  COLLECTIONS,
  COLLECTION_SCHEMAS,
  initializeCollections,
  checkHealth,
  getCollectionStats,
  clearAllCollections,
  recreateAllCollections,
} from '../client'

// Mock the config package
vi.mock('@workspace/config', () => ({
  getTypesenseConfig: () => ({
    nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
    apiKey: 'test-api-key',
    connectionTimeoutSeconds: 2,
  }),
}))

describe('Search Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('typesenseClient', () => {
    it('should be properly initialized', () => {
      expect(typesenseClient).toBeDefined()
      expect(typesenseClient.collections).toBeDefined()
      expect(typesenseClient.health).toBeDefined()
    })
  })

  describe('COLLECTIONS', () => {
    it('should define all required collections', () => {
      expect(COLLECTIONS.SERVICES).toBe('services')
      expect(COLLECTIONS.POSTS).toBe('posts')
      expect(COLLECTIONS.PAGES).toBe('pages')
      expect(COLLECTIONS.PROJECTS).toBe('projects')
      expect(COLLECTIONS.TESTIMONIALS).toBe('testimonials')
    })
  })

  describe('COLLECTION_SCHEMAS', () => {
    it('should have schemas for all collections', () => {
      expect(COLLECTION_SCHEMAS[COLLECTIONS.SERVICES]).toBeDefined()
      expect(COLLECTION_SCHEMAS[COLLECTIONS.POSTS]).toBeDefined()
      expect(COLLECTION_SCHEMAS[COLLECTIONS.PAGES]).toBeDefined()
      expect(COLLECTION_SCHEMAS[COLLECTIONS.PROJECTS]).toBeDefined()
      expect(COLLECTION_SCHEMAS[COLLECTIONS.TESTIMONIALS]).toBeDefined()
    })

    it('should have valid service schema', () => {
      const schema = COLLECTION_SCHEMAS[COLLECTIONS.SERVICES]
      expect(schema.name).toBe('services')
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'id', type: 'string' })
      )
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'title', type: 'string' })
      )
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'category', type: 'string', facet: true })
      )
      expect(schema.default_sorting_field).toBe('createdAt')
    })

    it('should have valid posts schema', () => {
      const schema = COLLECTION_SCHEMAS[COLLECTIONS.POSTS]
      expect(schema.name).toBe('posts')
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'title', type: 'string' })
      )
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'tags', type: 'string[]', facet: true })
      )
      expect(schema.default_sorting_field).toBe('publishedAt')
    })
  })

  describe('initializeCollections', () => {
    it('should initialize collections successfully', async () => {
      const mockRetrieve = vi.fn().mockRejectedValue(new Error('Not found'))
      const mockCreate = vi.fn().mockResolvedValue({ name: 'test' })
      const mockCollections = vi.fn(() => ({
        retrieve: mockRetrieve,
        create: mockCreate,
      }))
      
      typesenseClient.collections = mockCollections as any
      
      await initializeCollections()
      
      expect(mockCollections).toHaveBeenCalledWith('services')
      expect(mockCollections).toHaveBeenCalledWith('posts')
      expect(mockCollections).toHaveBeenCalledWith('pages')
      expect(mockCollections).toHaveBeenCalledWith('projects')
      expect(mockCollections).toHaveBeenCalledWith('testimonials')
    })

    it('should skip existing collections', async () => {
      const mockRetrieve = vi.fn().mockResolvedValue({ name: 'existing' })
      const mockCreate = vi.fn()
      const mockCollections = vi.fn(() => ({
        retrieve: mockRetrieve,
        create: mockCreate,
      }))
      
      typesenseClient.collections = mockCollections as any
      
      await initializeCollections()
      
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should handle initialization errors', async () => {
      const mockCollections = vi.fn(() => {
        throw new Error('Connection failed')
      })
      
      typesenseClient.collections = mockCollections as any
      
      await expect(initializeCollections()).rejects.toThrow('Connection failed')
    })
  })

  describe('checkHealth', () => {
    it('should return true when healthy', async () => {
      const mockRetrieve = vi.fn().mockResolvedValue({ ok: true })
      typesenseClient.health = { retrieve: mockRetrieve } as any
      
      const result = await checkHealth()
      
      expect(result).toBe(true)
      expect(mockRetrieve).toHaveBeenCalled()
    })

    it('should return false when unhealthy', async () => {
      const mockRetrieve = vi.fn().mockResolvedValue({ ok: false })
      typesenseClient.health = { retrieve: mockRetrieve } as any
      
      const result = await checkHealth()
      
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      const mockRetrieve = vi.fn().mockRejectedValue(new Error('Connection failed'))
      typesenseClient.health = { retrieve: mockRetrieve } as any
      
      const result = await checkHealth()
      
      expect(result).toBe(false)
    })
  })

  describe('getCollectionStats', () => {
    it('should return collection stats', async () => {
      const mockStats = {
        name: 'services',
        num_documents: 10,
        created_at: 1234567890,
      }
      
      const mockRetrieve = vi.fn().mockResolvedValue(mockStats)
      const mockCollections = vi.fn(() => ({ retrieve: mockRetrieve }))
      typesenseClient.collections = mockCollections as any
      
      const result = await getCollectionStats('services')
      
      expect(result).toEqual(mockStats)
      expect(mockCollections).toHaveBeenCalledWith('services')
    })

    it('should return null on error', async () => {
      const mockRetrieve = vi.fn().mockRejectedValue(new Error('Not found'))
      const mockCollections = vi.fn(() => ({ retrieve: mockRetrieve }))
      typesenseClient.collections = mockCollections as any
      
      const result = await getCollectionStats('nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('clearAllCollections', () => {
    it('should clear all collections', async () => {
      const mockDelete = vi.fn().mockResolvedValue({})
      const mockDocuments = vi.fn(() => ({ delete: mockDelete }))
      const mockCollections = vi.fn(() => ({ documents: mockDocuments }))
      typesenseClient.collections = mockCollections as any
      
      await clearAllCollections()
      
      expect(mockCollections).toHaveBeenCalledWith('services')
      expect(mockCollections).toHaveBeenCalledWith('posts')
      expect(mockCollections).toHaveBeenCalledWith('pages')
      expect(mockCollections).toHaveBeenCalledWith('projects')
      expect(mockCollections).toHaveBeenCalledWith('testimonials')
      expect(mockDelete).toHaveBeenCalledWith({ filter_by: 'id:!=null' })
    })

    it('should handle individual collection errors gracefully', async () => {
      const mockDelete = vi.fn()
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValue({})
      
      const mockDocuments = vi.fn(() => ({ delete: mockDelete }))
      const mockCollections = vi.fn(() => ({ documents: mockDocuments }))
      typesenseClient.collections = mockCollections as any
      
      await expect(clearAllCollections()).resolves.not.toThrow()
    })
  })

  describe('recreateAllCollections', () => {
    it('should recreate all collections', async () => {
      const mockDelete = vi.fn().mockResolvedValue({})
      const mockCreate = vi.fn().mockResolvedValue({})
      const mockCollections = vi.fn(() => ({ delete: mockDelete }))
      
      typesenseClient.collections = Object.assign(mockCollections, {
        create: mockCreate,
      }) as any
      
      await recreateAllCollections()
      
      expect(mockDelete).toHaveBeenCalledTimes(5) // One for each collection
      expect(mockCreate).toHaveBeenCalledTimes(5) // One for each collection
    })
  })
})