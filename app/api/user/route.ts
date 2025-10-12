
import { NextResponse } from 'next/server'
import { getCurrentUser, getUserById } from '../../../lib/auth/session'
import { redis } from '../../../lib/redis'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

  // Simple cache layer (cached user:public)
  const cacheKey = `user:public:${user.id}`
  let cached = await redis.get(cacheKey)
  if (!cached) {
    const fresh = await getUserById(user.id)
    if (!fresh) return NextResponse.json({ user: null }, { status: 200 })
    const publicUser = { ...fresh, email: undefined }
    await redis.set(cacheKey, JSON.stringify(publicUser), 'EX', 60)
    cached = JSON.stringify(publicUser)
  }
  return NextResponse.json({ user: JSON.parse(cached) })
}