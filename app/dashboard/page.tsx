'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { format, isToday, isPast, parseISO } from 'date-fns'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

interface TaskStats {
  dueToday: number
  overdue: number
  highPriority: number
  total: number
}

interface PaymentStats {
  totalRevenue: number
  pendingPayments: number
  overduePayments: number
}

interface OverdueTask {
  id: string
  title: string
  dueDate: string
  priority: string
  assignee?: { name: string }
  client?: { companyName: string }
}

interface OverduePayment {
  id: string
  amount: number
  dueDate: string
  client?: { companyName: string }
  project?: { name: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<TaskStats>({
    dueToday: 0,
    overdue: 0,
    highPriority: 0,
    total: 0,
  })
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
  })
  const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([])
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTaskStats()
    fetchPaymentStats()
    fetchOverdueTasks()
    fetchOverduePayments()
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
    }
  }

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const payments = await response.json()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const totalRevenue = payments
          .filter((p: any) => p.status === 'PAID')
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        const pendingPayments = payments
          .filter((p: any) => p.status === 'PENDING')
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        const overduePayments = payments
          .filter((p: any) => p.isOverdue)
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        setPaymentStats({ totalRevenue, pendingPayments, overduePayments })
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOverdueTasks = async () => {
    try {
      const response = await fetch('/api/tasks?overdue=true')
      if (response.ok) {
        const tasks = await response.json()
        setOverdueTasks(tasks.slice(0, 5)) // Show top 5 overdue tasks
      }
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
    }
  }

  const fetchOverduePayments = async () => {
    try {
      const response = await fetch('/api/payments?overdue=true')
      if (response.ok) {
        const payments = await response.json()
        setOverduePayments(payments.slice(0, 5)) // Show top 5 overdue payments
      }
    } catch (error) {
      console.error('Error fetching overdue payments:', error)
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

  const paymentCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(paymentStats.totalRevenue),
      icon: Clock,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/dashboard/payments?status=PAID',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(paymentStats.pendingPayments),
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/dashboard/payments?status=PENDING',
    },
    {
      title: 'Overdue Payments',
      value: formatCurrency(paymentStats.overduePayments),
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/dashboard/payments?section=overdue',
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
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
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

          {/* Payment Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
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

          {/* Overdue Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue Tasks */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900">🔴 Overdue Tasks</h2>
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  {overdueTasks.length}
                </span>
              </div>
              {overdueTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No overdue tasks</p>
              ) : (
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/tasks`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span className="text-red-600 font-medium">
                            Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          </span>
                          {task.assignee && <span>• {task.assignee.name}</span>}
                          {task.client && <span>• {task.client.companyName}</span>}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue Payments */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900">🔴 Pending Payments</h2>
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  {overduePayments.length}
                </span>
              </div>
              {overduePayments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No overdue payments</p>
              ) : (
                <div className="space-y-3">
                  {overduePayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/payments`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {formatCurrency(payment.amount)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span className="text-red-600 font-medium">
                            Due: {format(parseISO(payment.dueDate), 'MMM d, yyyy')}
                          </span>
                          {payment.client && <span>• {payment.client.companyName}</span>}
                          {payment.project && <span>• {payment.project.name}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/tasks')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-left active:scale-[0.98] min-h-[64px]"
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
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-left active:scale-[0.98] min-h-[64px]"
              >
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Clients</p>
                  <p className="text-sm text-gray-500">Manage client relationships</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/dashboard/payments')}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-left active:scale-[0.98] min-h-[64px]"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Payments</p>
                  <p className="text-sm text-gray-500">Track payments and revenue</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
