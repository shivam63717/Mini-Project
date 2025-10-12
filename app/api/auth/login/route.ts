import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { RefreshTokenService } from '@/lib/auth/refresh-token'
import { signAccess, signRefresh } from '@/lib/auth/jwt'
import { ApiResponseHandler } from '@/lib/api/response'
import { withValidation, withRateLimit } from '@/lib/middleware'
import { loginSchema, authRateLimit } from '@/lib/validators/auth'

async function loginHandler(request: NextRequest, data: any) {
  try {
    const user = await UserService.getByEmail(data.email)
    if (!user) {
      return ApiResponseHandler.unauthorized('Invalid credentials')
    }

    const isValidPassword = await UserService.verifyPassword(user, data.password)
    if (!isValidPassword) {
      return ApiResponseHandler.unauthorized('Invalid credentials')
    }

    // Update last login
    await UserService.updateLastLogin(user.id)

    // Generate tokens
    const accessToken = signAccess({ id: user.id, roles: user.roles })
    const { token: refreshToken, jti, exp } = signRefresh({ id: user.id })

    // Store refresh token
    await RefreshTokenService.createToken(user.id, exp, {
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined
    })

    return ApiResponseHandler.success({
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer' as const
    }, 'Login successful')
  } catch (error) {
    console.error('Login error:', error)
    return ApiResponseHandler.internalError('Login failed')
  }
}

export const POST = withRateLimit(authRateLimit, withValidation(loginSchema, loginHandler))


