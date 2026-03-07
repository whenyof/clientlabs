"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

const LazyComposedChart = dynamic(
  () => import("recharts").then((mod) => mod.ComposedChart),
  { ssr: false }
);

/* ── Types ───────────────────────────────────────────── */
type RevenueChartProps = {
  data?: { month: string; revenue: number }[];
  monthlyRevenueTarget?: number;
};

type DailyPoint = { day: number; revenue: number };

/* ── Currency formatter ──────────────────────────────── */
const eurFmt = (v: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);

/* ── Projection engine ───────────────────────────────── */
function computeRobustProjection(
  dailyData: DailyPoint[],
  currentDay: number,
  daysInMonth: number
) {
  if (dailyData.length === 0 || currentDay === 0)
    return { projectedRevenue: 0, robustAverage: 0, activityRate: 0 };

  const amounts = dailyData.map((d, i) =>
    i === 0 ? d.revenue : d.revenue - dailyData[i - 1].revenue
  );
  const activeDays = amounts.filter((v) => v > 0);
  if (activeDays.length === 0)
    return { projectedRevenue: 0, robustAverage: 0, activityRate: 0 };

  const mean = activeDays.reduce((a, b) => a + b, 0) / activeDays.length;
  const std = Math.sqrt(
    activeDays.reduce((a, b) => a + (b - mean) ** 2, 0) / activeDays.length
  );
  let filtered = activeDays.filter((v) => v <= mean + 2 * std);
  if (!filtered.length) filtered = activeDays;
  const robustAverage =
    filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const activityRate = activeDays.length / Math.max(currentDay, 1);
  const projectedRevenue = Math.round(
    robustAverage * activityRate * daysInMonth
  );

  return { projectedRevenue, robustAverage, activityRate };
}

/* ── Tooltips — light, clean ─────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload.find((p: any) => p.dataKey === "revenue");
  if (!entry || entry.value === null) return null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        padding: "8px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: 12, color: "#5B7280", margin: 0, marginBottom: 3 }}>
        Día {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1F2A", margin: 0 }}>
        {eurFmt(entry.value)}
      </p>
    </div>
  );
};

const MonthlyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        padding: "8px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: 12, color: "#5B7280", margin: 0, marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1F2A", margin: 0 }}>
        {eurFmt(payload[0].value)}
      </p>
    </div>
  );
};

/* ── Y-axis helper ───────────────────────────────────── */
function computeYAxis(maxVal: number) {
  let step: number;
  if (maxVal <= 20000) step = 5000;
  else if (maxVal <= 100000) step = 10000;
  else if (maxVal <= 500000) step = 50000;
  else step = 100000;
  const upper = maxVal > 0 ? Math.ceil(maxVal / step) * step : step * 2;
  const ticks: number[] = [];
  for (let i = 0; i <= upper; i += step) ticks.push(i);
  return { upper, ticks };
}

