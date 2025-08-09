import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  DIRECT_URL: z.string().url('Invalid direct database URL').optional(),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email('Invalid SMTP from email').optional(),
  
  // MeiliSearch
  MEILISEARCH_HOST: z.string().url('Invalid MeiliSearch host').optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
  
  // Plausible Analytics
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_API_HOST: z.string().url('Invalid Plausible API host').optional(),
  
  // File Upload
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters').optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  
  // External APIs
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  RECAPTCHA_SITE_KEY: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  
  // Business Configuration
  BUSINESS_NAME: z.string().default('Aurora HVAC Services'),
  BUSINESS_PHONE: z.string().default('+1 (555) 123-4567'),
  BUSINESS_EMAIL: z.string().email().default('info@aurorahvac.com'),
  BUSINESS_ADDRESS: z.string().default('123 Main St, City, State 12345'),
  
  // Feature Flags
  FEATURE_BLOG: z.coerce.boolean().default(true),
  FEATURE_TESTIMONIALS: z.coerce.boolean().default(true),
  FEATURE_PROJECTS: z.coerce.boolean().default(true),
  FEATURE_SEARCH: z.coerce.boolean().default(true),
  FEATURE_ANALYTICS: z.coerce.boolean().default(true),
  
  // Cache Configuration
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  CACHE_TTL: z.coerce.number().default(3600), // 1 hour
  
  // Monitoring
  SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n')
      
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>

// Helper functions
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test'
}

export function getBaseUrl(): string {
  if (isProduction()) {
    return env.NEXTAUTH_URL
  }
  
  return 'http://localhost:3000'
}

export function getDatabaseUrl(): string {
  return env.DATABASE_URL
}

export function getDirectUrl(): string | undefined {
  return env.DIRECT_URL
}

export function getSmtpConfig() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    return null
  }
  
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    from: env.SMTP_FROM || env.SMTP_USER,
  }
}

export function getMeiliSearchConfig() {
  if (!env.MEILISEARCH_HOST) {
    return null
  }
  
  return {
    host: env.MEILISEARCH_HOST,
    apiKey: env.MEILISEARCH_API_KEY,
  }
}

export function getPlausibleConfig() {
  if (!env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    return null
  }
  
  return {
    domain: env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    apiHost: env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
  }
}

export function getUploadConfig() {
  return {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(',').map(type => type.trim()),
  }
}

export function getRateLimitConfig() {
  return {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW,
  }
}

export function getBusinessConfig() {
  return {
    name: env.BUSINESS_NAME,
    phone: env.BUSINESS_PHONE,
    email: env.BUSINESS_EMAIL,
    address: env.BUSINESS_ADDRESS,
  }
}

export function getFeatureFlags() {
  return {
    blog: env.FEATURE_BLOG,
    testimonials: env.FEATURE_TESTIMONIALS,
    projects: env.FEATURE_PROJECTS,
    search: env.FEATURE_SEARCH,
    analytics: env.FEATURE_ANALYTICS,
  }
}

export function getCacheConfig() {
  return {
    redisUrl: env.REDIS_URL,
    ttl: env.CACHE_TTL,
  }
}

export function getMonitoringConfig() {
  return {
    sentryDsn: env.SENTRY_DSN,
    logLevel: env.LOG_LEVEL,
  }
}

// Validation helpers
export function validateRequiredEnvVars(vars: (keyof Env)[]): void {
  const missing = vars.filter(varName => !env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export function validateEmailConfig(): void {
  validateRequiredEnvVars(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'])
}

export function validateSearchConfig(): void {
  validateRequiredEnvVars(['MEILISEARCH_HOST'])
}

export function validateAnalyticsConfig(): void {
  validateRequiredEnvVars(['NEXT_PUBLIC_PLAUSIBLE_DOMAIN'])
}