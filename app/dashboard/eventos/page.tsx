import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function EventosDashboard() {
  return (
    <DashboardLayout sector="eventos" title="Dashboard Eventos">
      <DashboardContent sector="eventos" />
    </DashboardLayout>
  )
}