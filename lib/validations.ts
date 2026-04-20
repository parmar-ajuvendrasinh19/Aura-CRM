import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
})

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  serviceType: z.enum(['SEO', 'WEBSITE_DEVELOPMENT', 'SOCIAL_MEDIA', 'ADS', 'CONTENT_MARKETING', 'EMAIL_MARKETING', 'OTHER']),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.number().optional(),
  value: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurringMonth: z.number().min(1).max(31).optional(),
  clientId: z.string().min(1, 'Client is required'),
})

export const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().min(1, 'Assignee is required'),
})

export const dealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  stage: z.enum(['LEAD', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST']).default('LEAD'),
  value: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
})

export const activitySchema = z.object({
  type: z.enum(['CALL', 'MEETING', 'NOTE', 'EMAIL', 'TASK_UPDATE', 'STATUS_CHANGE']),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  date: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  dealId: z.string().optional(),
})

export const paymentSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
})
