import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

/** Resolved theme: the saved choice, else the system preference. */
export function resolvedTheme(saved: 'light' | 'dark' | null) {
  if (saved) return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Keep the <html> class in sync, with a short color crossfade on change. */
export function useThemeSync() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      root.classList.add('theme-transition')
      root.classList.toggle('dark', resolvedTheme(theme) === 'dark')
      window.setTimeout(() => root.classList.remove('theme-transition'), 320)
    }
    apply()
    if (theme) return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

export function toggleTheme() {
  const { settings, setTheme } = useStore.getState()
  setTheme(resolvedTheme(settings.theme) === 'dark' ? 'light' : 'dark')
}
