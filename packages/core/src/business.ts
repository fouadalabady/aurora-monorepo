import { z } from 'zod'
// import { prisma } from '@workspace/database' // TODO: Re-enable when database package is ready
import { format, addDays, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns'
import validator from 'validator'
import slugify from 'slugify'

// Business validation schemas
export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  serviceType: z.string().min(1, 'Service type is required'),
  message: z.string().optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'SOCIAL', 'OTHER']).default('WEBSITE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  estimatedValue: z.number().min(0).optional(),
  preferredContactTime: z.string().optional(),
  address: z.string().optional(),
  urgency: z.enum(['IMMEDIATE', 'WITHIN_24H', 'WITHIN_WEEK', 'FLEXIBLE']).default('FLEXIBLE'),
})

export const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priceType: z.enum(['FIXED', 'HOURLY', 'QUOTE']),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

export const testimonialSchema = z.object({
  content: z.string().min(10, 'Testimonial must be at least 10 characters'),
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email('Invalid email address'),
  rating: z.number().min(1).max(5),
  projectType: z.string().optional(),
  featured: z.boolean().default(false),
})

export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  content: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  completedAt: z.date().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export type LeadInput = z.infer<typeof leadSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type TestimonialInput = z.infer<typeof testimonialSchema>
export type ProjectInput = z.infer<typeof projectSchema>

// Lead management functions
export class LeadManager {
  static async createLead(data: LeadInput) {
    const validated = leadSchema.parse(data)
    
    // Sanitize phone number
    const cleanPhone = validator.isMobilePhone(validated.phone) 
      ? validated.phone 
      : validated.phone.replace(/\D/g, '')
    
    // Generate slug for tracking
    const slug = slugify(`${validated.name}-${Date.now()}`, { lower: true })
    
    // TODO: Replace with actual database call when database package is ready
    const lead = {
      id: `lead_${Date.now()}`,
      ...validated,
      phone: cleanPhone,
      slug,
      status: 'NEW' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // TODO: Create initial activity when database is ready
    
    return lead
  }
  
  static async updateLeadStatus(
    leadId: string, 
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'QUOTED' | 'WON' | 'LOST',
    notes?: string
  ) {
    // TODO: Replace with actual database call when database package is ready
    const lead = {
      id: leadId,
      status,
      updatedAt: new Date(),
    }
    
    // TODO: Create activity record when database is ready
    
    return lead
  }
  
  static async addLeadActivity(
    leadId: string,
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'QUOTE_SENT',
    description: string,
    notes?: string,
    metadata?: Record<string, any>
  ) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `activity_${Date.now()}`,
      leadId,
      type,
      description,
      notes,
      metadata,
      createdAt: new Date(),
    }
  }
  
  static async getLeadStats(dateRange?: { from: Date; to: Date }) {
    // TODO: Replace with actual database call when database package is ready
    return {
      total: 25,
      byStatus: {
        NEW: 8,
        CONTACTED: 6,
        QUALIFIED: 4,
        QUOTED: 3,
        WON: 2,
        LOST: 2,
      },
      bySource: {
        WEBSITE: 12,
        PHONE: 5,
        EMAIL: 3,
        REFERRAL: 3,
        SOCIAL: 2,
      },
      byPriority: {
        LOW: 8,
        MEDIUM: 10,
        HIGH: 5,
        URGENT: 2,
      },
    }
  }
  
  static async getConversionRate(dateRange?: { from: Date; to: Date }) {
    // TODO: Replace with actual database call when database package is ready
    return {
      total: 25,
      converted: 2,
      rate: 8.0,
    }
  }
}

// Service management functions
export class ServiceManager {
  static async createService(data: ServiceInput, authorId: string) {
    const validated = serviceSchema.parse(data)
    
    const slug = slugify(validated.title, { lower: true })
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `service_${Date.now()}`,
      ...validated,
      slug,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async updateService(serviceId: string, data: Partial<ServiceInput>) {
    const updates: any = { ...data }
    
    if (data.title) {
      updates.slug = slugify(data.title, { lower: true })
    }
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: serviceId,
      ...updates,
      updatedAt: new Date(),
    }
  }
  
  static async getServicesByCategory(category?: string) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'service_1',
        title: 'HVAC Installation',
        description: 'Professional HVAC installation services',
        category: 'installation',
        status: 'PUBLISHED' as const,
        featured: true,
        createdAt: new Date(),
      },
    ]
  }
  
  static async getFeaturedServices(limit: number = 6) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'service_1',
        title: 'Featured HVAC Service',
        description: 'Our featured HVAC service',
        category: 'maintenance',
        status: 'PUBLISHED' as const,
        featured: true,
        createdAt: new Date(),
      },
    ]
  }
}

