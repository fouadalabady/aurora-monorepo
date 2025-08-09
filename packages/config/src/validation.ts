import { z } from 'zod'
import type {
  ConfigValidationResult,
  ConfigSection,
  BusinessHours,
  ContactInfo,
  ServiceCategory,
  ApiEndpoint,
} from './types'

// Validation schemas
const businessHoursSchema = z.object({
  open: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  close: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  closed: z.boolean(),
})

const contactInfoSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    country: z.string().min(2, 'Country is required'),
  }),
})

const serviceCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Category description is required'),
  icon: z.string().min(1, 'Category icon is required'),
  services: z.array(z.string()).min(1, 'At least one service is required'),
})

const apiEndpointSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string().min(1, 'API path is required'),
  rateLimit: z.object({
    requests: z.number().min(1, 'Rate limit requests must be positive'),
    window: z.number().min(1000, 'Rate limit window must be at least 1 second'),
  }).optional(),
  timeout: z.number().min(1000, 'Timeout must be at least 1 second').optional(),
  cache: z.object({
    enabled: z.boolean(),
    ttl: z.number().min(0, 'Cache TTL must be non-negative'),
  }).optional(),
})

// Main validation function
export function validateConfig(config: any): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate required sections
  const sections: ConfigSection[] = [
    {
      name: 'business',
      required: true,
      validator: validateBusinessConfig,
    },
    {
      name: 'services',
      required: true,
      validator: validateServiceConfig,
    },
    {
      name: 'api',
      required: true,
      validator: validateApiConfig,
    },
    {
      name: 'features',
      required: false,
      validator: validateFeatureConfig,
    },
  ]

  sections.forEach(section => {
    if (section.required && !config[section.name]) {
      errors.push(`Missing required configuration section: ${section.name}`)
      return
    }

    if (config[section.name]) {
      const result = section.validator(config[section.name])
      errors.push(...result.errors.map(err => `${section.name}: ${err}`))
      warnings.push(...result.warnings.map(warn => `${section.name}: ${warn}`))
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Business configuration validation
export function validateBusinessConfig(config: any): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Validate contact info
    if (config.contactInfo) {
      contactInfoSchema.parse(config.contactInfo)
    } else {
      errors.push('Contact information is required')
    }

    // Validate business hours
    if (config.hours) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      
      days.forEach(day => {
        if (config.hours[day]) {
          try {
            businessHoursSchema.parse(config.hours[day])
            
            // Check for logical time order
            const hours = config.hours[day] as BusinessHours
            if (!hours.closed) {
              const [openHour, openMinute] = hours.open.split(':').map(Number)
              const [closeHour, closeMinute] = hours.close.split(':').map(Number)
              
              const openTime = openHour * 60 + openMinute
              const closeTime = closeHour * 60 + closeMinute
              
              if (openTime >= closeTime) {
                warnings.push(`${day}: Opening time should be before closing time`)
              }
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors.push(`${day}: ${error.errors[0].message}`)
            }
          }
        } else {
          warnings.push(`Missing business hours for ${day}`)
        }
      })
    } else {
      warnings.push('Business hours not configured')
    }

    // Validate service areas
    if (config.serviceAreas) {
      if (!Array.isArray(config.serviceAreas) || config.serviceAreas.length === 0) {
        warnings.push('No service areas configured')
      }
    } else {
      warnings.push('Service areas not configured')
    }

    // Validate emergency service config
    if (config.emergency) {
      if (typeof config.emergency.available !== 'boolean') {
        errors.push('Emergency service availability must be a boolean')
      }
      
      if (config.emergency.available) {
        if (!config.emergency.phone) {
          errors.push('Emergency phone number is required when emergency service is available')
        }
        
        if (typeof config.emergency.surcharge !== 'number' || config.emergency.surcharge < 0) {
          warnings.push('Emergency surcharge should be a positive number')
        }
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => err.message))
    } else {
      errors.push('Unknown validation error in business configuration')
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

// Service configuration validation
export function validateServiceConfig(config: any): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Validate service categories
    if (config.categories) {
      if (typeof config.categories !== 'object') {
        errors.push('Service categories must be an object')
      } else {
        Object.entries(config.categories).forEach(([key, category]) => {
          try {
            serviceCategorySchema.parse(category)
            
            // Check for duplicate service IDs across categories
            const categoryData = category as ServiceCategory
            if (categoryData.id !== key) {
              warnings.push(`Category key '${key}' does not match category ID '${categoryData.id}'`)
            }
          } catch (error) {
            if (error instanceof z.ZodError) {
              errors.push(`Category '${key}': ${error.errors[0].message}`)
            }
          }
        })
        
        // Check for duplicate services across categories
        const allServices: string[] = []
        Object.values(config.categories).forEach((category: any) => {
          if (category.services) {
            category.services.forEach((service: string) => {
              if (allServices.includes(service)) {
                warnings.push(`Service '${service}' appears in multiple categories`)
              } else {
                allServices.push(service)
              }
            })
          }
        })
      }
    } else {
      errors.push('Service categories are required')
    }

    // Validate pricing configuration
    if (config.pricing) {
      if (config.pricing.serviceRates) {
        const rates = config.pricing.serviceRates
        
        if (typeof rates.diagnostic !== 'number' || rates.diagnostic <= 0) {
          warnings.push('Diagnostic rate should be a positive number')
        }
        
        if (typeof rates.hourlyRate !== 'number' || rates.hourlyRate <= 0) {
          warnings.push('Hourly rate should be a positive number')
        }
        
        if (typeof rates.emergencySurcharge !== 'number' || rates.emergencySurcharge < 0) {
          warnings.push('Emergency surcharge should be a non-negative number')
        }
      }
      
      if (config.pricing.estimateRanges) {
        Object.entries(config.pricing.estimateRanges).forEach(([service, range]: [string, any]) => {
          if (typeof range.min !== 'number' || typeof range.max !== 'number') {
            errors.push(`Service '${service}': Estimate range must have numeric min and max values`)
          } else if (range.min >= range.max) {
            warnings.push(`Service '${service}': Minimum estimate should be less than maximum`)
          }
        })
      }
    }

  } catch (error) {
    errors.push('Unknown validation error in service configuration')
  }

  return { valid: errors.length === 0, errors, warnings }
}

