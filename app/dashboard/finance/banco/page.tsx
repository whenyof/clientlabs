"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Wifi,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Balance = {
  name: string
  iban: string | null
  amountEuros: number
  currency: string
}

type Tx = {
  id: string
  label: string
  date: string
  amountEuros: number
  currency: string
  status: string
}

function fmt(n: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(n)
}

function fmtDate(d: string) {
  if (!d) return "—"
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d))
}

// ─── Vista conectada ───────────────────────────────────────────────────────────

function ConnectedView({
  balances,
  transactions,
  onReconnect,
}: {
  balances: Balance[]
  transactions: Tx[]
  onReconnect: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1FA97A]/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-[#1FA97A]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Banco conectado</h2>
            <p className="text-[11px] text-slate-400">Sincronizado via Open Banking PSD2 · Tink (Visa)</p>
          </div>
        </div>
        <button
          onClick={onReconnect}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] text-slate-500 hover:border-red-200 hover:text-red-500 transition-colors"
        >
          <Unlink className="h-3.5 w-3.5" />
          Reconectar
        </button>
      </div>

      {/* Saldos */}
      {balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {balances.map((b, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {b.name}
              </p>
              {b.iban && (
                <p className="text-[10px] text-slate-300 mb-2 font-mono">{b.iban}</p>
              )}
              <p className="text-[26px] font-bold text-slate-900 tabular-nums">
                {fmt(b.amountEuros, b.currency)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Movimientos */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">Ultimos movimientos</h3>
          <span className="text-[11px] text-slate-400">{transactions.length} movimientos</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-slate-400">
            No hay movimientos disponibles
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 30).map((tx) => {
              const isPos = tx.amountEuros >= 0
              return (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        isPos ? "bg-emerald-50" : "bg-red-50"
                      )}
                    >
                      {isPos ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate max-w-[280px]">
                        {tx.label}
                      </p>
                      <p className="text-[11px] text-slate-400">{fmtDate(tx.date)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[14px] font-semibold tabular-nums shrink-0 ml-4",
                      isPos ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {isPos ? "+" : ""}
                    {fmt(tx.amountEuros, tx.currency)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vista desconectada ────────────────────────────────────────────────────────

function DisconnectedView({ onConnect, loading }: { onConnect: () => void; loading: boolean }) {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-5">
          <Building2 className="h-7 w-7 text-[#1FA97A]" />
        </div>
        <h1 className="text-[20px] font-bold text-slate-900 mb-2">Conecta tu banco</h1>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-7">
          Importa movimientos automaticamente y concilia facturas sin esfuerzo. Conexion segura
          via Open Banking PSD2.
        </p>

        <button
          onClick={onConnect}
          disabled={loading}
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1FA97A] hover:bg-[#178a64] text-white font-semibold text-[14px] rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Redirigiendo...
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4" />
              Conectar mi banco
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 mt-4">
          Solo lectura · PSD2 · Powered by Tink (Visa)
        </p>

        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg mt-5 text-left">
          <ShieldCheck className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            ClientLabs solo puede leer tus movimientos. Nunca puede mover dinero ni modificar tu
            cuenta. Puedes desconectar en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BancoPage() {
  const [view, setView] = useState<"loading" | "disconnected" | "connected">("loading")
  const [connecting, setConnecting] = useState(false)
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Tx[]>([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get("success")) {
      toast.success("Banco conectado correctamente")
      window.history.replaceState({}, "", "/dashboard/finance/banco")
    } else if (params.get("error")) {
      const code = params.get("error")
      if (code === "cancelled") {
        toast.info("Conexion cancelada")
      } else {
        toast.error("No se pudo conectar el banco")
      }
      window.history.replaceState({}, "", "/dashboard/finance/banco")
    }

    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await fetch("/api/banking/transactions")
      if (!res.ok) {
        setView("disconnected")
        return
      }
      const data = await res.json()
      if (data.error) {
        setView("disconnected")
        return
      }
      setBalances(data.balances ?? [])
      setTransactions(data.transactions ?? [])
      setView("connected")
    } catch {
      setView("disconnected")
    }
  }

  async function handleConnect() {
    setConnecting(true)
    try {
      const res = await fetch("/api/banking/connect", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? "No se pudo iniciar la conexion")
        setConnecting(false)
      }
    } catch {
      toast.error("Error al conectar con el banco")
      setConnecting(false)
    }
  }

  if (view === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-[13px] text-slate-400 animate-pulse">
        Cargando...
      </div>
    )
  }

  if (view === "connected") {
    return (
      <ConnectedView
        balances={balances}
        transactions={transactions}
        onReconnect={handleConnect}
      />
    )
  }

  return <DisconnectedView onConnect={handleConnect} loading={connecting} />
}
