/* eslint-disable @typescript-eslint/no-explicit-any */
// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Currency formatter
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Status badges
export const STATUS_VARIANTS = {
  DRAFT: 'secondary',
  PENDING_REVIEW: 'warning',
  APPROVED: 'info',
  PUBLISHED: 'success',
  SOLD: 'danger',
  ARCHIVED: 'muted',
} as const;

export const VERIFICATION_VARIANTS = {
  UNVERIFIED: 'secondary',
  PENDING: 'warning',
  VERIFIED: 'success',
  REJECTED: 'danger',
} as const;

// Truncate text
export function truncateText(text: string, length: number = 120): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Debounce function for search
export function debounce<T extends (...args: any[]) => any>(
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