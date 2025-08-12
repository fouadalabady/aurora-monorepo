import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middlewareAuthHandler } from '../middleware'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('middlewareAuthHandler', () => {
    it('should be defined', () => {
      expect(middlewareAuthHandler).toBeDefined()
      expect(typeof middlewareAuthHandler).toBe('function')
    })

    it('should configure NextAuth for middleware use', () => {
      expect(NextAuth).toHaveBeenCalled()
      
      // Get the middleware config (should be the second call to NextAuth)
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      
      expect(middlewareConfig).toBeDefined()
      expect(middlewareConfig.secret).toBe(process.env.AUTH_SECRET)
    })

    it('should not use Prisma adapter for middleware', () => {
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      
      // Middleware config should not have adapter (to avoid Edge Runtime issues)
      expect(middlewareConfig.adapter).toBeUndefined()
    })

    it('should configure Google provider for middleware', () => {
      expect(Google).toHaveBeenCalledWith({
        clientId: 'test_google_client_id',
        clientSecret: 'test_google_client_secret',
      })
    })

    it('should configure Credentials provider for middleware', () => {
      expect(Credentials).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          authorize: expect.any(Function),
        })
      )
    })

    it('should have JWT session strategy for middleware', () => {
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      
      expect(middlewareConfig.session).toEqual({
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    })

    it('should have correct JWT configuration for middleware', () => {
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      
      expect(middlewareConfig.jwt).toEqual({
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    })

    it('should have correct pages configuration for middleware', () => {
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      
      expect(middlewareConfig.pages).toEqual({
        signIn: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
      })
    })

    it('should have debug enabled in development for middleware', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Re-import to get updated config
      vi.resetModules()
      
      const calls = vi.mocked(NextAuth).mock.calls
      const middlewareConfig = calls[calls.length - 1][0]
      expect(middlewareConfig.debug).toBe(true)
      
      process.env.NODE_ENV = originalEnv
    })

    describe('Middleware Callbacks', () => {
      let middlewareConfig: any

      beforeEach(() => {
        const calls = vi.mocked(NextAuth).mock.calls
        middlewareConfig = calls[calls.length - 1][0]
      })

      describe('jwt callback', () => {
        it('should add user role and id to token', async () => {
          const token = { sub: 'user123' }
          const user = { id: 'user123', role: 'ADMIN' }
          
          const result = await middlewareConfig.callbacks.jwt({ token, user })
          
          expect(result.role).toBe('ADMIN')
          expect(result.id).toBe('user123')
        })

        it('should return token unchanged when no user', async () => {
          const token = { sub: 'user123', role: 'USER' }
          
          const result = await middlewareConfig.callbacks.jwt({ token })
          
          expect(result).toEqual(token)
        })
      })

      describe('session callback', () => {
        it('should add token data to session user', async () => {
          const session = {
            user: { email: 'test@example.com' },
            expires: new Date().toISOString(),
          }
          const token = { id: 'user123', role: 'ADMIN' }
          
          const result = await middlewareConfig.callbacks.session({ session, token })
          
          expect(result.user.id).toBe('user123')
          expect(result.user.role).toBe('ADMIN')
        })

        it('should return session unchanged when no token', async () => {
          const session = {
            user: { email: 'test@example.com' },
            expires: new Date().toISOString(),
          }
          
          const result = await middlewareConfig.callbacks.session({ session })
          
          expect(result).toEqual(session)
        })
      })
    })

    describe('Credentials Provider Authorization', () => {
      it('should return null for middleware credentials authorization', async () => {
        const calls = vi.mocked(Credentials).mock.calls
        const credentialsConfig = calls[calls.length - 1][0]
        
        const result = await credentialsConfig.authorize({
          email: 'test@example.com',
          password: 'password123',
        })
        
        // Middleware credentials provider should always return null
        // as actual authentication happens in API routes
        expect(result).toBeNull()
      })

      it('should return null even with valid credentials', async () => {
        const calls = vi.mocked(Credentials).mock.calls
        const credentialsConfig = calls[calls.length - 1][0]
        
        const result = await credentialsConfig.authorize({
          email: 'valid@example.com',
          password: 'validpassword',
        })
        
        expect(result).toBeNull()
      })

      it('should return null with missing credentials', async () => {
        const calls = vi.mocked(Credentials).mock.calls
        const credentialsConfig = calls[calls.length - 1][0]
        
        const result = await credentialsConfig.authorize({})
        
        expect(result).toBeNull()
      })
    })

    describe('Environment Variables', () => {
      it('should use AUTH_SECRET environment variable', () => {
        const calls = vi.mocked(NextAuth).mock.calls
        const middlewareConfig = calls[calls.length - 1][0]
        
        expect(middlewareConfig.secret).toBe(process.env.AUTH_SECRET)
      })

      it('should handle missing AUTH_SECRET gracefully', () => {
        const originalSecret = process.env.AUTH_SECRET
        delete process.env.AUTH_SECRET
        
        // Re-import to get updated config
        vi.resetModules()
        
        const calls = vi.mocked(NextAuth).mock.calls
        const middlewareConfig = calls[calls.length - 1][0]
        expect(middlewareConfig.secret).toBeUndefined()
        
        process.env.AUTH_SECRET = originalSecret
      })
    })

    describe('Export Structure', () => {
      it('should export middlewareAuthHandler as default', async () => {
        const middlewareModule = await import('../middleware')
        expect(middlewareModule.default).toBe(middlewareAuthHandler)
      })

      it('should export middlewareAuthHandler as named export', async () => {
        const middlewareModule = await import('../middleware')
        expect(middlewareModule.middlewareAuthHandler).toBeDefined()
        expect(typeof middlewareModule.middlewareAuthHandler).toBe('function')
      })
    })
  })
})