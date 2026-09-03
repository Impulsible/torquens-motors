import { useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`[Performance] ${operation} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);

    // Keep only last 100 metrics
    const metrics = this.metrics.get(name);
    if (metrics && metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  /**
   * Get max duration for an operation
   */
  getMaxDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return Math.max(...metrics);
  }

  /**
   * Get min duration for an operation
   */
  getMinDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return Math.min(...metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Get all metrics summary
   */
  getSummary(): Record<string, { avg: number; max: number; min: number; count: number }> {
    const summary: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics) {
      summary[name] = {
        avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
        max: Math.max(...metrics),
        min: Math.min(...metrics),
        count: metrics.length,
      };
    }
    
    return summary;
  }
}

// Performance monitoring hook for components
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const endTimer = monitor.startTimer(`component:${componentName}:render`);
    
    // Track component mount time
    const mountStart = performance.now();
    
    return () => {
      const mountDuration = performance.now() - mountStart;
      monitor.recordMetric(`component:${componentName}:mount`, mountDuration);
      endTimer();
    };
  }, [componentName, monitor]);
}

// Monitor API calls
export function monitorApiCall(apiName: string, fn: () => Promise<any>): Promise<any> {
  const monitor = PerformanceMonitor.getInstance();
  const endTimer = monitor.startTimer(`api:${apiName}`);
  
  return fn()
    .finally(endTimer)
    .catch((error) => {
      monitor.recordMetric(`api:${apiName}:error`, 1);
      throw error;
    });
}