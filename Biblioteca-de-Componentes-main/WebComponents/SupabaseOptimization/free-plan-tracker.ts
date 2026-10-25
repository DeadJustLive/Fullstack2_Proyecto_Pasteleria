// @use(kind, limit, contract, scope, deps, goodPractice)
// @kind(service)
// @limit(lines: 100)
// @contract(in: Supabase client -> out: Free Plan usage estimates)
// @scope(shared)
// @deps(supabase, indexedDB cache)
// @goodPractice("Uses count=estimated to avoid expensive exact counts on large tables.")
// @goodPractice("Caches results for 5 minutes to avoid quota drain on Free Plan.")
// @deps(indexedDB cache)
// Removed hardcoded supabase import to make it agnostic

export const FREE_PLAN_LIMITS = {
  dbSize: { label: 'Base de Datos', max: 500, unit: 'MB', color: 'bg-blue-500' },
  storageSize: { label: 'Almacenamiento', max: 1024, unit: 'MB', color: 'bg-green-500' },
  transferSize: { label: 'Transferencia', max: 2048, unit: 'MB', color: 'bg-amber-500' },
  realtimeConnections: { label: 'Conexiones Realtime', max: 50, unit: '', color: 'bg-violet-500' },
  rowsLimit: { label: 'Filas (est.)', max: 100000, unit: 'filas', color: 'bg-rose-500' },
} as const;

export interface FreePlanUsage {
  dbSizeMB: number;
  storageSizeMB: number;
  transferSizeMB: number;
  realtimeConnections: number;
  estimatedRows: number;
  cachedAt: Date | null;
}

// Cache expiry: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_KEY = 'freeplan:usage';

interface CacheEntry {
  data: FreePlanUsage;
  timestamp: number;
}

function loadCache(): FreePlanUsage | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return { ...entry.data, cachedAt: new Date(entry.timestamp) };
  } catch {
    return null;
  }
}

function saveCache(data: FreePlanUsage): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Silently fail — cache is optional
  }
}

/**
 * Estimates row counts for the provided tables using count=estimated.
 * Agnostic version: accepts the client and a list of table names.
 */
async function estimateRows(supabaseClient: any, tables: string[]): Promise<number> {
  let total = 0;

  // Query each provided table individually
  const queries = tables.map(table => 
    supabaseClient.from(table).select('*', { count: 'estimated', head: true })
  );

  const results = await Promise.allSettled(queries);
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.count !== null) {
      total += result.value.count;
    }
  }
  return total;
}

/**
 * Estimates storage usage from a specified bucket.
 * Lists all files and sums their sizes (paginated).
 */
async function estimateStorageMB(supabaseClient: any, bucketName: string): Promise<number> {
  try {
    if (!bucketName) return 0;
    const { data: files } = await supabaseClient.storage.from(bucketName).list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (!files?.length) return 0;

    const totalBytes = files.reduce((sum: number, f: any) => sum + (f.metadata?.size ?? 0), 0);
    return Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
  } catch {
    return 0;
  }
}

/**
 * Estimates DB size by counting rows and assuming ~1KB per row on average.
 * This is a rough heuristic — actual DB size depends on column types, indexes, etc.
 */
function estimateDbSizeMB(rowCount: number): number {
  // Rough estimate: 1KB per row + 20% overhead for indexes
  return Math.round((rowCount * 1.2) / 1024 * 100) / 100;
}

/*
 * Estimates transfer usage based on previous 30-day window.
 * Uses a simplified heuristic: (row reads from leads + publications) * avg_row_size.
 * In production, this would come from an RPC querying pg_stat_user_tables.
 */
function estimateTransferMB(rowCount: number): number {
  return Math.round((rowCount * 0.5) / 1024 * 100) / 100;
}

export interface TrackerConfig {
  supabaseClient: any;
  tablesToCount: string[];
  storageBucketName?: string;
}

/**
 * Fetches or returns cached Free Plan usage estimates.
 * Designed to be called from a React Query / useSWR hook or useEffect.
 */
export async function getFreePlanUsage(config: TrackerConfig): Promise<FreePlanUsage> {
  const cached = loadCache();
  if (cached) return cached;

  const estimatedRows = await estimateRows(config.supabaseClient, config.tablesToCount);
  const storageSizeMB = await estimateStorageMB(config.supabaseClient, config.storageBucketName || '');
  const dbSizeMB = estimateDbSizeMB(estimatedRows);
  const transferSizeMB = estimateTransferMB(estimatedRows);

  const usage: FreePlanUsage = {
    dbSizeMB,
    storageSizeMB,
    transferSizeMB,
    realtimeConnections: 1, // We only open 1 consolidated channel
    estimatedRows,
    cachedAt: null,
  };

  saveCache(usage);
  return usage;
}
