import { z } from 'zod'
// import { prisma } from '@workspace/database' // TODO: Re-enable when database package is ready
import { format } from 'date-fns'
import slugify from 'slugify'

// Content validation schemas
export const pageSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  template: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
})

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.date().optional(),
})

export const mediaSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1, 'Size must be greater than 0'),
  url: z.string().url('Invalid URL'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().optional(),
})

export type PageInput = z.infer<typeof pageSchema>
export type PostInput = z.infer<typeof postSchema>
export type MediaInput = z.infer<typeof mediaSchema>

// Content management functions
export class ContentManager {
  static async searchContent(
    query: string,
    type?: 'PAGE' | 'POST',
    limit: number = 10
  ) {
    // TODO: Replace with actual database call when database package is ready
    const mockPages = [
      {
        id: 'page_1',
        title: 'About Us',
        slug: 'about-us',
        excerpt: 'Learn more about our company',
        featuredImage: null,
        updatedAt: new Date(),
        type: 'PAGE' as const,
      },
    ]
    
    const mockPosts = [
      {
        id: 'post_1',
        title: 'Latest News',
        slug: 'latest-news',
        excerpt: 'Check out our latest updates',
        featuredImage: null,
        publishedAt: new Date(),
        category: 'News',
        tags: ['update'],
        type: 'POST' as const,
      },
    ]

    return {
      pages: type === 'POST' ? [] : mockPages,
      posts: type === 'PAGE' ? [] : mockPosts,
      total: (type === 'POST' ? 0 : mockPages.length) + (type === 'PAGE' ? 0 : mockPosts.length),
    }
  }

  static async getRecentContent(limit: number = 5) {
    // TODO: Replace with actual database call when database package is ready
    const recentPages = [
      {
        id: 'page_1',
        title: 'About Us',
        slug: 'about-us',
        updatedAt: new Date(),
      },
    ]
    
    const recentPosts = [
      {
        id: 'post_1',
        title: 'Latest News',
        slug: 'latest-news',
        publishedAt: new Date(),
      },
    ]

    const allContent = [
      ...recentPages.map(page => ({ ...page, type: 'PAGE' as const, date: page.updatedAt })),
      ...recentPosts.map(post => ({ ...post, type: 'POST' as const, date: post.publishedAt })),
    ]

    return allContent
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  static async getContentStats() {
    // TODO: Replace with actual database call when database package is ready
    return {
      pages: {
        DRAFT: 3,
        PUBLISHED: 8,
        ARCHIVED: 2,
      },
      posts: {
        DRAFT: 5,
        PUBLISHED: 12,
        ARCHIVED: 1,
      },
      media: 25,
    }
  }
}

// Page management functions
export class PageManager {
  static async createPage(data: PageInput, authorId: string) {
    const validated = pageSchema.parse(data)
    
    const slug = slugify(validated.title, { lower: true })
    
    // TODO: Check for slug conflicts when database is ready
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `page_${Date.now()}`,
      ...validated,
      slug,
      authorId,
      excerpt: validated.excerpt || generateExcerpt(validated.content),
      metaTitle: validated.metaTitle || validated.title,
      metaDescription: validated.metaDescription || generateExcerpt(validated.content, 160),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async updatePage(pageId: string, data: Partial<PageInput>) {
    const updates: any = { ...data }
    
    if (data.title) {
      updates.slug = slugify(data.title, { lower: true })
    }
    
    if (data.content && !data.excerpt) {
      updates.excerpt = generateExcerpt(data.content)
    }
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: pageId,
      ...updates,
      updatedAt: new Date(),
    }
  }
  
  static async getPageBySlug(slug: string) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: 'page_1',
      title: 'About Us',
      slug: 'about-us',
      content: 'About our company content',
      status: 'PUBLISHED' as const,
      author: {
        name: 'Admin',
        email: 'admin@example.com',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async getPageHierarchy() {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'page_1',
        title: 'About Us',
        slug: 'about-us',
        parentId: null,
        order: 1,
        children: [],
      },
    ]
  }
  
  static async deletePage(pageId: string) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: pageId,
      deleted: true,
    }
  }
}