// Project management functions
export class ProjectManager {
  static async createProject(data: ProjectInput, authorId: string) {
    const validated = projectSchema.parse(data)
    
    const slug = slugify(validated.title, { lower: true })
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `project_${Date.now()}`,
      ...validated,
      slug,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async getFeaturedProjects(limit: number = 6) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'project_1',
        title: 'Featured Project',
        description: 'Our featured project showcase',
        category: 'commercial',
        status: 'PUBLISHED' as const,
        featured: true,
        completedAt: new Date(),
        createdAt: new Date(),
      },
    ]
  }
  
  static async getProjectsByCategory(category?: string) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'project_1',
        title: 'Commercial HVAC Project',
        description: 'Large commercial HVAC installation',
        category: 'commercial',
        status: 'PUBLISHED' as const,
        featured: false,
        completedAt: new Date(),
        createdAt: new Date(),
      },
    ]
  }
}

// Testimonial management functions
export class TestimonialManager {
  static async createTestimonial(data: TestimonialInput) {
    const validated = testimonialSchema.parse(data)
    
    // TODO: Replace with actual database call when database package is ready
    return {
      id: `testimonial_${Date.now()}`,
      ...validated,
      status: 'PENDING' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  
  static async approveTestimonial(testimonialId: string) {
    // TODO: Replace with actual database call when database package is ready
    return {
      id: testimonialId,
      status: 'APPROVED' as const,
      updatedAt: new Date(),
    }
  }
  
  static async getFeaturedTestimonials(limit: number = 6) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'testimonial_1',
        content: 'Excellent service! Highly recommended.',
        clientName: 'John Doe',
        clientCompany: 'ABC Corp',
        rating: 5,
        featured: true,
        status: 'APPROVED' as const,
        createdAt: new Date(),
      },
    ]
  }
  
  static async getTestimonialsByRating(minRating: number = 4) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        id: 'testimonial_1',
        content: 'Great work and professional service.',
        clientName: 'Jane Smith',
        rating: 5,
        status: 'APPROVED' as const,
        createdAt: new Date(),
      },
    ]
  }
  
  static async getAverageRating() {
    // TODO: Replace with actual database call when database package is ready
    return {
      average: 4.8,
      count: 15,
    }
  }
}

// Business analytics functions
export class BusinessAnalytics {
  static async getDashboardStats(dateRange?: { from: Date; to: Date }) {
    // TODO: Replace with actual database call when database package is ready
    const [leadStats, conversionRate, avgRating] = await Promise.all([
      LeadManager.getLeadStats(dateRange),
      LeadManager.getConversionRate(dateRange),
      TestimonialManager.getAverageRating(),
    ])
    
    const recentActivity = [
      {
        id: 'activity_1',
        type: 'CREATED' as const,
        description: 'New lead created',
        createdAt: new Date(),
        lead: {
          name: 'John Doe',
          email: 'john@example.com',
          serviceType: 'HVAC Installation',
        },
      },
    ]
    
    return {
      leads: leadStats,
      conversion: conversionRate,
      rating: avgRating,
      recentActivity,
    }
  }
  
  static async getMonthlyTrends(months: number = 12) {
    // TODO: Replace with actual database call when database package is ready
    const trends = []
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      trends.push({
        month: format(date, 'MMM yyyy'),
        leads: Math.floor(Math.random() * 20) + 10,
        conversions: Math.floor(Math.random() * 5) + 1,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      })
    }
    
    return trends
  }
  
  static async getLeadSourcePerformance(dateRange?: { from: Date; to: Date }) {
    // TODO: Replace with actual database call when database package is ready
    return [
      {
        source: 'WEBSITE',
        leads: 12,
        conversions: 3,
        conversionRate: 25.0,
        totalValue: 15000,
      },
      {
        source: 'PHONE',
        leads: 5,
        conversions: 2,
        conversionRate: 40.0,
        totalValue: 8000,
      },
      {
        source: 'REFERRAL',
        leads: 3,
        conversions: 2,
        conversionRate: 66.7,
        totalValue: 12000,
      },
    ]
  }
}

// Utility functions
export function calculateEstimatedValue(serviceType: string, complexity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): number {
  const baseValues: Record<string, number> = {
    'hvac_installation': 5000,
    'hvac_repair': 500,
    'hvac_maintenance': 200,
    'commercial_hvac': 15000,
    'emergency_service': 800,
  }
  
  const multipliers = {
    LOW: 0.7,
    MEDIUM: 1.0,
    HIGH: 1.5,
  }
  
  const baseValue = baseValues[serviceType] || 1000
  return Math.round(baseValue * multipliers[complexity])
}

export function generateQuoteNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `Q${date}${random}`
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

export function isBusinessHours(date: Date = new Date()): boolean {
  const hour = date.getHours()
  const day = date.getDay()
  
  // Monday to Friday, 8 AM to 6 PM
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18
}

export function getNextBusinessDay(date: Date = new Date()): Date {
  const nextDay = addDays(date, 1)
  const dayOfWeek = nextDay.getDay()
  
  // If it's Saturday (6), add 2 days to get to Monday
  // If it's Sunday (0), add 1 day to get to Monday
  if (dayOfWeek === 6) {
    return addDays(nextDay, 2)
  } else if (dayOfWeek === 0) {
    return addDays(nextDay, 1)
  }
  
  return nextDay
}