import { useEffect, useRef } from 'react'

/**
 * Global keyboard shortcuts. Combos look like "alt+n", "mod+k", "?" or "escape".
 * `mod` is ⌘ on macOS and Ctrl elsewhere. Letter keys match on `event.code`, so
 * Option+N on a Mac works even though it types "˜".
 */
export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>

const isMacPlatform = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function matches(combo: string, e: KeyboardEvent) {
  const parts = combo.toLowerCase().split('+')
  const keyPart = parts.pop()!
  const wantMod = parts.includes('mod')
  const wantAlt = parts.includes('alt')
  const wantShift = parts.includes('shift')
  const mod = isMacPlatform ? e.metaKey : e.ctrlKey
  if (wantMod !== mod || wantAlt !== e.altKey) return false
  if (keyPart.length === 1 && /[a-z]/.test(keyPart)) {
    return e.code === `Key${keyPart.toUpperCase()}` && wantShift === e.shiftKey
  }
  return e.key.toLowerCase() === keyPart
}

export function useHotkeys(map: HotkeyMap) {
  const ref = useRef(map)
  ref.current = map
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      for (const [combo, fn] of Object.entries(ref.current)) {
        // Bare keys like "?" never fire while typing in a field.
        const bare = !/(mod|alt)\+/.test(combo) && combo !== 'escape'
        if (bare && typing) continue
        if (matches(combo, e)) {
          e.preventDefault()
          fn(e)
          return
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
