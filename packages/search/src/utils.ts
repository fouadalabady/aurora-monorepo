import { meiliClient, INDEXES } from './client'
// TODO: Replace with actual database calls when database package is ready
// import { prisma } from '@workspace/database'
import { z } from 'zod'

// Search query schema
export const searchQuerySchema = z.object({
  q: z.string().optional(),
  filter: z.string().optional(),
  sort: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  attributesToHighlight: z.array(z.string()).optional(),
  attributesToCrop: z.array(z.string()).optional(),
  cropLength: z.number().min(1).max(200).default(50),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

// Search result types
export interface SearchResult<T = any> {
  hits: T[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
}

// Service search functions
export async function searchServices(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  const index = meiliClient.index(INDEXES.SERVICES)
  
  const searchParams = {
    ...validatedQuery,
    attributesToHighlight: validatedQuery.attributesToHighlight || ['title', 'description'],
    attributesToCrop: validatedQuery.attributesToCrop || ['description', 'content'],
  }
  
  return await index.search(validatedQuery.q || '', searchParams)
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
      price: null,
      tags: ['hvac', 'installation'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    if (!service) {
      throw new Error(`Service with ID ${serviceId} not found`)
    }
    
    const index = meiliClient.index(INDEXES.SERVICES)
    await index.addDocuments([service])
    
    return { success: true, serviceId }
  } catch (error) {
    console.error(`Failed to index service ${serviceId}:`, error)
    throw error
  }
}

export async function removeServiceFromIndex(serviceId: string) {
  try {
    const index = meiliClient.index(INDEXES.SERVICES)
    await index.deleteDocument(serviceId)
    return { success: true, serviceId }
  } catch (error) {
    console.error(`Failed to remove service ${serviceId} from index:`, error)
    throw error
  }
}

// Post search functions
export async function searchPosts(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  const index = meiliClient.index(INDEXES.POSTS)
  
  const searchParams = {
    ...validatedQuery,
    attributesToHighlight: validatedQuery.attributesToHighlight || ['title', 'excerpt'],
    attributesToCrop: validatedQuery.attributesToCrop || ['excerpt', 'content'],
  }
  
  return await index.search(validatedQuery.q || '', searchParams)
}

export async function indexPost(postId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const post = {
      id: postId,
      title: 'Latest News',
      excerpt: 'Latest news and updates',
      content: 'Full content of the latest news post',
      status: 'PUBLISHED',
      featured: true,
      category: 'news',
      tags: ['news', 'update'],
      authorId: 'author_1',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    if (!post) {
      throw new Error(`Post with ID ${postId} not found`)
    }
    
    const index = meiliClient.index(INDEXES.POSTS)
    await index.addDocuments([post])
    
    return { success: true, postId }
  } catch (error) {
    console.error(`Failed to index post ${postId}:`, error)
    throw error
  }
}

// Project search functions
export async function searchProjects(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  const index = meiliClient.index(INDEXES.PROJECTS)
  
  const searchParams = {
    ...validatedQuery,
    attributesToHighlight: validatedQuery.attributesToHighlight || ['title', 'description'],
    attributesToCrop: validatedQuery.attributesToCrop || ['description', 'content'],
  }
  
  return await index.search(validatedQuery.q || '', searchParams)
}

export async function indexProject(projectId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const project = {
      id: projectId,
      title: 'Commercial HVAC Installation',
      description: 'Large commercial HVAC system installation',
      content: 'Complete installation of commercial HVAC system',
      status: 'COMPLETED',
      featured: true,
      category: 'commercial',
      tags: ['hvac', 'commercial', 'installation'],
      location: 'Downtown Office Building',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`)
    }
    
    const index = meiliClient.index(INDEXES.PROJECTS)
    await index.addDocuments([project])
    
    return { success: true, projectId }
  } catch (error) {
    console.error(`Failed to index project ${projectId}:`, error)
    throw error
  }
}

// Testimonial search functions
export async function searchTestimonials(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  const index = meiliClient.index(INDEXES.TESTIMONIALS)
  
  const searchParams = {
    ...validatedQuery,
    attributesToHighlight: validatedQuery.attributesToHighlight || ['content', 'clientName'],
    attributesToCrop: validatedQuery.attributesToCrop || ['content'],
  }
  
  return await index.search(validatedQuery.q || '', searchParams)
}

export async function indexTestimonial(testimonialId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const testimonial = {
      id: testimonialId,
      content: 'Excellent service! Very professional and timely.',
      clientName: 'John Smith',
      clientCompany: 'ABC Corp',
      clientEmail: 'john@abccorp.com',
      rating: 5,
      status: 'APPROVED',
      featured: true,
      projectType: 'HVAC Installation',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    if (!testimonial) {
      throw new Error(`Testimonial with ID ${testimonialId} not found`)
    }
    
    const index = meiliClient.index(INDEXES.TESTIMONIALS)
    await index.addDocuments([testimonial])
    
    return { success: true, testimonialId }
  } catch (error) {
    console.error(`Failed to index testimonial ${testimonialId}:`, error)
    throw error
  }
}

// Page search functions
export async function searchPages(query: SearchQuery) {
  const validatedQuery = searchQuerySchema.parse(query)
  const index = meiliClient.index(INDEXES.PAGES)
  
  const searchParams = {
    ...validatedQuery,
    attributesToHighlight: validatedQuery.attributesToHighlight || ['title', 'metaDescription'],
    attributesToCrop: validatedQuery.attributesToCrop || ['content'],
  }
  
  return await index.search(validatedQuery.q || '', searchParams)
}

export async function indexPage(pageId: string) {
  try {
    // TODO: Replace with actual database call when database package is ready
    const page = {
      id: pageId,
      title: 'Home Page',
      content: 'Welcome to our service business website',
      metaDescription: 'Professional HVAC services for your home and business',
      status: 'PUBLISHED',
      template: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`)
    }
    
    const index = meiliClient.index(INDEXES.PAGES)
    await index.addDocuments([page])
    
    return { success: true, pageId }
  } catch (error) {
    console.error(`Failed to index page ${pageId}:`, error)
    throw error
  }
}

// Bulk indexing functions
export async function indexAllServices() {
  try {
    console.log('Starting bulk indexing of services...')
    
    // TODO: Replace with actual database call when database package is ready
    const services = [
      {
        id: 'service_1',
        title: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        content: 'Complete HVAC installation with warranty',
        category: 'hvac_installation',
        status: 'PUBLISHED',
        featured: true,
        priceType: 'QUOTE',
        price: null,
        tags: ['hvac', 'installation'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    if (services.length === 0) {
      console.log('No published services found to index')
      return { success: true, count: 0 }
    }
    
    const index = meiliClient.index(INDEXES.SERVICES)
    const task = await index.addDocuments(services)
    
    console.log(`Indexed ${services.length} services. Task ID: ${task.taskUid}`)
    return { success: true, count: services.length, taskUid: task.taskUid }
  } catch (error) {
    console.error('Failed to bulk index services:', error)
    throw error
  }
}

export async function indexAllPosts() {
  try {
    console.log('Starting bulk indexing of posts...')
    
    // TODO: Replace with actual database call when database package is ready
    const posts = [
      {
        id: 'post_1',
        title: 'Latest News',
        excerpt: 'Latest news and updates',
        content: 'Full content of the latest news post',
        status: 'PUBLISHED',
        featured: true,
        category: 'news',
        tags: ['news', 'update'],
        authorId: 'author_1',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    if (posts.length === 0) {
      console.log('No published posts found to index')
      return { success: true, count: 0 }
    }
    
    const index = meiliClient.index(INDEXES.POSTS)
    const task = await index.addDocuments(posts)
    
    console.log(`Indexed ${posts.length} posts. Task ID: ${task.taskUid}`)
    return { success: true, count: posts.length, taskUid: task.taskUid }
  } catch (error) {
    console.error('Failed to bulk index posts:', error)
    throw error
  }
}

export async function indexAllProjects() {
  try {
    console.log('Starting bulk indexing of projects...')
    
    // TODO: Replace with actual database call when database package is ready
    const projects = [
      {
        id: 'project_1',
        title: 'Commercial HVAC Installation',
        description: 'Large commercial HVAC system installation',
        content: 'Complete installation of commercial HVAC system',
        status: 'PUBLISHED',
        featured: true,
        category: 'commercial',
        tags: ['hvac', 'commercial', 'installation'],
        location: 'Downtown Office Building',
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    if (projects.length === 0) {
      console.log('No published projects found to index')
      return { success: true, count: 0 }
    }
    
    const index = meiliClient.index(INDEXES.PROJECTS)
    const task = await index.addDocuments(projects)
    
    console.log(`Indexed ${projects.length} projects. Task ID: ${task.taskUid}`)
    return { success: true, count: projects.length, taskUid: task.taskUid }
  } catch (error) {
    console.error('Failed to bulk index projects:', error)
    throw error
  }
}

export async function indexAllTestimonials() {
  try {
    console.log('Starting bulk indexing of testimonials...')
    
    // TODO: Replace with actual database call when database package is ready
    const testimonials = [
      {
        id: 'testimonial_1',
        content: 'Excellent service! Very professional and timely.',
        clientName: 'John Smith',
        clientCompany: 'ABC Corp',
        clientEmail: 'john@abccorp.com',
        rating: 5,
        status: 'APPROVED',
        featured: true,
        projectType: 'HVAC Installation',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    if (testimonials.length === 0) {
      console.log('No approved testimonials found to index')
      return { success: true, count: 0 }
    }
    
    const index = meiliClient.index(INDEXES.TESTIMONIALS)
    const task = await index.addDocuments(testimonials)
    
    console.log(`Indexed ${testimonials.length} testimonials. Task ID: ${task.taskUid}`)
    return { success: true, count: testimonials.length, taskUid: task.taskUid }
  } catch (error) {
    console.error('Failed to bulk index testimonials:', error)
    throw error
  }
}

export async function indexAllPages() {
  try {
    console.log('Starting bulk indexing of pages...')
    
    // TODO: Replace with actual database call when database package is ready
    const pages = [
      {
        id: 'page_1',
        title: 'Home Page',
        content: 'Welcome to our service business website',
        metaDescription: 'Professional HVAC services for your home and business',
        status: 'PUBLISHED',
        template: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    if (pages.length === 0) {
      console.log('No published pages found to index')
      return { success: true, count: 0 }
    }
    
    const index = meiliClient.index(INDEXES.PAGES)
    const task = await index.addDocuments(pages)
    
    console.log(`Indexed ${pages.length} pages. Task ID: ${task.taskUid}`)
    return { success: true, count: pages.length, taskUid: task.taskUid }
  } catch (error) {
    console.error('Failed to bulk index pages:', error)
    throw error
  }
}

// Global search function
export async function globalSearch(query: string, options: {
  indexes?: string[]
  limit?: number
  attributesToHighlight?: string[]
  attributesToCrop?: string[]
} = {}) {
  const {
    indexes = Object.values(INDEXES),
    limit = 10,
    attributesToHighlight = ['title', 'description', 'content'],
    attributesToCrop = ['description', 'content'],
  } = options
  
  const searchPromises = indexes.map(async (indexName) => {
    try {
      const index = meiliClient.index(indexName)
      const result = await index.search(query, {
        limit,
        attributesToHighlight,
        attributesToCrop,
        cropLength: 50,
      })
      
      return {
        index: indexName,
        ...result,
      }
    } catch (error) {
      console.error(`Search failed for index ${indexName}:`, error)
      return {
        index: indexName,
        hits: [],
        query,
        processingTimeMs: 0,
        limit,
        offset: 0,
        estimatedTotalHits: 0,
      }
    }
  })
  
  const results = await Promise.all(searchPromises)
  
  return {
    query,
    results,
    totalHits: results.reduce((sum, result) => sum + result.estimatedTotalHits, 0),
  }
}

// Utility function to reindex all content
export async function reindexAll() {
  try {
    console.log('Starting complete reindexing...')
    
    const results = await Promise.allSettled([
      indexAllServices(),
      indexAllPosts(),
      indexAllProjects(),
      indexAllTestimonials(),
      indexAllPages(),
    ])
    
    const summary = {
      services: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: results[0].reason },
      posts: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: results[1].reason },
      projects: results[2].status === 'fulfilled' ? results[2].value : { success: false, error: results[2].reason },
      testimonials: results[3].status === 'fulfilled' ? results[3].value : { success: false, error: results[3].reason },
      pages: results[4].status === 'fulfilled' ? results[4].value : { success: false, error: results[4].reason },
    }
    
    console.log('Reindexing completed:', summary)
    return summary
  } catch (error) {
    console.error('Failed to reindex all content:', error)
    throw error
  }
}