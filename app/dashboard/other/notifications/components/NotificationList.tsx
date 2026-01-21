"use client"

import { useState } from "react"
import { NotificationItem } from "./NotificationItem"

const NOTIFICATIONS = [
  {
    id: 1,
    type: "success",
    title: "Venta completada",
    message: "La venta de €299 a Empresa ABC se procesó correctamente",
    time: "Hace 5 minutos",
    read: false
  },
  {
    id: 2,
    type: "warning",
    title: "Stock bajo",
    message: "El producto 'Servicio Premium' tiene menos de 10 unidades",
    time: "Hace 1 hora",
    read: false
  },
  {
    id: 3,
    type: "info",
    title: "Nuevo cliente registrado",
    message: "María García se registró desde el formulario web",
    time: "Hace 2 horas",
    read: true
  },
  {
    id: 4,
    type: "error",
    title: "Pago rechazado",
    message: "El pago de la factura INV-003 fue rechazado por fondos insuficientes",
    time: "Hace 4 horas",
    read: true
  },
  {
    id: 5,
    type: "success",
    title: "Automatización ejecutada",
    message: "Se enviaron 25 emails de seguimiento automáticamente",
    time: "Hace 1 día",
    read: true
  }
]

export function NotificationList() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          {unreadCount} notificaciones sin leer
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </div>
  )
}