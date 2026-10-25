// @use(kind, limit, contract, scope, compose, goodPractice)
// @kind(util)
// @limit(lines: 50)
// @contract(in: cacheKey + fetcher -> out: { data: T, fromCache: boolean, timestamp: number })
// @scope(shared)
// @compose(db.getCache, db.setCache)
// @goodPractice("Always caches on success, reads cache on error — ensures graceful degradation without extra configuration.")
import { getCache, setCache, type CacheKey } from './db';

interface CachedResult<T> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

/**
 * Wraps any async fetcher with auto-cache-on-success and fallback-to-cache-on-error.
 * - On success: stores result in IndexedDB under `key` and returns fresh data.
 * - On error: reads from IndexedDB cache under `key` and returns stale data if available.
 * - If no cache exists on error, throws the original error.
 */
export async function cachedFetch<T>(
  key: CacheKey,
  fetcher: () => Promise<T>
): Promise<CachedResult<T>> {
  try {
    const data = await fetcher();
    // Cache the successful result (fire and forget)
    await setCache(key, data);
    return { data, fromCache: false, timestamp: Date.now() };
  } catch (err) {
    // Attempt to serve stale cache
    const cached = await getCache<T>(key);
    if (cached) {
      return { data: cached.data, fromCache: true, timestamp: cached.timestamp };
    }
    // No cache available — rethrow
    throw err;
  }
}
