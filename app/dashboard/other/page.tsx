import { KPICard } from "./components/KPICard"
import { RevenueChart } from "./components/RevenueChart"
import { FunnelChart } from "./components/FunnelChart"
import { ActivityFeed } from "./components/ActivityFeed"
import { QuickActions } from "./components/QuickActions"
import { SystemStatus } from "./components/SystemStatus"
import { AIInsights } from "./components/AIInsights"

export default function OtherDashboard() {
  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Métricas Principales</h2>
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-6
          gap-6
        ">
        <KPICard
          title="Ingresos"
          value="€24,580"
          change={{ value: 12.5, isPositive: true }}
          icon="💰"
          description="Mes actual"
        />
        <KPICard
          title="Ventas"
          value="347"
          change={{ value: 8.2, isPositive: true }}
          icon="🛒"
          description="Este mes"
        />
        <KPICard
          title="Clientes"
          value="1,284"
          change={{ value: 15.3, isPositive: true }}
          icon="👥"
          description="Total activos"
        />
        <KPICard
          title="Leads"
          value="89"
          change={{ value: -3.1, isPositive: false }}
          icon="🎯"
          description="Esta semana"
        />
        <KPICard
          title="Tareas"
          value="23"
          change={{ value: 5.7, isPositive: true }}
          icon="📋"
          description="Pendientes"
        />
        <KPICard
          title="Bots Activos"
          value="12"
          change={{ value: 25.0, isPositive: true }}
          icon="🤖"
          description="Automatizaciones"
        />
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Análisis de Rendimiento</h2>
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-8
        ">
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <RevenueChart />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <FunnelChart />
          </div>
        </div>
      </section>

      {/* Activity & Insights Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Actividad y Inteligencia</h2>
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-8
        ">
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <ActivityFeed />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <QuickActions />
          </div>
          <div className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-8
          ">
            <SystemStatus />
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-6">Inteligencia Artificial</h2>
        <div className="
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          rounded-2xl
          p-8
        ">
          <AIInsights />
        </div>
      </section>
    </div>
  )
}