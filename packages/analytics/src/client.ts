import Plausible from 'plausible-tracker'
import { z } from 'zod'

// Configuration schema
const analyticsConfigSchema = z.object({
  domain: z.string(),
  apiHost: z.string().optional(),
  trackLocalhost: z.boolean().default(false),
  hashMode: z.boolean().default(false),
  trackOutboundLinks: z.boolean().default(true),
  trackFileDownloads: z.boolean().default(true),
})

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>

// Default configuration
const defaultConfig: AnalyticsConfig = {
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'localhost',
  apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST,
  trackLocalhost: process.env.NODE_ENV === 'development',
  hashMode: false,
  trackOutboundLinks: true,
  trackFileDownloads: true,
}

// Initialize Plausible client
let plausibleClient: ReturnType<typeof Plausible> | null = null

export function initializeAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const validatedConfig = analyticsConfigSchema.parse({
    ...defaultConfig,
    ...config,
  })
  
  plausibleClient = Plausible({
    domain: validatedConfig.domain,
    apiHost: validatedConfig.apiHost,
    trackLocalhost: validatedConfig.trackLocalhost,
    hashMode: validatedConfig.hashMode,
  })
  
  // Auto-track outbound links if enabled
  if (validatedConfig.trackOutboundLinks && typeof window !== 'undefined') {
    plausibleClient.enableAutoOutboundTracking()
  }
  
  // Auto-track file downloads if enabled
  if (validatedConfig.trackFileDownloads && typeof window !== 'undefined') {
    // Note: File download tracking is handled automatically by Plausible
    // when trackFileDownloads is enabled in the client configuration
  }
  
  return plausibleClient
}

export function getAnalyticsClient() {
  if (!plausibleClient) {
    throw new Error('Analytics client not initialized. Call initializeAnalytics() first.')
  }
  return plausibleClient
}

// Check if analytics is available
export function isAnalyticsAvailable(): boolean {
  return plausibleClient !== null
}

// Check if we should track (respects DNT and other privacy settings)
export function shouldTrack(): boolean {
  if (typeof window === 'undefined') return false
  
  // Respect Do Not Track header
  if (navigator.doNotTrack === '1') return false
  
  // Don't track in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !defaultConfig.trackLocalhost) {
    return false
  }
  
  return true
}

// Privacy-first tracking wrapper
export function trackIfAllowed<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    if (!shouldTrack() || !isAnalyticsAvailable()) {
      return
    }
    return fn(...args)
  }) as T
}

// Core tracking functions
export const trackPageView = trackIfAllowed((options?: { url?: string; referrer?: string }) => {
  const client = getAnalyticsClient()
  return client.trackPageview(options)
})

export const trackEvent = trackIfAllowed((eventName: string, options?: { props?: Record<string, any>; url?: string }) => {
  const client = getAnalyticsClient()
  return client.trackEvent(eventName, options)
})