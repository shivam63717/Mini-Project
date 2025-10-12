import { NextRequest } from 'next/server'
import { verifyRefresh, signAccess, signRefresh } from '@/lib/auth/jwt'
import { RefreshTokenService } from '@/lib/auth/refresh-token'
import { UserService } from '@/lib/auth/user'
import { ApiResponseHandler } from '@/lib/api/response'
import { withValidation, withRateLimit } from '@/lib/middleware'
import { refreshTokenSchema, authRateLimit } from '@/lib/validators/auth'

async function refreshHandler(request: NextRequest, data: any) {
  try {
    const { refreshToken } = data

    // Verify refresh token
    const payload = verifyRefresh(refreshToken)
    const record = await RefreshTokenService.getByToken(refreshToken)
    
    if (!record || record.revoked || record.userId !== payload.sub) {
      return ApiResponseHandler.unauthorized('Invalid refresh token')
    }

    // Get user
    const user = await UserService.getById(payload.sub)
    if (!user) {
      return ApiResponseHandler.unauthorized('User not found')
    }

    // Revoke old refresh token
    await RefreshTokenService.revokeByToken(refreshToken)

    // Generate new tokens
    const accessToken = signAccess({ id: user.id, roles: user.roles })
    const { token: newRefreshToken, jti, exp } = signRefresh({ id: user.id })

    // Store new refresh token
    await RefreshTokenService.createToken(user.id, exp, {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined
    })

    return ApiResponseHandler.success({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer' as const
    }, 'Token refreshed successfully')
  } catch (error) {
    console.error('Refresh error:', error)
    return ApiResponseHandler.unauthorized('Invalid refresh token')
  }
}

export const POST = withRateLimit(authRateLimit, withValidation(refreshTokenSchema, refreshHandler))


