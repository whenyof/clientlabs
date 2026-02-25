"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light"

interface ThemeContextProps {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("theme") || "light"
        setTheme(saved as Theme)
        document.documentElement.setAttribute("data-theme", saved)
    }, [])

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light"
        const nextTheme = currentTheme === "dark" ? "light" : "dark"

        document.documentElement.setAttribute("data-theme", nextTheme)
        localStorage.setItem("theme", nextTheme)
        setTheme(nextTheme as Theme)
    }

    // Prevents hydration mismatch by not rendering anything theme-specific until mounted
    // We already injected the theme class in <head> via layout.tsx
    return (
        <ThemeContext.Provider value={{ theme: mounted ? theme : "light", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme must be used within ThemeProvider")
    return context
}
