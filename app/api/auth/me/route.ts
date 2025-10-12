import { NextRequest } from 'next/server'
import { withAuth, getUserFromContext } from '@/lib/middleware/auth'
import { ApiResponseHandler } from '@/lib/api/response'

async function meHandler(request: NextRequest, context: any) {
  try {
    const user = await getUserFromContext(context)
    if (!user) {
      return ApiResponseHandler.notFound('User not found')
    }

    return ApiResponseHandler.success(user, 'User profile retrieved successfully')
  } catch (error) {
    console.error('Get user profile error:', error)
    return ApiResponseHandler.internalError('Failed to retrieve user profile')
  }
}

export const GET = withAuth(meHandler)


