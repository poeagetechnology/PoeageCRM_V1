import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined) {
  if (!date) return '—'
  try { return format(new Date(date), 'MMM dd, yyyy') } catch { return '—' }
}

export function formatDateShort(date: string | Date | undefined) {
  if (!date) return '—'
  try { return format(new Date(date), 'MMM dd') } catch { return '—' }
}

export function timeAgo(date: string | Date | undefined) {
  if (!date) return '—'
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) } catch { return '—' }
}

export function formatCurrency(amount: number | undefined, currency = 'USD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Status color maps
export const statusColors = {
  // Project
  planning: 'bg-white/10 text-white/60',
  active: 'bg-success/10 text-success',
  on_hold: 'bg-warning/10 text-warning',
  completed: 'bg-brand-500/10 text-brand-400',
  cancelled: 'bg-danger/10 text-danger',
  // Client
  prospect: 'bg-accent-400/10 text-accent-400',
  inactive: 'bg-white/10 text-white/40',
  churned: 'bg-danger/10 text-danger',
  // Task
  todo: 'bg-white/10 text-white/60',
  in_progress: 'bg-brand-500/10 text-brand-400',
  review: 'bg-accent-400/10 text-accent-400',
  done: 'bg-success/10 text-success',
  // Priority
  low: 'bg-white/10 text-white/50',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-danger/10 text-danger',
  // Employee
  on_leave: 'bg-warning/10 text-warning',
  // Payroll
  draft: 'bg-white/10 text-white/50',
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-brand-500/10 text-brand-400',
  paid: 'bg-success/10 text-success',
} as Record<string, string>

export const statusLabels: Record<string, string> = {
  planning: 'Planning', active: 'Active', on_hold: 'On Hold',
  completed: 'Completed', cancelled: 'Cancelled',
  prospect: 'Prospect', inactive: 'Inactive', churned: 'Churned',
  lead: 'Lead', proposal: 'Proposal', negotiation: 'Negotiation',
  onboarded: 'Onboarded',
  todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
  full_time: 'Full Time', part_time: 'Part Time', contractor: 'Contractor', intern: 'Intern',
  on_leave: 'On Leave',
  draft: 'Draft', pending: 'Pending', approved: 'Approved', paid: 'Paid',
}
