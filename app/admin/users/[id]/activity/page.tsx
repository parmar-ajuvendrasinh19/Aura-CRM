'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Filter, Clock, Activity } from 'lucide-react'

interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string | null
  entityId: string | null
  description: string
  createdAt: string
}

export default function UserActivityPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchActivityLogs()
  }, [actionFilter, entityTypeFilter, startDate, endDate])

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (actionFilter) params.append('action', actionFilter)
      if (entityTypeFilter) params.append('entityType', entityTypeFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/users/${userId}/activity?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs')
      }

      const data = await response.json()
      setActivityLogs(data)
    } catch (error: any) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatIST = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getActionColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'bg-green-100 text-green-800 border-green-200'
    if (action.startsWith('UPDATE')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (action.startsWith('DELETE')) return 'bg-red-100 text-red-800 border-red-200'
    if (action === 'LOGIN') return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getActionIcon = (action: string) => {
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Activity Timeline</h1>
        <p className="mt-2 text-gray-600">View all actions performed by this user</p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_CLIENT">Create Client</option>
              <option value="UPDATE_CLIENT">Update Client</option>
              <option value="DELETE_CLIENT">Delete Client</option>
              <option value="CREATE_PROJECT">Create Project</option>
              <option value="UPDATE_PROJECT">Update Project</option>
              <option value="DELETE_PROJECT">Delete Project</option>
              <option value="CREATE_TASK">Create Task</option>
              <option value="UPDATE_TASK">Update Task</option>
              <option value="DELETE_TASK">Delete Task</option>
              <option value="CREATE_DEAL">Create Deal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Entity Type</label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Entities</option>
              <option value="CLIENT">Client</option>
              <option value="PROJECT">Project</option>
              <option value="TASK">Task</option>
              <option value="DEAL">Deal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        {(actionFilter || entityTypeFilter || startDate || endDate) && (
          <button
            onClick={() => {
              setActionFilter('')
              setEntityTypeFilter('')
              setStartDate('')
              setEndDate('')
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading activity logs...
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activityLogs.map((log, index) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                      {log.entityType && (
                        <span className="text-xs text-gray-500">
                          • {log.entityType}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {log.description}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatIST(log.createdAt)} (IST)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && activityLogs.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{activityLogs.length}</span> activity logs
          </p>
        </div>
      )}
    </div>
  )
}
