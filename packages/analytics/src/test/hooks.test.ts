import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useAnalytics,
  usePageTracking,
  useEventTracking,
  useLeadTracking,
  useServiceTracking,
} from '../hooks'
import * as client from '../client'

// Mock the client module
vi.mock('../client', () => ({
  trackPageView: vi.fn(),
  trackEvent: vi.fn(),
  isAnalyticsAvailable: vi.fn(),
  shouldTrack: vi.fn(),
}))

// Mock Next.js router
const mockRouter = {
  pathname: '/test',
  asPath: '/test',
  events: {
    on: vi.fn(),
    off: vi.fn(),
  },
}

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

const mockTrackPageView = vi.mocked(client.trackPageView)
const mockTrackEvent = vi.mocked(client.trackEvent)
const mockIsAnalyticsAvailable = vi.mocked(client.isAnalyticsAvailable)
const mockShouldTrack = vi.mocked(client.shouldTrack)

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  mockIsAnalyticsAvailable.mockReturnValue(true)
  mockShouldTrack.mockReturnValue(true)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Analytics Hooks', () => {
  describe('useAnalytics', () => {
    it('should return analytics status', () => {
      mockIsAnalyticsAvailable.mockReturnValue(true)
      mockShouldTrack.mockReturnValue(true)
      
      const { result } = renderHook(() => useAnalytics())
      
      expect(result.current).toEqual({
        isAvailable: true,
        canTrack: true,
        isEnabled: true,
      })
    })
    
    it('should return false when analytics not available', () => {
      mockIsAnalyticsAvailable.mockReturnValue(false)
      mockShouldTrack.mockReturnValue(true)
      
      const { result } = renderHook(() => useAnalytics())
      
      expect(result.current).toEqual({
        isAvailable: false,
        canTrack: true,
        isEnabled: false,
      })
    })
    
    it('should return false when tracking not allowed', () => {
      mockIsAnalyticsAvailable.mockReturnValue(true)
      mockShouldTrack.mockReturnValue(false)
      
      const { result } = renderHook(() => useAnalytics())
      
      expect(result.current).toEqual({
        isAvailable: true,
        canTrack: false,
        isEnabled: false,
      })
    })
  })
  
  describe('usePageTracking', () => {
    it('should track page on mount by default', () => {
      renderHook(() => usePageTracking())
      
      expect(mockTrackPageView).toHaveBeenCalledWith({ url: '/test' })
    })
    
    it('should not track page on mount when disabled', () => {
      renderHook(() => usePageTracking({ trackOnMount: false }))
      
      expect(mockTrackPageView).not.toHaveBeenCalled()
    })
    
    it('should track route changes', () => {
      const { result } = renderHook(() => usePageTracking())
      
      // Simulate route change
      const routeChangeHandler = mockRouter.events.on.mock.calls.find(
        call => call[0] === 'routeChangeComplete'
      )?.[1]
      
      expect(routeChangeHandler).toBeDefined()
      
      // Clear initial mount tracking
      mockTrackPageView.mockClear()
      
      // Trigger route change
      act(() => {
        routeChangeHandler?.()
        vi.advanceTimersByTime(100) // Account for setTimeout delay
      })
      
      expect(mockTrackPageView).toHaveBeenCalledWith({ url: '/test' })
    })
    
    it('should exclude specified routes', () => {
      renderHook(() => usePageTracking({
        excludeRoutes: ['/test'],
      }))
      
      expect(mockTrackPageView).not.toHaveBeenCalled()
    })
    
    it('should exclude routes with wildcards', () => {
      renderHook(() => usePageTracking({
        excludeRoutes: ['/test*'],
      }))
      
      expect(mockTrackPageView).not.toHaveBeenCalled()
    })
    
    it('should include search params when enabled', () => {
      mockRouter.asPath = '/test?param=value'
      
      renderHook(() => usePageTracking({
        includeSearchParams: true,
      }))
      
      expect(mockTrackPageView).toHaveBeenCalledWith({ url: '/test?param=value' })
    })
    
    it('should not track when analytics disabled', () => {
      mockIsAnalyticsAvailable.mockReturnValue(false)
      
      const { result } = renderHook(() => usePageTracking())
      
      expect(mockTrackPageView).not.toHaveBeenCalled()
      expect(result.current.isTracking).toBe(false)
    })
    
    it('should provide manual tracking function', () => {
      const { result } = renderHook(() => usePageTracking({ trackOnMount: false }))
      
      act(() => {
        result.current.trackPage()
      })
      
      expect(mockTrackPageView).toHaveBeenCalledWith({ url: '/test' })
    })
    
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => usePageTracking())
      
      unmount()
      
      expect(mockRouter.events.off).toHaveBeenCalledWith(
        'routeChangeComplete',
        expect.any(Function)
      )
    })
  })
  
  describe('useEventTracking', () => {
    it('should track events immediately when no debounce', () => {
      const { result } = renderHook(() => useEventTracking())
      
      act(() => {
        result.current.trackEvent('Test Event', { props: { test: true } })
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Test Event', {
        props: { test: true },
      })
    })
    
    it('should debounce events when specified', () => {
      const { result } = renderHook(() => useEventTracking())
      
      act(() => {
        result.current.trackEvent('Debounced Event', { props: { test: true } }, 500)
      })
      
      expect(mockTrackEvent).not.toHaveBeenCalled()
      
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Debounced Event', {
        props: { test: true },
      })
    })
    
    it('should cancel previous debounced event', () => {
      const { result } = renderHook(() => useEventTracking())
      
      act(() => {
        result.current.trackEvent('Event 1', {}, 500)
        result.current.trackEvent('Event 1', {}, 500) // Same event, should cancel previous
      })
      
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledTimes(1)
    })
    
    it('should not track when analytics disabled', () => {
      mockIsAnalyticsAvailable.mockReturnValue(false)
      
      const { result } = renderHook(() => useEventTracking())
      
      act(() => {
        result.current.trackEvent('Test Event')
      })
      
      expect(mockTrackEvent).not.toHaveBeenCalled()
      expect(result.current.isTracking).toBe(false)
    })
    
    it('should cleanup timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => useEventTracking())
      
      act(() => {
        result.current.trackEvent('Test Event', {}, 1000)
      })
      
      unmount()
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(mockTrackEvent).not.toHaveBeenCalled()
    })
  })
  
  describe('useLeadTracking', () => {
    it('should track lead generated', () => {
      const { result } = renderHook(() => useLeadTracking())
      
      const leadData = {
        leadSource: 'website',
        serviceType: 'consultation',
        leadValue: 1000,
      }
      
      act(() => {
        result.current.trackLeadGenerated(leadData)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Lead Generated', {
        props: {
          leadSource: 'website',
          serviceType: 'consultation',
          leadValue: 1000,
        },
        revenue: undefined,
      })
    })
    
    it('should track lead converted', () => {
      const { result } = renderHook(() => useLeadTracking())
      
      const leadData = {
        leadSource: 'referral',
        serviceType: 'development',
        revenue: { currency: 'USD', amount: 5000 },
      }
      
      act(() => {
        result.current.trackLeadConverted(leadData)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Lead Converted', {
        props: {
          leadSource: 'referral',
          serviceType: 'development',
          leadValue: undefined,
        },
        revenue: { currency: 'USD', amount: 5000 },
      })
    })
    
    it('should track quote requested', () => {
      const { result } = renderHook(() => useLeadTracking())
      
      const serviceData = {
        serviceId: 'service-123',
        serviceName: 'Web Development',
        serviceCategory: 'development',
        priceType: 'QUOTE' as const,
      }
      
      act(() => {
        result.current.trackQuoteRequested(serviceData)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Quote Requested', {
        props: {
          serviceId: 'service-123',
          serviceName: 'Web Development',
          serviceCategory: 'development',
          priceType: 'QUOTE',
        },
      })
    })
  })
  
  describe('useServiceTracking', () => {
    it('should track service viewed with debouncing', () => {
      const { result } = renderHook(() => useServiceTracking())
      
      const serviceData = {
        serviceId: 'service-456',
        serviceName: 'SEO Optimization',
        serviceCategory: 'marketing',
      }
      
      act(() => {
        result.current.trackServiceViewed(serviceData)
      })
      
      expect(mockTrackEvent).not.toHaveBeenCalled()
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(mockTrackEvent).toHaveBeenCalledWith('Service Viewed', {
        props: {
          serviceId: 'service-456',
          serviceName: 'SEO Optimization',
          serviceCategory: 'marketing',
        },
      }, 1000)
    })
  })
})