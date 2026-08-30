/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage, FilterQuery, Types } from 'mongoose';
import { SearchLog, ISearchLog } from '@/models/SearchLog';
import {
  aggregate,
  deleteMany,
  create,
} from './database';

// -----------------------------------------------------------------------------
// TYPES & INTERFACES
// -----------------------------------------------------------------------------

export interface TrackSearchInput {
  query: string;
  resultsCount: number;
  filters?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  executionTimeMs?: number;
}

export interface PopularSearchQuery {
  query: string;
  count: number;
  avgResultsCount: number;
  lastSearchedAt: Date;
}

export interface ZeroResultSearchQuery {
  query: string;
  searchCount: number;
  lastSearchedAt: Date;
}

export interface SearchTrendPoint {
  date: string;
  totalSearches: number;
  zeroResultSearches: number;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  uniqueSessions: number;
  zeroResultRatePercentage: number;
  avgExecutionTimeMs: number;
  topQueries: PopularSearchQuery[];
  unmetDemandQueries: ZeroResultSearchQuery[];
}

export interface AggregateTimeframeOptions {
  days?: number;
  limit?: number;
}

// -----------------------------------------------------------------------------
// SEARCH ANALYTICS SERVICE
// -----------------------------------------------------------------------------

export class SearchAnalyticsService {
  /**
   * Tracks a search event asynchronously without blocking the user's search request.
   */
  static async trackSearch(input: TrackSearchInput): Promise<void> {
    const trimmedQuery = input.query.trim();
    if (!trimmedQuery) return;

    // Asynchronous non-blocking write
    setImmediate(async () => {
      try {
        const logData: Partial<ISearchLog> = {
          query: trimmedQuery,
          normalizedQuery: trimmedQuery.toLowerCase(),
          resultsCount: Math.max(0, input.resultsCount),
          filters: input.filters || {},
          sessionId: input.sessionId || 'anonymous-session',
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          executionTimeMs: input.executionTimeMs || 0,
        };

        if (input.userId && Types.ObjectId.isValid(input.userId)) {
          logData.userId = new Types.ObjectId(input.userId) as any;
        }

        await create(SearchLog, logData);
      } catch (error) {
        // Silently log analytics failure so user search response is never impacted
        console.error('Failed to log search analytics:', error);
      }
    });
  }

