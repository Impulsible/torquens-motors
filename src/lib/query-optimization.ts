// SWR Configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 60000, // 1 minute
  dedupingInterval: 5000, // 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

/**
 * SWR fetcher with caching
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch data');
  }

  return response.json();
}

/**
 * SWR fetcher with caching for MongoDB
 */
export async function dbFetcher<T>(
  collection: string,
  query: Record<string, unknown> = {}
): Promise<T> {
  const url = `/api/data?collection=${collection}&query=${encodeURIComponent(
    JSON.stringify(query)
  )}`;
  return fetcher<T>(url);
}

/**
 * React Query configuration
 */
export const reactQueryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes (cacheTime is now gcTime in v5)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}