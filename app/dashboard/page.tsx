'use client'

import { useEffect, useState } from 'react'
import { Users, FolderKanban, CheckSquare, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalClients: number
  activeClients: number
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalDeals: number
  wonDeals: number
  totalPayments: number
  paidPayments: number
  totalRevenue: number
  totalPaid: number
  pendingRevenue: number
}

interface Activity {
  id: string
  type: string
  title: string
  date: string
  user: { name: string }
}

interface Task {
  id: string
  title: string
  dueDate: string
  assignee: { name: string } | null
  project: { name: string }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setActivities(data.recentActivities)
        setUpcomingTasks(data.upcomingTasks)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const statCards = [
    { name: 'Total Clients', value: stats?.totalClients || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Projects', value: stats?.activeProjects || 0, icon: FolderKanban, color: 'bg-green-500' },
    { name: 'Pending Tasks', value: (stats?.totalTasks || 0) - (stats?.completedTasks || 0), icon: CheckSquare, color: 'bg-yellow-500' },
    { name: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-purple-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your agency workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activities</h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activities</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user?.name} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <CheckSquare className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {task.project?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {task.assignee && (
                      <p className="text-xs text-gray-400">Assigned to: {task.assignee.name}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Total Deals</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalDeals || 0}</p>
            <p className="text-xs text-green-600">{stats?.wonDeals || 0} won</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Task Completion</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">{stats?.completedTasks || 0} of {stats?.totalTasks || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Revenue Collected</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalPaid || 0)}</p>
            <p className="text-xs text-gray-500">{formatCurrency(stats?.pendingRevenue || 0)} pending</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overdue Tasks</p>
            <p className="text-2xl font-bold text-red-600">{stats?.overdueTasks || 0}</p>
            <p className="text-xs text-gray-500">Need attention</p>
          </div>
        </div>
      </div>
    </div>
  )
}
