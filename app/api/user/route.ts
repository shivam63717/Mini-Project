
import { NextResponse } from 'next/server'
import { getCurrentUser, getUserById } from '../../../lib/auth/session'
import { RedisService } from '../../../lib/database/redis'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null }, { status: 200 })

  // Simple cache layer (cached user:public)
  const cacheKey = `user:public:${user.id}`
  let cached = await RedisService.get<{ id: string; username: string; createdAt: number; updatedAt: number }>(cacheKey)
  if (!cached) {
    const fresh = await getUserById(user.id)
    if (!fresh) return NextResponse.json({ user: null }, { status: 200 })
    const publicUser = { ...fresh, email: undefined }
    await RedisService.set(cacheKey, publicUser, 60)
    cached = publicUser
  }
  return NextResponse.json({ user: cached })
}