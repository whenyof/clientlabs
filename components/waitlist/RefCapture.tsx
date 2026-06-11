"use client"

import { useEffect } from "react"

const COOKIE_NAME = "cl_ref"
const MAX_AGE_DAYS = 30

/**
 * Captura ?ref=CODE de la URL y lo persiste en cookie (~30 días) para que
 * el alta en la waitlist atribuya el referido aunque ocurra en otra visita.
 */
export function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref")
      if (!ref || ref.length > 32 || !/^[A-Za-z0-9]+$/.test(ref)) return
      const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; path=/; max-age=${maxAge}; SameSite=Lax`
    } catch {
      // sin cookie no hay atribución, pero nada se rompe
    }
  }, [])

  return null
}
