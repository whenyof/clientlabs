/**
 * UTM Tracking Plugin
 * Captures UTM parameters from URL and stores them in localStorage.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';
import { storage } from '../utils/storage';

const utmPlugin: Plugin = {
    name: "utm",

    init(client: ClientLabs) {
        const urlParams = new URLSearchParams(window.location.search);
        const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

        const capturedUtms: Record<string, string> = {};
        let hasUtm = false;

        utms.forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                capturedUtms[param] = value;
                storage.set(param, value); // Persist for attribution
                hasUtm = true;
            }
        });

        if (hasUtm) {
            client.track('utm_params', capturedUtms);
        }
    }
};

export default utmPlugin;
