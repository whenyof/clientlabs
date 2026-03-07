/**
 * DOM Utils for event listeners and element detection
 */
export function on(
    element: Window | Document | HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
): void {
    if (element && element.addEventListener) {
        element.addEventListener(event, handler, options);
    }
}

export function ready(callback: () => void): void {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        on(document, 'DOMContentLoaded', callback);
    }
}

export function find(selector: string): HTMLElement | null {
    return document.querySelector(selector);
}

export function findAll(selector: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(selector);
}
