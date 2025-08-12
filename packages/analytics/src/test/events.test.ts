import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  trackPageView,
  trackEvent,
  trackLeadGenerated,
  trackLeadConverted,
  trackQuoteRequested,
  trackServiceViewed,
  trackServiceInquiry,
  trackContactFormSubmitted,
  trackPhoneCallInitiated,
  trackEmailSent,
  trackProjectViewed,
  trackProjectCompleted,
  trackBlogPostViewed,
  trackTestimonialViewed,
  trackSearchPerformed,
} from '../events'
import * as client from '../client'

// Mock the client module
vi.mock('../client', () => ({
  getAnalyticsClient: vi.fn(() => ({
    trackPageview: vi.fn(),
    trackEvent: vi.fn(),
  })),
  trackIfAllowed: vi.fn((fn) => fn),
}))

const mockTrackEvent = vi.fn()
const mockGetAnalyticsClient = vi.mocked(client.getAnalyticsClient)
const mockTrackIfAllowed = vi.mocked(client.trackIfAllowed)

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAnalyticsClient.mockReturnValue({
    trackPageview: vi.fn(),
    trackEvent: mockTrackEvent,
  } as any)
  mockTrackIfAllowed.mockImplementation((fn) => fn)
})

describe('Analytics Events', () => {
  describe('Core tracking functions', () => {
    it('should track page view', () => {
      const mockTrackPageview = vi.fn()
      mockGetAnalyticsClient.mockReturnValue({
        trackPageview: mockTrackPageview,
        trackEvent: vi.fn(),
      } as any)
      
      trackPageView('/test-page', { props: { section: 'header' } })
      
      expect(mockTrackPageview).toHaveBeenCalledWith({
        url: '/test-page',
        props: { section: 'header' },
      })
    })
    
    it('should track custom event', () => {
      trackEvent('Custom Event', {
        props: { category: 'test' },
        revenue: { currency: 'USD', amount: 50 },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Custom Event', {
        props: { category: 'test' },
        revenue: { currency: 'USD', amount: 50 },
      })
    })
  })
  
  describe('Lead tracking', () => {
    it('should track lead generated', () => {
      const leadData = {
        leadSource: 'website',
        serviceType: 'consultation',
        leadValue: 1000,
        props: { campaign: 'summer' },
        revenue: { currency: 'USD', amount: 1000 },
      }
      
      trackLeadGenerated(leadData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Lead Generated', {
        props: {
          leadSource: 'website',
          serviceType: 'consultation',
          leadValue: 1000,
          campaign: 'summer',
        },
        revenue: { currency: 'USD', amount: 1000 },
      })
    })
    
    it('should track lead converted', () => {
      const leadData = {
        leadSource: 'referral',
        serviceType: 'development',
        leadValue: 5000,
      }
      
      trackLeadConverted(leadData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Lead Converted', {
        props: {
          leadSource: 'referral',
          serviceType: 'development',
          leadValue: 5000,
        },
        revenue: undefined,
      })
    })
    
    it('should track quote requested', () => {
      const serviceData = {
        serviceId: 'service-123',
        serviceName: 'Web Development',
        serviceCategory: 'development',
        priceType: 'QUOTE' as const,
      }
      
      trackQuoteRequested(serviceData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Quote Requested', {
        props: {
          serviceId: 'service-123',
          serviceName: 'Web Development',
          serviceCategory: 'development',
          priceType: 'QUOTE',
        },
      })
    })
    
    it('should validate lead event schema', () => {
      expect(() => {
        trackLeadGenerated({
          leadValue: 'invalid' as any, // Should be number
        })
      }).toThrow()
    })
  })
  
  describe('Service tracking', () => {
    it('should track service viewed', () => {
      const serviceData = {
        serviceId: 'service-456',
        serviceName: 'SEO Optimization',
        serviceCategory: 'marketing',
        props: { source: 'homepage' },
      }
      
      trackServiceViewed(serviceData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Service Viewed', {
        props: {
          serviceId: 'service-456',
          serviceName: 'SEO Optimization',
          serviceCategory: 'marketing',
          source: 'homepage',
        },
      })
    })
    
    it('should track service inquiry', () => {
      const serviceData = {
        serviceId: 'service-789',
        serviceName: 'Brand Design',
        priceType: 'FIXED' as const,
      }
      
      trackServiceInquiry(serviceData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Service Inquiry', {
        props: {
          serviceId: 'service-789',
          serviceName: 'Brand Design',
          serviceCategory: undefined,
          priceType: 'FIXED',
        },
      })
    })
    
    it('should validate service event schema', () => {
      expect(() => {
        trackServiceViewed({
          serviceId: '', // Required field
          serviceName: '', // Required field
        })
      }).toThrow()
    })
  })
  
  describe('Contact tracking', () => {
    it('should track contact form submitted with defaults', () => {
      trackContactFormSubmitted()
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Contact Form Submitted', {
        props: {
          formType: 'general',
          source: undefined,
        },
      })
    })
    
    it('should track contact form submitted with data', () => {
      trackContactFormSubmitted({
        formType: 'quote',
        source: 'landing-page',
        props: { campaign: 'winter' },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Contact Form Submitted', {
        props: {
          formType: 'quote',
          source: 'landing-page',
          campaign: 'winter',
        },
      })
    })
    
    it('should track phone call initiated', () => {
      trackPhoneCallInitiated({
        source: 'header',
        props: { device: 'mobile' },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Phone Call Initiated', {
        props: {
          source: 'header',
          device: 'mobile',
        },
      })
    })
    
    it('should track email sent', () => {
      trackEmailSent({
        emailType: 'newsletter',
        recipient: 'customer',
        props: { template: 'monthly' },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Email Sent', {
        props: {
          emailType: 'newsletter',
          recipient: 'customer',
          template: 'monthly',
        },
      })
    })
  })
  
  describe('Project tracking', () => {
    it('should track project viewed', () => {
      const projectData = {
        projectId: 'project-123',
        projectType: 'website',
        props: { featured: true },
      }
      
      trackProjectViewed(projectData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Project Viewed', {
        props: {
          projectId: 'project-123',
          projectType: 'website',
          featured: true,
        },
      })
    })
    
    it('should track project completed', () => {
      const projectData = {
        projectId: 'project-456',
        projectType: 'ecommerce',
        projectValue: 10000,
        revenue: { currency: 'USD', amount: 10000 },
      }
      
      trackProjectCompleted(projectData)
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Project Completed', {
        props: {
          projectId: 'project-456',
          projectType: 'ecommerce',
          projectValue: 10000,
        },
        revenue: { currency: 'USD', amount: 10000 },
      })
    })
    
    it('should validate project event schema', () => {
      expect(() => {
        trackProjectViewed({
          projectId: '', // Required field
        })
      }).toThrow()
    })
  })
  
  describe('Content tracking', () => {
    it('should track blog post viewed', () => {
      trackBlogPostViewed({
        postId: 'post-123',
        postTitle: 'How to Build a Website',
        category: 'tutorials',
        props: { readTime: 5 },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Blog Post Viewed', {
        props: {
          postId: 'post-123',
          postTitle: 'How to Build a Website',
          category: 'tutorials',
          readTime: 5,
        },
      })
    })
    
    it('should track testimonial viewed', () => {
      trackTestimonialViewed({
        testimonialId: 'testimonial-456',
        rating: 5,
        props: { source: 'homepage' },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Testimonial Viewed', {
        props: {
          testimonialId: 'testimonial-456',
          rating: 5,
          source: 'homepage',
        },
      })
    })
  })
  
  describe('Search tracking', () => {
    it('should track search performed', () => {
      trackSearchPerformed({
        query: 'web development',
        resultsCount: 15,
        searchType: 'services',
        props: { filters: 'price' },
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Search Performed', {
        props: {
          query: 'web development',
          resultsCount: 15,
          searchType: 'services',
          filters: 'price',
        },
      })
    })
    
    it('should track search with default search type', () => {
      trackSearchPerformed({
        query: 'design',
        resultsCount: 8,
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Search Performed', {
        props: {
          query: 'design',
          resultsCount: 8,
          searchType: 'global',
        },
      })
    })
  })
  
  describe('trackIfAllowed wrapper', () => {
    it('should wrap all tracking functions with trackIfAllowed', () => {
      trackLeadGenerated({
        leadSource: 'test',
        serviceType: 'test',
      })
      
      expect(mockTrackIfAllowed).toHaveBeenCalled()
    })
  })
})