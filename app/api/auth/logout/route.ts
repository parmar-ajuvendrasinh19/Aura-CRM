export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearAuthCookies, getCurrentUser } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (user) {
      // Log logout activity
      // @ts-ignore - Prisma client needs regeneration after ActivityLog migration
      await prisma.activityLog.create({
        data: {
          userId: user.userId,
          action: "LOGOUT",
          description: "User logged out",
        }
      })

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
