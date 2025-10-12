import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import type { Role } from './user'

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m'
const REFRESH_TTL_SEC = parseInt(process.env.JWT_REFRESH_TTL_SEC || `${60*60*24*7}`)

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret'

export interface JWTPayload {
  sub: string
  roles: Role[]
  iat?: number
  exp?: number
}

export interface RefreshJWTPayload {
  sub: string
  jti: string
  iat?: number
  exp?: number
}

export function signAccess(user: { id: string; roles: Role[] }): string {
  const payload: JWTPayload = {
    sub: user.id,
    roles: user.roles
  }
  
  return jwt.sign(payload, ACCESS_SECRET, { 
    expiresIn: ACCESS_TTL,
    issuer: 'ml-vision-app',
    audience: 'ml-vision-client'
  })
}

export function signRefresh(user: { id: string }): { token: string; jti: string; exp: number } {
  const jti = randomUUID()
  const payload: RefreshJWTPayload = {
    sub: user.id,
    jti
  }
  
  const token = jwt.sign(payload, REFRESH_SECRET, { 
    expiresIn: REFRESH_TTL_SEC,
    issuer: 'ml-vision-app',
    audience: 'ml-vision-client'
  })
  
  const decoded = jwt.decode(token) as any
  const exp = decoded?.exp as number
  
  return { token, jti, exp }
}

export function verifyAccess(token: string): JWTPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET, {
      issuer: 'ml-vision-app',
      audience: 'ml-vision-client'
    }) as JWTPayload
  } catch (error) {
    throw new Error('Invalid access token')
  }
}

export function verifyRefresh(token: string): RefreshJWTPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET, {
      issuer: 'ml-vision-app',
      audience: 'ml-vision-client'
    }) as RefreshJWTPayload
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
}

export function decodeToken(token: string): any {
  return jwt.decode(token)
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded || !decoded.exp) return true
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}


