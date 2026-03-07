"use client"

import { useEffect, useCallback } from "react"
import { X } from "lucide-react"

/* ── Types ──────────────────────────────────────────── */

interface SlideOverPanelProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    /** Panel width in px. Default: 520 */
    width?: number
}

/* ── Styles (inline constants — spec colors) ────────── */

const BORDER = "#E2E8F0"
const TEXT_PRIMARY = "#0B1F2A"
const TEXT_SECONDARY = "#8FA6B2"

/* ── Component ──────────────────────────────────────── */

export function SlideOverPanel({
    isOpen,
    onClose,
    title,
    children,
    width = 520,
}: SlideOverPanelProps) {

    /** Close on Escape key */
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = ""
        }
    }, [isOpen, handleKeyDown])

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 transition-opacity duration-200"
                    style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white transition-transform duration-300 ease-out"
                style={{
                    width,
                    borderLeft: `1px solid ${BORDER}`,
                    boxShadow: isOpen
                        ? "-4px 0 24px rgba(0,0,0,0.06)"
                        : "none",
                    transform: isOpen ? "translateX(0)" : `translateX(${width}px)`,
                }}
            >
                {/* Header */}
                {title && (
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: `1px solid ${BORDER}` }}
                    >
                        <h2
                            className="text-lg font-semibold truncate"
                            style={{ color: TEXT_PRIMARY }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                            aria-label="Close panel"
                        >
                            <X className="w-5 h-5" style={{ color: TEXT_SECONDARY }} />
                        </button>
                    </div>
                )}

                {/* Close button (no title mode) */}
                {!title && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                            aria-label="Close panel"
                        >
                            <X className="w-5 h-5" style={{ color: TEXT_SECONDARY }} />
                        </button>
                    </div>
                )}

                {/* Content (scrollable) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </div>
        </>
    )
}
