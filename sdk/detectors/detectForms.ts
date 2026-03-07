/**
 * Lightweight forms detection (presence of form elements).
 * Does not throw; safe for SSR.
 */
export function detectForms(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const form = document.querySelector("form");
        return !!form;
    } catch {
        return false;
    }
}
