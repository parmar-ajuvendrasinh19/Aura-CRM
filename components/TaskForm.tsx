'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { taskSchema } from '@/lib/validations'
import { Task, TaskType, TaskPriority, TaskStatus } from '@/types/task'

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  initialData?: Task | null
  users: { id: string; name: string; email: string }[]
  clients: { id: string; companyName: string }[]
  projects?: { id: string; name: string }[]
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

const typeOptions: { value: TaskType; label: string; category: string }[] = [
  // Client Interaction
  { value: TaskType.MEETING, label: 'Meeting', category: 'Client Interaction' },
  { value: TaskType.FOLLOW_UP, label: 'Follow Up', category: 'Client Interaction' },
  { value: TaskType.FEEDBACK, label: 'Feedback', category: 'Client Interaction' },
  { value: TaskType.ONBOARDING, label: 'Onboarding', category: 'Client Interaction' },
  
  // Finance
  { value: TaskType.PAYMENT_REMINDER, label: 'Payment Reminder', category: 'Finance' },
  { value: TaskType.INVOICE, label: 'Invoice', category: 'Finance' },
  { value: TaskType.SUBSCRIPTION, label: 'Subscription', category: 'Finance' },
  
  // Marketing
  { value: TaskType.CAMPAIGN, label: 'Campaign', category: 'Marketing' },
  { value: TaskType.CONTENT, label: 'Content', category: 'Marketing' },
  
  // Internal
  { value: TaskType.DEVELOPMENT, label: 'Development', category: 'Internal' },
  { value: TaskType.DESIGN, label: 'Design', category: 'Internal' },
  { value: TaskType.INTERNAL, label: 'Internal', category: 'Internal' },
  
  // Alerts
  { value: TaskType.ALERT, label: 'Alert', category: 'Alerts' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.LOW, label: 'Low' },
]

export function TaskForm({ initialData, users, clients, projects, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || TaskType.INTERNAL,
      priority: initialData?.priority || TaskPriority.MEDIUM,
      status: initialData?.status || TaskStatus.TODO,
      dueDate: initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
      assigneeId: initialData?.assigneeId || '',
      clientId: initialData?.clientId || '',
      projectId: initialData?.projectId || '',
    },
  })

  const handleFormSubmit = (data: TaskFormData) => {
    console.log('TaskForm - Form submitted with data:', data)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Enter task description"
        />
      </div>

      {/* Type & Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            {...register('type')}
            id="type"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            {...register('priority')}
            id="priority"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          {...register('dueDate')}
          type="date"
          id="dueDate"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Assign To */}
      <div>
        <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <select
          {...register('assigneeId')}
          id="assigneeId"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {errors.assigneeId && (
          <p className="mt-1 text-sm text-red-600">{errors.assigneeId.message}</p>
        )}
      </div>

      {/* Client (Optional) */}
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
          Client
        </label>
        <select
          {...register('clientId')}
          id="clientId"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">No client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.companyName}
            </option>
          ))}
        </select>
      </div>

      {/* Project (Optional) */}
      {projects && projects.length > 0 && (
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            {...register('projectId')}
            id="projectId"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status (for editing) */}
      {initialData && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            {...register('status')}
            id="status"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.REVIEW}>Review</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
