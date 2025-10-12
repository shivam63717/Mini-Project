
import bcrypt from 'bcryptjs'
import { env } from '../../env.mjs'

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}