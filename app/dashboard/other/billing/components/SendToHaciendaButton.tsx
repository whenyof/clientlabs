"use client"

import { useState } from "react"
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline"

interface SendToHaciendaButtonProps {
  invoiceId: string
  status: 'pending' | 'sent' | 'accepted' | 'rejected'
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'text-gray-400',
    icon: ClockIcon,
    bgColor: 'bg-gray-500/20 hover:bg-gray-500/30'
  },
  sent: {
    label: 'Enviada',
    color: 'text-yellow-400',
    icon: PaperAirplaneIcon,
    bgColor: 'bg-yellow-500/20 hover:bg-yellow-500/30'
  },
  accepted: {
    label: 'Aceptada',
    color: 'text-green-400',
    icon: CheckCircleIcon,
    bgColor: 'bg-green-500/20 hover:bg-green-500/30'
  },
  rejected: {
    label: 'Rechazada',
    color: 'text-red-400',
    icon: XCircleIcon,
    bgColor: 'bg-red-500/20 hover:bg-red-500/30'
  }
}

export function SendToHaciendaButton({ invoiceId, status }: SendToHaciendaButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (status !== 'pending') return

    setIsLoading(true)
    try {
      // Simular envío a Hacienda
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Aquí iría la llamada real a la API
      console.log(`Enviando factura ${invoiceId} a Hacienda`)
    } catch (error) {
      console.error('Error enviando a Hacienda:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <button
      onClick={handleSend}
      disabled={status !== 'pending' || isLoading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
        status === 'pending' && !isLoading
          ? `${config.bgColor} border-gray-500/30 text-gray-400 hover:text-white cursor-pointer`
          : `${config.bgColor} border-transparent ${config.color} cursor-not-allowed`
      }`}
      title={`Estado Hacienda: ${config.label}`}
    >
      {isLoading ? (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  )
}