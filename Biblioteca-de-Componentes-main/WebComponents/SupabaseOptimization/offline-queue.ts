// @use(kind, contract, limit, scope, badPractice, goodPractice, learn-error)
// @kind(util)
// @limit(lines: 232, reason: "Clase completa con FIFO, persistencia localStorage, retry (max 3), event listeners — refactor pendiente: extraer transporte HTTP a clase separada. Ver BUG-043")
// @contract(in: QueuedOperation -> out: OfflineQueue persistence + flush @error: QueueError)
// @scope(shared:offline)
// @badPractice("DEPRECATED: Offline queue removed from app. Replaced by OfflineBlockedModal + useNetworkGuard (BUG-044). Keep file for reference only — do not import in new code.")
// @goodPractice("FIFO order execution on flush — maintains operation causality")
// @goodPractice("Max 3 retries per operation, then logs error and moves on — prevents head-of-line blocking")
// @learn-error id=OFFLINE-001
//   input='Queue.execute() throws on first failed operation, blocking all subsequent operations'
//   expected='skip failed operations after max retries, continue with remaining queue'
//   actual='head-of-line blocking: one failing operation prevented all others from executing'
//   fix='catch per-operation errors, log and continue'
//   category=pwa

/**
 * Generate a UUID v4 using the Web Crypto API.
 */
function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for testing environments without crypto.randomUUID
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export interface QueuedOperation {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: string;
    entityId?: string;
    data: Record<string, unknown>;
    timestamp: number;
    retries: number;
    maxRetries: number;
}

export type QueueExecutor = (op: QueuedOperation) => Promise<void>;

type QueueChangeListener = (count: number) => void;

const QUEUE_KEY = 'opl-offline-queue';

export class OfflineQueue {
    private queue: QueuedOperation[] = [];
    private flushing = false;
    private executor: QueueExecutor | null = null;
    private listeners: Set<QueueChangeListener> = new Set();
    private onlineHandler: (() => void) | null = null;
    private storageHandler: ((e: StorageEvent) => void) | null = null;

    constructor() {
        this.load();
    }

    // --- Public API ---

    get count(): number {
        return this.queue.length;
    }

    get operations(): QueuedOperation[] {
        return [...this.queue];
    }

    get isFlushing(): boolean {
        return this.flushing;
    }

    /** Register a callback to be called when the queue count changes */
    onChange(listener: QueueChangeListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Enqueue an operation. Persists to localStorage immediately.
     * Entity operations are inserted at the end (FIFO).
     */
    async enqueue(op: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): Promise<void> {
        const entry: QueuedOperation = {
            ...op,
            id: generateId(),
            timestamp: Date.now(),
            retries: 0,
            maxRetries: 3,
        };
        this.queue.push(entry);
        await this.persist();
        this.notifyListeners();
    }

    /**
     * Remove a specific operation from the queue (e.g. after successful execution).
     */
    async dequeue(id: string): Promise<void> {
        this.queue = this.queue.filter(op => op.id !== id);
        await this.persist();
        this.notifyListeners();
    }

    /**
     * Clear all pending operations.
     */
    async clear(): Promise<void> {
        this.queue = [];
        await this.persist();
        this.notifyListeners();
    }

    /**
     * Execute all pending operations in FIFO order.
     * Failed operations are retried up to `maxRetries` times, then skipped.
     * Returns `{ executed: number; failed: number }`.
     *
     * @param flushExecutor Optional executor override for testing. Falls back to `this.executor`.
     */
    async flush(flushExecutor?: QueueExecutor): Promise<{ executed: number; failed: number }> {
        const executor = flushExecutor ?? this.executor;
        if (this.flushing || this.queue.length === 0 || !executor) {
            return { executed: 0, failed: 0 };
        }

        this.flushing = true;
        let executed = 0;
        let failed = 0;

        const snapshot = [...this.queue];

        for (const op of snapshot) {
            try {
                await executor(op);
                await this.dequeue(op.id);
                executed++;
            } catch (err) {
                op.retries++;
                if (op.retries >= op.maxRetries) {
                    console.error(`[OfflineQueue] Operation ${op.id} (${op.type} ${op.entityType}) failed after ${op.maxRetries} retries:`, err);
                    await this.dequeue(op.id);
                    failed++;
                } else {
                    // Update retry count in queue
                    const idx = this.queue.findIndex(q => q.id === op.id);
                    if (idx !== -1) {
                        this.queue[idx].retries = op.retries;
                        await this.persist();
                        this.notifyListeners();
                    }
                }
            }
        }

        this.flushing = false;

        // If there are still items and we're online, retry remaining
        if (this.queue.length > 0 && navigator.onLine) {
            setTimeout(() => this.flush(), 1000);
        }

        return { executed, failed };
    }

    /**
     * Start listening for online events. Automatically flushes when online.
     */
    startListening(executor: QueueExecutor): void {
        this.executor = executor;

        this.onlineHandler = () => {
            this.flush();
        };
        window.addEventListener('online', this.onlineHandler);

        // Listen for storage events from other tabs
        this.storageHandler = (e: StorageEvent) => {
            if (e.key === QUEUE_KEY && e.newValue) {
                this.load();
                this.notifyListeners();
            }
        };
        window.addEventListener('storage', this.storageHandler);

        // Auto-flush if we're already online
        if (navigator.onLine && this.queue.length > 0) {
            setTimeout(() => this.flush(), 500);
        }
    }

    /**
     * Stop listening for online events.
     */
    stopListening(): void {
        if (this.onlineHandler) {
            window.removeEventListener('online', this.onlineHandler);
            this.onlineHandler = null;
        }
        if (this.storageHandler) {
            window.removeEventListener('storage', this.storageHandler);
            this.storageHandler = null;
        }
        this.executor = null;
    }

    // --- Private ---

    private async persist(): Promise<void> {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (err) {
            console.error('[OfflineQueue] Failed to persist queue:', err);
        }
    }

    private load(): void {
        try {
            const raw = localStorage.getItem(QUEUE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as QueuedOperation[];
                this.queue = Array.isArray(parsed) ? parsed : [];
            } else {
                this.queue = [];
            }
        } catch (err) {
            console.error('[OfflineQueue] Failed to load queue:', err);
            this.queue = [];
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(fn => fn(this.queue.length));
    }
}