// Blog management functions
export class BlogManager {
  static async createPost(data: PostInput, authorId: string) {
    const validated = postSchema.parse(data)
    
    const slug = slugify(validated.title, { lower: true })
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `post_${Date.now()}`,
      ...validated,
      slug,
      authorId,
      excerpt: validated.excerpt || generateExcerpt(validated.content),
      metaTitle: validated.metaTitle || validated.title,
      metaDescription: validated.metaDescription || generateExcerpt(validated.content, 160),
      publishedAt: validated.status === 'PUBLISHED' ? (validated.publishedAt || new Date()) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async updatePost(postId: string, data: Partial<PostInput>) {
    const updates: any = { ...data }
    
    if (data.title) {
      updates.slug = slugify(data.title, { lower: true })
    }
    
    if (data.content && !data.excerpt) {
      updates.excerpt = generateExcerpt(data.content)
    }
    
    if (data.status === 'PUBLISHED' && !updates.publishedAt) {
      updates.publishedAt = new Date()
    }
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: postId,
      ...updates,
      updatedAt: new Date(),
    }
  }
  
  static async getPostBySlug(slug: string) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: 'post_1',
      title: 'Latest News',
      slug: 'latest-news',
      content: 'Latest news content',
      status: 'PUBLISHED' as const,
      author: {
        name: 'Admin',
        email: 'admin@example.com',
      },
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async getPublishedPosts({
    category,
    tag,
    featured,
    limit = 10,
    offset = 0,
  }: {
    category?: string
    tag?: string
    featured?: boolean
    limit?: number
    offset?: number
  } = {}) {
    // TODO: Replace with actual database call when database package is ready
    const mockPosts = [
      {
        id: 'post_1',
        title: 'Latest News',
        slug: 'latest-news',
        content: 'Latest news content',
        status: 'PUBLISHED' as const,
        author: {
          name: 'Admin',
          email: 'admin@example.com',
        },
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    return {
      posts: mockPosts,
      total: mockPosts.length,
      hasMore: false,
    }
  }
  
  static async getFeaturedPosts(limit: number = 3) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'post_1',
        title: 'Featured Post',
        slug: 'featured-post',
        content: 'Featured post content',
        featured: true,
        status: 'PUBLISHED' as const,
        author: {
          name: 'Admin',
          email: 'admin@example.com',
        },
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }
  
  static async getTags() {
    // TODO: Replace with actual database call when database package is ready
    return [
      { tag: 'news', count: 5 },
      { tag: 'update', count: 3 },
      { tag: 'announcement', count: 2 },
    ]
  }
}

// Media management functions
export class MediaManager {
  static async uploadMedia(data: MediaInput, authorId: string) {
    const validated = mediaSchema.parse(data)
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `media_${Date.now()}`,
      ...validated,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async getMedia(folder?: string) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'media_1',
        filename: 'image.jpg',
        originalName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/image.jpg',
        createdAt: new Date(),
      },
    ]
  }
  
  static async deleteMedia(mediaId: string) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: mediaId,
      deleted: true,
    }
  }
  
  static async getMediaStats() {
    // TODO: Replace with actual database call when database package is ready
    return {
      total: 25,
      totalSize: 1024000,
      byType: {
        'image/jpeg': 15,
        'image/png': 8,
        'application/pdf': 2,
      },
    }
  }
}

// Utility functions
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content.replace(/<[^>]*>/g, '')
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText
}

export function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
}) {
  return {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      title,
      description,
      type,
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export function extractTextFromHTML(html: string): string {
  // Add space before closing tags to preserve spacing between elements
  return html
    .replace(/<\/(p|div|h[1-6]|li|td|th|section|article|header|footer|nav|aside)>/gi, ' </$1>')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = extractTextFromHTML(content).split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function optimizeImageAlt(filename: string, context?: string): string {
  const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1)
  return context ? `${formatted} - ${context}` : formatted
}

export function generateBreadcrumbs(path: string): Array<{ label: string; href: string }> {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = [{ label: 'Home', href: '/' }]
  
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({ label, href: currentPath })
  })
  
  return breadcrumbs
}