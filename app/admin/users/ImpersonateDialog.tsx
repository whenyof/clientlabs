"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { startImpersonation } from "../actions"
import { useRouter } from "next/navigation"

type UserData = {
    id: string
    email: string
    name: string | null
}

export function ImpersonateDialog({
    open,
    onOpenChange,
    user,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserData
}) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleImpersonate = async () => {
        setLoading(true)
        try {
            const result = await startImpersonation(user.id)

            if (result.success) {
                // Close dialog and redirect to user dashboard
                onOpenChange(false)
                router.push("/dashboard/other")
                router.refresh()
            }
        } catch (error: any) {
            alert(error.message || "Failed to start impersonation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0e1424] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        Impersonate User
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        You are about to impersonate this user. All actions will be performed as
                        this user.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-orange-400 text-sm font-medium mb-2">
                            ⚠️ Important Security Notice
                        </p>
                        <ul className="text-orange-400/80 text-xs space-y-1">
                            <li>• This action will be logged in the admin audit trail</li>
                            <li>• You will see the user's dashboard and data</li>
                            <li>• A banner will indicate you are impersonating</li>
                            <li>• Click "Exit Impersonation" to return to admin panel</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-white/60 text-sm">Target User:</p>
                        <p className="text-white font-medium">{user.name || "No name"}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImpersonate}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            "Start Impersonation"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
