import { db } from './client'
import type { LeadStatus, Priority, ContentStatus, UserRole } from './generated'

// Lead Management Utilities
export const leadUtils = {
  // Create a new lead from contact form
  async createLead(data: {
    name: string
    email: string
    phone?: string
    company?: string
    message?: string
    serviceId?: string
    source?: string
  }) {
    return db.lead.create({
      data: {
        ...data,
        source: (data.source as any) || 'WEBSITE',
        status: 'NEW',
        priority: 'MEDIUM',
      },
      include: {
        service: true,
      },
    })
  },

  // Update lead status
  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string) {
    const lead = await db.lead.update({
      where: { id: leadId },
      data: { status, updatedAt: new Date() },
    })

    // Create activity record
    await db.leadActivity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: `Status changed to ${status}`,
        description: notes,
      },
    })

    return lead
  },

  // Get leads with filters
  async getLeads(filters: {
    status?: LeadStatus
    priority?: Priority
    assignedToId?: string
    serviceId?: string
    limit?: number
    offset?: number
  } = {}) {
    const { limit = 50, offset = 0, ...where } = filters
    
    return db.lead.findMany({
      where,
      include: {
        service: true,
        assignedTo: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  // Get lead statistics
  async getLeadStats() {
    const [total, newLeads, qualified, won, lost] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: 'NEW' } }),
      db.lead.count({ where: { status: 'QUALIFIED' } }),
      db.lead.count({ where: { status: 'WON' } }),
      db.lead.count({ where: { status: 'LOST' } }),
    ])

    return { total, newLeads, qualified, won, lost }
  },
}

// Service Management Utilities
export const serviceUtils = {
  // Get published services
  async getPublishedServices() {
    return db.service.findMany({
      where: {
        published: true,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Get service by slug
  async getServiceBySlug(slug: string) {
    return db.service.findUnique({
      where: { slug },
      include: {
        projects: {
          where: { published: true },
          take: 3,
        },
      },
    })
  },

  // Get services by category
  async getServicesByCategory(category: string) {
    return db.service.findMany({
      where: {
        category,
        published: true,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}

// Content Management Utilities
export const contentUtils = {
  // Get published posts
  async getPublishedPosts(limit = 10, offset = 0) {
    return db.post.findMany({
      where: {
        published: true,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  // Get post by slug
  async getPostBySlug(slug: string) {
    return db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })
  },

  // Get page by slug
  async getPageBySlug(slug: string) {
    return db.page.findUnique({
      where: {
        slug,
        published: true,
        status: 'PUBLISHED',
      },
    })
  },
}

// Testimonial Utilities
export const testimonialUtils = {
  // Get approved testimonials
  async getApprovedTestimonials(featured = false) {
    return db.testimonial.findMany({
      where: {
        approved: true,
        ...(featured && { featured: true }),
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  },

  // Create testimonial
  async createTestimonial(data: {
    name: string
    company?: string
    position?: string
    content: string
    rating: number
    serviceId?: string
  }) {
    return db.testimonial.create({
      data: {
        ...data,
        approved: false, // Requires manual approval
      },
    })
  },
}

// Project Portfolio Utilities
export const projectUtils = {
  // Get published projects
  async getPublishedProjects(featured = false, limit = 12) {
    return db.project.findMany({
      where: {
        published: true,
        status: 'PUBLISHED',
        ...(featured && { featured: true }),
      },
      include: {
        service: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { completedAt: 'desc' },
      ],
      take: limit,
    })
  },

  // Get project by slug
  async getProjectBySlug(slug: string) {
    return db.project.findUnique({
      where: { slug },
      include: {
        service: true,
      },
    })
  },
}

// Team Management Utilities
export const teamUtils = {
  // Get active team members
  async getActiveTeamMembers() {
    return db.teamMember.findMany({
      where: { active: true },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    })
  },
}

// Settings Utilities
export const settingsUtils = {
  // Get setting by key
  async getSetting(key: string) {
    const setting = await db.setting.findUnique({
      where: { key },
    })
    return setting?.value
  },

  // Set setting
  async setSetting(key: string, value: string, type = 'string', category = 'general') {
    return db.setting.upsert({
      where: { key },
      update: { value, type, category },
      create: { key, value, type, category },
    })
  },

  // Get settings by category
  async getSettingsByCategory(category: string) {
    const settings = await db.setting.findMany({
      where: { category },
    })
    
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
  },
}