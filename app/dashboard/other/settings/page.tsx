import { ProfileForm } from "./components/ProfileForm"
import { TeamMembers } from "./components/TeamMembers"
import { BillingSettings } from "./components/BillingSettings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ajustes</h1>
          <p className="text-gray-400">Configura tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProfileForm />
          <TeamMembers />
        </div>
        <div>
          <BillingSettings />
        </div>
      </div>
    </div>
  )
}