/**
 * Calendly stack plugin — activates when Calendly is detected; tracks stack_detected.
 */
import { ClientLabs, Plugin } from "../core/clientlabs";

const calendlyPlugin: Plugin = {
    name: "calendly",
    init(client: ClientLabs) {
        try {
            client.track("stack_detected", { stack: "calendly" });
        } catch {
            // no-op
        }
    },
};

export default calendlyPlugin;
