import { NextResponse } from 'next/server'
import { ApiResponse, ApiError } from './types'

export class ApiResponseHandler {
  static success<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status })
  }

  static created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return this.success(data, message, 201)
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  static error(
    error: string, 
    message?: string, 
    status = 400, 
    code?: string,
    details?: any
  ): NextResponse<ApiError> {
    return NextResponse.json({
      success: false,
      error,
      message,
      code,
      details,
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status })
  }

  static badRequest(error: string, message?: string, details?: any): NextResponse<ApiError> {
    return this.error(error, message, 400, 'BAD_REQUEST', details)
  }

  static unauthorized(error = 'Unauthorized', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 401, 'UNAUTHORIZED')
  }

  static forbidden(error = 'Forbidden', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 403, 'FORBIDDEN')
  }

  static notFound(error = 'Not found', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 404, 'NOT_FOUND')
  }

  static conflict(error = 'Conflict', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 409, 'CONFLICT')
  }

  static validationError(error: string, details?: any): NextResponse<ApiError> {
    return this.error(error, 'Validation failed', 422, 'VALIDATION_ERROR', details)
  }

  static tooManyRequests(error = 'Too many requests', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 429, 'TOO_MANY_REQUESTS')
  }

  static internalError(error = 'Internal server error', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 500, 'INTERNAL_ERROR')
  }

  static serviceUnavailable(error = 'Service unavailable', message?: string): NextResponse<ApiError> {
    return this.error(error, message, 503, 'SERVICE_UNAVAILABLE')
  }
}
