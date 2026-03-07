/**
 * Pageview Plugin
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const pageviewPlugin: Plugin = {
    name: "pageview",

    init(client: ClientLabs) {
        // Immediate pageview on init
        client.track("pageview", {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        });

        // Handle History API changes (SPA navigation)
        const handleNavigation = () => {
            client.track("pageview", {
                url: window.location.href,
                path: window.location.pathname,
                title: document.title
            });
        };

        window.addEventListener('popstate', handleNavigation);

        // Patch pushState/replaceState
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            handleNavigation();
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            handleNavigation();
        };
    }
};

export default pageviewPlugin;
