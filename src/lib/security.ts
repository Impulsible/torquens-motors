import validator from 'validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod';

// ✅ Remove unused import

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return validator.escape(input.trim());
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  return validator.isMobilePhone(phone);
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  return validator.isURL(url);
}

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private requests: Map<string, { count: number; resetTime: number }>;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  check(key: string): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, resetTime: now + this.windowMs };
    }

    if (now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, resetTime: now + this.windowMs };
    }

    if (record.count < this.maxRequests) {
      record.count++;
      return { allowed: true, resetTime: record.resetTime };
    }

    return { allowed: false, resetTime: record.resetTime };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  clear(): void {
    this.requests.clear();
  }
}