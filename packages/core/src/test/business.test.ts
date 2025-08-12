import { describe, it, expect, vi } from 'vitest'
import {
  LeadManager,
  ServiceManager,
  leadSchema,
  serviceSchema,
  calculateEstimatedValue,
  generateQuoteNumber,
  formatCurrency,
  formatPhoneNumber,
  isBusinessHours,
  getNextBusinessDay,
} from '../business'
import { mockDate } from './setup'

describe('Business Logic Tests', () => {
  describe('Lead Schema Validation', () => {
    it('should validate a valid lead', () => {
      const validLead = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        serviceType: 'HVAC Installation',
        message: 'Need new HVAC system',
      }
      
      expect(() => leadSchema.parse(validLead)).not.toThrow()
    })
    
    it('should reject invalid email', () => {
      const invalidLead = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890',
        serviceType: 'HVAC Installation',
      }
      
      expect(() => leadSchema.parse(invalidLead)).toThrow()
    })
    
    it('should reject short name', () => {
      const invalidLead = {
        name: 'J',
        email: 'john@example.com',
        phone: '1234567890',
        serviceType: 'HVAC Installation',
      }
      
      expect(() => leadSchema.parse(invalidLead)).toThrow()
    })
  })
  
  describe('Service Schema Validation', () => {
    it('should validate a valid service', () => {
      const validService = {
        title: 'HVAC Installation',
        description: 'Professional HVAC installation service',
        category: 'hvac_installation',
        priceType: 'QUOTE' as const,
      }
      
      expect(() => serviceSchema.parse(validService)).not.toThrow()
    })
    
    it('should reject short title', () => {
      const invalidService = {
        title: 'AC',
        description: 'Professional HVAC installation service',
        category: 'hvac_installation',
        priceType: 'QUOTE' as const,
      }
      
      expect(() => serviceSchema.parse(invalidService)).toThrow()
    })
  })
  
  describe('LeadManager', () => {
    it('should create a lead with proper formatting', async () => {
      const leadData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(123) 456-7890',
        serviceType: 'HVAC Installation',
        message: 'Need new HVAC system',
      }
      
      const lead = await LeadManager.createLead(leadData)
      
      expect(lead).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        serviceType: 'HVAC Installation',
        status: 'NEW',
      })
      expect(lead.id).toMatch(/^lead_/)
      expect(lead.slug).toMatch(/john-doe-/)
    })
    
    it('should update lead status', async () => {
      const updated = await LeadManager.updateLeadStatus('lead_123', 'CONTACTED')
      
      expect(updated).toMatchObject({
        id: 'lead_123',
        status: 'CONTACTED',
      })
      expect(updated.updatedAt).toBeInstanceOf(Date)
    })
  })
  
  describe('Utility Functions', () => {
    it('should calculate estimated value correctly', () => {
      const value = calculateEstimatedValue('hvac_installation', 'residential')
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThan(0)
    })
    
    it('should generate unique quote numbers', () => {
      const quote1 = generateQuoteNumber()
      const quote2 = generateQuoteNumber()
      
      expect(quote1).not.toBe(quote2)
      expect(quote1).toMatch(/^Q\d{8}-\d{4}$/)
    })
    
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
    
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890')
    })
    
    it('should check business hours correctly', () => {
      // Monday 9 AM
      const businessHour = new Date('2022-01-03T09:00:00')
      expect(isBusinessHours(businessHour)).toBe(true)
      
      // Sunday 9 AM
      const weekend = new Date('2022-01-02T09:00:00')
      expect(isBusinessHours(weekend)).toBe(false)
      
      // Monday 6 PM
      const afterHours = new Date('2022-01-03T18:00:00')
      expect(isBusinessHours(afterHours)).toBe(false)
    })
    
    it('should get next business day correctly', () => {
      // Friday
      const friday = new Date('2022-01-07T15:00:00')
      const nextBusinessDay = getNextBusinessDay(friday)
      
      // Should be Monday
      expect(nextBusinessDay.getDay()).toBe(1) // Monday
      expect(nextBusinessDay.getDate