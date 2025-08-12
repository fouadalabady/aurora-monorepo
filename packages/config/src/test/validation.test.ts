import { describe, it, expect } from 'vitest'
import {
  businessHoursSchema,
  contactInfoSchema,
  serviceCategorySchema,
  apiEndpointSchema,
  validateConfiguration,
  validateBusinessConfig,
  validateServiceConfig,
} from '../validation'
import type { BusinessHours, ContactInfo, ServiceCategory, APIEndpoint } from '../types'

describe('Configuration Validation Tests', () => {
  describe('Business Hours Schema', () => {
    it('should validate correct business hours', () => {
      const validHours: BusinessHours = {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '', close: '', closed: true },
      }
      
      const result = businessHoursSchema.safeParse(validHours)
      expect(result.success).toBe(true)
    })
    
    it('should reject invalid time format', () => {
      const invalidHours = {
        monday: { open: '25:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '', close: '', closed: true },
      }
      
      const result = businessHoursSchema.safeParse(invalidHours)
      expect(result.success).toBe(false)
    })
    
    it('should accept closed days with empty times', () => {
      const closedDay = {
        monday: { open: '', close: '', closed: true },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '', close: '', closed: true },
      }
      
      const result = businessHoursSchema.safeParse(closedDay)
      expect(result.success).toBe(true)
    })
  })
  
  describe('Contact Info Schema', () => {
    it('should validate correct contact info', () => {
      const validContact: ContactInfo = {
        phone: '+1 (555) 123-4567',
        email: 'contact@example.com',
        address: '123 Main St, City, State 12345',
        website: 'https://example.com',
      }
      
      const result = contactInfoSchema.safeParse(validContact)
      expect(result.success).toBe(true)
    })
    
    it('should reject invalid email format', () => {
      const invalidContact = {
        phone: '+1 (555) 123-4567',
        email: 'invalid-email',
        address: '123 Main St, City, State 12345',
        website: 'https://example.com',
      }
      
      const result = contactInfoSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
    })
    
    it('should reject invalid URL format', () => {
      const invalidContact = {
        phone: '+1 (555) 123-4567',
        email: 'contact@example.com',
        address: '123 Main St, City, State 12345',
        website: 'not-a-url',
      }
      
      const result = contactInfoSchema.safeParse(invalidContact)
      expect(result.success).toBe(false)
    })
  })
  
  describe('Service Category Schema', () => {
    it('should validate correct service category', () => {
      const validCategory: ServiceCategory = {
        id: 'hvac-installation',
        name: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        icon: 'wrench',
        color: '#3B82F6',
        services: ['Central Air Installation', 'Ductwork Installation'],
        priceRange: { min: 2000, max: 8000 },
        estimatedDuration: '4-8 hours',
        featured: true,
      }
      
      const result = serviceCategorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })
    
    it('should reject negative price range', () => {
      const invalidCategory = {
        id: 'hvac-installation',
        name: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        icon: 'wrench',
        color: '#3B82F6',
        services: ['Central Air Installation'],
        priceRange: { min: -100, max: 8000 },
        estimatedDuration: '4-8 hours',
        featured: true,
      }
      
      const result = serviceCategorySchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
    })
    
    it('should reject invalid color format', () => {
      const invalidCategory = {
        id: 'hvac-installation',
        name: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        icon: 'wrench',
        color: 'invalid-color',
        services: ['Central Air Installation'],
        priceRange: { min: 2000, max: 8000 },
        estimatedDuration: '4-8 hours',
        featured: true,
      }
      
      const result = serviceCategorySchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
    })
  })
  
  describe('API Endpoint Schema', () => {
    it('should validate correct API endpoint', () => {
      const validEndpoint: APIEndpoint = {
        path: '/api/leads',
        method: 'POST',
        rateLimit: 10,
        auth: true,
        cache: false,
      }
      
      const result = apiEndpointSchema.safeParse(validEndpoint)
      expect(result.success).toBe(true)
    })
    
    it('should reject invalid HTTP method', () => {
      const invalidEndpoint = {
        path: '/api/leads',
        method: 'INVALID',
        rateLimit: 10,
        auth: true,
        cache: false,
      }
      
      const result = apiEndpointSchema.safeParse(invalidEndpoint)
      expect(result.success).toBe(false)
    })
    
    it('should reject negative rate limit', () => {
      const invalidEndpoint = {
        path: '/api/leads',
        method: 'POST',
        rateLimit: -5,
        auth: true,
        cache: false,
      }
      
      const result = apiEndpointSchema.safeParse(invalidEndpoint)
      expect(result.success).toBe(false)
    })
  })
  
  describe('Configuration Validation Functions', () => {
    describe('validateConfiguration', () => {
      it('should validate complete configuration', () => {
        const config = {
          business: {
            name: 'Test HVAC',
            contact: {
              phone: '+1 (555) 123-4567',
              email: 'contact@test.com',
              address: '123 Test St',
              website: 'https://test.com',
            },
            hours: {
              monday: { open: '09:00', close: '17:00', closed: false },
              tuesday: { open: '09:00', close: '17:00', closed: false },
              wednesday: { open: '09:00', close: '17:00', closed: false },
              thursday: { open: '09:00', close: '17:00', closed: false },
              friday: { open: '09:00', close: '17:00', closed: false },
              saturday: { open: '10:00', close: '14:00', closed: false },
              sunday: { open: '', close: '', closed: true },
            },
          },
          services: {
            categories: [{
              id: 'hvac',
              name: 'HVAC Services',
              description: 'HVAC services',
              icon: 'wrench',
              color: '#3B82F6',
              services: ['Installation'],
              priceRange: { min: 100, max: 1000 },
              estimatedDuration: '2 hours',
              featured: true,
            }],
          },
          api: {
            endpoints: [{
              path: '/api/test',
              method: 'GET',
              rateLimit: 100,
              auth: false,
              cache: true,
            }],
          },
        }
        
        const result = validateConfiguration(config)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
      
      it('should detect missing sections', () => {
        const config = {
          business: {
            name: 'Test HVAC',
          },
        }
        
        const result = validateConfiguration(config)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Missing business.contact section')
        expect(result.errors).toContain('Missing business.hours section')
        expect(result.errors).toContain('Missing services section')
        expect(result.errors).toContain('Missing api section')
      })
      
      it('should detect invalid data types', () => {
        const config = {
          business: {
            name: 123, // Should be string
            contact: {
              phone: '+1 (555) 123-4567',
              email: 'invalid-email', // Invalid email
              address: '123 Test St',
              website: 'https://test.com',
            },
            hours: {
              monday: { open: '25:00', close: '17:00', closed: false }, // Invalid time
              tuesday: { open: '09:00', close: '17:00', closed: false },
              wednesday: { open: '09:00', close: '17:00', closed: false },
              thursday: { open: '09:00', close: '17:00', closed: false },
              friday: { open: '09:00', close: '17:00', closed: false },
              saturday: { open: '10:00', close: '14:00', closed: false },
              sunday: { open: '', close: '', closed: true },
            },
          },
          services: {
            categories: [],
          },
          api: {
            endpoints: [],
          },
        }
        
        const result = validateConfiguration(config)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(error => error.includes('business.name'))).toBe(true)
        expect(result.errors.some(error => error.includes('business.contact'))).toBe(true)
        expect(result.errors.some(error => error.includes('business.hours'))).toBe(true)
      })
    })
    
    describe('validateBusinessConfig', () => {
      it('should validate correct business config', () => {
        const businessConfig = {
          name: 'Test HVAC',
          contact: {
            phone: '+1 (555) 123-4567',
            email: 'contact@test.com',
            address: '123 Test St',
            website: 'https://test.com',
          },
          hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '14:00', closed: false },
            sunday: { open: '', close: '', closed: true },
          },
        }
        
        const result = validateBusinessConfig(businessConfig)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
      
      it('should detect business hours conflicts', () => {
        const businessConfig = {
          name: 'Test HVAC',
          contact: {
            phone: '+1 (555) 123-4567',
            email: 'contact@test.com',
            address: '123 Test St',
            website: 'https://test.com',
          },
          hours: {
            monday: { open: '17:00', close: '09:00', closed: false }, // Close before open
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '14:00', closed: false },
            sunday: { open: '', close: '', closed: true },
          },
        }
        
        const result = validateBusinessConfig(businessConfig)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(error => error.includes('monday'))).toBe(true)
      })
    })
    
    describe('validateServiceConfig', () => {
      it('should validate correct service config', () => {
        const serviceConfig = {
          categories: [{
            id: 'hvac',
            name: 'HVAC Services',
            description: 'HVAC services',
            icon: 'wrench',
            color: '#3B82F6',
            services: ['Installation', 'Repair'],
            priceRange: { min: 100, max: 1000 },
            estimatedDuration: '2 hours',
            featured: true,
          }],
        }
        
        const result = validateServiceConfig(serviceConfig)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
      
      it('should detect duplicate service category IDs', () => {
        const serviceConfig = {
          categories: [
            {
              id: 'hvac',
              name: 'HVAC Services',
              description: 'HVAC services',
              icon: 'wrench',
              color: '#3B82F6',
              services: ['Installation'],
              priceRange: { min: 100, max: 1000 },
              estimatedDuration: '2 hours',
              featured: true,
            },
            {
              id: 'hvac', // Duplicate ID
              name: 'HVAC Maintenance',
              description: 'HVAC maintenance',
              icon: 'settings',
              color: '#10B981',
              services: ['Maintenance'],
              priceRange: { min: 50, max: 500 },
              estimatedDuration: '1 hour',
              featured: false,
            },
          ],
        }
        
        const result = validateServiceConfig(serviceConfig)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(error => error.includes('Duplicate service category ID'))).toBe(true)
      })
      
      it('should detect invalid price ranges', () => {
        const serviceConfig = {
          categories: [{
            id: 'hvac',
            name: 'HVAC Services',
            description: 'HVAC services',
            icon: 'wrench',
            color: '#3B82F6',
            services: ['Installation'],
            priceRange: { min: 1000, max: 100 }, // Min > Max
            estimatedDuration: '2 hours',
            featured: true,
          }],
        }
        
        const result = validateServiceConfig(serviceConfig)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(error => error.includes('Invalid price range'))).toBe(true)
      })
    })
  })
})