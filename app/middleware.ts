
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { redis } from '../lib/redis'

export async function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('session')?.value
  if (!sessionToken) return NextResponse.next()
  const raw = await redis.get(`session:${sessionToken}`)
  if (!raw) return NextResponse.next()
  const session = JSON.parse(raw)
  const res = NextResponse.next()
  res.headers.set('x-user-id', session.userId)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}