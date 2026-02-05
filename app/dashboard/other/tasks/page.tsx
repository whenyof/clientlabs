import { redirect } from "next/navigation"

/**
 * Legacy route - redirects to canonical /dashboard/tasks
 * DO NOT add logic here - all functionality is in /dashboard/tasks
 */
export default function LegacyTasksPage() {
  redirect("/dashboard/tasks")
}
