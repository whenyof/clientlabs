import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function GimnasioDashboard() {
  return (
    <DashboardLayout sector="gimnasio" title="Dashboard Gimnasio">
      <DashboardContent sector="gimnasio" />
    </DashboardLayout>
  )
}