'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  Filter,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  List,
  LayoutGrid
} from 'lucide-react'
import { format, isToday, isPast, isFuture, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { Task, TaskType, TaskPriority, TaskStatus } from '@/types/task'
import { TaskForm } from '@/components/TaskForm'
import { fetchWithAuth } from '@/lib/fetch-with-auth'

const typeColors: Record<TaskType, { bg: string; text: string; border: string }> = {
  MEETING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  FOLLOW_UP: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  FEEDBACK: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  ONBOARDING: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  PAYMENT_REMINDER: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  INVOICE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  SUBSCRIPTION: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  CAMPAIGN: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  CONTENT: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  DEVELOPMENT: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  DESIGN: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
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
  FEEDBACK: 'Feedback',
  ONBOARDING: 'Onboarding',
  PAYMENT_REMINDER: 'Payment Reminder',
  INVOICE: 'Invoice',
  SUBSCRIPTION: 'Subscription',
  CAMPAIGN: 'Campaign',
  CONTENT: 'Content',
  DEVELOPMENT: 'Development',
  DESIGN: 'Design',
  INTERNAL: 'Internal',
  ALERT: 'Alert',
}

const priorityLabels: Record<TaskPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

type SectionType = 'today' | 'upcoming' | 'overdue' | 'completed'
type ViewType = 'card' | 'table'

interface Filters {
  type: TaskType | ''
  priority: TaskPriority | ''
  status: TaskStatus | ''
  assignedTo: string
  clientId: string
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeSection, setActiveSection] = useState<SectionType>('today')
  const [showFilters, setShowFilters] = useState(false)
  const [viewType, setViewType] = useState<ViewType>('card')
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [clients, setClients] = useState<{ id: string; companyName: string }[]>([])
  const [filters, setFilters] = useState<Filters>({
    type: '',
    priority: '',
    status: '',
    assignedTo: '',
    clientId: '',
  })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      // Add section filter
      queryParams.set('section', activeSection)
      
      // Add additional filters
      if (filters.type) queryParams.set('type', filters.type)
      if (filters.priority) queryParams.set('priority', filters.priority)
      if (filters.assignedTo) queryParams.set('assignedTo', filters.assignedTo)
      if (filters.clientId) queryParams.set('clientId', filters.clientId)

      const response = await fetchWithAuth(`/api/tasks?${queryParams}`)
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
      const response = await fetchWithAuth('/api/users?forAssignment=true')
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
      const response = await fetchWithAuth('/api/clients')
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
    console.log('TasksPage - handleCreateTask called with data:', taskData)
    
    // Clean up empty string values to undefined for optional fields
    const cleanedData = {
      ...taskData,
      assigneeId: taskData.assigneeId || undefined,
      clientId: taskData.clientId || undefined,
      projectId: taskData.projectId || undefined,
      dueDate: taskData.dueDate || undefined,
      description: taskData.description || undefined,
    }
    
    console.log('TasksPage - Cleaned data for API:', cleanedData)
    
    try {
      const response = await fetchWithAuth('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      console.log('TasksPage - API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('TasksPage - API error:', errorData)
        throw new Error('Failed to create task')
      }

      const result = await response.json()
      console.log('TasksPage - Task created successfully:', result)
      
      toast.success('Task created successfully')
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      console.error('TasksPage - Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return

    console.log('TasksPage - handleUpdateTask called with data:', taskData)
    
    // Clean up empty string values to undefined for optional fields
    const cleanedData = {
      ...taskData,
      assigneeId: taskData.assigneeId || undefined,
      clientId: taskData.clientId || undefined,
      projectId: taskData.projectId || undefined,
      dueDate: taskData.dueDate || undefined,
      description: taskData.description || undefined,
    }
    
    console.log('TasksPage - Cleaned data for API:', cleanedData)

    try {
      const response = await fetchWithAuth(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      console.log('TasksPage - API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('TasksPage - API error:', errorData)
        throw new Error('Failed to update task')
      }

      const result = await response.json()
      console.log('TasksPage - Task updated successfully:', result)

      toast.success('Task updated successfully')
      setEditingTask(null)
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      console.error('TasksPage - Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetchWithAuth(`/api/tasks/${taskId}`, {
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
      const newIsCompleted = !task.isCompleted
      const newStatus = newIsCompleted ? TaskStatus.COMPLETED : TaskStatus.TODO
      
      console.log('handleToggleComplete - Task ID:', task.id)
      console.log('handleToggleComplete - Current isCompleted:', task.isCompleted)
      console.log('handleToggleComplete - New isCompleted:', newIsCompleted)
      console.log('handleToggleComplete - New status:', newStatus)
      
      const response = await fetchWithAuth(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newIsCompleted, status: newStatus }),
      })

      console.log('handleToggleComplete - Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('handleToggleComplete - Error response:', errorData)
        throw new Error('Failed to update task')
      }

      const result = await response.json()
      console.log('handleToggleComplete - Updated task:', result)

      toast.success(newIsCompleted ? 'Task marked as completed' : 'Task marked as pending')
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const sections: { key: SectionType; label: string; icon: any; count: number }[] = [
    { key: 'today', label: 'Today', icon: Calendar, count: tasks.length },
    { key: 'upcoming', label: 'Upcoming', icon: Clock, count: 0 },
    { key: 'overdue', label: 'Overdue', icon: AlertCircle, count: 0 },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: 0 },
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
            onClick={(e) => {
              e.stopPropagation()
              handleToggleComplete(task)
            }}
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors z-10 ${
              task.isCompleted
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {task.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-medium text-gray-900 ${
                  task.isCompleted ? 'line-through text-gray-500' : ''
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingTask(task)
                    setShowForm(true)
                  }}
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
              {/* Type Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
              >
                {typeLabels[task.type]}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
              >
                {priorityLabels[task.priority]}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 text-xs ${
                    isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  {format(parseISO(task.dueDate.toString()), 'MMM d')}
                  {isTaskOverdue && ' (Overdue)'}
                </span>
              )}

              {/* Assigned User */}
              {task.assignedUser && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  {task.assignedUser.name}
                </span>
              )}

              {/* Client */}
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

  const renderTableRow = (task: Task) => {
    const typeStyle = typeColors[task.type]
    const priorityStyle = priorityColors[task.priority]
    const isTaskOverdue = task.isOverdue && task.status !== 'COMPLETED'

    return (
      <tr
        key={task.id}
        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
          isTaskOverdue ? 'bg-red-50/30' : ''
        }`}
      >
        <td className="px-4 py-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleComplete(task)
            }}
            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors z-10 ${
              task.isCompleted
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {task.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        </td>
        <td className="px-4 py-3">
          <div className={`font-medium text-gray-900 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </div>
          {task.description && (
            <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
          >
            {typeLabels[task.type]}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
          >
            {priorityLabels[task.priority]}
          </span>
        </td>
        <td className="px-4 py-3">
          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1 text-sm ${
                isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {format(parseISO(task.dueDate.toString()), 'MMM d, yyyy')}
              {isTaskOverdue && ' (Overdue)'}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          {task.assignedUser ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-3 w-3" />
              {task.assignedUser.name}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          {task.client ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-3 w-3" />
              {task.client.companyName}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingTask(task)
                setShowForm(true)
              }}
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
        </td>
      </tr>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your tasks and assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewType(viewType === 'card' ? 'table' : 'card')}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
                  viewType === 'card' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {viewType === 'card' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                {viewType === 'card' ? 'Table' : 'Cards'}
              </button>
              <button
                onClick={() => {
                  setEditingTask(null)
                  setShowForm(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 active:scale-[0.95]"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 border-b border-gray-200 mt-2">
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
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
                showFilters ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {(filters.type || filters.priority || filters.status || filters.assignedTo || filters.clientId) && (
              <button
                onClick={() => setFilters({ type: '', priority: '', status: '', assignedTo: '', clientId: '' })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pb-3">
              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as TaskType })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Types</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Priorities</option>
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>

              {/* Assigned To Filter */}
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              {/* Client Filter */}
              <select
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="text-gray-500 mt-1">
              {activeSection === 'today'
                ? "You're all caught up for today!"
                : `No ${activeSection} tasks found.`}
            </p>
            <button
              onClick={() => {
                setEditingTask(null)
                setShowForm(true)
              }}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Create a task
            </button>
          </div>
        ) : viewType === 'card' ? (
          <div className="space-y-3">
            {tasks.map(renderTaskCard)}
          </div>
        ) : (
          <>
            {/* Mobile Card View for Table Mode */}
            <div className="lg:hidden space-y-3">
              {tasks.map((task) => {
                const typeStyle = typeColors[task.type]
                const priorityStyle = priorityColors[task.priority]
                const isTaskOverdue = task.isOverdue && task.status !== 'COMPLETED'

                return (
                  <div
                    key={task.id}
                    className={`rounded-lg border bg-white p-4 shadow-sm ${
                      isTaskOverdue ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleComplete(task)
                        }}
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors z-10 ${
                          task.isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {task.isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-gray-900 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
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
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {task.assignedUser && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignedUser.name}
                            </span>
                          )}
                          {task.client && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {task.client.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setEditingTask(task)
                          setShowForm(true)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(renderTableRow)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingTask(null)
                }}
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
                onCancel={() => {
                  setShowForm(false)
                  setEditingTask(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
