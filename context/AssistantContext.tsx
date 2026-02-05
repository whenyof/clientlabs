"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type Suggestion = {
    id: string
    priority: "high" | "medium" | "low"
    icon: any
    text: string
    actionLabel: string
    onAction: () => void
}

type AssistantContextType = {
    suggestions: Suggestion[]
    setSuggestions: (suggestions: Suggestion[]) => void
    clearSuggestions: () => void
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export function AssistantProvider({ children }: { children: React.ReactNode }) {
    const [suggestions, setSuggestionsState] = useState<Suggestion[]>([])

    const setSuggestions = useCallback((newSuggestions: Suggestion[]) => {
        setSuggestionsState(newSuggestions)
    }, [])

    const clearSuggestions = useCallback(() => {
        setSuggestionsState([])
    }, [])

    return (
        <AssistantContext.Provider value={{ suggestions, setSuggestions, clearSuggestions }}>
            {children}
        </AssistantContext.Provider>
    )
}

export function useAssistant() {
    const context = useContext(AssistantContext)
    if (context === undefined) {
        throw new Error("useAssistant must be used within an AssistantProvider")
    }
    return context
}
