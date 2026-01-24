"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, User, Search, Ban, UserCheck, Eye } from "lucide-react"
import { RoleChangeDialog } from "../components/RoleChangeDialog"
import { PlanChangeDialog } from "../components/PlanChangeDialog"
import { ImpersonateDialog } from "./ImpersonateDialog"
import { BlockUserDialog } from "./BlockUserDialog"
import { unblockUser } from "../actions"

type UserData = {
    id: string
    email: string
    name: string | null
    role: "USER" | "ADMIN"
    plan: "FREE" | "PRO" | "ENTERPRISE"
    onboardingCompleted: boolean
    createdAt: string
    image: string | null
    isBlocked: boolean
    isActive: boolean
    blockedReason: string | null
    lastLoginAt: string | null
    lastActiveAt: string | null
}

function RoleBadge({ role }: { role: string }) {
    if (role === "ADMIN") {
        return (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
            </Badge>
        )
    }
    return (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <User className="w-3 h-3 mr-1" />
            USER
        </Badge>
    )
}

function PlanBadge({ plan }: { plan: string }) {
    const colors = {
        FREE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        PRO: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        ENTERPRISE: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    }

    return (
        <Badge className={colors[plan as keyof typeof colors] || "bg-gray-500/20 text-gray-400"}>
            {plan}
        </Badge>
    )
}

export function UserManagementTable({ initialUsers }: { initialUsers: UserData[] }) {
    const [users, setUsers] = useState<UserData[]>(initialUsers)
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>(initialUsers)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)
    const [planDialogOpen, setPlanDialogOpen] = useState(false)
    const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
    const [blockDialogOpen, setBlockDialogOpen] = useState(false)

    // Filter users based on search query
    useEffect(() => {
        const query = searchQuery.toLowerCase()
        const filtered = users.filter(user =>
            user.email.toLowerCase().includes(query) ||
            user.name?.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query) ||
            user.plan.toLowerCase().includes(query)
        )
        setFilteredUsers(filtered)
    }, [searchQuery, users])

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            })

            if (!response.ok) {
                throw new Error("Failed to update role")
            }

            const { user: updatedUser } = await response.json()

            // Optimistic UI update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u))
            setRoleDialogOpen(false)
            setSelectedUser(null)
        } catch (error) {
            console.error("Error updating role:", error)
            alert("Failed to update user role. Please try again.")
        }
    }

    const handlePlanChange = async (userId: string, newPlan: "FREE" | "PRO" | "ENTERPRISE") => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: newPlan })
            })

            if (!response.ok) {
                throw new Error("Failed to update plan")
            }

            const { user: updatedUser } = await response.json()

            // Optimistic UI update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u))
            setPlanDialogOpen(false)
            setSelectedUser(null)
        } catch (error) {
            console.error("Error updating plan:", error)
            alert("Failed to update user plan. Please try again.")
        }
    }

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId)
            // Refresh user data
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, isBlocked: false, blockedReason: null }
                    : u
            ))
        } catch (error: any) {
            alert(error.message || "Failed to unblock user")
        }
    }

    const openRoleDialog = (user: UserData) => {
        setSelectedUser(user)
        setRoleDialogOpen(true)
    }

    const openPlanDialog = (user: UserData) => {
        setSelectedUser(user)
        setPlanDialogOpen(true)
    }

    const openImpersonateDialog = (user: UserData) => {
        setSelectedUser(user)
        setImpersonateDialogOpen(true)
    }

    const openBlockDialog = (user: UserData) => {
        setSelectedUser(user)
        setBlockDialogOpen(true)
    }

    const refreshUsers = () => {
        // Refresh would normally refetch from server
        // For now, just close dialogs
        setBlockDialogOpen(false)
        setSelectedUser(null)
        window.location.reload()
    }

    return (
        <>
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <p className="text-white/60 text-center py-8">
                            {searchQuery ? "No users found matching your search" : "No users found"}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white font-medium">{user.name || "No name"}</p>
                                            <RoleBadge role={user.role} />
                                            <PlanBadge plan={user.plan} />
                                            {user.isBlocked && (
                                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                                    <Ban className="w-3 h-3 mr-1" />
                                                    BLOCKED
                                                </Badge>
                                            )}
                                            {!user.isActive && (
                                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                                    INACTIVE
                                                </Badge>
                                            )}
                                            {!user.onboardingCompleted && (
                                                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                                    Onboarding Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-white/60 text-sm">{user.email}</p>
                                        <div className="flex gap-4 text-white/40 text-xs">
                                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                            {user.lastLoginAt && (
                                                <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        {user.isBlocked && user.blockedReason && (
                                            <p className="text-red-400 text-xs mt-1">
                                                Reason: {user.blockedReason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openRoleDialog(user)}
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                        >
                                            Change Role
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openPlanDialog(user)}
                                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                        >
                                            Change Plan
                                        </Button>
                                        {user.isBlocked ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUnblock(user.id)}
                                                className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                            >
                                                <UserCheck className="h-4 w-4 mr-1" />
                                                Unblock
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openBlockDialog(user)}
                                                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                            >
                                                <Ban className="h-4 w-4 mr-1" />
                                                Block
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openImpersonateDialog(user)}
                                            disabled={user.isBlocked || !user.isActive}
                                            className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 disabled:opacity-50"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Impersonate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedUser && (
                <>
                    <RoleChangeDialog
                        open={roleDialogOpen}
                        onOpenChange={setRoleDialogOpen}
                        user={selectedUser}
                        onConfirm={handleRoleChange}
                    />
                    <PlanChangeDialog
                        open={planDialogOpen}
                        onOpenChange={setPlanDialogOpen}
                        user={selectedUser}
                        onConfirm={handlePlanChange}
                    />
                    <ImpersonateDialog
                        open={impersonateDialogOpen}
                        onOpenChange={setImpersonateDialogOpen}
                        user={selectedUser}
                    />
                    <BlockUserDialog
                        open={blockDialogOpen}
                        onOpenChange={setBlockDialogOpen}
                        user={selectedUser}
                        onSuccess={refreshUsers}
                    />
                </>
            )}
        </>
    )
}
