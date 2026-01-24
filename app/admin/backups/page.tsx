import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HardDrive, Clock, Database } from "lucide-react"
import { BackupTrigger } from "./BackupTrigger"
import { ClientDate } from "@/components/ClientNumber"

async function getBackupStatus() {
    try {
        // Get last backup
        const lastBackup = await prisma.backupMetadata.findFirst({
            orderBy: { createdAt: "desc" },
        })

        // Get recent backups
        const recentBackups = await prisma.backupMetadata.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
        })

        // Get backup stats
        const [totalBackups, completedBackups, failedBackups] = await Promise.all([
            prisma.backupMetadata.count(),
            prisma.backupMetadata.count({ where: { status: "COMPLETED" } }),
            prisma.backupMetadata.count({ where: { status: "FAILED" } }),
        ])

        return {
            lastBackup: lastBackup
                ? {
                    ...lastBackup,
                    createdAt: lastBackup.createdAt.toISOString(),
                    completedAt: lastBackup.completedAt?.toISOString() || null,
                    size: lastBackup.size.toString(),
                }
                : null,
            recentBackups: recentBackups.map((b) => ({
                ...b,
                createdAt: b.createdAt.toISOString(),
                completedAt: b.completedAt?.toISOString() || null,
                size: b.size.toString(),
            })),
            stats: {
                total: totalBackups,
                completed: completedBackups,
                failed: failedBackups,
            },
        }
    } catch (error) {
        console.error("Error fetching backup status:", error)
        return {
            lastBackup: null,
            recentBackups: [],
            stats: { total: 0, completed: 0, failed: 0 },
        }
    }
}

function StatusBadge({ status }: { status: string }) {
    const colors = {
        PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
        FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
    }

    return (
        <Badge className={colors[status as keyof typeof colors] || colors.PENDING}>
            {status}
        </Badge>
    )
}

function TypeBadge({ type }: { type: string }) {
    const colors = {
        MANUAL: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        PRE_RESTORE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    }

    return (
        <Badge className={colors[type as keyof typeof colors] || colors.SCHEDULED}>
            {type}
        </Badge>
    )
}

function formatBytes(bytes: string): string {
    const num = parseInt(bytes, 10)
    if (num === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(num) / Math.log(k))
    return Math.round((num / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export default async function AdminBackupsPage() {
    const { lastBackup, recentBackups, stats } = await getBackupStatus()

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <HardDrive className="h-8 w-8" />
                    Backup Management
                </h1>
                <p className="text-white/60">
                    Monitor and manage database backups
                </p>
            </div>

            {/* Backup Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">
                            Total Backups
                        </CardTitle>
                        <Database className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">
                            Completed
                        </CardTitle>
                        <Database className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {stats.completed}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">
                            Failed
                        </CardTitle>
                        <Database className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">
                            {stats.failed}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Last Backup Status */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Last Backup</CardTitle>
                        <BackupTrigger />
                    </div>
                </CardHeader>
                <CardContent>
                    {lastBackup ? (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-white/60 text-sm">Status</p>
                                    <StatusBadge status={lastBackup.status} />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Type</p>
                                    <TypeBadge type={lastBackup.type} />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Size</p>
                                    <p className="text-white font-medium">
                                        {formatBytes(lastBackup.size)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Created</p>
                                    <p className="text-white font-medium">
                                        {new Date(lastBackup.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {lastBackup.completedAt && (
                                    <div>
                                        <p className="text-white/60 text-sm">Completed</p>
                                        <p className="text-white font-medium">
                                            {new Date(lastBackup.completedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {lastBackup.errorMessage && (
                                    <div className="md:col-span-2">
                                        <p className="text-white/60 text-sm">Error</p>
                                        <p className="text-red-400 text-sm">
                                            {lastBackup.errorMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-white/60 text-center py-8">
                            No backups found. Trigger your first backup above.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Backup History */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Backup History</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentBackups.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
                                            Filename
                                        </th>
                                        <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
                                            Size
                                        </th>
                                        <th className="text-left py-3 px-4 text-white/60 font-medium text-sm">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBackups.map((backup) => (
                                        <tr
                                            key={backup.id}
                                            className="border-b border-white/10 last:border-0 hover:bg-white/5"
                                        >
                                            <td className="py-3 px-4 text-white text-sm font-mono">
                                                {backup.filename}
                                            </td>
                                            <td className="py-3 px-4">
                                                <TypeBadge type={backup.type} />
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={backup.status} />
                                            </td>
                                            <td className="py-3 px-4 text-white/60 text-sm">
                                                {formatBytes(backup.size)}
                                            </td>
                                            <td className="py-3 px-4 text-white/60 text-sm">
                                                {new Date(backup.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-white/60 text-center py-8">
                            No backup history available
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
