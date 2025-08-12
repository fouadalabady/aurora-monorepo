import { Client } from 'typesense'
import { getTypesenseConfig } from '@workspace/config'

// Define collection schema type based on Typesense documentation
type CollectionSchema = {
  name: string
  fields: Array<{
    name: string
    type: 'string' | 'string[]' | 'int32' | 'int64' | 'float' | 'bool' | 'geopoint' | 'geopoint[]' | 'object' | 'object[]' | 'auto'
    facet?: boolean
    optional?: boolean
    index?: boolean
    sort?: boolean
    infix?: boolean
    locale?: string
    stem?: boolean
  }>
  default_sorting_field?: string
  enable_nested_fields?: boolean
}

// Initialize Typesense client
export const typesenseClient = new Client(getTypesenseConfig())

// Collection names (equivalent to MeiliSearch indexes)
export const COLLECTIONS = {
  SERVICES: 'services',
  POSTS: 'posts',
  PAGES: 'pages',
  PROJECTS: 'projects',
  TESTIMONIALS: 'testimonials',
} as const

// Collection schemas for Typesense
export const COLLECTION_SCHEMAS: Record<string, CollectionSchema> = {
  [COLLECTIONS.SERVICES]: {
    name: COLLECTIONS.SERVICES,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'title', type: 'string' as const },
      { name: 'description', type: 'string' as const },
      { name: 'content', type: 'string' as const },
      { name: 'category', type: 'string' as const, facet: true },
      { name: 'tags', type: 'string[]' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'featured', type: 'bool' as const, facet: true },
      { name: 'priceType', type: 'string' as const, facet: true },
      { name: 'price', type: 'float' as const, optional: true },
      { name: 'createdAt', type: 'int64' as const },
      { name: 'updatedAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  [COLLECTIONS.POSTS]: {
    name: COLLECTIONS.POSTS,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'title', type: 'string' as const },
      { name: 'excerpt', type: 'string' as const },
      { name: 'content', type: 'string' as const },
      { name: 'tags', type: 'string[]' as const, facet: true },
      { name: 'category', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'featured', type: 'bool' as const, facet: true },
      { name: 'authorId', type: 'string' as const, facet: true },
      { name: 'publishedAt', type: 'int64' as const, optional: true },
      { name: 'createdAt', type: 'int64' as const },
      { name: 'updatedAt', type: 'int64' as const },
    ],
    default_sorting_field: 'publishedAt',
  },
  [COLLECTIONS.PAGES]: {
    name: COLLECTIONS.PAGES,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'title', type: 'string' as const },
      { name: 'content', type: 'string' as const },
      { name: 'metaDescription', type: 'string' as const },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'template', type: 'string' as const, facet: true },
      { name: 'createdAt', type: 'int64' as const },
      { name: 'updatedAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  [COLLECTIONS.PROJECTS]: {
    name: COLLECTIONS.PROJECTS,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'title', type: 'string' as const },
      { name: 'description', type: 'string' as const },
      { name: 'content', type: 'string' as const },
      { name: 'category', type: 'string' as const, facet: true },
      { name: 'tags', type: 'string[]' as const, facet: true },
      { name: 'location', type: 'string' as const },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'featured', type: 'bool' as const, facet: true },
      { name: 'completedAt', type: 'int64' as const, optional: true },
      { name: 'createdAt', type: 'int64' as const },
      { name: 'updatedAt', type: 'int64' as const },
    ],
    default_sorting_field: 'completedAt',
  },
  [COLLECTIONS.TESTIMONIALS]: {
    name: COLLECTIONS.TESTIMONIALS,
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'content', type: 'string' as const },
      { name: 'clientName', type: 'string' as const },
      { name: 'clientCompany', type: 'string' as const },
      { name: 'projectType', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'featured', type: 'bool' as const, facet: true },
      { name: 'rating', type: 'int32' as const, facet: true },
      { name: 'createdAt', type: 'int64' as const },
      { name: 'updatedAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
}

// Initialize collections with schemas
export async function initializeCollections() {
  try {
    console.log('Initializing Typesense collections...')
    
    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        // Check if collection exists
        await typesenseClient.collections(collectionName).retrieve()
        console.log(`Collection ${collectionName} already exists`)
      } catch (error) {
        // Collection doesn't exist, create it
        console.log(`Creating collection: ${collectionName}`)
        await typesenseClient.collections().create(schema)
        console.log(`Collection ${collectionName} created successfully`)
      }
    }
    
    console.log('Typesense collections initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Typesense collections:', error)
    throw error
  }
}

// Health check
export async function checkHealth() {
  try {
    const health = await typesenseClient.health.retrieve()
    return health.ok === true
  } catch (error) {
    console.error('Typesense health check failed:', error)
    return false
  }
}

// Get collection stats
export async function getCollectionStats(collectionName: string) {
  try {
    const collection = await typesenseClient.collections(collectionName).retrieve()
    return {
      name: collection.name,
      num_documents: collection.num_documents,
      created_at: collection.created_at,
    }
  } catch (error) {
    console.error(`Failed to get stats for collection ${collectionName}:`, error)
    return null
  }
}

// Clear all collections (useful for development)
export async function clearAllCollections() {
  try {
    console.log('Clearing all Typesense collections...')
    
    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        await typesenseClient.collections(collectionName).documents().delete({
          filter_by: 'id:!=null'
        })
        console.log(`Cleared collection: ${collectionName}`)
      } catch (error) {
        console.error(`Failed to clear collection ${collectionName}:`, error)
      }
    }
    
    console.log('All collections cleared successfully')
  } catch (error) {
    console.error('Failed to clear collections:', error)
    throw error
  }
}

// Drop and recreate all collections (useful for schema changes)
export async function recreateAllCollections() {
  try {
    console.log('Recreating all Typesense collections...')
    
    // Delete existing collections
    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        await typesenseClient.collections(collectionName).delete()
        console.log(`Deleted collection: ${collectionName}`)
      } catch (error) {
        // Collection might not exist, continue
        console.log(`Collection ${collectionName} doesn't exist or already deleted`)
      }
    }
    
    // Recreate collections
    await initializeCollections()
    
    console.log('All collections recreated successfully')
  } catch (error) {
    console.error('Failed to recreate collections:', error)
    throw error
  }
}