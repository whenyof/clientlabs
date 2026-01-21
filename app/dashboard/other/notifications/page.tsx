import { NotificationList } from "./components/NotificationList"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
          <p className="text-gray-400">Mantente al día con tu negocio</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <NotificationList />
    </div>
  )
}