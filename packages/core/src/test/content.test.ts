import { describe, it, expect } from 'vitest'
import {
  ContentManager,
  PageManager,
  BlogManager,
  pageSchema,
  postSchema,
  mediaSchema,
  generateSEOMetadata,
  extractTextFromHTML,
  calculateReadingTime,
  generateExcerpt,
  optimizeImageAlt,
  generateBreadcrumbs,
} from '../content'

describe('Content Management Tests', () => {
  describe('Page Schema Validation', () => {
    it('should validate a valid page', () => {
      const validPage = {
        title: 'About Us',
        content: 'This is our company story and mission.',
        status: 'PUBLISHED' as const,
      }
      
      expect(() => pageSchema.parse(validPage)).not.toThrow()
    })
    
    it('should reject short title', () => {
      const invalidPage = {
        title: 'AB',
        content: 'This is our company story and mission.',
      }
      
      expect(() => pageSchema.parse(invalidPage)).toThrow()
    })
    
    it('should reject short content', () => {
      const invalidPage = {
        title: 'About Us',
        content: 'Short',
      }
      
      expect(() => pageSchema.parse(invalidPage)).toThrow()
    })
  })
  
  describe('Post Schema Validation', () => {
    it('should validate a valid post', () => {
      const validPost = {
        title: 'Latest News',
        content: 'Here is our latest company news and updates.',
        category: 'news',
        tags: ['update', 'company'],
      }
      
      expect(() => postSchema.parse(validPost)).not.toThrow()
    })
    
    it('should default tags to empty array', () => {
      const post = {
        title: 'Latest News',
        content: 'Here is our latest company news and updates.',
        category: 'news',
      }
      
      const parsed = postSchema.parse(post)
      expect(parsed.tags).toEqual([])
    })
  })
  
  describe('Media Schema Validation', () => {
    it('should validate a valid media object', () => {
      const validMedia = {
        filename: 'image.jpg',
        originalName: 'my-image.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        url: 'https://example.com/image.jpg',
        alt: 'A beautiful image',
      }
      
      expect(() => mediaSchema.parse(validMedia)).not.toThrow()
    })
    
    it('should reject invalid URL', () => {
      const invalidMedia = {
        filename: 'image.jpg',
        originalName: 'my-image.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        url: 'not-a-url',
      }
      
      expect(() => mediaSchema.parse(invalidMedia)).toThrow()
    })
  })
  
  describe('ContentManager', () => {
    it('should search content and return results', async () => {
      const results = await ContentManager.searchContent('about', undefined, 5)
      
      expect(results).toHaveProperty('pages')
      expect(results).toHaveProperty('posts')
      expect(results).toHaveProperty('total')
      expect(typeof results.total).toBe('number')
    })
    
    it('should get recent content', async () => {
      const recent = await ContentManager.getRecentContent(3)
      
      expect(Array.isArray(recent)).toBe(true)
      expect(recent.length).toBeLessThanOrEqual(3)
    })
    
    it('should get content stats', async () => {
      const stats = await ContentManager.getContentStats()
      
      expect(stats).toHaveProperty('pages')
      expect(stats).toHaveProperty('posts')
      expect(stats).toHaveProperty('media')
      expect(stats.pages).toHaveProperty('DRAFT')
      expect(stats.pages).toHaveProperty('PUBLISHED')
      expect(stats.pages).toHaveProperty('ARCHIVED')
    })
  })
  
  describe('PageManager', () => {
    it('should create a page with generated slug', async () => {
      const pageData = {
        title: 'About Our Company',
        content: 'This is detailed information about our company history and mission.',
      }
      
      const page = await PageManager.createPage(pageData, 'user_123')
      
      expect(page).toMatchObject({
        title: 'About Our Company',
        content: 'This is detailed information about our company history and mission.',
        authorId: 'user_123',
        status: 'DRAFT',
      })
      expect(page.slug).toBe('about-our-company')
      expect(page.id).toMatch(/^page_/)
      expect(page.excerpt).toBeTruthy()
    })
    
    it('should update page with new slug when title changes', async () => {
      const updated = await PageManager.updatePage('page_123', {
        title: 'New Page Title',
      })
      
      expect(updated.slug).toBe('new-page-title')
      expect(updated.updatedAt).toBeInstanceOf(Date)
    })
  })
  
  describe('SEO and Content Utilities', () => {
    it('should generate SEO metadata', () => {
      const metadata = generateSEOMetadata({
        title: 'About Us',
        description: 'Learn about our company',
        url: 'https://example.com/about',
      })
      
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('description')
      expect(metadata).toHaveProperty('openGraph')
      expect(metadata.title).toBe('About Us')
    })
    
    it('should extract text from HTML', () => {
      const html = '<p>Hello <strong>world</strong>!</p><div>More content</div>'
      const text = extractTextFromHTML(html)
      
      expect(text).toBe('Hello world! More content')
    })
    
    it('should calculate reading time', () => {
      const text = 'This is a sample text. '.repeat(50) // ~200 words
      const readingTime = calculateReadingTime(text)
      
      expect(readingTime).toBeGreaterThan(0)
      expect(readingTime).toBeLessThan(5) // Should be less than 5 minutes
    })
    
    it('should generate excerpt from content', () => {
      const content = 'This is a long piece of content. '.repeat(20)
      const excerpt = generateExcerpt(content, 50)
      
      expect(excerpt.length).toBeLessThanOrEqual(53) // 50 + '...'
      expect(excerpt.endsWith('...')).toBe(true)
    })
    
    it('should optimize image alt text', () => {
      const alt = optimizeImageAlt('company-logo.jpg', 'Company Logo')
      
      expect(alt).toContain('Company Logo')
      expect(typeof alt).toBe('string')
    })
    
    it('should generate breadcrumbs', () => {
      const breadcrumbs = generateBreadcrumbs('/services/hvac/installation')
      
      expect(Array.isArray(breadcrumbs)).toBe(true)
      expect(breadcrumbs.length).toBeGreaterThan(0)
      expect(breadcrumbs[0]).toHaveProperty('label')
      expect(breadcrumbs[0]).toHaveProperty('href')
    })
  })
})