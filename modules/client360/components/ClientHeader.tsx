"use client"

import { useState } from "react"
import { calculateClientScore } from "@/domains/clients/scoring/client-score"
import type { Client360Base } from "../types"
import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"
import { NewOrderModal }    from "../actions/NewOrderModal"
import { NewTaskModal }     from "@/modules/tasks/dashboard/NewTaskModal"
import { EmailModal }       from "../actions/EmailModal"
import { NoteModal }        from "../actions/NoteModal"
import { InteractionModal } from "../actions/InteractionModal"

/* ─── Tokens ─────────────────────────────────────────────── */
const C = {
  bg:"#ffffff", bg2:"#fafafa", ink:"#0a0a0a", ink2:"#404040", ink3:"#737373",
  ink4:"#a3a3a3", ink5:"#d4d4d4", line:"#e8e8e8", line2:"#eeeeee",
  accent:"#16986e", accentSoft:"#ecf6f1", accentInk:"#0d7a56",
  warn:"#c2410c", warnSoft:"#fef3eb", red:"#b91c1c",
} as const

/* ─── Types ──────────────────────────────────────────────── */
type ActiveModal = "order" | "task" | "email" | "note" | "interaction" | null
interface ClientHeaderProps {
  client: Client360Base
  kpis?: ClientFinancialKPIs | null
  lastActivityAt?: string | null
}
interface StatusCfg { label: string; bg: string; color: string; dot: string }

/* ─── Helpers ────────────────────────────────────────────── */
const STATUS_CFG: Record<string, StatusCfg> = {
  ACTIVE:    { label:"Activo",      bg:C.accentSoft, color:C.accentInk, dot:C.accent  },
  VIP:       { label:"VIP",         bg:"#fef9c3",    color:"#854d0e",   dot:"#ca8a04" },
  INACTIVE:  { label:"Inactivo",    bg:C.bg2,        color:C.ink3,      dot:C.ink4    },
  FOLLOW_UP: { label:"Seguimiento", bg:C.warnSoft,   color:C.warn,      dot:C.warn    },
}
const LIFECYCLE = ["Lead","Onboarding","Activo","Recurrente","Fidelizado"]

function getInitials(n: string|null, c: string|null, e: string|null) {
  const s = (n ?? c ?? e ?? "").trim().split(/\s+/)
  return s.length >= 2 ? (s[0][0]+s[1][0]).toUpperCase() : (s[0]?.slice(0,2)??  "?").toUpperCase()
}
const fmtMoney = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits:0 })
const fmtDate  = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-ES",{month:"short",year:"numeric"})
}
function fmtRelative(iso: string|null|undefined): string {
  if (!iso) return "—"
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days===0) return "Hoy"
  if (days===1) return "Ayer"
  if (days<7)  return `Hace ${days} días`
  if (days<30) return `Hace ${Math.floor(days/7)} sem.`
  return new Date(iso).toLocaleDateString("es-ES",{day:"numeric",month:"short"})
}
function lifecycleIndex(status: string) {
  return status==="FOLLOW_UP"?1 : status==="VIP"?4 : 2
}

/* ─── SVG Icons ──────────────────────────────────────────── */
const M = { strokeLinecap:"round" as const, strokeLinejoin:"round" as const, fill:"none", stroke:"currentColor" }
const IconMail  = () => <svg width="13" height="13" viewBox="0 0 24 24" {...M} strokeWidth={1.8} aria-hidden="true"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M22 6l-10 7L2 6"/></svg>
const IconPhone = () => <svg width="13" height="13" viewBox="0 0 24 24" {...M} strokeWidth={1.8} aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z"/></svg>
const IconCart  = () => <svg width="14" height="14" viewBox="0 0 24 24" {...M} strokeWidth={1.7} aria-hidden="true"><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h7.7a2 2 0 002-1.6L23 6H6"/></svg>

