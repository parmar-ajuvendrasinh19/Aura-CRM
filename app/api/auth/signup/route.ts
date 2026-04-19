import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { setAuthCookies } from '@/lib/server-auth'
import { signupSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { email: validatedData.organizationEmail },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this email already exists' },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.organizationName,
        email: validatedData.organizationEmail,
      },
    })

    // Check if any admin exists in the system
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    // Assign role: ADMIN if no admin exists, otherwise USER
    const userRole = adminExists ? 'USER' : 'ADMIN'

    // Create user (role assigned based on admin existence)
    const hashedPassword = await hashPassword(validatedData.password)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: userRole,
        organizationId: organization.id,
      },
    })

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      organizationId: organization.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Set cookies
    setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
      },
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
