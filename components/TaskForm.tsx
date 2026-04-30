'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { taskSchema } from '@/lib/validations'
import { Task, TaskType, TaskPriority } from '@/types/task'

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  initialData?: Task | null
  users: { id: string; name: string; email: string }[]
  clients: { id: string; companyName: string }[]
  projects?: { id: string; name: string }[]
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

const typeOptions: { value: TaskType; label: string }[] = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'CAMPAIGN', label: 'Campaign' },
  { value: 'CONTENT', label: 'Content' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'ALERT', label: 'Alert' },
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
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
      type: initialData?.type || 'INTERNAL',
      priority: initialData?.priority || 'MEDIUM',
      status: initialData?.status || 'PENDING',
      dueDate: initialData?.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
      assignedTo: initialData?.assignedTo || '',
      clientId: initialData?.clientId || '',
      projectId: initialData?.projectId || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            Type <span className="text-red-500">*</span>
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
            Priority <span className="text-red-500">*</span>
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
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
          Assign To <span className="text-red-500">*</span>
        </label>
        <select
          {...register('assignedTo')}
          id="assignedTo"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>
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
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
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
