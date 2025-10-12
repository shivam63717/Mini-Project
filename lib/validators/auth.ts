import { z } from 'zod'

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[\W_]/, 'Password must contain at least one symbol'),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format')
})

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[\W_]/, 'Password must contain at least one symbol'),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[\W_]/, 'Password must contain at least one symbol'),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

// Type exports
export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetSchema>
export type PasswordResetConfirmRequest = z.infer<typeof passwordResetConfirmSchema>
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>
export type EmailVerificationRequest = z.infer<typeof emailVerificationSchema>