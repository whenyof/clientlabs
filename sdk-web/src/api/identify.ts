/**
 * ClientLabs SDK — identify API
 * Specific wrapper for User Identity.
 */

import { track } from "./track";
import { IdentifyMetadata } from "../types";

/**
 * Identificar usuario para Lead Conversion.
 * Envía evento persistente vía Track.
 */
export function identify(metadata: IdentifyMetadata): boolean {
    if (!metadata || !metadata.email || typeof metadata.email !== "string") {
        return false;
    }

    // El identify es un evento especial que linkea visitorId a Lead en el backend.
    return track("identify", metadata);
}
