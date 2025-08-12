import { describe, it, expect } from 'vitest'
import {
  BusinessError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  handleBusinessError,
  createSuccessResponse,
  createErrorResponse,
  isValidEmail,
  isValidPhone,
  isValidSlug,
  sanitizeInput,
  BUSINESS_CONSTANTS,
} from '../index'

describe('Utility Functions Tests', () => {
  describe('Error Classes', () => {
    it('should create BusinessError with correct properties', () => {
      const error = new BusinessError('Test error', 'TEST_ERROR', 400)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('BusinessError')
    })
    
    it('should create ValidationError with field', () => {
      const error = new ValidationError('Invalid field', 'email')
      
      expect(error.message).toBe('Invalid field')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.field).toBe('email')
      expect(error.name).toBe('ValidationError')
    })
    
    it('should create NotFoundError with resource and id', () => {
      const error = new NotFoundError('User', '123')
      
      expect(error.message).toBe('User with id 123 not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('NotFoundError')
    })
    
    it('should create NotFoundError without id', () => {
      const error = new NotFoundError('User')
      
      expect(error.message).toBe('User not found')
    })
    
    it('should create UnauthorizedError', () => {
      const error = new UnauthorizedError()
      
      expect(error.message).toBe('Unauthorized access')
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.statusCode).toBe(401)
    })
    
    it('should create ConflictError', () => {
      const error = new ConflictError('Resource already exists')
      
      expect(error.message).toBe('Resource already exists')
      expect(error.code).toBe('CONFLICT')
      expect(error.statusCode).toBe(409)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle BusinessError correctly', () => {
      const originalError = new ValidationError('Invalid input')
      const handled = handleBusinessError(originalError)
      
      expect(handled).toBe(originalError)
    })
    
    it('should convert regular Error to BusinessError', () => {
      const originalError = new Error('Regular error')
      const handled = handleBusinessError(originalError)
      
      expect(handled).toBeInstanceOf(BusinessError)
      expect(handled.message).toBe('Regular error')
      expect(handled.code).toBe('UNKNOWN_ERROR')
      expect(handled.statusCode).toBe(500)
    })
    
    it('should handle unknown error types', () => {
      const handled = handleBusinessError('string error')
      
      expect(handled).toBeInstanceOf(BusinessError)
      expect(handled.message).toBe('An unknown error occurred')
      expect(handled.code).toBe('UNKNOWN_ERROR')
    })
  })
  
  describe('Response Helpers', () => {
    it('should create success response', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data, 'Success message')
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.message).toBe('Success message')
      expect(response.timestamp).toBeTruthy()
    })
    
    it('should create error response', () => {
      const error = new ValidationError('Invalid input', 'email')
      const response = createErrorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error.code).toBe('VALIDATION_ERROR')
      expect(response.error.message).toBe('Invalid input')
      expect(response.error.statusCode).toBe(400)
      expect(response.timestamp).toBeTruthy()
    })
  })
  
  describe('Validation Functions', () => {
    describe('isValidEmail', () => {
      it('should validate correct emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(isValidEmail('user+tag@example.org')).toBe(true)
      })
      
      it('should reject invalid emails', () => {
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@example.com')).toBe(false)
        expect(isValidEmail('test..test@example.com')).toBe(false)
      })
    })
    
    describe('isValidPhone', () => {
      it('should validate correct phone numbers', () => {
        expect(isValidPhone('1234567890')).toBe(true)
        expect(isValidPhone('(123) 456-7890')).toBe(true)
        expect(isValidPhone('+1 123 456 7890')).toBe(true)
        expect(isValidPhone('123-456-7890')).toBe(true)
      })
      
      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false)
        expect(isValidPhone('abcd')).toBe(false)
        expect(isValidPhone('')).toBe(false)
      })
    })
    
    describe('isValidSlug', () => {
      it('should validate correct slugs', () => {
        expect(isValidSlug('valid-slug')).toBe(true)
        expect(isValidSlug('another-valid-slug-123')).toBe(true)
        expect(isValidSlug('simple')).toBe(true)
      })
      
      it('should reject invalid slugs', () => {
        expect(isValidSlug('Invalid Slug')).toBe(false)
        expect(isValidSlug('slug_with_underscores')).toBe(false)
        expect(isValidSlug('slug-with-')).toBe(false)
        expect(isValidSlug('-starting-with-dash')).toBe(false)
      })
    })
  })
  
  describe('sanitizeInput', () => {
    it('should sanitize HTML entities', () => {
      expect(sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })
    
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })
    
    it('should handle mixed content', () => {
      expect(sanitizeInput('  <div>Hello & "world"</div>  '))
        .toBe('&lt;div&gt;Hello &amp; &quot;world&quot;&lt;/div&gt;')
    })
    
    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('')
    })
  })
  
  describe('Business Constants', () => {
    it('should have all required lead sources', () => {
      expect(BUSINESS_CONSTANTS.LEAD_SOURCES).toContain('WEBSITE')
      expect(BUSINESS_CONSTANTS.LEAD_SOURCES).toContain('PHONE')
      expect(BUSINESS_CONSTANTS.LEAD_SOURCES).toContain('EMAIL')
      expect(BUSINESS_CONSTANTS.LEAD_SOURCES).toContain('REFERRAL')
    })
    
    it('should have all required lead statuses', () => {
      expect(BUSINESS_CONSTANTS.LEAD_STATUSES).toContain('NEW')
      expect(BUSINESS_CONSTANTS.LEAD_STATUSES).toContain('CONTACTED')
      expect(BUSINESS_CONSTANTS.LEAD_STATUSES).toContain('WON')
      expect(BUSINESS_CONSTANTS.LEAD_STATUSES).toContain('LOST')
    })
    
    it('should have service categories', () => {
      expect(BUSINESS_CONSTANTS.SERVICE_CATEGORIES).toContain('hvac_installation')
      expect(BUSINESS_CONSTANTS.SERVICE_CATEGORIES).toContain('hvac_repair')
      expect(BUSINESS_CONSTANTS.SERVICE_CATEGORIES).toContain('emergency_service')
    })
    
    it('should have content statuses', () => {
      expect(BUSINESS_CONSTANTS.CONTENT_STATUSES).toContain('DRAFT')
      expect(BUSINESS_CONSTANTS.CONTENT_STATUSES).toContain('PUBLISHED')
      expect(BUSINESS_CONSTANTS.CONTENT_STATUSES).toContain('ARCHIVED')
    })
  })
})