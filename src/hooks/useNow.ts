import { useEffect, useState } from 'react'

/** Re-render on an interval (or every animation frame when `ms` is 0) while `active`. */
export function useNow(active: boolean, ms = 250) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    if (ms === 0) {
      let raf = 0
      const loop = () => {
        setNow(Date.now())
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(raf)
    }
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [active, ms])
  return now
}
