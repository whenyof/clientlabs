/**
 * Shopify stack plugin — activates when Shopify is detected; tracks stack_detected.
 */
import { ClientLabs, Plugin } from "../core/clientlabs";

const shopifyPlugin: Plugin = {
    name: "shopify",
    init(client: ClientLabs) {
        try {
            client.track("stack_detected", { stack: "shopify" });
        } catch {
            // no-op
        }
    },
};

export default shopifyPlugin;
