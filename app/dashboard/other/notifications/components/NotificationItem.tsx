"use client"

import { CheckCircle, AlertTriangle, Info, XCircle, Clock } from "lucide-react"

interface Notification {
  id: number
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  time: string
  read: boolean
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: () => void
}

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  error: XCircle
}

const colorMap = {
  success: "text-green-400 bg-green-500/10 border-green-500/20",
  warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  info: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20"
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = iconMap[notification.type]

  return (
    <div className={`
      p-4 rounded-lg border backdrop-blur-xl transition-all
      ${notification.read
        ? 'bg-gray-800/30 border-gray-700'
        : `bg-gray-900/50 border-gray-800 ${colorMap[notification.type]}`
      }
    `}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          notification.read ? 'bg-gray-700/50' : colorMap[notification.type]
        }`}>
          <Icon className={`w-4 h-4 ${
            notification.read ? 'text-gray-400' : ''
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`font-medium ${
                notification.read ? 'text-gray-300' : 'text-white'
              }`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${
                notification.read ? 'text-gray-400' : 'text-gray-300'
              }`}>
                {notification.message}
              </p>
            </div>

            {!notification.read && (
              <button
                onClick={onMarkAsRead}
                className="ml-4 p-1 text-gray-400 hover:text-purple-400 transition-colors"
                title="Marcar como leída"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">{notification.time}</span>
            {!notification.read && (
              <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}