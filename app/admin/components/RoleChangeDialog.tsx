"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, User } from "lucide-react"
import { useState } from "react"

type UserData = {
    id: string
    email: string
    name: string | null
    role: "USER" | "ADMIN"
    plan: "FREE" | "PRO" | "ENTERPRISE"
}

type RoleChangeDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserData
    onConfirm: (userId: string, newRole: "USER" | "ADMIN") => Promise<void>
}

export function RoleChangeDialog({ open, onOpenChange, user, onConfirm }: RoleChangeDialogProps) {
    const [loading, setLoading] = useState(false)
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(user.id, newRole)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0e1424] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        Change User Role
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        You are about to change the role for this user. This is a critical action.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-white/5 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-white/60">User</p>
                        <p className="text-white font-medium">{user.name || "No name"}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="space-y-1">
                            <p className="text-sm text-white/60">Current Role</p>
                            <Badge className={user.role === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                                {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                {user.role}
                            </Badge>
                        </div>
                        <div className="text-white/40">→</div>
                        <div className="space-y-1">
                            <p className="text-sm text-white/60">New Role</p>
                            <Badge className={newRole === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}>
                                {newRole === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                {newRole}
                            </Badge>
                        </div>
                    </div>

                    {newRole === "ADMIN" && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                            <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Warning
                            </p>
                            <p className="text-amber-400/80 text-sm mt-1">
                                Granting ADMIN role will give this user full access to the admin panel, including the ability to manage other users and system settings.
                            </p>
                        </div>
                    )}
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
                        onClick={handleConfirm}
                        disabled={loading}
                        className={newRole === "ADMIN" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                    >
                        {loading ? "Updating..." : "Confirm Change"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
