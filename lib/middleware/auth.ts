import { NextRequest } from 'next/server'
import { verifyAccess } from '@/lib/auth/jwt'
import { UserService, type Role } from '@/lib/auth/user'
import { ApiResponseHandler } from '@/lib/api/response'

export interface AuthenticatedUser {
  id: string
  email: string
  roles: Role[]
}

export interface AuthContext {
  user: AuthenticatedUser
  isAuthenticated: true
}

export interface UnauthenticatedContext {
  user: null
  isAuthenticated: false
}

export type AuthMiddlewareContext = AuthContext | UnauthenticatedContext

export function authenticate(request: NextRequest): AuthMiddlewareContext {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, isAuthenticated: false }
  }

  const token = authHeader.slice(7)
  
  try {
    const payload = verifyAccess(token)
    return {
      user: {
        id: payload.sub,
        email: '', // Will be populated by getUser if needed
        roles: payload.roles
      },
      isAuthenticated: true
    }
  } catch (error) {
    return { user: null, isAuthenticated: false }
  }
}

export function authorize(
  context: AuthMiddlewareContext, 
  ...allowedRoles: Role[]
): boolean {
  if (!context.isAuthenticated) {
    return false
  }

  if (allowedRoles.length === 0) {
    return true // No specific roles required
  }

  return context.user.roles.some(role => allowedRoles.includes(role))
}

export function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): AuthContext {
  const context = authenticate(request)
  
  if (!context.isAuthenticated) {
    throw new Error('Authentication required')
  }

  if (allowedRoles && !authorize(context, ...allowedRoles)) {
    throw new Error('Insufficient permissions')
  }

  return context
}

export function optionalAuth(request: NextRequest): AuthMiddlewareContext {
  return authenticate(request)
}

// Higher-order function for protecting API routes
export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<Response>,
  allowedRoles?: Role[]
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const context = requireAuth(request, allowedRoles)
      return await handler(request, context)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          return ApiResponseHandler.unauthorized('Authentication required')
        }
        if (error.message === 'Insufficient permissions') {
          return ApiResponseHandler.forbidden('Insufficient permissions')
        }
      }
      return ApiResponseHandler.internalError('Authentication failed')
    }
  }
}

// Higher-order function for optional auth
export function withOptionalAuth(
  handler: (request: NextRequest, context: AuthMiddlewareContext) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const context = optionalAuth(request)
      return await handler(request, context)
    } catch (error) {
      return ApiResponseHandler.internalError('Authentication failed')
    }
  }
}

// Utility to get user details from context
export async function getUserFromContext(context: AuthContext): Promise<AuthenticatedUser | null> {
  try {
    const user = await UserService.getById(context.user.id)
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email,
      roles: user.roles
    }
  } catch {
    return null
  }
}