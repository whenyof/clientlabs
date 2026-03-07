import { Suspense } from "react"
import { SettingsSidebar } from "@/components/SettingsSidebar"
import { SettingsHeader } from "@/components/SettingsHeader"
import { SettingsContentWrapper } from "@/components/SettingsContentWrapper"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <Suspense fallback={<div className="p-8 text-center text-slate-400">Cargando ajustes...</div>}>
                <SettingsHeader />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <SettingsSidebar />

                    <SettingsContentWrapper>
                        {children}
                    </SettingsContentWrapper>
                </div>
            </Suspense>
        </div>
    )
}
