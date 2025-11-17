

import { cookies } from 'next/headers'
import { randomBytes, timingSafeEqual } from 'crypto'
import { RedisService } from '../database/redis'
import { env } from '../../env.mjs'
import type { User } from '../../types/User'
import { hashPassword, verifyPassword } from './hash'

const USER_SEQ_KEY = 'user:id:seq'
const USER_KEY = (id: string) => `user:${id}`
const USERNAME_KEY = (u: string) => `user:username:${u}`
const SESSION_KEY = (s: string) => `session:${s}`

// --- User operations ---
export async function createUser(input: { username: string; email: string; password: string }): Promise<User> {
  const exists = await RedisService.get<string>(USERNAME_KEY(input.username.toLowerCase()))
  if (exists) throw new Error('Username already taken')
  
  // Get next user ID
  const currentSeq = await RedisService.get<number>(USER_SEQ_KEY) || 0
  const id = String(currentSeq + 1)
  await RedisService.set(USER_SEQ_KEY, currentSeq + 1)
  
  const now = Date.now()
  const passwordHash = await hashPassword(input.password)
  const user: User = {
    id,
    username: input.username,
    email: input.email,
    createdAt: now,
    updatedAt: now
  }
  // Store user JSON + password hash (in separate key or same - keep separate for clarity)
  await RedisService.set(USER_KEY(id), user)
  await RedisService.set(`${USER_KEY(id)}:pw`, passwordHash)
  await RedisService.set(USERNAME_KEY(input.username.toLowerCase()), id)
  return user
}

export async function getUserById(id: string): Promise<User | null> {
  return await RedisService.get<User>(USER_KEY(id))
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const id = await RedisService.get<string>(USERNAME_KEY(username.toLowerCase()))
  if (!id) return null
  return getUserById(id)
}

// --- Auth / session ---
function generateToken() {
  return randomBytes(32).toString('hex')
}

export interface Session {
  token: string
  userId: string
  createdAt: number
  expiresAt: number
}

export async function createSession(userId: string): Promise<Session> {
  const token = generateToken()
  const createdAt = Date.now()
  const expiresAt = createdAt + env.SESSION_TTL_SECONDS * 1000
  const session: Session = { token, userId, createdAt, expiresAt }
  await RedisService.set(
    SESSION_KEY(token),
    session,
    env.SESSION_TTL_SECONDS
  )
  setSessionCookie(token, expiresAt)
  return session
}

export function setSessionCookie(token: string, expiresAt: number) {
  const cookieStore = cookies()
  cookieStore.set({
    name: 'session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt)
  })
}

export async function destroySession(token: string) {
  await RedisService.del(SESSION_KEY(token))
  const cookieStore = cookies()
  cookieStore.delete('session')
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)
  if (!user) return null
  const storedHash = await RedisService.get<string>(`${USER_KEY(user.id)}:pw`)
  if (!storedHash) return null
  const valid = await verifyPassword(password, storedHash)
  return valid ? user : null
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get('session')?.value
  if (!token) return null
  const session = await RedisService.get<Session>(SESSION_KEY(token))
  if (!session) return null
  // Refresh TTL (sliding) optional
  const remaining = session.expiresAt - Date.now()
  if (remaining > 0) {
    await RedisService.expire(SESSION_KEY(token), Math.floor(remaining / 1000))
  }
  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  return getUserById(session.userId)
}

export async function safeCompare(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(new Uint8Array(ab), new Uint8Array(bb))
}