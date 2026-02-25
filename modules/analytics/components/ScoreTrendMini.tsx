"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreTrendMiniProps {
 history: number[];
 current: number;
 previous: number;
}

export function ScoreTrendMini({ history, current, previous }: ScoreTrendMiniProps) {
 const delta = current - previous;
 const isPositive = delta > 0;
 const isNegative = delta < 0;

 // SVG Sparkline constants
 const width = 100;
 const height = 40;
 const padding = 4;

 const min = Math.min(...history, 0);
 const max = Math.max(...history, 100);
 const range = max - min || 1;

 const points = history
 .map((val, i) => {
 const x = (i / (history.length - 1)) * width;
 const y = height - padding - ((val - min) / range) * (height - 2 * padding);
 return `${x},${y}`;
 })
 .join(" ");

 return (
 <div className="flex items-center gap-4 py-2">
 <div className="flex flex-col">
 <div className={`flex items-center gap-1 text-sm font-black ${isPositive ? "text-[var(--accent)]" : isNegative ? "text-[var(--critical)]" : "text-[var(--text-secondary)]"
 }`}>
 {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
 {Math.abs(delta).toFixed(1)}%
 </div>
 <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">vs prev</span>
 </div>

 <div className="h-10 w-24">
 <svg
 viewBox={`0 0 ${width} ${height}`}
 className="h-full w-full overflow-visible"
 preserveAspectRatio="none"
 >
 <polyline
 fill="none"
 stroke={isPositive ? "#10b981" : isNegative ? "#ef4444" : "#94a3b8"}
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 points={points}
 className="opacity-50"
 />
 </svg>
 </div>
 </div>
 );
}
