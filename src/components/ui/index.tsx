import React from 'react'
import { cn, initials, statusColors, statusLabels } from '@/lib/utils'
import { X, Loader2, AlertTriangle } from 'lucide-react'

// ─── Button ──────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}
export function Button({ variant = 'primary', size = 'md', loading, icon, children, className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-blue',
    secondary: 'btn-secondary',
    danger: 'bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger',
    ghost: 'hover:bg-white/5 text-theme-muted hover:text-theme',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-faint">{icon}</span>}
          <input
            ref={ref}
            className={cn('input', icon && 'pl-9', error && 'border-danger/50 focus:border-danger/50', className)}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="label">{label}</label>}
        <textarea
          ref={ref}
          className={cn('input resize-none', error && 'border-danger/50', className)}
          rows={3}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { label: string; value: string }[]
  placeholder?: string
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="label">{label}</label>}
        <select
          ref={ref}
          className={cn('input appearance-none cursor-pointer', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Badge ────────────────────────────────────────────────
interface BadgeProps { status: string; className?: string }
export function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn('badge', statusColors[status] || 'bg-white/10 text-theme-soft', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {statusLabels[status] || status}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────
interface AvatarProps { name: string; url?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }
export function Avatar({ name, url, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm', xl: 'w-12 h-12 text-base' }
  if (url) return <img src={url} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/20', sizes[size], className)}>
      {initials(name)}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={cn('relative w-full rounded-2xl shadow-2xl animate-in', sizes[size])}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-soft)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <h2 className="font-display font-bold text-lg text-theme">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-theme-soft hover:text-theme transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 text-theme">{children}</div>
      </div>
    </div>
  )
}

// ─── ConfirmDialog ───────────────────────────────────────
interface ConfirmDialogProps { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; loading?: boolean }
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 bg-danger/5 border border-danger/20 rounded-lg">
          <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-theme-muted">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('card', className)}>{children}</div>
}

// ─── Empty State ──────────────────────────────────────────
export function EmptyState({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 bg-white/5 rounded-2xl text-white/20">{icon}</div>
      <h3 className="font-semibold text-theme-muted">{title}</h3>
      <p className="text-sm text-theme-faint max-w-xs">{message}</p>
      {action}
    </div>
  )
}

// ─── LoadingSpinner ───────────────────────────────────────
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader2 size={24} className="animate-spin text-brand-400" />
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-brand-500' : 'bg-warning'
  return (
    <div className={cn('h-1.5 bg-white/5 rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── SearchInput ──────────────────────────────────────────
import { Search } from 'lucide-react'
export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-faint" />
      <input
        className="input pl-9 w-64"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps { title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color?: string; trend?: number }
export function StatCard({ title, value, subtitle, icon, color = 'text-brand-400', trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-lg bg-white/5', color.replace('text-', 'text-'))}>{icon}</div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium', trend >= 0 ? 'text-success' : 'text-danger')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-theme">{value}</div>
        <div className="text-xs text-theme-soft mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-theme-faint mt-1">{subtitle}</div>}
      </div>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────
export function Table({ headers, children, className }: { headers: string[]; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map((h) => <th key={h} className="th">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
