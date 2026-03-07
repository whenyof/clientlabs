/**
 * Event Queue for ClientLabs SDK
 */
export interface QueuedEvent {
    event: string;
    properties: Record<string, any>;
    timestamp: string;
}

export class EventQueue {
    private queue: QueuedEvent[] = [];
    private onFlush: (events: QueuedEvent[]) => Promise<void>;

    constructor(onFlush: (events: QueuedEvent[]) => Promise<void>) {
        this.onFlush = onFlush;
    }

    enqueue(event: string, properties: Record<string, any>): void {
        this.queue.push({
            event,
            properties,
            timestamp: new Date().toISOString()
        });

        // Auto-flush every few events or on specific conditions if needed
        // But we'll mostly rely on manual flush() or transport triggers
    }

    async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        const eventsToFlush = [...this.queue];
        this.queue = [];

        try {
            await this.onFlush(eventsToFlush);
        } catch (e) {
            // Put back in queue if failed
            this.queue = [...eventsToFlush, ...this.queue];
            throw e;
        }
    }
}
