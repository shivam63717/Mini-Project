import { NextRequest } from 'next/server'
import { RefreshTokenService } from '@/lib/auth/refresh-token'
import { ApiResponseHandler } from '@/lib/api/response'
import { withValidation, withRateLimit } from '@/lib/middleware'
import { refreshTokenSchema, authRateLimit } from '@/lib/validators/auth'

async function logoutHandler(request: NextRequest, data: any) {
  try {
    const { refreshToken } = data
    
    if (refreshToken) {
      await RefreshTokenService.revokeByToken(refreshToken)
    }

    return ApiResponseHandler.noContent()
  } catch (error) {
    console.error('Logout error:', error)
    return ApiResponseHandler.internalError('Logout failed')
  }
}

export const POST = withRateLimit(authRateLimit, withValidation(refreshTokenSchema, logoutHandler))


