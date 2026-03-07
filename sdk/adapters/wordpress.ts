import { sdk } from '../core';

/**
 * WordPress Adapter
 * Helper functions to integrate into contact form plugins 
 * like CF7, Elementor Forms, Gravity Forms.
 */
export const WordPressAdapter = {
    init: (apiKey: string) => {
        sdk.init(apiKey);
        console.log('[WP Adapter] ClientLabs initialized for WordPress env');
    },

    captureCF7: (eventData: any) => {
        sdk.track('form_submit', {
            source: 'wordpress_cf7',
            payload: eventData
        });
    },

    captureElementor: (eventData: any) => {
        sdk.track('form_submit', {
            source: 'wordpress_elementor',
            payload: eventData
        });
    }
};
