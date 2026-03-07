"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

export function SettingsHeader() {
    const { labels } = useSectorConfig()
    const s = labels.settings

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0B1F2A] tracking-tight">{s.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5 max-w-xl">
                {s.pageSubtitle}
            </p>
        </div>
    )
}
