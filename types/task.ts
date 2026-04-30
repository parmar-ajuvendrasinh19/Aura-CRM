export type TaskType = 'MEETING' | 'FOLLOW_UP' | 'PAYMENT' | 'CAMPAIGN' | 'CONTENT' | 'DEVELOPMENT' | 'INTERNAL' | 'ALERT'

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type TaskStatus = 'PENDING' | 'COMPLETED'

export interface Task {
  id: string
  title: string
  description: string | null
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  isOverdue: boolean
  assignedTo: string | null
  assignedUser: {
    id: string
    name: string
    email: string
    avatar: string | null
  } | null
  clientId: string | null
  client: {
    id: string
    companyName: string
    ownerName: string
  } | null
  projectId: string | null
  project: {
    id: string
    name: string
  } | null
  creatorId: string
  creator: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  assignedTo: string
  clientId?: string
  projectId?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  type?: TaskType
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string | null
  assignedTo?: string
  clientId?: string | null
  projectId?: string | null
}
