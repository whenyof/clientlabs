"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings2, Lock, CheckCircle2, Flame, Tag, BarChart3, Shield, Zap, ChevronRight } from "lucide-react"

type RuleCategory = "normalization" | "duplicates" | "temperature" | "tags" | "score" | "validation" | "automations"

type Rule = {
    id: string
    category: RuleCategory
    enabled: boolean
    priority: number
    condition: string
    actions: string[]
}

const defaultRules: Rule[] = [
    {
        id: "norm-1",
        category: "normalization",
        enabled: true,
        priority: 1,
        condition: "Siempre",
        actions: ["Capitalizar nombres", "Lowercase emails", "Normalizar teléfonos"]
    },
    {
        id: "dup-1",
        category: "duplicates",
        enabled: true,
        priority: 2,
        condition: "Email ya existe",
        actions: ["Saltar importación"]
    },
    {
        id: "temp-1",
        category: "temperature",
        enabled: true,
        priority: 3,
        condition: 'Message contiene "demo"',
        actions: ["temperature = HOT", "add tag: high-intent"]
    },
    {
        id: "temp-2",
        category: "temperature",
        enabled: true,
        priority: 4,
        condition: "Email corporativo",
        actions: ["temperature = WARM", "add tag: warm-lead"]
    },
    {
        id: "tag-1",
        category: "tags",
        enabled: true,
        priority: 5,
        condition: "Dominio gmail/outlook/yahoo",
        actions: ["add tag: personal-email"]
    },
    {
        id: "tag-2",
        category: "tags",
        enabled: true,
        priority: 6,
        condition: "Dominio empresarial",
        actions: ["add tag: business-email"]
    },
    {
        id: "score-1",
        category: "score",
        enabled: true,
        priority: 7,
        condition: "temperature = HOT",
        actions: ["score = 50"]
    },
    {
        id: "val-1",
        category: "validation",
        enabled: true,
        priority: 8,
        condition: "Email inválido",
        actions: ["add tag: invalid", "validationStatus = REVIEW"]
    }
]

export function PostImportRulesPanel() {
    const [selectedCategory, setSelectedCategory] = useState<RuleCategory>("temperature")
    const [rules, setRules] = useState<Rule[]>(defaultRules)

    const categories = [
        { id: "normalization" as const, icon: Lock, label: "Normalización", locked: true },
        { id: "duplicates" as const, icon: CheckCircle2, label: "Duplicados" },
        { id: "temperature" as const, icon: Flame, label: "Temperatura" },
        { id: "tags" as const, icon: Tag, label: "Tags Automáticos" },
        { id: "score" as const, icon: BarChart3, label: "Score Inicial" },
        { id: "validation" as const, icon: Shield, label: "Validación" },
        { id: "automations" as const, icon: Zap, label: "Automatizaciones", disabled: true }
    ]

    const filteredRules = rules.filter(r => r.category === selectedCategory)
    const affectedLeads = filteredRules.filter(r => r.enabled).length * 3 // Mock

    const toggleRule = (ruleId: string) => {
        setRules(prev => prev.map(r =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
        ))
    }

    return (
        <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Reglas Post-Import</h2>
                    <span className="ml-auto px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {rules.filter(r => r.enabled).length} activas
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-[250px_1fr_300px] divide-x divide-white/10">
                {/* Column 1: Categories */}
                <div className="p-4 space-y-1">
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        const isSelected = selectedCategory === cat.id
                        const isDisabled = cat.disabled || cat.locked

                        return (
                            <button
                                key={cat.id}
                                onClick={() => !isDisabled && setSelectedCategory(cat.id)}
                                disabled={isDisabled}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isSelected
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : isDisabled
                                            ? 'text-white/30 cursor-not-allowed'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="flex-1 text-left">{cat.label}</span>
                                {cat.locked && <Lock className="h-3 w-3" />}
                                {cat.disabled && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">
                                        Soon
                                    </span>
                                )}
                                {isSelected && <ChevronRight className="h-4 w-4" />}
                            </button>
                        )
                    })}
                </div>

                {/* Column 2: Rules */}
                <div className="p-4 space-y-3">
                    {selectedCategory === "automations" ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Zap className="h-12 w-12 text-white/20 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Automatizaciones</h3>
                            <p className="text-sm text-white/60 max-w-md">
                                Próximamente podrás configurar acciones automáticas como enviar emails, crear tareas, o asignar vendedores.
                            </p>
                            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 max-w-md">
                                <p className="text-xs text-purple-300 mb-2">Ejemplos futuros:</p>
                                <ul className="text-xs text-white/60 space-y-1 text-left">
                                    <li>• Lead HOT → Enviar email de bienvenida</li>
                                    <li>• Lead importado → Crear tarea de seguimiento</li>
                                    <li>• Lead sin respuesta 7 días → Re-engagement</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-white/80">
                                    {categories.find(c => c.id === selectedCategory)?.label}
                                </h3>
                                {selectedCategory === "normalization" && (
                                    <span className="text-xs text-white/40 flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        Siempre activa
                                    </span>
                                )}
                            </div>

                            {filteredRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className={`p-4 rounded-lg border transition-all ${rule.enabled
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-white/[0.02] border-white/5 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => toggleRule(rule.id)}
                                            disabled={selectedCategory === "normalization"}
                                            className={`mt-0.5 h-5 w-5 rounded border-2 transition-all ${rule.enabled
                                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                    : 'border-white/20'
                                                } ${selectedCategory === "normalization" ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {rule.enabled && <CheckCircle2 className="h-4 w-4" />}
                                        </button>

                                        <div className="flex-1 space-y-2">
                                            <div className="text-sm">
                                                <span className="text-white/60">SI</span>{" "}
                                                <span className="text-white font-medium">{rule.condition}</span>
                                            </div>
                                            <div className="space-y-1">
                                                {rule.actions.map((action, idx) => (
                                                    <div key={idx} className="text-sm flex items-center gap-2">
                                                        <ChevronRight className="h-3 w-3 text-blue-400" />
                                                        <span className="text-blue-300">{action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <span className="text-xs text-white/40 mt-1">#{rule.priority}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Column 3: Preview */}
                <div className="p-4 bg-white/[0.02]">
                    <h3 className="text-sm font-medium text-white/80 mb-4">Preview</h3>

                    {selectedCategory === "automations" ? (
                        <div className="text-center py-8">
                            <p className="text-xs text-white/40">Sin preview disponible</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <p className="text-xs text-white/60 mb-1">Leads afectados</p>
                                <p className="text-2xl font-bold text-blue-400">{affectedLeads}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-white/60">Antes → Después</p>

                                {selectedCategory === "temperature" && (
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60">juan@empresa.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 line-through">COLD</span>
                                            <ChevronRight className="h-3 w-3 text-white/40" />
                                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">WARM</span>
                                        </div>
                                        <p className="text-white/40 mt-2 text-[10px]">Razón: Email corporativo</p>
                                    </div>
                                )}

                                {selectedCategory === "tags" && (
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60">maria@gmail.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40">Sin tags</span>
                                            <ChevronRight className="h-3 w-3 text-white/40" />
                                            <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 text-[10px]">
                                                personal-email
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {selectedCategory === "duplicates" && (
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/60">pedro@test.com</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Nuevo</span>
                                            <ChevronRight className="h-3 w-3 text-white/40" />
                                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Omitido</span>
                                        </div>
                                        <p className="text-white/40 mt-2 text-[10px]">Ya existe en sistema</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
