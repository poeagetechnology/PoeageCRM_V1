import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function AppLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-app p-6">
        <header className="mb-6 flex items-center justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary px-3"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
