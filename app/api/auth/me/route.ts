import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get full user data with organization
    const fullUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { organization: true },
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        avatar: fullUser.avatar,
      },
      organization: {
        id: fullUser.organization.id,
        name: fullUser.organization.name,
        email: fullUser.organization.email,
        phone: fullUser.organization.phone,
        address: fullUser.organization.address,
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
