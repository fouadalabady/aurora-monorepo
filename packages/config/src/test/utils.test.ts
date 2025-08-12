import { describe, it, expect } from 'vitest'
import {
  createApiUrl,
  createImageUrl,
  formatServiceName,
  getLeadStatusColor,
  getLeadPriorityColor,
  formatBusinessHours,
  isBusinessOpen,
  calculateServiceEstimate,
  validateServiceArea,
  formatPhoneNumber,
  BUSINESS_CONSTANTS,
} from '../utils'

describe('Configuration Utils Tests', () => {
  describe('URL Creation', () => {
    it('should create API URL with base path', () => {
      const url = createApiUrl('/leads')
      expect(url).toBe('/api/leads')
    })
    
    it('should create API URL with query parameters', () => {
      const url = createApiUrl('/leads', { status: 'new', limit: '10' })
      expect(url).toBe('/api/leads?status=new&limit=10')
    })
    
    it('should handle empty query parameters', () => {
      const url = createApiUrl('/leads', {})
      expect(url).toBe('/api/leads')
    })
    
    it('should create image URL with default path', () => {
      const url = createImageUrl('logo.png')
      expect(url).toBe('/images/logo.png')
    })
    
    it('should create image URL with custom path', () => {
      const url = createImageUrl('hero.jpg', '/assets')
      expect(url).toBe('/assets/hero.jpg')
    })
  })
  
  describe('Service Name Formatting', () => {
    it('should format service name to slug', () => {
      expect(formatServiceName('HVAC Installation')).toBe('hvac-installation')
      expect(formatServiceName('Air Conditioning Repair')).toBe('air-conditioning-repair')
      expect(formatServiceName('24/7 Emergency Service')).toBe('24-7-emergency-service')
    })
    
    it('should handle special characters', () => {
      expect(formatServiceName('Service & Maintenance')).toBe('service-maintenance')
      expect(formatServiceName('Heating/Cooling Systems')).toBe('heating-cooling-systems')
    })
    
    it('should handle multiple spaces', () => {
      expect(formatServiceName('  Multiple   Spaces  ')).toBe('multiple-spaces')
    })
  })
  
  describe('Lead Status Colors', () => {
    it('should return correct colors for lead statuses', () => {
      expect(getLeadStatusColor('NEW')).toBe('#3B82F6') // Blue
      expect(getLeadStatusColor('CONTACTED')).toBe('#F59E0B') // Amber
      expect(getLeadStatusColor('QUALIFIED')).toBe('#8B5CF6') // Violet
      expect(getLeadStatusColor('QUOTED')).toBe('#06B6D4') // Cyan
      expect(getLeadStatusColor('WON')).toBe('#10B981') // Emerald
      expect(getLeadStatusColor('LOST')).toBe('#EF4444') // Red
    })
    
    it('should return default color for unknown status', () => {
      expect(getLeadStatusColor('UNKNOWN' as any)).toBe('#6B7280') // Gray
    })
  })
  
  describe('Lead Priority Colors', () => {
    it('should return correct colors for lead priorities', () => {
      expect(getLeadPriorityColor('LOW')).toBe('#10B981') // Emerald
      expect(getLeadPriorityColor('MEDIUM')).toBe('#F59E0B') // Amber
      expect(getLeadPriorityColor('HIGH')).toBe('#EF4444') // Red
      expect(getLeadPriorityColor('URGENT')).toBe('#DC2626') // Red-600
    })
    
    it('should return default color for unknown priority', () => {
      expect(getLeadPriorityColor('UNKNOWN' as any)).toBe('#6B7280') // Gray
    })
  })
  
  describe('Business Hours Formatting', () => {
    it('should format open business hours', () => {
      const hours = { open: '09:00', close: '17:00', closed: false }
      expect(formatBusinessHours(hours)).toBe('9:00 AM - 5:00 PM')
    })
    
    it('should format closed business hours', () => {
      const hours = { open: '', close: '', closed: true }
      expect(formatBusinessHours(hours)).toBe('Closed')
    })
    
    it('should handle 24-hour format', () => {
      const hours = { open: '00:00', close: '23:59', closed: false }
      expect(formatBusinessHours(hours)).toBe('12:00 AM - 11:59 PM')
    })
    
    it('should handle noon and midnight', () => {
      const noonHours = { open: '12:00', close: '13:00', closed: false }
      expect(formatBusinessHours(noonHours)).toBe('12:00 PM - 1:00 PM')
      
      const midnightHours = { open: '23:00', close: '00:00', closed: false }
      expect(formatBusinessHours(midnightHours)).toBe('11:00 PM - 12:00 AM')
    })
  })
  
  describe('Business Open Status', () => {
    it('should return false for closed days', () => {
      const closedHours = { open: '', close: '', closed: true }
      const now = new Date('2024-01-15T10:00:00') // Monday 10 AM
      expect(isBusinessOpen(closedHours, now)).toBe(false)
    })
    
    it('should return true when business is open', () => {
      const openHours = { open: '09:00', close: '17:00', closed: false }
      const now = new Date('2024-01-15T10:00:00') // Monday 10 AM
      expect(isBusinessOpen(openHours, now)).toBe(true)
    })
    
    it('should return false when business is closed', () => {
      const openHours = { open: '09:00', close: '17:00', closed: false }
      const now = new Date('2024-01-15T18:00:00') // Monday 6 PM
      expect(isBusinessOpen(openHours, now)).toBe(false)
    })
    
    it('should handle edge cases at opening and closing times', () => {
      const openHours = { open: '09:00', close: '17:00', closed: false }
      
      const openingTime = new Date('2024-01-15T09:00:00') // Monday 9 AM
      expect(isBusinessOpen(openHours, openingTime)).toBe(true)
      
      const closingTime = new Date('2024-01-15T17:00:00') // Monday 5 PM
      expect(isBusinessOpen(openHours, closingTime)).toBe(false)
    })
  })
  
  describe('Service Estimate Calculation', () => {
    it('should calculate basic service estimate', () => {
      const estimate = calculateServiceEstimate('hvac-installation', 'residential', 1500)
      
      expect(estimate).toEqual({
        basePrice: 1500,
        laborCost: 750, // 50% of base
        materialCost: 750, // 50% of base
        total: 1500,
        estimatedHours: 6, // 1500 / 250
      })
    })
    
    it('should apply commercial multiplier', () => {
      const estimate = calculateServiceEstimate('hvac-installation', 'commercial', 1000)
      
      expect(estimate).toEqual({
        basePrice: 1000,
        laborCost: 600, // 50% of base * 1.2 commercial multiplier
        materialCost: 600, // 50% of base * 1.2 commercial multiplier
        total: 1200, // base * 1.2
        estimatedHours: 4.8, // (1000 * 1.2) / 250
      })
    })
    
    it('should handle different service types', () => {
      const maintenanceEstimate = calculateServiceEstimate('maintenance', 'residential', 200)
      expect(maintenanceEstimate.estimatedHours).toBe(2.67) // 200 / 75
      
      const repairEstimate = calculateServiceEstimate('repair', 'residential', 300)
      expect(repairEstimate.estimatedHours).toBe(2.4) // 300 / 125
    })
    
    it('should use default hourly rate for unknown service types', () => {
      const unknownEstimate = calculateServiceEstimate('unknown-service', 'residential', 500)
      expect(unknownEstimate.estimatedHours).toBe(5) // 500 / 100 (default rate)
    })
  })
  
  describe('Service Area Validation', () => {
    it('should validate addresses within service area', () => {
      const validAddresses = [
        '123 Main St, Austin, TX 78701',
        '456 Oak Ave, Round Rock, TX 78664',
        '789 Pine Rd, Cedar Park, TX 78613',
      ]
      
      validAddresses.forEach(address => {
        expect(validateServiceArea(address)).toBe(true)
      })
    })
    
    it('should reject addresses outside service area', () => {
      const invalidAddresses = [
        '123 Main St, Houston, TX 77001',
        '456 Oak Ave, Dallas, TX 75201',
        '789 Pine Rd, San Antonio, TX 78201',
      ]
      
      invalidAddresses.forEach(address => {
        expect(validateServiceArea(address)).toBe(false)
      })
    })
    
    it('should handle zip code validation', () => {
      expect(validateServiceArea('78701')).toBe(true) // Austin
      expect(validateServiceArea('78664')).toBe(true) // Round Rock
      expect(validateServiceArea('77001')).toBe(false) // Houston
    })
    
    it('should handle case insensitive city names', () => {
      expect(validateServiceArea('austin, tx')).toBe(true)
      expect(validateServiceArea('AUSTIN, TX')).toBe(true)
      expect(validateServiceArea('Austin, TX')).toBe(true)
    })
  })
  
  describe('Phone Number Formatting', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
    })
    
    it('should format 11-digit phone numbers with country code', () => {
      expect(formatPhoneNumber('15551234567')).toBe('+15551234567')
    expect(formatPhoneNumber('+1 555 123 4567')).toBe('+15551234567')
    })
    
    it('should handle invalid phone numbers', () => {
      expect(formatPhoneNumber('123')).toBe('123') // Too short
      expect(formatPhoneNumber('12345678901234')).toBe('12345678901234') // Too long
      expect(formatPhoneNumber('')).toBe('') // Empty
    })
    
    it('should preserve extensions', () => {
      expect(formatPhoneNumber('5551234567 ext 123')).toBe('(555) 123-4567 ext 123')
      expect(formatPhoneNumber('555-123-4567 x456')).toBe('(555) 123-4567 x456')
    })
  })
  
  describe('Constants Integration', () => {
    it('should use business constants correctly', () => {
      expect(BUSINESS_CONSTANTS.name).toBe('Aurora HVAC Services')
      expect(BUSINESS_CONSTANTS.phone).toBe('+15551234567')
      expect(BUSINESS_CONSTANTS.email).toBe('contact@aurorahvac.com')
      expect(BUSINESS_CONSTANTS.serviceAreas).toContain('Austin')
    })
    
    it('should have valid service categories', () => {
      expect(BUSINESS_CONSTANTS.serviceCategories).toHaveLength(6)
      expect(BUSINESS_CONSTANTS.serviceCategories[0].id).toBe('hvac-installation')
      expect(BUSINESS_CONSTANTS.serviceCategories[0].name).toBe('HVAC Installation')
    })
    
    it('should have valid lead sources', () => {
      expect(BUSINESS_CONSTANTS.leadSources).toContain('website')
      expect(BUSINESS_CONSTANTS.leadSources).toContain('referral')
      expect(BUSINESS_CONSTANTS.leadSources).toContain('google')
    })
    
    it('should have valid pricing tiers', () => {
      expect(BUSINESS_CONSTANTS.pricingTiers.basic.name).toBe('Basic Service')
      expect(BUSINESS_CONSTANTS.pricingTiers.premium.name).toBe('Premium Service')
      expect(BUSINESS_CONSTANTS.pricingTiers.enterprise.name).toBe('Enterprise Service')
    })
  })
})