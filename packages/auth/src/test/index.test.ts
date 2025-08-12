import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  AUTH_ERRORS,
  AUTH_ROUTES,
  getAuthUrl,
  type AuthUser,
  type AuthSession,
  type AuthError,
} from '../index'
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

describe('Auth Index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Constants', () => {
    describe('AUTH_ERRORS', () => {
      it('should have all required error messages', () => {
        expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBe('Invalid email or password')
        expect(AUTH_ERRORS.USER_EXISTS).toBe('User with this email already exists')
        expect(AUTH_ERRORS.USER_NOT_FOUND).toBe('User not found')
        expect(AUTH_ERRORS.INVALID_TOKEN).toBe('Invalid or expired token')
        expect(AUTH_ERRORS.EMAIL_NOT_VERIFIED).toBe('Please verify your email address')
        expect(AUTH_ERRORS.WEAK_PASSWORD).toBe('Password must be at least 6 characters')
        expect(AUTH_ERRORS.PASSWORDS_DONT_MATCH).toBe("Passwords don't match")
        expect(AUTH_ERRORS.EMAIL_SEND_FAILED).toBe('Failed to send email')
      })

      it('should be readonly', () => {
        expect(() => {
          // @ts-expect-error - Testing readonly behavior
          AUTH_ERRORS.INVALID_CREDENTIALS = 'Modified'
        }).toThrow()
      })
    })

    describe('AUTH_ROUTES', () => {
      it('should have all required routes', () => {
        expect(AUTH_ROUTES.SIGNIN).toBe('/auth/signin')
        expect(AUTH_ROUTES.SIGNUP).toBe('/auth/signup')
        expect(AUTH_ROUTES.SIGNOUT).toBe('/auth/signout')
        expect(AUTH_ROUTES.VERIFY_EMAIL).toBe('/auth/verify-email')
        expect(AUTH_ROUTES.RESET_PASSWORD).toBe('/auth/reset-password')
        expect(AUTH_ROUTES.FORGOT_PASSWORD).toBe('/auth/forgot-password')
        expect(AUTH_ROUTES.ERROR).toBe('/auth/error')
      })

      it('should be readonly', () => {
        expect(() => {
          // @ts-expect-error - Testing readonly behavior
          AUTH_ROUTES.SIGNIN = '/modified'
        }).toThrow()
      })
    })
  })

  describe('Helper Functions', () => {
    describe('getAuthUrl', () => {
      it('should return correct URL for each route', () => {
        expect(getAuthUrl('SIGNIN')).toBe('/auth/signin')
        expect(getAuthUrl('SIGNUP')).toBe('/auth/signup')
        expect(getAuthUrl('SIGNOUT')).toBe('/auth/signout')
        expect(getAuthUrl('VERIFY_EMAIL')).toBe('/auth/verify-email')
        expect(getAuthUrl('RESET_PASSWORD')).toBe('/auth/reset-password')
        expect(getAuthUrl('FORGOT_PASSWORD')).toBe('/auth/forgot-password')
        expect(getAuthUrl('ERROR')).toBe('/auth/error')
      })
    })
  })

  describe('Type Definitions', () => {
    describe('AuthUser', () => {
      it('should have correct structure', () => {
        const user: AuthUser = {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          image: null,
          emailVerified: new Date(),
        }

        expect(user.id).toBe('user123')
        expect(user.name).toBe('Test User')
        expect(user.email).toBe('test@example.com')
        expect(user.role).toBe('USER')
        expect(user.image).toBeNull()
        expect(user.emailVerified).toBeInstanceOf(Date)
      })

      it('should allow optional fields to be undefined', () => {
        const user: AuthUser = {
          id: 'user123',
          name: null,
          email: 'test@example.com',
          role: 'ADMIN',
        }

        expect(user.name).toBeNull()
        expect(user.image).toBeUndefined()
        expect(user.emailVerified).toBeUndefined()
      })
    })

    describe('AuthSession', () => {
      it('should have correct structure', () => {
        const session: AuthSession = {
          user: {
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          expires: new Date().toISOString(),
        }

        expect(session.user).toBeDefined()
        expect(session.expires).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })

    describe('AuthError', () => {
      it('should have correct structure', () => {
        const error: AuthError = {
          message: 'Test error message',
          code: 'TEST_ERROR',
        }

        expect(error.message).toBe('Test error message')
        expect(error.code).toBe('TEST_ERROR')
      })

      it('should allow optional code', () => {
        const error: AuthError = {
          message: 'Test error message',
        }

        expect(error.message).toBe('Test error message')
        expect(error.code).toBeUndefined()
      })
    })
  })

  describe('NextAuth Configuration', () => {
    it('should configure NextAuth with correct providers', () => {
      expect(NextAuth).toHaveBeenCalled()
      
      const config = vi.mocked(NextAuth).mock.calls[0][0]
      expect(config.providers).toBeDefined()
      expect(config.providers).toHaveLength(2)
    })

    it('should use PrismaAdapter', () => {
      expect(PrismaAdapter).toHaveBeenCalled()
    })

    it('should configure Google provider', () => {
      expect(Google).toHaveBeenCalledWith({
        clientId: 'test_google_client_id',
        clientSecret: 'test_google_client_secret',
      })
    })

    it('should configure Credentials provider', () => {
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

    it('should have correct session configuration', () => {
      const config = vi.mocked(NextAuth).mock.calls[0][0]
      expect(config.session).toEqual({
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    })

    it('should have correct JWT configuration', () => {
      const config = vi.mocked(NextAuth).mock.calls[0][0]
      expect(config.jwt).toEqual({
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    })

    it('should have correct pages configuration', () => {
      const config = vi.mocked(NextAuth).mock.calls[0][0]
      expect(config.pages).toEqual({
        signIn: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
      })
    })

    it('should have debug enabled in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Re-import to get updated config
      vi.resetModules()
      
      const config = vi.mocked(NextAuth).mock.calls[0][0]
      expect(config.debug).toBe(true)
      
      process.env.NODE_ENV = originalEnv
    })

    describe('Callbacks', () => {
      let config: any

      beforeEach(() => {
        config = vi.mocked(NextAuth).mock.calls[0][0]
      })

      describe('jwt callback', () => {
        it('should add user role and id to token', async () => {
          const token = { sub: 'user123' }
          const user = { id: 'user123', role: 'ADMIN' }
          
          const result = await config.callbacks.jwt({ token, user })
          
          expect(result.role).toBe('ADMIN')
          expect(result.id).toBe('user123')
        })

        it('should return token unchanged when no user', async () => {
          const token = { sub: 'user123', role: 'USER' }
          
          const result = await config.callbacks.jwt({ token })
          
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
          
          const result = await config.callbacks.session({ session, token })
          
          expect(result.user.id).toBe('user123')
          expect(result.user.role).toBe('ADMIN')
        })

        it('should return session unchanged when no token', async () => {
          const session = {
            user: { email: 'test@example.com' },
            expires: new Date().toISOString(),
          }
          
          const result = await config.callbacks.session({ session })
          
          expect(result).toEqual(session)
        })
      })

      describe('signIn callback', () => {
        it('should allow Google sign-ins', async () => {
          const user = { email: 'test@example.com' }
          const account = { provider: 'google' }
          
          const result = await config.callbacks.signIn({ user, account })
          
          expect(result).toBe(true)
        })

        it('should allow other providers', async () => {
          const user = { email: 'test@example.com' }
          const account = { provider: 'credentials' }
          
          const result = await config.callbacks.signIn({ user, account })
          
          expect(result).toBe(true)
        })
      })
    })

    describe('Events', () => {
      let config: any

      beforeEach(() => {
        config = vi.mocked(NextAuth).mock.calls[0][0]
      })

      describe('signIn event', () => {
        it('should log new user registration', async () => {
          const user = { email: 'test@example.com' }
          const account = { provider: 'google' }
          
          await config.events.signIn({ user, account, isNewUser: true })
          
          expect(console.log).toHaveBeenCalledWith(
            'New user registered: test@example.com'
          )
        })

        it('should not log for existing users', async () => {
          const user = { email: 'test@example.com' }
          const account = { provider: 'google' }
          
          await config.events.signIn({ user, account, isNewUser: false })
          
          expect(console.log).not.toHaveBeenCalled()
        })
      })

      describe('signOut event', () => {
        it('should log user sign out with session', async () => {
          const session = { user: { email: 'test@example.com' } }
          
          await config.events.signOut({ session })
          
          expect(console.log).toHaveBeenCalledWith(
            'User signed out: test@example.com'
          )
        })

        it('should log user sign out with token', async () => {
          const token = { email: 'test@example.com' }
          
          await config.events.signOut({ token })
          
          expect(console.log).toHaveBeenCalledWith(
            'User signed out: test@example.com'
          )
        })
      })
    })
  })
})