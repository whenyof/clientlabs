import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function TallerDashboard() {
  return (
    <DashboardLayout sector="taller" title="Dashboard Taller">
      <DashboardContent sector="taller" />
    </DashboardLayout>
  )
}