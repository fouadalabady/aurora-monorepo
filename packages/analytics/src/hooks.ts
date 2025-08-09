import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  trackPageView,
  trackEvent,
  isAnalyticsAvailable,
  shouldTrack,
} from './client'
import type { LeadEvent, ServiceEvent, ProjectEvent } from './events'

// Hook for initializing analytics
export function useAnalytics() {
  const isAvailable = isAnalyticsAvailable()
  const canTrack = shouldTrack()
  
  return {
    isAvailable,
    canTrack,
    isEnabled: isAvailable && canTrack,
  }
}

// Hook for automatic page tracking
export function usePageTracking(options: {
  trackOnMount?: boolean
  trackOnRouteChange?: boolean
  excludeRoutes?: string[]
  includeSearchParams?: boolean
} = {}) {
  const {
    trackOnMount = true,
    trackOnRouteChange = true,
    excludeRoutes = [],
    includeSearchParams = false,
  } = options
  
  const router = useRouter()
  const { isEnabled } = useAnalytics()
  const previousPath = useRef<string>()
  
  const shouldTrackRoute = useCallback((path: string) => {
    return !excludeRoutes.some(route => {
      if (route.includes('*')) {
        const pattern = route.replace(/\*/g, '.*')
        return new RegExp(`^${pattern}$`).test(path)
      }
      return path === route
    })
  }, [excludeRoutes])
  
  const trackCurrentPage = useCallback(() => {
    if (!isEnabled) return
    
    const currentPath = includeSearchParams 
      ? router.asPath 
      : router.pathname
    
    if (shouldTrackRoute(currentPath) && currentPath !== previousPath.current) {
      trackPageView({ url: currentPath })
      previousPath.current = currentPath
    }
  }, [router.asPath, router.pathname, isEnabled, includeSearchParams, shouldTrackRoute])
  
  // Track on mount
  useEffect(() => {
    if (trackOnMount) {
      trackCurrentPage()
    }
  }, [trackOnMount, trackCurrentPage])
  
  // Track on route change
  useEffect(() => {
    if (!trackOnRouteChange) return
    
    const handleRouteChange = () => {
      // Small delay to ensure the page has loaded
      setTimeout(trackCurrentPage, 100)
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, trackOnRouteChange, trackCurrentPage])
  
  return {
    trackPage: trackCurrentPage,
    isTracking: isEnabled,
  }
}

// Hook for event tracking with debouncing
export function useEventTracking() {
  const { isEnabled } = useAnalytics()
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())
  
  const trackEventDebounced = useCallback((
    eventName: string,
    options?: { props?: Record<string, any>; revenue?: { currency: string; amount: number } },
    debounceMs: number = 0
  ) => {
    if (!isEnabled) return
    
    const key = `${eventName}-${JSON.stringify(options)}`
    
    // Clear existing timeout for this event
    const existingTimeout = timeouts.current.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    if (debounceMs > 0) {
      const timeout = setTimeout(() => {
        trackEvent(eventName, options)
        timeouts.current.delete(key)
      }, debounceMs)
      
      timeouts.current.set(key, timeout)
    } else {
      trackEvent(eventName, options)
    }
  }, [isEnabled])
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeouts.current.forEach((timeout: NodeJS.Timeout) => clearTimeout(timeout))
      timeouts.current.clear()
    }
  }, [])
  
  return {
    trackEvent: trackEventDebounced,
    isTracking: isEnabled,
  }
}

// Hook for lead tracking
export function useLeadTracking() {
  const { trackEvent } = useEventTracking()
  
  const trackLeadGenerated = useCallback((data: LeadEvent) => {
    trackEvent('Lead Generated', {
      props: {
        leadSource: data.leadSource,
        serviceType: data.serviceType,
        leadValue: data.leadValue,
        ...data.props,
      },
      revenue: data.revenue,
    })
  }, [trackEvent])
  
  const trackLeadConverted = useCallback((data: LeadEvent) => {
    trackEvent('Lead Converted', {
      props: {
        leadSource: data.leadSource,
        serviceType: data.serviceType,
        leadValue: data.leadValue,
        ...data.props,
      },
      revenue: data.revenue,
    })
  }, [trackEvent])
  
  const trackQuoteRequested = useCallback((data: ServiceEvent) => {
    trackEvent('Quote Requested', {
      props: {
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        serviceCategory: data.serviceCategory,
        priceType: data.priceType,
        ...data.props,
      },
    })
  }, [trackEvent])
  
  return {
    trackLeadGenerated,
    trackLeadConverted,
    trackQuoteRequested,
  }
}

