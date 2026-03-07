"use client"

import React from "react"
import { ConnectCard, ConnectCardProps } from "./ConnectCard"
import { Plus, Globe, MessageCircle, Facebook, MoreHorizontal, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConnectGridProps {
    sources: ConnectCardProps[]
    onConnectWeb?: () => void
}

export function ConnectGrid({ sources, onConnectWeb }: ConnectGridProps) {
    const webSources = sources.filter(s => s.type === "web")
    const whatsappSources = sources.filter(s => s.type === "whatsapp")
    const facebookSources = sources.filter(s => s.type === "facebook")
    const otherSources = sources.filter(s => !["web", "whatsapp", "facebook"].includes(s.type))

    const SectionHeader = ({ title, icon: Icon, count }: { title: string, icon: any, count: number }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow-sm">
                <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide uppercase">
                {title} <span className="ml-1 text-[var(--text-secondary)] opacity-50 font-medium">({count})</span>
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border-subtle)]/50 to-transparent ml-2" />
        </div>
    )

    const EmptyPlaceholderCard = ({ title, type, icon: Icon, description }: { title: string, type: string, icon: any, description: string }) => (
        <div className="group border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)]/10 hover:bg-[var(--bg-secondary)]/20 hover:border-[var(--brand-primary)]/30 transition-all duration-300 min-h-[220px]">
            <div className="p-3 rounded-full bg-white dark:bg-[var(--bg-card)] shadow-md mb-4 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-6 h-6 text-[var(--text-secondary)] opacity-40 group-hover:text-[var(--brand-primary)] group-hover:opacity-100 transition-all" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-[11px] text-[var(--text-secondary)] opacity-60 mb-5 max-w-[150px]">
                {description}
            </p>
            <Button size="sm" className="h-9 px-6 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold rounded-xl shadow-lg shadow-[var(--brand-primary)]/20 active:scale-95 transition-all text-[11px]">
                Conectar {type}
                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
    )

    return (
        <div className="space-y-12">
            {/* WEB SECTION */}
            <section>
                <SectionHeader title="Web Ingestion" icon={Globe} count={webSources.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webSources.map(source => (
                        <ConnectCard key={source.id} {...source} />
                    ))}
                    <div className="group border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)]/10 hover:bg-[var(--bg-secondary)]/20 hover:border-[var(--brand-primary)]/30 transition-all duration-300 min-h-[220px]">
                        <div className="p-3 rounded-full bg-white dark:bg-[var(--bg-card)] shadow-md mb-4 group-hover:scale-110 transition-transform duration-500">
                            <Plus className="w-6 h-6 text-[var(--brand-primary)]" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Nueva Web</h3>
                        <Button
                            onClick={onConnectWeb}
                            variant="outline" size="sm" className="h-9 px-6 border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
                        >
                            Conectar Web
                        </Button>
                    </div>
                </div>
            </section>

            {/* WHATSAPP SECTION */}
            <section>
                <SectionHeader title="WhatsApp Messenger" icon={MessageCircle} count={whatsappSources.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whatsappSources.map(source => (
                        <ConnectCard key={source.id} {...source} />
                    ))}
                    {whatsappSources.length === 0 && (
                        <EmptyPlaceholderCard
                            title="Sin WhatsApp"
                            type="WhatsApp"
                            icon={MessageCircle}
                            description="Captura leads directamente desde tus chats oficiales."
                        />
                    )}
                </div>
            </section>

            {/* FACEBOOK SECTION */}
            <section>
                <SectionHeader title="Facebook & Instagram" icon={Facebook} count={facebookSources.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facebookSources.map(source => (
                        <ConnectCard key={source.id} {...source} />
                    ))}
                    {facebookSources.length === 0 && (
                        <EmptyPlaceholderCard
                            title="Sin Meta Ads"
                            type="Facebook"
                            icon={Facebook}
                            description="Sincroniza tus campañas de Lead Gen en tiempo real."
                        />
                    )}
                </div>
            </section>

            {/* OTHER SECTION */}
            {otherSources.length > 0 && (
                <section>
                    <SectionHeader title="Otros Canales" icon={MoreHorizontal} count={otherSources.length} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherSources.map(source => (
                            <ConnectCard key={source.id} {...source} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
