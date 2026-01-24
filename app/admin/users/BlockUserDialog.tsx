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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ban, Loader2 } from "lucide-react"
import { blockUser } from "../actions"

type UserData = {
    id: string
    email: string
    name: string | null
}

export function BlockUserDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserData
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState("")

    const handleBlock = async () => {
        if (!reason.trim()) {
            alert("Please provide a reason for blocking this user")
            return
        }

        setLoading(true)
        try {
            await blockUser(user.id, reason)
            onOpenChange(false)
            setReason("")
            onSuccess()
        } catch (error: any) {
            alert(error.message || "Failed to block user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0e1424] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Ban className="h-5 w-5 text-red-400" />
                        Block User
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        Block this user from accessing the platform. They will not be able to
                        log in.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-white/60 text-sm">User:</p>
                        <p className="text-white font-medium">{user.name || "No name"}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-white">
                            Reason for blocking *
                        </Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Violation of terms of service"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                            setReason("")
                        }}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBlock}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Blocking...
                            </>
                        ) : (
                            <>
                                <Ban className="h-4 w-4 mr-2" />
                                Block User
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