// API configuration validation
export function validateApiConfig(config: any): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Validate rate limits
    if (config.rateLimits) {
      Object.entries(config.rateLimits).forEach(([endpoint, limit]: [string, any]) => {
        if (typeof limit.requests !== 'number' || limit.requests <= 0) {
          errors.push(`Rate limit for '${endpoint}': Requests must be a positive number`)
        }
        
        if (typeof limit.window !== 'number' || limit.window < 1000) {
          errors.push(`Rate limit for '${endpoint}': Window must be at least 1000ms`)
        }
      })
    }

    // Validate timeouts
    if (config.timeouts) {
      Object.entries(config.timeouts).forEach(([operation, timeout]: [string, any]) => {
        if (typeof timeout !== 'number' || timeout < 1000) {
          warnings.push(`Timeout for '${operation}': Should be at least 1000ms`)
        }
        
        if (timeout > 300000) { // 5 minutes
          warnings.push(`Timeout for '${operation}': Very long timeout (${timeout}ms) may cause poor user experience`)
        }
      })
    }

    // Validate cache configuration
    if (config.cache) {
      if (config.cache.ttl) {
        Object.entries(config.cache.ttl).forEach(([type, ttl]: [string, any]) => {
          if (typeof ttl !== 'number' || ttl < 0) {
            errors.push(`Cache TTL for '${type}': Must be a non-negative number`)
          }
        })
      }
      
      if (config.cache.keys) {
        Object.entries(config.cache.keys).forEach(([type, key]: [string, any]) => {
          if (typeof key !== 'string' || key.length === 0) {
            errors.push(`Cache key for '${type}': Must be a non-empty string`)
          }
        })
      }
    }

    // Validate endpoints
    if (config.endpoints) {
      Object.entries(config.endpoints).forEach(([name, endpoint]: [string, any]) => {
        try {
          apiEndpointSchema.parse(endpoint)
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(`Endpoint '${name}': ${error.errors[0].message}`)
          }
        }
      })
    }

  } catch (error) {
    errors.push('Unknown validation error in API configuration')
  }

  return { valid: errors.length === 0, errors, warnings }
}