  /**
   * Retrieves top search terms aggregated by frequency over a specified timeframe.
   */
  static async getPopularSearches({
    days = 30,
    limit = 10,
  }: AggregateTimeframeOptions = {}): Promise<PopularSearchQuery[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: cutoffDate },
          normalizedQuery: { $ne: '' },
        },
      },
      {
        $group: {
          _id: '$normalizedQuery',
          originalQuery: { $first: '$query' },
          count: { $sum: 1 },
          avgResultsCount: { $avg: '$resultsCount' },
          lastSearchedAt: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          query: '$originalQuery',
          count: 1,
          avgResultsCount: { $round: ['$avgResultsCount', 1] },
          lastSearchedAt: 1,
        },
      },
    ];

    return aggregate<PopularSearchQuery>(SearchLog as any, pipeline);
  }

  /**
   * Identifies "Unmet Inventory Demand" — queries that returned 0 results.
   * Essential for dealer acquisition strategies and inventory planning.
   */
  static async getZeroResultSearches({
    days = 30,
    limit = 10,
  }: AggregateTimeframeOptions = {}): Promise<ZeroResultSearchQuery[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: cutoffDate },
          resultsCount: 0,
          normalizedQuery: { $ne: '' },
        },
      },
      {
        $group: {
          _id: '$normalizedQuery',
          originalQuery: { $first: '$query' },
          searchCount: { $sum: 1 },
          lastSearchedAt: { $max: '$createdAt' },
        },
      },
      { $sort: { searchCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          query: '$originalQuery',
          searchCount: 1,
          lastSearchedAt: 1,
        },
      },
    ];

    return aggregate<ZeroResultSearchQuery>(SearchLog as any, pipeline);
  }

  /**
   * Generates time-series daily trend data for admin analytics charts.
   */
  static async getSearchTrends(days = 14): Promise<SearchTrendPoint[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: cutoffDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalSearches: { $sum: 1 },
          zeroResultSearches: {
            $sum: { $cond: [{ $eq: ['$resultsCount', 0] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalSearches: 1,
          zeroResultSearches: 1,
        },
      },
    ];

    return aggregate<SearchTrendPoint>(SearchLog as any, pipeline);
  }

  /**
   * Gets recent unique search queries for a specific user or session (for UI auto-suggest).
   */
  static async getUserRecentSearches(
    sessionId: string,
    userId?: string,
    limit = 5
  ): Promise<string[]> {
    const query: FilterQuery<ISearchLog> = {
      $or: [{ sessionId }],
    };

    if (userId && Types.ObjectId.isValid(userId)) {
      query.$or!.push({ userId: new Types.ObjectId(userId) as any });
    }

    const pipeline: PipelineStage[] = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$normalizedQuery',
          originalQuery: { $first: '$query' },
          lastSearchedAt: { $first: '$createdAt' },
        },
      },
      { $sort: { lastSearchedAt: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          query: '$originalQuery',
        },
      },
    ];

    const results = await aggregate<{ query: string }>(
      SearchLog as any,
      pipeline
    );
    return results.map((r: { query: string }) => r.query);
  }

  /**
   * Generates a high-level executive dashboard summary of marketplace search health.
   */
  static async getAnalyticsSummary(
    timeframeDays = 30
  ): Promise<SearchAnalyticsSummary> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    const [summaryAggregation, topQueries, unmetDemandQueries] =
      await Promise.all([
        aggregate<{
          totalSearches: number;
          zeroResultCount: number;
          uniqueSessions: number;
          avgExecutionTimeMs: number;
        }>(SearchLog as any, [
          { $match: { createdAt: { $gte: cutoffDate } } },
          {
            $group: {
              _id: null,
              totalSearches: { $sum: 1 },
              zeroResultCount: {
                $sum: { $cond: [{ $eq: ['$resultsCount', 0] }, 1, 0] },
              },
              uniqueSessionsSet: { $addToSet: '$sessionId' },
              avgExecutionTimeMs: { $avg: '$executionTimeMs' },
            },
          },
          {
            $project: {
              _id: 0,
              totalSearches: 1,
              zeroResultCount: 1,
              uniqueSessions: { $size: '$uniqueSessionsSet' },
              avgExecutionTimeMs: { $round: ['$avgExecutionTimeMs', 1] },
            },
          },
        ]),
        this.getPopularSearches({ days: timeframeDays, limit: 5 }),
        this.getZeroResultSearches({ days: timeframeDays, limit: 5 }),
      ]);

    const stats = summaryAggregation[0] || {
      totalSearches: 0,
      zeroResultCount: 0,
      uniqueSessions: 0,
      avgExecutionTimeMs: 0,
    };

    const zeroResultRatePercentage =
      stats.totalSearches > 0
        ? Number(((stats.zeroResultCount / stats.totalSearches) * 100).toFixed(1))
        : 0;

    return {
      totalSearches: stats.totalSearches,
      uniqueSessions: stats.uniqueSessions,
      zeroResultRatePercentage,
      avgExecutionTimeMs: stats.avgExecutionTimeMs || 0,
      topQueries,
      unmetDemandQueries,
    };
  }

  /**
   * Clears search logs for a given session or user (privacy/GDPR compliance).
   */
  static async clearUserHistory(
    sessionId: string,
    userId?: string
  ): Promise<void> {
    const query: FilterQuery<ISearchLog> = {
      $or: [{ sessionId }],
    };

    if (userId && Types.ObjectId.isValid(userId)) {
      query.$or!.push({ userId: new Types.ObjectId(userId) as any });
    }

    await deleteMany(SearchLog, query);
  }
}

export default SearchAnalyticsService;