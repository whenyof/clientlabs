import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function ServiciosDashboard() {
  return (
    <DashboardLayout sector="servicios" title="Dashboard Servicios">
      <DashboardContent sector="servicios" />
    </DashboardLayout>
  )
}