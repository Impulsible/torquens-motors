'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface UsePaginationOptions {
  /** Initial starting page number (Default: 1) */
  initialPage?: number;
  /** Initial items per page limit (Default: 12) */
  initialLimit?: number;
  /** Total count of items across all pages */
  total?: number;
  /** Sync page and limit parameters directly to Next.js URL query string (Default: true) */
  syncWithUrl?: boolean;
  /** URL Query parameter key for page (Default: 'page') */
  pageParamKey?: string;
  /** URL Query parameter key for limit (Default: 'limit') */
  limitParamKey?: string;
  /** Smooth scroll back to top of viewport/grid on page change (Default: true) */
  scrollToTop?: boolean;
}

export interface UsePaginationReturn {
  /** Current active page number (1-indexed) */
  page: number;
  /** Current limit per page */
  limit: number;
  /** Calculated total number of pages */
  totalPages: number;
  /** Total count of items across all pages */
  totalItems: number;
  /** Zero-indexed offset for DB queries `(page - 1) * limit` */
  offset: number;
  /** Starting item number for display copy (e.g. 13) */
  fromItem: number;
  /** Ending item number for display copy (e.g. 24) */
  toItem: number;
  /** True if a subsequent page exists */
  hasNextPage: boolean;
  /** True if a previous page exists */
  hasPrevPage: boolean;
  /** True if currently on page 1 */
  isFirstPage: boolean;
  /** True if currently on the final page */
  isLastPage: boolean;
  /** Programmatically navigate to a specific page number */
  goToPage: (page: number) => void;
  /** Navigate to the next page */
  nextPage: () => void;
  /** Navigate to the previous page */
  prevPage: () => void;
  /** Update items per page limit */
  setItemsPerPage: (newLimit: number) => void;
  /** Array of page numbers and ellipses for rendering UI controls */
  pageRange: (number | 'ellipsis')[];
}

export function usePagination({
  initialPage = 1,
  initialLimit = 12,
  total = 0,
  syncWithUrl = true,
  pageParamKey = 'page',
  limitParamKey = 'limit',
  scrollToTop = true,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse starting parameters from URL if syncWithUrl is enabled
  const urlPage = useMemo(() => {
    if (!syncWithUrl) return null;
    const p = searchParams.get(pageParamKey);
    const parsed = p ? parseInt(p, 10) : NaN;
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams, pageParamKey, syncWithUrl]);

  const urlLimit = useMemo(() => {
    if (!syncWithUrl) return null;
    const l = searchParams.get(limitParamKey);
    const parsed = l ? parseInt(l, 10) : NaN;
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams, limitParamKey, syncWithUrl]);

  // Internal state initialization
  const [page, setPageState] = useState<number>(urlPage || initialPage);
  const [limit, setLimitState] = useState<number>(urlLimit || initialLimit);

  // Sync internal state if URL search parameters change externally
  useEffect(() => {
    if (syncWithUrl) {
      if (urlPage !== null && urlPage !== page) {
        setPageState(urlPage);
      }
      if (urlLimit !== null && urlLimit !== limit) {
        setLimitState(urlLimit);
      }
    }
  }, [urlPage, urlLimit, syncWithUrl, page, limit]);

  // Safe Math Computations
  const totalItems = Math.max(0, total);
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / limit));
  }, [totalItems, limit]);

  // Ensure active page is kept within safe boundaries
  const safePage = useMemo(() => {
    return Math.max(1, Math.min(page, totalPages));
  }, [page, totalPages]);

  // Database Offset and Range Display Computations
  const offset = (safePage - 1) * limit;
  const fromItem = totalItems === 0 ? 0 : offset + 1;
  const toItem = Math.min(offset + limit, totalItems);

  // Helper to push updated params to Next.js router
  const updateUrlParams = useCallback(
    (newPage: number, newLimit: number) => {
      if (!syncWithUrl) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set(pageParamKey, newPage.toString());
      params.set(limitParamKey, newLimit.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, pageParamKey, limitParamKey, syncWithUrl]
  );

  // Page Navigation Handlers
  const goToPage = useCallback(
    (targetPage: number) => {
      const validatedPage = Math.max(1, Math.min(targetPage, totalPages));
      setPageState(validatedPage);
      updateUrlParams(validatedPage, limit);

      if (scrollToTop && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [totalPages, limit, updateUrlParams, scrollToTop]
  );

  const nextPage = useCallback(() => {
    if (safePage < totalPages) {
      goToPage(safePage + 1);
    }
  }, [safePage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (safePage > 1) {
      goToPage(safePage - 1);
    }
  }, [safePage, goToPage]);

  const setItemsPerPage = useCallback(
    (newLimit: number) => {
      const validLimit = Math.max(1, newLimit);
      setLimitState(validLimit);
      setPageState(1);
      updateUrlParams(1, validLimit);
    },
    [updateUrlParams]
  );

  // Truncated Page Number Array Generator for UI Components
  const pageRange = useMemo<(number | 'ellipsis')[]>(() => {
    const delta = 1; // Number of pages to display on either side of active page
    const range: number[] = [];
    const rangeWithEllipsis: (number | 'ellipsis')[] = [];

    for (
      let i = Math.max(2, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) {
      range.push(i);
    }

    if (safePage - delta > 2) {
      rangeWithEllipsis.push(1, 'ellipsis');
    } else {
      rangeWithEllipsis.push(1);
    }

    rangeWithEllipsis.push(...range);

    if (safePage + delta < totalPages - 1) {
      rangeWithEllipsis.push('ellipsis', totalPages);
    } else if (totalPages > 1) {
      rangeWithEllipsis.push(totalPages);
    }

    return rangeWithEllipsis;
  }, [safePage, totalPages]);

  return {
    page: safePage,
    limit,
    totalPages,
    totalItems,
    offset,
    fromItem,
    toItem,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    isFirstPage: safePage === 1,
    isLastPage: safePage === totalPages || totalPages === 0,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    pageRange,
  };
}

export default usePagination;