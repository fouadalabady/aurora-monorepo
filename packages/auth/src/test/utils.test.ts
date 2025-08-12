import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils'
import { db as prisma } from '@workspace/database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation Schemas', () => {
    describe('registerSchema', () => {
      it('should validate valid registration data', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }
        expect(() => registerSchema.parse(validData)).not.toThrow()
      })

      it('should reject invalid email', () => {
        const invalidData = {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        }
        expect(() => registerSchema.parse(invalidData)).toThrow()
      })

      it('should reject short name', () => {
        const invalidData = {
          name: 'J',
          email: 'john@example.com',
          password: 'password123',
        }
        expect(() => registerSchema.parse(invalidData)).toThrow()
      })

      it('should reject short password', () => {
        const invalidData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        }
        expect(() => registerSchema.parse(invalidData)).toThrow()
      })
    })

    describe('loginSchema', () => {
      it('should validate valid login data', () => {
        const validData = {
          email: 'john@example.com',
          password: 'password123',
        }
        expect(() => loginSchema.parse(validData)).not.toThrow()
      })

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
        }
        expect(() => loginSchema.parse(invalidData)).toThrow()
      })

      it('should reject empty password', () => {
        const invalidData = {
          email: 'john@example.com',
          password: '',
        }
        expect(() => loginSchema.parse(invalidData)).toThrow()
      })
    })

    describe('resetPasswordSchema', () => {
      it('should validate valid email', () => {
        const validData = { email: 'john@example.com' }
        expect(() => resetPasswordSchema.parse(validData)).not.toThrow()
      })

      it('should reject invalid email', () => {
        const invalidData = { email: 'invalid-email' }
        expect(() => resetPasswordSchema.parse(invalidData)).toThrow()
      })
    })

    describe('changePasswordSchema', () => {
      it('should validate matching passwords', () => {
        const validData = {
          currentPassword: 'oldpass123',
          newPassword: 'newpass123',
          confirmPassword: 'newpass123',
        }
        expect(() => changePasswordSchema.parse(validData)).not.toThrow()
      })

      it('should reject non-matching passwords', () => {
        const invalidData = {
          currentPassword: 'oldpass123',
          newPassword: 'newpass123',
          confirmPassword: 'different123',
        }
        expect(() => changePasswordSchema.parse(invalidData)).toThrow()
      })

      it('should reject short new password', () => {
        const invalidData = {
          currentPassword: 'oldpass123',
          newPassword: '123',
          confirmPassword: '123',
        }
        expect(() => changePasswordSchema.parse(invalidData)).toThrow()
      })
    })
  })

  describe('Password Utilities', () => {
    describe('hashPassword', () => {
      it('should hash password', async () => {
        const password = 'testpassword'
        const hashedPassword = await hashPassword(password)
        
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
        expect(hashedPassword).toBe('hashed_password')
      })
    })

    describe('verifyPassword', () => {
      it('should verify password correctly', async () => {
        const password = 'testpassword'
        const hashedPassword = 'hashed_password'
        
        const isValid = await verifyPassword(password, hashedPassword)
        
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
        expect(isValid).toBe(true)
      })

      it('should return false for invalid password', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValueOnce(false)
        
        const password = 'wrongpassword'
        const hashedPassword = 'hashed_password'
        
        const isValid = await verifyPassword(password, hashedPassword)
        
        expect(isValid).toBe(false)
      })
    })
  })

  describe('JWT Utilities', () => {
    describe('generateToken', () => {
      it('should generate token with default expiration', () => {
        const payload = { userId: '123' }
        const token = generateToken(payload)
        
        expect(jwt.sign).toHaveBeenCalledWith(payload, 'test_secret', { expiresIn: '24h' })
        expect(token).toBe('mock_jwt_token')
      })

      it('should generate token with custom expiration', () => {
        const payload = { userId: '123' }
        const token = generateToken(payload, '1h')
        
        expect(jwt.sign).toHaveBeenCalledWith(payload, 'test_secret', { expiresIn: '1h' })
        expect(token).toBe('mock_jwt_token')
      })
    })

    describe('verifyToken', () => {
      it('should verify valid token', () => {
        const token = 'valid_token'
        const decoded = verifyToken(token)
        
        expect(jwt.verify).toHaveBeenCalledWith(token, 'test_secret')
        expect(decoded).toEqual({ id: 'user123', email: 'test@example.com' })
      })

      it('should throw error for invalid token', () => {
        vi.mocked(jwt.verify).mockImplementationOnce(() => {
          throw new Error('Invalid token')
        })
        
        const token = 'invalid_token'
        
        expect(() => verifyToken(token)).toThrow('Invalid or expired token')
      })
    })
  })

  describe('User Management', () => {
    describe('createUser', () => {
      it('should create user successfully', async () => {
        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }
        
        const mockUser = {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
          createdAt: new Date(),
        }
        
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
        vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser)
        
        const result = await createUser(userData)
        
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: userData.email },
        })
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: {
            name: userData.name,
            email: userData.email,
            password: 'hashed_password',
            role: 'USER',
            emailVerified: null,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        })
        expect(result).toEqual(mockUser)
      })

      it('should throw error if user already exists', async () => {
        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }
        
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
          id: 'existing123',
          email: 'john@example.com',
        } as any)
        
        await expect(createUser(userData)).rejects.toThrow(
          'User with this email already exists'
        )
      })

      it('should create admin user when role specified', async () => {
        const userData = {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN' as const,
        }
        
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
        vi.mocked(prisma.user.create).mockResolvedValueOnce({} as any)
        
        await createUser(userData)
        
        expect(prisma.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              role: 'ADMIN',
            }),
          })
        )
      })
    })

    describe('getUserByEmail', () => {
      it('should get user by email', async () => {
        const email = 'john@example.com'
        const mockUser = createMockUser({ email })
        
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser)
        
        const result = await getUserByEmail(email)
        
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        expect(result).toEqual(mockUser)
      })
    })

    describe('getUserById', () => {
      it('should get user by id', async () => {
        const id = 'user123'
        const mockUser = createMockUser({ id })
        
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser)
        
        const result = await getUserById(id)
        
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        expect(result).toEqual(mockUser)
      })
    })

    describe('updateUserPassword', () => {
      it('should update user password', async () => {
        const userId = 'user123'
        const newPassword = 'newpassword123'
        const mockResult = { id: userId, email: 'john@example.com' }
        
        vi.mocked(prisma.user.update).mockResolvedValueOnce(mockResult)
        
        const result = await updateUserPassword(userId, newPassword)
        
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { password: 'hashed_password' },
          select: {
            id: true,
            email: true,
          },
        })
        expect(result).toEqual(mockResult)
      })
    })
  })

  describe('Email Utilities', () => {
    const mockTransporter = {
      sendMail: vi.fn().mockResolvedValue({ messageId: 'mock_message_id' }),
    }

    beforeEach(() => {
      vi.mocked(nodemailer.createTransporter).mockReturnValue(mockTransporter as any)
    })

    describe('sendEmail', () => {
      it('should send email successfully', async () => {
        const emailData = {
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test HTML</p>',
          text: 'Test text',
        }
        
        await sendEmail(emailData)
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: 'noreply@example.com',
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        })
      })

      it('should handle missing SMTP configuration', async () => {
        const originalSmtpHost = process.env.SMTP_HOST
        delete process.env.SMTP_HOST
        
        const emailData = {
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test HTML</p>',
        }
        
        await sendEmail(emailData)
        
        expect(console.warn).toHaveBeenCalledWith('SMTP not configured, email not sent')
        expect(mockTransporter.sendMail).not.toHaveBeenCalled()
        
        process.env.SMTP_HOST = originalSmtpHost
      })

      it('should throw error when email sending fails', async () => {
        mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP Error'))
        
        const emailData = {
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test HTML</p>',
        }
        
        await expect(sendEmail(emailData)).rejects.toThrow('Failed to send email')
      })
    })

    describe('sendVerificationEmail', () => {
      it('should send verification email', async () => {
        const email = 'test@example.com'
        const token = 'verification_token'
        
        await sendVerificationEmail(email, token)
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: email,
            subject: 'Verify Your Email Address',
            html: expect.stringContaining('verify-email?token=verification_token'),
          })
        )
      })
    })

    describe('sendPasswordResetEmail', () => {
      it('should send password reset email', async () => {
        const email = 'test@example.com'
        const token = 'reset_token'
        
        await sendPasswordResetEmail(email, token)
        
        expect(mockTransporter.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: email,
            subject: 'Reset Your Password',
            html: expect.stringContaining('reset-password?token=reset_token'),
          })
        )
      })
    })
  })
})