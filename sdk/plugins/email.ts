/**
 * Email Detection Plugin (production hardened)
 * Dedupe by Set (capped 500), WeakSet for bound inputs, blur+change, MutationObserver optimized, full cleanup.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const SELECTORS = 'input[type="email"], input[name*="email"], input[id*="email"]';
const MAX_DETECTED_EMAILS = 500;
// RFC 5322 simplified
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function isValidEmail(value: string): boolean {
    const v = (value || '').trim();
    if (!v || !v.includes('@')) return false;
    return EMAIL_REGEX.test(v);
}

type EmailBinding = {
    el: HTMLInputElement;
    blur: () => void;
    change: () => void;
    form?: HTMLFormElement;
    submit?: () => void;
};

function attachBlurAndChangeToInput(
    input: HTMLInputElement,
    client: ClientLabs,
    detectedEmails: Set<string>,
    boundInputs: WeakSet<HTMLInputElement>,
    bindings: EmailBinding[]
): void {
    if (boundInputs.has(input)) return;
    boundInputs.add(input);

    const emitIfValid = () => {
        const value = (input.value || '').trim();
        if (!value || !isValidEmail(value)) return;
        if (detectedEmails.size > MAX_DETECTED_EMAILS) detectedEmails.clear();
        if (detectedEmails.has(value)) return;
        detectedEmails.add(value);
        client.track('email_detected', { email: value });
    };

    const blurHandler = () => emitIfValid();
    const changeHandler = () => emitIfValid();
    input.addEventListener('blur', blurHandler);
    input.addEventListener('change', changeHandler);

    const binding: EmailBinding = { el: input, blur: blurHandler, change: changeHandler };
    const form = input.form ?? undefined;
    if (form) {
        const submitHandler = () => emitIfValid();
        form.addEventListener('submit', submitHandler);
        binding.form = form;
        binding.submit = submitHandler;
    }
    bindings.push(binding);
}

function attachToExistingInputs(
    root: Document | DocumentFragment | Element,
    client: ClientLabs,
    detectedEmails: Set<string>,
    boundInputs: WeakSet<HTMLInputElement>,
    bindings: EmailBinding[]
): void {
    root.querySelectorAll<HTMLInputElement>(SELECTORS).forEach((input) => {
        attachBlurAndChangeToInput(input, client, detectedEmails, boundInputs, bindings);
    });
}

function mayContainInput(node: Node): boolean {
    if (!(node instanceof HTMLElement)) return false;
    const tag = node.tagName?.toLowerCase();
    return tag === 'input' || tag === 'form' || tag === 'div' || tag === 'section' || tag === 'main' || tag === 'body' || node.childNodes.length > 0;
}

const emailPlugin: Plugin = {
    name: 'email',

    init(client: ClientLabs) {
        if (typeof document === 'undefined') return;

        const detectedEmails = new Set<string>();
        const boundInputs = new WeakSet<HTMLInputElement>();
        const bindings: EmailBinding[] = [];

        attachToExistingInputs(document, client, detectedEmails, boundInputs, bindings);

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    if (!mayContainInput(node) && !node.matches?.(SELECTORS)) return;
                    if (node.matches?.(SELECTORS)) {
                        attachBlurAndChangeToInput(node as HTMLInputElement, client, detectedEmails, boundInputs, bindings);
                    }
                    attachToExistingInputs(node, client, detectedEmails, boundInputs, bindings);
                });
            }
        });

        const root = document.body || document.documentElement;
        if (root) observer.observe(root, { childList: true, subtree: true });

        (this as any)._emailCleanup = () => {
            observer.disconnect();
            bindings.forEach((b) => {
                b.el.removeEventListener('blur', b.blur);
                b.el.removeEventListener('change', b.change);
                if (b.form && b.submit) b.form.removeEventListener('submit', b.submit);
            });
            detectedEmails.clear();
        };
    },

    destroy() {
        const cleanup = (this as any)._emailCleanup;
        if (typeof cleanup === 'function') cleanup();
    },
};

export default emailPlugin;
