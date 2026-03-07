/**
 * Heartbeat Plugin
 * Sends a pulse every 30 seconds to track active session time.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const heartbeatPlugin: Plugin = {
    name: "heartbeat",

    init(client: ClientLabs) {
        const INTERVAL = 30000; // 30s

        const intervalId = setInterval(() => {
            // Only track heartbeat if the page is visible
            if (document.visibilityState === 'visible') {
                client.track('heartbeat', {
                    url: window.location.href,
                    time: Date.now()
                });
            }
        }, INTERVAL);

        // Store cleanup
        (this as any)._intervalId = intervalId;
    },

    destroy() {
        if ((this as any)._intervalId) {
            clearInterval((this as any)._intervalId);
        }
    }
};

export default heartbeatPlugin;
