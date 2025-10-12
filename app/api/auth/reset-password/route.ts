import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { EmailService } from '@/lib/auth/email'
import { RefreshTokenService } from '@/lib/auth/refresh-token'
import { ApiResponseHandler } from '@/lib/api/response'
import { withValidation, withRateLimit } from '@/lib/middleware'
import { passwordResetSchema, passwordResetConfirmSchema, authRateLimit } from '@/lib/validators/auth'

// Request password reset
async function requestResetHandler(request: NextRequest, data: any) {
  try {
    const { email } = data
    
    const user = await UserService.getByEmail(email)
    if (!user) {
      // Don't reveal if user exists or not
      return ApiResponseHandler.success(
        { message: 'If the email exists, a reset link has been sent' },
        'Password reset requested'
      )
    }

    await EmailService.sendPasswordResetEmail(email, user.id)
    
    return ApiResponseHandler.success(
      { message: 'If the email exists, a reset link has been sent' },
      'Password reset requested'
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return ApiResponseHandler.internalError('Failed to process password reset request')
  }
}

// Confirm password reset
async function confirmResetHandler(request: NextRequest, data: any) {
  try {
    const { token, newPassword } = data
    
    const resetToken = await EmailService.verifyPasswordResetToken(token)
    if (!resetToken) {
      return ApiResponseHandler.badRequest('Invalid or expired reset token')
    }

    const user = await UserService.getById(resetToken.userId)
    if (!user) {
      return ApiResponseHandler.notFound('User not found')
    }

    // Update password
    const updatedUser = await UserService.updatePassword(user.id, newPassword)
    
    // Mark token as used
    await EmailService.usePasswordResetToken(token)
    
    // Revoke all refresh tokens for security
    await RefreshTokenService.revokeAllForUser(user.id)

    return ApiResponseHandler.success(
      { message: 'Password reset successfully' },
      'Password has been reset'
    )
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return ApiResponseHandler.internalError('Failed to reset password')
  }
}

export const POST = withRateLimit(authRateLimit, withValidation(passwordResetSchema, requestResetHandler))
export const PUT = withRateLimit(authRateLimit, withValidation(passwordResetConfirmSchema, confirmResetHandler))
