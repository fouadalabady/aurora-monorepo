import { describe, it, expect, vi, beforeEach } from 'vitest'
import Plausible from 'plausible-tracker'
import {
  initAnalytics,
  getAnalyticsClient,
  isAnalyticsAvailable,
  shouldTrack,
  trackPageView,
  trackEvent,
  trackIfAllowed,
} from '../client'

// Mock plausible-tracker
vi.mock('plausible-tracker')

const mockPlausible = vi.mocked(Plausible)
const mockTrackPageview = vi.fn()
const mockTrackEvent = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockPlausible.mockReturnValue({
    trackPageview: mockTrackPageview,
    trackEvent: mockTrackEvent,
  } as any)
  
  // Reset environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'test.com'
  process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST = 'https://plausible.io'
  
  // Reset DNT header
  Object.defineProperty(navigator, 'doNotTrack', {
    value: '0',
    writable: true,
  })
})

describe('Analytics Client', () => {
  describe('initAnalytics', () => {
    it('should initialize with default config when no config provided', () => {
      initAnalytics()
      
      expect(mockPlausible).toHaveBeenCalledWith({
        domain: 'test.com',
        apiHost: 'https://plausible.io',
        trackLocalhost: false,
        hashMode: false,
      })
    })
    
    it('should initialize with custom config', () => {
      const customConfig = {
        domain: 'custom.com',
        apiHost: 'https://custom-plausible.io',
        trackLocalhost: true,
        hashMode: true,
      }
      
      initAnalytics(customConfig)
      
      expect(mockPlausible).toHaveBeenCalledWith(customConfig)
    })
    
    it('should validate config with Zod schema', () => {
      expect(() => {
        initAnalytics({
          domain: '', // Invalid empty domain
          apiHost: 'invalid-url', // Invalid URL
        })
      }).toThrow()
    })
  })
  
  describe('getAnalyticsClient', () => {
    it('should return the initialized client', () => {
      initAnalytics()
      const client = getAnalyticsClient()
      
      expect(client).toBeDefined()
      expect(client.trackPageview).toBe(mockTrackPageview)
      expect(client.trackEvent).toBe(mockTrackEvent)
    })
    
    it('should throw error if client not initialized', () => {
      // Reset the client
      expect(() => {
        getAnalyticsClient()
      }).toThrow('Analytics client not initialized')
    })
  })
  
  describe('isAnalyticsAvailable', () => {
    it('should return true when domain is configured', () => {
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'test.com'
      expect(isAnalyticsAvailable()).toBe(true)
    })
    
    it('should return false when domain is not configured', () => {
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      expect(isAnalyticsAvailable()).toBe(false)
    })
  })
  
  describe('shouldTrack', () => {
    it('should return true in production with no DNT', () => {
      process.env.NODE_ENV = 'production'
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '0',
        writable: true,
      })
      
      expect(shouldTrack()).toBe(true)
    })
    
    it('should return false in development', () => {
      process.env.NODE_ENV = 'development'
      expect(shouldTrack()).toBe(false)
    })
    
    it('should return false when DNT is enabled', () => {
      process.env.NODE_ENV = 'production'
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: true,
      })
      
      expect(shouldTrack()).toBe(false)
    })
    
    it('should return true in test environment', () => {
      process.env.NODE_ENV = 'test'
      expect(shouldTrack()).toBe(true)
    })
  })
  
  describe('trackPageView', () => {
    beforeEach(() => {
      initAnalytics()
    })
    
    it('should track page view with URL', () => {
      trackPageView('/test-page')
      
      expect(mockTrackPageview).toHaveBeenCalledWith({
        url: '/test-page',
      })
    })
    
    it('should track page view with options', () => {
      trackPageView('/test-page', { props: { section: 'header' } })
      
      expect(mockTrackPageview).toHaveBeenCalledWith({
        url: '/test-page',
        props: { section: 'header' },
      })
    })
  })
  
  describe('trackEvent', () => {
    beforeEach(() => {
      initAnalytics()
    })
    
    it('should track event with name only', () => {
      trackEvent('Button Click')
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Button Click', undefined)
    })
    
    it('should track event with props', () => {
      trackEvent('Button Click', { props: { location: 'header' } })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Button Click', {
        props: { location: 'header' },
      })
    })
    
    it('should track event with revenue', () => {
      trackEvent('Purchase', {
        props: { product: 'service' },
        revenue: { currency: 'USD', amount: 100 },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Purchase', {
        props: { product: 'service' },
        revenue: { currency: 'USD', amount: 100 },
      })
    })
  })
  
  describe('trackIfAllowed', () => {
    beforeEach(() => {
      initAnalytics()
    })
    
    it('should execute function when tracking is allowed', () => {
      process.env.NODE_ENV = 'production'
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '0',
        writable: true,
      })
      
      const mockFn = vi.fn()
      const wrappedFn = trackIfAllowed(mockFn)
      
      wrappedFn('test')
      
      expect(mockFn).toHaveBeenCalledWith('test')
    })
    
    it('should not execute function when tracking is not allowed', () => {
      process.env.NODE_ENV = 'development'
      
      const mockFn = vi.fn()
      const wrappedFn = trackIfAllowed(mockFn)
      
      wrappedFn('test')
      
      expect(mockFn).not.toHaveBeenCalled()
    })
    
    it('should not execute function when analytics is not available', () => {
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      
      const mockFn = vi.fn()
      const wrappedFn = trackIfAllowed(mockFn)
      
      wrappedFn('test')
      
      expect(mockFn).not.toHaveBeenCalled()
    })
  })
})