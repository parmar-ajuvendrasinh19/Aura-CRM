import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearAuthCookies, getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      // Delete all refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId: user.userId },
      })
    }

    // Clear cookies
    clearAuthCookies()

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
