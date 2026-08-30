import { NextRequest, NextResponse } from 'next/server';
import { searchTORQUENSIntelligence } from '@/services/vehicle.service';
import { SearchAnalyticsService } from '@/services/search-analytics.service';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Execute search
  const result = await searchTORQUENSIntelligence(query, {
    page,
    limit: 12,
  });

  const executionTimeMs = Date.now() - startTime;

  // Track asynchronously (Non-blocking)
  if (query.trim()) {
    const sessionId =
      req.cookies.get('torquens_session')?.value || 'anonymous-session';
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || undefined;

    // Fire and forget - don't await
    SearchAnalyticsService.trackSearch({
      query,
      resultsCount: result.pagination.total,
      sessionId,
      ipAddress,
      userAgent,
      executionTimeMs,
    });
  }

  return NextResponse.json(result);
}