/**
 * Transport Layer for ClientLabs SDK
 */
import { QueuedEvent } from './eventQueue';

export interface TransportOptions {
    endpoint: string;
    publicKey: string;
    visitorId: string;
}

export class Transport {
    private options: TransportOptions;
    private retries = [1000, 2000, 5000]; // 1s, 2s, 5s

    constructor(options: TransportOptions) {
        this.options = options;
    }

    async send(events: QueuedEvent[]): Promise<void> {
        const payload = {
            publicKey: this.options.publicKey,
            visitorId: this.options.visitorId,
            events: events.map(e => ({
                eventType: e.event,
                metadata: e.properties,
                timestamp: e.timestamp
            }))
        };

        return this.sendWithRetry(payload, 0);
    }

    private async sendWithRetry(payload: any, attempt: number): Promise<void> {
        try {
            const response = await fetch(this.options.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                keepalive: true
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            if (attempt < this.retries.length) {
                const delay = this.retries[attempt];
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendWithRetry(payload, attempt + 1);
            } else {
                // Fallback to sendBeacon on final failure if suitable
                if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                    navigator.sendBeacon(this.options.endpoint, blob);
                }
                throw error;
            }
        }
    }
}
