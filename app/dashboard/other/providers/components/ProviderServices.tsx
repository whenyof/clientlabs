"use client"

import { useState, useEffect } from "react"
import { Plus, X, Search, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getAllServices,
    createService,
    addServiceToProvider,
    removeServiceFromProvider
} from "@/app/dashboard/providers/actions"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Service {
    id: string
    name: string
}

interface ProviderServicesProps {
    providerId: string
    activeServices: Service[]
}

export function ProviderServices({ providerId, activeServices }: ProviderServicesProps) {
    const [open, setOpen] = useState(false)
    const [allServices, setAllServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")

    useEffect(() => {
        if (open) {
            loadAllServices()
        }
    }, [open])

    const loadAllServices = async () => {
        setLoading(true)
        const result = await getAllServices()
        if (result.success && result.services) {
            setAllServices(result.services)
        }
        setLoading(false)
    }

    const handleAddService = async (service: Service) => {
        const result = await addServiceToProvider(providerId, service.id)
        if (result.success) {
            toast.success(`Servicio ${service.name} añadido`)
            setOpen(false)
            setSearchValue("")
        } else {
            toast.error("Error al añadir servicio")
        }
    }

    const handleCreateService = async () => {
        if (!searchValue.trim()) return

        const result = await createService(searchValue)
        if (result.success && result.service) {
            // Immediately add to provider
            await handleAddService(result.service)
        } else {
            toast.error("Error al crear servicio")
        }
    }

    const handleRemoveService = async (serviceId: string) => {
        const result = await removeServiceFromProvider(providerId, serviceId)
        if (result.success) {
            toast.success("Servicio eliminado")
        } else {
            toast.error("Error al eliminar servicio")
        }
    }

    // Filter available services (those not already active)
    const availableServices = allServices.filter(
        s => !activeServices.some(active => active.id === s.id) &&
            s.name.toLowerCase().includes(searchValue.toLowerCase())
    )

    const exactMatch = availableServices.some(s => s.name.toLowerCase() === searchValue.toLowerCase())

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-white/40" />
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                    Servicios que soporta
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {activeServices.length === 0 && (
                    <span className="text-sm text-white/40 italic">
                        Sin servicios asignados
                    </span>
                )}

                {activeServices.map(service => (
                    <Badge
                        key={service.id}
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 pl-2.5 pr-1 py-1 gap-1 group transition-colors"
                    >
                        <span>{service.name}</span>
                        <button
                            onClick={() => handleRemoveService(service.id)}
                            className="p-0.5 rounded-full hover:bg-white/10 text-purple-400 group-hover:text-purple-200 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-dashed border-white/20 bg-transparent text-white/60 hover:text-white hover:bg-white/5 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Añadir servicio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-white/10 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Añadir servicio</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    placeholder="Buscar o crear (ej. Logística, Marketing...)"
                                    className="pl-9 bg-white/5 border-white/10 text-white"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-1">
                                {loading ? (
                                    <div className="text-center py-4 text-white/40 text-sm">Cargando...</div>
                                ) : availableServices.length > 0 ? (
                                    availableServices.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => handleAddService(service)}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white text-sm transition-colors flex items-center justify-between group"
                                        >
                                            {service.name}
                                            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                                        </button>
                                    ))
                                ) : searchValue && !exactMatch ? (
                                    <div className="text-center py-4">
                                        <p className="text-white/60 text-sm mb-3">No existe el servicio "{searchValue}"</p>
                                        <Button
                                            size="sm"
                                            onClick={handleCreateService}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            Crear y añadir
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-white/40 text-sm">
                                        {searchValue ? "Ya añadido" : "Escribe para buscar..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
