/**
 * Stripe stack plugin — activates when Stripe is detected; tracks stack_detected.
 */
import { ClientLabs, Plugin } from "../core/clientlabs";

const stripePlugin: Plugin = {
    name: "stripe",
    init(client: ClientLabs) {
        try {
            client.track("stack_detected", { stack: "stripe" });
        } catch {
            // no-op
        }
    },
};

export default stripePlugin;
