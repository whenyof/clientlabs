"use client"

import { useEffect, useState } from "react"

/**
 * Client-safe number formatter
 * Prevents hydration errors by rendering plain number on server
 * and formatted number only after client mount
 */
export function ClientNumber({
    value,
    locale = "es-ES",
    options
}: {
    value: number
    locale?: string
    options?: Intl.NumberFormatOptions
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <>{value}</>
    }

    return <>{value.toLocaleString(locale, options)}</>
}

/**
 * Client-safe date formatter
 * Prevents hydration errors by rendering ISO string on server
 * and formatted date only after client mount
 */
export function ClientDate({
    date,
    locale = "es-ES",
    options
}: {
    date: Date | string
    locale?: string
    options?: Intl.DateTimeFormatOptions
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const dateObj = typeof date === "string" ? new Date(date) : date

    if (!mounted) {
        return <>{dateObj.toISOString()}</>
    }

    return <>{dateObj.toLocaleString(locale, options)}</>
}

/**
 * Hook version for use in non-JSX contexts
 */
export function useClientNumber(value: number, locale = "es-ES", options?: Intl.NumberFormatOptions) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return value.toString()
    }

    return value.toLocaleString(locale, options)
}

/**
 * Hook version for dates
 */
export function useClientDate(date: Date | string, locale = "es-ES", options?: Intl.DateTimeFormatOptions) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const dateObj = typeof date === "string" ? new Date(date) : date

    if (!mounted) {
        return dateObj.toISOString()
    }

    return dateObj.toLocaleString(locale, options)
}
