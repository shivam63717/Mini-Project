import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { RedisService } from '@/lib/database/redis'

export async function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next()

  // Set CORS headers
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXTAUTH_URL || 'http://localhost:3000'
  ]

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers })
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Session handling with Redis
  const sessionToken = request.cookies.get('session')?.value
  if (sessionToken) {
    try {
      const session = await RedisService.get<{ userId: string }>(`session:${sessionToken}`)
      if (session) {
        response.headers.set('x-user-id', session.userId)
      }
    } catch (error) {
      // If Redis fails, continue without session (fail open)
      console.error('Session lookup error:', error)
    }
  }

  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`, 301)
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
