'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Gauge,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Trash2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Radio,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PerformanceMonitor } from '@/lib/performance-monitoring';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface MetricStats {
  avg: number;
  max: number;
  min: number;
  count: number;
  p95?: number;
  last?: number;
}

type HealthLevel = 'excellent' | 'good' | 'degraded' | 'critical' | 'unknown';

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getHealth(avgMs: number): HealthLevel {
  if (avgMs < 50) return 'excellent';
  if (avgMs < 150) return 'good';
  if (avgMs < 400) return 'degraded';
  return 'critical';
}

function healthColor(level: HealthLevel) {
  switch (level) {
    case 'excellent':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/30',
        bar: 'bg-emerald-400',
        label: 'Excellent',
      };
    case 'good':
      return {
        text: 'text-gold',
        bg: 'bg-gold/10',
        border: 'border-gold/30',
        bar: 'bg-gold',
        label: 'Good',
      };
    case 'degraded':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/30',
        bar: 'bg-amber-400',
        label: 'Degraded',
      };
    case 'critical':
      return {
        text: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/30',
        bar: 'bg-red-400',
        label: 'Critical',
      };
    default:
      return {
        text: 'text-muted',
        bg: 'bg-muted/10',
        border: 'border-border/50',
        bar: 'bg-muted',
        label: 'Unknown',
      };
  }
}

