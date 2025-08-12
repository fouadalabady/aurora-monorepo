import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrismaClient } from './setup'
import { seedDatabase } from '../seed'

describe('Database Seed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('seedDatabase', () => {
    it('should seed all data successfully', async () => {
      // Mock all database operations
      const mockUser = createMockUser()
      const mockService = createMockService()
      const mockTestimonial = createMockTestimonial()
      const mockTeamMember = createMockTeamMember()
      const mockProject = createMockProject()
      const mockPost = createMockPost()
      const mockSetting = createMockSetting()
      const mockLead = createMockLead()

      mockPrismaClient.user.upsert.mockResolvedValue(mockUser)
      mockPrismaClient.service.upsert.mockResolvedValue(mockService)
      mockPrismaClient.testimonial.create.mockResolvedValue(mockTestimonial)
      mockPrismaClient.teamMember.create.mockResolvedValue(mockTeamMember)
      mockPrismaClient.project.create.mockResolvedValue(mockProject)
      mockPrismaClient.post.create.mockResolvedValue(mockPost)
      mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)
      mockPrismaClient.lead.create.mockResolvedValue(mockLead)

      await seedDatabase()

      // Verify admin user creation
      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { email: 'admin@aurora.dev' },
        update: {},
        create: {
          email: 'admin@aurora.dev',
          name: 'Aurora Admin',
          role: 'ADMIN',
          emailVerified: expect.any(Date),
        },
      })

      // Verify services creation
      expect(mockPrismaClient.service.upsert).toHaveBeenCalledTimes(3)
      
      // Check HVAC Installation service (first service call)
      const hvacServiceCall = mockPrismaClient.service.upsert.mock.calls[0]
      expect(hvacServiceCall[0]).toEqual({
        where: { slug: 'hvac-installation' },
        update: {
          title: 'HVAC Installation',
          slug: 'hvac-installation',
          description: 'Professional HVAC system installation for residential and commercial properties',
          content: 'Complete HVAC installation services including system design, equipment selection, and professional installation by certified technicians.',
          excerpt: 'Professional HVAC installation services',
          category: 'Installation',
          price: 5000,
          priceType: 'STARTING_FROM',
          features: ['Free consultation', 'Energy-efficient systems', '5-year warranty', '24/7 support'],
          tags: ['hvac', 'installation', 'air-conditioning', 'heating'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
        create: {
          title: 'HVAC Installation',
          slug: 'hvac-installation',
          description: 'Professional HVAC system installation for residential and commercial properties',
          content: 'Complete HVAC installation services including system design, equipment selection, and professional installation by certified technicians.',
          excerpt: 'Professional HVAC installation services',
          category: 'Installation',
          price: 5000,
          priceType: 'STARTING_FROM',
          features: ['Free consultation', 'Energy-efficient systems', '5-year warranty', '24/7 support'],
          tags: ['hvac', 'installation', 'air-conditioning', 'heating'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
      })

      // Check AC Repair service
      expect(mockPrismaClient.service.upsert).toHaveBeenCalledWith({
        where: { slug: 'ac-repair-maintenance' },
        update: {
          title: 'AC Repair & Maintenance',
          slug: 'ac-repair-maintenance',
          description: 'Expert air conditioning repair and maintenance services',
          content: 'Keep your AC running efficiently with our comprehensive repair and maintenance services.',
          excerpt: 'Expert AC repair and maintenance',
          category: 'Maintenance',
          price: 150,
          priceType: 'STARTING_FROM',
          features: ['Same-day service', 'Licensed technicians', '90-day warranty', 'Emergency repairs'],
          tags: ['ac', 'repair', 'maintenance', 'emergency'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
        create: {
          title: 'AC Repair & Maintenance',
          slug: 'ac-repair-maintenance',
          description: 'Expert air conditioning repair and maintenance services',
          content: 'Keep your AC running efficiently with our comprehensive repair and maintenance services.',
          excerpt: 'Expert AC repair and maintenance',
          category: 'Maintenance',
          price: 150,
          priceType: 'STARTING_FROM',
          features: ['Same-day service', 'Licensed technicians', '90-day warranty', 'Emergency repairs'],
          tags: ['ac', 'repair', 'maintenance', 'emergency'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
      })

      // Check Commercial HVAC service
      expect(mockPrismaClient.service.upsert).toHaveBeenCalledWith({
        where: { slug: 'commercial-hvac-solutions' },
        update: {
          title: 'Commercial HVAC Solutions',
          slug: 'commercial-hvac-solutions',
          description: 'Comprehensive HVAC solutions for commercial buildings',
          content: 'Specialized commercial HVAC services including design, installation, and maintenance for office buildings, retail spaces, and industrial facilities.',
          excerpt: 'Commercial HVAC solutions',
          category: 'Commercial',
          price: 10000,
          priceType: 'QUOTE_REQUIRED',
          features: ['Custom design', 'Energy audits', 'Preventive maintenance', 'Emergency service'],
          tags: ['commercial', 'hvac', 'office', 'industrial'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
        create: {
          title: 'Commercial HVAC Solutions',
          slug: 'commercial-hvac-solutions',
          description: 'Comprehensive HVAC solutions for commercial buildings',
          content: 'Specialized commercial HVAC services including design, installation, and maintenance for office buildings, retail spaces, and industrial facilities.',
          excerpt: 'Commercial HVAC solutions',
          category: 'Commercial',
          price: 10000,
          priceType: 'QUOTE_REQUIRED',
          features: ['Custom design', 'Energy audits', 'Preventive maintenance', 'Emergency service'],
          tags: ['commercial', 'hvac', 'office', 'industrial'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
        },
      })

      // Verify testimonials creation
      expect(mockPrismaClient.testimonial.create).toHaveBeenCalledTimes(3)
      expect(mockPrismaClient.testimonial.create).toHaveBeenCalledWith({
        data: {
          name: 'Sarah Johnson',
          company: 'Johnson Enterprises',
          position: 'Facility Manager',
          content: 'Aurora provided exceptional HVAC installation service. Their team was professional, efficient, and the system works perfectly. Highly recommended!',
          rating: 5,
          approved: true,
          featured: true,
        },
      })

      // Verify team members creation
      expect(mockPrismaClient.teamMember.create).toHaveBeenCalledTimes(3)
      expect(mockPrismaClient.teamMember.create).toHaveBeenCalledWith({
        data: {
          name: 'John Smith',
          position: 'Lead HVAC Technician',
          bio: 'John has over 15 years of experience in HVAC installation and repair. He holds multiple certifications and leads our technical team.',
          specialties: ['HVAC Installation', 'System Design', 'Energy Efficiency'],
          featured: true,
          active: true,
          order: 1,
        },
      })

      // Verify projects creation
      expect(mockPrismaClient.project.create).toHaveBeenCalledTimes(2)
      
      // Verify blog posts creation
      expect(mockPrismaClient.post.create).toHaveBeenCalledTimes(2)
      expect(mockPrismaClient.post.create).toHaveBeenCalledWith({
        data: {
          title: '5 Signs Your HVAC System Needs Repair',
          slug: '5-signs-hvac-system-needs-repair',
          excerpt: 'Identify warning signs that your HVAC system needs professional repair',
          content: 'Learn to identify the warning signs that indicate your HVAC system requires professional attention...',
          category: 'Maintenance Tips',
          tags: ['hvac', 'maintenance', 'repair', 'tips'],
          status: 'PUBLISHED',
          published: true,
          publishedAt: expect.any(Date),
          authorId: mockUser.id,
        },
      })

      // Verify settings creation
      expect(mockPrismaClient.setting.upsert).toHaveBeenCalledTimes(9)
      expect(mockPrismaClient.setting.upsert).toHaveBeenCalledWith({
        where: { key: 'site_title' },
        update: { value: 'Aurora HVAC Services', category: 'general' },
        create: {
          key: 'site_title',
          value: 'Aurora HVAC Services',
          category: 'general',
        },
      })

      // Verify sample leads creation
      expect(mockPrismaClient.lead.create).toHaveBeenCalledTimes(2)
      expect(mockPrismaClient.lead.create).toHaveBeenCalledWith({
        data: {
          name: 'Jennifer Adams',
          email: 'jennifer.adams@email.com',
          phone: '+1 (555) 234-5678',
          company: 'Adams Consulting',
          message: 'Need HVAC installation for new office space. Looking for energy-efficient solutions.',
          source: 'WEBSITE',
          status: 'NEW',
          priority: 'HIGH',
          estimatedValue: 25000,
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockPrismaClient.user.upsert.mockRejectedValue(error)

      await expect(seedDatabase()).rejects.toThrow('Database connection failed')
    })

    it('should create services with correct content structure', async () => {
      const mockService = createMockService()
      mockPrismaClient.user.upsert.mockResolvedValue(createMockUser())
      mockPrismaClient.service.upsert.mockResolvedValue(mockService)
      mockPrismaClient.testimonial.create.mockResolvedValue(createMockTestimonial())
      mockPrismaClient.teamMember.create.mockResolvedValue(createMockTeamMember())
      mockPrismaClient.project.create.mockResolvedValue(createMockProject())
      mockPrismaClient.post.create.mockResolvedValue(createMockPost())
      mockPrismaClient.setting.upsert.mockResolvedValue(createMockSetting())
      mockPrismaClient.lead.create.mockResolvedValue(createMockLead())

      await seedDatabase()

      // Verify service content and features are properly set
      const hvacServiceCall = mockPrismaClient.service.upsert.mock.calls[0]
      expect(hvacServiceCall[0].create.content).toContain('Complete HVAC installation services')
      expect(hvacServiceCall[0].create.content).toContain('certified technicians')
      expect(hvacServiceCall[0].create.features).toEqual([
        'Free consultation',
        'Energy-efficient systems',
        '5-year warranty',
        '24/7 support'
      ])
    })

    it('should create team members with correct order', async () => {
      const mockUser = createMockUser()
      const mockService = createMockService()
      const mockTestimonial = createMockTestimonial()
      const mockTeamMember = createMockTeamMember()
      const mockProject = createMockProject()
      const mockPost = createMockPost()
      const mockSetting = createMockSetting()
      const mockLead = createMockLead()

      mockPrismaClient.user.upsert.mockResolvedValue(mockUser)
      mockPrismaClient.service.upsert.mockResolvedValue(mockService)
      mockPrismaClient.testimonial.create.mockResolvedValue(mockTestimonial)
      mockPrismaClient.teamMember.create.mockResolvedValue(mockTeamMember)
      mockPrismaClient.project.create.mockResolvedValue(mockProject)
      mockPrismaClient.post.create.mockResolvedValue(mockPost)
      mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)
      mockPrismaClient.lead.create.mockResolvedValue(mockLead)

      await seedDatabase()

      // Check team member order
      const teamMemberCalls = mockPrismaClient.teamMember.create.mock.calls
      expect(teamMemberCalls[0][0].data.order).toBe(1) // John Smith
      expect(teamMemberCalls[1][0].data.order).toBe(2) // Maria Garcia
      expect(teamMemberCalls[2][0].data.order).toBe(3) // David Wilson
    })

    it('should create settings with correct categories', async () => {
      const mockUser = createMockUser()
      const mockService = createMockService()
      const mockTestimonial = createMockTestimonial()
      const mockTeamMember = createMockTeamMember()
      const mockProject = createMockProject()
      const mockPost = createMockPost()
      const mockSetting = createMockSetting()
      const mockLead = createMockLead()

      mockPrismaClient.user.upsert.mockResolvedValue(mockUser)
      mockPrismaClient.service.upsert.mockResolvedValue(mockService)
      mockPrismaClient.testimonial.create.mockResolvedValue(mockTestimonial)
      mockPrismaClient.teamMember.create.mockResolvedValue(mockTeamMember)
      mockPrismaClient.project.create.mockResolvedValue(mockProject)
      mockPrismaClient.post.create.mockResolvedValue(mockPost)
      mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)
      mockPrismaClient.lead.create.mockResolvedValue(mockLead)

      await seedDatabase()

      // Verify settings categories
      const settingCalls = mockPrismaClient.setting.upsert.mock.calls
      const generalSettings = settingCalls.filter(call => call[0].create.category === 'general')
      const contactSettings = settingCalls.filter(call => call[0].create.category === 'contact')
      const businessSettings = settingCalls.filter(call => call[0].create.category === 'business')
      const securitySettings = settingCalls.filter(call => call[0].create.category === 'security')
      const analyticsSettings = settingCalls.filter(call => call[0].create.category === 'analytics')

      expect(generalSettings).toHaveLength(2) // site_title, site_description
      expect(contactSettings).toHaveLength(4) // contact_email, contact_phone, business_hours, emergency_phone
      expect(businessSettings).toHaveLength(1) // service_areas
      expect(securitySettings).toHaveLength(1) // google_recaptcha_site_key
      expect(analyticsSettings).toHaveLength(1) // plausible_domain
    })

    it('should create leads with different priorities and statuses', async () => {
      const mockUser = createMockUser()
      const mockService = createMockService()
      const mockTestimonial = createMockTestimonial()
      const mockTeamMember = createMockTeamMember()
      const mockProject = createMockProject()
      const mockPost = createMockPost()
      const mockSetting = createMockSetting()
      const mockLead = createMockLead()

      mockPrismaClient.user.upsert.mockResolvedValue(mockUser)
      mockPrismaClient.service.upsert.mockResolvedValue(mockService)
      mockPrismaClient.testimonial.create.mockResolvedValue(mockTestimonial)
      mockPrismaClient.teamMember.create.mockResolvedValue(mockTeamMember)
      mockPrismaClient.project.create.mockResolvedValue(mockProject)
      mockPrismaClient.post.create.mockResolvedValue(mockPost)
      mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)
      mockPrismaClient.lead.create.mockResolvedValue(mockLead)

      await seedDatabase()

      // Verify lead priorities and statuses
      const leadCalls = mockPrismaClient.lead.create.mock.calls
      expect(leadCalls[0][0].data.priority).toBe('HIGH')
      expect(leadCalls[1][0].data.priority).toBe('URGENT')
      expect(leadCalls[0][0].data.status).toBe('NEW')
      expect(leadCalls[1][0].data.status).toBe('CONTACTED')
    })
  })
})
