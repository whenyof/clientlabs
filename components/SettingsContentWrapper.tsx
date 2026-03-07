"use client"

export function SettingsContentWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="lg:col-span-3 min-h-[400px]">
            {children}
        </div>
    )
}
