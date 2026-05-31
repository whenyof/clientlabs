"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { AssistantHeader } from "./components/AssistantHeader"
import { AssistantKPIs } from "./components/AssistantKPIs"
import { InsightCards } from "./components/InsightCards"
import { LeadsTable } from "@/modules/leads/components/LeadsTable"
import { PredictionsChart } from "./components/PredictionsChart"
import { RecommendationsFeed } from "./components/RecommendationsFeed"
import { AutomationsPanel } from "./components/AutomationsPanel"
import { AssistantSettings } from "./components/AssistantSettings"
import { AssistantTimeline } from "./components/AssistantTimeline"
import { ChatWindow } from "./components/ChatWindow"
import {
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  CogIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline"

export default function AiAssistantPage() {
  const { labels } = useSectorConfig()
  const t = labels.aiAssistant.tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'leads' | 'predictions' | 'recommendations' | 'automations' | 'settings' | 'timeline' | 'chat'>('overview')

  const tabs = [
    { id: 'overview' as const, label: t.overview, icon: LightBulbIcon },
    { id: 'insights' as const, label: t.insights, icon: SparklesIcon },
    { id: 'leads' as const, label: t.hotLeads, icon: UserGroupIcon },
    { id: 'predictions' as const, label: t.predictions, icon: ChartBarIcon },
    { id: 'recommendations' as const, label: t.recommendations, icon: SparklesIcon },
    { id: 'automations' as const, label: t.automations, icon: CogIcon },
    { id: 'chat' as const, label: t.chat, icon: ChatBubbleLeftRightIcon },
    { id: 'timeline' as const, label: t.timeline, icon: ClockIcon },
    { id: 'settings' as const, label: t.settings, icon: CogIcon }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <AssistantKPIs />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <InsightCards />
              <RecommendationsFeed />
            </div>
            <LeadsTable />
          </div>
        )
      case 'insights':
        return <InsightCards />
      case 'leads':
        return <LeadsTable />
      case 'predictions':
        return <PredictionsChart />
      case 'recommendations':
        return <RecommendationsFeed />
      case 'automations':
        return <AutomationsPanel />
      case 'chat':
        return <ChatWindow />
      case 'settings':
        return <AssistantSettings />
      case 'timeline':
        return <AssistantTimeline />
      default:
        return <AssistantKPIs />
    }
  }

  return (
    <DashboardContainer>
      {/* ── INSTITUTIONAL HEADER ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingBottom: 18, borderBottom: "1px solid #eeeeee", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: "#0a0a0a" }}>Asistente IA</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#737373", flexWrap: "wrap" }}>
            <span>Conectado al workspace</span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#16986e", boxShadow: "0 0 0 3px #ecf6f1", display: "inline-block" }} />
              Modelo: Vega-1 · Pro
            </span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span style={{ fontFamily: "ui-monospace,monospace" }}>238 / 2.000 mensajes este mes</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            Reentrenar contexto
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            Permisos
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#0a0a0a", color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            + Nueva conversación
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #e8e8e8", borderRadius: 10, background: "#ffffff", marginBottom: 20, overflow: "hidden" }}>
        {[
          { l: "Consultas este mes",   v: "238",    sub: "+34% vs mes anterior" },
          { l: "Acciones ejecutadas",  v: "186",    sub: "facturas · tareas · emails" },
          { l: "Tiempo ahorrado",      v: "38h",    sub: "estim. esta semana" },
          { l: "Precisión · valid.",   v: "96,4%",  sub: "basado en feedback ↑↓" },
        ].map((k, i, arr) => (
          <div key={k.l} style={{ padding: "16px 20px", borderRight: i < arr.length - 1 ? "1px solid #eeeeee" : "none" }}>
            <div style={{ fontSize: 11.5, color: "#737373", fontWeight: 500, marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, fontSize: 26, color: "#0a0a0a", letterSpacing: "-0.02em" }}>{k.v}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: "#737373", marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── AI MAIN LAYOUT: threads | chat | context ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", gap: 16, height: 600, fontFamily: "var(--font-geist-sans, ui-sans-serif)" }}>

        {/* LEFT: Thread list */}
        <div style={{ background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #eeeeee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>Conversaciones</h4>
            <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", background: "#ffffff", border: "1px solid #e8e8e8", cursor: "pointer", color: "#737373", fontSize: 16 }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
            {[
              { section: "Sugerencias", threads: [
                { nm: "Resumir reunión con Brownwood", meta: "⌘+J · 1 nueva acción" },
                { nm: "Generar email de cobro · Ibérica", meta: "Plantilla disponible" },
              ]},
              { section: "Hoy", threads: [
                { nm: "¿Qué clientes están en riesgo?", meta: "Hace 4 min · 6 fuentes", active: true },
                { nm: "Borrador factura Hotel Pinsapo", meta: "Hace 1h · borrador listo" },
                { nm: "Resumen ejecutivo semanal", meta: "Hace 2h · exportado PDF" },
              ]},
              { section: "Esta semana", threads: [
                { nm: "Calcular IVA T2 estimado", meta: "Ayer · 13.237 €" },
                { nm: "Tendencia de churn Q2", meta: "Lunes · 1 informe" },
                { nm: "Sugerir upsell para GNR", meta: "Lunes · 3 propuestas" },
              ]},
            ].map(group => (
              <div key={group.section}>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: "#a3a3a3", letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "10px 8px 4px", fontWeight: 500 }}>{group.section}</div>
                {group.threads.map((t) => (
                  <div key={t.nm} style={{ padding: "8px 10px", borderRadius: 7, background: (t as {active?: boolean}).active ? "#ffffff" : "transparent", boxShadow: (t as {active?: boolean}).active ? "0 0 0 1px #e8e8e8 inset, 0 1px 2px rgba(0,0,0,0.04)" : "none", cursor: "pointer", marginBottom: 2 }}>
                    <div style={{ fontSize: 12.5, fontWeight: (t as {active?: boolean}).active ? 600 : 450, color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.nm}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#a3a3a3", marginTop: 2 }}>{t.meta}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Chat area */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #eeeeee", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#ecf6f1", display: "grid", placeItems: "center", color: "#16986e", fontSize: 14, flexShrink: 0 }}>✦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0a0a0a", letterSpacing: "-0.01em" }}>¿Qué clientes están en riesgo?</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#737373", marginTop: 1 }}>Vega-1 · contexto: Clientes · Facturación · CRM · Tareas</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["Compartir", "↓", "⋯"].map(b => (
                <button key={b} style={{ width: 28, height: 28, borderRadius: 5, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", color: "#737373", fontSize: 13 }}>{b}</button>
              ))}
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* User message */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "75%", padding: "10px 14px", background: "#0a0a0a", borderRadius: "12px 12px 2px 12px", color: "white", fontSize: 13, lineHeight: 1.5 }}>
                ¿Qué clientes están en riesgo y cuánto facturación podría perderse? Quiero priorizar las llamadas de esta semana.
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: "#0a0a0a", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>W</div>
            </div>
            {/* AI message */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#ecf6f1", display: "grid", placeItems: "center", color: "#16986e", fontSize: 14, flexShrink: 0 }}>✦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#16986e", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: "#16986e", display: "inline-block" }} />
                  Analizado 248 clientes activos en 1,8 s
                </div>
                <div style={{ background: "#fafafa", border: "1px solid #eeeeee", borderRadius: 10, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, color: "#0a0a0a" }}>
                  <p style={{ margin: "0 0 10px" }}>He cruzado <strong>actividad reciente</strong>, <strong>aging de cobros</strong> y <strong>tareas abiertas</strong>. Hay <strong>16 clientes en riesgo alto</strong> con un total expuesto de <strong>42.180 €</strong>.</p>
                  <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#737373", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Top 5 · acción recomendada</div>
                    {[
                      { nm: "Ibérica Ceramics", sub: "Sin contacto · 47d · vencido 4.280 €", v: "4.280 €", warn: true },
                      { nm: "Lavandería Aérea", sub: "Factura vencida · 14d", v: "2.250 €", warn: true },
                      { nm: "Studio Mar Nord", sub: "Caída facturación -38%", v: "920 €", warn: false },
                      { nm: "Restaurante La Vela", sub: "Presupuesto rechazado", v: "4.620 €", warn: false },
                    ].map(r => (
                      <div key={r.nm} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #f3f3f3" }}>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 550, color: "#0a0a0a" }}>{r.nm}</div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#737373" }}>{r.sub}</div>
                        </div>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: r.warn ? "#b91c1c" : "#c2410c" }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5 }}>¿Quieres que <strong>cree las 5 tareas de llamada</strong> o que <strong>genere un email de recuperación</strong> por cliente?</p>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" as const }}>
                  {["Crear 5 tareas", "Generar emails", "Activar workflow", "Exportar CSV"].map(a => (
                    <button key={a} style={{ padding: "5px 10px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontSize: 11.5, fontWeight: 500, cursor: "pointer" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Composer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #eeeeee" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}>
              <span style={{ padding: "3px 8px", borderRadius: 6, background: "#ecf6f1", color: "#0d7a56", fontSize: 11, cursor: "pointer" }}>✨ ¿Quieres añadir el descuento del 5% por pronto pago?</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea placeholder="Pregunta a Vega-1 algo sobre tus datos…" rows={2} style={{ flex: 1, padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: 8, fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit" }} />
              <button style={{ padding: "10px 14px", borderRadius: 8, background: "#0a0a0a", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Enviar</button>
            </div>
          </div>
        </div>

        {/* RIGHT: Context panel */}
        <div style={{ background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #eeeeee" }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>Contexto activo</h4>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#737373", marginTop: 3 }}>6 fuentes · actualizado hace 4 min</div>
          </div>
          <div style={{ flex: 1, padding: "10px 14px", overflowY: "auto" }}>
            {[
              { l: "Clientes", sub: "248 activos · salud de cartera", color: "#16986e" },
              { l: "Facturación", sub: "142 facturas · 42.180 € pendiente", color: "#0a0a0a" },
              { l: "CRM · Tareas", sub: "87 abiertas · 4 vencidas", color: "#3756a4" },
              { l: "Automatizaciones", sub: "24 activos · 8.420 runs/30d", color: "#6d28d9" },
            ].map(c => (
              <div key={c.l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f3f3f3" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: c.color, display: "inline-block", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 550, color: "#0a0a0a" }}>{c.l}</div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#737373" }}>{c.sub}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #eeeeee" }}>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#a3a3a3", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Capacidades</div>
              {["Analizar datos", "Crear tareas", "Redactar emails", "Generar informes", "Detectar anomalías"].map(cap => (
                <div key={cap} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", fontSize: 12, color: "#404040" }}>
                  <span style={{ color: "#16986e", fontSize: 11 }}>✓</span>{cap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  )
}