/* ── Main Component ──────────────────────────────────── */
export function RevenueChart({
  data,
  monthlyRevenueTarget = 0,
}: RevenueChartProps) {
  const MONTHLY_TARGET = monthlyRevenueTarget;
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"monthly" | "current">("current");
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/current-month")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: DailyPoint[]) => setDailyData(Array.isArray(d) ? d : []))
      .catch(() => setDailyData([]));
  }, []);

  /* ── Time ────────────────────────────────────────── */
  const now = useMemo(() => new Date(), []);
  const currentDayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  /* ── Pace metrics ────────────────────────────────── */
  const paceMetrics = useMemo(() => {
    const todayRevenue =
      dailyData.find((d) => d.day === currentDayOfMonth)?.revenue ?? 0;
    const { projectedRevenue, robustAverage } = computeRobustProjection(
      dailyData,
      currentDayOfMonth,
      daysInMonth
    );

    const expectedByToday =
      MONTHLY_TARGET > 0
        ? Math.round((MONTHLY_TARGET / daysInMonth) * currentDayOfMonth)
        : 0;
    const deltaVsExpected = todayRevenue - expectedByToday;
    const progressPct =
      MONTHLY_TARGET > 0 ? (todayRevenue / MONTHLY_TARGET) * 100 : 0;

    // Active days & ticket
    const amounts = dailyData.map((d, i) =>
      i === 0 ? d.revenue : d.revenue - dailyData[i - 1].revenue
    );
    const activeDaysCount = amounts.filter((v) => v > 0).length;
    const averageTicket =
      activeDaysCount > 0 ? Math.round(todayRevenue / activeDaysCount) : 0;

    // Required daily rate
    const remaining = Math.max(0, MONTHLY_TARGET - todayRevenue);
    const daysLeft = Math.max(1, daysInMonth - currentDayOfMonth);
    const requiredDailyRate = Math.round(remaining / daysLeft);

    // Best day
    let bestDayAmount = 0;
    let bestDayNum = 0;
    amounts.forEach((a, i) => {
      if (a > bestDayAmount) {
        bestDayAmount = a;
        bestDayNum = i + 1;
      }
    });

    return {
      todayRevenue,
      projectedRevenue,
      robustAverage: Math.round(robustAverage),
      expectedByToday,
      deltaVsExpected,
      progressPct: Math.min(progressPct, 100),
      hasTarget: MONTHLY_TARGET > 0,
      remaining,
      activeDaysCount,
      averageTicket,
      requiredDailyRate,
      daysLeft,
      bestDayAmount: Math.round(bestDayAmount),
      bestDayNum,
    };
  }, [dailyData, currentDayOfMonth, daysInMonth, MONTHLY_TARGET]);

  /* ── Previous month comparison ───────────────────── */
  const prevMonthRevenue = useMemo(() => {
    if (!data || data.length < 2) return 0;
    return data[data.length - 2]?.revenue ?? 0;
  }, [data]);

  const vsLastMonth = useMemo(() => {
    if (prevMonthRevenue === 0 && paceMetrics.todayRevenue > 0) return 100;
    if (prevMonthRevenue > 0)
      return (
        ((paceMetrics.todayRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      );
    return 0;
  }, [paceMetrics.todayRevenue, prevMonthRevenue]);

  /* ── Chart data ──────────────────────────────────── */
  const monthlyChartData = useMemo(
    () =>
      data && data.length > 0
        ? data
        : [
          { month: "Ene", revenue: 0 },
          { month: "Feb", revenue: 0 },
          { month: "Mar", revenue: 0 },
          { month: "Abr", revenue: 0 },
          { month: "May", revenue: 0 },
          { month: "Jun", revenue: 0 },
        ],
    [data]
  );

  const cumulativeChartData = useMemo(() => {
    const points: { label: string; revenue: number | null }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const apiPoint = dailyData.find((p) => p.day === d);
      const isFuture = d > currentDayOfMonth;
      points.push({
        label: `${d}`,
        revenue: isFuture ? null : (apiPoint?.revenue ?? 0),
      });
    }
    return points;
  }, [dailyData, daysInMonth, currentDayOfMonth]);

  /* ── Chart container sizing ──────────────────────── */
  const [chartWidth, setChartWidth] = useState(1000);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) setChartWidth(containerRef.current.offsetWidth);
    const onResize = () => {
      if (containerRef.current) setChartWidth(containerRef.current.offsetWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Y-axis ──────────────────────────────────────── */
  const monthlyYAxis = useMemo(() => {
    const max = Math.max(...monthlyChartData.map((d) => d.revenue), 0);
    return computeYAxis(max);
  }, [monthlyChartData]);

  const currentYAxis = useMemo(() => {
    const maxRev = Math.max(
      ...cumulativeChartData.map((d) => d.revenue ?? 0),
      0
    );
    const effective =
      MONTHLY_TARGET > 0 ? Math.max(maxRev, MONTHLY_TARGET) : maxRev;
    return computeYAxis(effective);
  }, [cumulativeChartData, MONTHLY_TARGET]);

  /* ── Metric card data ────────────────────────────── */
  const cardData = useMemo(
    () => [
      {
        label: "Días con venta",
        value: `${paceMetrics.activeDaysCount} / ${daysInMonth}`,
      },
      {
        label: "Ticket medio",
        value: eurFmt(paceMetrics.averageTicket),
      },
      {
        label: "Proyección actual",
        value: eurFmt(paceMetrics.projectedRevenue),
      },
      {
        label: "Vs mes anterior",
        value:
          paceMetrics.todayRevenue === 0 && prevMonthRevenue === 0
            ? "—"
            : `${vsLastMonth >= 0 ? "+" : ""}${vsLastMonth.toFixed(0)}%`,
        color: vsLastMonth >= 0 ? "#1FA97A" : "#C95656",
      },
    ],
    [paceMetrics, daysInMonth, prevMonthRevenue, vsLastMonth]
  );

  /* ── Advanced analysis data ──────────────────────── */
  const advancedData = useMemo(
    () => [
      {
        label: "Media diaria real",
        value: eurFmt(paceMetrics.robustAverage),
      },
      {
        label: "Ingreso estimado según tendencia",
        value: eurFmt(paceMetrics.projectedRevenue),
      },
      {
        label: "Días restantes",
        value: `${paceMetrics.daysLeft}`,
      },
      {
        label: "Mejor día del mes",
        value:
          paceMetrics.bestDayNum > 0
            ? `Día ${paceMetrics.bestDayNum} · ${eurFmt(paceMetrics.bestDayAmount)}`
            : "—",
      },
    ],
    [paceMetrics]
  );

  const progressPercentage = paceMetrics.progressPct;
  const remainingToTarget = paceMetrics.remaining;

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col" style={{ gap: 28 }}>

      {/* ── HEADER ───────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#5B7280",
              letterSpacing: "0.01em",
              margin: 0,
            }}
          >
            {viewMode === "current"
              ? "Rendimiento del mes"
              : "Ingresos históricos"}
          </p>

          {/* Toggle */}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "#F1F5F9",
              borderRadius: 8,
              padding: 2,
            }}
          >
            <button
              onClick={() => setViewMode("current")}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  viewMode === "current" ? "#FFFFFF" : "transparent",
                color:
                  viewMode === "current" ? "#0B1F2A" : "#5B7280",
                boxShadow:
                  viewMode === "current"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              Mes actual
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  viewMode === "monthly" ? "#FFFFFF" : "transparent",
                color:
                  viewMode === "monthly" ? "#0B1F2A" : "#5B7280",
                boxShadow:
                  viewMode === "monthly"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              Últimos 6 meses
            </button>
          </div>
        </div>

        {/* Current view — dominant number + context */}
        {viewMode === "current" ? (
          <>
            <p
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#0B1F2A",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {eurFmt(paceMetrics.todayRevenue)}
            </p>

            {paceMetrics.hasTarget && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 6 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "#1FA97A",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {progressPercentage.toFixed(0)}% del objetivo mensual
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: paceMetrics.deltaVsExpected >= 0 ? "#1FA97A" : "#C95656",
                    margin: 0,
                  }}
                >
                  {paceMetrics.deltaVsExpected >= 0 ? "+" : ""}
                  {eurFmt(paceMetrics.deltaVsExpected)} vs ritmo esperado
                </p>
              </div>
            )}

            {!paceMetrics.hasTarget && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "8px 14px",
                }}
              >
                <span style={{ fontSize: 13, color: "#5B7280" }}>
                  Sin objetivo mensual definido
                </span>
                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/finance?view=income#monthly-target"
                    )
                  }
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1FA97A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Establecer objetivo
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#0B1F2A",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {eurFmt(paceMetrics.todayRevenue)}
            </p>
            {vsLastMonth !== 0 && (
              <p
                style={{
                  fontSize: 13,
                  color: vsLastMonth >= 0 ? "#1FA97A" : "#C95656",
                  margin: "6px 0 0 0",
                  fontWeight: 500,
                }}
              >
                {vsLastMonth >= 0 ? "+" : ""}
                {vsLastMonth.toFixed(1)}% vs mes anterior
              </p>
            )}
          </>
        )}
      </div>

      {/* ── PROGRESS BAR ─────────────────────────────── */}
      {MONTHLY_TARGET > 0 && viewMode === "current" && (
        <div>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "#E2E8F0",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: "100%",
                background: "#1FA97A",
                borderRadius: 4,
                transition: "width 0.7s ease-out",
              }}
            />
          </div>
          {remainingToTarget > 0 && (
            <p
              style={{
                fontSize: 13,
                color: "#5B7280",
                margin: "8px 0 0 0",
                fontWeight: 400,
              }}
            >
              Faltan {eurFmt(remainingToTarget)}
            </p>
          )}
        </div>
      )}

      {/* ── CHART ────────────────────────────────────── */}
      <div ref={containerRef} style={{ width: "100%", minHeight: 360 }}>
        {viewMode === "monthly" ? (
          <LazyComposedChart
            width={chartWidth}
            height={380}
            data={monthlyChartData}
            margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
          >
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#5B7280"
              tick={{ fontSize: 11, fill: "#5B7280" }}
              tickLine={false}
              axisLine={false}
              dy={8}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={[0, monthlyYAxis.upper]}
              ticks={monthlyYAxis.ticks}
              stroke="#5B7280"
              tick={{ fontSize: 11, fill: "#5B7280" }}
              width={70}
              tickFormatter={eurFmt}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              content={<MonthlyTooltip />}
              cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1FA97A"
              strokeWidth={2.5}
              fill="#1FA97A"
              fillOpacity={0.07}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "#1FA97A",
                strokeWidth: 2,
                fill: "#FFFFFF",
              }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LazyComposedChart>
        ) : (
          <LazyComposedChart
            width={chartWidth}
            height={380}
            data={cumulativeChartData}
            margin={{ top: 10, right: 10, left: 5, bottom: 0 }}
          >
            <CartesianGrid stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#5B7280"
              tick={{ fontSize: 11, fill: "#5B7280" }}
              tickLine={false}
              axisLine={false}
              dy={8}
              interval={Math.max(Math.floor(daysInMonth / 10) - 1, 0)}
              padding={{ left: 5, right: 5 }}
            />
            <YAxis
              domain={[0, currentYAxis.upper]}
              ticks={currentYAxis.ticks}
              stroke="#5B7280"
              tick={{ fontSize: 11, fill: "#5B7280" }}
              width={70}
              tickFormatter={eurFmt}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
            />

            {/* Horizontal target line — subtle */}
            {MONTHLY_TARGET > 0 && (
              <ReferenceLine
                y={MONTHLY_TARGET}
                stroke="rgba(91,114,128,0.25)"
                strokeWidth={1}
              />
            )}

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1FA97A"
              strokeWidth={2.5}
              fill="#1FA97A"
              fillOpacity={0.07}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "#1FA97A",
                strokeWidth: 2,
                fill: "#FFFFFF",
              }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              connectNulls={false}
            />
          </LazyComposedChart>
        )}
      </div>

      {/* ── SECONDARY METRICS (4 cards) ──────────────── */}
      {viewMode === "current" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {cardData.map((card) => (
            <div
              key={card.label}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#5B7280",
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: (card as any).color || "#0B1F2A",
                  margin: 0,
                }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── ADVANCED ANALYSIS (collapsible) ──────────── */}
      {viewMode === "current" && paceMetrics.hasTarget && (
        <div>
          <button
            onClick={() => setShowAdvanced((p) => !p)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#5B7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Ver análisis avanzado{" "}
            <span
              style={{
                transition: "transform 0.2s",
                display: "inline-block",
                transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▾
            </span>
          </button>

          {showAdvanced && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginTop: 14,
              }}
            >
              {advancedData.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "16px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#5B7280",
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#0B1F2A",
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RevenueChart;