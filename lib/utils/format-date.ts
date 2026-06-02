export function formatDate(date: Date | string, format?: string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const fmt =
    format ??
    (typeof window !== "undefined"
      ? localStorage.getItem("cl_date_format") ?? "DD/MM/YYYY"
      : "DD/MM/YYYY")

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()

  switch (fmt) {
    case "MM/DD/YYYY": return `${month}/${day}/${year}`
    case "YYYY-MM-DD": return `${year}-${month}-${day}`
    default:           return `${day}/${month}/${year}`
  }
}
