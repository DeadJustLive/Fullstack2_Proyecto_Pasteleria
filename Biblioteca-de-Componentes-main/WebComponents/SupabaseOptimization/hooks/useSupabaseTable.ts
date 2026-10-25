// @use(kind, limit, contract, scope, goodPractice, badPractice, learn-error)
// @kind(hook)
// @limit(lines: 135, reason: "refactor pendiente: extraer lógica de Realtime a hook separado. El archivo mezcla fetching con suscripciones Realtime.")
// @contract(in: tableName + options -> out: { data, loading, error, refresh, insert, update, remove } @error: PostgrestError)
// @scope(shared)
// @limit("rows: default 50 — FREE PLAN: Always pass limit explicitly to avoid unbounded row reads (50k row read limit)")
// @limit("realtime: false by default — EACH Realtime channel counts toward Free Plan limit of 2 concurrent connections")
// @learn-error id=SUPABASE-001 input='useSupabaseTable(table, { realtime: true }) on Dashboard + ConversationsPage simultaneously' expected='1-2 Realtime connections' actual='4+ concurrent channels' fix='Consolidate Realtime channels into a single channel with multiple filters. Remove Realtime from ConversationsPage.' category=supabase-free-plan
// @learn-error id=SUPABASE-005 input='select(*) in useSupabaseTable' expected='select specific columns only' actual='select(*) reads all columns, wasting bandwidth on Free Plan' fix='Add column selection support to options' category=supabase-free-plan
// @learn-error id=SUPABASE-006 input='useSupabaseTable with no limit' expected='paginated reads' actual='reads ALL rows every time, exhausting Free Plan row limit (50k rows)' fix='Set default limit=50 and add pagination support' category=supabase-free-plan
import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { UseSupabaseTableOptions, UseSupabaseTableReturn, SupabaseQuery } from './useSupabaseTable.types';

/**
 * Generic hook for Supabase table CRUD + optional Realtime.
 *
 * @example
 * const { data, loading, insert } = useSupabaseTable<Lead>('leads', {
 *   realtime: true,
 *   limit: 50,
 *   adaptToFrontend: adaptLeadToFrontend,
 *   adaptToBackend: adaptLeadToBackend,
 * });
 */
export function useSupabaseTable<T extends { id?: string }>(
    tableName: string,
    options: UseSupabaseTableOptions<T> = {}
): UseSupabaseTableReturn<T> {
    const {
        orderBy = 'created_at',
        ascending = false,
        realtime = false,
        limit = 50, // @limit: Default 50 for Free Plan safety. Prevents accidental unbounded reads.
        columns = '*',
        offset,
        // @see BUG-006: Generic hook requires escape hatch — default adapters pass through
        adaptToFrontend = (row: unknown) => row as T,
        adaptToBackend = (item: Partial<T>) => item as unknown as Record<string, unknown>,
        supabaseClient, // <-- Agnostic Supabase Client
    } = options;

    if (!supabaseClient) {
        throw new Error("useSupabaseTable requiere supabaseClient en sus opciones.");
    }

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const limitVal = limit === -1 ? undefined : limit; // -1 = no limit (use with caution)
            // @see BUG-006, SUPABASE-004: Generic hook for dynamic tables — full typing not possible
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const qb: any = supabaseClient.from(tableName as unknown as never);
            let query = qb.select(columns)
                .order(orderBy, { ascending });
            if (limitVal) query = query.limit(limitVal);
            if (offset) query = query.range(offset, offset + (limitVal || 50) - 1);

            const { data: rows, error: fetchError } = await (query as Promise<{ data: unknown[] | null; error: Error | null }>);

            if (fetchError) throw fetchError;
            setData((rows || []).map(adaptToFrontend));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`useSupabaseTable(${tableName}) fetch error:`, message);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [tableName, orderBy, ascending, limit, columns, offset]);

    // @goodPractice("Cleanup function properly removes Realtime channel subscription to prevent memory/connection leaks on Free Plan")
    useEffect(() => {
        fetchData();

        if (realtime) {
            channelRef.current = supabaseClient
                .channel(`realtime-${tableName}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => { fetchData(); })
                .subscribe();
        }

        return () => {
            if (channelRef.current) {
                supabaseClient.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [fetchData, realtime, tableName]);

    // @learn-error id=SUPABASE-004 input='as any casts in useSupabaseTable' expected='type-safe Supabase queries' actual='any casts bypass type checking' fix='Use generated Database types and proper generic constraints' category=typescript
    const insert = useCallback(async (item: Partial<T>): Promise<T> => {
        const payload = adaptToBackend(item);
        const qb = supabaseClient.from(tableName as unknown as never) as unknown as SupabaseQuery;
        const { data: row, error: insertError } = await qb
            .insert(payload)
            .select()
            .single();

        if (insertError) throw insertError;
        const adapted = adaptToFrontend(row);
        if (!realtime) setData(prev => [adapted, ...prev]);
        return adapted;
    }, [tableName, realtime, adaptToFrontend, adaptToBackend]);

    const isSameId = (item: T, id: string): boolean => (item as Record<string, unknown>).id === id;

    const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
        const payload = adaptToBackend(item);
        const qb = supabaseClient.from(tableName as unknown as never) as unknown as SupabaseQuery;
        const { data: row, error: updateError } = await qb
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;
        const adapted = adaptToFrontend(row);
        if (!realtime) setData(prev => prev.map(d => isSameId(d, id) ? adapted : d));
        return adapted;
    }, [tableName, realtime, adaptToFrontend, adaptToBackend]);

    const remove = useCallback(async (id: string): Promise<void> => {
        const qb = supabaseClient.from(tableName as unknown as never) as unknown as SupabaseQuery;
        const { error: deleteError } = await qb
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        if (!realtime) setData(prev => prev.filter(d => !isSameId(d, id)));
    }, [tableName, realtime]);

    return { data, loading, error, refresh: fetchData, insert, update, remove };
}