/* ─── Component ──────────────────────────────────────────── */
export function ClientHeader({ client, kpis, lastActivityAt }: ClientHeaderProps) {
  const [active, setActive] = useState<ActiveModal>(null)
  const close = () => setActive(null)

  const initials    = getInitials(client.name, client.companyName, client.email)
  const displayName = client.name ?? client.companyName ?? "Sin nombre"
  const orgName     = client.name && client.companyName ? client.companyName : null
  const statusCfg   = STATUS_CFG[client.status] ?? STATUS_CFG["INACTIVE"]
  const ltv         = kpis?.totalRevenue ?? 0
  const lci         = lifecycleIndex(client.status)
  const score       = calculateClientScore({
    totalRevenue: kpis?.totalRevenue ?? 0,
    daysSinceLastActivity: lastActivityAt
      ? Math.floor((Date.now()-new Date(lastActivityAt).getTime())/86400000) : null,
    yearsAsCustomer: (Date.now()-new Date(client.createdAt).getTime())/(86400000*365),
  })
  const scoreColor = score>=75 ? C.accentInk : score>=45 ? C.warn : C.red

  /* ── hover handlers ─── */
  const lnkIn  = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color=C.ink; e.currentTarget.style.borderBottomColor=C.ink3 }
  const lnkOut = (e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color=C.ink2; e.currentTarget.style.borderBottomColor="transparent" }
  const gbIn   = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background="white"; e.currentTarget.style.color=C.ink; e.currentTarget.style.boxShadow=`inset 0 0 0 1px ${C.line},0 1px 2px rgba(0,0,0,.03)` }
  const gbOut  = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.ink2; e.currentTarget.style.boxShadow="none" }

  /* ── shared pill style ─── */
  const pill = (bg:string, color:string): React.CSSProperties => ({
    display:"inline-flex", alignItems:"center", gap:5, padding:"2px 8px",
    borderRadius:99, fontSize:11, fontWeight:500, background:bg, color,
    border:"1px solid transparent", whiteSpace:"nowrap",
  })

  return (
    <>
      <div style={{ background:C.bg, border:`1px solid ${C.line}`, borderRadius:12, overflow:"hidden" }}>

        {/* ── Top ─── */}
        <div style={{ padding:"20px 22px 18px", display:"flex", alignItems:"flex-start", gap:16 }}>

          {/* Avatar */}
          <div style={{ width:52, height:52, borderRadius:10, background:C.accentSoft, color:C.accentInk, display:"grid", placeItems:"center", fontFamily:"var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif", fontWeight:700, fontSize:19, letterSpacing:"-0.02em", flexShrink:0, boxShadow:"inset 0 0 0 1px rgba(13,122,86,0.08)" }}>
            {initials}
          </div>

          {/* Identity */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:6 }}>
            <h1 style={{ fontFamily:"var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif", fontWeight:600, letterSpacing:"-0.022em", fontSize:22, lineHeight:1.15, margin:0, color:C.ink }}>
              {displayName}
              {orgName && <span style={{ color:C.ink3, fontWeight:500, fontSize:14, letterSpacing:"-0.005em", marginLeft:6, whiteSpace:"nowrap" }}>· {orgName}</span>}
            </h1>

            {/* Contact links */}
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", fontSize:12.5, color:C.ink3 }}>
              {client.email && (
                <a href={`mailto:${client.email}`} style={{ display:"inline-flex", alignItems:"center", gap:6, color:C.ink2, borderBottom:"1px solid transparent", paddingBottom:1, textDecoration:"none", transition:"border-color .12s ease,color .12s ease" }} onMouseEnter={lnkIn} onMouseLeave={lnkOut}>
                  <span style={{ color:C.ink4 }}><IconMail /></span><span>{client.email}</span>
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone.replace(/\s/g,"")}`} style={{ display:"inline-flex", alignItems:"center", gap:6, color:C.ink2, borderBottom:"1px solid transparent", paddingBottom:1, textDecoration:"none", transition:"border-color .12s ease,color .12s ease" }} onMouseEnter={lnkIn} onMouseLeave={lnkOut}>
                  <span style={{ color:C.ink4 }}><IconPhone /></span><span>{client.phone}</span>
                </a>
              )}
            </div>

            {/* Pills */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap" }}>
              <span style={pill(statusCfg.bg, statusCfg.color)}>
                <span style={{ width:5, height:5, borderRadius:99, background:statusCfg.dot, display:"inline-block" }} />
                {statusCfg.label}
              </span>
              {ltv>0 && <span style={pill(C.bg2, C.ink2)}>LTV {fmtMoney(ltv)} €</span>}
              <span style={{ ...pill(C.bg2, scoreColor), fontVariantNumeric:"tabular-nums" }}>Score {score}/100</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
            {/* Pill group */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:3, background:C.bg2, border:`1px solid ${C.line}`, borderRadius:8 }}>
              {(["email","nota","interacción","tarea"] as const).map((lbl,i) => {
                const ids = ["email","note","interaction","task"] as const
                return (
                  <button key={lbl} type="button" onClick={() => setActive(ids[i])}
                    style={{ padding:"5px 10px", fontSize:12, fontWeight:500, background:"transparent", border:0, color:C.ink2, borderRadius:5, cursor:"pointer", transition:"background .12s ease,color .12s ease,box-shadow .12s ease", fontFamily:"inherit", textTransform:"capitalize" }}
                    onMouseEnter={gbIn} onMouseLeave={gbOut}>
                    {lbl.charAt(0).toUpperCase()+lbl.slice(1)}
                  </button>
                )
              })}
            </div>
            {/* Primary */}
            <button type="button" onClick={() => setActive("order")}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:6, background:C.accent, color:"white", fontSize:12.5, fontWeight:550, letterSpacing:"-0.005em", border:0, cursor:"pointer", transition:"background .12s ease", fontFamily:"inherit" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=C.accentInk }}
              onMouseLeave={e=>{ e.currentTarget.style.background=C.accent }}>
              <IconCart />Nuevo pedido
            </button>
          </div>
        </div>

        {/* ── Meta strip ─── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderTop:`1px solid ${C.line2}`, background:C.bg2 }}>
          {([
            { lbl:"Cliente desde", val:fmtDate(client.createdAt),            mono:false },
            { lbl:"LTV",           val:ltv>0?`${fmtMoney(ltv)} €`:"—",       mono:true  },
            { lbl:"Última actividad", val:fmtRelative(lastActivityAt),        mono:false },
            { lbl:"Estado",        val:statusCfg.label,                       mono:false },
          ] as const).map(({ lbl, val, mono }, i) => (
            <div key={i} style={{ padding:"12px 22px", borderRight:i<3?`1px solid ${C.line2}`:undefined, display:"flex", flexDirection:"column", gap:4 }}>
              <span style={{ fontFamily:"var(--font-geist-mono,ui-monospace,monospace)", fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:C.ink4, fontWeight:500 }}>{lbl}</span>
              <span style={{ fontSize:12.5, fontWeight:550, color:C.ink, letterSpacing:"-0.003em", fontFamily:mono?"var(--font-geist-mono,ui-monospace,monospace)":"inherit" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* ── Lifecycle bar ─── */}
        <div style={{ display:"flex", alignItems:"center", padding:"10px 22px", borderTop:`1px solid ${C.line2}`, background:C.bg }}>
          {LIFECYCLE.map((nm, i) => {
            const done = i < lci, on = i === lci
            return (
              <div key={nm} style={{ display:"flex", alignItems:"center", flex:1 }}>
                {i>0 && <div style={{ width:14, height:1, background:C.ink5, flexShrink:0 }} />}
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 10px", fontFamily:"var(--font-geist-mono,ui-monospace,monospace)", fontSize:10.5, color:on?C.accentInk:done?C.ink2:C.ink4, fontWeight:on?600:450, background:on?C.accentSoft:"transparent", borderRadius:on?5:0, whiteSpace:"nowrap" }}>
                  <span style={{ width:6, height:6, borderRadius:99, background:on?C.accent:done?C.ink:"white", border:`1.5px solid ${on?C.accent:done?C.ink:C.ink5}`, display:"inline-block", flexShrink:0 }} />
                  {nm}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Modals ─── */}
      <NewOrderModal    open={active==="order"}       onClose={close} clientId={client.id} />
      <NewTaskModal     open={active==="task"}        onClose={close} defaultEntityType="CLIENT" defaultEntityId={client.id} />
      <EmailModal       open={active==="email"}       onClose={close} clientId={client.id} defaultTo={client.email} />
      <NoteModal        open={active==="note"}        onClose={close} clientId={client.id} />
      <InteractionModal open={active==="interaction"} onClose={close} clientId={client.id} />
    </>
  )
}
