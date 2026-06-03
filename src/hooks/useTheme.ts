import { useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'poeagecrm-theme'

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme())

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
  }), [theme])
}
