// Environment configuration exports
export {
  env,
  isDevelopment,
  isProduction,
  isTest,
  getBaseUrl,
  getDatabaseUrl,
  getDirectUrl,
  getSmtpConfig,
  getTypesenseConfig,
  getMeiliSearchConfig, // Deprecated
  getPlausibleConfig,
  getUploadConfig,
  getRateLimitConfig,
  getBusinessConfig,
  getFeatureFlags,
  getCacheConfig,
  getMonitoringConfig,
  validateRequiredEnvVars,
  validateEmailConfig,
  validateSearchConfig,
  validateAnalyticsConfig,
} from './env'

// Environment types
export type { Env } from './env'

// Constants exports
export {
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
  CONSTANTS,
} from './constants'

// Utility functions
export {
  createApiUrl,
  createImageUrl,
  formatServiceName,
  getServiceIcon,
  getLeadPriorityColor,
  getLeadStatusColor,
  formatBusinessHours,
  isBusinessOpen,
  calculateServiceEstimate,
  validateServiceArea,
} from './utils'

// Type definitions
export type {
  ServiceCategory,
  LeadSource,
  LeadPriority,
  LeadStatus,
  BusinessHours,
  ServiceEstimate,
  ContactInfo,
  ApiEndpoint,
} from './types'

// Configuration validation
export {
  validateConfig,
  validateBusinessConfig,
  validateServiceConfig,
  validateApiConfig,
} from './validation'