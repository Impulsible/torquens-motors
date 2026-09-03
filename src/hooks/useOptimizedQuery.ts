/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { CacheService } from '@/services/cache.service';
import { fetcher, swrConfig } from '@/lib/query-optimization';

const cacheService = CacheService.getInstance();

interface UseOptimizedQueryOptions {
  ttl?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useOptimizedQuery<T = any>(
  key: string | null,
  fetcherFn: () => Promise<T>,
  options: UseOptimizedQueryOptions = {}
) {
  const { ttl = 300000, enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check cache first
  const fetchData = useCallback(async () => {
    if (!key || !enabled) return;

    // Check cache
    const cached = cacheService.get<T>(key);
    if (cached !== null) {
      setData(cached);
      onSuccess?.(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherFn();
      cacheService.set(key, result, ttl);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcherFn, ttl, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    if (key) {
      cacheService.delete(key);
      fetchData();
    }
  }, [key, fetchData]);

  return { data, loading, error, refetch };
}

/**
 * SWR-based query hook with caching
 */
export function useSWRQuery<T = any>(
  key: string | null,
  url: string | null,
  options: any = {}
) {
  const { data, error, mutate } = useSWR<T>(
    key && url ? `${key}:${url}` : null,
    () => (url ? fetcher<T>(url) : Promise.reject()),
    {
      ...swrConfig,
      ...options,
    }
  );

  return {
    data,
    isLoading: !error && !data,
    error,
    mutate,
    refetch: () => mutate(),
  };
}