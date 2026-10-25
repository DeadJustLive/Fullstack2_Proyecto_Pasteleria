// @use(kind, limit, contract, scope, goodPractice, learn-error, badPractice)
// @kind(service)
// @limit(lines: 120)
// @contract(in: Error | string + optional context -> out: void (queued in localStorage, PII sanitized before storage))
// @scope(shared)
// @goodPractice("Daily batch: all errors queued in localStorage, flushed once per day as single INSERT. Max 30 rows/month regardless of error volume.")
// @goodPractice("PII sanitization: error messages and context objects are scrubbed before storage (BUG-036). Emails, phones, names, RUT, tokens are masked.")
// @badPractice("URL sanitization is best-effort (removes query params). Full URL redaction would break debugging. Consider URL param allowlist if needed.")
// @learn-error id=SUPABASE-008 input='errorLogger.capture() called on every runtime error' expected='batch daily upload (1 INSERT/day)' actual='every JS error becomes a Supabase INSERT, consuming Free Plan row limit (50k rows)' fix='Queue errors in localStorage, flush once per day as a single batch INSERT. Max 30 rows/month vs thousands.' category=supabase-free-plan
import { supabase } from './supabase';
import type { KnownTable } from '../types/supabase-extensions';
import { sanitizeForLogs, sanitizeMessage } from './pii';

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// Local type for error_log_batches table (not yet in generated Supabase types)
// @see BUG-006: Uses typed table name widen + final cast instead of `as any`
interface ErrorLogBatchInsert {
    date: string;
    errors_batch: unknown[];
    count: number;
}

interface StoredError {
    message: string;
    stack?: string;
    error_info?: Record<string, unknown>;
    url?: string;
    user_agent?: string;
    severity?: ErrorSeverity;
    timestamp: string;
}

interface DailyBatch { date: string; errors: StoredError[] }

const QUEUE_KEY = 'error_log_daily_batch';

const todayStr = () => new Date().toISOString().split('T')[0];

function getBatch(): DailyBatch | null {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || 'null'); }
    catch { return null; }
}

function saveBatch(batch: DailyBatch): void {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(batch)); }
    catch { /* quota exceeded — discard silently */ }
}

async function flushDailyBatch(): Promise<void> {
    const batch = getBatch();
    if (!batch || batch.errors.length === 0 || batch.date === todayStr()) return;
    try {
        // Table error_log_batches not yet in generated supabase types.
        // @see BUG-006: Use KnownTable widen + final cast instead of `as any`
        const insert: ErrorLogBatchInsert = {
            date: batch.date,
            errors_batch: batch.errors,
            count: batch.errors.length,
        };
        const { error } = await (supabase.from('error_log_batches' as KnownTable) as unknown as { insert: (data: unknown) => Promise<{ error: Error | null }> }).insert(insert);
        if (error) throw error;
        localStorage.removeItem(QUEUE_KEY);
    } catch { /* stays in localStorage, retries next launch */ }
}

function queueError(entry: StoredError): void {
    const batch = getBatch();
    const today = todayStr();
    if (!batch || batch.date !== today) {
        if (batch) flushDailyBatch();
        saveBatch({ date: today, errors: [entry] });
    } else {
        batch.errors.push(entry);
        saveBatch(batch);
        if (batch.errors.length > 1000) {
            batch.errors = batch.errors.slice(-500);
            saveBatch(batch);
        }
    }
}

export const errorLogger = {
    capture(error: Error | string, context?: Record<string, unknown>): Promise<void> {
        const msg = typeof error === 'string' ? error : error.message || String(error);

        // Strip query params from URL to avoid leaking PII in URL parameters
        const url = typeof window !== 'undefined'
            ? window.location.origin + window.location.pathname
            : '';

        queueError({
            message: sanitizeMessage(msg).slice(0, 2000),
            stack: typeof error === 'object' ? (error as Error).stack?.slice(0, 10000) : undefined,
            error_info: context ? sanitizeForLogs({ ...context }) : undefined,
            url,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString(),
        });
        return Promise.resolve();
    },

    async wrap<T>(fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
        try { return await fn(); }
        catch (error) {
            await this.capture(error instanceof Error ? error : new Error(String(error)), context);
            throw error;
        }
    },

    init() {
        if (typeof window === 'undefined') return;
        flushDailyBatch();
        const oldHandler = window.onerror;
        window.onerror = (_event, _source, _lineno, _colno, error) => {
            if (error) this.capture(error, { type: 'window.onerror' });
            if (typeof oldHandler === 'function') oldHandler(_event, _source, _lineno, _colno, error);
        };
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
            this.capture(error, { type: 'unhandledrejection' });
        });
        window.addEventListener('online', () => flushDailyBatch());
        setInterval(() => flushDailyBatch(), 3600000);
    },
};
