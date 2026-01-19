import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function InmobiliariaDashboard() {
  return (
    <DashboardLayout sector="inmobiliaria" title="Dashboard Inmobiliaria">
      <DashboardContent sector="inmobiliaria" />
    </DashboardLayout>
  )
}