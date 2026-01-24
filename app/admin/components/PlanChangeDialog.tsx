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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

type UserData = {
    id: string
    email: string
    name: string | null
    role: "USER" | "ADMIN"
    plan: "FREE" | "PRO" | "ENTERPRISE"
}

type PlanChangeDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserData
    onConfirm: (userId: string, newPlan: "FREE" | "PRO" | "ENTERPRISE") => Promise<void>
}

const PLANS = [
    {
        value: "FREE",
        label: "Free",
        description: "Basic features for getting started",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    },
    {
        value: "PRO",
        label: "Pro",
        description: "Advanced features for growing businesses",
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
    },
    {
        value: "ENTERPRISE",
        label: "Enterprise",
        description: "Full features with priority support",
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    }
] as const

export function PlanChangeDialog({ open, onOpenChange, user, onConfirm }: PlanChangeDialogProps) {
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<"FREE" | "PRO" | "ENTERPRISE">(user.plan)

    const handleConfirm = async () => {
        if (selectedPlan === user.plan) {
            onOpenChange(false)
            return
        }

        setLoading(true)
        try {
            await onConfirm(user.id, selectedPlan)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0e1424] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Change User Plan</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Select a new plan for this user
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-white/5 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-white/60">User</p>
                        <p className="text-white font-medium">{user.name || "No name"}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-white">Select Plan</Label>
                        <RadioGroup value={selectedPlan} onValueChange={(value: string) => setSelectedPlan(value as "FREE" | "PRO" | "ENTERPRISE")}>
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.value}
                                    className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${selectedPlan === plan.value
                                        ? "bg-white/10 border-white/30"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                        }`}
                                    onClick={() => setSelectedPlan(plan.value)}
                                >
                                    <RadioGroupItem value={plan.value} id={plan.value} className="mt-1" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={plan.value} className="text-white font-medium cursor-pointer">
                                                {plan.label}
                                            </Label>
                                            <Badge className={plan.color}>
                                                {plan.value}
                                            </Badge>
                                            {user.plan === plan.value && (
                                                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/60">{plan.description}</p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
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
                        onClick={handleConfirm}
                        disabled={loading || selectedPlan === user.plan}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? "Updating..." : "Confirm Change"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
