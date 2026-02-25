"use client";

import React, { useMemo } from "react";

interface FunnelDiagnosisProps {
 leads: number;
 sales: number;
 invoices: number;
 collected: number;
 avgTicket: number;
}

export function FunnelDiagnosisCard({ leads, sales, invoices, collected, avgTicket }: FunnelDiagnosisProps) {
 const analysis = useMemo(() => {
 const dropLeadSale = leads > 0 ? 1 - sales / leads : 0;
 const dropSaleInvoice = sales > 0 ? 1 - invoices / sales : 0;
 const dropInvoiceCollected = invoices > 0 ? 1 - collected / invoices : 0;

 const stageDrops = [
 { label: "Prospecto → Venta", drop: dropLeadSale, key: "lead-sale" },
 { label: "Venta → Factura", drop: dropSaleInvoice, key: "sale-invoice" },
 { label: "Factura → Cobro", drop: dropInvoiceCollected, key: "invoice-collected" },
 ];

 const bottleneck = [...stageDrops].sort((a, b) => b.drop - a.drop)[0];

 const improvement = 0.10;
 let impactRevenue = 0;

 if (bottleneck.key === "lead-sale") {
 impactRevenue = leads * improvement * (sales / leads || 0) * avgTicket;
 } else if (bottleneck.key === "sale-invoice") {
 impactRevenue = sales * improvement * (invoices / sales || 0) * avgTicket;
 } else if (bottleneck.key === "invoice-collected") {
 impactRevenue = invoices * improvement * (collected / invoices || 0) * avgTicket;
 }

 return {
 bottleneck,
 impactRevenue,
 };
 }, [leads, sales, invoices, collected, avgTicket]);

 return (
 <div className="p-8 rounded-[16px] border border-white/[0.05] bg-[var(--bg-card)]/[0.02] flex flex-col justify-between h-full min-h-[220px]">
 <div className="space-y-6">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block">Cuello de Botella</span>

 <div className="space-y-4">
 <div className="space-y-1">
 <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase">Punto Crítico</span>
 <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight uppercase overflow-hidden text-ellipsis whitespace-nowrap">
 {analysis.bottleneck.label}
 </div>
 </div>

 <div className="space-y-1">
 <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase">Pérdida Actual</span>
 <div className="text-2xl font-bold text-[var(--critical)] tabular-nums">
 {(analysis.bottleneck.drop * 100).toFixed(1)}%
 </div>
 </div>
 </div>
 </div>

 <div className="mt-6 pt-6 border-t border-white/[0.03] flex items-center justify-between">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Recuperación</span>
 <span className="text-xl font-bold text-[var(--accent)] tabular-nums">
 +€{analysis.impactRevenue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </span>
 </div>
 </div>
 );
}
