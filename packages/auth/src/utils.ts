import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db as prisma } from "@workspace/database"
import { z } from "zod"
import nodemailer from "nodemailer"

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export function generateToken(payload: object, expiresIn = "24h"): string {
  const secret = process.env.NEXTAUTH_SECRET!
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): any {
  const secret = process.env.NEXTAUTH_SECRET!
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

// User management
export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: "USER" | "ADMIN"
}) {
  const { name, email, password, role = "USER" } = data
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    throw new Error("User with this email already exists")
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: null, // Will be set when email is verified
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })
  
  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
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
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
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
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)
  
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: {
      id: true,
      email: true,
    },
  })
}

// Email utilities
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured, email not sent")
    return
  }
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  }
  
  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p>Thank you for signing up! Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Verify Email</a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
    </div>
  `
  
  const text = `
    Verify Your Email Address
    
    Thank you for signing up! Please visit the following link to verify your email address:
    ${verificationUrl}
    
    This link will expire in 24 hours.
  `
  
  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
    text,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `
  
  const text = `
    Reset Your Password
    
    You requested a password reset. Please visit the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request this, please ignore this email.
  `
  
  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
    text,
  })
}

// Verification token utilities
export async function createVerificationToken(email: string) {
  const token = generateToken({ email, type: "email-verification" }, "24h")
  
  // Store token in database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })
  
  return token
}

export async function createPasswordResetToken(email: string) {
  const token = generateToken({ email, type: "password-reset" }, "1h")
  
  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      token: {
        contains: "password-reset",
      },
    },
  })
  
  // Store new token in database
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  })
  
  return token
}

export async function verifyEmailToken(token: string) {
  try {
    const payload = verifyToken(token)
    
    if (payload.type !== "email-verification") {
      throw new Error("Invalid token type")
    }
    
    // Check if token exists in database
    const dbToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    })
    
    if (!dbToken) {
      throw new Error("Token not found or expired")
    }
    
    // Mark email as verified
    await prisma.user.update({
      where: { email: payload.email },
      data: { emailVerified: new Date() },
    })
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    })
    
    return { email: payload.email }
  } catch (error) {
    throw new Error("Invalid or expired verification token")
  }
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const payload = verifyToken(token)
    
    if (payload.type !== "password-reset") {
      throw new Error("Invalid token type")
    }
    
    // Check if token exists in database
    const dbToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    })
    
    if (!dbToken) {
      throw new Error("Token not found or expired")
    }
    
    return { email: payload.email, token }
  } catch (error) {
    throw new Error("Invalid or expired reset token")
  }
}