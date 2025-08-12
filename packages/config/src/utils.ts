import { BUSINESS_INFO, SERVICE_CATEGORIES, LEAD_CONFIG, PRICING_CONFIG } from './constants'

// Business constants for testing and external use
export const BUSINESS_CONSTANTS = {
  name: 'Aurora HVAC Services',
  phone: '+15551234567',
  email: 'contact@aurorahvac.com',
  serviceAreas: ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'Leander'],
  serviceCategories: [
    { id: 'hvac-installation', name: 'HVAC Installation' },
    { id: 'hvac-repair', name: 'HVAC Repair' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'air-quality', name: 'Air Quality' },
    { id: 'commercial', name: 'Commercial Services' },
    { id: 'emergency', name: 'Emergency Services' }
  ],
  leadSources: ['website', 'referral', 'google', 'facebook', 'phone', 'email'],
  pricingTiers: {
    basic: { name: 'Basic Service' },
    premium: { name: 'Premium Service' },
    enterprise: { name: 'Enterprise Service' }
  }
} as const
import { env, getBaseUrl } from './env'

// API URL utilities
export function createApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  const baseUrl = getBaseUrl()
  const url = new URL(`/api${endpoint}`, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }
  
  return url.toString()
}

export function createImageUrl(path: string, size?: 'thumbnail' | 'medium' | 'large' | 'hero'): string {
  const baseUrl = getBaseUrl()
  
  if (size) {
    const sizeParam = `?size=${size}`
    return `${baseUrl}/images${path}${sizeParam}`
  }
  
  return `${baseUrl}/images${path}`
}

