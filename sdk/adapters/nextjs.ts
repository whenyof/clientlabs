import { sdk } from '../core';

export const NextJsAdapter = {
    init: (apiKey: string) => {
        if (typeof window !== 'undefined') {
            sdk.init(apiKey);
            console.log('[Next.js Adapter] Connected to ClientLabs');
        }
    },

    captureInteraction: (eventType: string, componentProps: any) => {
        sdk.track(`interact_${eventType}`, {
            source: 'nextjs_component',
            payload: componentProps
        });
    }
};
