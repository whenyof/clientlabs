import DashboardLayout from "../DashboardLayout"
import DashboardContent from "../DashboardContent"

export default function RestauranteDashboard() {
  return (
    <DashboardLayout sector="restaurante" title="Dashboard Restaurante">
      <DashboardContent sector="restaurante" />
    </DashboardLayout>
  )
}