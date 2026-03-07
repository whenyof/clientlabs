/**
 * Core ClientLabs SDK Engine
 */
import { SDKConfig } from './config';
import { EventQueue, QueuedEvent } from './eventQueue';
import { Transport } from './transport';
import { storage } from '../utils/storage';
import { uuid } from '../utils/uuid';

export interface Plugin {
    name: string;
    init: (client: ClientLabs) => void;
    destroy?: () => void;
}

const TRACK_DEDUPE_MS = 300;
const TRACK_DEDUPE_MAX_KEYS = 1000;
const MAX_EVENT_PAYLOAD_BYTES = 5000;

function isBot(): boolean {
    if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') return false;
    const ua = navigator.userAgent.toLowerCase();
    return (
        ua.includes('bot') ||
        ua.includes('crawler') ||
        ua.includes('spider') ||
        ua.includes('headless')
    );
}

export class ClientLabs {
    private config: SDKConfig;
    private queue: EventQueue;
    private transport: Transport;
    private plugins: Map<string, Plugin> = new Map();
    private visitorId: string;
    private isInitialized = false;
    private trackDedupeMap = new Map<string, number>();
    private spaLastUrl = '';

    constructor(config: SDKConfig) {
        this.config = config;

        // Manage Visitor ID (cl_vid as requested)
        let vid = storage.get('vid');
        if (!vid) {
            vid = uuid();
            storage.set('vid', vid);
        }
        this.visitorId = vid;

        // Init Transport
        this.transport = new Transport({
            endpoint: config.endpoint,
            publicKey: config.key,
            visitorId: this.visitorId
        });

        // Init Queue with batch flush logic
        this.queue = new EventQueue(async (events: QueuedEvent[]) => {
            await this.transport.send(events);
        });
    }

    register(plugin: Plugin): void {
        if (this.plugins.has(plugin.name)) return;
        this.plugins.set(plugin.name, plugin);

        if (this.isInitialized) {
            try {
                plugin.init(this);
            } catch (e) {
                console.error(`[ClientLabs] Plugin ${plugin.name} failed to init`, e);
            }
        }
    }

    start(): void {
        if (this.isInitialized) return;

        this.plugins.forEach(plugin => {
            try {
                plugin.init(this);
                if (this.config.debug) console.log(`[ClientLabs] Plugin initialized: ${plugin.name}`);
            } catch (e) {
                console.error(`[ClientLabs] Plugin ${plugin.name} failed to init`, e);
            }
        });

        this.isInitialized = true;

        // SPA navigation: emit pageview on pushState / replaceState / popstate
        if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
            this.spaLastUrl = window.location.href;
            const emitPageview = () => {
                const url = window.location.href;
                if (url === this.spaLastUrl) return;
                const path = window.location.pathname;
                this.track('pageview', { url, path, referrer: this.spaLastUrl || undefined });
                this.spaLastUrl = url;
            };
            const origPush = window.history.pushState.bind(window.history);
            const origReplace = window.history.replaceState.bind(window.history);
            type HistoryStateArgs = Parameters<History['pushState']>;
            window.history.pushState = (...args: HistoryStateArgs) => {
                origPush(...args);
                emitPageview();
            };
            window.history.replaceState = (...args: HistoryStateArgs) => {
                origReplace(...args);
                emitPageview();
            };
            window.addEventListener('popstate', emitPageview);
            (this as any)._spaCleanup = () => {
                window.history.pushState = origPush;
                window.history.replaceState = origReplace;
                window.removeEventListener('popstate', emitPageview);
            };
        }

        // Flush initial events (like pageview)
        this.queue.flush();

        // Auto-flush periodically
        setInterval(() => this.queue.flush(), 5000);

        // Flush on exit
        if (typeof window !== 'undefined') {
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.queue.flush();
                }
            });
        }

        if (this.config.debug) console.log('[ClientLabs] SDK Started', this.config);
    }

    track(event: string, properties: Record<string, any> = {}): void {
        if (isBot()) return;
        if (typeof document !== 'undefined' && document.hidden) return;

        const payload = { type: event, ...properties };
        const payloadStr = JSON.stringify(payload);
        if (payloadStr.length > MAX_EVENT_PAYLOAD_BYTES) return;

        const key = event + '\n' + JSON.stringify(properties);
        const now = Date.now();
        const last = this.trackDedupeMap.get(key);
        if (last != null && now - last < TRACK_DEDUPE_MS) return;
        if (this.trackDedupeMap.size >= TRACK_DEDUPE_MAX_KEYS) this.trackDedupeMap.clear();
        this.trackDedupeMap.set(key, now);

        if (this.config.debug) console.log(`[ClientLabs] Enqueue event: ${event}`, properties);
        this.queue.enqueue(event, properties);
    }

    getVisitorId(): string {
        return this.visitorId;
    }

    getConfig(): SDKConfig {
        return this.config;
    }
}
