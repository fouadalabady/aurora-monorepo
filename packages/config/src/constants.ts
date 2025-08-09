// Application constants
export const APP_CONFIG = {
  name: 'Aurora HVAC Services',
  description: 'Professional HVAC installation, repair, and maintenance services',
  version: '1.0.0',
  author: 'Aurora HVAC Team',
  keywords: ['hvac', 'heating', 'cooling', 'air conditioning', 'repair', 'installation'],
} as const

// Business hours and contact information
export const BUSINESS_INFO = {
  name: 'Aurora HVAC Services',
  tagline: 'Your Comfort, Our Priority',
  phone: '+1 (555) 123-4567',
  email: 'info@aurorahvac.com',
  address: {
    street: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'USA',
  },
  hours: {
    monday: { open: '8:00', close: '18:00', closed: false },
    tuesday: { open: '8:00', close: '18:00', closed: false },
    wednesday: { open: '8:00', close: '18:00', closed: false },
    thursday: { open: '8:00', close: '18:00', closed: false },
    friday: { open: '8:00', close: '18:00', closed: false },
    saturday: { open: '9:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: false },
  },
  emergency: {
    available: true,
    phone: '+1 (555) 123-4567',
    surcharge: 150,
  },
  serviceAreas: [
    'Springfield',
    'Decatur',
    'Champaign',
    'Bloomington',
    'Peoria',
    'Quincy',
  ],
  licenses: [
    'IL HVAC License #12345',
    'EPA Section 608 Certified',
    'NATE Certified',
  ],
  insurance: {
    liability: '$2,000,000',
    bonded: true,
  },
} as const

// Service categories and types
export const SERVICE_CATEGORIES = {
  HEATING: {
    id: 'heating',
    name: 'Heating Services',
    description: 'Furnace installation, repair, and maintenance',
    icon: 'flame',
    services: [
      'furnace_installation',
      'furnace_repair',
      'furnace_maintenance',
      'heat_pump_installation',
      'heat_pump_repair',
      'boiler_service',
      'ductwork_heating',
    ],
  },
  COOLING: {
    id: 'cooling',
    name: 'Cooling Services',
    description: 'Air conditioning installation, repair, and maintenance',
    icon: 'snowflake',
    services: [
      'ac_installation',
      'ac_repair',
      'ac_maintenance',
      'central_air',
      'ductless_mini_split',
      'evaporative_cooling',
    ],
  },
  COMMERCIAL: {
    id: 'commercial',
    name: 'Commercial HVAC',
    description: 'Commercial and industrial HVAC solutions',
    icon: 'building',
    services: [
      'commercial_installation',
      'commercial_maintenance',
      'rooftop_units',
      'chiller_service',
      'building_automation',
      'energy_audits',
    ],
  },
  AIR_QUALITY: {
    id: 'air_quality',
    name: 'Air Quality',
    description: 'Indoor air quality improvement solutions',
    icon: 'wind',
    services: [
      'air_purification',
      'humidity_control',
      'duct_cleaning',
      'uv_light_installation',
      'allergen_reduction',
      'ventilation_improvement',
    ],
  },
  EMERGENCY: {
    id: 'emergency',
    name: 'Emergency Services',
    description: '24/7 emergency HVAC repair services',
    icon: 'alert-triangle',
    services: [
      'emergency_repair',
      'no_heat_service',
      'no_cooling_service',
      'system_breakdown',
      'gas_leak_detection',
      'carbon_monoxide_testing',
    ],
  },
} as const

// Lead sources and priorities
export const LEAD_CONFIG = {
  SOURCES: {
    WEBSITE: { name: 'Website', color: '#3B82F6', priority: 1 },
    PHONE: { name: 'Phone Call', color: '#10B981', priority: 2 },
    EMAIL: { name: 'Email', color: '#8B5CF6', priority: 3 },
    REFERRAL: { name: 'Referral', color: '#F59E0B', priority: 4 },
    SOCIAL: { name: 'Social Media', color: '#EF4444', priority: 5 },
    OTHER: { name: 'Other', color: '#6B7280', priority: 6 },
  },
  PRIORITIES: {
    LOW: { name: 'Low', color: '#10B981', score: 1 },
    MEDIUM: { name: 'Medium', color: '#F59E0B', score: 2 },
    HIGH: { name: 'High', color: '#EF4444', score: 3 },
    URGENT: { name: 'Urgent', color: '#DC2626', score: 4 },
  },
  STATUSES: {
    NEW: { name: 'New', color: '#3B82F6', next: ['CONTACTED'] },
    CONTACTED: { name: 'Contacted', color: '#8B5CF6', next: ['QUALIFIED', 'LOST'] },
    QUALIFIED: { name: 'Qualified', color: '#F59E0B', next: ['QUOTED', 'LOST'] },
    QUOTED: { name: 'Quoted', color: '#10B981', next: ['WON', 'LOST'] },
    WON: { name: 'Won', color: '#059669', next: [] },
    LOST: { name: 'Lost', color: '#DC2626', next: [] },
  },
  URGENCY_LEVELS: {
    IMMEDIATE: { name: 'Immediate', hours: 2, surcharge: 200 },
    WITHIN_24H: { name: 'Within 24 Hours', hours: 24, surcharge: 100 },
    WITHIN_WEEK: { name: 'Within a Week', hours: 168, surcharge: 0 },
    FLEXIBLE: { name: 'Flexible', hours: 720, surcharge: 0 },
  },
} as const

// Pricing and estimates
export const PRICING_CONFIG = {
  SERVICE_RATES: {
    DIAGNOSTIC: 150,
    HOURLY_RATE: 125,
    EMERGENCY_SURCHARGE: 150,
    WEEKEND_SURCHARGE: 75,
    HOLIDAY_SURCHARGE: 100,
  },
  ESTIMATE_RANGES: {
    furnace_installation: { min: 3000, max: 8000 },
    furnace_repair: { min: 200, max: 1500 },
    ac_installation: { min: 3500, max: 9000 },
    ac_repair: { min: 150, max: 1200 },
    duct_cleaning: { min: 300, max: 800 },
    maintenance: { min: 150, max: 300 },
  },
  FINANCING_OPTIONS: {
    available: true,
    minAmount: 1000,
    maxAmount: 25000,
    terms: [12, 24, 36, 48, 60],
    promotionalAPR: 0,
    standardAPR: 9.99,
  },
} as const

// Content and SEO configuration
export const CONTENT_CONFIG = {
  BLOG: {
    postsPerPage: 12,
    excerptLength: 160,
    readingTimeWPM: 200,
    categories: [
      'HVAC Tips',
      'Energy Efficiency',
      'Maintenance',
      'Installation',
      'Troubleshooting',
      'Industry News',
    ],
    defaultTags: [
      'hvac',
      'heating',
      'cooling',
      'maintenance',
      'energy-efficiency',
      'home-comfort',
    ],
  },
  SEO: {
    defaultTitle: 'Aurora HVAC Services - Professional Heating & Cooling',
    titleTemplate: '%s | Aurora HVAC Services',
    defaultDescription: 'Professional HVAC installation, repair, and maintenance services. Licensed, insured, and available 24/7 for emergencies.',
    defaultKeywords: [
      'hvac services',
      'heating repair',
      'air conditioning',
      'furnace installation',
      'ac repair',
      'hvac maintenance',
    ],
    openGraph: {
      type: 'website',
      siteName: 'Aurora HVAC Services',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@aurorahvac',
    },
  },
  SCHEMA: {
    organization: {
      '@type': 'Organization',
      name: 'Aurora HVAC Services',
      url: 'https://aurorahvac.com',
      logo: 'https://aurorahvac.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main Street',
        addressLocality: 'Springfield',
        addressRegion: 'IL',
        postalCode: '62701',
        addressCountry: 'US',
      },
    },
  },
} as const

