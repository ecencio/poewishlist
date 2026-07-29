import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${hash.toString('hex')}.${salt}`
}

export async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashHex, salt] = stored.split('.')
  if (!hashHex || !salt) return false
  const hash = (await scryptAsync(supplied, salt, 64)) as Buffer
  const storedHash = Buffer.from(hashHex, 'hex')
  if (hash.length !== storedHash.length) return false
  return timingSafeEqual(hash, storedHash)
}
