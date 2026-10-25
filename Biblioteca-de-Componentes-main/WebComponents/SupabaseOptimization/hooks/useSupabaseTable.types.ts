// @use(kind, contract, scope, goodPractice)
// @kind(type)
// @contract(in: Supabase table configuration -> out: typed interfaces for useSupabaseTable hook)
// @scope(shared)
// @goodPractice("Extracted from useSupabaseTable.ts to reduce hook file size while keeping types co-located.")

/** Options for the useSupabaseTable hook */
export interface UseSupabaseTableOptions<T> {
    /** Supabase client instance (Agnostic injection) */
    supabaseClient?: any;
    /** Column to order by. Default: 'created_at' */
    orderBy?: string;
    /** Ascending order? Default: false (newest first) */
    ascending?: boolean;
    /** Enable Postgres Realtime subscription? Default: false. FREE PLAN: limit to 2 concurrent channels total */
    realtime?: boolean;
    /** Limit the number of rows returned. Default: 50 (Free Plan safety). Pass -1 for no limit. */
    limit?: number;
    /** Columns to select. Default: '*' — FREE PLAN: Specify only needed columns to reduce bandwidth */
    columns?: string;
    /** Offset for pagination */
    offset?: number;
    /** Transform row from DB shape to frontend shape */
    adaptToFrontend?: (row: any) => T;
    /** Transform item from frontend shape to DB shape */
    adaptToBackend?: (item: Partial<T>) => Record<string, unknown>;
}

/** Return type for the useSupabaseTable hook */
export interface UseSupabaseTableReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    insert: (item: Partial<T>) => Promise<T>;
    update: (id: string, item: Partial<T>) => Promise<T>;
    remove: (id: string) => Promise<void>;
}

/**
 * Minimal typed interface for Supabase query builder operations.
 * Used to avoid `as any` in the generic hook by casting through `unknown`.
 * @see BUG-006 — Generic hook cannot be fully typed with generated Database types.
 */
export interface SupabaseQuery {
    select: (columns: string) => {
        order: (col: string, opts: { ascending: boolean }) => unknown;
    };
    insert: (p: Record<string, unknown>) => { select: () => { single: () => Promise<{ data: unknown; error: Error | null }> } };
    update: (p: Record<string, unknown>) => { eq: (col: string, val: string) => { select: () => { single: () => Promise<{ data: unknown; error: Error | null }> } } };
    delete: () => { eq: (col: string, val: string) => Promise<{ error: Error | null }> };
}
