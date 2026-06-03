import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toasts: Toast[]
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{
      toasts,
      success: (t, m) => add('success', t, m),
      error: (t, m) => add('error', t, m),
      warning: (t, m) => add('warning', t, m),
      info: (t, m) => add('info', t, m),
      dismiss,
    }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const iconMap = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const styleMap = {
  success: 'border-l-success text-success',
  error: 'border-l-danger text-danger',
  warning: 'border-l-warning text-warning',
  info: 'border-l-brand-400 text-brand-400',
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 px-4 py-3 card border-l-2 rounded-lg shadow-xl min-w-72 max-w-sm animate-in',
            styleMap[t.type]
          )}
        >
          <span className="mt-0.5 shrink-0">{iconMap[t.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-theme">{t.title}</p>
            {t.message && <p className="text-xs text-theme-soft mt-0.5">{t.message}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="shrink-0 text-theme-faint hover:text-theme transition-colors mt-0.5">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
