"use client"

import { useEffect, useCallback } from "react"

export function useKeyboardShortcut(key: string, callback: () => void) {
  const stable = useCallback(callback, [callback])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        stable()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [key, stable])
}
