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
    
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development'
      
      // Re-import to get updated env
      vi.resetModules()
      const { isDevelopment, isProduction, isTest } = require('../env')
      
      expect(isDevelopment()).toBe(true)
      expect(isProduction()).toBe(false)
      expect(isTest()).toBe(false)
    })
    
    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production'
      
      vi.resetModules()
      const { isDevelopment, isProduction, isTest } = require('../env')
      
      expect(isProduction()).toBe(true)
      expect(isDevelopment()).toBe(false)
      expect(isTest()).toBe(false)
    })
  })
  
  describe('Base URL Configuration', () => {
    it('should return NextAuth URL in production', () => {
      process.env.NODE_ENV = 'production'
      process.env.NEXTAUTH_URL = 'https://example.com'
      
      vi.resetModules()
      const { getBaseUrl } = require('../env')
      
      expect(getBaseUrl()).toBe('https://example.com')
    })
    
    it('should return localhost in non-production', () => {
      process.env.NODE_ENV = 'development'
      
      vi.resetModules()
      const { getBaseUrl } = require('../env')
      
      expect(getBaseUrl()).toBe('http://localhost:3000')
    })
  })
  
  describe('Database Configuration', () => {
    it('should return database URL', () => {
      expect(getDatabaseUrl()).toBe(process.env.DATABASE_URL)
    })
    
    it('should return direct URL when available', () => {
      process.env.DIRECT_URL = 'postgresql://direct:url@localhost:5432/db'
      
      vi.resetModules()
      const { getDirectUrl } = require('../env')
      
      expect(getDirectUrl()).toBe('postgresql://direct:url@localhost:5432/db')
    })
    
    it('should return undefined for direct URL when not set', () => {
      delete process.env.DIRECT_URL
      
      vi.resetModules()
      const { getDirectUrl } = require('../env')
      
      expect(getDirectUrl()).toBeUndefined()
    })
  })
  
  describe('SMTP Configuration', () => {
    it('should return SMTP config when all required fields are present', () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_FROM = 'noreply@example.com'
      
      vi.resetModules()
      const { getSmtpConfig } = require('../env')
      
      const config = getSmtpConfig()
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
    
    it('should return null when required fields are missing', () => {
      delete process.env.SMTP_HOST
      
      vi.resetModules()
      const { getSmtpConfig } = require('../env')
      
      expect(getSmtpConfig()).toBeNull()
    })
    
    it('should use secure connection for port 465', () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password'
      process.env.SMTP_PORT = '465'
      
      vi.resetModules()
      const { getSmtpConfig } = require('../env')
      
      const config = getSmtpConfig()
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
    
    it('should use custom Typesense config when provided', () => {
      process.env.TYPESENSE_HOST = 'search.example.com'
      process.env.TYPESENSE_PORT = '443'
      process.env.TYPESENSE_PROTOCOL = 'https'
      process.env.TYPESENSE_API_KEY = 'test-api-key'
      
      vi.resetModules()
      const { getTypesenseConfig } = require('../env')
      
      const config = getTypesenseConfig()
      expect(config.nodes[0]).toEqual({
        host: 'search.example.com',
        port: 443,
        protocol: 'https',
      })
      expect(config.apiKey).toBe('test-api-key')
    })
  })
  
  describe('MeiliSearch Configuration', () => {
    it('should return null when MeiliSearch host is not configured', () => {
      delete process.env.MEILISEARCH_HOST
      
      vi.resetModules()
      const { getMeiliSearchConfig } = require('../env')
      
      expect(getMeiliSearchConfig()).toBeNull()
    })
    
    it('should return MeiliSearch config when host is provided', () => {
      process.env.MEILISEARCH_HOST = 'https://search.example.com'
      process.env.MEILISEARCH_API_KEY = 'test-key'
      
      vi.resetModules()
      const { getMeiliSearchConfig } = require('../env')
      
      const config = getMeiliSearchConfig()
      expect(config).toEqual({
        host: 'https://search.example.com',
        apiKey: 'test-key',
      })
    })
  })
  
  describe('Plausible Configuration', () => {
    it('should return null when domain is not configured', () => {
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      
      vi.resetModules()
      const { getPlausibleConfig } = require('../env')
      
      expect(getPlausibleConfig()).toBeNull()
    })
    
    it('should return Plausible config with default API host', () => {
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'example.com'
      
      vi.resetModules()
      const { getPlausibleConfig } = require('../env')
      
      const config = getPlausibleConfig()
      expect(config).toEqual({
        domain: 'example.com',
        apiHost: 'https://plausible.io',
      })
    })
    
    it('should use custom API host when provided', () => {
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'example.com'
      process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST = 'https://analytics.example.com'
      
      vi.resetModules()
      const { getPlausibleConfig } = require('../env')
      
      const config = getPlausibleConfig()
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
    
    it('should parse custom upload configuration', () => {
      process.env.UPLOAD_MAX_SIZE = '5242880' // 5MB
      process.env.UPLOAD_ALLOWED_TYPES = 'image/jpeg,image/png'
      
      vi.resetModules()
      const { getUploadConfig } = require('../env')
      
      const config = getUploadConfig()
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
        name: 'Test HVAC Services',
        phone: '+15551234567',
        email: 'test@example.com',
        address: '123 Test St, Test City, TS 12345',
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