// Feature configuration validation
export function validateFeatureConfig(config: any): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const knownFeatures = [
      'blog',
      'testimonials',
      'projects',
      'search',
      'analytics',
      'chatWidget',
      'maintenanceMode',
      'betaFeatures',
    ]

    // Check for unknown features
    Object.keys(config).forEach(feature => {
      if (!knownFeatures.includes(feature)) {
        warnings.push(`Unknown feature flag: ${feature}`)
      }
      
      if (typeof config[feature] !== 'boolean') {
        errors.push(`Feature '${feature}': Must be a boolean value`)
      }
    })

    // Check for conflicting features
    if (config.maintenanceMode && config.analytics) {
      warnings.push('Analytics may not work properly in maintenance mode')
    }

    if (config.search && !config.blog && !config.projects) {
      warnings.push('Search is enabled but no searchable content features are enabled')
    }

  } catch (error) {
    errors.push('Unknown validation error in feature configuration')
  }

  return { valid: errors.length === 0, errors, warnings }
}

// Environment validation
export function validateEnvironmentConfig(env: Record<string, any>): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  required.forEach(varName => {
    if (!env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Validate URLs
  const urlVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'MEILISEARCH_HOST', 'NEXT_PUBLIC_PLAUSIBLE_API_HOST']
  urlVars.forEach(varName => {
    if (env[varName]) {
      try {
        new URL(env[varName])
      } catch {
        errors.push(`Invalid URL format for ${varName}: ${env[varName]}`)
      }
    }
  })

  // Validate email addresses
  const emailVars = ['SMTP_FROM', 'BUSINESS_EMAIL']
  emailVars.forEach(varName => {
    if (env[varName]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(env[varName])) {
        errors.push(`Invalid email format for ${varName}: ${env[varName]}`)
      }
    }
  })

  // Validate numeric values
  const numericVars = ['SMTP_PORT', 'UPLOAD_MAX_SIZE', 'RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW', 'CACHE_TTL']
  numericVars.forEach(varName => {
    if (env[varName] && isNaN(Number(env[varName]))) {
      errors.push(`Invalid numeric value for ${varName}: ${env[varName]}`)
    }
  })

  // Check for development-specific warnings
  if (env.NODE_ENV === 'production') {
    if (!env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured for production environment')
    }
    
    if (!env.REDIS_URL) {
      warnings.push('REDIS_URL not configured - caching will be limited')
    }
    
    if (env.LOG_LEVEL === 'debug') {
      warnings.push('Debug logging enabled in production')
    }
  }

  // Check for security warnings
  if (env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET should be at least 32 characters long')
  }

  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long')
  }

  return { valid: errors.length === 0, errors, warnings }
}

// Utility functions for validation
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneFormat(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export function validateUrlFormat(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^\d{1,2}:\d{2}$/
  if (!timeRegex.test(time)) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export function validateZipCodeFormat(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// Configuration completeness checker
export function checkConfigCompleteness(config: any): {
  completeness: number
  missingOptional: string[]
  recommendations: string[]
} {
  const optionalSections = [
    'analytics',
    'search',
    'email',
    'monitoring',
    'cache',
    'upload',
  ]
  
  const missingOptional: string[] = []
  const recommendations: string[] = []
  
  optionalSections.forEach(section => {
    if (!config[section]) {
      missingOptional.push(section)
    }
  })
  
  // Calculate completeness percentage
  const totalSections = optionalSections.length + 3 // 3 required sections
  const presentSections = totalSections - missingOptional.length
  const completeness = Math.round((presentSections / totalSections) * 100)
  
  // Generate recommendations
  if (missingOptional.includes('analytics')) {
    recommendations.push('Consider enabling analytics to track website performance')
  }
  
  if (missingOptional.includes('search')) {
    recommendations.push('Enable search functionality to improve user experience')
  }
  
  if (missingOptional.includes('email')) {
    recommendations.push('Configure email settings for contact forms and notifications')
  }
  
  if (missingOptional.includes('cache')) {
    recommendations.push('Set up caching to improve application performance')
  }
  
  return {
    completeness,
    missingOptional,
    recommendations,
  }
}