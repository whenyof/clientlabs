import { prisma } from "@/lib/prisma"
import { AdminLogsTable } from "./AdminLogsTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollText } from "lucide-react"

async function getAdminLogs(page: number = 1, limit: number = 20) {
    try {
        const skip = (page - 1) * limit

        const [logs, totalCount] = await Promise.all([
            prisma.adminLog.findMany({
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
                include: {
                    admin: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.adminLog.count(),
        ])

        // Convert dates to strings for client component
        const serializedLogs = logs.map((log) => ({
            ...log,
            createdAt: log.createdAt.toISOString(),
            metadata: log.metadata as Record<string, any>,
        }))

        return {
            logs: serializedLogs,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error("Error fetching admin logs:", error)
        return {
            logs: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
        }
    }
}

export default async function AdminLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || "1", 10)
    const { logs, totalCount, totalPages, currentPage } = await getAdminLogs(page)

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <ScrollText className="h-8 w-8" />
                    Admin Audit Logs
                </h1>
                <p className="text-white/60">
                    Complete audit trail of all admin actions ({totalCount} total)
                </p>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Recent Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <AdminLogsTable
                        logs={logs}
                        totalPages={totalPages}
                        currentPage={currentPage}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
