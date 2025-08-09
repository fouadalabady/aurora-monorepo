// Aurora Analytics Package
// Built with Plausible Analytics for privacy-first tracking

// Client configuration
export {
  initializeAnalytics,
  getAnalyticsClient,
  isAnalyticsAvailable,
  shouldTrack,
  trackIfAllowed,
  type AnalyticsConfig,
} from './client'

// Event tracking
export {
  // Core tracking
  trackPageView,
  trackEvent,
  
  // Business events
  trackLeadGenerated,
  trackLeadConverted,
  trackQuoteRequested,
  
  // Service events
  trackServiceViewed,
  trackServiceInquiry,
  
  // Contact events
  trackContactFormSubmitted,
  trackPhoneCallInitiated,
  trackEmailSent,
  
  // Project events
  trackProjectViewed,
  trackProjectCompleted,
  
  // Content events
  trackBlogPostViewed,
  trackTestimonialViewed,
  
  // Search events
  trackSearchPerformed,
  
  // Engagement events
  trackNewsletterSignup,
  trackSocialShare,
  trackFileDownload,
  
  // System events
  trackError,
  trackPerformance,
  
  // Conversion events
  trackFunnelStep,
  trackExperiment,
  trackGoal,
  
  // Types
  type LeadEvent,
  type ServiceEvent,
  type ProjectEvent,
} from './events'

// React hooks for analytics
export { useAnalytics, usePageTracking, useEventTracking } from './hooks'

// Constants
export const ANALYTICS_EVENTS = {
  // Lead events
  LEAD_GENERATED: 'Lead Generated',
  LEAD_CONVERTED: 'Lead Converted',
  QUOTE_REQUESTED: 'Quote Requested',
  
  // Service events
  SERVICE_VIEWED: 'Service Viewed',
  SERVICE_INQUIRY: 'Service Inquiry',
  
  // Contact events
  CONTACT_FORM_SUBMITTED: 'Contact Form Submitted',
  PHONE_CALL_INITIATED: 'Phone Call Initiated',
  EMAIL_SENT: 'Email Sent',
  
  // Project events
  PROJECT_VIEWED: 'Project Viewed',
  PROJECT_COMPLETED: 'Project Completed',
  
  // Content events
  BLOG_POST_VIEWED: 'Blog Post Viewed',
  TESTIMONIAL_VIEWED: 'Testimonial Viewed',
  
  // Search events
  SEARCH_PERFORMED: 'Search Performed',
  
  // Engagement events
  NEWSLETTER_SIGNUP: 'Newsletter Signup',
  SOCIAL_SHARE: 'Social Share',
  FILE_DOWNLOAD: 'File Download',
  
  // System events
  ERROR_OCCURRED: 'Error Occurred',
  PERFORMANCE_METRIC: 'Performance Metric',
  
  // Conversion events
  FUNNEL_STEP: 'Funnel Step',
  EXPERIMENT_VIEW: 'Experiment View',
} as const

export const LEAD_SOURCES = {
  ORGANIC_SEARCH: 'organic_search',
  PAID_SEARCH: 'paid_search',
  SOCIAL_MEDIA: 'social_media',
  EMAIL_MARKETING: 'email_marketing',
  REFERRAL: 'referral',
  DIRECT: 'direct',
  PHONE_CALL: 'phone_call',
  WALK_IN: 'walk_in',
  OTHER: 'other',
} as const

export const SERVICE_CATEGORIES = {
  HVAC_INSTALLATION: 'hvac_installation',
  HVAC_REPAIR: 'hvac_repair',
  HVAC_MAINTENANCE: 'hvac_maintenance',
  COMMERCIAL_HVAC: 'commercial_hvac',
  EMERGENCY_SERVICE: 'emergency_service',
  OTHER: 'other',
} as const

// Utility functions
export function getLeadSourceFromReferrer(referrer: string): string {
  if (!referrer) return LEAD_SOURCES.DIRECT
  
  const url = new URL(referrer)
  const hostname = url.hostname.toLowerCase()
  
  // Social media
  if (hostname.includes('facebook') || hostname.includes('instagram')) {
    return LEAD_SOURCES.SOCIAL_MEDIA
  }
  if (hostname.includes('twitter') || hostname.includes('linkedin')) {
    return LEAD_SOURCES.SOCIAL_MEDIA
  }
  
  // Search engines
  if (hostname.includes('google') || hostname.includes('bing') || hostname.includes('yahoo')) {
    // Check if it's paid search (simplified detection)
    if (url.searchParams.has('gclid') || url.searchParams.has('msclkid')) {
      return LEAD_SOURCES.PAID_SEARCH
    }
    return LEAD_SOURCES.ORGANIC_SEARCH
  }
  
  return LEAD_SOURCES.REFERRAL
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function calculateConversionRate(conversions: number, total: number): number {
  if (total === 0) return 0
  return Math.round((conversions / total) * 100 * 100) / 100 // Round to 2 decimal places
}

// Privacy utilities
export function anonymizeIP(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    // IPv4: Replace last octet with 0
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }
  // IPv6: Replace last 64 bits with zeros (simplified)
  const ipv6Parts = ip.split(':')
  if (ipv6Parts.length >= 4) {
    return `${ipv6Parts.slice(0, 4).join(':')}::`
  }
  return ip
}

export function hashUserIdentifier(identifier: string): string {
  // Simple hash function for user identifiers
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Error handling
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code?: string,
    public event?: string
  ) {
    super(message)
    this.name = 'AnalyticsError'
  }
}

export function isAnalyticsError(error: any): error is AnalyticsError {
  return error instanceof AnalyticsError
}

export function createAnalyticsError(message: string, code?: string, event?: string): AnalyticsError {
  return new AnalyticsError(message, code, event)
}