function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function latencyBarWidth(value: number, max: number): string {
  if (max <= 0) return '0%';
  return `${Math.min(100, Math.max(4, (value / max) * 100))}%`;
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [summary, setSummary] = useState<Record<string, MetricStats>>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const monitor = PerformanceMonitor.getInstance();

  const pullMetrics = useCallback(() => {
    setRefreshing(true);
    try {
      const data = monitor.getSummary() as Record<string, MetricStats>;
      setSummary(data || {});
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[PerformancePage] Failed to read metrics:', err);
    } finally {
      // Brief spinner so the action feels intentional
      setTimeout(() => setRefreshing(false), 280);
    }
  }, [monitor]);

  useEffect(() => {
    pullMetrics();
  }, [pullMetrics]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(pullMetrics, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, pullMetrics]);

  const handleClearMetrics = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    monitor.clearMetrics();
    setSummary({});
    setConfirmClear(false);
    setLastRefresh(new Date());
  };

  const entries = useMemo(
    () =>
      Object.entries(summary).sort(([, a], [, b]) => (b?.avg || 0) - (a?.avg || 0)),
    [summary]
  );

  const globalStats = useMemo(() => {
    if (entries.length === 0) {
      return { avg: 0, max: 0, totalSamples: 0, health: 'unknown' as HealthLevel };
    }
    const totalSamples = entries.reduce((s, [, m]) => s + (m.count || 0), 0);
    const weightedAvg =
      totalSamples > 0
        ? entries.reduce((s, [, m]) => s + m.avg * m.count, 0) / totalSamples
        : 0;
    const max = Math.max(...entries.map(([, m]) => m.max || 0));
    return {
      avg: weightedAvg,
      max,
      totalSamples,
      health: getHealth(weightedAvg),
    };
  }, [entries]);

  const globalHealth = healthColor(globalStats.health);
  const peakAcross = Math.max(...entries.map(([, m]) => m.max || 0), 1);

  return (
    <div className="space-y-8">
      {/* ────────────────────────────────────────────────── */}
      {/* HEADER                                             */}
      {/* ────────────────────────────────────────────────── */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                  <Activity className="h-3 w-3" />
                  System Telemetry
                </span>
              </Badge>
              {autoRefresh && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-light text-primary tracking-tight">
              Performance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-secondary font-sans max-w-xl leading-relaxed">
              Real-time instrumentation across client routes, API handlers, and render
              pipelines. Metrics refresh automatically while this view is open.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh((v) => !v)}
              className="text-[10px] uppercase tracking-widest"
            >
              <Radio
                className={cn(
                  'h-3.5 w-3.5 mr-1.5',
                  autoRefresh ? 'text-emerald-400' : 'text-muted'
                )}
              />
              {autoRefresh ? 'Auto On' : 'Auto Off'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={pullMetrics}
              disabled={refreshing}
              className="text-[10px] uppercase tracking-widest"
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearMetrics}
              className={cn(
                'text-[10px] uppercase tracking-widest',
                confirmClear && 'border-red-500/40 text-red-400 hover:border-red-500/70'
              )}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {confirmClear ? 'Confirm Clear' : 'Clear Metrics'}
            </Button>
          </div>
        </div>

        {lastRefresh && (
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
            <Clock className="h-3 w-3" />
            Last pull · {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────── */}
      {/* GLOBAL HEALTH STRIP                                */}
      {/* ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-graphite/70 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              System Health
            </span>
            <div
              className={cn(
                'h-8 w-8 rounded-lg border flex items-center justify-center',
                globalHealth.bg,
                globalHealth.border,
                globalHealth.text
              )}
            >
              {globalStats.health === 'critical' || globalStats.health === 'degraded' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className={cn('font-serif text-2xl font-light', globalHealth.text)}>
            {entries.length === 0 ? '—' : globalHealth.label}
          </div>
          <p className="text-[11px] text-muted font-sans">Weighted across all probes</p>
        </Card>

        <Card className="p-5 bg-graphite/70 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Weighted Avg
            </span>
            <div className="h-8 w-8 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
              <Gauge className="h-4 w-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-light text-primary tabular-nums">
            {entries.length === 0 ? '—' : formatMs(globalStats.avg)}
          </div>
          <p className="text-[11px] text-muted font-sans">Mean latency · all samples</p>
        </Card>

        <Card className="p-5 bg-graphite/70 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Peak Latency
            </span>
            <div className="h-8 w-8 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-light text-gold tabular-nums">
            {entries.length === 0 ? '—' : formatMs(globalStats.max)}
          </div>
          <p className="text-[11px] text-muted font-sans">Highest observed spike</p>
        </Card>

        <Card className="p-5 bg-graphite/70 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Sample Count
            </span>
            <div className="h-8 w-8 rounded-lg bg-obsidian border border-gold/30 flex items-center justify-center text-gold">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-light text-primary tabular-nums">
            {globalStats.totalSamples.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted font-sans">
            Across {entries.length} instrument{entries.length === 1 ? '' : 's'}
          </p>
        </Card>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* METRIC CARDS                                       */}
      {/* ────────────────────────────────────────────────── */}
      {entries.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              <h2 className="text-lg font-serif font-light text-primary tracking-tight">
                Instrumented Probes
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Sorted by avg latency · desc
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map(([name, stats]) => {
              const health = getHealth(stats.avg);
              const colors = healthColor(health);
              const range = Math.max(stats.max - stats.min, 0.001);

              return (
                <Card
                  key={name}
                  className={cn(
                    'p-5 bg-graphite/80 border-border/70 hover:border-gold/30 transition-all duration-300 flex flex-col justify-between space-y-4 group'
                  )}
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-serif text-primary group-hover:text-gold transition-colors truncate">
                        {formatName(name)}
                      </h3>
                      <p className="text-[10px] font-mono text-muted truncate">{name}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest',
                        colors.bg,
                        colors.border,
                        colors.text
                      )}
                    >
                      {colors.label}
                    </span>
                  </div>

                  {/* Primary metric */}
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                        Average
                      </div>
                      <div className={cn('font-serif text-3xl font-light tabular-nums', colors.text)}>
                        {formatMs(stats.avg)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                        Samples
                      </div>
                      <div className="font-serif text-xl font-light text-primary tabular-nums">
                        {stats.count.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Visual range bar */}
                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-obsidian overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                        style={{ width: latencyBarWidth(stats.avg, peakAcross) }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                      <span className="inline-flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {formatMs(stats.min)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        Δ {formatMs(range)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {formatMs(stats.max)}
                      </span>
                    </div>
                  </div>

                  {/* Detail grid */}
                  <div className="pt-3 border-t border-border/30 grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                        Min
                      </div>
                      <div className="text-xs font-mono text-secondary tabular-nums">
                        {formatMs(stats.min)}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                        Max
                      </div>
                      <div className="text-xs font-mono text-secondary tabular-nums">
                        {formatMs(stats.max)}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                        {stats.p95 != null ? 'P95' : 'Last'}
                      </div>
                      <div className="text-xs font-mono text-secondary tabular-nums">
                        {stats.p95 != null
                          ? formatMs(stats.p95)
                          : stats.last != null
                            ? formatMs(stats.last)
                            : '—'}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ) : (
        /* ────────────────────────────────────────────────── */
        /* EMPTY STATE                                        */
        /* ────────────────────────────────────────────────── */
        <Card className="py-16 px-6 text-center bg-graphite/50 border-border/60 max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto text-gold">
            <Timer className="h-7 w-7 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif font-light text-primary">
              No Telemetry Collected
            </h2>
            <p className="text-xs text-secondary font-sans max-w-sm mx-auto leading-relaxed">
              Performance probes have not recorded any samples yet. Navigate the application,
              hit API routes, or trigger instrumented workflows to populate this dashboard.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={pullMetrics}
              className="text-[10px] uppercase tracking-widest font-mono"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Check Again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(true)}
              className="text-[10px] uppercase tracking-widest font-mono"
            >
              <Radio className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              Enable Live Mode
            </Button>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────────── */}
      {/* FOOTER LEGEND                                      */}
      {/* ────────────────────────────────────────────────── */}
      <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            &lt;50ms Excellent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold" />
            &lt;150ms Good
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            &lt;400ms Degraded
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            ≥400ms Critical
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-gold" />
          TORQUENS Telemetry · v4.2
        </span>
      </div>
    </div>
  );
}