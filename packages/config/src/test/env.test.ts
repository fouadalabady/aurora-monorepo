import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  env,
  isDevelopment,
  isProduction,
  isTest,
  getBaseUrl,
  getDatabaseUrl,
  getDirectUrl,
  getSmtpConfig,
  getTypesenseConfig,
  getMeiliSearchConfig,
  getPlausibleConfig,
  getUploadConfig,
  getRateLimitConfig,
  getBusinessConfig,
  getFeatureFlags,
  getCacheConfig,
  getMonitoringConfig,
} from '../env'

describe('Environment Configuration Tests', () => {
  describe('Environment Detection', () => {
    it('should detect test environment', () => {
      expect(isTest()).toBe(true)
      expect(isDevelopment()).toBe(false)
      expect(isProduction()).toBe(false)
    })
    
    it('should detect development environment', async () => {
      process.env.NODE_ENV = 'development'
      
      // Re-import to get updated env
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.isDevelopment()).toBe(true)
      expect(envModule.isProduction()).toBe(false)
      expect(envModule.isTest()).toBe(false)
    })
    
    it('should detect production environment', async () => {
      process.env.NODE_ENV = 'production'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.isProduction()).toBe(true)
      expect(envModule.isDevelopment()).toBe(false)
      expect(envModule.isTest()).toBe(false)
    })
  })
  
  describe('Base URL Configuration', () => {
    it('should return NextAuth URL in production', async () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXTAUTH_URL = 'https://example.com'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getBaseUrl()).toBe('https://example.com')
    })
    
    it('should return localhost in non-production', async () => {
      process.env.NODE_ENV = 'development'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getBaseUrl()).toBe('http://localhost:3000')
    })
  })
  
  describe('Database Configuration', () => {
    it('should return database URL', () => {
      expect(getDatabaseUrl()).toBe(process.env.DATABASE_URL)
    })
    
    it('should return direct URL when available', async () => {
      process.env.DIRECT_URL = 'postgresql://direct:url@localhost:5432/db'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getDirectUrl()).toBe('postgresql://direct:url@localhost:5432/db')
    })
    
    it('should return undefined for direct URL when not set', async () => {
      delete process.env.DIRECT_URL
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getDirectUrl()).toBeUndefined()
    })
  })
  
  describe('SMTP Configuration', () => {
    it('should return SMTP config when all required fields are present', async () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_FROM = 'noreply@example.com'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getSmtpConfig()
      expect(config).toEqual({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
        from: 'noreply@example.com',
      })
    })
    
    it('should return null when required fields are missing', async () => {
      delete process.env.SMTP_HOST
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getSmtpConfig()).toBeNull()
    })
    
    it('should use secure connection for port 465', async () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password'
      process.env.SMTP_PORT = '465'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getSmtpConfig()
      expect(config?.secure).toBe(true)
    })
  })
  
  describe('Typesense Configuration', () => {
    it('should return default Typesense config', () => {
      const config = getTypesenseConfig()
      
      expect(config).toEqual({
        nodes: [{
          host: 'localhost',
          port: 8108,
          protocol: 'http',
        }],
        apiKey: '',
        connectionTimeoutSeconds: 5,
      })
    })
    
    it('should use custom Typesense config when provided', async () => {
      process.env.TYPESENSE_HOST = 'search.example.com'
      process.env.TYPESENSE_PORT = '443'
      process.env.TYPESENSE_PROTOCOL = 'https'
      process.env.TYPESENSE_API_KEY = 'test-api-key'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getTypesenseConfig()
      expect(config.nodes[0]).toEqual({
        host: 'search.example.com',
        port: 443,
        protocol: 'https',
      })
      expect(config.apiKey).toBe('test-api-key')
    })
  })
  
  describe('MeiliSearch Configuration', () => {
    it('should return null when MeiliSearch host is not configured', async () => {
      delete process.env.MEILISEARCH_HOST
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getMeiliSearchConfig()).toBeNull()
    })
    
    it('should return MeiliSearch config when host is provided', async () => {
      process.env.MEILISEARCH_HOST = 'https://search.example.com'
      process.env.MEILISEARCH_API_KEY = 'test-key'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getMeiliSearchConfig()
      expect(config).toEqual({
        host: 'https://search.example.com',
        apiKey: 'test-key',
      })
    })
  })
  
  describe('Plausible Configuration', () => {
    it('should return null when domain is not configured', async () => {
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      
      vi.resetModules()
      const envModule = await import('../env')
      
      expect(envModule.getPlausibleConfig()).toBeNull()
    })
    
    it('should return Plausible config with default API host', async () => {
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'example.com'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getPlausibleConfig()
      expect(config).toEqual({
        domain: 'example.com',
        apiHost: 'https://plausible.io',
      })
    })
    
    it('should use custom API host when provided', async () => {
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'example.com'
      process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST = 'https://analytics.example.com'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getPlausibleConfig()
      expect(config?.apiHost).toBe('https://analytics.example.com')
    })
  })
  
  describe('Upload Configuration', () => {
    it('should return upload config with defaults', () => {
      const config = getUploadConfig()
      
      expect(config).toEqual({
        maxSize: 10485760, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      })
    })
    
    it('should parse custom upload configuration', async () => {
      process.env.UPLOAD_MAX_SIZE = '5242880' // 5MB
      process.env.UPLOAD_ALLOWED_TYPES = 'image/jpeg,image/png'
      
      vi.resetModules()
      const envModule = await import('../env')
      
      const config = envModule.getUploadConfig()
      expect(config).toEqual({
        maxSize: 5242880,
        allowedTypes: ['image/jpeg', 'image/png'],
      })
    })
  })
  
  describe('Rate Limit Configuration', () => {
    it('should return rate limit config with defaults', () => {
      const config = getRateLimitConfig()
      
      expect(config).toEqual({
        max: 100,
        windowMs: 900000, // 15 minutes
      })
    })
  })
  
  describe('Business Configuration', () => {
    it('should return business config', () => {
      const config = getBusinessConfig()
      
      expect(config).toEqual({
        name: 'Aurora HVAC Services',
        phone: '+1 (555) 123-4567',
        email: 'info@aurorahvac.com',
        address: '123 Main St, City, State 12345',
      })
    })
  })
  
  describe('Feature Flags', () => {
    it('should return feature flags', () => {
      const flags = getFeatureFlags()
      
      expect(flags).toEqual({
        blog: true,
        testimonials: true,
        projects: true,
        search: true,
        analytics: true,
      })
    })
  })
  
  describe('Cache Configuration', () => {
    it('should return cache config', () => {
      const config = getCacheConfig()
      
      expect(config).toEqual({
        ttl: 3600,
        redisUrl: undefined,
      })
    })
  })
  
  describe('Monitoring Configuration', () => {
    it('should return monitoring config', () => {
      const config = getMonitoringConfig()
      
      expect(config).toEqual({
        sentryDsn: undefined,
        logLevel: 'info',
      })
    })
  })
})