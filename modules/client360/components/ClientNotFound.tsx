"use client"

import Link from "next/link"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"

export function ClientNotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-32 px-6">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                <ExclamationCircleIcon className="w-10 h-10 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
                Cliente no encontrado
            </h2>
            <p className="text-sm text-gray-400 max-w-md text-center mb-8">
                El cliente que buscas no existe o no tienes permisos para acceder a esta
                información. Verifica el enlace o vuelve a la lista de clientes.
            </p>

            <Link
                href="/dashboard/clients"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
            >
                Volver a clientes
            </Link>
        </div>
    )
}
