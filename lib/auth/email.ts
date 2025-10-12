// Email service for password reset and notifications
import nodemailer from 'nodemailer'
import { randomUUID } from 'crypto'
import { RedisService } from '@/lib/database/redis'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface PasswordResetToken {
  token: string
  userId: string
  email: string
  expiresAt: number
  used: boolean
  createdAt: string
}

// Redis key patterns
const PASSWORD_RESET_KEY = (token: string) => `password_reset:${token}`
const PASSWORD_RESET_INDEX = 'password_reset:index'

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null

  static async initialize(): Promise<void> {
    if (this.transporter) return

    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    this.transporter = nodemailer.createTransporter(config)
    
    // Verify connection
    try {
      await this.transporter.verify()
      console.log('✅ Email service initialized successfully')
    } catch (error) {
      console.error('❌ Email service initialization failed:', error)
      this.transporter = null
    }
  }

  static async sendPasswordResetEmail(email: string, userId: string): Promise<string> {
    await this.initialize()
    
    if (!this.transporter) {
      throw new Error('Email service not available')
    }

    // Generate reset token
    const token = randomUUID()
    const expiresAt = Date.now() + (60 * 60 * 1000) // 1 hour
    const resetToken: PasswordResetToken = {
      token,
      userId,
      email,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    }

    // Store token in Redis
    await RedisService.set(PASSWORD_RESET_KEY(token), resetToken, 3600) // 1 hour TTL
    await RedisService.hset(PASSWORD_RESET_INDEX, token, userId)

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    }

    await this.transporter.sendMail(mailOptions)
    return token
  }

  static async verifyPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = await RedisService.get<PasswordResetToken>(PASSWORD_RESET_KEY(token))
    
    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      return null
    }
    
    return resetToken
  }

  static async usePasswordResetToken(token: string): Promise<void> {
    const resetToken = await this.verifyPasswordResetToken(token)
    if (resetToken) {
      resetToken.used = true
      await RedisService.set(PASSWORD_RESET_KEY(token), resetToken, 3600)
    }
  }

  static async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    await this.initialize()
    
    if (!this.transporter) {
      throw new Error('Email service not available')
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to ML Vision',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ML Vision!</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Your account has been successfully created. You can now start using our ML Vision platform.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The ML Vision Team</p>
        </div>
      `
    }

    await this.transporter.sendMail(mailOptions)
  }

  static async sendEmailVerification(email: string, userId: string): Promise<string> {
    await this.initialize()
    
    if (!this.transporter) {
      throw new Error('Email service not available')
    }

    // Generate verification token
    const token = randomUUID()
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    const verificationToken = {
      token,
      userId,
      email,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    }

    // Store token in Redis
    await RedisService.set(`email_verification:${token}`, verificationToken, 86400) // 24 hours TTL

    // Send email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      `
    }

    await this.transporter.sendMail(mailOptions)
    return token
  }
}
