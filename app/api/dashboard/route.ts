import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts
    const [
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalPayments,
      paidPayments,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: {
          projects: { some: { status: 'ACTIVE' } },
        },
      }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count(),
      prisma.task.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.task.count({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'PAID' } }),
    ])

    // Calculate revenue
    const projects = await prisma.project.findMany({
      select: { value: true },
    })

    const totalRevenue = projects.reduce((sum: number, p: { value: number | null }) => sum + (p.value || 0), 0)

    const payments = await prisma.payment.findMany({
      select: { amount: true },
    })

    const totalPaid = payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)

    const pendingRevenue = totalRevenue - totalPaid

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      include: {
        user: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    })

    // Get upcoming tasks
    const upcomingTasks = await prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { gte: new Date() },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    })

    return NextResponse.json({
      stats: {
        totalClients,
        activeClients,
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        totalPayments,
        paidPayments,
        totalRevenue,
        totalPaid,
        pendingRevenue,
      },
      recentActivities,
      upcomingTasks,
    })
  } catch (error: any) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
