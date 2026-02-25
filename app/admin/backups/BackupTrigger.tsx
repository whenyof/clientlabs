"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog"
import { Database, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackupTrigger() {
 const [open, setOpen] = useState(false)
 const [loading, setLoading] = useState(false)
 const router = useRouter()

 const handleTriggerBackup = async () => {
 setLoading(true)
 try {
 const response = await fetch("/api/admin/backup/trigger", {
 method: "POST",
 })

 if (!response.ok) {
 throw new Error("Failed to trigger backup")
 }

 const data = await response.json()

 // Close dialog and refresh page
 setOpen(false)
 router.refresh()

 alert(`Backup triggered successfully! Status: ${data.status}`)
 } catch (error) {
 console.error("Error triggering backup:", error)
 alert("Failed to trigger backup. Please try again.")
 } finally {
 setLoading(false)
 }
 }

 return (
 <>
 <Button
 onClick={() => setOpen(true)}
 className="bg-[var(--accent-soft)]-primary hover:bg-[var(--accent-soft)]-primary/90 text-[var(--text-primary)]"
 >
 <Database className="h-4 w-4 mr-2" />
 Trigger Backup
 </Button>

 <Dialog open={open} onOpenChange={setOpen}>
 <DialogContent className="bg-[var(--bg-main)] border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Trigger Manual Backup</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 This will create a new database backup. The backup process may take
 several minutes depending on database size.
 </DialogDescription>
 </DialogHeader>
 <div className="py-4">
 <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
 <p className="text-yellow-400 text-sm">
 ⚠️ This action will create a backup entry and attempt to trigger the
 backup script. Ensure the VPS backup endpoint is configured.
 </p>
 </div>
 </div>
 <DialogFooter>
 <Button
 variant="outline"
 onClick={() => setOpen(false)}
 disabled={loading}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 Cancel
 </Button>
 <Button
 onClick={handleTriggerBackup}
 disabled={loading}
 className="bg-[var(--accent-soft)]-primary hover:bg-[var(--accent-soft)]-primary/90 text-[var(--text-primary)]"
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 Triggering...
 </>
 ) : (
 <>
 <Database className="h-4 w-4 mr-2" />
 Trigger Backup
 </>
 )}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </>
 )
}
