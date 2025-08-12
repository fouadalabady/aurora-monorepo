import { typesenseClient, COLLECTIONS } from './client'
// TODO: Replace with actual database calls when database package is ready
// import { prisma } from '@workspace/database'
import { z } from 'zod'

// Search query schema
export const searchQuerySchema = z.object({
  q: z.string().optional(),
  filter_by: z.string().optional(),
  sort_by: z.string().optional(),
  per_page: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
  highlight_fields: z.array(z.string()).optional(),
  snippet_threshold: z.number().min(1).max(200).default(50),
  facet_by: z.string().optional(),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

// Search result types
export interface SearchResult<T = any> {
  hits: T[]
  found: number
  search_time_ms: number
  page: number
  per_page: number
  facet_counts?: any[]
}

// Service search functions
export async function searchServices(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  
  const searchParams: any = {
    q: validatedQuery.q || '*',
    query_by: 'title,description,content,category,tags',
    per_page: validatedQuery.per_page,
    page: validatedQuery.page,
  }
  
  if (validatedQuery.filter_by) {
    searchParams.filter_by = validatedQuery.filter_by
  }
  
  if (validatedQuery.sort_by) {
    searchParams.sort_by = validatedQuery.sort_by
  }
  
  if (validatedQuery.highlight_fields) {
    searchParams.highlight_fields = validatedQuery.highlight_fields.join(',')
  }
  
  if (validatedQuery.facet_by) {
    searchParams.facet_by = validatedQuery.facet_by
  }
  
  return await typesenseClient.collections(COLLECTIONS.SERVICES).documents().search(searchParams)
}

export async function indexService(serviceId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const service = {
      id: serviceId,
      title: 'HVAC Installation',
      description: 'Professional HVAC installation services',
      content: 'Complete HVAC installation with warranty',
      category: 'hvac_installation',
      status: 'PUBLISHED',
      featured: true,
      priceType: 'QUOTE',
      price: 0,
      tags: ['hvac', 'installation'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    if (!service) {
      throw new Error(`Service with ID ${serviceId} not found`)
    }
    
    await typesenseClient.collections(COLLECTIONS.SERVICES).documents().upsert(service)
    
    return { success: true, serviceId }
  } catch (error) {
    console.error(`Failed to index service ${serviceId}:`, error)
    throw error
  }
}

export async function removeServiceFromIndex(serviceId: string) {
  try {
    await typesenseClient.collections(COLLECTIONS.SERVICES).documents(serviceId).delete()
    return { success: true, serviceId }
  } catch (error) {
    console.error(`Failed to remove service ${serviceId} from index:`, error)
    throw error
  }
}

// Post search functions
export async function searchPosts(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  
  const searchParams: any = {
    q: validatedQuery.q || '*',
    query_by: 'title,excerpt,content,tags,category',
    per_page: validatedQuery.per_page,
    page: validatedQuery.page,
  }
  
  if (validatedQuery.filter_by) {
    searchParams.filter_by = validatedQuery.filter_by
  }
  
  if (validatedQuery.sort_by) {
    searchParams.sort_by = validatedQuery.sort_by
  }
  
  if (validatedQuery.highlight_fields) {
    searchParams.highlight_fields = validatedQuery.highlight_fields.join(',')
  }
  
  if (validatedQuery.facet_by) {
    searchParams.facet_by = validatedQuery.facet_by
  }
  
  return await typesenseClient.collections(COLLECTIONS.POSTS).documents().search(searchParams)
}

export async function indexPost(postId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const post = {
      id: postId,
      title: 'How to Maintain Your HVAC System',
      excerpt: 'Essential tips for HVAC maintenance',
      content: 'Regular maintenance is key to HVAC longevity...',
      tags: ['hvac', 'maintenance', 'tips'],
      category: 'maintenance',
      status: 'PUBLISHED',
      featured: false,
      authorId: 'author-1',
      publishedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    if (!post) {
      throw new Error(`Post with ID ${postId} not found`)
    }
    
    await typesenseClient.collections(COLLECTIONS.POSTS).documents().upsert(post)
    
    return { success: true, postId }
  } catch (error) {
    console.error(`Failed to index post ${postId}:`, error)
    throw error
  }
}

// Project search functions
export async function searchProjects(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  
  const searchParams: any = {
    q: validatedQuery.q || '*',
    query_by: 'title,description,content,category,tags,location',
    per_page: validatedQuery.per_page,
    page: validatedQuery.page,
  }
  
  if (validatedQuery.filter_by) {
    searchParams.filter_by = validatedQuery.filter_by
  }
  
  if (validatedQuery.sort_by) {
    searchParams.sort_by = validatedQuery.sort_by
  }
  
  if (validatedQuery.highlight_fields) {
    searchParams.highlight_fields = validatedQuery.highlight_fields.join(',')
  }
  
  if (validatedQuery.facet_by) {
    searchParams.facet_by = validatedQuery.facet_by
  }
  
  return await typesenseClient.collections(COLLECTIONS.PROJECTS).documents().search(searchParams)
}

export async function indexProject(projectId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const project = {
      id: projectId,
      title: 'Commercial HVAC Installation',
      description: 'Large-scale commercial HVAC project',
      content: 'Complete installation for 50,000 sq ft building...',
      category: 'commercial',
      tags: ['hvac', 'commercial', 'installation'],
      location: 'Downtown Office Complex',
      status: 'COMPLETED',
      featured: true,
      completedAt: Date.now() - 86400000, // 1 day ago
      createdAt: Date.now() - 604800000, // 1 week ago
      updatedAt: Date.now(),
    }
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`)
    }
    
    await typesenseClient.collections(COLLECTIONS.PROJECTS).documents().upsert(project)
    
    return { success: true, projectId }
  } catch (error) {
    console.error(`Failed to index project ${projectId}:`, error)
    throw error
  }
}

// Testimonial search functions
export async function searchTestimonials(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  
  const searchParams: any = {
    q: validatedQuery.q || '*',
    query_by: 'content,clientName,clientCompany,projectType',
    per_page: validatedQuery.per_page,
    page: validatedQuery.page,
  }
  
  if (validatedQuery.filter_by) {
    searchParams.filter_by = validatedQuery.filter_by
  }
  
  if (validatedQuery.sort_by) {
    searchParams.sort_by = validatedQuery.sort_by
  }
  
  if (validatedQuery.highlight_fields) {
    searchParams.highlight_fields = validatedQuery.highlight_fields.join(',')
  }
  
  if (validatedQuery.facet_by) {
    searchParams.facet_by = validatedQuery.facet_by
  }
  
  return await typesenseClient.collections(COLLECTIONS.TESTIMONIALS).documents().search(searchParams)
}

export async function indexTestimonial(testimonialId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const testimonial = {
      id: testimonialId,
      content: 'Excellent service! The team was professional and efficient.',
      clientName: 'John Smith',
      clientCompany: 'Smith Industries',
      projectType: 'hvac_installation',
      status: 'PUBLISHED',
      featured: true,
      rating: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    if (!testimonial) {
      throw new Error(`Testimonial with ID ${testimonialId} not found`)
    }
    
    await typesenseClient.collections(COLLECTIONS.TESTIMONIALS).documents().upsert(testimonial)
    
    return { success: true, testimonialId }
  } catch (error) {
    console.error(`Failed to index testimonial ${testimonialId}:`, error)
    throw error
  }
}

// Page search functions
export async function searchPages(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  
  const searchParams: any = {
    q: validatedQuery.q || '*',
    query_by: 'title,content,metaDescription',
    per_page: validatedQuery.per_page,
    page: validatedQuery.page,
  }
  
  if (validatedQuery.filter_by) {
    searchParams.filter_by = validatedQuery.filter_by
  }
  
  if (validatedQuery.sort_by) {
    searchParams.sort_by = validatedQuery.sort_by
  }
  
  if (validatedQuery.highlight_fields) {
    searchParams.highlight_fields = validatedQuery.highlight_fields.join(',')
  }
  
  if (validatedQuery.facet_by) {
    searchParams.facet_by = validatedQuery.facet_by
  }
  
  return await typesenseClient.collections(COLLECTIONS.PAGES).documents().search(searchParams)
}

export async function indexPage(pageId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const page = {
      id: pageId,
      title: 'About Us',
      content: 'Learn more about our company and services...',
      metaDescription: 'Professional HVAC services company',
      status: 'PUBLISHED',
      template: 'default',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`)
    }
    
    await typesenseClient.collections(COLLECTIONS.PAGES).documents().upsert(page)
    
    return { success: true, pageId }
  } catch (error) {
    console.error(`Failed to index page ${pageId}:`, error)
    throw error
  }
}

