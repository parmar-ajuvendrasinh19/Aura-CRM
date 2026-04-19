import { cookies } from 'next/headers'
import type { TokenPayload } from './auth'

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies()
  
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })
  
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export function clearAuthCookies() {
  const cookieStore = cookies()
  
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  
  console.log('getCurrentUser - accessToken exists:', !!accessToken)
  
  if (!accessToken) {
    console.log('getCurrentUser - No accessToken found in cookies')
    return null
  }
  
  const { verifyAccessToken } = await import('./auth')
  const payload = verifyAccessToken(accessToken)
  console.log('getCurrentUser - Token verification result:', !!payload)
  if (payload) {
    console.log('getCurrentUser - User data:', { userId: payload.userId, organizationId: payload.organizationId, role: payload.role })
  }
  
  return payload
}
