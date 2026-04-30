'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  Filter,
  Edit2,
  Trash2,
  X,
  ArrowLeft
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Task, TaskType, TaskPriority } from '@/types/task'
import { TaskForm } from '@/components/TaskForm'

const typeColors: Record<TaskType, { bg: string; text: string; border: string }> = {
  MEETING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  FOLLOW_UP: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  PAYMENT: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  CAMPAIGN: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  CONTENT: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  DEVELOPMENT: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  INTERNAL: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  ALERT: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-800' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  LOW: { bg: 'bg-green-100', text: 'text-green-800' },
}

const typeLabels: Record<TaskType, string> = {
  MEETING: 'Meeting',
  FOLLOW_UP: 'Follow Up',
  PAYMENT: 'Payment',
  CAMPAIGN: 'Campaign',
  CONTENT: 'Content',
  DEVELOPMENT: 'Development',
  INTERNAL: 'Internal',
  ALERT: 'Alert',
}

const priorityLabels: Record<TaskPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

type SectionType = 'today' | 'upcoming' | 'overdue' | 'completed'

interface Filters {
  type: TaskType | ''
  priority: TaskPriority | ''
  assignedTo: string
  clientId: string
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeSection, setActiveSection] = useState<SectionType>('today')
  const [showFilters, setShowFilters] = useState(false)
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [clients, setClients] = useState<{ id: string; companyName: string }[]>([])
  const [filters, setFilters] = useState<Filters>({
    type: '',
    priority: '',
    assignedTo: '',
    clientId: '',
  })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.set('section', activeSection)
      
      if (filters.type) queryParams.set('type', filters.type)
      if (filters.priority) queryParams.set('priority', filters.priority)
      if (filters.assignedTo) queryParams.set('assignedTo', filters.assignedTo)
      if (filters.clientId) queryParams.set('clientId', filters.clientId)

      const response = await fetch(`/api/tasks?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [activeSection, filters])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchClients()
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) throw new Error('Failed to create task')

      toast.success('Task created successfully')
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) throw new Error('Failed to update task')

      toast.success('Task updated successfully')
      setEditingTask(null)
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      toast.success('Task deleted successfully')
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      toast.success(newStatus === 'COMPLETED' ? 'Task marked as completed' : 'Task marked as pending')
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const sections: { key: SectionType; label: string; icon: any }[] = [
    { key: 'today', label: 'Today', icon: Calendar },
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  ]

  const renderTaskCard = (task: Task) => {
    const typeStyle = typeColors[task.type]
    const priorityStyle = priorityColors[task.priority]
    const isTaskOverdue = task.isOverdue && task.status !== 'COMPLETED'

    return (
      <div
        key={task.id}
        className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
          isTaskOverdue ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleToggleComplete(task)}
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
              task.status === 'COMPLETED'
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {task.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium text-gray-900 ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingTask(task); setShowForm(true) }}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                {typeLabels[task.type]}
              </span>

              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                {priorityLabels[task.priority]}
              </span>

              {task.dueDate && (
                <span className={`inline-flex items-center gap-1 text-xs ${isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(task.dueDate.toString()), 'MMM d')}
                  {isTaskOverdue && ' (Overdue)'}
                </span>
              )}

              {task.assignedUser && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {task.assignedUser.name}
                </span>
              )}

              {task.client && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Building2 className="h-3 w-3" />
                  {task.client.companyName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-sm text-gray-500 mt-1">Admin view of all tasks</p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === section.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              showFilters ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          {(filters.type || filters.priority || filters.assignedTo || filters.clientId) && (
            <button
              onClick={() => setFilters({ type: '', priority: '', assignedTo: '', clientId: '' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TaskType })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Priorities</option>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>

            <select
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="text-gray-500 mt-1">No {activeSection} tasks available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(renderTaskCard)}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingTask(null) }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <TaskForm
                initialData={editingTask}
                users={users}
                clients={clients}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => { setShowForm(false); setEditingTask(null) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
