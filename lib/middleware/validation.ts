import { NextRequest } from 'next/server'
import { z, ZodSchema } from 'zod'
import { ApiResponseHandler } from '@/lib/api/response'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export class ValidationMiddleware {
  static async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<{ data: T; error: null } | { data: null; error: ValidationError[] }> {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      return { data, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        return { data: null, error: validationErrors }
      }
      
      return {
        data: null,
        error: [{
          field: 'body',
          message: 'Invalid JSON',
          code: 'invalid_json'
        }]
      }
    }
  }

  static async validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<{ data: T; error: null } | { data: null; error: ValidationError[] }> {
    try {
      const url = new URL(request.url)
      const queryParams: Record<string, string> = {}
      
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value
      })
      
      const data = schema.parse(queryParams)
      return { data, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        return { data: null, error: validationErrors }
      }
      
      return {
        data: null,
        error: [{
          field: 'query',
          message: 'Invalid query parameters',
          code: 'invalid_query'
        }]
      }
    }
  }

  static async validateHeaders<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<{ data: T; error: null } | { data: null; error: ValidationError[] }> {
    try {
      const headers: Record<string, string> = {}
      
      request.headers.forEach((value, key) => {
        headers[key] = value
      })
      
      const data = schema.parse(headers)
      return { data, error: null }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        return { data: null, error: validationErrors }
      }
      
      return {
        data: null,
        error: [{
          field: 'headers',
          message: 'Invalid headers',
          code: 'invalid_headers'
        }]
      }
    }
  }
}

// Higher-order function for request validation
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const result = await ValidationMiddleware.validateBody(request, schema)
    
    if (result.error) {
      return ApiResponseHandler.validationError(
        'Validation failed',
        result.error
      )
    }
    
    return await handler(request, result.data)
  }
}

// Higher-order function for query validation
export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const result = await ValidationMiddleware.validateQuery(request, schema)
    
    if (result.error) {
      return ApiResponseHandler.validationError(
        'Query validation failed',
        result.error
      )
    }
    
    return await handler(request, result.data)
  }
}

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
})

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
})

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  ...paginationSchema.shape
})