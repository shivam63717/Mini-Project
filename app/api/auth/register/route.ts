import { NextRequest } from 'next/server'
import { UserService } from '@/lib/auth/user'
import { EmailService } from '@/lib/auth/email'
import { ApiResponseHandler } from '@/lib/api/response'
import { withValidation, withRateLimit } from '@/lib/middleware'
import { registerSchema, authRateLimit } from '@/lib/validators/auth'

async function registerHandler(request: NextRequest, data: any) {
  try {
    const user = await UserService.create({
      email: data.email,
      password: data.password,
      roles: ['user']
    })

    // Send welcome email (optional, don't fail registration if email fails)
    try {
      await EmailService.sendWelcomeEmail(user.email)
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError)
    }

    return ApiResponseHandler.created(user, 'User registered successfully')
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return ApiResponseHandler.conflict('User already exists')
    }
    return ApiResponseHandler.internalError('Registration failed')
  }
}

export const POST = withRateLimit(authRateLimit, withValidation(registerSchema, registerHandler))


