"use client"

import { useRouter } from "next/navigation"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConnectWebButton() {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.push("/dashboard/connect")}
            className="gap-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium"
        >
            <Link2 className="h-4 w-4" />
            <span>Conectar</span>
        </Button>
    )
}
