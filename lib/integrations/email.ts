/**
 * Utility to generate platform-specific email links
 */
export type EmailDraft = {
    to: string;
    subject: string;
    body: string;
};

export function generateMailtoUrl(draft: EmailDraft): string {
    const subject = encodeURIComponent(draft.subject);
    const body = encodeURIComponent(draft.body);
    return `mailto:${draft.to}?subject=${subject}&body=${body}`;
}

export function generateGmailUrl(draft: EmailDraft): string {
    const to = encodeURIComponent(draft.to);
    const subject = encodeURIComponent(draft.subject);
    const body = encodeURIComponent(draft.body);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
}

export function generateOutlookWebUrl(draft: EmailDraft): string {
    const to = encodeURIComponent(draft.to);
    const subject = encodeURIComponent(draft.subject);
    const body = encodeURIComponent(draft.body);
    return `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
}

export function openEmailClient(draft: EmailDraft, method: 'mailto' | 'gmail' | 'outlook' = 'mailto') {
    let url = '';
    switch (method) {
        case 'gmail':
            url = generateGmailUrl(draft);
            break;
        case 'outlook':
            url = generateOutlookWebUrl(draft);
            break;
        default:
            url = generateMailtoUrl(draft);
    }

    if (typeof window !== 'undefined') {
        window.open(url, '_blank');
    }
}
