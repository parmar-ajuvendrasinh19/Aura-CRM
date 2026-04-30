export enum TaskType {
  // Client Interaction
  MEETING = 'MEETING',
  FOLLOW_UP = 'FOLLOW_UP',
  FEEDBACK = 'FEEDBACK',
  ONBOARDING = 'ONBOARDING',
  
  // Finance
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  INVOICE = 'INVOICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  
  // Marketing
  CAMPAIGN = 'CAMPAIGN',
  CONTENT = 'CONTENT',
  
  // Internal
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  INTERNAL = 'INTERNAL',
  
  // Alerts
  ALERT = 'ALERT',
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string
  title: string
  description?: string | null
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null
  isCompleted: boolean
  projectId?: string | null
  assigneeId?: string | null
  creatorId: string
  clientId?: string | null
  createdAt: string
  updatedAt: string
  
  // Relations
  project?: {
    id: string
    name: string
  } | null
  assignee?: {
    id: string
    name: string
    email: string
  } | null
  creator?: {
    id: string
    name: string
  }
  client?: {
    id: string
    companyName: string
  } | null
  assignedUser?: {
    id: string
    name: string
    email: string
  } | null
  
  // Computed
  isOverdue?: boolean
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project' | 'assignee' | 'creator' | 'client' | 'assignedUser' | 'isOverdue'>
