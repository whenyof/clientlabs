import { requireAdminUser } from "@/lib/auth-guards"
import AdminSidebar from "./components/AdminSidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - Antigravity",
  description: "Admin dashboard for managing users, plans, and system settings",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ SERVER GUARD ENSURES ADMIN ACCESS
  // Middleware provides first layer, this provides second layer
  await requireAdminUser()

  return (
    <div className="min-h-screen bg-[#0b0f1c] text-white flex">
      <AdminSidebar />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}