// Hook for service tracking
export function useServiceTracking() {
  const { trackEvent } = useEventTracking()
  
  const trackServiceViewed = useCallback((data: ServiceEvent) => {
    trackEvent('Service Viewed', {
      props: {
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        serviceCategory: data.serviceCategory,
        ...data.props,
      },
    }, 1000) // Debounce for 1 second
  }, [trackEvent])
  
  const trackServiceInquiry = useCallback((data: ServiceEvent) => {
    trackEvent('Service Inquiry', {
      props: {
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        serviceCategory: data.serviceCategory,
        ...data.props,
      },
    })
  }, [trackEvent])
  
  return {
    trackServiceViewed,
    trackServiceInquiry,
  }
}

// Hook for form tracking
export function useFormTracking(formName: string) {
  const { trackEvent } = useEventTracking()
  const startTime = useRef<number>()
  const fieldInteractions = useRef<Set<string>>(new Set())
  
  const trackFormStart = useCallback(() => {
    startTime.current = Date.now()
    trackEvent('Form Started', {
      props: { formName },
    })
  }, [trackEvent, formName])
  
  const trackFieldInteraction = useCallback((fieldName: string) => {
    if (!fieldInteractions.current.has(fieldName)) {
      fieldInteractions.current.add(fieldName)
      trackEvent('Form Field Interaction', {
        props: {
          formName,
          fieldName,
          totalFields: fieldInteractions.current.size,
        },
      })
    }
  }, [trackEvent, formName])
  
  const trackFormSubmit = useCallback((success: boolean, errorMessage?: string) => {
    const timeSpent = startTime.current ? Date.now() - startTime.current : 0
    
    trackEvent(success ? 'Form Submitted' : 'Form Error', {
      props: {
        formName,
        timeSpent,
        fieldsInteracted: fieldInteractions.current.size,
        success,
        errorMessage,
      },
    })
  }, [trackEvent, formName])
  
  const trackFormAbandonment = useCallback(() => {
    const timeSpent = startTime.current ? Date.now() - startTime.current : 0
    
    if (fieldInteractions.current.size > 0) {
      trackEvent('Form Abandoned', {
        props: {
          formName,
          timeSpent,
          fieldsInteracted: fieldInteractions.current.size,
        },
      })
    }
  }, [trackEvent, formName])
  
  // Track form abandonment on unmount
  useEffect(() => {
    return () => {
      if (startTime.current && fieldInteractions.current.size > 0) {
        trackFormAbandonment()
      }
    }
  }, [trackFormAbandonment])
  
  return {
    trackFormStart,
    trackFieldInteraction,
    trackFormSubmit,
    trackFormAbandonment,
  }
}

// Hook for scroll tracking
export function useScrollTracking(options: {
  thresholds?: number[]
  debounceMs?: number
  element?: string
} = {}) {
  const {
    thresholds = [25, 50, 75, 90],
    debounceMs = 500,
    element = 'window',
  } = options
  
  const { trackEvent } = useEventTracking()
  const trackedThresholds = useRef<Set<number>>(new Set())
  const lastScrollTime = useRef<number>(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime.current < debounceMs) return
      lastScrollTime.current = now
      
      const scrollElement = element === 'window' ? document.documentElement : document.querySelector(element)
      if (!scrollElement) return
      
      const scrollTop = element === 'window' ? window.pageYOffset : scrollElement.scrollTop
      const scrollHeight = element === 'window' 
        ? document.documentElement.scrollHeight - window.innerHeight
        : scrollElement.scrollHeight - scrollElement.clientHeight
      
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100)
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold)
          trackEvent('Scroll Depth', {
            props: {
              threshold,
              element,
              scrollPercent,
            },
          })
        }
      })
    }
    
    const target = element === 'window' ? window : document.querySelector(element)
    if (!target) return
    
    target.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      target.removeEventListener('scroll', handleScroll)
    }
  }, [trackEvent, thresholds, debounceMs, element])
  
  return {
    resetTracking: () => trackedThresholds.current.clear(),
  }
}

// Hook for click tracking
export function useClickTracking(selector: string, eventName: string) {
  const { trackEvent } = useEventTracking()
  
  useEffect(() => {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement
      const text = target.textContent?.trim() || ''
      const href = target.getAttribute('href')
      
      trackEvent(eventName, {
        props: {
          selector,
          text: text.substring(0, 100), // Limit text length
          href,
          tagName: target.tagName.toLowerCase(),
        },
      })
    }
    
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.addEventListener('click', handleClick)
    })
    
    return () => {
      elements.forEach(element => {
        element.removeEventListener('click', handleClick)
      })
    }
  }, [selector, eventName, trackEvent])
}