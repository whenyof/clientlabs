/**
 * Forms Plugin
 */
import { ClientLabs, Plugin } from '../core/clientlabs';
import { on } from '../utils/dom';

const formsPlugin: Plugin = {
    name: "forms",

    init(client: ClientLabs) {
        on(document, 'submit', (e: Event) => {
            const form = e.target as HTMLFormElement;
            if (form.tagName !== 'FORM') return;

            const formData = new FormData(form);
            const data: Record<string, any> = {};
            let hasEmail = false;

            formData.forEach((value, key) => {
                // Simple sanitization or field mapping could go here
                data[key] = value;

                // Detect email for auto-identification
                if (typeof value === 'string' && value.includes('@') && (key.toLowerCase().includes('email') || key.toLowerCase().includes('correo'))) {
                    hasEmail = true;
                    client.track('email_detected', { email: value, field: key });
                }
            });

            client.track('form_submit', {
                formId: form.id,
                formAction: form.action,
                fields: Object.keys(data)
            });

            if (hasEmail) {
                client.track('lead_identified', data);
            }
        }, true);
    }
};

export default formsPlugin;
