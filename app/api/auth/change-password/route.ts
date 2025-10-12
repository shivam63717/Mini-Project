import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { RefreshTokenService } from '@/lib/auth/refresh-token'
import { ApiResponseHandler } from '@/lib/api/response'
import { withAuth, withValidation, withRateLimit } from '@/lib/middleware'
import { changePasswordSchema, authRateLimit } from '@/lib/validators/auth'

async function changePasswordHandler(request: NextRequest, context: any, data: any) {
  try {
    const { currentPassword, newPassword } = data
    const user = await UserService.getById(context.user.id)
    
    if (!user) {
      return ApiResponseHandler.notFound('User not found')
    }

    // Verify current password
    const isValidPassword = await UserService.verifyPassword(user, currentPassword)
    if (!isValidPassword) {
      return ApiResponseHandler.unauthorized('Current password is incorrect')
    }

    // Update password
    await UserService.updatePassword(user.id, newPassword)
    
    // Revoke all refresh tokens for security
    await RefreshTokenService.revokeAllForUser(user.id)

    return ApiResponseHandler.success(
      { message: 'Password changed successfully' },
      'Password has been changed'
    )
  } catch (error) {
    console.error('Change password error:', error)
    return ApiResponseHandler.internalError('Failed to change password')
  }
}

export const PUT = withAuth(
  withRateLimit(authRateLimit, withValidation(changePasswordSchema, changePasswordHandler))
)
