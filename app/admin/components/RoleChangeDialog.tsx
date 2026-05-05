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
 plan: "FREE" | "TRIAL" | "STARTER" | "PRO" | "BUSINESS"
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
 <DialogContent className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-[var(--text-secondary)]" />
 Change User Role
 </DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 You are about to change the role for this user. This is a critical action.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 py-4">
 <div className="bg-[var(--bg-card)] p-4 rounded-lg space-y-2">
 <p className="text-sm text-[var(--text-secondary)]">User</p>
 <p className="text-[var(--text-primary)] font-medium">{user.name || "No name"}</p>
 <p className="text-[var(--text-secondary)] text-sm">{user.email}</p>
 </div>

 <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] rounded-lg">
 <div className="space-y-1">
 <p className="text-sm text-[var(--text-secondary)]">Current Role</p>
 <Badge className={user.role === "ADMIN" ? "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]" : "bg-[var(--bg-card)] text-[var(--accent)] border-blue-500/30"}>
 {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
 {user.role}
 </Badge>
 </div>
 <div className="text-[var(--text-secondary)]">→</div>
 <div className="space-y-1">
 <p className="text-sm text-[var(--text-secondary)]">New Role</p>
 <Badge className={newRole === "ADMIN" ? "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]" : "bg-[var(--bg-card)] text-[var(--accent)] border-blue-500/30"}>
 {newRole === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
 {newRole}
 </Badge>
 </div>
 </div>

 {newRole === "ADMIN" && (
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-lg">
 <p className="text-[var(--text-secondary)] text-sm font-medium flex items-center gap-2">
 <AlertTriangle className="h-4 w-4" />
 Warning
 </p>
 <p className="text-[var(--text-secondary)] text-sm mt-1">
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
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 Cancel
 </Button>
 <Button
 onClick={handleConfirm}
 disabled={loading}
 className={newRole === "ADMIN" ? "bg-[var(--bg-card)] hover:bg-[var(--bg-card)]" : "bg-blue-600 hover:bg-blue-700"}
 >
 {loading ? "Updating..." : "Confirm Change"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
