/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';
import { RateLimiter, sanitizeInput } from './security';

// Rate limiters for different API endpoints
export const apiRateLimiters = {
  default: new RateLimiter(60000, 60),
  auth: new RateLimiter(60000, 10),
  payment: new RateLimiter(60000, 20),
  upload: new RateLimiter(60000, 30),
  enquiry: new RateLimiter(60000, 15),
};

/**
 * API Security Middleware
 */
export async function withSecurity(
  req: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const pathname = req.nextUrl.pathname;
    
    // Determine which rate limiter to use
    let limiter = apiRateLimiters.default;
    if (pathname.includes('/auth')) limiter = apiRateLimiters.auth;
    if (pathname.includes('/payment')) limiter = apiRateLimiters.payment;
    if (pathname.includes('/upload')) limiter = apiRateLimiters.upload;
    if (pathname.includes('/enquiry')) limiter = apiRateLimiters.enquiry;

    const rateLimit = limiter.check(`${ip}:${pathname}`);
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 2. Authentication
    const session = await getServerSession(authConfig);
    
    // Check if route requires authentication
    const requiresAuth = !pathname.includes('/auth') && 
                         !pathname.includes('/webhook') &&
                         !pathname.includes('/public');
    
    if (requiresAuth && !session) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 3. Input Sanitization (for POST/PUT requests)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          const body = await req.json();
          const sanitized = sanitizeRequestBody(body);
          // Clone request with sanitized body
          const newReq = new Request(req.url, {
            method: req.method,
            headers: req.headers,
            body: JSON.stringify(sanitized),
          });
          // Continue with sanitized request
          return handler(newReq as any, session);
        } catch {
          // If body parsing fails, continue with original request
          return handler(req, session);
        }
      }
    }

    // 4. Execute handler
    return handler(req, session);
  } catch (error) {
    console.error('Security middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Sanitize request body recursively
 */
function sanitizeRequestBody(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeRequestBody(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields that shouldn't be sanitized
      if (['password', 'confirmPassword', 'currentPassword'].includes(key)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeRequestBody(value);
      }
    }
    return sanitized;
  }
  return obj;
}