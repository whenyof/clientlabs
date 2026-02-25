"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type Toast = {
 id: string
 title: string
 description?: string
}

type ToastContextValue = {
 notify: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([])

 const notify = useCallback((toast: Omit<Toast, "id">) => {
 const id = crypto.randomUUID()
 setToasts((prev) => [...prev, { ...toast, id }])
 window.setTimeout(() => {
 setToasts((prev) => prev.filter((t) => t.id !== id))
 }, 2600)
 }, [])

 const value = useMemo(() => ({ notify }), [notify])

 return (
 <ToastContext.Provider value={value}>
 {children}
 <div className="fixed bottom-6 right-6 z-[100] space-y-2">
 {toasts.map((toast) => (
 <div
 key={toast.id}
 className="min-w-[240px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)]/90 px-4 py-3 text-sm text-[var(--text-primary)] shadow-sm backdrop-blur"
 >
 <p className="font-semibold">{toast.title}</p>
 {toast.description ? (
 <p className="mt-1 text-xs text-[var(--text-secondary)]">{toast.description}</p>
 ) : null}
 </div>
 ))}
 </div>
 </ToastContext.Provider>
 )
}

export function useToast() {
 const ctx = useContext(ToastContext)
 if (!ctx) {
 throw new Error("useToast must be used within ToastProvider")
 }
 return ctx
}