// UI and design constants
export const UI_CONFIG = {
  BREAKPOINTS: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  COLORS: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      600: '#475569',
      900: '#0f172a',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
  },
  ANIMATIONS: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  SPACING: {
    section: '5rem',
    container: '1.5rem',
    component: '2rem',
  },
} as const

// API and external service configuration
export const API_CONFIG = {
  RATE_LIMITS: {
    default: { requests: 100, window: 900000 }, // 100 requests per 15 minutes
    auth: { requests: 5, window: 900000 }, // 5 requests per 15 minutes
    contact: { requests: 3, window: 3600000 }, // 3 requests per hour
    search: { requests: 50, window: 300000 }, // 50 requests per 5 minutes
  },
  TIMEOUTS: {
    default: 30000, // 30 seconds
    upload: 120000, // 2 minutes
    search: 10000, // 10 seconds
  },
  CACHE: {
    ttl: {
      short: 300, // 5 minutes
      medium: 3600, // 1 hour
      long: 86400, // 24 hours
    },
    keys: {
      services: 'services:list',
      projects: 'projects:featured',
      testimonials: 'testimonials:approved',
      pages: 'pages:published',
      posts: 'posts:published',
    },
  },
} as const

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  },
  FOLDERS: {
    services: 'services',
    projects: 'projects',
    blog: 'blog',
    testimonials: 'testimonials',
    general: 'uploads',
  },
  IMAGE_SIZES: {
    thumbnail: { width: 300, height: 200 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 },
    hero: { width: 1920, height: 1080 },
  },
} as const

// Error messages and codes
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PHONE: 'Please enter a valid phone number',
    MIN_LENGTH: 'Must be at least {min} characters',
    MAX_LENGTH: 'Must be no more than {max} characters',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_NOT_FOUND: 'Account not found',
    ACCOUNT_DISABLED: 'Account has been disabled',
    SESSION_EXPIRED: 'Your session has expired',
    UNAUTHORIZED: 'You are not authorized to perform this action',
  },
  GENERAL: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'The requested resource was not found',
    RATE_LIMITED: 'Too many requests. Please try again later.',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  CONTACT: {
    FORM_SUBMITTED: 'Thank you for your message. We\'ll get back to you soon!',
    QUOTE_REQUESTED: 'Quote request submitted successfully. We\'ll contact you within 24 hours.',
    APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully. You\'ll receive a confirmation email.',
  },
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out successfully',
    PASSWORD_RESET: 'Password reset email sent. Please check your inbox.',
  },
  GENERAL: {
    SAVED: 'Changes saved successfully',
    DELETED: 'Item deleted successfully',
    UPDATED: 'Item updated successfully',
  },
} as const

// Feature flags and toggles
export const FEATURE_FLAGS = {
  BLOG_ENABLED: true,
  TESTIMONIALS_ENABLED: true,
  PROJECTS_ENABLED: true,
  SEARCH_ENABLED: true,
  ANALYTICS_ENABLED: true,
  CHAT_WIDGET_ENABLED: false,
  MAINTENANCE_MODE: false,
  BETA_FEATURES: false,
} as const

// Export all constants as a single object for convenience
export const CONSTANTS = {
  APP_CONFIG,
  BUSINESS_INFO,
  SERVICE_CATEGORIES,
  LEAD_CONFIG,
  PRICING_CONFIG,
  CONTENT_CONFIG,
  UI_CONFIG,
  API_CONFIG,
  UPLOAD_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
} as const