// ─── Auth ───────────────────────────────────────────────
export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  department?: string
  createdAt: string
}

export type UserRole = 'super_admin' | 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'hr' | 'finance'

// ─── Clients ────────────────────────────────────────────
export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address?: string
  industry: string
  status: ClientStatus
  onboardingStage: OnboardingStage
  assignedPM?: string
  totalValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'churned'
export type OnboardingStage = 'lead' | 'proposal' | 'negotiation' | 'onboarded' | 'completed'

export interface Contact {
  id: string
  clientId: string
  name: string
  email: string
  phone?: string
  role: string
  isPrimary: boolean
  createdAt: string
}

// ─── Projects ───────────────────────────────────────────
export interface Project {
  id: string
  title: string
  description?: string
  clientId: string
  clientName?: string
  status: ProjectStatus
  priority: Priority
  type: ProjectType
  startDate: string
  endDate: string
  budget: number
  spent: number
  progress: number
  projectManagerId?: string
  projectManagerName?: string
  teamMemberIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type ProjectType = 'fixed' | 'hourly' | 'retainer'

// ─── Tasks ──────────────────────────────────────────────
export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  projectName?: string
  assigneeId?: string
  assigneeName?: string
  status: TaskStatus
  priority: Priority
  type: TaskType
  estimatedHours: number
  spentHours: number
  startDate?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskType = 'development' | 'design' | 'content' | 'qa' | 'meeting' | 'other'

// ─── Employees ──────────────────────────────────────────
export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  department: Department
  employmentType: EmploymentType
  status: EmployeeStatus
  hourlyRate?: number
  monthlySalary?: number
  skills: string[]
  joinDate: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export type Department = 'engineering' | 'design' | 'marketing' | 'finance' | 'hr' | 'operations' | 'sales'
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern'
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave'

// ─── Payroll ────────────────────────────────────────────
export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  baseSalary: number
  allowances: number
  deductions: number
  overtimeHours: number
  overtimePay: number
  incentives: number
  tax: number
  netPay: number
  status: PayrollStatus
  createdAt: string
}

export type PayrollStatus = 'draft' | 'pending' | 'approved' | 'paid'

// ─── Shared ─────────────────────────────────────────────
export interface SelectOption {
  label: string
  value: string
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}
