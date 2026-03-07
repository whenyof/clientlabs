/**
 * Simple storage utility for localStorage
 */
const PREFIX = 'cl_';

export const storage = {
    get(key: string): string | null {
        if (typeof window === 'undefined') return null;
        try {
            return localStorage.getItem(PREFIX + key);
        } catch (e) {
            return null;
        }
    },

    set(key: string, value: string): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(PREFIX + key, value);
        } catch (e) { }
    },

    remove(key: string): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(PREFIX + key);
        } catch (e) { }
    }
};
