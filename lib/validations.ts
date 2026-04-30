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

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
})

export const clientSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
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
  type: z.enum(['MEETING', 'FOLLOW_UP', 'FEEDBACK', 'ONBOARDING', 'PAYMENT_REMINDER', 'INVOICE', 'SUBSCRIPTION', 'CAMPAIGN', 'CONTENT', 'DEVELOPMENT', 'DESIGN', 'INTERNAL', 'ALERT']).default('INTERNAL'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().default(false),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  clientId: z.string().optional(),
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
