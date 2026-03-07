"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "./button"

interface SidePanelProps {
    isOpen: boolean
    onClose: () => void
    title?: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    width?: "default" | "wide" | "full"
    showCloseButton?: boolean
}

export function SidePanel({
    isOpen,
    onClose,
    title,
    description,
    children,
    width = "default",
    showCloseButton = true,
}: SidePanelProps) {
    const [mounted, setMounted] = React.useState(false)

    // Wait for mount to ensure window/document exists for portal
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Handle scroll lock and escape key
    React.useEffect(() => {
        if (!isOpen) return

        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = "hidden"

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEscape)

        return () => {
            document.body.style.overflow = originalStyle
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen, onClose])

    if (!mounted) return null

    const widthClasses = {
        default: "w-full sm:w-[480px]",
        wide: "w-full sm:w-[640px]",
        full: "w-full sm:w-[800px]",
    }

    // We mount the structure even if !isOpen to allow internal animations, 
    // but for simplicity of portaling cleanly we will just mount/unmount the entire node 
    // with a slight delay if we want complex exit animations, or use simple CSS transitions 
    // with pointer-events.

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[999] bg-transparent">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 ${widthClasses[width]}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header (Optional via title prop) */}
                {(title || showCloseButton) && (
                    <header className="flex-none px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white z-10">
                        <div className="flex-1 pr-4">
                            {title && (
                                typeof title === "string" ? (
                                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                                ) : (
                                    title
                                )
                            )}
                            {description && (
                                typeof description === "string" ? (
                                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                                ) : (
                                    description
                                )
                            )}</div>

                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full h-8 w-8 flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Cerrar</span>
                            </Button>
                        )}
                    </header>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar focus:outline-none" tabIndex={-1}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
