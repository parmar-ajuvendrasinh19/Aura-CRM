import jwt, { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'
const JWT_ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET || 'access-secret') as string
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as string

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY } as SignOptions)
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as SignOptions)
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}
