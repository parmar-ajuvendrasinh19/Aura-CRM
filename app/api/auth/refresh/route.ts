import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { setAuthCookies } from '@/lib/server-auth'
import { cookies } from 'next/headers'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      })
      return NextResponse.json(
        { error: 'Refresh token expired' },
        { status: 401 }
      )
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    // Delete old refresh token and create new one
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Set cookies
    setAuthCookies(newAccessToken, newRefreshToken)

    return NextResponse.json({
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role,
      },
    })
  } catch (error: any) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
