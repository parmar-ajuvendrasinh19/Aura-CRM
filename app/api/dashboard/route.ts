import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = user.organizationId

    // Get counts
    const [
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalDeals,
      wonDeals,
      totalPayments,
      paidPayments,
    ] = await Promise.all([
      prisma.client.count({ where: { organizationId } }),
      prisma.client.count({
        where: {
          organizationId,
          projects: { some: { status: 'ACTIVE' } },
        },
      }),
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.task.count({
        where: { project: { organizationId } },
      }),
      prisma.task.count({
        where: {
          project: { organizationId },
          status: 'DONE',
        },
      }),
      prisma.task.count({
        where: {
          project: { organizationId },
          status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.deal.count({ where: { organizationId } }),
      prisma.deal.count({ where: { organizationId, stage: 'WON' } }),
      prisma.payment.count({ where: { organizationId } }),
      prisma.payment.count({ where: { organizationId, status: 'PAID' } }),
    ])

    // Calculate revenue
    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { value: true },
    })

    const totalRevenue = projects.reduce((sum: number, p: { value: number | null }) => sum + (p.value || 0), 0)

    const payments = await prisma.payment.findMany({
      where: { organizationId },
      select: { amount: true },
    })

    const totalPaid = payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)

    const pendingRevenue = totalRevenue - totalPaid

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    })

    // Get upcoming tasks
    const upcomingTasks = await prisma.task.findMany({
      where: {
        project: { organizationId },
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

    // Get deals by stage
    const dealsByStage = await prisma.deal.groupBy({
      by: ['stage'],
      where: { organizationId },
      _count: true,
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
        totalDeals,
        wonDeals,
        totalPayments,
        paidPayments,
        totalRevenue,
        totalPaid,
        pendingRevenue,
      },
      recentActivities,
      upcomingTasks,
      dealsByStage,
    })
  } catch (error: any) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
