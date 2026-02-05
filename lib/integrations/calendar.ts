/**
 * Utility to generate and download .ics files for calendar events
 */
export type CalendarEvent = {
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
};

export function generateIcsString(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const start = formatDate(event.startDate);
    const end = event.endDate
        ? formatDate(event.endDate)
        : formatDate(new Date(event.startDate.getTime() + 30 * 60000)); // Default 30 mins

    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PROID:-//ClientLabs//NONSGML v1.0//EN",
        "BEGIN:VEVENT",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
        event.location ? `LOCATION:${event.location}` : "",
        "END:VEVENT",
        "END:VCALENDAR"
    ].filter(Boolean);

    return lines.join("\r\n");
}

export function downloadIcsFile(event: CalendarEvent, filename?: string) {
    const icsContent = generateIcsString(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || `${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Generate external calendar URLs
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const start = formatDate(event.startDate);
    const end = event.endDate
        ? formatDate(event.endDate)
        : formatDate(new Date(event.startDate.getTime() + 30 * 60000));

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", event.title);
    if (event.description) url.searchParams.append("details", event.description);
    if (event.location) url.searchParams.append("location", event.location);
    url.searchParams.append("dates", `${start}/${end}`);

    return url.toString();
}

export function generateOutlookCalendarUrl(event: CalendarEvent): string {
    const url = new URL("https://outlook.office.com/calendar/0/deeplink/compose");
    url.searchParams.append("subject", event.title);
    if (event.description) url.searchParams.append("body", event.description);
    if (event.location) url.searchParams.append("location", event.location);
    url.searchParams.append("startdt", event.startDate.toISOString());
    const end = event.endDate || new Date(event.startDate.getTime() + 30 * 60000);
    url.searchParams.append("enddt", end.toISOString());

    return url.toString();
}
