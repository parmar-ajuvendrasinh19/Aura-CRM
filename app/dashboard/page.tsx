'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { format, isToday, isPast, parseISO } from 'date-fns'

interface TaskStats {
  dueToday: number
  overdue: number
  highPriority: number
  total: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<TaskStats>({
    dueToday: 0,
    overdue: 0,
    highPriority: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTaskStats()
  }, [])

  const fetchTaskStats = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const tasks = await response.json()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dueToday = tasks.filter((task: any) => {
          if (!task.dueDate || task.isCompleted) return false
          const dueDate = new Date(task.dueDate)
          return isToday(dueDate)
        }).length

        const overdue = tasks.filter((task: any) => {
          if (!task.dueDate || task.isCompleted) return false
          const dueDate = new Date(task.dueDate)
          return isPast(dueDate) && !isToday(dueDate)
        }).length

        const highPriority = tasks.filter((task: any) => {
          return task.priority === 'HIGH' && !task.isCompleted
        }).length

        const total = tasks.filter((task: any) => !task.isCompleted).length

        setStats({ dueToday, overdue, highPriority, total })
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Tasks Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/dashboard/tasks?section=today',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/dashboard/tasks?section=overdue',
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      link: '/dashboard/tasks?priority=HIGH',
    },
    {
      title: 'Total Active',
      value: stats.total,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/dashboard/tasks',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to your CRM workspace</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(card.link)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>View all</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/tasks')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Tasks</p>
                  <p className="text-sm text-gray-500">Manage all your tasks</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Clients</p>
                  <p className="text-sm text-gray-500">Manage client relationships</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
