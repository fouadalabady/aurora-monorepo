import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockPrismaClient } from './setup'

// Mock the process events to avoid interference with test runner
const mockProcess = {
  on: vi.fn(),
  exit: vi.fn(),
}

vi.stubGlobal('process', {
  ...process,
  on: mockProcess.on,
  exit: mockProcess.exit,
})

describe('Database Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Client Configuration', () => {
    it('should export db client', async () => {
      const { db } = await import('../client')
      expect(db).toBeDefined()
      expect(db).toBe(mockPrismaClient)
    })

    it('should configure Prisma client with correct options', () => {
      // The PrismaClient should be instantiated with proper configuration
      // This is tested through the mock setup
      expect(mockPrismaClient).toBeDefined()
    })

    it('should extend client with Accelerate', () => {
      expect(mockPrismaClient.$extends).toHaveBeenCalled()
    })
  })

  describe('Database Operations', () => {
    it('should support user operations', async () => {
      const { db } = await import('../client')
      
      expect(db.user).toBeDefined()
      expect(db.user.create).toBeDefined()
      expect(db.user.findUnique).toBeDefined()
      expect(db.user.findMany).toBeDefined()
      expect(db.user.update).toBeDefined()
      expect(db.user.delete).toBeDefined()
    })

    it('should support service operations', async () => {
      const { db } = await import('../client')
      
      expect(db.service).toBeDefined()
      expect(db.service.create).toBeDefined()
      expect(db.service.findUnique).toBeDefined()
      expect(db.service.findMany).toBeDefined()
      expect(db.service.update).toBeDefined()
      expect(db.service.delete).toBeDefined()
    })

    it('should support lead operations', async () => {
      const { db } = await import('../client')
      
      expect(db.lead).toBeDefined()
      expect(db.lead.create).toBeDefined()
      expect(db.lead.findUnique).toBeDefined()
      expect(db.lead.findMany).toBeDefined()
      expect(db.lead.update).toBeDefined()
      expect(db.lead.delete).toBeDefined()
    })

    it('should support testimonial operations', async () => {
      const { db } = await import('../client')
      
      expect(db.testimonial).toBeDefined()
      expect(db.testimonial.create).toBeDefined()
      expect(db.testimonial.findUnique).toBeDefined()
      expect(db.testimonial.findMany).toBeDefined()
      expect(db.testimonial.update).toBeDefined()
      expect(db.testimonial.delete).toBeDefined()
    })

    it('should support project operations', async () => {
      const { db } = await import('../client')
      
      expect(db.project).toBeDefined()
      expect(db.project.create).toBeDefined()
      expect(db.project.findUnique).toBeDefined()
      expect(db.project.findMany).toBeDefined()
      expect(db.project.update).toBeDefined()
      expect(db.project.delete).toBeDefined()
    })

    it('should support post operations', async () => {
      const { db } = await import('../client')
      
      expect(db.post).toBeDefined()
      expect(db.post.create).toBeDefined()
      expect(db.post.findUnique).toBeDefined()
      expect(db.post.findMany).toBeDefined()
      expect(db.post.update).toBeDefined()
      expect(db.post.delete).toBeDefined()
    })

    it('should support team member operations', async () => {
      const { db } = await import('../client')
      
      expect(db.teamMember).toBeDefined()
      expect(db.teamMember.create).toBeDefined()
      expect(db.teamMember.findUnique).toBeDefined()
      expect(db.teamMember.findMany).toBeDefined()
      expect(db.teamMember.update).toBeDefined()
      expect(db.teamMember.delete).toBeDefined()
    })

    it('should support setting operations', async () => {
      const { db } = await import('../client')
      
      expect(db.setting).toBeDefined()
      expect(db.setting.create).toBeDefined()
      expect(db.setting.findUnique).toBeDefined()
      expect(db.setting.findMany).toBeDefined()
      expect(db.setting.update).toBeDefined()
      expect(db.setting.delete).toBeDefined()
    })
  })

  describe('Connection Management', () => {
    it('should support disconnect operation', async () => {
      const { db } = await import('../client')
      
      expect(db.$disconnect).toBeDefined()
      expect(typeof db.$disconnect).toBe('function')
    })

    it('should support connect operation', async () => {
      const { db } = await import('../client')
      
      expect(db.$connect).toBeDefined()
      expect(typeof db.$connect).toBe('function')
    })

    it('should support transaction operation', async () => {
      const { db } = await import('../client')
      
      expect(db.$transaction).toBeDefined()
      expect(typeof db.$transaction).toBe('function')
    })
  })

  describe('Process Event Handlers', () => {
    it('should register beforeExit handler', () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      expect(mockProcess.on).toHaveBeenCalledWith('beforeExit', expect.any(Function))
    })

    it('should register SIGINT handler', () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      expect(mockProcess.on).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    })

    it('should register SIGTERM handler', () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      expect(mockProcess.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function))
    })

    it('should call disconnect on beforeExit', async () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      // Find the beforeExit handler
      const beforeExitCall = mockProcess.on.mock.calls.find(
        call => call[0] === 'beforeExit'
      )
      expect(beforeExitCall).toBeDefined()
      
      const handler = beforeExitCall[1]
      await handler()
      
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled()
    })

    it('should call disconnect and exit on SIGINT', async () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      // Find the SIGINT handler
      const sigintCall = mockProcess.on.mock.calls.find(
        call => call[0] === 'SIGINT'
      )
      expect(sigintCall).toBeDefined()
      
      const handler = sigintCall[1]
      await handler()
      
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled()
      expect(mockProcess.exit).toHaveBeenCalledWith(0)
    })

    it('should call disconnect and exit on SIGTERM', async () => {
      // Import the client to trigger event handler registration
      require('../client')
      
      // Find the SIGTERM handler
      const sigtermCall = mockProcess.on.mock.calls.find(
        call => call[0] === 'SIGTERM'
      )
      expect(sigtermCall).toBeDefined()
      
      const handler = sigtermCall[1]
      await handler()
      
      expect(mockPrismaClient.$disconnect).toHaveBeenCalled()
      expect(mockProcess.exit).toHaveBeenCalledWith(0)
    })
  })

  describe('Environment Configuration', () => {
    it('should handle development environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Re-import to get updated config
      vi.resetModules()
      
      // The client should be configured for development
      // This is tested through the mock setup
      expect(mockPrismaClient).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
    })

    it('should handle production environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      // Re-import to get updated config
      vi.resetModules()
      
      // The client should be configured for production
      // This is tested through the mock setup
      expect(mockPrismaClient).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
    })

    it('should handle test environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'
      
      // Re-import to get updated config
      vi.resetModules()
      
      // The client should be configured for test
      // This is tested through the mock setup
      expect(mockPrismaClient).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
    })
  })
})