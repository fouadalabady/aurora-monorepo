// Business logic exports
export {
  LeadManager,
  ServiceManager,
  ProjectManager,
  TestimonialManager,
  BusinessAnalytics,
} from './business'

// Validation schemas
export {
  leadSchema,
  serviceSchema,
  testimonialSchema,
  projectSchema,
} from './business'

// Type definitions
export type {
  LeadInput,
  ServiceInput,
  TestimonialInput,
  ProjectInput,
} from './business'

// Utility functions
export {
  calculateEstimatedValue,
  generateQuoteNumber,
  formatCurrency,
  formatPhoneNumber,
  isBusinessHours,
  getNextBusinessDay,
} from './business'

// Content management exports
export {
  ContentManager,
  PageManager,
  BlogManager,
  MediaManager,
} from './content'

// Content validation schemas
export {
  pageSchema,
  postSchema,
  mediaSchema,
} from './content'

// Content type definitions
export type {
  PageInput,
  PostInput,
  MediaInput,
} from './content'

// SEO and content utilities
export {
  generateSEOMetadata,
  extractTextFromHTML,
  calculateReadingTime,
  generateExcerpt,
  optimizeImageAlt,
  generateBreadcrumbs,
} from './content'

// Constants
export const BUSINESS_CONSTANTS = {
  LEAD_SOURCES: ['WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'SOCIAL', 'OTHER'] as const,
  LEAD_PRIORITIES: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const,
  LEAD_STATUSES: ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST'] as const,
  SERVICE_CATEGORIES: [
    'hvac_installation',
    'hvac_repair', 
    'hvac_maintenance',
    'commercial_hvac',
    'emergency_service',
    'air_quality',
    'ductwork',
    'heating',
    'cooling',
  ] as const,
  PROJECT_CATEGORIES: [
    'residential',
    'commercial',
    'industrial',
    'emergency',
    'maintenance',
  ] as const,
  CONTENT_STATUSES: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const,
  PRICE_TYPES: ['FIXED', 'HOURLY', 'QUOTE'] as const,
  URGENCY_LEVELS: ['IMMEDIATE', 'WITHIN_24H', 'WITHIN_WEEK', 'FLEXIBLE'] as const,
} as const

// Error classes
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

export class ValidationError extends BusinessError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends BusinessError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends BusinessError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends BusinessError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

// Helper functions
export function handleBusinessError(error: unknown): BusinessError {
  if (error instanceof BusinessError) {
    return error
  }
  
  if (error instanceof Error) {
    return new BusinessError(error.message, 'UNKNOWN_ERROR', 500)
  }
  
  return new BusinessError('An unknown error occurred', 'UNKNOWN_ERROR', 500)
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(error: BusinessError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    },
    timestamp: new Date().toISOString(),
  }
}

// Type guards
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && !email.includes('..')
}

export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it's a valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false
  }
  
  // Check if it starts with a valid digit (not 0)
  if (cleaned[0] === '0') {
    return false
  }
  
  return true
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      }
      return entities[char] || char
    })
}

export function generateRandomId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}