/**
 * ClientLabs Plugin — Form Tracking (Hardened v3)
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

/**
 * Validates if an input field is safe to capture based on industrial standards.
 * Excludes passwords, tokens, hidden fields, and various sensitive keywords.
 */
function isFieldSecure(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    const type = (input.getAttribute('type') || '').toLowerCase()
    const name = (input.getAttribute('name') || '').toLowerCase()
    const id = (input.getAttribute('id') || '').toLowerCase()
    const placeholder = (input.getAttribute('placeholder') || '').toLowerCase()

    // 1. Blacklist types
    if (['password', 'hidden', 'color', 'file'].includes(type)) return false

    // 2. Blacklist sensitive keywords (names, IDs, placeholders)
    const blacklist = [
        'password', 'token', 'csrf', 'secret', 'auth',
        'cvv', 'cvc', 'cc-', 'card', 'credit', 'debit',
        'key', 'api', 'ssn', 'tax', 'hash'
    ]
    const haystack = name + id + placeholder
    if (blacklist.some(word => haystack.includes(word))) return false

    // 3. Identification whitelist (Capture only what matters)
    const whitelist = ['email', 'name', 'phone', 'tel', 'message', 'company', 'correo', 'nombre', 'telefono']
    return whitelist.some(word => haystack.includes(word)) || type === 'email' || type === 'tel'
}

function createFormsPlugin(): ClientLabsPlugin {
    const formStartTracked = new WeakSet<HTMLFormElement>()
    let focusHandler: ((e: FocusEvent) => void) | null = null
    let submitHandler: ((e: SubmitEvent) => void) | null = null

    return {
        name: 'forms',

        init(ctx: PluginContext): void {
            if (typeof document === 'undefined') return

            focusHandler = (e: FocusEvent): void => {
                const target = e.target as HTMLElement
                if (!target || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

                const form = target.closest('form')
                if (!form || formStartTracked.has(form)) return

                formStartTracked.add(form)
                ctx.track('form_start', {
                    formId: form.id || undefined,
                    url: window.location.href,
                })
            }

            submitHandler = (e: SubmitEvent): void => {
                const form = e.target as HTMLFormElement
                if (!form || form.tagName !== 'FORM') return

                const metadata: Record<string, any> = {
                    formId: form.id || undefined,
                    url: window.location.href,
                }

                // ── Deep field extraction with safety filters ──
                const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
                inputs.forEach((input: any) => {
                    if (!isFieldSecure(input)) return

                    let value = input.value?.trim()
                    if (!value) return

                    // Truncate at 500 chars (Phase 7 audit hardening)
                    if (value.length > 500) {
                        value = value.substring(0, 500)
                    }

                    const name = input.name || input.id
                    if (!name) return

                    // Prioritize specific fields for identify
                    if (!metadata.email && (name.includes('email') || input.type === 'email' || name.includes('correo'))) {
                        metadata.email = value
                    } else if (!metadata.name && (name.includes('name') || name.includes('nombre'))) {
                        metadata.name = value
                    } else if (!metadata.phone && (name.includes('phone') || input.type === 'tel' || name.includes('telefono'))) {
                        metadata.phone = value
                    } else {
                        // Store as generic metadata if it's in the safe whitelist
                        metadata[`field_${name}`] = value
                    }
                })

                if (metadata.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(metadata.email)) {
                    ctx.identify({
                        email: metadata.email,
                        name: metadata.name,
                        phone: metadata.phone
                    })
                }

                ctx.track('form_submit', metadata)
            }

            document.addEventListener('focusin', focusHandler, { passive: true, capture: true })
            document.addEventListener('submit', submitHandler, { passive: true, capture: true })
        },

        destroy(): void {
            if (typeof document === 'undefined') return
            if (focusHandler) document.removeEventListener('focusin', focusHandler, { capture: true })
            if (submitHandler) document.removeEventListener('submit', submitHandler, { capture: true })
        },
    }
}

export default createFormsPlugin
