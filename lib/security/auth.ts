import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from 'express'
import { Roles } from './roles'

// Ensure required secrets are present at startup (fail fast).
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets not configured')
}

// Allow override of salt rounds via env while keeping sensible default.
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10)

// Strongly typed token payload.
interface TokenPayload extends jwt.JwtPayload {
  sub: string
  role: Roles
}

// Type guard (optional safety).
function isTokenPayload(p: any): p is TokenPayload {
  return p && typeof p.sub === 'string' && typeof p.role === 'string'
}

const ACCESS_TTL = '15m'
const REFRESH_TTL = '7d'
const refreshStore = new Map<string, { userId: string, exp: number }>() // Replace with persistent store / Redis.

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, SALT_ROUNDS)
}

export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash)
}

export function signTokens(payload: { sub: string; role: Roles }) {
  // Signs both tokens; refresh token payload verified immediately to obtain exp safely.
  const accessToken = jwt.sign(payload, JWT_SECRET!, { expiresIn: ACCESS_TTL })
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL })
  const refreshPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as TokenPayload & { exp: number }
  if (!isTokenPayload(refreshPayload) || typeof refreshPayload.exp !== 'number') {
    throw new Error('Failed to create refresh token')
  }
  refreshStore.set(refreshToken, { userId: refreshPayload.sub, exp: refreshPayload.exp })
  return { accessToken, refreshToken }
}

export function rotateRefreshToken(oldToken: string) {
  // Verify signature (prevents accepting tampered tokens).
  let verified: TokenPayload & { exp: number }
  try {
    verified = jwt.verify(oldToken, JWT_REFRESH_SECRET!) as TokenPayload & { exp: number }
  } catch {
    throw new Error('Invalid refresh')
  }
  if (!isTokenPayload(verified) || typeof verified.exp !== 'number') {
    throw new Error('Invalid refresh')
  }
  const entry = refreshStore.get(oldToken)
  if (!entry) throw new Error('Invalid refresh')
  // Reject if expired (defense-in-depth even though jwt.verify would normally throw).
  if (Date.now() / 1000 >= entry.exp) {
    refreshStore.delete(oldToken)
    throw new Error('Expired refresh')
  }
  // Invalidate old token (rotation).
  refreshStore.delete(oldToken)
  return signTokens({ sub: entry.userId, role: verified.role })
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as TokenPayload
    if (!isTokenPayload(payload)) return res.status(401).json({ error: 'Invalid token' })
    ;(req as any).user = payload
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Optional: periodic cleanup to avoid unbounded growth of in-memory store.
export function cleanupExpiredRefreshTokens(now = Date.now() / 1000) {
  for (const [token, meta] of refreshStore.entries()) {
    if (now >= meta.exp) refreshStore.delete(token)
  }
}