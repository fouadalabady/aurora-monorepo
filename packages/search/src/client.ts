import { MeiliSearch } from 'meilisearch'

// Initialize MeiliSearch client
export const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
})

// Index names
export const INDEXES = {
  SERVICES: 'services',
  POSTS: 'posts',
  PAGES: 'pages',
  PROJECTS: 'projects',
  TESTIMONIALS: 'testimonials',
} as const

// Search settings for each index
export const SEARCH_SETTINGS = {
  [INDEXES.SERVICES]: {
    searchableAttributes: [
      'title',
      'description',
      'content',
      'category',
      'tags',
    ],
    filterableAttributes: [
      'category',
      'status',
      'featured',
      'priceType',
      'createdAt',
      'updatedAt',
    ],
    sortableAttributes: [
      'title',
      'price',
      'createdAt',
      'updatedAt',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
    synonyms: {
      'hvac': ['heating', 'cooling', 'air conditioning', 'ventilation'],
      'ac': ['air conditioning', 'air conditioner'],
      'repair': ['fix', 'service', 'maintenance'],
      'install': ['installation', 'setup'],
    },
  },
  [INDEXES.POSTS]: {
    searchableAttributes: [
      'title',
      'excerpt',
      'content',
      'tags',
      'category',
    ],
    filterableAttributes: [
      'status',
      'featured',
      'category',
      'authorId',
      'publishedAt',
      'createdAt',
      'updatedAt',
    ],
    sortableAttributes: [
      'title',
      'publishedAt',
      'createdAt',
      'updatedAt',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
  },
  [INDEXES.PAGES]: {
    searchableAttributes: [
      'title',
      'content',
      'metaDescription',
    ],
    filterableAttributes: [
      'status',
      'template',
      'createdAt',
      'updatedAt',
    ],
    sortableAttributes: [
      'title',
      'createdAt',
      'updatedAt',
    ],
  },
  [INDEXES.PROJECTS]: {
    searchableAttributes: [
      'title',
      'description',
      'content',
      'category',
      'tags',
      'location',
    ],
    filterableAttributes: [
      'status',
      'featured',
      'category',
      'completedAt',
      'createdAt',
      'updatedAt',
    ],
    sortableAttributes: [
      'title',
      'completedAt',
      'createdAt',
      'updatedAt',
    ],
  },
  [INDEXES.TESTIMONIALS]: {
    searchableAttributes: [
      'content',
      'clientName',
      'clientCompany',
      'projectType',
    ],
    filterableAttributes: [
      'status',
      'featured',
      'rating',
      'projectType',
      'createdAt',
      'updatedAt',
    ],
    sortableAttributes: [
      'rating',
      'createdAt',
      'updatedAt',
    ],
  },
}

// Initialize indexes with settings
export async function initializeIndexes() {
  try {
    console.log('Initializing MeiliSearch indexes...')
    
    for (const [indexName, settings] of Object.entries(SEARCH_SETTINGS)) {
      const index = meiliClient.index(indexName)
      
      // Create index if it doesn't exist
      try {
        await index.getStats()
      } catch (error) {
        console.log(`Creating index: ${indexName}`)
        await meiliClient.createIndex(indexName)
      }
      
      // Update settings
      console.log(`Updating settings for index: ${indexName}`)
      await index.updateSettings(settings)
    }
    
    console.log('MeiliSearch indexes initialized successfully')
  } catch (error) {
    console.error('Failed to initialize MeiliSearch indexes:', error)
    throw error
  }
}

// Health check
export async function checkHealth() {
  try {
    const health = await meiliClient.health()
    return health.status === 'available'
  } catch (error) {
    console.error('MeiliSearch health check failed:', error)
    return false
  }
}

// Get index stats
export async function getIndexStats(indexName: string) {
  try {
    const index = meiliClient.index(indexName)
    return await index.getStats()
  } catch (error) {
    console.error(`Failed to get stats for index ${indexName}:`, error)
    return null
  }
}

// Clear all indexes (useful for development)
export async function clearAllIndexes() {
  try {
    console.log('Clearing all MeiliSearch indexes...')
    
    for (const indexName of Object.values(INDEXES)) {
      const index = meiliClient.index(indexName)
      await index.deleteAllDocuments()
      console.log(`Cleared index: ${indexName}`)
    }
    
    console.log('All indexes cleared successfully')
  } catch (error) {
    console.error('Failed to clear indexes:', error)
    throw error
  }
}