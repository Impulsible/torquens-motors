/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Check if the route is protected
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/dealer') || 
                           path.startsWith('/admin');

  if (isProtectedRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (path.startsWith('/dealer') && !['DEALER', 'ADMIN'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dealer/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};