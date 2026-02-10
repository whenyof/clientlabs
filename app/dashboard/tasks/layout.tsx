/**
 * Tasks route layout: frees Mission Control from dashboard main padding.
 * Uses negative margins + calc width so content is edge-to-edge and full height.
 * Only this route is affected; no change to DashboardShell or other pages.
 */
export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
        flex flex-1 flex-col min-h-0 max-w-none
        -mx-6 -my-6 lg:-mx-8 lg:-my-6 xl:-mx-10
        w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] xl:w-[calc(100%+5rem)]
        min-h-full
      "
      data-debug="tasks-layout"
    >
      {children}
    </div>
  )
}
