import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { LoadingSpinner } from '@/components/ui'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}
