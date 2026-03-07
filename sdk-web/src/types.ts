/**
 * ClientLabs SDK — Institutional Types
 * @version 12.0
 */

export interface TrackEvent {
    type: string;
    metadata?: Record<string, unknown>;
    timestamp: number;
}

export interface TrackPayload {
    publicKey: string;
    visitorId: string;
    sessionId: string;
    events: TrackEvent[];
}

export interface IdentifyMetadata {
    email: string;
    name?: string;
    phone?: string;
    [key: string]: unknown;
}

export interface SDKConfig {
    publicKey: string;
    features?: Record<string, boolean>;
    debug?: boolean;
    endpoint: string;
    maxBatch: number;
    flushInterval: number;
    retryLimit: number;
}

/** SDK version for installation verification and heartbeat payloads. */
export const SDK_VERSION = "12.2.0";
