"use client"

import { useState, useEffect } from "react"

export type OS = "mac" | "windows" | "linux" | "mobile" | "unknown"

export function useOS(): OS {
  const [os, setOS] = useState<OS>("unknown")

  useEffect(() => {
    const ua = navigator.userAgent
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || ""

    if (/iPhone|iPad|iPod|Android/i.test(ua)) {
      setOS("mobile")
      return
    }

    if (/Mac/i.test(platform) || /Mac/i.test(ua)) {
      setOS("mac")
    } else if (/Win/i.test(platform) || /Win/i.test(ua)) {
      setOS("windows")
    } else if (/Linux/i.test(platform)) {
      setOS("linux")
    } else {
      setOS("unknown")
    }
  }, [])

  return os
}

export function getShortcutSymbol(os: OS): string | null {
  switch (os) {
    case "mac": return "⌘K"
    case "windows":
    case "linux": return "Ctrl+K"
    case "mobile": return null
    default: return "Ctrl+K"
  }
}

export function getShortcutKeys(os: OS): string[] | null {
  switch (os) {
    case "mac": return ["⌘", "K"]
    case "windows":
    case "linux": return ["Ctrl", "K"]
    case "mobile": return null
    default: return ["Ctrl", "K"]
  }
}