// Service utilities
export function formatServiceName(serviceId: string): string {
  return serviceId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getServiceIcon(serviceId: string): string {
  // Find the category that contains this service
  for (const category of Object.values(SERVICE_CATEGORIES)) {
    if ((category.services as readonly string[]).includes(serviceId)) {
      return category.icon
    }
  }
  
  // Default icons for specific services
  const serviceIcons: Record<string, string> = {
    furnace_installation: 'flame',
    furnace_repair: 'wrench',
    ac_installation: 'snowflake',
    ac_repair: 'settings',
    maintenance: 'calendar',
    emergency_repair: 'alert-triangle',
    duct_cleaning: 'wind',
    air_purification: 'filter',
  }
  
  return serviceIcons[serviceId] || 'tool'
}

// Lead utilities
export function getLeadPriorityColor(priority: keyof typeof LEAD_CONFIG.PRIORITIES): string {
  return LEAD_CONFIG.PRIORITIES[priority]?.color || '#6B7280'
}

export function getLeadStatusColor(status: keyof typeof LEAD_CONFIG.STATUSES): string {
  return LEAD_CONFIG.STATUSES[status]?.color || '#6B7280'
}

export function getLeadSourceColor(source: keyof typeof LEAD_CONFIG.SOURCES): string {
  return LEAD_CONFIG.SOURCES[source]?.color || '#6B7280'
}

// Business hours utilities
export function formatBusinessHours(hours: { open: string; close: string; closed: boolean }): string {
  if (hours.closed) {
    return 'Closed'
  }
  
  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  return `${displayHour}:${minutes} ${ampm}`
}

export function isBusinessOpen(hours: { open: string; close: string; closed: boolean }, date: Date = new Date()): boolean {
  if (hours.closed) {
    return false
  }
  
  const currentTime = date.getHours() * 60 + date.getMinutes()
  const [openHour, openMinute] = hours.open.split(':').map(Number)
  const [closeHour, closeMinute] = hours.close.split(':').map(Number)
  
  const openTime = openHour * 60 + openMinute
  const closeTime = closeHour * 60 + closeMinute
  
  return currentTime >= openTime && currentTime < closeTime
}

export function getNextBusinessDay(date: Date = new Date()): Date {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  
  // Keep incrementing until we find a non-closed day
  while (BUSINESS_INFO.hours[dayNames[nextDay.getDay()]].closed) {
    nextDay.setDate(nextDay.getDate() + 1)
  }
  
  return nextDay
}

// Pricing utilities
export function calculateServiceEstimate(
  serviceType: string,
  propertyType: 'residential' | 'commercial',
  basePrice: number
): {
  basePrice: number;
  laborCost: number;
  materialCost: number;
  total: number;
  estimatedHours: number;
} {
  const hourlyRates: Record<string, number> = {
    'hvac-installation': 250,
    'maintenance': 75,
    'repair': 125,
  }
  
  const hourlyRate = hourlyRates[serviceType] || 100 // default rate
  
  // Apply commercial multiplier
  const commercialMultiplier = propertyType === 'commercial' ? 1.2 : 1.0
  const adjustedBasePrice = basePrice * commercialMultiplier
  
  // Calculate labor and material costs (50% each of adjusted base price)
  const laborCost = adjustedBasePrice * 0.5
  const materialCost = adjustedBasePrice * 0.5
  
  // Calculate estimated hours
  const estimatedHours = Math.round((adjustedBasePrice / hourlyRate) * 100) / 100
  
  return {
    basePrice,
    laborCost,
    materialCost,
    total: adjustedBasePrice,
    estimatedHours,
  }
}

export function calculateEmergencyRate(baseRate: number, date: Date = new Date()): number {
  let rate = baseRate
  
  // Add emergency surcharge
  rate += PRICING_CONFIG.SERVICE_RATES.EMERGENCY_SURCHARGE
  
  // Add weekend surcharge if applicable
  const day = date.getDay()
  if (day === 0 || day === 6) {
    rate += PRICING_CONFIG.SERVICE_RATES.WEEKEND_SURCHARGE
  }
  
  // Add holiday surcharge if applicable (simplified check)
  if (isHoliday(date)) {
    rate += PRICING_CONFIG.SERVICE_RATES.HOLIDAY_SURCHARGE
  }
  
  return rate
}

// Service area validation
export function validateServiceArea(input: string): boolean {
  const normalizedInput = input.toLowerCase().trim()
  
  // Define service areas with cities and zip codes
  const serviceAreas = {
    cities: ['austin', 'round rock', 'cedar park', 'pflugerville', 'georgetown'],
    zipCodes: ['78701', '78702', '78703', '78704', '78705', '78664', '78613', '78660', '78628']
  }
  
  // Check if input is a zip code
  if (/^\d{5}$/.test(normalizedInput)) {
    return serviceAreas.zipCodes.includes(normalizedInput)
  }
  
  // Check if input contains a city name (for full addresses)
  for (const city of serviceAreas.cities) {
    if (normalizedInput.includes(city)) {
      return true
    }
  }
  
  // Check if input is just a city name
  return serviceAreas.cities.includes(normalizedInput)
}

export function getServiceAreaDistance(city: string): number | null {
  // This would typically integrate with a mapping service
  // For now, return a simple distance based on service area list
  const serviceAreas = BUSINESS_INFO.serviceAreas
  const index = serviceAreas.findIndex(area => 
    area.toLowerCase() === city.toLowerCase().trim()
  )
  
  if (index === -1) return null
  
  // Return approximate distance in miles (simplified)
  const distances = [0, 15, 25, 35, 45, 55] // Miles from main office
  return distances[index] || 60
}

// Contact utilities
export function formatPhoneNumber(phone: string): string {
  // Extract extension if present
  const extensionMatch = phone.match(/(ext|x)\s*(\d+)/i)
  const extension = extensionMatch ? ` ${extensionMatch[1].toLowerCase()} ${extensionMatch[2]}` : ''
  
  // Remove extension from phone number before cleaning
  const phoneWithoutExt = extensionMatch ? phone.replace(extensionMatch[0], '') : phone
  
  // Clean the phone number (remove everything except digits)
  const cleaned = phoneWithoutExt.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}${extension}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1${cleaned.slice(1)}${extension}`
  }
  
  return phone
}

export function createContactUrl(type: 'phone' | 'email' | 'sms', contact?: string): string {
  const defaultContact = type === 'phone' || type === 'sms' 
    ? BUSINESS_INFO.phone 
    : BUSINESS_INFO.email
  
  const contactInfo = contact || defaultContact
  
  switch (type) {
    case 'phone':
      return `tel:${contactInfo.replace(/\D/g, '')}`
    case 'email':
      return `mailto:${contactInfo}`
    case 'sms':
      return `sms:${contactInfo.replace(/\D/g, '')}`
    default:
      return contactInfo
  }
}

// URL utilities
export function createServiceUrl(serviceId: string): string {
  const serviceName = formatServiceName(serviceId)
  const slug = serviceName.toLowerCase().replace(/\s+/g, '-')
  return `/services/${slug}`
}

export function createProjectUrl(projectId: string, title: string): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `/projects/${slug}`
}

export function createBlogUrl(postId: string, title: string): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `/blog/${slug}`
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}

export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// Date utilities
export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Major US holidays (simplified)
  const holidays = [
    { month: 1, day: 1 },   // New Year's Day
    { month: 7, day: 4 },   // Independence Day
    { month: 12, day: 25 }, // Christmas Day
  ]
  
  return holidays.some(holiday => 
    holiday.month === month && holiday.day === day
  )
}

export function formatDate(date: Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit', hour12: true },
  }
  
  return new Intl.DateTimeFormat('en-US', optionsMap[format]).format(date)
}

// Currency utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatCurrencyRange(min: number, max: number, currency: string = 'USD'): string {
  const minFormatted = formatCurrency(min, currency)
  const maxFormatted = formatCurrency(max, currency)
  return `${minFormatted} - ${maxFormatted}`
}

// Text utilities
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  
  return chunks
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

// Object utilities
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  
  keys.forEach(key => {
    delete result[key]
  })
  
  return result
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  
  return result
}