// Bulk indexing functions
export async function indexAllServices() {
  try {
    console.log('Indexing all services...')
    
    // TODO: Replace with actual database call when database package is ready
    const services = [
      {
        id: 'service-1',
        title: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        content: 'Complete HVAC installation with warranty',
        category: 'hvac_installation',
        status: 'PUBLISHED',
        featured: true,
        priceType: 'QUOTE',
        price: 0,
        tags: ['hvac', 'installation'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'service-2',
        title: 'HVAC Repair',
        description: 'Fast and reliable HVAC repair services',
        content: 'Emergency HVAC repair available 24/7',
        category: 'hvac_repair',
        status: 'PUBLISHED',
        featured: false,
        priceType: 'HOURLY',
        price: 150,
        tags: ['hvac', 'repair', 'emergency'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    if (services.length > 0) {
      await typesenseClient.collections(COLLECTIONS.SERVICES).documents().import(services)
      console.log(`Indexed ${services.length} services`)
    }
    
    return { success: true, count: services.length }
  } catch (error) {
    console.error('Failed to index all services:', error)
    throw error
  }
}

export async function indexAllPosts() {
  try {
    console.log('Indexing all posts...')
    
    // TODO: Replace with actual database call when database package is ready
    const posts = [
      {
        id: 'post-1',
        title: 'How to Maintain Your HVAC System',
        excerpt: 'Essential tips for HVAC maintenance',
        content: 'Regular maintenance is key to HVAC longevity...',
        tags: ['hvac', 'maintenance', 'tips'],
        category: 'maintenance',
        status: 'PUBLISHED',
        featured: true,
        authorId: 'author-1',
        publishedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    if (posts.length > 0) {
      await typesenseClient.collections(COLLECTIONS.POSTS).documents().import(posts)
      console.log(`Indexed ${posts.length} posts`)
    }
    
    return { success: true, count: posts.length }
  } catch (error) {
    console.error('Failed to index all posts:', error)
    throw error
  }
}

export async function indexAllProjects() {
  try {
    console.log('Indexing all projects...')
    
    // TODO: Replace with actual database call when database package is ready
    const projects = [
      {
        id: 'project-1',
        title: 'Commercial HVAC Installation',
        description: 'Large-scale commercial HVAC project',
        content: 'Complete installation for 50,000 sq ft building...',
        category: 'commercial',
        tags: ['hvac', 'commercial', 'installation'],
        location: 'Downtown Office Complex',
        status: 'COMPLETED',
        featured: true,
        completedAt: Date.now() - 86400000,
        createdAt: Date.now() - 604800000,
        updatedAt: Date.now(),
      },
    ]
    
    if (projects.length > 0) {
      await typesenseClient.collections(COLLECTIONS.PROJECTS).documents().import(projects)
      console.log(`Indexed ${projects.length} projects`)
    }
    
    return { success: true, count: projects.length }
  } catch (error) {
    console.error('Failed to index all projects:', error)
    throw error
  }
}

export async function indexAllTestimonials() {
  try {
    console.log('Indexing all testimonials...')
    
    // TODO: Replace with actual database call when database package is ready
    const testimonials = [
      {
        id: 'testimonial-1',
        content: 'Excellent service! The team was professional and efficient.',
        clientName: 'John Smith',
        clientCompany: 'Smith Industries',
        projectType: 'hvac_installation',
        status: 'PUBLISHED',
        featured: true,
        rating: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    if (testimonials.length > 0) {
      await typesenseClient.collections(COLLECTIONS.TESTIMONIALS).documents().import(testimonials)
      console.log(`Indexed ${testimonials.length} testimonials`)
    }
    
    return { success: true, count: testimonials.length }
  } catch (error) {
    console.error('Failed to index all testimonials:', error)
    throw error
  }
}

export async function indexAllPages() {
  try {
    console.log('Indexing all pages...')
    
    // TODO: Replace with actual database call when database package is ready
    const pages = [
      {
        id: 'page-1',
        title: 'About Us',
        content: 'Learn more about our company and services...',
        metaDescription: 'Professional HVAC services company',
        status: 'PUBLISHED',
        template: 'default',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    
    if (pages.length > 0) {
      await typesenseClient.collections(COLLECTIONS.PAGES).documents().import(pages)
      console.log(`Indexed ${pages.length} pages`)
    }
    
    return { success: true, count: pages.length }
  } catch (error) {
    console.error('Failed to index all pages:', error)
    throw error
  }
}

// Global search across all collections
export async function globalSearch(query: string, options: {
  collections?: string[]
  per_page?: number
  highlight_fields?: string[]
  facet_by?: string
} = {}) {
  try {
    const {
      collections = Object.values(COLLECTIONS),
      per_page = 20,
      highlight_fields,
      facet_by,
    } = options
    
    const searches = collections.map(collection => ({
      collection,
      q: query || '*',
      query_by: getQueryFieldsForCollection(collection),
      per_page,
      ...(highlight_fields && { highlight_fields: highlight_fields.join(',') }),
      ...(facet_by && { facet_by }),
    }))
    
    const results = await typesenseClient.multiSearch.perform({
      searches,
    })
    
    return {
      results: results.results,
      query,
      total_found: results.results.reduce((sum: number, result: any) => sum + (result.found || 0), 0),
    }
  } catch (error) {
    console.error('Global search failed:', error)
    throw error
  }
}

// Helper function to get query fields for each collection
function getQueryFieldsForCollection(collection: string): string {
  switch (collection) {
    case COLLECTIONS.SERVICES:
      return 'title,description,content,category,tags'
    case COLLECTIONS.POSTS:
      return 'title,excerpt,content,tags,category'
    case COLLECTIONS.PROJECTS:
      return 'title,description,content,category,tags,location'
    case COLLECTIONS.TESTIMONIALS:
      return 'content,clientName,clientCompany,projectType'
    case COLLECTIONS.PAGES:
      return 'title,content,metaDescription'
    default:
      return 'title,content'
  }
}

// Reindex all collections
export async function reindexAll() {
  try {
    console.log('Starting full reindex...')
    
    const results = await Promise.allSettled([
      indexAllServices(),
      indexAllPosts(),
      indexAllProjects(),
      indexAllTestimonials(),
      indexAllPages(),
    ])
    
    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length
    
    console.log(`Reindex completed: ${successful} successful, ${failed} failed`)
    
    if (failed > 0) {
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason)
      
      console.error('Reindex errors:', errors)
    }
    
    return {
      success: failed === 0,
      successful,
      failed,
      errors: failed > 0 ? results.filter(r => r.status === 'rejected') : undefined,
    }
  } catch (error) {
    console.error('Failed to reindex all collections:', error)
    throw error
  }
}