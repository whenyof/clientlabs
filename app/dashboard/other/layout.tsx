/**
 * Passthrough layout for /dashboard/other/* routes.
 * The sidebar is now rendered by the parent app/dashboard/layout.tsx
 * via DashboardShell. This layout only passes children through.
 */
export default function OtherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
