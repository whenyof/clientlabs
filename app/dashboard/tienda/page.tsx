import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function TiendaDashboard() {
  return (
    <DashboardLayout sector="tienda" title="Dashboard Tienda">
      <DashboardContent sector="tienda" />
    </DashboardLayout>
  )
}