// Service-related types
export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  services: string[]
}

export interface ServiceEstimate {
  min: number
  max: number
  typical: number
}

export interface ServiceRate {
  base: number
  emergency?: number
  weekend?: number
  holiday?: number
}

// Lead-related types
export type LeadSource = 'WEBSITE' | 'PHONE' | 'EMAIL' | 'REFERRAL' | 'SOCIAL' | 'OTHER'
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'QUOTED' | 'WON' | 'LOST'
export type UrgencyLevel = 'IMMEDIATE' | 'WITHIN_24H' | 'WITHIN_WEEK' | 'FLEXIBLE'

export interface LeadSourceConfig {
  name: string
  color: string
  priority: number
}

export interface LeadPriorityConfig {
  name: string
  color: string
  score: number
}

export interface LeadStatusConfig {
  name: string
  color: string
  next: LeadStatus[]
}

export interface UrgencyConfig {
  name: string
  hours: number
  surcharge: number
}

// Business-related types
export interface BusinessHours {
  open: string
  close: string
  closed: boolean
}

export interface ContactInfo {
  name: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

export interface EmergencyInfo {
  available: boolean
  phone: string
  surcharge: number
}

export interface InsuranceInfo {
  liability: string
  bonded: boolean
}

// Content-related types
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type PriceType = 'FIXED' | 'HOURLY' | 'QUOTE'

export interface BlogConfig {
  postsPerPage: number
  excerptLength: number
  readingTimeWPM: number
  categories: string[]
  defaultTags: string[]
}

export interface SEOConfig {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  defaultKeywords: string[]
  openGraph: {
    type: string
    siteName: string
    locale: string
  }
  twitter: {
    card: string
    site: string
  }
}

export interface SchemaOrgConfig {
  organization: {
    '@type': string
    name: string
    url: string
    logo: string
    contactPoint: {
      '@type': string
      telephone: string
      contactType: string
      availableLanguage: string
    }
    address: {
      '@type': string
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }
}

// UI-related types
export interface ColorPalette {
  50: string
  100: string
  500: string
  600: string
  900: string
}

export interface AnimationConfig {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    default: string
    in: string
    out: string
    inOut: string
  }
}

export interface SpacingConfig {
  section: string
  container: string
  component: string
}

export interface BreakpointConfig {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// API-related types
export interface RateLimitConfig {
  requests: number
  window: number
}

export interface TimeoutConfig {
  default: number
  upload: number
  search: number
}

export interface CacheConfig {
  ttl: {
    short: number
    medium: number
    long: number
  }
  keys: {
    services: string
    projects: string
    testimonials: string
    pages: string
    posts: string
  }
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  rateLimit?: RateLimitConfig
  timeout?: number
  cache?: {
    enabled: boolean
    ttl: number
  }
}

// Upload-related types
export interface UploadConfig {
  maxFileSize: number
  allowedTypes: {
    images: string[]
    documents: string[]
    all: string[]
  }
  folders: {
    services: string
    projects: string
    blog: string
    testimonials: string
    general: string
  }
  imageSizes: {
    thumbnail: { width: number; height: number }
    medium: { width: number; height: number }
    large: { width: number; height: number }
    hero: { width: number; height: number }
  }
}

// Pricing-related types
export interface PricingConfig {
  serviceRates: {
    diagnostic: number
    hourlyRate: number
    emergencySurcharge: number
    weekendSurcharge: number
    holidaySurcharge: number
  }
  estimateRanges: Record<string, { min: number; max: number }>
  financingOptions: {
    available: boolean
    minAmount: number
    maxAmount: number
    terms: number[]
    promotionalAPR: number
    standardAPR: number
  }
}

// Environment-related types
export interface DatabaseConfig {
  url: string
  directUrl?: string
}

export interface AuthConfig {
  secret: string
  url: string
  providers: {
    google?: {
      clientId: string
      clientSecret: string
    }
  }
}

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

export interface SearchConfig {
  host: string
  apiKey?: string
}

export interface AnalyticsConfig {
  domain: string
  apiHost: string
}

export interface MonitoringConfig {
  sentryDsn?: string
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

// Feature flag types
export interface FeatureFlags {
  blog: boolean
  testimonials: boolean
  projects: boolean
  search: boolean
  analytics: boolean
  chatWidget?: boolean
  maintenanceMode?: boolean
  betaFeatures?: boolean
}

// Error and message types
export interface ErrorMessages {
  validation: {
    required: string
    email: string
    phone: string
    minLength: string
    maxLength: string
  }
  auth: {
    invalidCredentials: string
    accountNotFound: string
    accountDisabled: string
    sessionExpired: string
    unauthorized: string
  }
  general: {
    networkError: string
    serverError: string
    notFound: string
    rateLimited: string
  }
}

export interface SuccessMessages {
  contact: {
    formSubmitted: string
    quoteRequested: string
    appointmentScheduled: string
  }
  auth: {
    loginSuccess: string
    logoutSuccess: string
    passwordReset: string
  }
  general: {
    saved: string
    deleted: string
    updated: string
  }
}

// Configuration validation types
export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ConfigSection {
  name: string
  required: boolean
  validator: (config: any) => ConfigValidationResult
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    totalPages: number
  }
}

// Search types
export interface SearchQuery {
  q: string
  type?: 'all' | 'services' | 'projects' | 'posts' | 'pages'
  category?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult {
  id: string
  type: 'service' | 'project' | 'post' | 'page'
  title: string
  excerpt: string
  url: string
  image?: string
  score: number
  highlights?: {
    title?: string[]
    content?: string[]
  }
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  processingTime: number
  suggestions?: string[]
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  phone: string
  serviceType: string
  message?: string
  urgency?: UrgencyLevel
  preferredContactTime?: string
  address?: string
}

export interface QuoteRequestData extends ContactFormData {
  projectDescription: string
  estimatedBudget?: string
  timeframe?: string
  propertyType: 'residential' | 'commercial'
}

export interface AppointmentData extends ContactFormData {
  preferredDate: string
  preferredTime: string
  serviceLocation: string
  emergencyService: boolean
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface PageViewEvent extends AnalyticsEvent {
  name: 'pageview'
  properties: {
    url: string
    title: string
    referrer?: string
  }
}

export interface LeadEvent extends AnalyticsEvent {
  name: 'lead_generated' | 'lead_converted' | 'quote_requested'
  properties: {
    source: LeadSource
    serviceType: string
    value?: number
  }
}

export interface ServiceEvent extends AnalyticsEvent {
  name: 'service_viewed' | 'service_inquiry'
  properties: {
    serviceId: string
    serviceName: string
    category: string
  }
}