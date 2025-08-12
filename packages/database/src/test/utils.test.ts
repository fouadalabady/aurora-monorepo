import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrismaClient } from './setup'
import {
  leadUtils,
  serviceUtils,
  contentUtils,
  testimonialUtils,
  projectUtils,
  teamUtils,
  settingsUtils,
} from '../utils'

describe('Database Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('leadUtils', () => {
    describe('createLead', () => {
      it('should create a lead with default values', async () => {
        const mockLead = createMockLead()
        mockPrismaClient.lead.create.mockResolvedValue(mockLead)

        const leadData = {
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '+1234567890',
          message: 'Test message',
        }

        const result = await leadUtils.createLead(leadData)

        expect(mockPrismaClient.lead.create).toHaveBeenCalledWith({
          data: {
            ...leadData,
            source: 'WEBSITE',
            status: 'NEW',
            priority: 'MEDIUM',
          },
          include: {
            service: true,
          },
        })
        expect(result).toEqual(mockLead)
      })

      it('should create a lead with custom source', async () => {
        const mockLead = createMockLead()
        mockPrismaClient.lead.create.mockResolvedValue(mockLead)

        const leadData = {
          name: 'Test Lead',
          email: 'test@example.com',
          source: 'PHONE',
        }

        await leadUtils.createLead(leadData)

        expect(mockPrismaClient.lead.create).toHaveBeenCalledWith({
          data: {
            ...leadData,
            status: 'NEW',
            priority: 'MEDIUM',
          },
          include: {
            service: true,
          },
        })
      })

      it('should create a lead with service ID', async () => {
        const mockLead = createMockLead()
        mockPrismaClient.lead.create.mockResolvedValue(mockLead)

        const leadData = {
          name: 'Test Lead',
          email: 'test@example.com',
          serviceId: 'service-123',
        }

        await leadUtils.createLead(leadData)

        expect(mockPrismaClient.lead.create).toHaveBeenCalledWith({
          data: {
            ...leadData,
            source: 'WEBSITE',
            status: 'NEW',
            priority: 'MEDIUM',
          },
          include: {
            service: true,
          },
        })
      })
    })

    describe('updateLeadStatus', () => {
      it('should update lead status and create activity', async () => {
        const mockLead = createMockLead({ status: 'QUALIFIED' })
        const mockActivity = {
          id: 'activity-123',
          leadId: 'lead-123',
          type: 'STATUS_CHANGE',
          title: 'Status changed to QUALIFIED',
          description: 'Lead qualified after review',
        }

        mockPrismaClient.lead.update.mockResolvedValue(mockLead)
        mockPrismaClient.leadActivity.create.mockResolvedValue(mockActivity)

        const result = await leadUtils.updateLeadStatus(
          'lead-123',
          'QUALIFIED',
          'Lead qualified after review'
        )

        expect(mockPrismaClient.lead.update).toHaveBeenCalledWith({
          where: { id: 'lead-123' },
          data: { status: 'QUALIFIED', updatedAt: expect.any(Date) },
        })

        expect(mockPrismaClient.leadActivity.create).toHaveBeenCalledWith({
          data: {
            leadId: 'lead-123',
            type: 'STATUS_CHANGE',
            title: 'Status changed to QUALIFIED',
            description: 'Lead qualified after review',
          },
        })

        expect(result).toEqual(mockLead)
      })

      it('should update lead status without notes', async () => {
        const mockLead = createMockLead({ status: 'CONTACTED' })
        mockPrismaClient.lead.update.mockResolvedValue(mockLead)
        mockPrismaClient.leadActivity.create.mockResolvedValue({})

        await leadUtils.updateLeadStatus('lead-123', 'CONTACTED')

        expect(mockPrismaClient.leadActivity.create).toHaveBeenCalledWith({
          data: {
            leadId: 'lead-123',
            type: 'STATUS_CHANGE',
            title: 'Status changed to CONTACTED',
            description: undefined,
          },
        })
      })
    })

    describe('getLeads', () => {
      it('should get leads with default filters', async () => {
        const mockLeads = [createMockLead(), createMockLead()]
        mockPrismaClient.lead.findMany.mockResolvedValue(mockLeads)

        const result = await leadUtils.getLeads()

        expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith({
          where: {},
          include: {
            service: true,
            assignedTo: true,
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
          skip: 0,
        })
        expect(result).toEqual(mockLeads)
      })

      it('should get leads with custom filters', async () => {
        const mockLeads = [createMockLead()]
        mockPrismaClient.lead.findMany.mockResolvedValue(mockLeads)

        const filters = {
          status: 'NEW' as const,
          priority: 'HIGH' as const,
          limit: 10,
          offset: 20,
        }

        await leadUtils.getLeads(filters)

        expect(mockPrismaClient.lead.findMany).toHaveBeenCalledWith({
          where: {
            status: 'NEW',
            priority: 'HIGH',
          },
          include: {
            service: true,
            assignedTo: true,
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          skip: 20,
        })
      })
    })

    describe('getLeadStats', () => {
      it('should return lead statistics', async () => {
        mockPrismaClient.lead.count
          .mockResolvedValueOnce(100) // total
          .mockResolvedValueOnce(25) // new
          .mockResolvedValueOnce(30) // qualified
          .mockResolvedValueOnce(20) // won
          .mockResolvedValueOnce(15) // lost

        const result = await leadUtils.getLeadStats()

        expect(result).toEqual({
          total: 100,
          newLeads: 25,
          qualified: 30,
          won: 20,
          lost: 15,
        })

        expect(mockPrismaClient.lead.count).toHaveBeenCalledTimes(5)
      })
    })
  })

  describe('serviceUtils', () => {
    describe('getPublishedServices', () => {
      it('should get published services', async () => {
        const mockServices = [createMockService(), createMockService()]
        mockPrismaClient.service.findMany.mockResolvedValue(mockServices)

        const result = await serviceUtils.getPublishedServices()

        expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
          where: {
            published: true,
            status: 'PUBLISHED',
          },
          orderBy: { createdAt: 'desc' },
        })
        expect(result).toEqual(mockServices)
      })
    })

    describe('getServiceBySlug', () => {
      it('should get service by slug with projects', async () => {
        const mockService = createMockService()
        mockPrismaClient.service.findUnique.mockResolvedValue(mockService)

        const result = await serviceUtils.getServiceBySlug('test-service')

        expect(mockPrismaClient.service.findUnique).toHaveBeenCalledWith({
          where: { slug: 'test-service' },
          include: {
            projects: {
              where: { published: true },
              take: 3,
            },
          },
        })
        expect(result).toEqual(mockService)
      })
    })

    describe('getServicesByCategory', () => {
      it('should get services by category', async () => {
        const mockServices = [createMockService()]
        mockPrismaClient.service.findMany.mockResolvedValue(mockServices)

        const result = await serviceUtils.getServicesByCategory('Installation')

        expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
          where: {
            category: 'Installation',
            published: true,
            status: 'PUBLISHED',
          },
          orderBy: { createdAt: 'desc' },
        })
        expect(result).toEqual(mockServices)
      })
    })
  })

  describe('contentUtils', () => {
    describe('getPublishedPosts', () => {
      it('should get published posts with default pagination', async () => {
        const mockPosts = [createMockPost(), createMockPost()]
        mockPrismaClient.post.findMany.mockResolvedValue(mockPosts)

        const result = await contentUtils.getPublishedPosts()

        expect(mockPrismaClient.post.findMany).toHaveBeenCalledWith({
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
          take: 10,
          skip: 0,
        })
        expect(result).toEqual(mockPosts)
      })

      it('should get published posts with custom pagination', async () => {
        const mockPosts = [createMockPost()]
        mockPrismaClient.post.findMany.mockResolvedValue(mockPosts)

        await contentUtils.getPublishedPosts(5, 10)

        expect(mockPrismaClient.post.findMany).toHaveBeenCalledWith({
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
          take: 5,
          skip: 10,
        })
      })
    })

    describe('getPostBySlug', () => {
      it('should get post by slug with author', async () => {
        const mockPost = createMockPost()
        mockPrismaClient.post.findUnique.mockResolvedValue(mockPost)

        const result = await contentUtils.getPostBySlug('test-post')

        expect(mockPrismaClient.post.findUnique).toHaveBeenCalledWith({
          where: { slug: 'test-post' },
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        })
        expect(result).toEqual(mockPost)
      })
    })

    describe('getPageBySlug', () => {
      it('should get published page by slug', async () => {
        const mockPage = {
          id: 'page-123',
          title: 'Test Page',
          slug: 'test-page',
          content: 'Test content',
          published: true,
          status: 'PUBLISHED',
        }
        mockPrismaClient.page.findUnique.mockResolvedValue(mockPage)

        const result = await contentUtils.getPageBySlug('test-page')

        expect(mockPrismaClient.page.findUnique).toHaveBeenCalledWith({
          where: {
            slug: 'test-page',
            published: true,
            status: 'PUBLISHED',
          },
        })
        expect(result).toEqual(mockPage)
      })
    })
  })

  describe('testimonialUtils', () => {
    describe('getApprovedTestimonials', () => {
      it('should get all approved testimonials', async () => {
        const mockTestimonials = [createMockTestimonial(), createMockTestimonial()]
        mockPrismaClient.testimonial.findMany.mockResolvedValue(mockTestimonials)

        const result = await testimonialUtils.getApprovedTestimonials()

        expect(mockPrismaClient.testimonial.findMany).toHaveBeenCalledWith({
          where: {
            approved: true,
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
        })
        expect(result).toEqual(mockTestimonials)
      })

      it('should get featured approved testimonials', async () => {
        const mockTestimonials = [createMockTestimonial({ featured: true })]
        mockPrismaClient.testimonial.findMany.mockResolvedValue(mockTestimonials)

        const result = await testimonialUtils.getApprovedTestimonials(true)

        expect(mockPrismaClient.testimonial.findMany).toHaveBeenCalledWith({
          where: {
            approved: true,
            featured: true,
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
        })
        expect(result).toEqual(mockTestimonials)
      })
    })

    describe('createTestimonial', () => {
      it('should create testimonial with approval required', async () => {
        const mockTestimonial = createMockTestimonial({ approved: false })
        mockPrismaClient.testimonial.create.mockResolvedValue(mockTestimonial)

        const testimonialData = {
          name: 'Test Customer',
          company: 'Test Company',
          content: 'Great service!',
          rating: 5,
        }

        const result = await testimonialUtils.createTestimonial(testimonialData)

        expect(mockPrismaClient.testimonial.create).toHaveBeenCalledWith({
          data: {
            ...testimonialData,
            approved: false,
          },
        })
        expect(result).toEqual(mockTestimonial)
      })
    })
  })

  describe('projectUtils', () => {
    describe('getPublishedProjects', () => {
      it('should get all published projects', async () => {
        const mockProjects = [createMockProject(), createMockProject()]
        mockPrismaClient.project.findMany.mockResolvedValue(mockProjects)

        const result = await projectUtils.getPublishedProjects()

        expect(mockPrismaClient.project.findMany).toHaveBeenCalledWith({
          where: {
            published: true,
            status: 'PUBLISHED',
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
          take: 12,
        })
        expect(result).toEqual(mockProjects)
      })

      it('should get featured published projects with custom limit', async () => {
        const mockProjects = [createMockProject({ featured: true })]
        mockPrismaClient.project.findMany.mockResolvedValue(mockProjects)

        const result = await projectUtils.getPublishedProjects(true, 6)

        expect(mockPrismaClient.project.findMany).toHaveBeenCalledWith({
          where: {
            published: true,
            status: 'PUBLISHED',
            featured: true,
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
          take: 6,
        })
        expect(result).toEqual(mockProjects)
      })
    })

    describe('getProjectBySlug', () => {
      it('should get project by slug with service', async () => {
        const mockProject = createMockProject()
        mockPrismaClient.project.findUnique.mockResolvedValue(mockProject)

        const result = await projectUtils.getProjectBySlug('test-project')

        expect(mockPrismaClient.project.findUnique).toHaveBeenCalledWith({
          where: { slug: 'test-project' },
          include: {
            service: true,
          },
        })
        expect(result).toEqual(mockProject)
      })
    })
  })

  describe('teamUtils', () => {
    describe('getActiveTeamMembers', () => {
      it('should get active team members ordered correctly', async () => {
        const mockTeamMembers = [createMockTeamMember(), createMockTeamMember()]
        mockPrismaClient.teamMember.findMany.mockResolvedValue(mockTeamMembers)

        const result = await teamUtils.getActiveTeamMembers()

        expect(mockPrismaClient.teamMember.findMany).toHaveBeenCalledWith({
          where: { active: true },
          orderBy: [
            { featured: 'desc' },
            { order: 'asc' },
            { name: 'asc' },
          ],
        })
        expect(result).toEqual(mockTeamMembers)
      })
    })
  })

  describe('settingsUtils', () => {
    describe('getSetting', () => {
      it('should get setting value by key', async () => {
        const mockSetting = createMockSetting({ key: 'site_title', value: 'Aurora HVAC' })
        mockPrismaClient.setting.findUnique.mockResolvedValue(mockSetting)

        const result = await settingsUtils.getSetting('site_title')

        expect(mockPrismaClient.setting.findUnique).toHaveBeenCalledWith({
          where: { key: 'site_title' },
        })
        expect(result).toBe('Aurora HVAC')
      })

      it('should return undefined for non-existent setting', async () => {
        mockPrismaClient.setting.findUnique.mockResolvedValue(null)

        const result = await settingsUtils.getSetting('non_existent')

        expect(result).toBeUndefined()
      })
    })

    describe('setSetting', () => {
      it('should upsert setting with default values', async () => {
        const mockSetting = createMockSetting()
        mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)

        const result = await settingsUtils.setSetting('test_key', 'test_value')

        expect(mockPrismaClient.setting.upsert).toHaveBeenCalledWith({
          where: { key: 'test_key' },
          update: { value: 'test_value', type: 'string', category: 'general' },
          create: { key: 'test_key', value: 'test_value', type: 'string', category: 'general' },
        })
        expect(result).toEqual(mockSetting)
      })

      it('should upsert setting with custom type and category', async () => {
        const mockSetting = createMockSetting()
        mockPrismaClient.setting.upsert.mockResolvedValue(mockSetting)

        await settingsUtils.setSetting('test_key', 'test_value', 'number', 'config')

        expect(mockPrismaClient.setting.upsert).toHaveBeenCalledWith({
          where: { key: 'test_key' },
          update: { value: 'test_value', type: 'number', category: 'config' },
          create: { key: 'test_key', value: 'test_value', type: 'number', category: 'config' },
        })
      })
    })

    describe('getSettingsByCategory', () => {
      it('should get settings by category as key-value object', async () => {
        const mockSettings = [
          createMockSetting({ key: 'setting1', value: 'value1', category: 'general' }),
          createMockSetting({ key: 'setting2', value: 'value2', category: 'general' }),
        ]
        mockPrismaClient.setting.findMany.mockResolvedValue(mockSettings)

        const result = await settingsUtils.getSettingsByCategory('general')

        expect(mockPrismaClient.setting.findMany).toHaveBeenCalledWith({
          where: { category: 'general' },
        })
        expect(result).toEqual({
          setting1: 'value1',
          setting2: 'value2',
        })
      })

      it('should return empty object for category with no settings', async () => {
        mockPrismaClient.setting.findMany.mockResolvedValue([])

        const result = await settingsUtils.getSettingsByCategory('empty')

        expect(result).toEqual({})
      })
    })
  })
})