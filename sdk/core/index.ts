// Core WebSDK class representing the main singleton for browser injection
export class ClientLabsSDK {
    private apiKey: string | null = null;
    private domain: string | null = null;

    constructor() { }

    public init(apiKey: string, config?: { domain?: string }) {
        this.apiKey = apiKey;
        this.domain = config?.domain || window.location.hostname;
        console.log(`[ClientLabs SDK] Initialized with key: ${apiKey.substring(0, 8)}...`);
        // Actual implementation logic connects to websocket or sends init event
    }

    public track(eventName: string, properties: Record<string, any> = {}) {
        if (!this.apiKey) {
            console.warn('[ClientLabs SDK] Track called before init()');
            return;
        }
        // Send track event securely
        console.log(`[ClientLabs SDK] Track: ${eventName}`, properties);
    }
}

// Global instance 
export const sdk = new ClientLabsSDK();
